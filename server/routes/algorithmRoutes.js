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
} = require("../controllers/algorithmController");
const { protect, admin } = require("../middleware/authMiddleware");

// Public routes
router.get("/", getAllAlgorithms); // Get all algorithms with filters and pagination


// Route to fetch all categories
router.get("/categories", getAllCategories);
// Search algorithms with filters
router.get("/search", searchAlgorithms);

router.get("/:slug", getAlgorithmBySlug); // Get algorithm by slug

// Protected routes
router.post("/", protect, createAlgorithm); // Create a new algorithm (Admin or Owner)
router.put("/:slug", protect, updateAlgorithm); // Update algorithm (Admin or Owner)
router.delete("/:slug", protect, admin, deleteAlgorithm); // Delete algorithm (Admin)

// Upvote and Downvote
router.post("/:slug/vote", protect, voteAlgorithm);
module.exports = router;
