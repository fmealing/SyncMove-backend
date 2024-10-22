const Activity = require("../models/Activity");
const Match = require("../models/Match");

// Create a new activity between matched users
exports.createActivity = async (req, res) => {
  const {
    activityType,
    description,
    location,
    dateString,
    timeOfDay,
    participants,
  } = req.body;

  console.log("This is for debugging purposes");
  console.log("Activity Type: ", activityType);
  console.log("Description: ", description);
  console.log("Location: ", location);
  console.log("Date String: ", dateString);
  console.log("Time of Day: ", timeOfDay);
  console.log("Participants: ", participants);

  try {
    // Ensure that a valid match exists between the participants
    const match = await Match.findOne({
      $or: [
        { user1: participants[0], user2: participants[1] },
        { user1: participants[1], user2: participants[0] },
      ],
    });

    console.log("Match: ", match);

    if (!match || match.status !== "accepted") {
      return res
        .status(400)
        .json({ message: "No accepted match between the users." });
    }

    // Create a new activity
    const newActivity = new Activity({
      participants,
      activityType,
      description,
      location,
      dateString,
      timeOfDay,
    });

    await newActivity.save();
    console.log("Activity created successfully");
    console.log(newActivity);
    res.status(201).json({
      message: "Activity created successfully",
      activity: newActivity,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to create activity", error });
    console.log("Failed to create activity");
    console.log(error);
  }
};

// Get all activities for a user
exports.getAllActivities = async (req, res) => {
  try {
    const activities = await Activity.find({
      participants: req.user.id,
    });
    res.status(200).json(activities);
  } catch (error) {
    res.status(500).json({ message: "Failed to get activities", error });
  }
};

// Get a specific activity by ID
exports.getActivityById = async (req, res) => {
  const { id } = req.params;

  try {
    const activity = await Activity.findById(id);
    if (!activity || activity.creator.toString() !== req.user.id) {
      return res
        .status(404)
        .json({ message: "Activity not found or access denied" });
    }
    res.status(200).json(activity);
  } catch (error) {
    res.status(500).json({ message: "Failed to get activity", error });
  }
};

// Update an activity by ID
exports.updateActivity = async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  try {
    const activity = await Activity.findOneAndUpdate(
      { _id: id, creator: req.user.id },
      updates,
      { new: true }
    );

    if (!activity) {
      return res
        .status(404)
        .json({ message: "Activity not found or access denied" });
    }

    res
      .status(200)
      .json({ message: "Activity updated successfully", activity });
  } catch (error) {
    res.status(500).json({ message: "Failed to update activity", error });
  }
};

// Delete an activity by ID
exports.deleteActivity = async (req, res) => {
  const { id } = req.params;

  try {
    const activity = await Activity.findOneAndDelete({
      _id: id,
      creator: req.user.id,
    });

    if (!activity) {
      return res
        .status(404)
        .json({ message: "Activity not found or access denied" });
    }

    res.status(200).json({ message: "Activity deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete activity", error });
  }
};
