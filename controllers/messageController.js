const Message = require("../models/Message");
const Match = require("../models/Match");

// Send a message
exports.sendMessage = async (req, res) => {
  const { matchId, content } = req.body;
  const senderId = req.user.id;

  try {
    // Verify that the match exists and the user is part of it
    const match = await Match.findById(matchId);
    if (
      !match ||
      (match.user1.toString() !== senderId &&
        match.user2.toString() !== senderId)
    ) {
      return res
        .status(404)
        .json({ message: "Match not found or access denied" });
    }

    // Determine the receiver
    const receiverId =
      match.user1.toString() === senderId ? match.user2 : match.user1;

    // Create and save the message
    const newMessage = new Message({
      matchId,
      sender: senderId,
      receiver: receiverId,
      content,
    });

    await newMessage.save();

    res
      .status(201)
      .json({ message: "Message sent successfully", data: newMessage });
  } catch (error) {
    res.status(500).json({ message: "Failed to send message", error });
  }
};

// Get all messages for a specific match
exports.getMessagesByMatchId = async (req, res) => {
  const { matchId } = req.params;
  const userId = req.user.id;

  try {
    // Verify that the match exists and the user is part of it
    const match = await Match.findById(matchId);
    if (
      !match ||
      (match.user1.toString() !== userId && match.user2.toString() !== userId)
    ) {
      return res
        .status(404)
        .json({ message: "Match not found or access denied" });
    }

    // Retrieve messages associated with the match, sorted by timestamp
    const messages = await Message.find({ matchId })
      .sort({ timestamp: 1 })
      .populate("sender", "fullName profilePicture")
      .populate("receiver", "fullName profilePicture");

    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ message: "Failed to retrieve messages", error });
  }
};
