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
    const userRes = await axios.get(`https://api.github.com/users/${username}`);
    const reposRes = await axios.get(
      `https://api.github.com/users/${username}/repos?per_page=100`
    );

    const totalStars = reposRes.data.reduce(
      (acc, repo) => acc + (repo.stargazers_count || 0),
      0
    );

    const moreInfo = {
      publicRepos: userRes.data.public_repos || 0,
      followers: userRes.data.followers || 0,
      following: userRes.data.following || 0,
      totalStars,
      updatedAt: new Date(),
    };

    return {
      summary: `${moreInfo.followers} followers • ${moreInfo.publicRepos} repos • ⭐ ${totalStars}`,
      moreInfo,
      profileUrl: `https://github.com/${username}`,
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
