const mongoose = require("mongoose");

const commentsSchema = new mongoose.Schema({
  commentId: {
    type: String,
    required: true,
    unique: true
  },
  postId: {
    type: String,
    required: true,
  },
  userId: {
    type: String,
    required: true,
  },
  nickname: {
    type: String,
    required: true,
  },
  content: {
    type: String,
  },
  password: {
    type: String,
  },
  createdAt: {
    type: Date
  },
  updatedAt: {
    type: Date,
  },
});

module.exports = mongoose.model("Comments", commentsSchema);