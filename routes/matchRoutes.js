const express = require("express");
const router = express.Router();
const matchController = require("../controllers/matchController");
const authenticateToken = require("../middleware/authMiddleware");

// Match Routes
router.post("/create", authenticateToken, matchController.createMatch); // Create new match
router.get("/", authenticateToken, matchController.getUserMatches); // Get all matches for authenticated user
router.get("/:matchId", authenticateToken, matchController.getMatchById); // Get specific match
router.put("/:matchId", authenticateToken, matchController.updateMatchStatus); // Update match status

// Routes for accepting and declining a match
router.put("/:matchId/accept", authenticateToken, matchController.acceptMatch); // Accept a match
router.put(
  "/:matchId/decline",
  authenticateToken,
  matchController.declineMatch
); // Decline a match

router.get(
  "/user/:userId",
  authenticateToken,
  matchController.getMatchesForSpecificUser
); // Get all matches for a specific user

module.exports = router;
