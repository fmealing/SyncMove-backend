const express = require("express");
const { uploadImage } = require("../controllers/imageController");
const upload = require("../middleware/upload");

const router = express.Router();

// POST route for uploading an image
router.post("/upload", upload.single("file"), uploadImage);

module.exports = router;
