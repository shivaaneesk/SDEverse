const express = require("express");
const router = express.Router();
const {
  getAllUsers,
  getUserById,
  deleteUser,
  updateUserRole,
  getMyProfile,
  updateMyProfile,
  updateAllCompetitiveStats,
  updateSocialProfiles,
} = require("../controllers/user.controller");
const { protect, admin } = require("../middleware/auth.middleware");

router.get("/me", protect, getMyProfile);
router.patch("/me", protect, updateMyProfile);
router.get("/update-competitive-stats", protect, updateAllCompetitiveStats);
router.get("/update-social-stats", protect, updateSocialProfiles);
router.get("/", protect, admin, getAllUsers);

router.get("/:id", protect, admin, getUserById);
router.delete("/:id", protect, admin, deleteUser);
router.put("/:id/role", protect, admin, updateUserRole);

module.exports = router;
