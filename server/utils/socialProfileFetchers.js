const axios = require("axios");
const cheerio = require("cheerio");

// === Extract username from URL ===
function extractSocialUsernameFromUrl(platform, url) {
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname.replace(/\/+$/, "");
    const parts = pathname.split("/").filter(Boolean);

    switch (platform) {
      case "github":
      case "linkedin":
      case "twitter":
      case "facebook":
      case "instagram":
        return parts[0] || null;
      default:
        return null;
    }
  } catch (err) {
    console.error(`Invalid URL for ${platform}:`, url);
    return null;
  }
}

// === Main dispatcher ===
async function fetchSocialStats(platform, username) {
  switch (platform) {
    case "github":
      return await fetchGitHubStats(username);
    case "linkedin":
      return await fetchLinkedInStats(username);
    case "twitter":
      return await fetchTwitterStats(username);
    case "facebook":
      return await fetchFacebookStats(username);
    case "instagram":
      return await fetchInstagramStats(username);
    default:
      throw new Error("Unsupported social platform");
  }
}

// === GitHub: public API fetch ===
async function fetchGitHubStats(username) {
  try {
    const [userRes, reposRes, eventsRes, orgsRes, starredRes] = await Promise.all([
      axios.get(`https://api.github.com/users/${username}`),
      axios.get(`https://api.github.com/users/${username}/repos?per_page=100&sort=updated`),
      axios.get(`https://api.github.com/users/${username}/events/public?per_page=300`),
      axios.get(`https://api.github.com/users/${username}/orgs`),
      axios.get(`https://api.github.com/users/${username}/starred?per_page=100`)
    ]);

    // Basic stats
    const publicRepos = userRes.data.public_repos || 0;
    const followers = userRes.data.followers || 0;
    const following = userRes.data.following || 0;
    
    // Repository analysis
    const now = new Date();
    const sixMonthsAgo = new Date(now.setMonth(now.getMonth() - 6));
    const oneYearAgo = new Date(now.setFullYear(now.getFullYear() - 1));
    
    const repoStats = reposRes.data.reduce((stats, repo) => {
      // Basic counts
      stats.totalStars += repo.stargazers_count || 0;
      stats.totalForks += repo.forks_count || 0;
      stats.totalWatchers += repo.watchers_count || 0;
      stats.totalSize += repo.size || 0;
      
      // Activity analysis
      const lastUpdated = new Date(repo.pushed_at);
      const isActive = lastUpdated > sixMonthsAgo;
      const isStale = lastUpdated < oneYearAgo;
      
      if (isActive) stats.activeRepos++;
      if (isStale) stats.staleRepos++;
      
      // Most significant repos
      if (repo.stargazers_count > (stats.mostStarred?.stars || 0)) {
        stats.mostStarred = {
          name: repo.name,
          stars: repo.stargazers_count,
          url: repo.html_url,
          updatedAt: repo.pushed_at
        };
      }
      
      if (repo.forks_count > (stats.mostForked?.forks || 0)) {
        stats.mostForked = {
          name: repo.name,
          forks: repo.forks_count,
          url: repo.html_url
        };
      }
      
      // Language analysis
      if (repo.language) {
        stats.languages[repo.language] = (stats.languages[repo.language] || 0) + 1;
        stats.languageBytes[repo.language] = (stats.languageBytes[repo.language] || 0) + (repo.size || 0);
      }
      
      return stats;
    }, {
      totalStars: 0,
      totalForks: 0,
      totalWatchers: 0,
      totalSize: 0,
      activeRepos: 0,
      staleRepos: 0,
      mostStarred: null,
      mostForked: null,
      languages: {},
      languageBytes: {}
    });

    // Contribution heatmap (last year)
    const heatmap = {};
    const contributionTypes = {};
    let externalContributions = 0;
    const userRepos = reposRes.data.map(r => r.id);
    
    eventsRes.data.forEach(event => {
      const date = new Date(event.created_at).toISOString().split('T')[0];
      
      // Count contribution types
      contributionTypes[event.type] = (contributionTypes[event.type] || 0) + 1;
      
      // Track external contributions
      if (event.repo && !userRepos.includes(event.repo.id)) {
        externalContributions++;
      }
      
      // Build heatmap
      heatmap[date] = (heatmap[date] || 0) + 1;
    });

    // Top languages by usage
    const topLanguages = Object.entries(repoStats.languages)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([lang, count]) => ({
        language: lang,
        repos: count,
        bytes: repoStats.languageBytes[lang] || 0
      }));

    // Account metadata
    const accountCreated = new Date(userRes.data.created_at);
    const accountAgeYears = ((new Date() - accountCreated) / (1000 * 60 * 60 * 24 * 365)).toFixed(1);
    
    // Organization involvement
    const organizations = orgsRes.data.map(org => ({
      name: org.login,
      avatar: org.avatar_url,
      url: org.url
    }));

    // Starred repositories analysis
    const starredLanguages = {};
    starredRes.data.forEach(repo => {
      if (repo.language) {
        starredLanguages[repo.language] = (starredLanguages[repo.language] || 0) + 1;
      }
    });
    
    const topStarredLanguages = Object.entries(starredLanguages)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([lang]) => lang);

    // Compose enhanced summary
    const summary = `${followers} followers • ${publicRepos} repos • ⭐ ${repoStats.totalStars} • ${accountAgeYears} yrs`;

    const moreInfo = {
      // Basic profile info
      publicRepos,
      followers,
      following,
      accountCreated: userRes.data.created_at,
      accountAgeYears,
      profileUrl: `https://github.com/${username}`,
      
      // Repository insights
      repoStats: {
        totalStars: repoStats.totalStars,
        totalForks: repoStats.totalForks,
        totalWatchers: repoStats.totalWatchers,
        activeRepos: repoStats.activeRepos,
        staleRepos: repoStats.staleRepos,
        activeRatio: publicRepos ? (repoStats.activeRepos / publicRepos).toFixed(2) : 0,
        mostStarredRepo: repoStats.mostStarred,
        mostForkedRepo: repoStats.mostForked,
        avgRepoSize: publicRepos ? (repoStats.totalSize / publicRepos).toFixed(0) : 0
      },
      
      // Technical insights
      technicalProfile: {
        topLanguages,
        languageCount: Object.keys(repoStats.languages).length,
        topStarredLanguages
      },
      
      // Activity analysis
      activityAnalysis: {
        heatmap,  // Daily contributions
        contributionTypes,
        lastActive: eventsRes.data[0]?.created_at || null,
        externalContributions,
        externalContributionRatio: eventsRes.data.length 
          ? (externalContributions / eventsRes.data.length).toFixed(2) 
          : 0
      },
      
      // Community involvement
      community: {
        organizations,
        starredRepos: starredRes.data.length,
        topStarredLanguages
      },
      
      updatedAt: new Date()
    };

    return {
      summary,
      moreInfo,
      profileUrl: `https://github.com/${username}`
    };
  } catch (err) {
    console.error("GitHub fetch error:", err.message);
    throw err;
  }
}

// === LinkedIn: no longer reliably scrapable without login and tokens ===
async function fetchLinkedInStats(username) {
  // Return fallback data, scraping LinkedIn publicly doesn’t work well anymore.
  return {
    summary: "LinkedIn stats unavailable (login required)",
    moreInfo: {
      connections: null,
      profileViews: null,
      updatedAt: new Date(),
    },
    profileUrl: `https://www.linkedin.com/in/${username}`,
  };
}

// === Twitter: no public data scraping anymore without auth or headless browser ===
async function fetchTwitterStats(username) {
  return {
    summary: "Twitter stats unavailable (API/token required)",
    moreInfo: {
      followers: null,
      following: null,
      tweets: null,
      likes: null,
      updatedAt: new Date(),
    },
    profileUrl: `https://twitter.com/${username}`,
  };
}

// === Facebook: no public scraping without login ===
async function fetchFacebookStats(username) {
  return {
    summary: "Facebook stats unavailable (login required)",
    moreInfo: {
      friendsCount: null,
      followers: null,
      updatedAt: new Date(),
    },
    profileUrl: `https://www.facebook.com/${username}`,
  };
}

// === Instagram: use Puppeteer to scrape follower count ===
async function fetchInstagramStats(username) {
  const puppeteer = require("puppeteer");
  let browser;
  try {
    browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36"
    );

    await page.goto(`https://www.instagram.com/${username}/`, {
      waitUntil: "networkidle2",
    });

    // Try multiple ways to get user data
    const userData = await page.evaluate(() => {
      // Try sharedData
      if (window._sharedData) {
        try {
          return window._sharedData.entry_data.ProfilePage[0].graphql.user;
        } catch {
          // ignore
        }
      }
      // Try __additionalDataLoaded - another place IG loads profile data dynamically
      if (window.__additionalDataLoaded) {
        try {
          const [, data] = window.__additionalDataLoaded;
          return data.graphql.user;
        } catch {
          // ignore
        }
      }
      // Try JSON-LD script
      const ldJson = document.querySelector('script[type="application/ld+json"]');
      if (ldJson) {
        try {
          const json = JSON.parse(ldJson.textContent);
          return {
            followers: json.mainEntityofPage?.interactionStatistic?.userInteractionCount || null,
            posts: json.mainEntityofPage?.numberOfPosts || null,
          };
        } catch {
          // ignore
        }
      }
      return null;
    });

    if (!userData) throw new Error("Instagram user data not found");

    // Normalize data fields
    const followers = userData.edge_followed_by?.count || userData.followers || 0;
    const posts = userData.edge_owner_to_timeline_media?.count || userData.posts || 0;

    return {
      summary: `${followers} followers • ${posts} posts`,
      moreInfo: { followers, posts, updatedAt: new Date() },
      profileUrl: `https://www.instagram.com/${username}/`,
    };
  } catch (err) {
    console.error("Instagram fetch error:", err.message);
    return {
      summary: "Instagram stats unavailable",
      moreInfo: { followers: null, posts: null, updatedAt: new Date() },
      profileUrl: `https://www.instagram.com/${username}/`,
    };
  } finally {
    if (browser) await browser.close();
  }
}


// === Utility: parse shorthand counts like 1.2K, 3.4M ===
function parseCount(text) {
  if (!text) return null;
  text = text.trim().toUpperCase().replace(/,/g, "");

  let multiplier = 1;
  if (text.endsWith("K")) multiplier = 1_000;
  else if (text.endsWith("M")) multiplier = 1_000_000;
  else if (text.endsWith("B")) multiplier = 1_000_000_000;

  const number = parseFloat(text);
  if (isNaN(number)) return null;

  return Math.round(number * multiplier);
}

// === Export all functions ===
module.exports = {
  extractSocialUsernameFromUrl,
  fetchSocialStats,
  fetchGitHubStats,
  fetchLinkedInStats,
  fetchTwitterStats,
  fetchFacebookStats,
  fetchInstagramStats,
};
