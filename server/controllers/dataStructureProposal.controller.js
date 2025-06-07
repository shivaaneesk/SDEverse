const asyncHandler = require("express-async-handler");
const DataStructureProposal = require("../models/dataStructureProposal.model");
const DataStructure = require("../models/dataStructure.model");
const User = require("../models/user.model");
const Notification = require("../models/notification.model");
const generateUniqueSlug = require("../utils/generateUniqueSlug");

const { DATA_STRUCTURE } = require("../utils/categoryTypes");

const createProposal = asyncHandler(async (req, res) => {
  const {
    title,
    definition,
    category,
    type,
    characteristics,
    visualization,
    operations,
    fullImplementations,
    applications,
    comparisons,
    tags,
    references,
    videoLinks,
    targetDataStructure,
  } = req.body;

  if (!title || !definition || !type || !characteristics) {
    return res.status(400).json({
      message:
        "Missing required fields: title, definition, type, characteristics.",
    });
  }

  if (!Array.isArray(category) || category.length === 0) {
    return res
      .status(400)
      .json({ message: "Category must be a non-empty array." });
  }
  const invalidCategories = category.filter(
    (cat) => !DATA_STRUCTURE.includes(cat)
  );
  if (invalidCategories.length > 0) {
    return res
      .status(400)
      .json({ message: `Invalid categories: ${invalidCategories.join(", ")}` });
  }

  const allowedTypes = [
    "Linear",
    "Non-Linear",
    "Hierarchical",
    "Graph",
    "Other",
  ];
  if (!allowedTypes.includes(type)) {
    return res.status(400).json({
      message: `Invalid type: ${type}. Must be one of ${allowedTypes.join(
        ", "
      )}.`,
    });
  }

  const slug = await generateUniqueSlug(title);

  const proposal = new DataStructureProposal({
    title,
    slug,
    definition,
    category,
    type,
    characteristics,
    visualization,
    operations,
    fullImplementations,
    applications,
    comparisons,
    tags,
    references,
    videoLinks,
    targetDataStructure: targetDataStructure || null,
    contributor: req.user._id,
    status: "pending",
  });

  const createdProposal = await proposal.save();

  const admins = await User.find({ role: "admin" }, "_id").lean();
  const notifications = admins.map((admin) => ({
    recipient: admin._id,
    sender: req.user._id,
    type: "new_data_structure_proposal",
    message: `User "${req.user.username}" has submitted a new data structure proposal "${title}".`,
    link: `/admin/proposals/${slug}`,
    read: false,
  }));
  await Notification.insertMany(notifications);

  res.status(201).json(createdProposal);
});

const getAllProposals = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const { status = "", search = "" } = req.query;

  const filters = { isDeleted: false };

  if (status) {
    const validStatuses = ["pending", "approved", "rejected", "merged"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status provided." });
    }
    filters.status = status;
  }

  if (search) {
    filters.$or = [
      { title: { $regex: search, $options: "i" } },
      { tags: { $regex: search, $options: "i" } },
      { definition: { $regex: search, $options: "i" } },
      { characteristics: { $regex: search, $options: "i" } },
    ];
  }

  if (req.user.role !== "admin") {
    filters.contributor = req.user._id;
  }

  const proposals = await DataStructureProposal.find(filters)
    .populate("contributor", "username avatarUrl")
    .populate("reviewedBy", "username avatarUrl")
    .populate("mergedBy", "username avatarUrl")
    .populate("mergedWith", "title slug")
    .skip((page - 1) * limit)
    .limit(limit)
    .sort({ createdAt: -1 })
    .lean();

  const total = await DataStructureProposal.countDocuments(filters);

  res.json({
    proposals,
    total,
    pages: Math.ceil(total / limit),
    currentPage: page,
  });
});

const getProposalBySlug = asyncHandler(async (req, res) => {
  const proposal = await DataStructureProposal.findOne({
    slug: req.params.slug,
    isDeleted: false,
  })
    .populate("contributor", "username avatarUrl")
    .populate("reviewedBy", "username avatarUrl")
    .populate("mergedBy", "username avatarUrl")
    .populate("mergedWith", "title slug");

  if (!proposal) {
    res.status(404);
    throw new Error("Proposal not found.");
  }

  if (
    proposal.contributor.toString() !== req.user._id.toString() &&
    req.user.role !== "admin"
  ) {
    res.status(403);
    throw new Error("Not authorized to view this proposal.");
  }

  res.json(proposal);
});

const updateProposal = asyncHandler(async (req, res) => {
  const proposal = await DataStructureProposal.findOne({
    slug: req.params.slug,
  });

  if (!proposal) {
    res.status(404);
    throw new Error("Proposal not found.");
  }

  if (req.user.role !== "admin") {
    if (proposal.contributor.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error("Not authorized to update this proposal.");
    }
    if (proposal.status !== "pending") {
      res.status(400);
      throw new Error(
        `Proposal is already ${proposal.status} and cannot be updated by a contributor.`
      );
    }
  }

  if (proposal.status === "approved" || proposal.status === "merged") {
    if (req.user.role !== "admin") {
      res.status(400);
      throw new Error(
        `Proposal is already ${proposal.status} and cannot be updated.`
      );
    }
  }

  const {
    title,
    definition,
    category,
    type,
    characteristics,
    visualization,
    operations,
    fullImplementations,
    applications,
    comparisons,
    tags,
    references,
    videoLinks,
    targetDataStructure,
  } = req.body;

  let hasChanged = false;

  const isDeepEqual = (arr1, arr2) => {
    if (!arr1 && arr2) return false;
    if (arr1 && !arr2) return false;

    if (!arr1 && !arr2) return true;

    if (arr1.length !== arr2.length) return false;
    for (let i = 0; i < arr1.length; i++) {
      if (JSON.stringify(arr1[i]) !== JSON.stringify(arr2[i])) {
        return false;
      }
    }
    return true;
  };

  if (title !== undefined && title !== proposal.title) {
    proposal.title = title;
    proposal.slug = await generateUniqueSlug(title);
    hasChanged = true;
  }
  if (definition !== undefined && definition !== proposal.definition) {
    proposal.definition = definition;
    hasChanged = true;
  }
  if (
    characteristics !== undefined &&
    characteristics !== proposal.characteristics
  ) {
    proposal.characteristics = characteristics;
    hasChanged = true;
  }
  if (visualization !== undefined && visualization !== proposal.visualization) {
    proposal.visualization = visualization;
    hasChanged = true;
  }

  if (category !== undefined) {
    if (!Array.isArray(category) || category.length === 0) {
      res.status(400);
      throw new Error("Category must be a non-empty array.");
    }
    const invalidCategories = category.filter(
      (cat) => !DATA_STRUCTURE.includes(cat)
    );
    if (invalidCategories.length > 0) {
      res.status(400);
      throw new Error(`Invalid categories: ${invalidCategories.join(", ")}`);
    }
    if (!isDeepEqual(proposal.category, category)) {
      proposal.category = category;
      hasChanged = true;
    }
  }

  if (type !== undefined) {
    const allowedTypes = [
      "Linear",
      "Non-Linear",
      "Hierarchical",
      "Graph",
      "Other",
    ];
    if (!allowedTypes.includes(type)) {
      res.status(400);
      throw new Error(
        `Invalid type: ${type}. Must be one of ${allowedTypes.join(", ")}.`
      );
    }
    if (type !== proposal.type) {
      proposal.type = type;
      hasChanged = true;
    }
  }

  if (
    operations !== undefined &&
    !isDeepEqual(proposal.operations, operations)
  ) {
    proposal.operations = operations;
    hasChanged = true;
  }
  if (
    fullImplementations !== undefined &&
    !isDeepEqual(proposal.fullImplementations, fullImplementations)
  ) {
    proposal.fullImplementations = fullImplementations;
    hasChanged = true;
  }
  if (
    applications !== undefined &&
    !isDeepEqual(proposal.applications, applications)
  ) {
    proposal.applications = applications;
    hasChanged = true;
  }
  if (
    comparisons !== undefined &&
    !isDeepEqual(proposal.comparisons, comparisons)
  ) {
    proposal.comparisons = comparisons;
    hasChanged = true;
  }
  if (tags !== undefined && !isDeepEqual(proposal.tags, tags)) {
    proposal.tags = tags;
    hasChanged = true;
  }
  if (
    references !== undefined &&
    !isDeepEqual(proposal.references, references)
  ) {
    proposal.references = references;
    hasChanged = true;
  }
  if (
    videoLinks !== undefined &&
    !isDeepEqual(proposal.videoLinks, videoLinks)
  ) {
    proposal.videoLinks = videoLinks;
    hasChanged = true;
  }

  if (targetDataStructure !== undefined && proposal.mergedWith === null) {
    if (
      typeof targetDataStructure === "string" ||
      targetDataStructure === null
    ) {
      if (
        targetDataStructure &&
        !(await DataStructure.findById(targetDataStructure))
      ) {
        res.status(400);
        throw new Error("Specified target data structure does not exist.");
      }
      if (
        proposal.targetDataStructure?.toString() !==
        targetDataStructure?.toString()
      ) {
        proposal.targetDataStructure = targetDataStructure;
        hasChanged = true;
      }
    } else {
      res.status(400);
      throw new Error("Invalid targetDataStructure format.");
    }
  }

  if (!hasChanged) {
    return res.json({
      message: "No relevant changes provided to update proposal.",
      proposal,
    });
  }

  const updatedProposal = await proposal.save();
  res.json(updatedProposal);
});

const reviewProposal = asyncHandler(async (req, res) => {
  if (req.user.role !== "admin") {
    res.status(403);
    throw new Error("Not authorized to review proposals.");
  }

  const proposal = await DataStructureProposal.findOne({
    slug: req.params.slug,
    isDeleted: false,
  });

  if (!proposal) {
    res.status(404);
    throw new Error("Proposal not found.");
  }

  if (proposal.status === "merged") {
    res.status(400);
    throw new Error(
      "This proposal has already been merged and cannot be reviewed again."
    );
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

  let notificationMessage = "";
  let notificationType = "proposal_status_update";
  let notificationLink = `/proposals/${proposal.slug}`;

  if (status === "approved") {
    try {
      let dataStructure;
      if (proposal.targetDataStructure) {
        dataStructure = await DataStructure.findById(
          proposal.targetDataStructure
        );
        if (!dataStructure) {
          res.status(404);
          throw new Error("Target data structure for update not found.");
        }

        dataStructure.title = proposal.title;
        dataStructure.slug = await generateUniqueSlug(proposal.title);
        dataStructure.definition = proposal.definition;
        dataStructure.category = proposal.category;
        dataStructure.type = proposal.type;
        dataStructure.characteristics = proposal.characteristics;
        dataStructure.visualization = proposal.visualization;
        dataStructure.operations = proposal.operations;
        dataStructure.fullImplementations = proposal.fullImplementations;
        dataStructure.applications = proposal.applications;
        dataStructure.comparisons = proposal.comparisons;
        dataStructure.tags = proposal.tags;
        dataStructure.references = proposal.references;
        dataStructure.videoLinks = proposal.videoLinks;

        dataStructure.updatedBy = req.user._id;

        dataStructure.contributors.push({
          user: proposal.contributor,
          contributionType: "content",
          description: `Merged update from proposal: "${proposal.title}"`,
        });

        dataStructure.contributors.push({
          user: req.user._id,
          contributionType: "review",
          description: `Approved and merged proposal by ${req.user.username}`,
        });

        await dataStructure.save();
        notificationMessage = `Your proposal "${proposal.title}" has been approved and merged into the existing data structure.`;
        notificationType = "proposal_merged";
        notificationLink = `/data-structures/${dataStructure.slug}`;
      } else {
        dataStructure = new DataStructure({
          title: proposal.title,
          slug: proposal.slug,
          definition: proposal.definition,
          category: proposal.category,
          type: proposal.type,
          characteristics: proposal.characteristics,
          visualization: proposal.visualization,
          operations: proposal.operations,
          fullImplementations: proposal.fullImplementations,
          applications: proposal.applications,
          comparisons: proposal.comparisons,
          tags: proposal.tags,
          references: proposal.references,
          videoLinks: proposal.videoLinks,
          createdBy: proposal.contributor,
          isPublished: true,
          publishedAt: new Date(),
          publishedBy: req.user._id,
          contributors: [
            {
              user: proposal.contributor,
              contributionType: "create",
              description: "Initial creation via proposal",
            },
            {
              user: req.user._id,
              contributionType: "review",
              description: `Approved and published by ${req.user.username}`,
            },
          ],
        });

        const createdDataStructure = await dataStructure.save();
        notificationMessage = `Your proposal "${proposal.title}" has been approved and a new data structure created!`;
        notificationType = "proposal_approved_new_ds";
        notificationLink = `/data-structures/${createdDataStructure.slug}`;
      }

      proposal.status = "merged";
      proposal.mergedWith = dataStructure._id;
      proposal.mergedBy = req.user._id;
      proposal.mergedAt = new Date();
    } catch (error) {
      console.error("Error merging proposal to data structure:", error);
      res.status(500);
      throw new Error(
        `Failed to merge proposal to data structure: ${error.message}`
      );
    }
  } else if (status === "rejected") {
    notificationMessage = `Your proposal "${
      proposal.title
    }" has been rejected. Reason: ${reviewComment || "No reason provided."}`;
    notificationType = "proposal_rejected";
  }

  const updatedProposal = await proposal.save();

  await Notification.create({
    recipient: proposal.contributor,
    sender: req.user._id,
    type: notificationType,
    message: notificationMessage,
    link: notificationLink,
    read: false,
  });

  res.json(updatedProposal);
});

const deleteProposal = asyncHandler(async (req, res) => {
  const proposal = await DataStructureProposal.findOne({
    slug: req.params.slug,
  });

  if (!proposal) {
    res.status(404);
    throw new Error("Proposal not found.");
  }

  if (
    req.user.role !== "admin" &&
    proposal.contributor.toString() !== req.user._id.toString()
  ) {
    res.status(403);
    throw new Error("Not authorized to delete this proposal.");
  }

  if (proposal.status !== "pending" && req.user.role !== "admin") {
    res.status(400);
    throw new Error(
      `Cannot delete a proposal that is already ${proposal.status}. Only an admin can force delete.`
    );
  }

  const updatedProposal = await DataStructureProposal.findOneAndUpdate(
    { _id: proposal._id },
    {
      isDeleted: true,
      deletedAt: new Date(),
      deletedBy: req.user._id,
      status: "rejected",
    },
    { new: true }
  );

  res.json({
    message: "Proposal soft-deleted successfully.",
    proposal: updatedProposal,
  });
});

module.exports = {
  createProposal,
  getAllProposals,
  getProposalBySlug,
  updateProposal,
  reviewProposal,
  deleteProposal,
};
