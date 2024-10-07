const express = require("express");
const router = express.Router();
const axios = require("axios");

router.post("/", async (req, res) => {
  try {
    const userFeatures = req.body.features;
    const response = await axios.post("http://localhost:5001/match", {
      features: userFeatures,
    });
    res.status(200).json(response.data);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch matches" });
  }
});
