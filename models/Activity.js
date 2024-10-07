const mongoose = require("mongoose");

const ActivitySchema = new mongoose.Schema({
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  activityType: {
    type: String,
    required: true, // Type of activity
  },
  description: {
    type: string,
  },
  location: {
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
  },
  participants: [{ type: mongoose.Schmema.Types.ObjectId, ref: "User" }],
  data: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Activity", ActivitySchema);
