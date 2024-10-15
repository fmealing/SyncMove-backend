const Notification = require("../models/notificationModel");

// Get all notifications for authenticated user
exports.getUserNotifications = async (req, res) => {
  const userId = req.user.id;

  try {
    const notifications = await Notification.find({ user: userId }).sort({
      createdAt: -1,
    }); // Sort by newest first

    res.status(200).json({ data: notifications });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to retrieve notifications", error });
  }
};

// Mark a notification as read
exports.markAsRead = async (req, res) => {
  const { id } = req.params;

  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: id, user: req.user.id },
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
