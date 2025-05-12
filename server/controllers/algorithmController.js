const asyncHandler = require("express-async-handler");
const Algorithm = require("../models/Algorithm");
const generateUniqueSlug = require("../utils/generateUniqueSlug");
const categoriesList = require("../utils/categories");

const createAlgorithm = async (req, res) => {
  try {
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
      return res.status(400).json({ message: "Category must be a non-empty array." });
    }

    const invalid = category.filter((cat) => !categoriesList.includes(cat));
    if (invalid.length > 0) {
      return res.status(400).json({ message: `Invalid categories: ${invalid.join(", ")}` });
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
    });

    const createdAlgorithm = await algorithm.save();

    res.status(201).json(createdAlgorithm);
  } catch (error) {
    res.status(500).json({ message: "Failed to create algorithm", error: error.message });
  }
};

// Other handlers remain unchanged except for ensuring "problemStatement" is handled properly in update

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

  const filters = {};
  if (category) filters.category = category;
  if (difficulty) filters.difficulty = difficulty;
  if (search) filters.$text = { $search: search };

  const algorithms = await Algorithm.find(filters)
    .skip((page - 1) * limit)
    .limit(limit)
    .sort({ createdAt: -1 });

  const total = await Algorithm.countDocuments(filters);

  res.json({
    algorithms,
    total,
    pages: Math.ceil(total / limit),
    currentPage: page,
  });
});

const getAlgorithmBySlug = asyncHandler(async (req, res) => {
  const algorithm = await Algorithm.findOne({ slug: req.params.slug });

  if (!algorithm) {
    res.status(404);
    throw new Error("Algorithm not found");
  }

  const user = req.user;

  if (user) {
    const alreadyViewedToday = algorithm.viewedBy?.some(
      (entry) =>
        entry.userId.toString() === user._id.toString() &&
        new Date(entry.viewedAt).toDateString() === new Date().toDateString()
    );

    if (!alreadyViewedToday) {
      algorithm.views += 1;
      algorithm.viewedBy.push({ userId: user._id, viewedAt: new Date() });
      await algorithm.save();
    }
  } else {
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

  await Algorithm.deleteOne({ _id: algorithm._id });

  res.json({ message: "Algorithm removed successfully" });
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

  const alreadyUpvoted = algorithm.upvotedBy.includes(userId);
  const alreadyDownvoted = algorithm.downvotedBy.includes(userId);

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

  // Apply the update only if there's a change
  if (!update.$inc && !update.$addToSet && !update.$pull) {
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
    res.status(200).json({
      success: true,
      categories: categoriesList,
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
  const {
    q = "",
    category = "",
    difficulty = "",
    tags = "",
    page = 1,
    limit = 10,
  } = req.query;

  const filters = {};

  if (q) filters.$text = { $search: q };
  if (category) {
    const categories = category.split(",").map((c) => c.trim());
    filters.category = { $in: categories };
  }
  if (difficulty) filters.difficulty = difficulty;
  if (tags) {
    const tagList = tags.split(",").map((tag) => tag.trim());
    filters.tags = { $in: tagList };
  }

  const total = await Algorithm.countDocuments(filters);

  const algorithms = await Algorithm.find(
    filters,
    q ? { score: { $meta: "textScore" } } : {}
  )
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

module.exports = {
  createAlgorithm,
  getAllAlgorithms,
  getAlgorithmBySlug,
  updateAlgorithm,
  deleteAlgorithm,
  voteAlgorithm,
  getAllCategories,
  searchAlgorithms,
};
