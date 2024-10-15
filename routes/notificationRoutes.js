const express = require("express");
const router = express.Router();
const notificationController = require("../controllers/notificationController");
const authenticateToken = require("../middleware/authMiddleware");

// Notification Routes
router.get("/", authenticateToken, notificationController.getUserNotifications); // Get all notifications
router.put("/:id/read", authenticateToken, notificationController.markAsRead); // Mark notification as read

module.exports = router;
