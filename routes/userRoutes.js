const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const authenticateToken = require("../middleware/authMiddleware");

// User CRUD Routes
router.post("/", userController.createUser);
router.get("/", authenticateToken, userController.getAllUsers);
// router.get("/:id", authenticateToken, userController.getUserById);
router.get("/:id", userController.getUserById);
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
  userController.getSuggestedPartnersWithoutPagination
);

router.post(
  "/suggested-partners-pagination",
  authenticateToken,
  userController.getSuggestedPartnersWithPagination
);

router.post(
  "/pending-partners",
  authenticateToken,
  userController.getPendingPartners
);

router.post(
  "/matched-partners",
  authenticateToken,
  userController.getMatchedPartners
);

module.exports = router;
