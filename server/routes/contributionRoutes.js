const express = require('express');
const router = express.Router();
const {
  addContribution,
  getContributionsByAlgorithm,
  upvoteContribution,
  downvoteContribution,
  deleteContribution,
} = require('../controllers/contributionController');
const { protect } = require('../middleware/authMiddleware');

// Public routes
router.get('/:algorithmId', getContributionsByAlgorithm);

// Protected routes
router.post('/', protect, addContribution);
router.post('/:id/upvote', protect, upvoteContribution);
router.post('/:id/downvote', protect, downvoteContribution);
router.delete('/:id', protect, deleteContribution);

module.exports = router;