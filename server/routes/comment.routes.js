const express = require("express");
const router = express.Router();
const {
  addComment,
  getCommentsByParent,
  addReplyToComment,
  deleteComment,
} = require("../controllers/comment.controller");
const { protect } = require("../middleware/auth.middleware");

router.post("/", protect, addComment);                             // Add a comment with mention support
router.get("/:parentType/:parentId", getCommentsByParent);         // Get all comments for a parent (Algorithm/Proposal)

router.post("/:commentId/reply", protect, addReplyToComment);      // Add a reply to a comment
router.delete("/:id", protect, deleteComment);                     // Delete a comment (owner or admin)

module.exports = router;
