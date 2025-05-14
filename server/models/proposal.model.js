const mongoose = require("mongoose");
const categories = require("../utils/categories");

const codeSchema = new mongoose.Schema(
  {
    language: { type: String, required: true, trim: true },
    code: { type: String, required: true },
  },
  { _id: false }
);

const proposalSchema = new mongoose.Schema(
  {
    targetAlgorithm: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Algorithm",
      default: null,
    },

    // full proposal structure
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, trim: true },
    problemStatement: { type: String, required: true, trim: true },
    category: {
      type: [String],
      enum: categories,
      required: true,
    },
    difficulty: {
      type: String,
      enum: ["Easy", "Medium", "Hard"],
      default: "Medium",
    },
    intuition: { type: String, required: true },
    explanation: { type: String, required: true },
    complexity: {
      time: { type: String, required: true },
      space: { type: String, required: true },
    },
    tags: [{ type: String, trim: true }],
    links: [{ type: String }],
    codes: [codeSchema],

    // proposal metadata
    contributor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "merged"],
      default: "pending",
    },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    reviewedAt: { type: Date },
    reviewComment: { type: String },

    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date },
    deletedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    // Merging and final approval metadata
    mergedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    mergedAt: { type: Date },
    mergedWith: { type: mongoose.Schema.Types.ObjectId, ref: "Algorithm" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Proposal", proposalSchema);
