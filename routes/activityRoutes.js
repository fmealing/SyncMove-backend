const express = require("express");
const router = express.Router();
const activityController = require("../controllers/activityController");
const authenticateToken = require("../middleware/authMiddleware");

// Activity CRUD routes
router.post("/", authenticateToken, activityController.createActivity); // Create new activity
router.get("/", authenticateToken, activityController.getAllActivities); // Get all activities
router.get("/:id", authenticateToken, activityController.getActivityById); // Get specific activity
router.put("/:id", authenticateToken, activityController.updateActivity); // Update activity
router.delete("/:id", authenticateToken, activityController.deleteActivity); // Delete activity

module.exports = router;
