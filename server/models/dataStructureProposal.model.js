const mongoose = require("mongoose");
const { DATA_STRUCTURE } = require("../utils/categoryTypes");

const proposalImplementationSchema = new mongoose.Schema(
  {
    language: { type: String, required: true, trim: true },
    code: { type: String, required: true },
    explanation: { type: String, required: true },
    complexity: {
      time: { type: String, required: true },
      space: { type: String, required: true },
    }
  },
  { _id: false }
);

const proposalOperationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    complexity: {
      time: { type: String, required: true },
      space: { type: String, required: true },
    },
    implementations: [proposalImplementationSchema]
  },
  { _id: false }
);

const dataStructureProposalSchema = new mongoose.Schema(
  {
    targetDataStructure: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DataStructure",
      default: null,
    },

    // Core proposal structure
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, trim: true },
    definition: { type: String, required: true, trim: true },
    category: {
      type: [String],
      enum: DATA_STRUCTURE,
      required: true,
    },
    type: {
      type: String,
      enum: ["Linear", "Non-Linear", "Hierarchical", "Graph", "Other"],
      required: true
    },
    characteristics: { type: String, required: true },
    operations: [proposalOperationSchema],
    applications: [{ 
      domain: { type: String, required: true },
      examples: [{ type: String }]
    }],
    comparisons: [{
      with: { type: String, required: true },
      advantages: [{ type: String }],
      disadvantages: [{ type: String }],
      whenToUse: { type: String }
    }],
    tags: [{ type: String, trim: true }],
    references: [{ type: String }],
    videoLinks: [{ type: String }],

    // Proposal metadata
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
    mergedWith: { type: mongoose.Schema.Types.ObjectId, ref: "DataStructure" },
  },
  { timestamps: true }
);

dataStructureProposalSchema.index({ title: "text", category: "text", tags: "text" });

module.exports = mongoose.model("DataStructureProposal", dataStructureProposalSchema);