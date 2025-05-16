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

    competitiveProfiles: {
      leetcode: { type: String, trim: true },
      codeforces: { type: String, trim: true },
      codechef: { type: String, trim: true },
      atcoder: { type: String, trim: true },
      spoj: { type: String, trim: true },
    },

    socialLinks: {
      github: { type: String, trim: true },
      linkedin: { type: String, trim: true },
      twitter: { type: String, trim: true },
      facebook: { type: String, trim: true },
      instagram: { type: String, trim: true },
    },
    // New profile fields
    fullName: { type: String, trim: true },
    avatarUrl: { type: String, trim: true },
    location: { type: String, trim: true },
    website: { type: String, trim: true },

    // Activity stats
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
