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

async function fetchFullContributionHeatmap(username, token) {
  const query = `
    query {
      user(login: "${username}") {
        contributionsCollection {
          contributionCalendar {
            weeks {
              contributionDays {
                date
                contributionCount
              }
            }
          }
        }
      }
    }
  `;

  const response = await axios.post(
    "https://api.github.com/graphql",
    { query },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );

  const days =
    response.data.data.user.contributionsCollection.contributionCalendar.weeks
      .flatMap((week) => week.contributionDays)
      .reduce((map, day) => {
        map[day.date] = day.contributionCount;
        return map;
      }, {});

  return days;
}

async function fetchGitHubStats(username) {
  if (!username) return null;
  try {
    const token = process.env.GITHUB_TOKEN;
    const headers = token ? { Authorization: `token ${token}` } : {};

    const now = new Date();
    const sixMonthsAgo = new Date(now);
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const oneYearAgo = new Date(now);
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    const [
      userRes,
      reposRes,
      eventsRes,
      orgsRes,
      starredRes,
      followersRes,
      followingRes,
    ] = await Promise.all([
      axios.get(`https://api.github.com/users/${username}`, { headers }),
      axios.get(
        `https://api.github.com/users/${username}/repos?per_page=100&sort=updated`,
        { headers }
      ),
      axios.get(
        `https://api.github.com/users/${username}/events/public?per_page=300`,
        { headers }
      ),
      axios.get(`https://api.github.com/users/${username}/orgs`, { headers }),
      axios.get(
        `https://api.github.com/users/${username}/starred?per_page=100`,
        { headers }
      ),
      axios.get(
        `https://api.github.com/users/${username}/followers?per_page=100`,
        { headers }
      ),
      axios.get(
        `https://api.github.com/users/${username}/following?per_page=100`,
        { headers }
      ),
    ]);

    const profileData = userRes.data;
    const accountCreated = new Date(profileData.created_at);
    const accountAgeYears = Math.floor(
      (now - accountCreated) / (1000 * 60 * 60 * 24 * 365)
    );

    const followerLocations = {};
    followersRes.data.forEach((follower) => {
      if (follower.location) {
        const location = follower.location.trim();
        followerLocations[location] = (followerLocations[location] || 0) + 1;
      }
    });

    const repoStats = {
      totalStars: 0,
      totalForks: 0,
      totalWatchers: 0,
      totalSize: 0,
      activeRepos: 0,
      staleRepos: 0,
      mostStarred: null,
      mostForked: null,
      languages: {},
      languageBytes: {},
      topics: {},
      licenseUsage: {},
      repoSizeDistribution: { small: 0, medium: 0, large: 0 },
    };

    reposRes.data.forEach((repo) => {
      repoStats.totalStars += repo.stargazers_count || 0;
      repoStats.totalForks += repo.forks_count || 0;
      repoStats.totalWatchers += repo.watchers_count || 0;
      repoStats.totalSize += repo.size || 0;

      const lastUpdated = new Date(repo.pushed_at);
      const isActive = lastUpdated > sixMonthsAgo;
      const isStale = lastUpdated < oneYearAgo;
      if (isActive) repoStats.activeRepos++;
      if (isStale) repoStats.staleRepos++;

      if (
        !repoStats.mostStarred ||
        repo.stargazers_count > repoStats.mostStarred.stars
      ) {
        repoStats.mostStarred = {
          name: repo.name,
          stars: repo.stargazers_count,
          url: repo.html_url,
          updatedAt: repo.pushed_at,
        };
      }

      if (
        !repoStats.mostForked ||
        repo.forks_count > repoStats.mostForked.forks
      ) {
        repoStats.mostForked = {
          name: repo.name,
          forks: repo.forks_count,
          url: repo.html_url,
        };
      }

      if (repo.language) {
        repoStats.languages[repo.language] =
          (repoStats.languages[repo.language] || 0) + 1;
        repoStats.languageBytes[repo.language] =
          (repoStats.languageBytes[repo.language] || 0) + (repo.size || 0);
      }

      if (repo.topics) {
        repo.topics.forEach((topic) => {
          repoStats.topics[topic] = (repoStats.topics[topic] || 0) + 1;
        });
      }

      if (repo.license && repo.license.key) {
        const license = repo.license.key.replace("-", " ").toUpperCase();
        repoStats.licenseUsage[license] =
          (repoStats.licenseUsage[license] || 0) + 1;
      }

      if (repo.size < 1000) repoStats.repoSizeDistribution.small++;
      else if (repo.size < 10000) repoStats.repoSizeDistribution.medium++;
      else repoStats.repoSizeDistribution.large++;
    });

    const contributionStats = {
      heatmap: await fetchFullContributionHeatmap(username, token),
      types: {},
      firstContribution: null,
      lastContribution: null,
      externalRepos: new Set(),
      dailyStreak: 0,
      currentStreak: 0,
    };

    let currentStreak = 0;
    let maxStreak = 0;
    let lastDate = null;

    eventsRes.data.forEach((event) => {
      const date = new Date(event.created_at).toISOString().split("T")[0];
      contributionStats.types[event.type] =
        (contributionStats.types[event.type] || 0) + 1;

      if (event.repo && !reposRes.data.some((r) => r.id === event.repo.id)) {
        contributionStats.externalRepos.add(event.repo.id);
      }

      const eventDate = new Date(event.created_at);
      if (!lastDate || (lastDate && eventDate - lastDate === 86400000)) {
        currentStreak++;
      } else if (lastDate && eventDate - lastDate > 86400000) {
        maxStreak = Math.max(maxStreak, currentStreak);
        currentStreak = 1;
      }
      lastDate = eventDate;
    });

    contributionStats.dailyStreak = Math.max(maxStreak, currentStreak);
    contributionStats.currentStreak = currentStreak;

    if (eventsRes.data.length > 0) {
      contributionStats.firstContribution =
        eventsRes.data[eventsRes.data.length - 1].created_at;
      contributionStats.lastContribution = eventsRes.data[0].created_at;
    }

    const organizationStats = {
      count: orgsRes.data.length,
      details: orgsRes.data.map((org) => ({
        name: org.login,
        avatar: org.avatar_url,
        url: org.html_url,
        description: org.description,
      })),
      memberSince: {},
    };

    const starredStats = {
      total: starredRes.data.length,
      languages: {},
      topics: {},
      mostStarred: null,
    };

    let maxStars = 0;

    starredRes.data.forEach((repo) => {
      if (repo.language) {
        starredStats.languages[repo.language] =
          (starredStats.languages[repo.language] || 0) + 1;
      }

      if (repo.topics) {
        repo.topics.forEach((topic) => {
          starredStats.topics[topic] = (starredStats.topics[topic] || 0) + 1;
        });
      }

      if (repo.stargazers_count > maxStars) {
        maxStars = repo.stargazers_count;
        starredStats.mostStarred = {
          name: repo.full_name,
          stars: repo.stargazers_count,
          url: repo.html_url,
          owner: repo.owner.login,
        };
      }
    });

    const socialGraph = {
      followers: followersRes.data.length,
      following: followingRes.data.length,
      mutualConnections: 0,
      followerDistribution: followerLocations,
      topFollowers: followersRes.data
        .filter((f) => f.followers_url)
        .sort((a, b) => b.followers - a.followers)
        .slice(0, 5)
        .map((f) => ({
          username: f.login,
          avatar: f.avatar_url,
          url: f.html_url,
        })),
    };

    const followerSet = new Set(followersRes.data.map((f) => f.login));
    socialGraph.mutualConnections = followingRes.data.filter((f) =>
      followerSet.has(f.login)
    ).length;

    const moreInfo = {
      profile: {
        publicRepos: profileData.public_repos,
        followers: profileData.followers,
        following: profileData.following,
        accountCreated: profileData.created_at,
        accountAgeYears,
        profileUrl: profileData.html_url,
        avatarUrl: profileData.avatar_url,
        bio: profileData.bio,
        location: profileData.location,
        company: profileData.company,
      },
      repositories: repoStats,
      contributions: contributionStats,
      organizations: organizationStats,
      starredRepos: starredStats,
      socialGraph,
      updatedAt: new Date(),
    };

    const summary = `GitHub: ${profileData.public_repos} repos ⭐ ${repoStats.totalStars} 
    | ${profileData.followers} followers | ${accountAgeYears} years`;

    return {
      summary,
      moreInfo,
      profileUrl: profileData.html_url,
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
      const ldJson = document.querySelector(
        'script[type="application/ld+json"]'
      );
      if (ldJson) {
        try {
          const json = JSON.parse(ldJson.textContent);
          return {
            followers:
              json.mainEntityofPage?.interactionStatistic
                ?.userInteractionCount || null,
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
    const followers =
      userData.edge_followed_by?.count || userData.followers || 0;
    const posts =
      userData.edge_owner_to_timeline_media?.count || userData.posts || 0;

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
