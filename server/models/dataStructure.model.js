const mongoose = require("mongoose");
const { DATA_STRUCTURE } = require("../utils/categoryTypes");

const implementationSchema = new mongoose.Schema(
  {
    language: { type: String, required: true, trim: true },
    code: { type: String, required: true },
    explanation: { type: String, required: true },
    complexity: {
      time: { type: String, required: true },
      space: { type: String, required: true },
    },
  },
  { _id: false }
);

const operationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    complexity: {
      time: { type: String, required: true },
      space: { type: String, required: true },
    },
    implementations: [implementationSchema],
  },
  { _id: false }
);

const dataStructureSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, unique: true, trim: true },
    slug: { type: String, required: true, unique: true },

    // Core information
    definition: { type: String, required: true, trim: true },
    category: {
      type: [String],
      enum: DATA_STRUCTURE,
      required: true,
    },
    type: {
      type: String,
      enum: ["Linear", "Non-Linear", "Hierarchical", "Graph", "Other"],
      required: true,
    },
    characteristics: { type: String, required: true },
    visualization: { type: String }, // URL to visualization

    // Operations
    operations: [operationSchema],

    // Real-world applications
    applications: [
      {
        domain: { type: String, required: true },
        examples: [{ type: String }],
      },
    ],

    // Comparisons with other data structures
    comparisons: [
      {
        with: { type: String, required: true },
        advantages: [{ type: String }],
        disadvantages: [{ type: String }],
        whenToUse: { type: String },
      },
    ],

    // Additional resources
    tags: [{ type: String, trim: true, index: true }],
    references: [{ type: String }],
    videoLinks: [{ type: String }],

    // Community engagement
    contributors: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        contributionType: {
          type: String,
          enum: ["create", "edit", "content", "code", "review", "other"],
          required: true,
        },
        contributedAt: {
          type: Date,
          default: Date.now,
        },
        description: {
          type: String,
          trim: true,
        },
      },
    ],
    upvotes: { type: Number, default: 0 },
    downvotes: { type: Number, default: 0 },
    upvotedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    downvotedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    views: { type: Number, default: 0 },
    viewedBy: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        viewedAt: { type: Date, default: Date.now },
      },
    ],

    // Admin review and workflow metadata
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    isVerified: { type: Boolean, default: false },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    reviewedAt: { type: Date },

    // Ownership + soft delete + audit
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date },
    deletedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    // Publication state
    isPublished: { type: Boolean, default: false },
    publishedAt: { type: Date },
    publishedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

// Indexes
dataStructureSchema.index({
  title: "text",
  definition: "text",
  characteristics: "text",
  tags: "text",
});
dataStructureSchema.index({ category: 1, type: 1 });

module.exports = mongoose.model("DataStructure", dataStructureSchema);
