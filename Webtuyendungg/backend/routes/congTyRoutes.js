const express = require("express");
const router = express.Router();
const { 
  getCompanies,
  getCompanyDetails,
  searchCompanies
} = require("../controllers/congTyController");

// Lấy danh sách công ty
router.get("/", getCompanies);

// Lấy chi tiết công ty
router.get("/:id", getCompanyDetails);

// Tìm kiếm công ty
router.get("/search", searchCompanies);

module.exports = router;