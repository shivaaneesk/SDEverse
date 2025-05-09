const asyncHandler = require("express-async-handler");
const Contribution = require("../models/Contribution");
const Algorithm = require("../models/Algorithm");

const addContribution = asyncHandler(async (req, res) => {
  const { algorithmId, language, code } = req.body;

  const algorithm = await Algorithm.findById(algorithmId);
  if (!algorithm) {
    res.status(404);
    throw new Error("Algorithm not found");
  }

  const contribution = new Contribution({
    algorithm: algorithmId,
    language,
    code,
    contributor: req.user._id,
  });

  const createdContribution = await contribution.save();
  algorithm.contributions.push(createdContribution._id);
  await algorithm.save();

  res.status(201).json(createdContribution);
});

const getContributionsByAlgorithm = asyncHandler(async (req, res) => {
  const algorithm = await Algorithm.findById(req.params.algorithmId);

  if (!algorithm) {
    res.status(404);
    throw new Error("Algorithm not found");
  }

  const contributions = await Contribution.find({
    algorithm: req.params.algorithmId,
  });

  res.json(contributions);
});

const upvoteContribution = asyncHandler(async (req, res) => {
  const contribution = await Contribution.findById(req.params.id);
  const userId = req.user._id.toString();

  if (!contribution) {
    res.status(404);
    throw new Error("Contribution not found");
  }

  if (contribution.upvotedBy.includes(userId)) {
    res.status(400);
    throw new Error("You have already upvoted this contribution");
  }

  contribution.downvotedBy = contribution.downvotedBy.filter(
    (id) => id.toString() !== userId
  );
  contribution.upvotedBy.push(userId);
  await contribution.save();

  res.json({
    message: "Contribution upvoted successfully",
    upvotes: contribution.upvotedBy.length,
    downvotes: contribution.downvotedBy.length,
  });
});

const downvoteContribution = asyncHandler(async (req, res) => {
  const contribution = await Contribution.findById(req.params.id);
  const userId = req.user._id.toString();

  if (!contribution) {
    res.status(404);
    throw new Error("Contribution not found");
  }

  if (contribution.downvotedBy.includes(userId)) {
    res.status(400);
    throw new Error("You have already downvoted this contribution");
  }

  contribution.upvotedBy = contribution.upvotedBy.filter(
    (id) => id.toString() !== userId
  );
  contribution.downvotedBy.push(userId);
  await contribution.save();

  res.json({
    message: "Contribution downvoted successfully",
    upvotes: contribution.upvotedBy.length,
    downvotes: contribution.downvotedBy.length,
  });
});

const deleteContribution = asyncHandler(async (req, res) => {
  const contribution = await Contribution.findById(req.params.id);

  if (!contribution) {
    res.status(404);
    throw new Error("Contribution not found");
  }

  if (
    contribution.contributor.toString() !== req.user._id.toString() &&
    req.user.role !== "admin"
  ) {
    res.status(403);
    throw new Error("Not authorized to delete this contribution");
  }

  await contribution.remove();

  const algorithm = await Algorithm.findById(contribution.algorithm);
  if (algorithm) {
    algorithm.contributions = algorithm.contributions.filter(
      (contribId) => contribId.toString() !== contribution._id.toString()
    );
    await algorithm.save();
  }

  res.json({ message: "Contribution deleted successfully" });
});

module.exports = {
  addContribution,
  getContributionsByAlgorithm,
  upvoteContribution,
  downvoteContribution,
  deleteContribution,
};
