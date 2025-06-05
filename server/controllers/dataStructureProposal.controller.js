const asyncHandler = require("express-async-handler");
const DataStructureProposal = require("../models/dataStructureProposal.model");
const DataStructure = require("../models/dataStructure.model");
const User = require("../models/user.model");
const Notification = require("../models/notification.model");
const generateUniqueSlug = require("../utils/generateUniqueSlug");

const createProposal = asyncHandler(async (req, res) => {
  const {
    title,
    definition,
    category,
    type,
    characteristics,
    operations,
    applications,
    comparisons,
    tags,
    references,
    videoLinks,
  } = req.body;

  const slug = await generateUniqueSlug(title);

  const proposal = new DataStructureProposal({
    title,
    slug,
    definition,
    category,
    type,
    characteristics,
    operations,
    applications,
    comparisons,
    tags,
    references,
    videoLinks,
    contributor: req.user._id,
  });

  const createdProposal = await proposal.save();

  // Find all admins
  const admins = await User.find({ role: "admin" }, "_id").lean();

  // Prepare notifications for all admins
  const notifications = admins.map((admin) => ({
    recipient: admin._id,
    sender: req.user._id,
    type: "new_data_structure_proposal",
    message: `User "${req.user.username}" has submitted a new data structure proposal "${title}".`,
    link: `/admin/proposals/review`,
    read: false,
  }));

  // Insert all notifications
  await Notification.insertMany(notifications);

  res.status(201).json(createdProposal);
});

const getAllProposals = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const { status = "", search = "" } = req.query;

  const filters = { isDeleted: false };

  if (status) filters.status = status;
  if (search) {
    filters.$or = [
      { title: { $regex: search, $options: "i" } },
      { tags: { $regex: search, $options: "i" } }
    ];
  }

  // For non-admins, only show their own proposals
  if (req.user.role !== "admin") {
    filters.contributor = req.user._id;
  }

  const proposals = await DataStructureProposal.find(filters)
    .populate("contributor", "username")
    .skip((page - 1) * limit)
    .limit(limit)
    .sort({ createdAt: -1 });

  const total = await DataStructureProposal.countDocuments(filters);

  res.json({
    proposals,
    total,
    pages: Math.ceil(total / limit),
    currentPage: page,
  });
});

const getProposalBySlug = asyncHandler(async (req, res) => {
  const proposal = await DataStructureProposal.findOne({ slug: req.params.slug });

  if (!proposal) {
    res.status(404);
    throw new Error("Proposal not found");
  }

  res.json(proposal);
});

const updateProposal = asyncHandler(async (req, res) => {
  const proposal = await DataStructureProposal.findOne({ slug: req.params.slug });

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
    "definition",
    "category",
    "type",
    "characteristics",
    "operations",
    "applications",
    "comparisons",
    "tags",
    "references",
    "videoLinks",
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

const reviewProposal = asyncHandler(async (req, res) => {
  const proposal = await DataStructureProposal.findOne({ slug: req.params.slug });

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

  if (status === "approved" && !proposal.mergedWith) {
    try {
      const dataStructure = new DataStructure({
        title: proposal.title,
        slug: proposal.slug,
        definition: proposal.definition,
        category: proposal.category,
        type: proposal.type,
        characteristics: proposal.characteristics,
        operations: proposal.operations,
        applications: proposal.applications,
        comparisons: proposal.comparisons,
        tags: proposal.tags,
        references: proposal.references,
        videoLinks: proposal.videoLinks,
        createdBy: proposal.contributor,
        isPublished: true,
      });

      const createdDataStructure = await dataStructure.save();

      proposal.mergedWith = createdDataStructure._id;
      proposal.mergedBy = req.user._id;
      proposal.mergedAt = new Date();

      // Notify all users/admins
      const users = await User.find({}, "_id").lean();

      const notifications = users.map((user) => ({
        recipient: user._id,
        sender: req.user._id,
        type: "new_data_structure",
        message: `A new data structure "${createdDataStructure.title}" has been added.`,
        link: `/data-structures/${createdDataStructure.slug}`,
        read: false,
      }));

      await Notification.insertMany(notifications);
    } catch (error) {
      console.error("Error merging proposal to data structure:", error);
      res.status(500);
      throw new Error("Failed to merge proposal to data structure.");
    }
  }

  const updatedProposal = await proposal.save();
  res.json(updatedProposal);
});

const deleteProposal = asyncHandler(async (req, res) => {
  const proposal = await DataStructureProposal.findOne({ slug: req.params.slug });

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