const axios = require("axios");
const cheerio = require("cheerio");
const { LeetCode } = require("leetcode-query");
const leetcode = new LeetCode();

function extractUsernameFromUrl(platform, url) {
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname.replace(/\/+$/, "");
    return pathname.split("/").filter(Boolean).pop();
  } catch {
    return null;
  }
}

async function fetchLeetCodeStats(username) {
  if (!username) return null;
  try {
    const userData = await leetcode.user(username);
    if (!userData || !userData.matchedUser) return null;

    const acStats = userData.matchedUser.submitStats.acSubmissionNum || [];
    const getCount = (difficulty) =>
      acStats.find((item) => item.difficulty === difficulty)?.count || 0;

    const baseContest = userData.matchedUser.contestRating || {};

    const graphqlQuery = `
      query userContestRankingInfo($username: String!) {
        userContestRanking(username: $username) {
          attendedContestsCount
          rating
          globalRanking
          totalParticipants
          topPercentage
        }
      }
    `;

    const graphqlResponse = await axios.post(
      "https://leetcode.com/graphql",
      {
        query: graphqlQuery,
        variables: { username },
      },
      {
        headers: { "Content-Type": "application/json" },
      }
    );

    const advancedContest =
      graphqlResponse?.data?.data?.userContestRanking || {};

    const summary = {
      totalSolved: getCount("All"),
      easy: getCount("Easy"),
      medium: getCount("Medium"),
      hard: getCount("Hard"),
      ranking: userData.matchedUser.profile?.ranking || 0,
      contestRating: advancedContest.rating || baseContest.rating || 0,
      updatedAt: new Date(),
    };

    const moreInfo = {
      globalRanking:
        advancedContest.globalRanking || baseContest.globalRanking || 0,
      totalContests:
        advancedContest.attendedContestsCount ||
        baseContest.attendedContestsCount ||
        0,
      totalParticipants: advancedContest.totalParticipants || 0,
      topPercentage: advancedContest.topPercentage || null,
    };

    const profileUrl = `https://leetcode.com/${username}/`;

    return { summary, moreInfo, profileUrl };
  } catch (e) {
    console.error("LeetCode fetch error:", e.message);
    return null;
  }
}

async function fetchCodeforcesStats(username) {
  if (!username) return null;
  try {
    const res = await axios.get(
      `https://codeforces.com/api/user.info?handles=${username}`
    );
    if (res.data.status === "OK") {
      const user = res.data.result[0];

      const summary = {
        currentRating: user.rating || 0,
        maxRating: user.maxRating || 0,
        rank: user.rank || "",
        totalSolved: 0, // API doesn't provide this
        updatedAt: new Date(),
      };

      const moreInfo = {
        friendOfCount: user.friendOfCount || 0,
        lastOnlineTimeSeconds: user.lastOnlineTimeSeconds || 0,
      };

      const profileUrl = `https://codeforces.com/profile/${username}`;
      return { summary, moreInfo, profileUrl };
    }
    return null;
  } catch (e) {
    console.error("Codeforces fetch error:", e.message);
    return null;
  }
}

async function fetchCodechefStats(username) {
  if (!username) return null;
  try {
    const res = await axios.get(`https://www.codechef.com/users/${username}`);
    const $ = cheerio.load(res.data);

    const summary = {
      currentRating: parseInt($(".rating-number").first().text()) || 0,
      stars: $(".rating-star").text().length || 0,
      maxRating:
        parseInt($(".rating-header small").text().match(/\d+/)?.[0]) || 0,
      globalRank:
        parseInt(
          $(".rating-ranks ul li:nth-child(1) strong").text().replace("#", "")
        ) || 0,
      countryRank:
        parseInt(
          $(".rating-ranks ul li:nth-child(2) strong").text().replace("#", "")
        ) || 0,
      updatedAt: new Date(),
    };

    const moreInfo = {};
    const profileUrl = `https://www.codechef.com/users/${username}`;

    return { summary, moreInfo, profileUrl };
  } catch (e) {
    console.error("CodeChef fetch error:", e.message);
    return null;
  }
}

async function fetchAtCoderStats(username) {
  if (!username) return null;
  try {
    const res = await axios.get(`https://atcoder.jp/users/${username}`);
    const $ = cheerio.load(res.data);

    const summary = {
      rating: parseInt($('th:contains("Rating")').next().text()) || 0,
      rank: $('th:contains("Rank")').next().text().trim() || "",
      performance: parseInt($('th:contains("Performance")').next().text()) || 0,
      updatedAt: new Date(),
    };

    const moreInfo = {};
    const profileUrl = `https://atcoder.jp/users/${username}`;

    return { summary, moreInfo, profileUrl };
  } catch (e) {
    console.error("AtCoder fetch error:", e.message);
    return null;
  }
}

async function fetchSpojStats(username) {
  if (!username) return null;
  try {
    const res = await axios.get(`https://www.spoj.com/users/${username}`);
    const $ = cheerio.load(res.data);

    const totalSolved =
      parseInt(
        $(".user-profile-left table tr:nth-child(3) td")
          .text()
          .match(/\d+/)?.[0]
      ) || 0;
    const rankMatch = $('h3:contains("Rank")')
      .text()
      .match(/Rank\s*:\s*(\d+)/);
    const rank = rankMatch ? parseInt(rankMatch[1]) : 0;

    const summary = {
      totalSolved,
      rank,
      updatedAt: new Date(),
    };

    const moreInfo = {};
    const profileUrl = `https://www.spoj.com/users/${username}`;

    return { summary, moreInfo, profileUrl };
  } catch (e) {
    console.error("SPOJ fetch error:", e.message);
    return null;
  }
}

async function fetchAllCompetitiveStats(competitiveProfiles) {
  const platforms = ["leetcode", "codeforces", "codechef", "atcoder", "spoj"];
  const stats = {};

  for (const platform of platforms) {
    const url = competitiveProfiles[platform];
    if (!url) {
      stats[platform] = {
        summary: getDefaultStats(platform),
        moreInfo: {},
        profileUrl: "",
      };
      continue;
    }

    const username = extractUsernameFromUrl(platform, url);
    if (!username) {
      stats[platform] = {
        summary: getDefaultStats(platform),
        moreInfo: {},
        profileUrl: "",
      };
      continue;
    }

    try {
      switch (platform) {
        case "leetcode":
          stats.leetcode = (await fetchLeetCodeStats(username)) || {
            summary: getDefaultStats("leetcode"),
            moreInfo: {},
            profileUrl: "",
          };
          break;
        case "codeforces":
          stats.codeforces = (await fetchCodeforcesStats(username)) || {
            summary: getDefaultStats("codeforces"),
            moreInfo: {},
            profileUrl: "",
          };
          break;
        case "codechef":
          stats.codechef = (await fetchCodechefStats(username)) || {
            summary: getDefaultStats("codechef"),
            moreInfo: {},
            profileUrl: "",
          };
          break;
        case "atcoder":
          stats.atcoder = (await fetchAtCoderStats(username)) || {
            summary: getDefaultStats("atcoder"),
            moreInfo: {},
            profileUrl: "",
          };
          break;
        case "spoj":
          stats.spoj = (await fetchSpojStats(username)) || {
            summary: getDefaultStats("spoj"),
            moreInfo: {},
            profileUrl: "",
          };
          break;
      }
    } catch (e) {
      console.error(
        `fetchAllCompetitiveStats error for ${platform}:`,
        e.message
      );
      stats[platform] = {
        summary: getDefaultStats(platform),
        moreInfo: {},
        profileUrl: "",
      };
    }
  }

  return stats;
}

function getDefaultStats(platform) {
  const defaults = {
    leetcode: {
      totalSolved: 0,
      easy: 0,
      medium: 0,
      hard: 0,
      ranking: 0,
      contestRating: 0,
      globalRanking: 0,
      totalContests: 0,
      updatedAt: null,
    },
    codeforces: {
      currentRating: 0,
      maxRating: 0,
      rank: "",
      totalSolved: 0,
      updatedAt: null,
    },
    codechef: {
      currentRating: 0,
      maxRating: 0,
      stars: 0,
      globalRank: 0,
      countryRank: 0,
      updatedAt: null,
    },
    atcoder: {
      rating: 0,
      rank: "",
      performance: 0,
      updatedAt: null,
    },
    spoj: {
      totalSolved: 0,
      rank: 0,
      updatedAt: null,
    },
  };
  return defaults[platform] || {};
}

module.exports = {
  extractUsernameFromUrl,
  fetchLeetCodeStats,
  fetchCodeforcesStats,
  fetchCodechefStats,
  fetchAtCoderStats,
  fetchSpojStats,
  fetchAllCompetitiveStats,
  getDefaultStats,
};
