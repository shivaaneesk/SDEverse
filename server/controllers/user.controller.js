const asyncHandler = require("express-async-handler");
const User = require("../models/user.model");

const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find().select("-password");
  res.json(users);
});

const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select("-password");
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }
  res.json(user);
});

const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }
  res.json({ message: "User removed" });
});

const updateUserRole = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  const { role } = req.body;
  if (!["user", "admin"].includes(role)) {
    res.status(400);
    throw new Error("Invalid role");
  }

  user.role = role;
  await user.save();

  res.json({ message: `User role updated to ${role}` });
});

// Get current user's profile
const getMyProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select("-password");
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }
  res.json(user);
});

// Update current user's profile
const updateMyProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  // List of fields a user is allowed to update
  const updatableFields = [
    "fullName",
    "avatarUrl",
    "location",
    "website",
    "bio",
    "competitiveProfiles",
    "socialLinks"
  ];

  updatableFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      user[field] = req.body[field];
    }
  });

  await user.save();
  const updatedUser = user.toObject();
  delete updatedUser.password;

  res.json({ message: "Profile updated", user: updatedUser });
});

module.exports = {
  getAllUsers,
  getUserById,
  deleteUser,
  updateUserRole,
  getMyProfile,
  updateMyProfile,
};
