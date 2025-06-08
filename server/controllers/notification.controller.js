const asyncHandler = require("express-async-handler");
const Notification = require("../models/notification.model");
const User = require("../models/user.model");

const colorMap = {
  mention: "blue",
  comment: "green",
  reply: "purple",
  platform_request: "red",
  algorithm: "teal",
  default: "white",
};

const getUserNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({ recipient: req.user._id })
    .sort({ createdAt: -1 })
    .populate("sender", "username");

  const formatted = notifications.map((n) => ({
    _id: n._id,
    recipient: n.recipient,
    sender: {
      _id: n.sender?._id,
      username: n.sender?.username || "Someone",
    },
    type: n.type,
    read: n.read,
    createdAt: n.createdAt,
    updatedAt: n.updatedAt,
    message: n.message || "You have a new notification",
    preview: n.preview || null,
    link: n.link || null,
    color: colorMap[n.type] || colorMap.default,
  }));

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

const broadcastNotification = asyncHandler(async (req, res) => {
  const { type, message, link, preview } = req.body;

  if (!type || !message) {
    res.status(400);
    throw new Error("Type and message are required");
  }

  const users = await User.find({}, "_id");

  const notifications = users.map((user) => ({
    recipient: user._id,
    sender: req.user._id,
    type,
    message,
    link: link || null,
    preview: preview || null,
  }));

  await Notification.insertMany(notifications);

  res.status(201).json({ message: `Broadcast sent to ${users.length} users.` });
});

const markAllNotificationsRead = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const result = await Notification.updateMany(
    { recipient: userId, read: false },
    { $set: { read: true } }
  );

  if (result.modifiedCount === 0) {
    return res
      .status(200)
      .json({ message: "No unread notifications to mark as read." });
  }

  res.json({
    message: `Successfully marked ${result.modifiedCount} notifications as read.`,
  });
});

module.exports = {
  getUserNotifications,
  markNotificationRead,
  broadcastNotification,
  markAllNotificationsRead,
};
