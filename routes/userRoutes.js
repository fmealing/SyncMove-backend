const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const authenticateToken = require("../middleware/authMiddleware");

// User CRUD Routes
router.post("/", userController.createUser);
router.get("/", authenticateToken, userController.getAllUsers);
router.get("/:id", authenticateToken, userController.getUserById);
router.put("/:id", authenticateToken, userController.updateUser);
router.delete("/:id", authenticateToken, userController.deleteUser);
router.put(
  "/:id/profile-picture",
  authenticateToken,
  userController.updateUserProfilePicture
);
router.post(
  "/suggested-partners",
  authenticateToken,
  userController.getSuggestedPartners
);

console.log("testing callback fn", userController.getPendingPartners);
router.post(
  "/pending-partners",
  authenticateToken,
  userController.getPendingPartners
);

module.exports = router;
