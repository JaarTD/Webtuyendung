const express = require("express");
const { getAllActivities, getActivityById, addActivity, deleteActivity, updateActivity,  getAdminStats, getRecentActivities, // Đảm bảo có dòng này
    lockUser,
    updateJobStatus, getJobStats,
   
    sendNotification,  
    tangview} = require("../controllers/adminController");
const { isAdmin, isClient } = require("../middlewares/authMiddleware");
const maintenanceController = require('../controllers/maintenance.controller');

const router = express.Router();


router.get("/hoatdong", isAdmin, getAllActivities);
router.get("/hoatdong/:id", isAdmin, getActivityById);
router.post("/hoatdong", isAdmin, addActivity);
router.put("/hoatdong/:id", isAdmin, updateActivity);
router.delete("/hoatdong/:id", isAdmin, deleteActivity);
router.get("/stats", getAdminStats);
router.get("/activities", getRecentActivities);
router.get("/activities", getAllActivities);
router.get("/activities/:id", getActivityById);
router.post("/activities", addActivity);
router.put("/activities/:id", updateActivity);
router.delete("/activities/:id", deleteActivity);
router.get("/stats", getAdminStats);
router.get("/recent-activities", getRecentActivities);
router.put("/users/:id/lock", lockUser);
router.get("/jobs/:id/stats", getJobStats);
router.put("/jobs/:id/status", updateJobStatus);

router.get('/api/system/maintenance/status', maintenanceController.getMaintenanceStatus);
router.post('/api/system/maintenance/enable', maintenanceController.enableMaintenance);
router.post('/api/system/maintenance/disable', maintenanceController.disableMaintenance);


router.post("/notifications", sendNotification);
router.get("/stats", async (req, res) => {
    try {
      const totalUsers = await db.User.count();
      const employers = await db.User.count({ where: { role: "employer" } });
      const jobSeekers = await db.User.count({ where: { role: "job_seeker" } });
      const activeJobs = await db.Job.count({ where: { status: "active" } });
  
      res.json({ totalUsers, employers, jobSeekers, activeJobs });
    } catch (error) {
      console.error("Lỗi khi lấy thống kê:", error);
      res.status(500).json({ message: "Lỗi server" });
    }
  });
  router.get("/activities", async (req, res) => {
    try {
      const activities = await db.Activity.findAll({
        order: [["createdAt", "DESC"]],
        limit: 10, // Lấy 10 hoạt động gần nhất
      });
  
      res.json(activities);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách hoạt động:", error);
      res.status(500).json({ message: "Lỗi server" });
    }
  });
  
  
module.exports = router;
