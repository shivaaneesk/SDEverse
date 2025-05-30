const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: ["mention", "comment", "reply", "platform_request"],
      required: true,
    },
    commentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
    },
    read: { type: Boolean, default: false },
    message: { type: String }, // For custom platform messages
    link: { type: String }, // For linking to comment
    preview: { type: String }, // Short preview of comment
  },
  { timestamps: true }
);


module.exports = mongoose.model("Notification", notificationSchema);
