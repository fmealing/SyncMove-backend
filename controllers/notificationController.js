// Added matchId to the Notification model and createNotification controller

const Notification = require("../models/Notification");

// Get all notifications for authenticated user
exports.getUserNotifications = async (req, res) => {
  const userId = req.user.id; // Use req.user.id to get the userId from the authenticated user

  try {
    // Find all notifications where the "user" field matches the authenticated user's ID
    const notifications = await Notification.find({ user: userId }).sort({
      createdAt: -1, // Sort by newest first
    });

    if (!notifications || notifications.length === 0) {
      return res.status(404).json({ message: "No notifications found" });
    }

    res.status(200).json({ data: notifications });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to retrieve notifications", error });
  }
};

// Mark a notification as read
exports.markAsRead = async (req, res) => {
  const { notificationId } = req.params;

  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, user: req.user.id },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    res
      .status(200)
      .json({ message: "Notification marked as read", data: notification });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to mark notification as read", error });
  }
};

// Create a new notification
exports.createNotification = async (req, res) => {
  const { userId, senderId, type, content, matchId } = req.body;

  try {
    const newNotification = await Notification.create({
      user: userId, // The recipient of the notification
      sender: senderId, // The sender of the notification
      matchId,
      type,
      content,
    });

    await newNotification.save();
    res.status(201).json({
      message: "Successfully created new Notification",
      data: newNotification,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to create notification", error });
  }
};

// Get all notifications
exports.getAllNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find().sort({ createdAt: -1 });

    res.status(200).json({ data: notifications });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to retrieve notifications", error });
  }
};

// Delete notification by ID
exports.deleteNotification = async (req, res) => {
  const { notificationId } = req.params;

  try {
    const notification = await Notification.findOneAndDelete({
      _id: notificationId,
      user: req.user.id, // Ensure only the owner can delete the notification
    });

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    return res
      .status(200)
      .json({ message: "Notification deleted successfully" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Failed to delete notification", error });
  }
};
