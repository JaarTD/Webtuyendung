const express = require('express');
const router = express.Router();
const { getAllUsers, createUser, deleteUser,  toggleUserStatus } = require('../controllers/userController');

// Lấy danh sách người dùng
router.get('/', getAllUsers);

// Thêm người dùng mới
router.post('/', createUser);

// Xóa người dùng theo ID
router.delete('/:id', deleteUser);
router.put('/:id/status', toggleUserStatus);

module.exports = router;
