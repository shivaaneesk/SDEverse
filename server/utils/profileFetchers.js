const axios = require("axios");
const cheerio = require("cheerio");
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

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
  if (!username) throw new Error("Username is required");

  const graphqlUrl = "https://leetcode.com/graphql";
  const headers = {
    "Content-Type": "application/json",
    "User-Agent": "Mozilla/5.0",
    Referer: `https://leetcode.com/${username}/`,
  };

  const profileQuery = `
    query getUserProfile($username: String!) {
      matchedUser(username: $username) {
        profile {
          ranking
        }
        submitStats {
          acSubmissionNum {
            difficulty
            count
          }
        }
      }
      allQuestionsCount {
        difficulty
        count
      }
    }
  `;

  const contestQuery = `
    query userContestRankingInfo($username: String!) {
      userContestRanking(username: $username) {
        attendedContestsCount
        rating
        globalRanking
        totalParticipants
        topPercentage
      }
      userContestRankingHistory(username: $username) {
        rating
        contest {
          title
          startTime
        }
      }
    }
  `;

  try {
    const [profileRes, contestRes] = await Promise.all([
      axios.post(
        graphqlUrl,
        {
          query: profileQuery,
          variables: { username },
        },
        { headers }
      ),
      axios.post(
        graphqlUrl,
        {
          query: contestQuery,
          variables: { username },
        },
        { headers }
      ),
    ]);

    const userData = profileRes.data.data;
    const contestData = contestRes.data.data;

    return parseLeetCodeData(userData, contestData, username);
  } catch (err) {
    console.error("Error fetching data:", err?.response?.data || err.message);
    return null;
  }
}

function parseLeetCodeData(userData, contestData, username) {
  const profile = userData?.matchedUser?.profile || {};
  const acSubmission =
    userData?.matchedUser?.submitStats?.acSubmissionNum || [];
  const totalQuestions = userData?.allQuestionsCount || [];

  const getCount = (arr, diff) =>
    arr.find((x) => x.difficulty === diff)?.count || 0;

  const easySolved = getCount(acSubmission, "Easy");
  const mediumSolved = getCount(acSubmission, "Medium");
  const hardSolved = getCount(acSubmission, "Hard");

  const easyTotal = getCount(totalQuestions, "Easy");
  const mediumTotal = getCount(totalQuestions, "Medium");
  const hardTotal = getCount(totalQuestions, "Hard");

  const contest = contestData?.userContestRanking || {};

  // ✅ Filter only public contests
  const actualContests = filterActualContests(
    contestData.userContestRankingHistory || []
  );

  return {
    summary: {
      totalSolved: easySolved + mediumSolved + hardSolved,
      easy: easySolved,
      medium: mediumSolved,
      hard: hardSolved,
      ranking: profile.ranking || 0,
      contestRating: contest.rating || 0,
      globalRanking: contest.globalRanking || 0,
      totalContests: contest.attendedContestsCount || 0,
      updatedAt: new Date().toISOString(),
    },
    moreInfo: {
      totalQuestions: {
        easy: easyTotal,
        medium: mediumTotal,
        hard: hardTotal,
      },
      contestStats: contest,
      contestHistory: actualContests,
      username,
    },
    profileUrl: `https://leetcode.com/${username}/`,
  };
}

function filterActualContests(contests) {
  const seen = new Set();
  return contests.filter((c) => {
    const isValid =
      c.contest &&
      typeof c.contest.title === "string" &&
      typeof c.contest.startTime === "number" &&
      c.rating !== 1500 &&
      !seen.has(c.rating); // avoid repeats from virtuals

    if (isValid) seen.add(c.rating);
    return isValid;
  });
}

async function fetchCodeforcesStats(username) {
  if (!username) return null;

  try {
    // Fetch user info
    const userInfoRes = await axios.get(
      `https://codeforces.com/api/user.info?handles=${username}`
    );
    if (userInfoRes.data.status !== "OK")
      throw new Error("Failed to fetch user info");
    const user = userInfoRes.data.result[0];

    // Fetch user rating changes (contests)
    const ratingRes = await axios.get(
      `https://codeforces.com/api/user.rating?handle=${username}`
    );
    if (ratingRes.data.status !== "OK")
      throw new Error("Failed to fetch rating history");
    const contests = ratingRes.data.result;

    // Fetch submissions to extract solved problems by tags
    const submissionsRes = await axios.get(
      `https://codeforces.com/api/user.status?handle=${username}&from=1&count=10000`
    );
    if (submissionsRes.data.status !== "OK")
      throw new Error("Failed to fetch submissions");
    const submissions = submissionsRes.data.result;

    // Process contests info
    const totalContests = contests.length;
    const lastContest = contests[totalContests - 1];
    const lastContestDate = lastContest
      ? new Date(lastContest.ratingUpdateTimeSeconds * 1000)
      : null;

    // Average rating change
    const avgRatingChange =
      totalContests > 0
        ? contests.reduce((acc, c) => acc + (c.newRating - c.oldRating), 0) /
          totalContests
        : 0;

    // Process submissions to find unique solved problems and count tags
    const solvedProblems = new Map();
    for (const sub of submissions) {
      if (sub.verdict === "OK") {
        const problemId = `${sub.problem.contestId}-${sub.problem.index}`;
        if (!solvedProblems.has(problemId)) {
          solvedProblems.set(problemId, sub.problem);
        }
      }
    }

    const tagCounts = {};
    for (const problem of solvedProblems.values()) {
      for (const tag of problem.tags) {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      }
    }

    // Compose summary
    const summary = {
      currentRating: user.rating || 0,
      maxRating: user.maxRating || 0,
      rank: user.rank || "",
      totalContests,
      lastContestDate,
      avgRatingChange,
      totalSolved: solvedProblems.size,
      updatedAt: new Date(),
    };

    const moreInfo = {
      friendOfCount: user.friendOfCount || 0,
      lastOnlineTimeSeconds: user.lastOnlineTimeSeconds || 0,
      contests, // full contest rating history
      solvedByTags: tagCounts, // solved problems count by tag
    };

    const profileUrl = `https://codeforces.com/profile/${username}`;

    return { summary, moreInfo, profileUrl };
  } catch (e) {
    console.error("Codeforces fetch error:", e.message);
    return null;
  }
}

async function fetchCodechefStats(username) {
  if (!username) return null;

  const profileUrl = `https://www.codechef.com/users/${username}`;

  try {
    const res = await axios.get(profileUrl, {
      headers: { "User-Agent": "Mozilla/5.0" },
    });
    if (res.status !== 200) {
      return {
        summary: defaultSummary(),
        moreInfo: {},
        profileUrl: "",
      };
    }

    const html = res.data;
    const dom = new JSDOM(html);
    const document = dom.window.document;

    // Extract heatmap JSON data from embedded JS
    const heatMapStart =
      html.indexOf("var userDailySubmissionsStats =") +
      "var userDailySubmissionsStats =".length;
    const heatMapEnd = html.indexOf("'#js-heatmap") - 34;
    const heatMapStr = html.substring(heatMapStart, heatMapEnd);
    const heatMap = JSON.parse(heatMapStr);

    // Extract all_rating JSON data from embedded JS
    const ratingStart =
      html.indexOf("var all_rating = ") + "var all_rating = ".length;
    const ratingEnd = html.indexOf("var current_user_rating =") - 6;
    const ratingData = JSON.parse(html.substring(ratingStart, ratingEnd));

    // Institution & Country (some profiles may lack these)
    let institution = null;
    let country = null;
    const detailsLis = document.querySelectorAll(".user-details ul li");
    detailsLis.forEach((li) => {
      const label = li.querySelector("strong")?.textContent.trim();
      const value = li.querySelector("span")?.textContent.trim();
      if (label === "Institution:") institution = value;
      if (label === "Country:") country = value;
    });

    // Build final response

    return {
      summary: {
        currentRating:
          parseInt(document.querySelector(".rating-number")?.textContent) || 0,
        maxRating:
          parseInt(
            document
              .querySelector(".rating-number")
              ?.parentNode?.children[4]?.textContent.split("Rating")[1]
          ) || 0,
        stars:
          document.querySelector(".rating-star")?.textContent.trim().length ||
          0,
        globalRank:
          parseInt(
            document
              .querySelector(".rating-ranks ul li:nth-child(1) strong")
              ?.textContent.replace("#", "")
              .trim()
          ) || 0,
        countryRank:
          parseInt(
            document
              .querySelector(".rating-ranks ul li:nth-child(2) strong")
              ?.textContent.replace("#", "")
              .trim()
          ) || 0,
        updatedAt: new Date(),
      },
      moreInfo: {
        institution,
        country,
        totalContests: ratingData.length,
        recentContests: ratingData.slice(-5).reverse(),
        ratingHistory: ratingData,
        heatMap,
      },
      profileUrl,
    };
  } catch (error) {
    console.error("CodeChef fetch error:", error.message);
    return {
      summary: defaultSummary(),
      moreInfo: {},
      profileUrl: "",
    };
  }
}

function defaultSummary() {
  return {
    currentRating: 0,
    maxRating: 0,
    stars: 0,
    globalRank: 0,
    countryRank: 0,
    updatedAt: null,
  };
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
