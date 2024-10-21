const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const userRoutes = require("./routes/userRoutes");
const authRoutes = require("./routes/authRoutes");
const matchRoutes = require("./routes/matchRoutes");
const authenticateToken = require("./middleware/authMiddleware");
const Message = require("./models/Message");
const activityRoutes = require("./routes/activityRoutes");
const messageRoutes = require("./routes/messageRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const imageRoutes = require("./routes/imageRoutes");
const emailRoutes = require("./routes/emailRoutes");
const conversationRoutes = require("./routes/conversationRoutes");
const cors = require("cors");

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

// Create an Express app and HTTP server
const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
  },
});

// Middleware to parse JSON requests
app.use(cors({ origin: "*" })); // TODO: Update this to only allow specific origins
app.use(express.json());

// Routes
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/activities", activityRoutes);
app.use("/api/match", matchRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/images", imageRoutes);
app.use("/api/email", emailRoutes);
app.use("/api/conversations", authenticateToken, conversationRoutes);

// Socket.IO configuration for real-time messaging
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) {
    return next(new Error("Unauthorized"));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.user = decoded;
    next();
  } catch (err) {
    next(new Error("Unauthorized"));
  }
});

io.on("connection", (socket) => {
  console.log(`User connected: ${socket.user.id}`);

  // Allow the user to join a room based on matchId
  socket.on("joinRoom", (matchId) => {
    socket.join(matchId);
    console.log(`User ${socket.user.id} joined room ${matchId}`);
  });

  // Handle message sending
  socket.on("sendMessage", async ({ matchId, receiverId, content }) => {
    try {
      const message = await Message.create({
        matchId,
        sender: socket.user.id,
        receiver: receiverId,
        content,
      });

      // Emit the message to both the sender and receiver via room
      io.to(matchId).emit("receiveMessage", message);
    } catch (error) {
      console.error("Error saving message:", error);
    }
  });

  // Handle user disconnection
  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.user.id}`);
  });
});

// Start the server with Socket.IO
const PORT = process.env.PORT || 5001;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
