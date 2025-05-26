const asyncHandler = require("express-async-handler");
const Comment = require("../models/comment.model");
const Algorithm = require("../models/algorithm.model");
const Proposal = require("../models/proposal.model");
const User = require("../models/user.model");
const Notification = require("../models/notification.model");

// Helper to extract mentioned usernames like @johnDoe
const extractMentions = (text) => {
  const matches = text.match(/@(\w+)/g) || [];
  return matches.map((m) => m.substring(1)); // Remove @
};

const addComment = asyncHandler(async (req, res) => {
  const { parentType, parentId, text, codeRef } = req.body;

  if (!["Algorithm", "Proposal"].includes(parentType)) {
    res.status(400);
    throw new Error("Invalid parent type");
  }

  const parent = await (parentType === "Algorithm"
    ? Algorithm
    : Proposal
  ).findById(parentId);
  if (!parent) {
    res.status(404);
    throw new Error(`${parentType} not found`);
  }

  const mentionedUsernames = extractMentions(text);
  // Check for @sdeverse and notify all admins
  if (mentionedUsernames.includes("sdeverse")) {
    const admins = await User.find({ role: "admin" });

    const adminNotifications = admins.map((admin) => ({
      recipient: admin._id,
      sender: req.user._id, // <--- Add sender here
      type: "platform_request",
      message: `${
        req.user.name
      } mentioned @sdeverse in a ${parentType.toLowerCase()} comment: "${text.slice(
        0,
        100
      )}..."`,
      link: `/${parentType.toLowerCase()}s/${parentId}`,
    }));

    await Notification.insertMany(adminNotifications);
  }

  const mentionedUsers = await User.find({
    username: { $in: mentionedUsernames },
  });

  const newComment = new Comment({
    parentType,
    parentId,
    user: req.user._id,
    text,
    codeRef,
    mentions: mentionedUsers.map((user) => user._id),
  });

  const createdComment = await newComment.save();

  // Create notifications for mentions
  const notifications = mentionedUsers.map((user) => ({
    recipient: user._id,
    sender: req.user._id,
    type: "mention",
    commentId: createdComment._id,
  }));

  if (notifications.length > 0) {
    await Notification.insertMany(notifications);
  }

  res.status(201).json(createdComment);
});

const getCommentsByParent = asyncHandler(async (req, res) => {
  const { parentType, parentId } = req.params;

  if (!["Algorithm", "Proposal"].includes(parentType)) {
    res.status(400);
    throw new Error("Invalid parent type");
  }

  let parent;
  if (parentType === "Algorithm") {
    parent = await Algorithm.findById(parentId);
  } else if (parentType === "Proposal") {
    parent = await Proposal.findById(parentId);
  }

  if (!parent) {
    res.status(404);
    throw new Error(`${parentType} not found`);
  }

  const comments = await Comment.find({ parentType, parentId })
    .populate("user", "name")
    .lean();

  res.json(comments);
});

const addReplyToComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const { text } = req.body;

  const comment = await Comment.findById(commentId);
  if (!comment) {
    res.status(404);
    throw new Error("Comment not found");
  }
  const parentType = comment.parentType;
  const parentId = comment.parentId;
  const mentionedUsernames = extractMentions(text);
  // Check for @sdeverse and notify all admins
  if (mentionedUsernames.includes("sdeverse")) {
    const admins = await User.find({ role: "admin" });

    const adminNotifications = admins.map((admin) => ({
      recipient: admin._id,
      type: "platform_request",
      message: `${
        req.user.name
      } mentioned @sdeverse in a ${parentType.toLowerCase()} comment: "${text.slice(
        0,
        100
      )}..."`,
      link: `/${parentType.toLowerCase()}s/${parentId}`, // Link to the related Algorithm/Proposal
    }));

    await Notification.insertMany(adminNotifications);
  }

  const mentionedUsers = await User.find({
    username: { $in: mentionedUsernames },
  });

  const newReply = {
    user: req.user._id,
    text,
    mentions: mentionedUsers.map((user) => user._id),
  };

  comment.replies.push(newReply);
  await comment.save();

  // Create notifications for mentions in replies
  const notifications = mentionedUsers.map((user) => ({
    recipient: user._id,
    sender: req.user._id,
    type: "mention",
    commentId: comment._id,
  }));

  if (notifications.length > 0) {
    await Notification.insertMany(notifications);
  }

  res
    .status(201)
    .json({ message: "Reply added successfully", replies: comment.replies });
});

const deleteComment = asyncHandler(async (req, res) => {
  const comment = await Comment.findById(req.params.id);

  if (!comment) {
    res.status(404);
    throw new Error("Comment not found");
  }

  if (
    comment.user.toString() !== req.user._id.toString() &&
    req.user.role !== "admin"
  ) {
    res.status(403);
    throw new Error("Not authorized to delete this comment");
  }

  // Delete the comment by ID
  await Comment.findByIdAndDelete(req.params.id);

  res.json({ message: "Comment deleted successfully" });
});


module.exports = {
  addComment,
  addReplyToComment,
  getCommentsByParent,
  deleteComment,
};
