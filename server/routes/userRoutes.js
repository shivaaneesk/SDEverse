const express = require('express');
const router = express.Router();
const { getAllUsers, getUserById, deleteUser, updateUserRole } = require('../controllers/userController');
const { protect, admin } = require('../middleware/authMiddleware');

// Admin-only routes
router.get('/', protect, admin, getAllUsers);
router.get('/:id', protect, admin, getUserById);
router.delete('/:id', protect, admin, deleteUser);
router.put('/:id/role', protect, admin, updateUserRole);

module.exports = router;
