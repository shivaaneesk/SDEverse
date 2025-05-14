const express = require("express");
const router = express.Router();
const {
  addComment,
  getCommentsByParent,
  addReplyToComment,
  deleteComment,
} = require("../controllers/comment.controller");
const { protect } = require("../middleware/auth.middleware");

router.get("/:parentType/:parentId", getCommentsByParent);

router.post("/", protect, addComment);
router.post("/:commentId/reply", protect, addReplyToComment);
router.delete("/:id", protect, deleteComment);

module.exports = router;
