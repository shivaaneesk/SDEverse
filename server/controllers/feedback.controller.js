const asyncHandler = require("express-async-handler");
const Feedback = require("../models/feedback.model");
const Notification = require("../models/notification.model");
const User = require("../models/user.model");

const submitFeedback = asyncHandler(async (req, res) => {
  const {
    type,
    title,
    description,
    severity,
    pageUrl,
    screenshotUrl,
    deviceInfo,
  } = req.body;

  if (!type || !title || !description) {
    res.status(400);
    throw new Error("Required fields are missing");
  }

  const feedback = await Feedback.create({
    user: req.user._id,
    type,
    title,
    description,
    severity,
    pageUrl,
    screenshotUrl,
    deviceInfo,
  });

  const admins = await User.find({ role: "admin" });

  const notifications = admins.map((admin) => ({
    recipient: admin._id,
    sender: req.user._id,
    type: "feedback",
    message: `New ${type} feedback: ${title}`,
    link: `/admin/feedback/${feedback._id}`,
    preview: description.slice(0, 100),
  }));

  await Notification.insertMany(notifications);

  res.status(201).json({ message: "Feedback submitted", feedback });
});

const getAllFeedback = asyncHandler(async (req, res) => {
  const {
    status,
    type,
    severity,
    page = 1,
    limit = 10,
    search,
  } = req.query;

  const query = {};

  // Optional filters
  if (status) query.status = status;
  if (type) query.type = type;
  if (severity) query.severity = severity;

  // Optional search by title or description
  if (search) {
    query.$or = [
      { title: new RegExp(search, "i") },
      { description: new RegExp(search, "i") },
    ];
  }

  const pageNum = parseInt(page, 10) || 1;
  const pageSize = parseInt(limit, 10) || 10;

  const total = await Feedback.countDocuments(query);

  const feedbacks = await Feedback.find(query)
    .populate("user", "name email") // Populates user name and email
    .sort({ createdAt: -1 }) // Latest feedback first
    .skip((pageNum - 1) * pageSize)
    .limit(pageSize);

  res.status(200).json({
    feedbacks,
    pagination: {
      currentPage: pageNum,
      totalPages: Math.ceil(total / pageSize),
      totalItems: total,
      pageSize,
    },
  });
});

module.exports = {
    submitFeedback,getAllFeedback
};