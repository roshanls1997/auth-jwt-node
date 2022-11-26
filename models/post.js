const mongoose = require("mongoose");

const postSchema = mongoose.Schema({
  title: { type: String, required: true },
  desc: { type: String, required: true },
  created_by: { type: String, required: true },
  created_by_id: { type: String, required: true },
  created_at: { type: String, required: true, default: Date.now() },
});

module.exports = mongoose.model("posts", postSchema);
