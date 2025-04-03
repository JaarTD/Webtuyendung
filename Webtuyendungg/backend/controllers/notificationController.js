const db = require('../config/db');

// Lấy tất cả thông báo
exports.getAllNotifications = (req, res) => {
    const query = 'SELECT * FROM Thong_Bao';
    db.query(query, (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.status(200).json(results);
    });
};

// Lấy thông báo theo ID
exports.getNotificationById = (req, res) => {
    const { id } = req.params;
    const query = 'SELECT * FROM Thong_Bao WHERE id_thongbao = ?';
    db.query(query, [id], (err, result) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (result.length === 0) {
            return res.status(404).json({ message: 'Notification not found' });
        }
        res.status(200).json(result[0]);
    });
};

// Tạo thông báo mới
exports.createNotification = (req, res) => {
    const { id_nguoidung, noi_dung, loai } = req.body;

    const query = `
        INSERT INTO Thong_Bao (id_nguoidung, noi_dung, loai)
        VALUES (?, ?, ?)
    `;
    const values = [id_nguoidung, noi_dung, loai];

    db.query(query, values, (err, result) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.status(201).json({ message: 'Notification created', id: result.insertId });
    });
};

// Cập nhật thông báo
exports.updateNotification = (req, res) => {
    const { id } = req.params;
    const { id_nguoidung, noi_dung, loai } = req.body;

    const query = `
        UPDATE Thong_Bao 
        SET id_nguoidung = ?, noi_dung = ?, loai = ?
        WHERE id_thongbao = ?
    `;
    const values = [id_nguoidung, noi_dung, loai, id];

    db.query(query, values, (err, result) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Notification not found' });
        }
        res.status(200).json({ message: 'Notification updated' });
    });
};

// Xóa thông báo
exports.deleteNotification = (req, res) => {
    const { id } = req.params;
    const query = 'DELETE FROM Thong_Bao WHERE id_thongbao = ?';
    db.query(query, [id], (err, result) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Notification not found' });
        }
        res.status(200).json({ message: 'Notification deleted' });
    });
};