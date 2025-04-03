const db = require("../config/db");

// Lấy danh sách hoạt động
const getAllActivities = (req, res) => {
    db.query("SELECT * FROM Quan_Tri_Hoat_Dong", (err, rows) => {
        if (err) {
            console.error("Lỗi khi lấy danh sách hoạt động:", err);
            return res.status(500).json({ message: "Lỗi server" });
        }

        if (!Array.isArray(rows)) {
            return res.status(500).json({ message: "Dữ liệu trả về không hợp lệ" });
        }

        res.json(rows);
    });
};

// Lấy chi tiết một hoạt động
const getActivityById = (req, res) => {
    const { id } = req.params;
    db.query("SELECT * FROM Quan_Tri_Hoat_Dong WHERE id_hoatdong = ?", [id], (err, rows) => {
        if (err) {
            console.error("Lỗi khi lấy hoạt động:", err);
            return res.status(500).json({ message: "Lỗi server" });
        }

        if (rows.length === 0) {
            return res.status(404).json({ message: "Hoạt động không tồn tại" });
        }

        res.json(rows[0]);
    });
};

// Thêm hoạt động mới
const addActivity = (req, res) => {
    const { id_quantri, loai_hoatdong } = req.body;

    if (!id_quantri || !loai_hoatdong) {
        return res.status(400).json({ message: "Vui lòng nhập đầy đủ thông tin!" });
    }

    // Kiểm tra id_quantri có tồn tại trong bảng Nguoi_Dung không
    db.query("SELECT id_nguoidung FROM Nguoi_Dung WHERE id_nguoidung = ?", [id_quantri], (err, userCheck) => {
        if (err) {
            console.error("Lỗi khi kiểm tra người quản trị:", err);
            return res.status(500).json({ message: "Lỗi server!" });
        }

        if (userCheck.length === 0) {
            return res.status(400).json({ message: "Người quản trị không tồn tại!" });
        }

        const sql = `INSERT INTO Quan_Tri_Hoat_Dong (id_quantri, loai_hoatdong) VALUES (?, ?)`;
        db.query(sql, [id_quantri, loai_hoatdong], (err) => {
            if (err) {
                console.error("Lỗi khi thêm hoạt động:", err);
                return res.status(500).json({ message: "Lỗi server!" });
            }

            res.status(201).json({ message: "Thêm hoạt động thành công!" });
        });
    });
};

// Xóa hoạt động
const deleteActivity = (req, res) => {
    const { id } = req.params;
    db.query("DELETE FROM Quan_Tri_Hoat_Dong WHERE id_hoatdong = ?", [id], (err, result) => {
        if (err) {
            console.error("Lỗi khi xóa hoạt động:", err);
            return res.status(500).json({ message: "Lỗi server!" });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Hoạt động không tồn tại" });
        }

        res.json({ message: "Xóa hoạt động thành công!" });
    });
};
// Cập nhật hoạt động
const updateActivity = (req, res) => {
    const { id } = req.params;
    const { id_quantri, loai_hoatdong } = req.body;

    if (!id_quantri || !loai_hoatdong) {
        return res.status(400).json({ message: "Vui lòng nhập đầy đủ thông tin!" });
    }

    // Kiểm tra hoạt động có tồn tại không
    db.query("SELECT * FROM Quan_Tri_Hoat_Dong WHERE id_hoatdong = ?", [id], (err, existingActivity) => {
        if (err) {
            console.error("Lỗi khi kiểm tra hoạt động:", err);
            return res.status(500).json({ message: "Lỗi server!" });
        }

        if (existingActivity.length === 0) {
            return res.status(404).json({ message: "Hoạt động không tồn tại!" });
        }

        // Cập nhật dữ liệu
        const sql = `UPDATE Quan_Tri_Hoat_Dong SET id_quantri = ?, loai_hoatdong = ? WHERE id_hoatdong = ?`;
        db.query(sql, [id_quantri, loai_hoatdong, id], (err) => {
            if (err) {
                console.error("Lỗi khi cập nhật hoạt động:", err);
                return res.status(500).json({ message: "Lỗi server!" });
            }

            res.json({ message: "Cập nhật hoạt động thành công!" });
        });
    });
};
// API lấy số liệu thống kê
const getAdminStats = (req, res) => {
    db.query("SELECT COUNT(*) AS totalUsers FROM Nguoi_Dung", (err, totalUsers) => {
        if (err) {
            console.error("Lỗi khi lấy số liệu thống kê:", err);
            return res.status(500).json({ message: "Lỗi server!" });
        }

        db.query("SELECT COUNT(*) AS employers FROM Nguoi_Dung WHERE vai_tro = 'nhatuyendung'", (err, employers) => {
            if (err) {
                console.error("Lỗi khi lấy số liệu thống kê:", err);
                return res.status(500).json({ message: "Lỗi server!" });
            }

            db.query("SELECT COUNT(*) AS jobSeekers FROM Nguoi_Dung WHERE vai_tro = 'nguoitimviec'", (err, jobSeekers) => {
                if (err) {
                    console.error("Lỗi khi lấy số liệu thống kê:", err);
                    return res.status(500).json({ message: "Lỗi server!" });
                }

                db.query("SELECT COUNT(*) AS activeJobs FROM Cong_Viec WHERE trang_thai = 'active'", (err, activeJobs) => {
                    if (err) {
                        console.error("Lỗi khi lấy số liệu thống kê:", err);
                        return res.status(500).json({ message: "Lỗi server!" });
                    }

                    res.json({
                        totalUsers: totalUsers[0].totalUsers,
                        employers: employers[0].employers,
                        jobSeekers: jobSeekers[0].jobSeekers,
                        activeJobs: activeJobs[0].activeJobs
                    });
                });
            });
        });
    });
};

// API lấy danh sách hoạt động gần đây
const getRecentActivities = (req, res) => {
    db.query(`
        SELECT 
            q.id_hoatdong as id,
            n.ten as admin_name,
            q.loai_hoatdong as type,
            q.ngay_thuchien as date,
            CASE 
                WHEN q.loai_hoatdong = 'chan_nguoidung' THEN 'Đã chặn người dùng'
                WHEN q.loai_hoatdong = 'xoa_congviec' THEN 'Đã xóa công việc'
                WHEN q.loai_hoatdong = 'phe_duyet_hoso' THEN 'Đã phê duyệt hồ sơ'
                ELSE 'Hoạt động khác'
            END as description
        FROM Quan_Tri_Hoat_Dong q
        JOIN Nguoi_Dung n ON q.id_quantri = n.id_nguoidung
        ORDER BY q.ngay_thuchien DESC
        LIMIT 10
    `, (err, rows) => {
        if (err) {
            console.error("Lỗi khi lấy danh sách hoạt động:", err);
            return res.status(500).json({ message: "Lỗi server!" });
        }
        res.json(rows); // Lấy kết quả trả về từ rows
    });
};

//api API khóa/mở khóa người dùng
const lockUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { action } = req.body; // "lock" hoặc "unlock"

        if (!["lock", "unlock"].includes(action)) {
            return res.status(400).json({ message: "Hành động không hợp lệ!" });
        }

        const sql = `UPDATE Nguoi_Dung SET trang_thai = ? WHERE id_nguoidung = ?`;
        const status = action === "lock" ? "locked" : "active";
        const [result] = await db.query(sql, [status, id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Người dùng không tồn tại!" });
        }

        res.json({ message: `Tài khoản đã được ${action === "lock" ? "khóa" : "mở khóa"}!` });
    } catch (error) {
        console.error("Lỗi khi khóa/mở khóa tài khoản:", error);
        res.status(500).json({ message: "Lỗi server!" });
    }
};
//API duyệt hoặc xóa công việc
const updateJobStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { action } = req.body; // "approve" hoặc "delete"

        if (!["approve", "delete"].includes(action)) {
            return res.status(400).json({ message: "Hành động không hợp lệ!" });
        }

        if (action === "approve") {
            await db.query("UPDATE Cong_Viec SET trang_thai = 'hoatdong' WHERE id_congviec = ?", [id]);
            res.json({ message: "Công việc đã được phê duyệt!" });
        } else {
            await db.query("DELETE FROM Cong_Viec WHERE id_congviec = ?", [id]);
            res.json({ message: "Công việc đã bị xóa!" });
        }
    } catch (error) {
        console.error("Lỗi khi cập nhật trạng thái công việc:", error);
        res.status(500).json({ message: "Lỗi server!" });
    }
};
//API gửi thông báo hệ thống
const sendNotification = async (req, res) => {
    try {
        const { id_nguoidung, noi_dung } = req.body;

        if (!noi_dung) {
            return res.status(400).json({ message: "Nội dung thông báo không được để trống!" });
        }

        const sql = "INSERT INTO Thong_Bao (id_nguoidung, noi_dung, loai) VALUES (?, ?, 'hethong')";
        await db.query(sql, [id_nguoidung || null, noi_dung]); // id_nguoidung = null => gửi toàn bộ hệ thống

        res.json({ message: "Thông báo đã được gửi!" });
    } catch (error) {
        console.error("Lỗi khi gửi thông báo:", error);
        res.status(500).json({ message: "Lỗi server!" });
    }
};
// API lấy thống kê lượt xem và ứng tuyển của công việc
const getJobStats = (req, res) => {
    const { id } = req.params;

    // 1. Kiểm tra công việc tồn tại
    db.query('SELECT id_congviec FROM Cong_Viec WHERE id_congviec = ?', [id], (err, job) => {
        if (err) {
            console.error('Lỗi khi kiểm tra công việc:', err);
            return res.status(500).json({ 
                success: false,
                message: 'Lỗi server' 
            });
        }

        if (job.length === 0) {
            return res.status(404).json({ 
                success: false,
                message: 'Công việc không tồn tại' 
            });
        }

        // 2. Lấy thống kê
        db.query(
            `SELECT luot_xem AS views, luot_ung_tuyen AS applications
             FROM Thong_Ke_Cong_Viec 
             WHERE id_congviec = ?`,
            [id],
            (err, stats) => {
                if (err) {
                    console.error('Lỗi khi lấy thống kê:', err);
                    return res.status(500).json({ 
                        success: false,
                        message: 'Lỗi server' 
                    });
                }

                res.json({
                    success: true,
                    data: stats[0] || { views: 0, applications: 0 }
                });
            }
        );
    });
    
};




module.exports = { getAllActivities, getActivityById, addActivity, deleteActivity, updateActivity, getAdminStats, getRecentActivities, lockUser, 
    updateJobStatus, sendNotification, getJobStats };
