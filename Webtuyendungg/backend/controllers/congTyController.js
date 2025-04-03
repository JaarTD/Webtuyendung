const db = require("../config/db");

// Lấy danh sách công ty với số lượng công việc
const getCompanies = (req, res) => {
  db.query(`
    SELECT 
      c.*,
      COUNT(cv.id_congviec) AS job_count,
      u.ten AS recruiter_name,
      u.email AS recruiter_email
    FROM Cong_Ty c
    LEFT JOIN Cong_Viec cv ON c.id_congty = cv.id_congty
    JOIN Nguoi_Dung u ON c.id_nhatuyendung = u.id_nguoidung
    GROUP BY c.id_congty
  `, (error, companies) => {
    if (error) {
      console.error('Lỗi khi lấy danh sách công ty:', error);
      return res.status(500).json({ 
        success: false,
        message: 'Lỗi server' 
      });
    }
    
    // Lấy danh sách ngành nghề duy nhất
    const industries = [...new Set(companies.map(c => c.nganh_nghe))];
    
    res.json({
      success: true,
      data: companies,
      industries
    });
  });
};

// Lấy chi tiết công ty với danh sách công việc
const getCompanyDetails = (req, res) => {
  const { id } = req.params;
  
  // Lấy thông tin công ty
  db.query(`
    SELECT 
      c.*,
      u.ten AS recruiter_name,
      u.email AS recruiter_email
    FROM Cong_Ty c
    JOIN Nguoi_Dung u ON c.id_nhatuyendung = u.id_nguoidung
    WHERE c.id_congty = ?
  `, [id], (error, company) => {
    if (error) {
      console.error('Lỗi khi lấy chi tiết công ty:', error);
      return res.status(500).json({ 
        success: false,
        message: 'Lỗi server' 
      });
    }
    
    if (company.length === 0) {
      return res.status(404).json({ 
        success: false,
        message: 'Công ty không tồn tại' 
      });
    }
    
    // Lấy danh sách công việc của công ty
    db.query(`
      SELECT 
        id_congviec,
        tieu_de,
        luong,
        dia_diem,
        trang_thai
      FROM Cong_Viec
      WHERE id_congty = ?
    `, [id], (error, jobs) => {
      if (error) {
        console.error('Lỗi khi lấy danh sách công việc:', error);
        return res.status(500).json({ 
          success: false,
          message: 'Lỗi server' 
        });
      }
      
      res.json({
        success: true,
        data: {
          ...company[0],
          recruiter: {
            ten: company[0].recruiter_name,
            email: company[0].recruiter_email
          },
          jobs
        }
      });
    });
  });
};

// Tìm kiếm công ty
const searchCompanies = (req, res) => {
  const { query, industry } = req.query;
  
  let sql = `
    SELECT 
      c.*,
      COUNT(cv.id_congviec) AS job_count
    FROM Cong_Ty c
    LEFT JOIN Cong_Viec cv ON c.id_congty = cv.id_congty
    WHERE 1=1
  `;
  
  const params = [];
  
  if (query) {
    sql += ` AND c.ten_congty LIKE ?`;
    params.push(`%${query}%`);
  }
  
  if (industry) {
    sql += ` AND c.nganh_nghe = ?`;
    params.push(industry);
  }
  
  sql += ` GROUP BY c.id_congty`;
  
  db.query(sql, params, (error, companies) => {
    if (error) {
      console.error('Lỗi khi tìm kiếm công ty:', error);
      return res.status(500).json({ 
        success: false,
        message: 'Lỗi server' 
      });
    }
    
    res.json({
      success: true,
      data: companies
    });
  });
};

module.exports = {
  getCompanies,
  getCompanyDetails,
  searchCompanies
};