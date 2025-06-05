const express = require("express");
const router = express.Router();

const {
  createDataStructure,
  getAllDataStructures,
  getDataStructureBySlug,
  updateDataStructure,
  deleteDataStructure,
  voteDataStructure,
  getAllCategories,
  searchDataStructures,
  addOperationImplementation,
  getContributors,
} = require("../controllers/dataStructure.controller");

const { protect, admin } = require("../middleware/auth.middleware");
const validateDataStructure = require("../middleware/validateDataStructure");

// --- Public routes ---
router.get("/", getAllDataStructures); // List with filters/pagination
router.get("/categories", getAllCategories); // Fetch category list
router.get("/search", searchDataStructures); // Filtered search
router.get("/:slug", getDataStructureBySlug); // Single data structure by slug

// --- Protected routes ---
router.post("/", protect, validateDataStructure, createDataStructure); // Create
router.put("/:slug", protect, validateDataStructure, updateDataStructure); // Update
router.delete("/:slug", protect, admin, deleteDataStructure); // Delete
router.post("/:slug/code", protect, addOperationImplementation); // or addOperationImplementation
router.get("/:slug/contributors", getContributors);

// --- Voting ---
router.post("/:slug/vote", protect, voteDataStructure);

module.exports = router;
