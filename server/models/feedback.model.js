const mongoose = require("mongoose");

const feedbackSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    type: {
      type: String,
      enum: ["bug", "feature_request", "ui_suggestion", "performance", "general"],
      required: true,
    },
    title: { type: String, required: true },
    description: { type: String, required: true },
    severity: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      default: "low",
    },
    pageUrl: { type: String }, // Optional: where the feedback originated
    screenshotUrl: { type: String }, // Optional: frontend can upload and pass image URL
    deviceInfo: {
      browser: String,
      os: String,
      screen: String,
    },
    status: {
      type: String,
      enum: ["open", "in_progress", "resolved", "closed"],
      default: "open",
    },
    internalNotes: { type: String }, // Admins can use this
  },
  { timestamps: true }
);

module.exports = mongoose.model("Feedback", feedbackSchema);
