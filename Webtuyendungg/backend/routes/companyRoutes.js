// backend/routes/companyRoutes.js
const express = require('express');
const router = express.Router();
const companyController = require('../controllers/companyController');

// Định nghĩa các tuyến đường
router.get('/', companyController.getAllCompanies);         // Lấy tất cả công ty
router.get('/:id', companyController.getCompanyById);       // Lấy công ty theo ID
router.post('/', companyController.createCompany);          // Tạo công ty mới
router.put('/:id', companyController.updateCompany);        // Cập nhật công ty
router.delete('/:id', companyController.deleteCompany);     // Xóa công ty

module.exports = router;