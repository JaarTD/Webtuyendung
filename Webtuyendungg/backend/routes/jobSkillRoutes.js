// backend/routes/jobSkillRoutes.js
const express = require('express');
const router = express.Router();
const jobSkillController = require('../controllers/jobSkillController');

router.get('/', jobSkillController.getAllJobSkills);              // GET /api/job-skills
router.get('/:jobId/:skillId', jobSkillController.getJobSkillById); // GET /api/job-skills/:jobId/:skillId
router.post('/', jobSkillController.createJobSkill);              // POST /api/job-skills
router.delete('/:jobId/:skillId', jobSkillController.deleteJobSkill); // DELETE /api/job-skills/:jobId/:skillId

module.exports = router;