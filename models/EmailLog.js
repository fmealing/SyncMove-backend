const mongoose = require("mongoose");

const EmailLogSchema = new mongoose.Schema({
  to: { type: String, required: true },
  subject: { type: String, required: true },
  message: { type: String, required: true },
  status: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("EmailLog", EmailLogSchema);
