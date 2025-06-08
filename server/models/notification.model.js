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
      required: true,
    },
    commentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
    },
    read: { type: Boolean, default: false },
    message: { type: String }, 
    link: { type: String }, 
    preview: { type: String }, 
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notification", notificationSchema);
