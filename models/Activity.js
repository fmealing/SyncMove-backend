const mongoose = require("mongoose");

const ActivitySchema = new mongoose.Schema(
  {
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true, // Now we require at least two participants
      },
    ],
    activityType: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    // ✅ This needs to be a string with the default value "Unknown"
    location: {
      type: String,
      default: "Unknown",
    },
    dateString: {
      type: String,
      required: true,
      match: /^\d{2}\/\d{2}\/\d{4}$/, // Ensures DD/MM/YYYY format
    },
    timeOfDay: {
      type: String,
      enum: ["morning", "afternoon", "evening"],
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Optional TTL index to automatically delete past activities (7 days)
ActivitySchema.index({ createdAt: 1 }, { expireAfterSeconds: 604800 });

module.exports = mongoose.model("Activity", ActivitySchema);
