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
    const matches = await Match.find({
      $or: [{ user1: userId }, { user2: userId }],
    }).populate("user1 user2", "fullName profilePicture"); // Populate to include user details

    res.status(200).json(matches);
  } catch (error) {
    res.status(500).json({ message: "Failed to retrieve matches", error });
  }
};

// Get a specific match by ID
exports.getMatchById = async (req, res) => {
  const { id } = req.params;

  try {
    const match = await Match.findById(id).populate(
      "user1 user2",
      "fullName profilePicture"
    );

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
