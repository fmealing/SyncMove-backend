const express = require("express");
const router = express.Router();
const notificationController = require("../controllers/notificationController");
const authenticateToken = require("../middleware/authMiddleware");

// Notification Routes
router.get("/", authenticateToken, notificationController.getUserNotifications);

router.put(
  "/:notificationId/read",
  authenticateToken,
  notificationController.markAsRead
); // Mark notification as read
router.post("/", authenticateToken, notificationController.createNotification); // Create a new notification

router.get("/all", notificationController.getAllNotifications);

module.exports = router;
