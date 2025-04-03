const express = require('express');
const router = express.Router();
const nguoitimviecController = require('../controllers/nguoitimviecController');
const { isJobSeeker } = require('../middlewares/authMiddleware');

// Áp dụng middleware cho tất cả routes
router.use(isJobSeeker);

// 1. Quản lý hồ sơ
router.get('/profile', nguoitimviecController.getProfile);
router.put('/profile', nguoitimviecController.createOrUpdateProfile);

// 2. Tìm kiếm công việc
router.get('/jobs', nguoitimviecController.searchJobs);
router.get('/jobs/recommended', nguoitimviecController.getRecommendedJobs);
router.get('/jobs/:id', nguoitimviecController.getJobDetails);

// 3. Quản lý ứng tuyển
router.post('/jobs/:id/apply', nguoitimviecController.applyForJob);
router.get('/applications', nguoitimviecController.getApplications);
router.put('/applications/:id/withdraw', nguoitimviecController.withdrawApplication);

// 4. Quản lý công việc đã lưu
router.post('/jobs/:id/save', nguoitimviecController.saveJob);
router.delete('/jobs/:id/save', nguoitimviecController.unsaveJob);
router.get('/saved-jobs', nguoitimviecController.getSavedJobs);

// 5. Quản lý thông báo
router.get('/notifications', nguoitimviecController.getNotifications);
router.put('/notifications/:id/read', nguoitimviecController.markNotificationAsRead);
// lấy tất cả công việc 
router.get('/jobsall', nguoitimviecController.getAllActiveJobs);
module.exports = router;
// rut đớn ứng tuyển 
router.delete('/applications/:id', nguoitimviecController.withdrawApplication);