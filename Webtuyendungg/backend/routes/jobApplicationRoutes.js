const express = require('express');
const router = express.Router();
const jobApplicationController = require('../controllers/jobApplicationController');

router.get('/', jobApplicationController.getAllApplications);
router.get('/:id', jobApplicationController.getApplicationById);
router.post('/', jobApplicationController.createApplication);
router.put('/:id', jobApplicationController.updateApplication);
router.delete('/:id', jobApplicationController.deleteApplication);
router.get('/:id_nhatuyendung/job/:id_congviec', jobApplicationController.getApplicationsByJobAndEmployer);
router.get('/employer/:id_nhatuyendung', jobApplicationController.getApplicationsByEmployer);
router.get('/employer/:id_nhatuyendung/jobs', jobApplicationController.getJobsByEmployer);
router.get('/applicant/:id_nguoitimviec', jobApplicationController.getApplicantDetails);

// Route mới: Lấy thông tin chi tiết của id_congviec
router.get('/job/:id_congviec', jobApplicationController.getJobDetails);

module.exports = router;