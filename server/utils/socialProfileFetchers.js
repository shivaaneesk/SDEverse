const axios = require("axios");
const cheerio = require("cheerio");

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

// GitHub
async function fetchGitHubStats(username) {
  try {
    const userRes = await axios.get(`https://api.github.com/users/${username}`);
    const reposRes = await axios.get(`https://api.github.com/users/${username}/repos?per_page=100`);

    const totalStars = reposRes.data.reduce((acc, repo) => acc + (repo.stargazers_count || 0), 0);
    const totalForks = reposRes.data.reduce((acc, repo) => acc + (repo.forks_count || 0), 0);

    const moreInfo = {
      publicRepos: userRes.data.public_repos || 0,
      followers: userRes.data.followers || 0,
      following: userRes.data.following || 0,
      totalStars,
      totalForks,
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

// LinkedIn
async function fetchLinkedInStats(username) {
  try {
    const response = await axios.get(`https://www.linkedin.com/in/${username}`);
    const $ = cheerio.load(response.data);

    const connectionsText = $('span.t-bold').first().text();
    const connections = connectionsText ? parseInt(connectionsText.replace(/[^\d]/g, "")) : null;

    const moreInfo = {
      connections,
      profileViews: null,
      updatedAt: new Date(),
    };

    return {
      summary: connections ? `${connections} connections` : "No visible stats",
      moreInfo,
      profileUrl: `https://www.linkedin.com/in/${username}`,
    };
  } catch (err) {
    console.error("LinkedIn fetch error:", err.message);
    return {
      summary: "LinkedIn stats unavailable",
      moreInfo: {
        connections: null,
        profileViews: null,
        updatedAt: new Date(),
      },
      profileUrl: `https://www.linkedin.com/in/${username}`,
    };
  }
}

// Twitter
async function fetchTwitterStats(username) {
  try {
    const response = await axios.get(`https://twitter.com/${username}`);
    const $ = cheerio.load(response.data);

    const followers = parseCount($('a[href$="/followers"] > span > span').text());
    const following = parseCount($('a[href$="/following"] > span > span').text());
    const tweets = parseCount($('a[href$="/with_replies"] > span > span').text());
    const likes = parseCount($('a[href$="/likes"] > span > span').text());

    const moreInfo = {
      followers,
      following,
      tweets,
      likes,
      updatedAt: new Date(),
    };

    return {
      summary: `${followers ?? "?"} followers • ${tweets ?? "?"} tweets`,
      moreInfo,
      profileUrl: `https://twitter.com/${username}`,
    };
  } catch (err) {
    console.error("Twitter fetch error:", err.message);
    return {
      summary: "Twitter stats unavailable",
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
}

// Facebook
async function fetchFacebookStats(username) {
  try {
    const response = await axios.get(`https://www.facebook.com/${username}`);
    const $ = cheerio.load(response.data);

    const moreInfo = {
      friendsCount: null,
      followers: null,
      updatedAt: new Date(),
    };

    return {
      summary: "Facebook stats not available",
      moreInfo,
      profileUrl: `https://www.facebook.com/${username}`,
    };
  } catch (err) {
    console.error("Facebook fetch error:", err.message);
    return {
      summary: "Facebook stats unavailable",
      moreInfo: {
        friendsCount: null,
        followers: null,
        updatedAt: new Date(),
      },
      profileUrl: `https://www.facebook.com/${username}`,
    };
  }
}

// Instagram
async function fetchInstagramStats(username) {
  try {
    const response = await axios.get(`https://www.instagram.com/${username}/`);
    const $ = cheerio.load(response.data);

    const script = $('script[type="text/javascript"]').filter((i, el) => {
      return $(el).html().includes("window._sharedData");
    }).html();

    if (!script) throw new Error("Instagram data not found");

    const jsonText = script.match(/window\._sharedData = (.+);/)[1];
    const data = JSON.parse(jsonText);
    const user = data.entry_data.ProfilePage[0].graphql.user;

    const moreInfo = {
      followers: user.edge_followed_by.count || 0,
      following: user.edge_follow.count || 0,
      posts: user.edge_owner_to_timeline_media.count || 0,
      updatedAt: new Date(),
    };

    return {
      summary: `${moreInfo.followers} followers • ${moreInfo.posts} posts`,
      moreInfo,
      profileUrl: `https://www.instagram.com/${username}/`,
    };
  } catch (err) {
    console.error("Instagram fetch error:", err.message);
    return {
      summary: "Instagram stats unavailable",
      moreInfo: {
        followers: null,
        following: null,
        posts: null,
        updatedAt: new Date(),
      },
      profileUrl: `https://www.instagram.com/${username}/`,
    };
  }
}

// Utility to parse numbers like 1.2K, 3.4M, etc.
function parseCount(text) {
  if (!text) return null;
  text = text.trim().toUpperCase();

  let multiplier = 1;
  if (text.endsWith("K")) multiplier = 1_000;
  else if (text.endsWith("M")) multiplier = 1_000_000;
  else if (text.endsWith("B")) multiplier = 1_000_000_000;

  const number = parseFloat(text);
  if (isNaN(number)) return null;

  return Math.round(number * multiplier);
}

module.exports = {
  extractSocialUsernameFromUrl,
  fetchSocialStats,
  fetchGitHubStats,
  fetchLinkedInStats,
  fetchTwitterStats,
  fetchFacebookStats,
  fetchInstagramStats,
};
