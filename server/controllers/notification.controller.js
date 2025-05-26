const asyncHandler = require("express-async-handler");
const Notification = require("../models/notification.model");

// Get current user's notifications
const getUserNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({ recipient: req.user._id })
    .sort({ createdAt: -1 })
    .populate("sender", "username")
    .populate("commentId", "text");

  const formatted = notifications.map((n) => {
    let message = "";
    let link = null;
    let preview = n.commentId?.text?.slice(0, 100);

    switch (n.type) {
      case "mention":
        message = `@${n.sender.username} mentioned you in a comment`;
        break;
      case "comment":
        message = `@${n.sender.username} commented on your post`;
        break;
      case "reply":
        message = `@${n.sender.username} replied to your comment`;
        break;
      case "platform_request":
        message = `@${n.sender.username} submitted a platform request`;
        link = "/"; // or any safe fallback
        preview = null;
        break;
      default:
        message = "You have a new notification";
    }

    if (n.commentId) {
      const { parentType, parentId, _id: commentId } = n.commentId;
      if (parentType === "algorithm") {
        link = `/algorithms/${parentId}?commentId=${commentId}`;
      } else if (parentType === "proposal") {
        link = `/proposals/${parentId}?commentId=${commentId}`;
      }
    }

    return {
      ...n.toObject(),
      message,
      link,
      preview,
    };
  });

  res.json(formatted);
});

// Mark a notification as read
const markNotificationRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findById(req.params.id);
  if (!notification) {
    res.status(404);
    throw new Error("Notification not found");
  }

  if (notification.recipient.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("Not authorized");
  }

  notification.read = true;
  await notification.save();

  res.json({ message: "Notification marked as read" });
});

module.exports = {
  getUserNotifications,
  markNotificationRead,
};
