const express = require('express');
const router = express.Router();
const { getAllUsers, getUserById, deleteUser, updateUserRole,getMyProfile,updateMyProfile } = require('../controllers/user.controller');
const { protect, admin } = require('../middleware/auth.middleware');

// Admin-only routes
router.get('/', protect, admin, getAllUsers);
router.get('/:id', protect, admin, getUserById);
router.delete('/:id', protect, admin, deleteUser);
router.put('/:id/role', protect, admin, updateUserRole);
router.get('/me', protect, getMyProfile);
router.patch('/me', protect, updateMyProfile);

module.exports = router;
