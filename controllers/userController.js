const User = require("../models/User");
const bcrypt = require("bcrypt");
const saltRounds = 10;
const axios = require("axios");

// Create a new user
exports.createUser = async (req, res) => {
  try {
    const {
      email,
      password,
      fullName,
      profilePicture,
      activityType,
      fitnessGoals,
      experienceLevel,
      location,
    } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create a new user document with the hashed password
    const newUser = new User({
      email,
      password: hashedPassword,
      fullName,
      profilePicture,
      activityType,
      fitnessGoals,
      experienceLevel,
      location,
    });

    await newUser.save();
    res
      .status(201)
      .json({ message: "User created successfully", user: newUser });
  } catch (error) {
    res.status(500).json({ error: "Failed to create user" });
  }
};

// Get all users - Admin Only Access (You may want to add a role check here)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve users" });
  }
};

// Get a single user by ID - Only allow access to the user's own profile
exports.getUserById = async (req, res) => {
  try {
    const userId = req.params.id;

    // Ensure the user can only access their own profile
    if (req.user.id !== userId) {
      return res.status(403).json({ error: "Access denied" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve user" });
  }
};

// Update user by ID - Only allow the user to update their own profile
exports.updateUser = async (req, res) => {
  try {
    const userId = req.params.id;

    // Ensure the user can only update their own profile
    if (req.user.id !== userId) {
      return res.status(403).json({ error: "Access denied" });
    }

    const updates = req.body;
    const user = await User.findByIdAndUpdate(userId, updates, { new: true });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(200).json({ message: "User updated successfully", user });
  } catch (error) {
    res.status(500).json({ error: "Failed to update user" });
    console.log(error);
  }
};

// Delete user by ID - Only allow the user to delete their own profile
exports.deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;

    // Ensure the user can only delete their own profile
    if (req.user.id !== userId) {
      return res.status(403).json({ error: "Access denied" });
    }

    const user = await User.findByIdAndDelete(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete user" });
  }
};

exports.updateUserProfilePicture = async (req, res) => {
  const { profilePicture } = req.body;
  const { id } = req.params;

  // Validate the profile picture URL
  if (!profilePicture) {
    return res.status(400).json({ message: "Profile picture URL is required" });
  }

  try {
    // Find the user and update the profile picture URL
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.profilePicture = profilePicture;
    await user.save();
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to update profile picture", error });
  }
};

// Handle suggested partners
exports.getSuggestedPartners = async (req, res) => {
  try {
    console.log("Request received for fetching suggested partners");

    const { location, preferences, includeAI } = req.body;
    console.log("Location: ", location);
    console.log("Preferences: ", preferences);
    console.log("Include AI: ", includeAI);

    const [lat, lon] = location;
    console.log("Latitude: ", lat, "Longitude: ", lon);

    // Call the AI matching API
    const response = await axios.post("http://127.0.0.1:5001/match", {
      location: [lat, lon],
      preferences,
      includeAI,
    });

    console.log("AI Matching API Response: ", response.data);

    const matchedUsers = response.data.matches;
    if (!matchedUsers || matchedUsers.length === 0) {
      return res.status(404).json({ message: "No matches found" });
    }

    // Fetch user details from the User collection based on the match results
    const userDetails = await User.find({
      _id: { $in: matchedUsers.map((match) => match.user_id) },
    });

    console.log("Fetched User Details: ", userDetails);

    res.status(200).json(userDetails);
  } catch (error) {
    console.error("Error fetching suggested partners: ", error);
    res.status(500).json({ error: "Failed to fetch suggested partners" });
  }
};

// Handle fetching pending partners
exports.getPendingPartners = async (req, res) => {
  try {
    const userId = req.user.id;

    // Query matches where the status is pending and the user is involved
    const pendingMatches = await Match.find({
      $or: [{ user1: userId }, { user2: userId }],
      status: "pending",
    }).populate("user1 user2");

    // Get the details of the other user in each pending match
    const pendingPartners = pendingMatches.map((match) =>
      match.user1._id.toString() === userId ? match.user2 : match.user1
    );

    res.json(pendingPartners);
  } catch (error) {
    console.error("Error fetching pending partners:", error);
    res.status(500).json({ error: "Failed to fetch pending partners" });
  }
};
