const asyncHandler = require("express-async-handler");
const Proposal = require("../models/proposal.model");
const Algorithm = require("../models/algorithm.model");
const generateUniqueSlug = require("../utils/generateUniqueSlug");

// --- Create Proposal ---
const createProposal = asyncHandler(async (req, res) => {
  const {
    title,
    problemStatement,
    category,
    difficulty,
    intuition,
    explanation,
    complexity,
    tags,
    links,
    codes,
  } = req.body;

  const slug = await generateUniqueSlug(title);

  const proposal = new Proposal({
    title,
    slug,
    problemStatement,
    category,
    difficulty,
    intuition,
    explanation,
    complexity,
    tags,
    links,
    codes,
    contributor: req.user._id,
  });

  const createdProposal = await proposal.save();
  res.status(201).json(createdProposal);
});

// --- Get All Proposals ---
const getAllProposals = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, status = "", search = "" } = req.query;
  const filters = {};

  if (status) filters.status = status;
  if (search) filters.$text = { $search: search };

  if (req.user.role !== "admin") {
    filters.contributor = req.user._id;
  }

  const proposals = await Proposal.find(filters)
    .skip((page - 1) * limit)
    .limit(limit)
    .sort({ createdAt: -1 });

  const total = await Proposal.countDocuments(filters);

  res.json({
    proposals,
    total,
    pages: Math.ceil(total / limit),
    currentPage: Number(page),
  });
});

// --- Get Proposal by Slug ---
const getProposalBySlug = asyncHandler(async (req, res) => {
  const proposal = await Proposal.findOne({ slug: req.params.slug });

  if (!proposal) {
    res.status(404);
    throw new Error("Proposal not found");
  }

  res.json(proposal);
});

// --- Update Proposal ---
const updateProposal = asyncHandler(async (req, res) => {
  const proposal = await Proposal.findOne({ slug: req.params.slug });

  if (!proposal) {
    res.status(404);
    throw new Error("Proposal not found");
  }

  if (
    proposal.contributor.toString() !== req.user._id.toString() &&
    req.user.role !== "admin"
  ) {
    res.status(403);
    throw new Error("Not authorized to update this proposal");
  }

  const fieldsToUpdate = [
    "title",
    "problemStatement",
    "category",
    "difficulty",
    "intuition",
    "explanation",
    "complexity",
    "tags",
    "links",
    "codes",
  ];

  for (const field of fieldsToUpdate) {
    if (req.body[field] !== undefined) {
      proposal[field] = req.body[field];
    }
  }

  if (req.body.title && req.body.title !== proposal.title) {
    proposal.slug = await generateUniqueSlug(req.body.title);
  }

  const updated = await proposal.save();
  res.json(updated);
});

// --- Review (Approve / Reject) ---
const reviewProposal = asyncHandler(async (req, res) => {
  const proposal = await Proposal.findOne({ slug: req.params.slug });

  if (!proposal || proposal.isDeleted) {
    res.status(404);
    throw new Error("Proposal not found");
  }

  const { status, reviewComment } = req.body;

  if (!["approved", "rejected"].includes(status)) {
    res.status(400);
    throw new Error("Status must be 'approved' or 'rejected'.");
  }

  proposal.status = status;
  proposal.reviewedBy = req.user._id;
  proposal.reviewedAt = new Date();
  proposal.reviewComment = reviewComment || "";

  if (status === "approved") {
    const algorithm = new Algorithm({
      title: proposal.title,
      slug: proposal.slug,
      problemStatement: proposal.problemStatement,
      category: proposal.category,
      difficulty: proposal.difficulty,
      intuition: proposal.intuition,
      explanation: proposal.explanation,
      complexity: proposal.complexity,
      tags: proposal.tags,
      links: proposal.links,
      codes: proposal.codes,
      createdBy: proposal.contributor,
      isPublished:true,
    });

    await algorithm.save();

    // Link the created algorithm to the proposal
    proposal.mergedWith = algorithm._id;
    proposal.mergedBy = req.user._id;
    proposal.mergedAt = new Date();
    proposal.status = "approved";
  }

  const updated = await proposal.save();
  res.json(updated);
});

// --- Soft Delete Proposal ---
const deleteProposal = asyncHandler(async (req, res) => {
  const proposal = await Proposal.findOne({ slug: req.params.slug });

  if (!proposal) {
    res.status(404);
    throw new Error("Proposal not found");
  }

  proposal.isDeleted = true;
  proposal.deletedAt = new Date();
  proposal.deletedBy = req.user._id;

  await proposal.save();
  res.json({ message: "Proposal deleted successfully" });
});

module.exports = {
  createProposal,
  getAllProposals,
  getProposalBySlug,
  updateProposal,
  reviewProposal,
  deleteProposal,
};
