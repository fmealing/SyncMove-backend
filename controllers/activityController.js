const Activity = require("../models/Activity");

// Create a new activity
exports.createActivity = async (req, res) => {
  const { activityType, description, location, dateString, timeOfDay } =
    req.body;

  try {
    const newActivity = new Activity({
      creator: req.user.id,
      activityType,
      description,
      location,
      dateString,
      timeOfDay,
    });

    await newActivity.save();
    res.status(201).json({
      message: "Activity created successfully",
      activity: newActivity,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to create activity", error });
  }
};

// Get all activities
exports.getAllActivities = async (req, res) => {
  try {
    const activities = await Activity.find({ creator: req.user.id });
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
