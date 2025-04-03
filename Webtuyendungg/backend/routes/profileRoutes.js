const express = require("express");
const router = express.Router();
const profileController = require("../controllers/profileController");

// Lấy thông tin cá nhân theo ID
router.get("/:id", profileController.getProfileById);

// Thêm hồ sơ cá nhân
router.post("/create", profileController.addProfile);

// Sửa hồ sơ cá nhân
router.put("/:id", profileController.updateProfile);

// Xóa hồ sơ cá nhân
router.delete("/:id", profileController.deleteProfile);

module.exports = router;
