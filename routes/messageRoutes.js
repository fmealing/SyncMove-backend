const express = require("express");
const router = express.Router();
const messageController = require("../controllers/messageController");
const authenticateToken = require("../middleware/authMiddleware");

// Messaging Routes
router.post("/", authenticateToken, messageController.sendMessage); // Send message
router.get(
  "/:matchId",
  authenticateToken,
  messageController.getMessagesByMatchId
); // Get all messages

module.exports = router;
