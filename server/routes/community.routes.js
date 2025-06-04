const express = require("express");
const router = express.Router();
const communityController = require("../controllers/community.controller");

// Public routes
router.get("/top-contributors", communityController.getTopContributors);
router.get("/top-feedback", communityController.getTopFeedback);

module.exports = router;