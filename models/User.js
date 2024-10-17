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
      enum: ["running", "cycling", "weightlifting", "other"],
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
    isAIUser: {
      type: Boolean,
      default: false, // False for real users, true for AI users
    },
    interactionPattern: {
      type: String,
      enum: ["chatty", "reserved", "motivational", "informational"],
      default: "chatty", // Defines behavior style for AI users
    },
    availability: {
      date: {
        type: String, // Store date as a string in the format DD/MM/YYYY
        validate: {
          validator: function (v) {
            // Regular expression to match DD/MM/YYYY format
            return /^\d{2}\/\d{2}\/\d{4}$/.test(v);
          },
          message: (props) =>
            `${props.value} is not a valid date format! Use DD/MM/YYYY.`,
        },
        required: [true, "Date is required"],
      },
      timeOfDay: {
        type: [String], // e.g., ["morning", "evening"]
        default: ["morning"],
      },
    },
    privacyPreferences: {
      visibility: {
        type: String,
        enum: ["public", "friends", "private"],
        default: "public", // Controls overall profile visibility
      },
      shareLocation: {
        type: Boolean,
        default: true, // Controls whether location is shared
      },
      shareActivity: {
        type: Boolean,
        default: true, // Controls whether activity is shared
      },
    },
    notificationPreferences: {
      notifications: {
        type: Boolean,
        default: true, // Enables or disables notifications
      },
      messages: {
        type: Boolean,
        default: true, // Controls whether message notifications are enabled
      },
      activityReminders: {
        type: Boolean,
        default: true, // Controls whether activity reminders are enabled
      },
      notificationType: {
        type: String,
        enum: ["email", "push"],
        default: "email", // Preferred notification method
      },
    },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);
