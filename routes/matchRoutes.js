const express = require("express");
const router = express.Router();
const matchController = require("../controllers/matchController");
const authenticateToken = require("../middleware/authMiddleware");

// Match Routes
router.post("/create", authenticateToken, matchController.createMatch); // Create new match
router.get("/", authenticateToken, matchController.getUserMatches); // Get all matches
router.get("/:matchId", authenticateToken, matchController.getMatchById); // Get specific match
router.put("/:matchId", authenticateToken, matchController.updateMatchStatus); // Update match
router.get(
  "/user/:userId",
  authenticateToken,
  matchController.getMatchesForSpecificUser
); // Get all matches for a user

module.exports = router;
