const Match = require("../models/Match");
const User = require("../models/User");

// Create a new match
exports.createMatch = async (req, res) => {
  const { user2Id, score } = req.body;
  const user1Id = req.user.id;

  try {
    // Check if the second user exists
    const user2 = await User.findById(user2Id);
    if (!user2) {
      return res.status(404).json({ message: "User to match with not found" });
    }

    // Check if a match already exists between these users
    const existingMatch = await Match.findOne({
      $or: [
        { user1: user1Id, user2: user2Id },
        { user1: user2Id, user2: user1Id },
      ],
    });

    if (existingMatch) {
      return res.status(409).json({ message: "Match already exists" });
    }

    // Create a new match
    const newMatch = new Match({
      user1: user1Id,
      user2: user2Id,
      score,
    });

    await newMatch.save();
    return res
      .status(201)
      .json({ message: "Match created successfully", match: newMatch });
  } catch (error) {
    return res.status(500).json({ message: "Failed to create match", error });
  }
};

// Get all matches for the authenticated user
exports.getUserMatches = async (req, res) => {
  const userId = req.user.id;

  try {
    const matches = await Match.find({
      $or: [{ user1: userId }, { user2: userId }],
    }).populate("user1 user2", "fullName profilePicture");

    if (!matches.length) {
      return res.status(404).json({ message: "No matches found" });
    }

    return res.status(200).json(matches);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Failed to retrieve matches", error });
  }
};

// Get a specific match by matchId
exports.getMatchById = async (req, res) => {
  const { matchId } = req.params;

  try {
    const match = await Match.findById(matchId).populate(
      "user1 user2",
      "fullName profilePicture"
    );

    if (!match) {
      return res.status(404).json({ message: "Match not found" });
    }

    // Check if the authenticated user is part of the match
    if (
      match.user1._id.toString() !== req.user.id &&
      match.user2._id.toString() !== req.user.id
    ) {
      return res.status(403).json({ message: "Access denied" });
    }

    return res.status(200).json(match);
  } catch (error) {
    return res.status(500).json({ message: "Failed to retrieve match", error });
  }
};

// Update match status
exports.updateMatchStatus = async (req, res) => {
  const { matchId } = req.params;
  const { status } = req.body;

  try {
    const match = await Match.findById(matchId);

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

    return res
      .status(200)
      .json({ message: "Match status updated successfully", match });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Failed to update match status", error });
  }
};

// Get all matches for a specific user (by userId, for admin or other users)
exports.getMatchesForSpecificUser = async (req, res) => {
  const { userId } = req.params;

  try {
    const matches = await Match.find({
      $or: [{ user1: userId }, { user2: userId }],
    }).populate("user1 user2", "fullName profilePicture");

    if (!matches.length) {
      return res
        .status(404)
        .json({ message: "No matches found for this user" });
    }

    return res.status(200).json(matches);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Failed to retrieve matches", error });
  }
};
