const asyncHandler = require("express-async-handler");
const Notification = require("../models/notification.model");

const getUserNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({ recipient: req.user._id })
    .sort({ createdAt: -1 })
    .populate("sender", "username");

  const formatted = notifications.map((n) => {
    const senderName = n.sender?.username || "Someone";

    let color = "gray";
    let message = "You have a new notification";

    switch (n.type) {
      case "mention":
        message = `@${senderName} mentioned you in a comment`;
        color = "blue";
        break;
      case "comment":
        message = `@${senderName} commented on your post`;
        color = "green";
        break;
      case "reply":
        message = `@${senderName} replied to your comment`;
        color = "purple";
        break;
      case "platform_request":
        message = n.message || `Platform Request from @${senderName}`;
        color = "red";
        break;
    }

    return {
      _id: n._id,
      recipient: n.recipient,
      sender: {
        _id: n.sender?._id,
        username: n.sender?.username,
      },
      type: n.type,
      read: n.read,
      createdAt: n.createdAt,
      updatedAt: n.updatedAt,
      message,
      preview: n.preview || null,
      link: n.link || null,
      color,
    };
  });

  res.json(formatted);
});

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
