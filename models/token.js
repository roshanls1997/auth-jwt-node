const mongoose = require("mongoose");

const tokenSchema = mongoose.Schema({
  user_id: { type: String, required: true },
  access_token: { type: String, required: true },
  refresh_token: { type: String, required: true },
});

module.exports = mongoose.model("tokens", tokenSchema);
