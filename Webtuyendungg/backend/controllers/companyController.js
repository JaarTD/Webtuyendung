const db = require('../config/db');

// Lấy tất cả công ty, lọc theo id_nhatuyendung
exports.getAllCompanies = async (req, res) => {
    try {
        const id_nhatuyendung = req.query.id_nhatuyendung; // Lấy id_nhatuyendung từ query
        if (!id_nhatuyendung) {
            return res.status(400).json({ message: 'Thiếu id_nhatuyendung trong query' });
        }

        // Kiểm tra xem id_nhatuyendung có tồn tại trong bảng Nguoi_Dung không
        const [userResults] = await db.promise().query(
            'SELECT * FROM Nguoi_Dung WHERE id_nguoidung = ?',
            [id_nhatuyendung]
        );

        if (userResults.length === 0) {
            return res.status(404).json({ message: 'Nhà tuyển dụng không tồn tại' });
        }

        const [results] = await db.promise().query(
            'SELECT id_congty, ten_congty FROM Cong_Ty WHERE id_nhatuyendung = ?',
            [id_nhatuyendung]
        );

        res.status(200).json(results);
    } catch (error) {
        console.error('Lỗi khi lấy danh sách công ty:', error);
        res.status(500).json({ 
            message: 'Lỗi khi lấy danh sách công ty', 
            error: error.message, 
            sqlCode: error.code, 
            sqlMessage: error.sqlMessage 
        });
    }
};

// Lấy công ty theo ID
exports.getCompanyById = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id || isNaN(id)) {
            return res.status(400).json({ message: 'ID công ty không hợp lệ' });
        }

        const [result] = await db.promise().query(
            'SELECT * FROM Cong_Ty WHERE id_congty = ?',
            [id]
        );

        if (result.length === 0) {
            return res.status(404).json({ message: 'Công ty không tồn tại' });
        }

        res.status(200).json(result[0]);
    } catch (error) {
        console.error('Lỗi khi lấy thông tin công ty:', error);
        res.status(500).json({ 
            message: 'Lỗi khi lấy thông tin công ty', 
            error: error.message, 
            sqlCode: error.code, 
            sqlMessage: error.sqlMessage 
        });
    }
};

// Tạo công ty mới - ĐÃ CẬP NHẬT ĐỂ CHỈ CHO PHÉP 1 CÔNG TY
exports.createCompany = async (req, res) => {
    try {
        const {
            id_nhatuyendung, ten_congty, nganh_nghe, mo_ta, dia_chi, 
            website, logo
        } = req.body;

        // Kiểm tra các trường bắt buộc
        if (!id_nhatuyendung || !ten_congty || !nganh_nghe) {
            return res.status(400).json({ message: 'Thiếu các trường bắt buộc: id_nhatuyendung, ten_congty, nganh_nghe' });
        }

        // Kiểm tra id_nhatuyendung là số hợp lệ
        if (isNaN(id_nhatuyendung)) {
            return res.status(400).json({ message: 'ID nhà tuyển dụng không hợp lệ' });
        }

        // Kiểm tra xem id_nhatuyendung có tồn tại trong bảng Nguoi_Dung không
        const [userResults] = await db.promise().query(
            'SELECT * FROM Nguoi_Dung WHERE id_nguoidung = ?',
            [id_nhatuyendung]
        );

        if (userResults.length === 0) {
            return res.status(404).json({ message: 'Nhà tuyển dụng không tồn tại' });
        }

        // Kiểm tra xem nhà tuyển dụng đã có công ty hay chưa
        const [existingCompany] = await db.promise().query(
            'SELECT * FROM Cong_Ty WHERE id_nhatuyendung = ?',
            [id_nhatuyendung]
        );

        if (existingCompany.length > 0) {
            return res.status(400).json({ message: 'Nhà tuyển dụng này đã có một công ty. Mỗi nhà tuyển dụng chỉ được tạo một công ty.' });
        }

        const query = `
            INSERT INTO Cong_Ty (id_nhatuyendung, ten_congty, nganh_nghe, mo_ta, dia_chi, website, logo)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
        const values = [
            id_nhatuyendung, ten_congty, nganh_nghe, mo_ta || null, dia_chi || null, 
            website || null, logo || null
        ];

        const [result] = await db.promise().query(query, values);

        res.status(201).json({ message: 'Tạo công ty thành công', id: result.insertId });
    } catch (error) {
        console.error('Lỗi khi tạo công ty:', error);
        res.status(500).json({ 
            message: 'Lỗi khi tạo công ty', 
            error: error.message, 
            sqlCode: error.code, 
            sqlMessage: error.sqlMessage 
        });
    }
};

// Cập nhật công ty
exports.updateCompany = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            id_nhatuyendung, ten_congty, nganh_nghe, mo_ta, dia_chi, 
            website, logo
        } = req.body;

        // Kiểm tra ID hợp lệ
        if (!id || isNaN(id)) {
            return res.status(400).json({ message: 'ID công ty không hợp lệ' });
        }

        // Kiểm tra các trường bắt buộc
        if (!id_nhatuyendung || !ten_congty || !nganh_nghe) {
            return res.status(400).json({ message: 'Thiếu các trường bắt buộc: id_nhatuyendung, ten_congty, nganh_nghe' });
        }

        // Kiểm tra xem công ty có tồn tại không
        const [companyResults] = await db.promise().query(
            'SELECT * FROM Cong_Ty WHERE id_congty = ?',
            [id]
        );

        if (companyResults.length === 0) {
            return res.status(404).json({ message: 'Công ty không tồn tại' });
        }

        // Kiểm tra xem id_nhatuyendung có tồn tại trong bảng Nguoi_Dung không
        const [userResults] = await db.promise().query(
            'SELECT * FROM Nguoi_Dung WHERE id_nguoidung = ?',
            [id_nhatuyendung]
        );

        if (userResults.length === 0) {
            return res.status(404).json({ message: 'Nhà tuyển dụng không tồn tại' });
        }

        // Kiểm tra quyền: chỉ nhà tuyển dụng sở hữu công ty mới được cập nhật
        if (companyResults[0].id_nhatuyendung !== parseInt(id_nhatuyendung)) {
            return res.status(403).json({ message: 'Bạn không có quyền cập nhật công ty này' });
        }

        const query = `
            UPDATE Cong_Ty 
            SET id_nhatuyendung = ?, ten_congty = ?, nganh_nghe = ?, mo_ta = ?, dia_chi = ?, 
                website = ?, logo = ?
            WHERE id_congty = ?
        `;
        const values = [
            id_nhatuyendung, ten_congty, nganh_nghe, mo_ta || null, dia_chi || null, 
            website || null, logo || null, id
        ];

        await db.promise().query(query, values);

        res.status(200).json({ message: 'Cập nhật công ty thành công' });
    } catch (error) {
        console.error('Lỗi khi cập nhật công ty:', error);
        res.status(500).json({ 
            message: 'Lỗi khi cập nhật công ty', 
            error: error.message, 
            sqlCode: error.code, 
            sqlMessage: error.sqlMessage 
        });
    }
};

// Xóa công ty
exports.deleteCompany = async (req, res) => {
    try {
        const { id } = req.params;
        const id_nhatuyendung = req.query.id_nhatuyendung; // Lấy id_nhatuyendung từ query để kiểm tra quyền

        // Kiểm tra ID hợp lệ
        if (!id || isNaN(id)) {
            return res.status(400).json({ message: 'ID công ty không hợp lệ' });
        }
        if (!id_nhatuyendung || isNaN(id_nhatuyendung)) {
            return res.status(400).json({ message: 'ID nhà tuyển dụng không hợp lệ' });
        }

        // Kiểm tra xem công ty có tồn tại không
        const [companyResults] = await db.promise().query(
            'SELECT * FROM Cong_Ty WHERE id_congty = ?',
            [id]
        );

        if (companyResults.length === 0) {
            return res.status(404).json({ message: 'Công ty không tồn tại' });
        }

        // Kiểm tra quyền: chỉ nhà tuyển dụng sở hữu công ty mới được xóa
        if (companyResults[0].id_nhatuyendung !== parseInt(id_nhatuyendung)) {
            return res.status(403).json({ message: 'Bạn không có quyền xóa công ty này' });
        }

        await db.promise().query('DELETE FROM Cong_Ty WHERE id_congty = ?', [id]);

        res.status(200).json({ message: 'Xóa công ty thành công' });
    } catch (error) {
        console.error('Lỗi khi xóa công ty:', error);
        res.status(500).json({ 
            message: 'Lỗi khi xóa công ty', 
            error: error.message, 
            sqlCode: error.code, 
            sqlMessage: error.sqlMessage 
        });
    }
};