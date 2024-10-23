const express = require("express");
const router = express.Router();
const notificationController = require("../controllers/notificationController");
const authenticateToken = require("../middleware/authMiddleware");

// Notification Routes
router.get("/", authenticateToken, notificationController.getUserNotifications); // Get all notifications for authenticated user
router.put(
  "/:notificationId/read",
  authenticateToken,
  notificationController.markAsRead
); // Mark notification as read
router.post("/", authenticateToken, notificationController.createNotification); // Create a new notification

// Route for deleting a notification by ID
router.delete(
  "/:notificationId",
  authenticateToken,
  notificationController.deleteNotification
); // Delete a notification by ID

// Admin route to get all notifications
router.get("/all", notificationController.getAllNotifications); // Get all notifications for admin

module.exports = router;
