const mongoose = require("mongoose");

const replySchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    text: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const commentSchema = new mongoose.Schema(
  {
    parentType: {
      type: String,
      enum: ["Algorithm", "Contribution"],
      required: true,
    },
    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    text: { type: String, required: true },
    codeRef: { type: String }, // e.g. \"line 3 in JS snippet\"
    replies: [replySchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Comment", commentSchema);
