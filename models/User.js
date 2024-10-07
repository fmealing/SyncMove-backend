const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      index: true, // Optimized for fast email-based lookup
    },
    password: {
      type: String,
      required: true,
    },
    fullName: {
      type: String,
      required: true,
    },
    profilePicture: {
      type: String,
      default: "",
    },
    activityType: {
      type: String,
      enum: ["running", "cycling", "yoga", "other"],
      index: true, // Index for faster querying on this field
    },
    fitnessGoals: {
      type: String,
      enum: ["weight loss", "endurance", "muscle gain", "general fitness"],
    },
    experienceLevel: {
      type: Number,
      min: 1,
      max: 5,
    },
    location: {
      type: { type: String, default: "Point" },
      coordinates: {
        type: [Number], // [longitude, latitude]
        index: "2dsphere", // Enables geospatial queries for location-based matching
      },
    },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
); // Timestamps will automatically manage createdAt and updatedAt

module.exports = mongoose.model("User", UserSchema);
