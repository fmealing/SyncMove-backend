const express = require("express");
const router = express.Router();
const conversationController = require("../controllers/conversationController");
const authenticateToken = require("../middleware/authMiddleware");

// Route to fetch all conversations for the authenticated user
router.get("/", authenticateToken, conversationController.getConversations);

module.exports = router;
