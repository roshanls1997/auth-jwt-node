const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  created_at: {
    type: String,
    required: true,
    default: Date.now(),
  },
});

module.exports = mongoose.model("users", userSchema);
