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

module.exports = {
  getAllUsers,
  getUserById,
  deleteUser,
  updateUserRole,
};
