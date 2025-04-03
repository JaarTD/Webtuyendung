const express = require('express');
const router = express.Router();
const jobDocumentController = require('../controllers/jobDocumentController');

// Định nghĩa các tuyến đường
router.get('/', jobDocumentController.getAllJobDocuments);      // Lấy tất cả tài liệu
router.get('/:id', jobDocumentController.getJobDocumentById);   // Lấy tài liệu theo ID
router.post('/', jobDocumentController.createJobDocument);      // Tạo tài liệu mới
router.put('/:id', jobDocumentController.updateJobDocument);    // Cập nhật tài liệu
router.delete('/:id', jobDocumentController.deleteJobDocument); // Xóa tài liệu

module.exports = router;