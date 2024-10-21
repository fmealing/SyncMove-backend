const express = require("express");
const router = express.Router();
const feedbackController = require("../controllers/emailController");

router.post("/send", feedbackController.sendFeedback);

module.exports = router;
