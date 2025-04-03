const db = require('../config/db'); // Giả sử db.js của bạn dùng mysql2 thông thường

const jobController = {
  // Get all jobs
  getAllJobs: (req, res) => {
    db.query('SELECT * FROM Cong_Viec', (error, rows) => {
      if (error) {
        console.error('Lỗi khi lấy tất cả công việc:', error);
        return res.status(500).json({ error: 'Lỗi server khi lấy danh sách công việc.' });
      }
      res.json(rows);
    });
  },

  // Get job by ID
  getJobById: (req, res) => {
    const id_congviec = req.params.id;
    db.query(
      `SELECT cv.*, ct.ten_congty, ct.logo 
       FROM Cong_Viec cv 
       LEFT JOIN Cong_Ty ct ON cv.id_congty = ct.id_congty 
       WHERE cv.id_congviec = ?`,
      [id_congviec],
      (error, rows) => {
        if (error) {
          console.error('Lỗi khi lấy công việc theo ID:', error);
          return res.status(500).json({ error: 'Lỗi server khi lấy thông tin công việc.' });
        }
        if (rows.length === 0) {
          return res.status(404).json({ message: 'Không tìm thấy công việc.' });
        }
        res.json(rows[0]);
      }
    );
  },

  // Get jobs by employer (id_nhatuyendung)
  getJobsByEmployer: (req, res) => {
    const id_nhatuyendung = req.query.id_nhatuyendung;

    if (!id_nhatuyendung) {
      return res.status(400).json({ message: 'Thiếu thông tin id_nhatuyendung.' });
    }

    db.query(
      `SELECT cv.*, ct.ten_congty, ct.logo 
       FROM Cong_Viec cv 
       LEFT JOIN Cong_Ty ct ON cv.id_congty = ct.id_congty 
       WHERE cv.id_nhatuyendung = ?`,
      [id_nhatuyendung],
      (error, rows) => {
        if (error) {
          console.error('Lỗi khi lấy công việc theo id_nhatuyendung:', error);
          return res.status(500).json({ error: 'Lỗi server khi lấy danh sách công việc.' });
        }
        console.log(`Danh sách công việc cho id_nhatuyendung ${id_nhatuyendung}:`, rows);
        res.json(rows);
      }
    );
  },

  // Create new job
  createJob: (req, res) => {
    const {
      id_nhatuyendung, id_congty, tieu_de, mo_ta, yeu_cau,
      luong, dia_diem, ngay_dang, ngay_het_han, trang_thai
    } = req.body;

    if (!id_nhatuyendung || !id_congty || !tieu_de || !mo_ta || !yeu_cau || !luong || !dia_diem || !ngay_dang || !ngay_het_han || !trang_thai) {
      return res.status(400).json({ message: 'Thiếu thông tin cần thiết để tạo công việc.' });
    }

    db.query(
      `INSERT INTO Cong_Viec (
        id_nhatuyendung, id_congty, tieu_de, mo_ta, yeu_cau,
        luong, dia_diem, ngay_dang, ngay_het_han, trang_thai
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id_nhatuyendung, id_congty, tieu_de, mo_ta, yeu_cau,
        luong, dia_diem, ngay_dang, ngay_het_han, trang_thai
      ],
      (error, result) => {
        if (error) {
          console.error('Lỗi khi tạo công việc:', error);
          return res.status(500).json({ error: 'Lỗi server khi tạo công việc.' });
        }
        res.status(201).json({
          id_congviec: result.insertId,
          message: 'Tạo công việc thành công.'
        });
      }
    );
  },

  // Update job - ĐÃ CẬP NHẬT ĐỂ HỖ TRỢ PARTIAL UPDATE
  updateJob: (req, res) => {
    const id_congviec = req.params.id;
    const fields = req.body;

    // Kiểm tra xem có ít nhất một trường để cập nhật không
    if (!Object.keys(fields).length) {
      return res.status(400).json({ message: 'Không có thông tin nào để cập nhật.' });
    }

    // Tạo câu lệnh SQL động dựa trên các trường được gửi
    const allowedFields = [
      'id_nhatuyendung', 'id_congty', 'tieu_de', 'mo_ta', 'yeu_cau',
      'luong', 'dia_diem', 'ngay_dang', 'ngay_het_han', 'trang_thai'
    ];
    const updates = [];
    const values = [];

    for (const [key, value] of Object.entries(fields)) {
      if (allowedFields.includes(key)) {
        updates.push(`${key} = ?`);
        values.push(value);
      }
    }

    if (updates.length === 0) {
      return res.status(400).json({ message: 'Không có trường hợp lệ để cập nhật.' });
    }

    values.push(id_congviec);
    const query = `UPDATE Cong_Viec SET ${updates.join(', ')} WHERE id_congviec = ?`;

    db.query(query, values, (error, result) => {
      if (error) {
        console.error('Lỗi khi cập nhật công việc:', error);
        return res.status(500).json({ error: 'Lỗi server khi cập nhật công việc.' });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Không tìm thấy công việc để cập nhật.' });
      }
      res.json({ message: 'Cập nhật công việc thành công.' });
    });
  },

  // Delete job
  deleteJob: (req, res) => {
    const id_congviec = req.params.id;
    db.query(
      'DELETE FROM Cong_Viec WHERE id_congviec = ?',
      [id_congviec],
      (error, result) => {
        if (error) {
          console.error('Lỗi khi xóa công việc:', error);
          return res.status(500).json({ error: 'Lỗi server khi xóa công việc.' });
        }
        if (result.affectedRows === 0) {
          return res.status(404).json({ message: 'Không tìm thấy công việc để xóa.' });
        }
        res.json({ message: 'Xóa công việc thành công.' });
      }
    );
  }
};

module.exports = jobController;