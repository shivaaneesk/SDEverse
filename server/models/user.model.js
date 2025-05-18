const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true },
    bio: { type: String, trim: true, default: "" },

    fullName: { type: String, trim: true },
    avatarUrl: { type: String, trim: true },
    location: { type: String, trim: true },
    website: { type: String, trim: true },

    // Store profile URLs
    competitiveProfiles: {
      leetcode: { type: String, trim: true },
      codeforces: { type: String, trim: true },
      codechef: { type: String, trim: true },
      atcoder: { type: String, trim: true },
      spoj: { type: String, trim: true },
    },

    // Store competitive stats summary (cached, updated from APIs)
    competitiveStats: {
      codeforces: {
        currentRating: { type: Number, default: 0 },
        maxRating: { type: Number, default: 0 },
        rank: { type: String, default: "" },
        totalSolved: { type: Number, default: 0 },
        updatedAt: { type: Date, default: null },
      },
      leetcode: {
        totalSolved: { type: Number, default: 0 },
        easy: { type: Number, default: 0 },
        medium: { type: Number, default: 0 },
        hard: { type: Number, default: 0 },
        ranking: { type: Number, default: 0 },
        contestRating: { type: Number, default: 0 },
        updatedAt: { type: Date, default: null },
      },
      codechef: {
        currentRating: { type: Number, default: 0 },
        maxRating: { type: Number, default: 0 },
        stars: { type: Number, default: 0 },
        globalRank: { type: Number, default: 0 },
        countryRank: { type: Number, default: 0 },
        updatedAt: { type: Date, default: null },
      },
      atcoder: {
        rating: { type: Number, default: 0 },
        rank: { type: String, default: "" },
        performance: { type: Number, default: 0 },
        updatedAt: { type: Date, default: null },
      },
      spoj: {
        totalSolved: { type: Number, default: 0 },
        rank: { type: Number, default: 0 },
        updatedAt: { type: Date, default: null },
      },
    },

    // Store social profile URLs
    socialLinks: {
      github: { type: String, trim: true },
      linkedin: { type: String, trim: true },
      twitter: { type: String, trim: true },
      facebook: { type: String, trim: true },
      instagram: { type: String, trim: true },
    },

    // Store social stats summary (cached, updated from APIs)
    socialStats: {
      github: {
        publicRepos: { type: Number, default: 0 },
        followers: { type: Number, default: 0 },
        following: { type: Number, default: 0 },
        totalStars: { type: Number, default: 0 },
        totalForks: { type: Number, default: 0 },
        updatedAt: { type: Date, default: null },
      },
      linkedin: {
        connections: { type: Number, default: 0 },
        profileViews: { type: Number, default: 0 },
        updatedAt: { type: Date, default: null },
      },
      twitter: {
        followers: { type: Number, default: 0 },
        following: { type: Number, default: 0 },
        tweets: { type: Number, default: 0 },
        likes: { type: Number, default: 0 },
        updatedAt: { type: Date, default: null },
      },
      facebook: {
        friendsCount: { type: Number, default: 0 },
        followers: { type: Number, default: 0 },
        updatedAt: { type: Date, default: null },
      },
      instagram: {
        followers: { type: Number, default: 0 },
        following: { type: Number, default: 0 },
        posts: { type: Number, default: 0 },
        updatedAt: { type: Date, default: null },
      },
    },
    // Activity stats for your app
    totalProposals: { type: Number, default: 0 },
    totalReviews: { type: Number, default: 0 },

    role: { type: String, enum: ["user", "admin"], default: "user" },
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare passwords
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
