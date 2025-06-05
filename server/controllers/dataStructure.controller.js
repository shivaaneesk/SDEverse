const asyncHandler = require("express-async-handler");
const DataStructure = require("../models/dataStructure.model");
const Notification = require("../models/notification.model");
const User = require("../models/user.model");
const generateUniqueSlug = require("../utils/generateUniqueSlug");

const { DATA_STRUCTURE } = require("../utils/categoryTypes");

const createDataStructure = asyncHandler(async (req, res) => {
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

  if (!definition) {
    return res.status(400).json({ message: "Definition is required." });
  }

  if (!Array.isArray(category) || category.length === 0) {
    return res
      .status(400)
      .json({ message: "Category must be a non-empty array." });
  }

  const invalid = category.filter((cat) => !DATA_STRUCTURE.includes(cat));
  if (invalid.length > 0) {
    return res
      .status(400)
      .json({ message: `Invalid categories: ${invalid.join(", ")}` });
  }

  const slug = await generateUniqueSlug(title);

  const dataStructure = new DataStructure({
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
    createdBy: req.user._id,
    isPublished: true,
    // Add initial contributor
    contributors: [{
      user: req.user._id,
      contributionType: "create",
      description: "Initial creation"
    }]
  });

  const createdDataStructure = await dataStructure.save();

  // Notify all users about the new data structure
  const users = await User.find({}, "_id").lean();

  const notifications = users.map((user) => ({
    recipient: user._id,
    sender: req.user._id,
    type: "new_data_structure",
    message: `A new data structure "${title}" has been added.`,
    link: `/data-structures/${slug}`,
    read: false,
  }));

  await Notification.insertMany(notifications);

  res.status(201).json(createdDataStructure);
});

const updateDataStructure = asyncHandler(async (req, res) => {
  const dataStructure = await DataStructure.findOne({ slug: req.params.slug });

  if (!dataStructure) {
    res.status(404);
    throw new Error("Data structure not found");
  }

  if (
    dataStructure.createdBy.toString() !== req.user._id.toString() &&
    req.user.role !== "admin"
  ) {
    res.status(403);
    throw new Error("Not authorized to update this data structure");
  }

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

  // Track changes for contribution record
  const changes = [];
  if (title && title !== dataStructure.title) changes.push("title");
  if (definition && definition !== dataStructure.definition) changes.push("definition");
  if (characteristics && characteristics !== dataStructure.characteristics) changes.push("characteristics");
  // Add other fields as needed

  dataStructure.title = title || dataStructure.title;
  dataStructure.definition = definition || dataStructure.definition;
  dataStructure.category = category || dataStructure.category;
  dataStructure.type = type || dataStructure.type;
  dataStructure.characteristics = characteristics || dataStructure.characteristics;
  dataStructure.operations = operations || dataStructure.operations;
  dataStructure.applications = applications || dataStructure.applications;
  dataStructure.comparisons = comparisons || dataStructure.comparisons;
  dataStructure.tags = tags || dataStructure.tags;
  dataStructure.references = references || dataStructure.references;
  dataStructure.videoLinks = videoLinks || dataStructure.videoLinks;

  // Add contribution record if there were changes
  if (changes.length > 0) {
    dataStructure.contributors.push({
      user: req.user._id,
      contributionType: "edit",
      description: `Updated ${changes.join(", ")}`
    });
  }

  const updatedDataStructure = await dataStructure.save();

  res.json(updatedDataStructure);
});

// Add this new controller for adding operation implementations
const addOperationImplementation = asyncHandler(async (req, res) => {
  const { operationName, language, code, explanation, complexity } = req.body;
  
  const dataStructure = await DataStructure.findOne({ slug: req.params.slug });
  if (!dataStructure) {
    res.status(404);
    throw new Error("Data structure not found");
  }

  // Find the operation
  const operation = dataStructure.operations.find(op => op.name === operationName);
  if (!operation) {
    res.status(404);
    throw new Error("Operation not found");
  }

  // Check if implementation for this language already exists
  const existingImplIndex = operation.implementations.findIndex(impl => impl.language === language);
  
  if (existingImplIndex >= 0) {
    // Update existing implementation
    operation.implementations[existingImplIndex] = {
      language,
      code,
      explanation,
      complexity
    };
  } else {
    // Add new implementation
    operation.implementations.push({
      language,
      code,
      explanation,
      complexity
    });
  }

  // Add contribution record
  dataStructure.contributors.push({
    user: req.user._id,
    contributionType: "code",
    description: `${existingImplIndex >= 0 ? 'Updated' : 'Added'} ${language} implementation for ${operationName}`
  });

  const updatedDataStructure = await dataStructure.save();
  res.json(updatedDataStructure);
});

const getAllDataStructures = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    search = "",
    category = "",
    type = "",
  } = req.query;

  const pageNumber = parseInt(page) || 1;
  const limitNumber = parseInt(limit) || 10;

  const filters = {};

  if (category) {
    if (Array.isArray(category)) {
      filters.category = { $in: category };
    } else {
      filters.category = category;
    }
  }

  if (type) filters.type = type;
  if (search) filters.$text = { $search: search };

  if (req.user?.role !== "admin") {
    filters.isPublished = true;
  }

  try {
    const total = await DataStructure.countDocuments(filters);
    const dataStructures = await DataStructure.find(filters)
      .skip((pageNumber - 1) * limitNumber)
      .limit(limitNumber)
      .sort({ title: 1 })  // Sort by title ascending
      .lean();

    res.json({
      dataStructures,
      total,
      pages: Math.ceil(total / limitNumber),
      currentPage: pageNumber,
    });
  } catch (error) {
    console.error("Error in getAllDataStructures:", error);
    res
      .status(500)
      .json({ message: "Failed to fetch data structures", error: error.message });
  }
});

const getDataStructureBySlug = asyncHandler(async (req, res) => {
  const dataStructure = await DataStructure.findOne({ slug: req.params.slug })
    .populate('contributors.user', 'username avatarUrl');

  if (!dataStructure) {
    res.status(404);
    throw new Error("Data structure not found");
  }

  const user = req.user;
  if (user) {
    const alreadyViewedToday = dataStructure.viewedBy?.some(
      (entry) =>
        entry.userId.toString() === user._id.toString() &&
        new Date(entry.viewedAt).toDateString() === new Date().toDateString()
    );

    if (!alreadyViewedToday) {
      dataStructure.views += 1;
      dataStructure.viewedBy.push({ userId: user._id, viewedAt: new Date() });
      await dataStructure.save();
    }
  }

  res.json(dataStructure);
});

const deleteDataStructure = asyncHandler(async (req, res) => {
  const dataStructure = await DataStructure.findOne({ slug: req.params.slug });

  if (!dataStructure) {
    res.status(404);
    throw new Error("Data structure not found");
  }

  if (req.user.role !== "admin") {
    res.status(403);
    throw new Error("Not authorized to delete this data structure");
  }

  dataStructure.isDeleted = true;
  dataStructure.deletedAt = Date.now();
  dataStructure.deletedBy = req.user._id;

  await dataStructure.save();

  res.json({ message: "Data structure soft-deleted successfully" });
});

const voteDataStructure = asyncHandler(async (req, res) => {
  const { type } = req.body || {};
  const userId = req.user._id;

  if (!type) {
    res.status(400);
    throw new Error("Missing vote type in request body.");
  }

  if (!["upvote", "downvote"].includes(type)) {
    res.status(400);
    throw new Error("Invalid vote type. Must be 'upvote' or 'downvote'.");
  }

  const dataStructure = await DataStructure.findOne({ slug: req.params.slug });
  if (!dataStructure) {
    res.status(404);
    throw new Error("Data structure not found");
  }

  const alreadyUpvoted = dataStructure.upvotedBy.includes(userId);
  const alreadyDownvoted = dataStructure.downvotedBy.includes(userId);

  const update = {};
  let message = "";

  if (type === "upvote") {
    if (alreadyUpvoted) {
      update.$pull = { upvotedBy: userId };
      update.$inc = { upvotes: -1 };
      message = "Upvote removed";
    } else {
      update.$addToSet = { upvotedBy: userId };
      update.$inc = { upvotes: 1 };
      message = "Upvoted";

      if (alreadyDownvoted) {
        update.$pull = { ...update.$pull, downvotedBy: userId };
        update.$inc.downvotes = -1;
      }
    }
  } else if (type === "downvote") {
    if (alreadyDownvoted) {
      update.$pull = { downvotedBy: userId };
      update.$inc = { downvotes: -1 };
      message = "Downvote removed";
    } else {
      update.$addToSet = { downvotedBy: userId };
      update.$inc = { downvotes: 1 };
      message = "Downvoted";

      if (alreadyUpvoted) {
        update.$pull = { ...update.$pull, upvotedBy: userId };
        update.$inc.upvotes = -1;
      }
    }
  }

  if (!update.$inc && !update.$addToSet && !update.$pull) {
    return res.json({ message: "No changes made", dataStructure });
  }

  const updatedDataStructure = await DataStructure.findOneAndUpdate(
    { slug: req.params.slug },
    update,
    { new: true }
  );

  res.json({
    message,
    dataStructure: updatedDataStructure,
  });
});

const getAllCategories = (req, res) => {
  try {
    const sortedCategories = [...DATA_STRUCTURE].sort();
    res.status(200).json({
      success: true,
      categories: sortedCategories,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch categories",
      error: error.message,
    });
  }
};

const searchDataStructures = asyncHandler(async (req, res) => {
  let {
    category = "",
    q = "",
    type = "",
    tags = "",
    page = 1,
    limit = 10,
  } = req.query;

  const filters = {};

  if (q) filters.$text = { $search: q };

  const categories = Array.isArray(category)
    ? category
    : category
    ? category.split(",").map((c) => c.trim())
    : [];

  if (categories.length) {
    filters.category = { $in: categories };
  }

  if (type) filters.type = type;

  if (tags) {
    const tagList = tags.split(",").map((tag) => tag.trim());
    filters.tags = { $in: tagList };
  }

  const total = await DataStructure.countDocuments(filters);

  const dataStructures = await DataStructure.find(
    filters,
    q ? { score: { $meta: "textScore" } } : {}
  )
    .sort(q ? { score: { $meta: "textScore" } } : { createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(parseInt(limit));

  res.json({
    total,
    results: dataStructures,
    pages: Math.ceil(total / limit),
    currentPage: parseInt(page),
  });
});

const getContributors = asyncHandler(async (req, res) => {
  const item = await TargetModel.findOne({ slug: req.params.slug })
    .populate('contributors.user', 'username avatarUrl')
    .select('contributors');
    
  if (!item) {
    res.status(404);
    throw new Error("Item not found");
  }

  res.json(item.contributors);
});

module.exports = {
  createDataStructure,
  getAllDataStructures,
  getDataStructureBySlug,
  updateDataStructure,
  deleteDataStructure,
  voteDataStructure,
  getAllCategories,
  searchDataStructures,
  addOperationImplementation,
  getContributors ,
};