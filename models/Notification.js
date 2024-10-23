// TODO: Add a field for matchId. Otherwise, the user can't accept the match_request
// Add the matchId field to the notificationController.js file

const mongoose = require("mongoose");

const NotificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    matchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Match",
    },
    type: {
      type: String,
      enum: ["match_request", "message", "activity_invite", "declined"],
    },
    content: {
      type: String,
      required: true,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Index on user and isRead for fast retrieval of unread notifications
NotificationSchema.index({ user: 1, isRead: 1 });

module.exports = mongoose.model("Notification", NotificationSchema);
