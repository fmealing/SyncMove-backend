const mongoose = require("mongoose");

const ActivitySchema = new mongoose.Schema(
  {
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true, // Index for fast lookup by creator
    },
    activityType: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    location: {
      type: { type: String, default: "Point" },
      coordinates: {
        type: [Number],
        required: true,
        index: "2dsphere", // Geospatial index for location-based queries
      },
    },
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    dateString: {
      type: String,
      required: true,
      match: /^\d{2}\/\d{2}\/\d{4}$/, // Ensures DD/MM/YYYY format
    },
    timeOfDay: {
      type: String,
      enum: ["Morning", "Afternoon", "Evening"],
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Optional TTL index to automatically delete past activities (set to 7 days here)
ActivitySchema.index({ createdAt: 1 }, { expireAfterSeconds: 604800 });

module.exports = mongoose.model("Activity", ActivitySchema);
