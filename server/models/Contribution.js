const mongoose = require('mongoose');

const contributionSchema = new mongoose.Schema({
  algorithm:   { type: mongoose.Schema.Types.ObjectId, ref: 'Algorithm', required: true },
  language:    { type: String, required: true, trim: true },
  code:        { type: String, required: true },
  contributor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  upvotedBy:   [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  downvotedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });

module.exports = mongoose.model('Contribution', contributionSchema);