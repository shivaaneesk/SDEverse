const express = require("express");
const router = express.Router();
const {
  getUserNotifications,
  markNotificationRead,
} = require("../controllers/notification.controller");
const { protect } = require("../middleware/auth.middleware");

router.get("/", protect, getUserNotifications);            // Get current user's notifications
router.put("/:id/read", protect, markNotificationRead);    // Mark a specific notification as read

module.exports = router;
