const Match = require("../models/Match");
const Message = require("../models/Message");

// Fetch all conversations for the authenticated user
exports.getConversations = async (req, res) => {
  const userId = req.user.id;

  try {
    // Fetch all matches for the user
    const matches = await Match.find({
      $or: [{ user1: userId }, { user2: userId }],
    })
      .populate("user1 user2", "fullName profilePicture")
      .exec();

    // For each match, find the last message exchanged
    const conversations = await Promise.all(
      matches.map(async (match) => {
        const lastMessage = await Message.findOne({ matchId: match._id })
          .sort({ timestamp: -1 })
          .exec();

        // Construct a conversation object
        return {
          id: match._id,
          name:
            match.user1._id.toString() === userId
              ? match.user2.fullName
              : match.user1.fullName,
          img:
            match.user1._id.toString() === userId
              ? match.user2.profilePicture
              : match.user1.profilePicture,
          lastMessage: lastMessage ? lastMessage.content : "No messages yet",
          time: lastMessage
            ? new Date(lastMessage.timestamp).toLocaleTimeString()
            : "",
        };
      })
    );

    res.status(200).json(conversations);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch conversations", error });
  }
};
