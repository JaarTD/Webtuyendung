const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');

// Định nghĩa các tuyến đường
router.get('/', notificationController.getAllNotifications);      // Lấy tất cả thông báo
router.get('/:id', notificationController.getNotificationById);    // Lấy thông báo theo ID
router.post('/', notificationController.createNotification);       // Tạo thông báo mới
router.put('/:id', notificationController.updateNotification);     // Cập nhật thông báo
router.delete('/:id', notificationController.deleteNotification);  // Xóa thông báo

module.exports = router;