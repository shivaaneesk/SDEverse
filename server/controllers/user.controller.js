const asyncHandler = require("express-async-handler");
const User = require("../models/user.model");
const {
  fetchAllCompetitiveStats,
  getDefaultStats,
} = require("../utils/profileFetchers");

const {
  extractSocialUsernameFromUrl,
  fetchSocialStats,
} = require("../utils/socialProfileFetchers");

const updateAllCompetitiveStats = asyncHandler(async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }

    // Fetch all stats (should now return { summary, moreInfo, profileUrl } per platform)
    const allStatsWithExtra = await fetchAllCompetitiveStats(
      user.competitiveProfiles
    );

    // Extract only summaries for DB update
    const platforms = ["leetcode", "codeforces", "codechef", "atcoder", "spoj"];
    const summariesOnly = {};
    for (const platform of platforms) {
      if (
        allStatsWithExtra[platform] &&
        typeof allStatsWithExtra[platform] === "object" &&
        allStatsWithExtra[platform].summary
      ) {
        summariesOnly[platform] = allStatsWithExtra[platform].summary;
      } else {
        summariesOnly[platform] = getDefaultStats(platform);
      }
    }

    // Update user stats in DB with summaries only
    user.competitiveStats = summariesOnly;
    await user.save();

    // Send back both summaries and extra info for frontend usage
    return res.status(200).json({
      message: "Competitive stats update complete",
      competitiveStats: summariesOnly,
      extraStats: allStatsWithExtra, // includes summary, moreInfo, profileUrl for each platform
    });
  } catch (error) {
    console.error("updateAllCompetitiveStats error:", error);
    return res.status(500).json({ error: "Server error" });
  }
});

const updateSocialProfiles = asyncHandler(async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    const socialLinks = user.socialLinks || {};
    const updatedStats = {}; // Start fresh

    const platforms = Object.keys(socialLinks);

    for (const platform of platforms) {
      const url = socialLinks[platform];
      if (!url) continue;

      const username = extractSocialUsernameFromUrl(platform, url);
      if (!username) {
        console.warn(
          `Could not extract username for ${platform} from URL: ${url}`
        );
        updatedStats[platform] = getDefaultStats(platform); // Fallback
        continue;
      }

      try {
        const stats = await fetchSocialStats(platform, username);
        if (stats && stats.moreInfo) {
          const cleanStats = Object.fromEntries(
            Object.entries(stats.moreInfo).filter(
              ([_, v]) => v !== undefined && v !== null && !Number.isNaN(v)
            )
          );

          updatedStats[platform] = {
            ...cleanStats,
            summary: stats.summary || "",
            profileUrl: stats.profileUrl || url,
            updatedAt: new Date(),
          };
        } else {
          updatedStats[platform] = getDefaultStats(platform); // Fallback if no data
        }
      } catch (err) {
        console.error(
          `Error fetching stats for ${platform} (${username}):`,
          err.message
        );
        updatedStats[platform] = getDefaultStats(platform); // Fallback on error
      }
    }

    user.socialStats = updatedStats;
    await user.save();

    return res.status(200).json({
      message: "Social stats updated",
      socialStats: user.socialStats,
    });
  } catch (error) {
    console.error("updateSocialProfiles error:", error);
    return res.status(500).json({ error: "Server error" });
  }
});

const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find().select("-password");
  res.json(users);
});

const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select("-password");
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }
  res.json(user);
});

const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }
  res.json({ message: "User removed" });
});

const updateUserRole = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  const { role } = req.body;
  if (!["user", "admin"].includes(role)) {
    res.status(400);
    throw new Error("Invalid role");
  }

  user.role = role;
  await user.save();

  res.json({ message: `User role updated to ${role}` });
});

// Get current user's profile
const getMyProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select("-password");
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }
  res.json(user);
});

// Update current user's profile
const updateMyProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  // List of fields a user is allowed to update
  const updatableFields = [
    "fullName",
    "avatarUrl",
    "location",
    "website",
    "bio",
    "competitiveProfiles",
    "socialLinks",
  ];

  updatableFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      user[field] = req.body[field];
    }
  });

  await user.save();
  const updatedUser = user.toObject();
  delete updatedUser.password;

  res.json({ message: "Profile updated", user: updatedUser });
});

module.exports = {
  getAllUsers,
  getUserById,
  deleteUser,
  updateUserRole,
  getMyProfile,
  updateMyProfile,
  updateAllCompetitiveStats,
  updateSocialProfiles,
};
