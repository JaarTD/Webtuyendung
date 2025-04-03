const db = require('../config/db');

// Lấy tất cả tài liệu công việc
exports.getAllJobDocuments = (req, res) => {
    const query = 'SELECT * FROM Tai_Lieu_Cong_Viec';
    db.query(query, (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.status(200).json(results);
    });
};

// Lấy tài liệu công việc theo ID
exports.getJobDocumentById = (req, res) => {
    const { id } = req.params;
    const query = 'SELECT * FROM Tai_Lieu_Cong_Viec WHERE id_tailieu = ?';
    db.query(query, [id], (err, result) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (result.length === 0) {
            return res.status(404).json({ message: 'Job document not found' });
        }
        res.status(200).json(result[0]);
    });
};

// Tạo tài liệu công việc mới
exports.createJobDocument = (req, res) => {
    const { id_congviec, duong_dan, loai } = req.body;

    const query = `
        INSERT INTO Tai_Lieu_Cong_Viec (id_congviec, duong_dan, loai)
        VALUES (?, ?, ?)
    `;
    const values = [id_congviec, duong_dan, loai];

    db.query(query, values, (err, result) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.status(201).json({ message: 'Job document created', id: result.insertId });
    });
};

// Cập nhật tài liệu công việc
exports.updateJobDocument = (req, res) => {
    const { id } = req.params;
    const { id_congviec, duong_dan, loai } = req.body;

    const query = `
        UPDATE Tai_Lieu_Cong_Viec 
        SET id_congviec = ?, duong_dan = ?, loai = ?
        WHERE id_tailieu = ?
    `;
    const values = [id_congviec, duong_dan, loai, id];

    db.query(query, values, (err, result) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Job document not found' });
        }
        res.status(200).json({ message: 'Job document updated' });
    });
};

// Xóa tài liệu công việc
exports.deleteJobDocument = (req, res) => {
    const { id } = req.params;
    const query = 'DELETE FROM Tai_Lieu_Cong_Viec WHERE id_tailieu = ?';
    db.query(query, [id], (err, result) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Job document not found' });
        }
        res.status(200).json({ message: 'Job document deleted' });
    });
};