const express = require("express");
const router = express.Router();
const { submitFeedback,getAllFeedback  } = require("../controllers/feedback.controller");
const { protect,admin } = require("../middleware/auth.middleware");

router.post("/", protect, submitFeedback);
router.get("/feedback", protect, admin, getAllFeedback);


module.exports = router;
