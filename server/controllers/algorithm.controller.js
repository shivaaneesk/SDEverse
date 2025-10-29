const asyncHandler = require("express-async-handler");
const Algorithm = require("../models/algorithm.model");
const Notification = require("../models/notification.model");
const User = require("../models/user.model");
const generateUniqueSlug = require("../utils/generateUniqueSlug");

const { ALGORITHM } = require("../utils/categoryTypes");

const createAlgorithm = asyncHandler(async (req, res) => {
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

  if (!problemStatement) {
    return res.status(400).json({ message: "Problem statement is required." });
  }

  if (!Array.isArray(category) || category.length === 0) {
    return res
      .status(400)
      .json({ message: "Category must be a non-empty array." });
  }

  const invalid = category.filter((cat) => !ALGORITHM.includes(cat));
  if (invalid.length > 0) {
    return res
      .status(400)
      .json({ message: `Invalid categories: ${invalid.join(", ")}` });
  }

  const slug = await generateUniqueSlug(title);

  const algorithm = new Algorithm({
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
    createdBy: req.user._id,
    isPublished: true, // Assuming new algorithms are published by default
    contributors: [
      {
        user: req.user._id,
        contributionType: "create",
        description: "Initial creation",
      },
    ],
  });

  const createdAlgorithm = await algorithm.save();

  const users = await User.find({}, "_id").lean();

  const notifications = users.map((user) => ({
    recipient: user._id,
    sender: req.user._id,
    type: "new_algorithm",
    message: `A new algorithm "${title}" has been added.`,
    link: `/algorithms/${slug}`,
    read: false,
  }));

  await Notification.insertMany(notifications);

  res.status(201).json(createdAlgorithm);
});

const updateAlgorithm = asyncHandler(async (req, res) => {
  const algorithm = await Algorithm.findOne({ slug: req.params.slug });

  if (!algorithm) {
    res.status(404);
    throw new Error("Algorithm not found");
  }

  if (
    algorithm.createdBy.toString() !== req.user._id.toString() &&
    req.user.role !== "admin"
  ) {
    res.status(403);
    throw new Error("Not authorized to update this algorithm");
  }

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

  const changes = [];
  if (title && title !== algorithm.title) changes.push("title");
  if (problemStatement && problemStatement !== algorithm.problemStatement)
    changes.push("problem statement");
  if (intuition && intuition !== algorithm.intuition) changes.push("intuition");
  if (explanation && explanation !== algorithm.explanation)
    changes.push("explanation");

  algorithm.title = title || algorithm.title;
  algorithm.problemStatement = problemStatement || algorithm.problemStatement;
  algorithm.category = category || algorithm.category;
  algorithm.difficulty = difficulty || algorithm.difficulty;
  algorithm.intuition = intuition || algorithm.intuition;
  algorithm.explanation = explanation || algorithm.explanation;
  algorithm.complexity = complexity || algorithm.complexity;
  algorithm.tags = tags || algorithm.tags;
  algorithm.links = links || algorithm.links;
  algorithm.codes = codes || algorithm.codes;

  if (changes.length > 0) {
    algorithm.contributors.push({
      user: req.user._id,
      contributionType: "edit",
      description: `Updated ${changes.join(", ")}`,
    });
  }

  const updatedAlgorithm = await algorithm.save();

  res.json(updatedAlgorithm);
});

const addAlgorithmCode = asyncHandler(async (req, res) => {
  const { language, code } = req.body;

  const algorithm = await Algorithm.findOne({ slug: req.params.slug });
  if (!algorithm) {
    res.status(404);
    throw new Error("Algorithm not found");
  }

  const existingCodeIndex = algorithm.codes.findIndex(
    (c) => c.language === language
  );

  if (existingCodeIndex >= 0) {
    algorithm.codes[existingCodeIndex].code = code;
  } else {
    algorithm.codes.push({ language, code });
  }

  algorithm.contributors.push({
    user: req.user._id,
    contributionType: "code",
    description: `${
      existingCodeIndex >= 0 ? "Updated" : "Added"
    } ${language} implementation`,
  });

  const updatedAlgorithm = await algorithm.save();
  res.json(updatedAlgorithm);
});

const getAllAlgorithms = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    search = "",
    category = "",
    difficulty = "",
  } = req.query;

  const pageNumber = parseInt(page) || 1;
  const limitNumber = parseInt(limit) || 10;

  const filters = {};

  if (category) {
    if (Array.isArray(category)) {
      filters.category = {
        $in: category.map((cat) => new RegExp(`^${cat}$`, "i")),
      };
    } else {
      filters.category = { $in: [new RegExp(`^${category}$`, "i")] };
    }
  }

  if (difficulty) {
    filters.difficulty = { $regex: new RegExp(`^${difficulty}$`, "i") };
  }

  if (search) {
    filters.$text = { $search: search };
  }

  if (req.user?.role !== "admin") {
    filters.isPublished = true;
  }

  try {
    const total = await Algorithm.countDocuments(filters);
    const algorithms = await Algorithm.find(filters)
      .skip((pageNumber - 1) * limitNumber)
      .limit(limitNumber)
      .sort({ title: 1 })
      .lean();

    res.json({
      algorithms,
      total,
      pages: Math.ceil(total / limitNumber),
      currentPage: pageNumber,
    });
  } catch (error) {
    console.error("❌ Error in getAllAlgorithms:", error);
    res.status(500).json({
      message: "Failed to fetch algorithms",
      error: error.message,
    });
  }
});

const getAlgorithmsForList = asyncHandler(async (req, res) => {
  const { search = "", category = "", difficulty = "" } = req.query;

  const filters = {};

  if (category) {
    filters.category = { $in: [new RegExp(`^${category}$`, "i")] }; // ✅ case-insensitive
  }

  if (difficulty) {
    filters.difficulty = { $regex: new RegExp(`^${difficulty}$`, "i") }; // ✅ case-insensitive
  }

  // This filter might be the issue if algorithms aren't published or if you're not admin
  if (req.user?.role !== "admin") {
    filters.isPublished = true;
  }

  try {
    const algorithms = await Algorithm.find(filters)
      .select("title slug category intuition description") // Ensure fields match what frontend expects
      .sort({ title: 1 })
      .lean();

    // --- DEBUG LOGS ADDED ---
    console.log("--- DEBUG: Fetching algorithm list FOR EXPLORER ---");
    console.log("Query Filters Used:", filters); // See what filters are being applied
    console.log("Algorithms Found in DB:", algorithms); // See the actual data found
    console.log("Total Count from DB:", algorithms.length); // Count how many were found
    // --- END OF DEBUG LOGS ---

    res.json({
      algorithms,
      total: algorithms.length,
    });
  } catch (error) {
    console.error("Error in getAlgorithmsForList:", error); // Log any errors
    res
      .status(500)
      .json({
        message: "Failed to fetch algorithms for list",
        error: error.message,
      });
  }
});


const getAlgorithmBySlug = asyncHandler(async (req, res) => {
  const algorithm = await Algorithm.findOne({ slug: req.params.slug }).populate(
    "contributors.user",
    "username avatarUrl"
  );

  if (!algorithm) {
    res.status(404);
    throw new Error("Algorithm not found");
  }

  // Handle potential undefined req.user (if route isn't protected or user not logged in)
  const user = req.user;
  if (user && algorithm.viewedBy) { // Check if viewedBy exists
    const alreadyViewedToday = algorithm.viewedBy.some(
      (entry) =>
        entry.userId?.toString() === user._id.toString() && // Add optional chaining
        new Date(entry.viewedAt).toDateString() === new Date().toDateString()
    );

    if (!alreadyViewedToday) {
      algorithm.views = (algorithm.views || 0) + 1; // Initialize views if undefined
      if (!algorithm.viewedBy) { // Initialize viewedBy if undefined
        algorithm.viewedBy = [];
      }
      algorithm.viewedBy.push({ userId: user._id, viewedAt: new Date() });
      await algorithm.save();
    }
  } else if (user && !algorithm.viewedBy) { // If user logged in but viewedBy doesn't exist yet
     algorithm.views = 1;
     algorithm.viewedBy = [{ userId: user._id, viewedAt: new Date() }];
     await algorithm.save();
  }


  res.json(algorithm);
});

const deleteAlgorithm = asyncHandler(async (req, res) => {
  const algorithm = await Algorithm.findOne({ slug: req.params.slug });

  if (!algorithm) {
    res.status(404);
    throw new Error("Algorithm not found");
  }

  if (req.user.role !== "admin") {
    res.status(403);
    throw new Error("Not authorized to delete this algorithm");
  }

  algorithm.isDeleted = true;
  algorithm.deletedAt = Date.now();
  algorithm.deletedBy = req.user._id;

  await algorithm.save();

  res.json({ message: "Algorithm soft-deleted successfully" });
});

const voteAlgorithm = asyncHandler(async (req, res) => {
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

  const algorithm = await Algorithm.findOne({ slug: req.params.slug });
  if (!algorithm) {
    res.status(404);
    throw new Error("Algorithm not found");
  }

  // Ensure vote arrays exist before checking includes
  const upvotedBy = algorithm.upvotedBy || [];
  const downvotedBy = algorithm.downvotedBy || [];

  const alreadyUpvoted = upvotedBy.includes(userId);
  const alreadyDownvoted = downvotedBy.includes(userId);

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
        if (!update.$pull) update.$pull = {}; // Initialize if not already
        update.$pull.downvotedBy = userId;
        if (!update.$inc) update.$inc = {}; // Initialize if not already
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
        if (!update.$pull) update.$pull = {}; // Initialize if not already
        update.$pull.upvotedBy = userId;
        if (!update.$inc) update.$inc = {}; // Initialize if not already
        update.$inc.upvotes = -1;
      }
    }
  }

  // Ensure update object is not empty before updating
  if (Object.keys(update).length === 0) {
      return res.json({ message: "No changes made", algorithm });
  }

  const updatedAlgorithm = await Algorithm.findOneAndUpdate(
    { slug: req.params.slug },
    update,
    { new: true }
  );

  res.json({
    message,
    algorithm: updatedAlgorithm,
  });
});


const getAllCategories = (req, res) => {
  try {
    const sortedCategories = [...ALGORITHM].sort();
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

const searchAlgorithms = asyncHandler(async (req, res) => {
  let {
    category = "",
    q = "",
    difficulty = "",
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

  if (difficulty) filters.difficulty = difficulty;

  if (tags) {
    const tagList = tags.split(",").map((tag) => tag.trim());
    filters.tags = { $in: tagList };
  }

  // Add isPublished filter if user is not admin
  if (req.user?.role !== 'admin') {
      filters.isPublished = true;
  }

  const total = await Algorithm.countDocuments(filters);

  const algorithms = await Algorithm.find(
    filters,
    q ? { score: { $meta: "textScore" } } : {}
  )
    .select("title slug category intuition description")
    .sort(q ? { score: { $meta: "textScore" } } : { createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(parseInt(limit));

  res.json({
    total,
    results: algorithms,
    pages: Math.ceil(total / limit),
    currentPage: parseInt(page),
  });
});


const getContributors = asyncHandler(async (req, res) => {
  const item = await Algorithm.findOne({ slug: req.params.slug })
    .populate("contributors.user", "username avatarUrl")
    .select("contributors");

  if (!item) {
    res.status(404);
    throw new Error("Algorithm not found");
  }

  res.json(item.contributors);
});

module.exports = {
  createAlgorithm,
  getAllAlgorithms,
  getAlgorithmsForList,
  getAlgorithmBySlug,
  updateAlgorithm,
  deleteAlgorithm,
  voteAlgorithm,
  getAllCategories,
  searchAlgorithms,
  addAlgorithmCode,
  getContributors,
};