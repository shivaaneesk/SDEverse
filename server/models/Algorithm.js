const mongoose = require("mongoose");
const categories = require("../utils/categories");

const codeSchema = new mongoose.Schema(
  {
    language: { type: String, required: true, trim: true },
    code: { type: String, required: true },
  },
  { _id: false }
);

const algorithmSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, unique: true, trim: true },
    slug: {
      type: String,
      required: true,
      unique: true,
    },
    category: {
      type: [String],
      enum: categories,
      required: true,
    },
    difficulty: {
      type: String,
      enum: ["Easy", "Medium", "Hard"],
      default: "Medium",
      index: true,
    },
    intuition: { type: String, required: true },
    explanation: { type: String, required: true },
    complexity: {
      time: { type: String, required: true },
      space: { type: String, required: true },
    },
    tags: [{ type: String, trim: true, index: true }],
    links: [{ type: String }],
    codes: [codeSchema],
    contributions: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Contribution" },
    ],
    upvotes: { type: Number, default: 0 },
    downvotes: { type: Number, default: 0 },
    upvotedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    downvotedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    views: { type: Number, default: 0 },
    viewedBy: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        viewedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    isVerified: { type: Boolean, default: false },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

// Full‑text search index
algorithmSchema.index({
  title: "text",
  intuition: "text",
  explanation: "text",
  tags: "text",
});

// Compound index for filtering
algorithmSchema.index({ category: 1, difficulty: 1 });

module.exports = mongoose.model("Algorithm", algorithmSchema);
