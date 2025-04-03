// backend/controllers/jobSkillController.js
const db = require('../config/db');

// Lấy tất cả liên kết công việc - kỹ năng
const getAllJobSkills = (req, res) => {
    db.query('SELECT * FROM Cong_Viec_Ky_Nang', (err, rows) => {
        if (err) {
            return res.status(500).json({ message: 'Lỗi server', error: err.message });
        }
        res.status(200).json(rows);
    });
};

// Lấy một liên kết cụ thể theo id_congviec và id_kynang
const getJobSkillById = (req, res) => {
    const { jobId, skillId } = req.params;
    db.query(
        'SELECT * FROM Cong_Viec_Ky_Nang WHERE id_congviec = ? AND id_kynang = ?',
        [jobId, skillId],
        (err, rows) => {
            if (err) {
                return res.status(500).json({ message: 'Lỗi server', error: err.message });
            }
            if (rows.length === 0) {
                return res.status(404).json({ message: 'Không tìm thấy liên kết' });
            }
            res.status(200).json(rows[0]);
        }
    );
};

// Tạo một liên kết mới
const createJobSkill = (req, res) => {
    const { id_congviec, id_kynang } = req.body;

    if (!id_congviec || !id_kynang) {
        return res.status(400).json({ message: 'Thiếu id_congviec hoặc id_kynang' });
    }

    const query = `
        INSERT INTO Cong_Viec_Ky_Nang (id_congviec, id_kynang)
        VALUES (?, ?)
    `;
    db.query(query, [id_congviec, id_kynang], (err, result) => {
        if (err) {
            return res.status(500).json({ message: 'Lỗi server', error: err.message });
        }
        res.status(201).json({ message: 'Tạo liên kết thành công', data: { id_congviec, id_kynang } });
    });
};

// Xóa một liên kết
const deleteJobSkill = (req, res) => {
    const { jobId, skillId } = req.params;
    db.query(
        'DELETE FROM Cong_Viec_Ky_Nang WHERE id_congviec = ? AND id_kynang = ?',
        [jobId, skillId],
        (err, result) => {
            if (err) {
                return res.status(500).json({ message: 'Lỗi server', error: err.message });
            }
            if (result.affectedRows === 0) {
                return res.status(404).json({ message: 'Không tìm thấy liên kết để xóa' });
            }
            res.status(200).json({ message: 'Xóa liên kết thành công' });
        }
    );
};

module.exports = {
    getAllJobSkills,
    getJobSkillById,
    createJobSkill,
    deleteJobSkill
};