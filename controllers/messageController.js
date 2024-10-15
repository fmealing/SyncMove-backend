const Match = require("../models/Match");
const User = require("../models/User");

// Create a new match
exports.createMatch = async (req, res) => {
  const { user2Id, score } = req.body;
  const user1Id = req.user.id;

  try {
    // Ensure that both users exist
    const user2 = await User.findById(user2Id);
    if (!user2) {
      return res.status(404).json({ message: "User to match with not found" });
    }

    // Create the match
    const newMatch = new Match({
      user1: user1Id,
      user2: user2Id,
      score,
    });

    await newMatch.save();
    res
      .status(201)
      .json({ message: "Match created successfully", match: newMatch });
  } catch (error) {
    res.status(500).json({ message: "Failed to create match", error });
  }
};

// Get all matches for the authenticated user
exports.getUserMatches = async (req, res) => {
  const userId = req.user.id;

  try {
    // Find all matches where the authenticated user is involved
    const matches = await Match.find({
      $or: [{ user1: userId }, { user2: userId }],
    });

    res.status(200).json(matches);
  } catch (error) {
    res.status(500).json({ message: "Failed to retrieve matches", error });
  }
};

// Get a specific match by ID
exports.getMatchById = async (req, res) => {
  const { id } = req.params;

  try {
    const match = await Match.findById(id);

    // Check if the match exists and if the user is part of it
    if (
      !match ||
      (match.user1.toString() !== req.user.id &&
        match.user2.toString() !== req.user.id)
    ) {
      return res
        .status(404)
        .json({ message: "Match not found or access denied" });
    }

    res.status(200).json(match);
  } catch (error) {
    res.status(500).json({ message: "Failed to retrieve match", error });
  }
};

// Update match status
exports.updateMatchStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const match = await Match.findById(id);

    // Check if the match exists and if the user is part of it
    if (
      !match ||
      (match.user1.toString() !== req.user.id &&
        match.user2.toString() !== req.user.id)
    ) {
      return res
        .status(404)
        .json({ message: "Match not found or access denied" });
    }

    // Update the status of the match
    match.status = status;
    await match.save();

    res
      .status(200)
      .json({ message: "Match status updated successfully", match });
  } catch (error) {
    res.status(500).json({ message: "Failed to update match status", error });
  }
};
