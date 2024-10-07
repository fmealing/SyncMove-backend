const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  }, // Hashed
  fullName: {
    type: String,
    required: true,
  },
  profilePicture: {
    type: String,
    default: "", // TODO: change this
  }, // URL from Cloudinary
  activityType: {
    type: String,
    enum: ["running", "cycling", "yoga", "other"],
  },
  fitnessGoals: {
    type: String,
    enum: ["weight loss", "endurance", "muscle gain", "general fitness"],
  },
  experienceLevel: {
    type: Number,
    min: 1,
    max: 5,
  }, // Ordinal scale
  location: {
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
  },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("User", UserSchema);
