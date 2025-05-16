const express = require("express");
const router = express.Router();
const {
  createProposal,
  getAllProposals,
  getProposalBySlug,
  updateProposal,
  reviewProposal,
  deleteProposal,
} = require("../controllers/proposal.controller");

const { protect, admin } = require("../middleware/auth.middleware");
const validateProposal = require("../middleware/validateProposal");

// --- Public ---
router.get("/slug/:slug", getProposalBySlug); // View single proposal by slug

// --- Authenticated Users ---
router.post("/newproposal", protect, validateProposal("create"), createProposal); // Create proposal
router.patch("/:slug", protect, validateProposal("update"), updateProposal); // Update proposal
router.get("/", protect, getAllProposals); // Get all proposals for user/admin

// --- Admin Actions ---
router.put("/review/:slug", protect, admin, reviewProposal); // Approve/reject
router.delete("/:slug", protect, admin, deleteProposal); // Soft delete

module.exports = router;
