const express = require("express");
const router = express.Router();
const {
  getUserNotifications,
  markNotificationRead,
  broadcastNotification,
} = require("../controllers/notification.controller");
const { protect,admin  } = require("../middleware/auth.middleware");

router.get("/", protect, getUserNotifications);            // Get current user's notifications
router.put("/:id/read", protect, markNotificationRead);    // Mark a specific notification as read
router.post("/admin/broadcast", protect, admin, broadcastNotification);

module.exports = router;
