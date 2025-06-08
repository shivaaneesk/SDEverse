const express = require("express");
const router = express.Router();

const {
  createDataStructure,
  getAllDataStructures,
  getAllDataStructuresForList,
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

router.get("/", getAllDataStructures);
router.get("/list", getAllDataStructuresForList);
router.get("/categories", getAllCategories);
router.get("/search", searchDataStructures);
router.get("/:slug", getDataStructureBySlug);

router.post("/", protect, validateDataStructure, createDataStructure);
router.put("/:slug", protect, validateDataStructure, updateDataStructure);
router.delete("/:slug", protect, admin, deleteDataStructure);
router.post("/:slug/code", protect, addOperationImplementation);
router.get("/:slug/contributors", getContributors);

router.post("/:slug/vote", protect, voteDataStructure);

module.exports = router;
