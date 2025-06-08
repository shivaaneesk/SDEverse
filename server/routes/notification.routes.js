const express = require("express");
const router = express.Router();
const {
  getUserNotifications,
  markNotificationRead,
  broadcastNotification,
  markAllNotificationsRead, 
} = require("../controllers/notification.controller");
const { protect, admin } = require("../middleware/auth.middleware");

router.get("/", protect, getUserNotifications);
router.put("/:id/read", protect, markNotificationRead);
router.put("/read-all", protect, markAllNotificationsRead); 
router.post("/admin/broadcast", protect, admin, broadcastNotification);

module.exports = router;