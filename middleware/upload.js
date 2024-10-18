const multer = require("multer");

// Multer configuration for in-memory storage (no need to store files locally)
const storage = multer.memoryStorage();

const upload = multer({ storage });

module.exports = upload;
