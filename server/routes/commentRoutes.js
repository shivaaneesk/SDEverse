const express = require('express');
const router = express.Router();
const {
  addComment,
  getCommentsByParent,
  addReplyToComment,
  deleteComment,
} = require('../controllers/commentController');
const { protect } = require('../middleware/authMiddleware');

// Public routes
router.get('/:parentType/:parentId', getCommentsByParent); // Get comments by parent (algorithm or contribution)

// Protected routes
router.post('/', protect, addComment); // Add a new comment
router.post('/:commentId/reply', protect, addReplyToComment); // Reply to a comment
router.delete('/:id', protect, deleteComment); // Delete a comment (Owner or Admin)

module.exports = router;
