const asyncHandler = require("express-async-handler");
const Comment = require("../models/Comment");
const Algorithm = require("../models/Algorithm");
const Contribution = require("../models/Contribution");

const addComment = asyncHandler(async (req, res) => {
  const { parentType, parentId, text, codeRef } = req.body;

  if (!["Algorithm", "Contribution"].includes(parentType)) {
    res.status(400);
    throw new Error("Invalid parent type");
  }

  let parent;
  if (parentType === "Algorithm") {
    parent = await Algorithm.findById(parentId);
  } else if (parentType === "Contribution") {
    parent = await Contribution.findById(parentId);
  }

  if (!parent) {
    res.status(404);
    throw new Error(`${parentType} not found`);
  }

  const newComment = new Comment({
    parentType,
    parentId,
    user: req.user._id,
    text,
    codeRef,
  });

  const createdComment = await newComment.save();

  res.status(201).json(createdComment);
});

const getCommentsByParent = asyncHandler(async (req, res) => {
  const { parentType, parentId } = req.params;

  if (!["Algorithm", "Contribution"].includes(parentType)) {
    res.status(400);
    throw new Error("Invalid parent type");
  }

  let parent;
  if (parentType === "Algorithm") {
    parent = await Algorithm.findById(parentId);
  } else if (parentType === "Contribution") {
    parent = await Contribution.findById(parentId);
  }

  if (!parent) {
    res.status(404);
    throw new Error(`${parentType} not found`);
  }

  const comments = await Comment.find({ parentType, parentId });

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

  const newReply = {
    user: req.user._id,
    text,
  };

  comment.replies.push(newReply);
  await comment.save();

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

  await comment.remove();

  res.json({ message: "Comment deleted successfully" });
});

module.exports = {
  addComment,
  getCommentsByParent,
  addReplyToComment,
  deleteComment,
};
