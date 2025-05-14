const express = require("express");
const router = express.Router();

const {
  createAlgorithm,
  getAllAlgorithms,
  getAlgorithmBySlug,
  updateAlgorithm,
  deleteAlgorithm,
  voteAlgorithm,
  getAllCategories,
  searchAlgorithms,
} = require("../controllers/algorithm.controller");

const { protect, admin } = require("../middleware/auth.middleware");
const validateAlgorithm = require("../middleware/validateAlgorithm");

// --- Public routes ---
router.get("/", getAllAlgorithms); // List with filters/pagination
router.get("/categories", getAllCategories); // Fetch category list
router.get("/search", searchAlgorithms); // Filtered search
router.get("/:slug", getAlgorithmBySlug); // Single algorithm by slug

// --- Protected routes ---
router.post("/", protect, validateAlgorithm, createAlgorithm); // Create
router.put("/:slug", protect, validateAlgorithm, updateAlgorithm); // Update
router.delete("/:slug", protect, admin, deleteAlgorithm); // Delete

// --- Voting ---
router.post("/:slug/vote", protect, voteAlgorithm);

module.exports = router;
