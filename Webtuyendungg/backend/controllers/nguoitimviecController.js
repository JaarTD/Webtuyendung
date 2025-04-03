const db = require("../config/db");

// Helper function to verify job seeker
const verifyJobSeeker = (userId, callback) => {
    db.query(
        "SELECT vai_tro FROM Nguoi_Dung WHERE id_nguoidung = ?",
        [userId],
        (err, user) => {
            if (err) return callback(err);
            callback(null, user.length > 0 && user[0].vai_tro === 'nguoitimviec');
        }
    );
};

// 1. Quản lý hồ sơ (đã cập nhật)
const getProfile = (req, res) => {
    if (!req.session.user || !req.session.user.id) {
        return res.status(401).json({ 
            success: false, 
            message: "Unauthorized: User not authenticated" 
        });
    }

    const userId = req.session.user.id;

    db.query(`
        SELECT h.*, n.ten, n.email
        FROM Ho_So_Ca_Nhan h
        JOIN Nguoi_Dung n ON h.id_nguoitimviec = n.id_nguoidung
        WHERE h.id_nguoitimviec = ?
    `, [userId], (err, profile) => {
        if (err) {
            console.error("Lỗi khi lấy hồ sơ:", err);
            return res.status(500).json({ 
                success: false, 
                message: "Lỗi server" 
            });
        }

        if (profile.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: "Hồ sơ không tồn tại" 
            });
        }

        res.json({ 
            success: true, 
            data: profile[0] 
        });
    });
};

const createOrUpdateProfile = (req, res) => {
    const userId = req.session.user?.id;
    const { so_dien_thoai, gioi_tinh, ky_nang, kinh_nghiem, hoc_van } = req.body;

    if (!userId) {
        return res.status(401).json({ 
            success: false, 
            message: "Unauthorized" 
        });
    }

    db.query(
        "SELECT id_hoso FROM Ho_So_Ca_Nhan WHERE id_nguoitimviec = ?", 
        [userId],
        (err, existingProfile) => {
            if (err) {
                console.error("Lỗi khi kiểm tra hồ sơ:", err);
                return res.status(500).json({ 
                    success: false, 
                    message: "Lỗi server" 
                });
            }

            if (existingProfile.length > 0) {
                db.query(
                    `UPDATE Ho_So_Ca_Nhan 
                    SET so_dien_thoai = ?, gioi_tinh = ?, ky_nang = ?, 
                        kinh_nghiem = ?, hoc_van = ?
                    WHERE id_nguoitimviec = ?`,
                    [so_dien_thoai, gioi_tinh, ky_nang, kinh_nghiem, hoc_van, userId],
                    (err, result) => {
                        if (err) {
                            console.error("Lỗi khi cập nhật hồ sơ:", err);
                            return res.status(500).json({ 
                                success: false, 
                                message: "Lỗi server" 
                            });
                        }
                        return res.json({ 
                            success: true, 
                            message: "Cập nhật hồ sơ thành công",
                            isNew: false
                        });
                    }
                );
            } else {
                db.query(
                    `INSERT INTO Ho_So_Ca_Nhan 
                    (id_nguoitimviec, so_dien_thoai, gioi_tinh, ky_nang, kinh_nghiem, hoc_van)
                    VALUES (?, ?, ?, ?, ?, ?)`,
                    [userId, so_dien_thoai, gioi_tinh, ky_nang, kinh_nghiem, hoc_van],
                    (err, result) => {
                        if (err) {
                            console.error("Lỗi khi tạo hồ sơ:", err);
                            return res.status(500).json({ 
                                success: false, 
                                message: "Lỗi server" 
                            });
                        }
                        return res.json({ 
                            success: true, 
                            message: "Tạo hồ sơ thành công",
                            isNew: true,
                            id_hoso: result.insertId
                        });
                    }
                );
            }
        }
    );
};


// 2. Tìm kiếm công việc (không cần xác thực)
const searchJobs = (req, res) => {
    const { keyword, location, salary_min, salary_max, skills, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    let query = `
        SELECT 
            cv.id_congviec, cv.tieu_de, cv.mo_ta, cv.luong, cv.dia_diem, 
            cv.ngay_dang, cv.ngay_het_han, ct.ten_congty, ct.logo
        FROM Cong_Viec cv
        JOIN Cong_Ty ct ON cv.id_congty = ct.id_congty
        WHERE cv.trang_thai = 'hoatdong' AND cv.ngay_het_han >= CURDATE()
    `;
    const params = [];

    if (keyword) {
        query += ` AND (cv.tieu_de LIKE ? OR cv.mo_ta LIKE ?)`;
        params.push(`%${keyword}%`, `%${keyword}%`);
    }
    if (location) query += ` AND cv.dia_diem LIKE ?`, params.push(`%${location}%`);
    if (salary_min) query += ` AND cv.luong >= ?`, params.push(salary_min);
    if (salary_max) query += ` AND cv.luong <= ?`, params.push(salary_max);
    
    if (skills) {
        const skillList = skills.split(',');
        query += ` AND cv.id_congviec IN (
            SELECT cvkn.id_congviec FROM Cong_Viec_Ky_Nang cvkn
            JOIN Danh_Muc_Ky_Nang dmkn ON cvkn.id_kynang = dmkn.id_kynang
            WHERE dmkn.ten_kynang IN (?)
            GROUP BY cvkn.id_congviec
            HAVING COUNT(DISTINCT dmkn.id_kynang) = ?
        )`;
        params.push(skillList, skillList.length);
    }

    const countQuery = query.replace(/SELECT.*?FROM/, 'SELECT COUNT(*) as total FROM')
                           .replace(/LIMIT.*?OFFSET.*?$/, '');

    db.query(countQuery, params, (err, countResult) => {
        if (err) {
            console.error("Lỗi khi đếm công việc:", err);
            return res.status(500).json({ success: false, message: "Lỗi server" });
        }

        query += ` ORDER BY cv.ngay_dang DESC LIMIT ? OFFSET ?`;
        params.push(parseInt(limit), parseInt(offset));

        db.query(query, params, (err, jobs) => {
            if (err) {
                console.error("Lỗi khi tìm kiếm công việc:", err);
                return res.status(500).json({ success: false, message: "Lỗi server" });
            }

            res.json({
                success: true,
                data: {
                    total: countResult[0].total,
                    page: parseInt(page),
                    limit: parseInt(limit),
                    jobs
                }
            });
        });
    });
};

// 3. Chi tiết công việc (cập nhật session)
const getJobDetails = (req, res) => {
    const jobId = req.params.id;
    const userId = req.session.user?.id; // Lấy ID người dùng từ session (nếu đã đăng nhập)

    // 1. Lấy thông tin chi tiết công việc
    const jobQuery = `
        SELECT 
            cv.*, 
            ct.ten_congty, ct.nganh_nghe, ct.dia_chi, ct.website, ct.logo,
            nd.ten AS ten_nhatuyendung,
            GROUP_CONCAT(DISTINCT dmkn.ten_kynang) AS ky_nang,
            (SELECT COUNT(*) FROM Ho_So_Ung_Tuyen WHERE id_congviec = cv.id_congviec) AS so_luong_ung_tuyen
        FROM Cong_Viec cv
        JOIN Cong_Ty ct ON cv.id_congty = ct.id_congty
        JOIN Nguoi_Dung nd ON cv.id_nhatuyendung = nd.id_nguoidung
        LEFT JOIN Cong_Viec_Ky_Nang cvkn ON cv.id_congviec = cvkn.id_congviec
        LEFT JOIN Danh_Muc_Ky_Nang dmkn ON cvkn.id_kynang = dmkn.id_kynang
        WHERE cv.id_congviec = ?
        GROUP BY cv.id_congviec
    `;

    db.query(jobQuery, [jobId], (err, jobResults) => {
        if (err) {
            console.error("Lỗi khi lấy chi tiết công việc:", err);
            return res.status(500).json({ 
                success: false, 
                message: "Lỗi server khi lấy thông tin công việc" 
            });
        }

        if (jobResults.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: "Công việc không tồn tại" 
            });
        }

        const jobData = {
            ...jobResults[0],
            ky_nang: jobResults[0].ky_nang ? jobResults[0].ky_nang.split(',') : []
        };

        // 2. Nếu người dùng đã đăng nhập, kiểm tra trạng thái ứng tuyển và lưu công việc
        if (userId) {
            const statusQuery = `
                SELECT 
                    (SELECT COUNT(*) FROM Ho_So_Ung_Tuyen 
                     WHERE id_congviec = ? AND id_nguoitimviec = ?) AS hasApplied,
                    (SELECT COUNT(*) FROM Ung_Vien_Luu 
                     WHERE ghi_chu = ? AND id_nguoitimviec = ?) AS isSaved
            `;

            db.query(statusQuery, [jobId, userId, jobId, userId], (err, statusResults) => {
                if (err) {
                    console.error("Lỗi khi kiểm tra trạng thái:", err);
                    // Vẫn trả về thông tin công việc nhưng không có trạng thái
                    return res.json({ 
                        success: true, 
                        data: jobData 
                    });
                }

                res.json({
                    success: true,
                    data: {
                        ...jobData,
                        hasApplied: statusResults[0].hasApplied > 0,
                        isSaved: statusResults[0].isSaved > 0
                    }
                });
            });
        } else {
            // Nếu không đăng nhập, chỉ trả về thông tin công việc
            res.json({ 
                success: true, 
                data: jobData 
            });
        }
    });
};

// 4. Quản lý ứng tuyển (cập nhật session)
const applyForJob = (req, res) => {
    const userId = req.session.user?.id;
    const jobId = req.params.id;

    if (!userId) {
        return res.status(401).json({ 
            success: false, 
            message: "Unauthorized" 
        });
    }

    verifyJobSeeker(userId, (err, isJobSeeker) => {
        if (err || !isJobSeeker) {
            return res.status(err ? 500 : 403).json({ 
                success: false, 
                message: err ? "Lỗi server" : "Không có quyền truy cập" 
            });
        }

        db.query(`
            SELECT id_congviec FROM Cong_Viec 
            WHERE id_congviec = ? AND trang_thai = 'hoatdong' AND ngay_het_han >= CURDATE()
        `, [jobId], (err, job) => {
            if (err || job.length === 0) {
                return res.status(err ? 500 : 404).json({ 
                    success: false, 
                    message: err ? "Lỗi server" : "Công việc không khả dụng" 
                });
            }

            db.query(`
                SELECT id_hoso FROM Ho_So_Ung_Tuyen
                WHERE id_congviec = ? AND id_nguoitimviec = ?
            `, [jobId, userId], (err, applied) => {
                if (err) {
                    console.error("Lỗi khi kiểm tra ứng tuyển:", err);
                    return res.status(500).json({ success: false, message: "Lỗi server" });
                }

                if (applied.length > 0) {
                    return res.status(400).json({ 
                        success: false, 
                        message: "Bạn đã ứng tuyển công việc này" 
                    });
                }

                db.query(`
                    INSERT INTO Ho_So_Ung_Tuyen 
                    (id_congviec, id_nguoitimviec, trang_thai, ngay_nop)
                    VALUES (?, ?, 'choxuly', NOW())
                `, [jobId, userId], (err) => {
                    if (err) {
                        console.error("Lỗi khi ứng tuyển:", err);
                        return res.status(500).json({ success: false, message: "Lỗi server" });
                    }

                    db.query(`
                        UPDATE Thong_Ke_Cong_Viec 
                        SET luot_ung_tuyen = luot_ung_tuyen + 1
                        WHERE id_congviec = ?
                    `, [jobId], () => {});

                    res.json({ success: true, message: "Ứng tuyển thành công" });
                });
            });
        });
    });
};

const getApplications = (req, res) => {
    const userId = req.session.user?.id;
    const { status, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    if (!userId) {
        return res.status(401).json({ 
            success: false, 
            message: "Unauthorized" 
        });
    }

    let query = `
        SELECT 
            hs.id_hoso, hs.trang_thai, hs.ngay_nop,
            cv.id_congviec, cv.tieu_de, cv.luong, cv.dia_diem,
            ct.ten_congty, ct.logo
        FROM Ho_So_Ung_Tuyen hs
        JOIN Cong_Viec cv ON hs.id_congviec = cv.id_congviec
        JOIN Cong_Ty ct ON cv.id_congty = ct.id_congty
        WHERE hs.id_nguoitimviec = ?
    `;
    const params = [userId];

    if (status) {
        query += ` AND hs.trang_thai = ?`;
        params.push(status);
    }

    const countQuery = query.replace(/SELECT.*?FROM/, 'SELECT COUNT(*) as total FROM');

    db.query(countQuery, params, (err, countResult) => {
        if (err) {
            console.error("Lỗi khi đếm đơn ứng tuyển:", err);
            return res.status(500).json({ success: false, message: "Lỗi server" });
        }

        query += ` ORDER BY hs.ngay_nop DESC LIMIT ? OFFSET ?`;
        params.push(parseInt(limit), parseInt(offset));

        db.query(query, params, (err, applications) => {
            if (err) {
                console.error("Lỗi khi lấy đơn ứng tuyển:", err);
                return res.status(500).json({ success: false, message: "Lỗi server" });
            }

            res.json({
                success: true,
                data: {
                    total: countResult[0].total,
                    page: parseInt(page),
                    limit: parseInt(limit),
                    applications
                }
            });
        });
    });
};

const withdrawApplication = (req, res) => {
    const userId = req.session.user?.id;
    const applicationId = req.params.id;

    if (!userId) {
        return res.status(401).json({ 
            success: false, 
            message: "Unauthorized" 
        });
    }

    verifyJobSeeker(userId, (err, isJobSeeker) => {
        if (err || !isJobSeeker) {
            return res.status(err ? 500 : 403).json({ 
                success: false, 
                message: err ? "Lỗi server" : "Không có quyền truy cập" 
            });
        }

        db.query(`
            SELECT id_congviec FROM Ho_So_Ung_Tuyen
            WHERE id_hoso = ? AND id_nguoitimviec = ? AND trang_thai = 'choxuly'
        `, [applicationId, userId], (err, application) => {
            if (err) {
                console.error("Lỗi khi kiểm tra đơn ứng tuyển:", err);
                return res.status(500).json({ success: false, message: "Lỗi server" });
            }

            if (application.length === 0) {
                return res.status(404).json({ 
                    success: false, 
                    message: "Không thể rút đơn ứng tuyển" 
                });
            }

            db.query(`
                DELETE FROM Ho_So_Ung_Tuyen
                WHERE id_hoso = ?
            `, [applicationId], (err, result) => {
                if (err) {
                    console.error("Lỗi khi rút đơn ứng tuyển:", err);
                    return res.status(500).json({ success: false, message: "Lỗi server" });
                }

                res.json({ success: true, message: "Đã rút đơn ứng tuyển" });
            });
        });
    });
};

// 5. Quản lý công việc đã lưu (cập nhật session)
const saveJob = (req, res) => {
    const userId = req.session.user?.id;
    const jobId = req.params.id;

    verifyJobSeeker(userId, (err, isJobSeeker) => {
        if (err || !isJobSeeker) {
            return res.status(err ? 500 : 403).json({ 
                success: false, 
                message: err ? "Lỗi server" : "Không có quyền truy cập" 
            });
        }

        // Lấy thông tin công việc để lấy id_nhatuyendung
        db.query(
            "SELECT id_nhatuyendung FROM Cong_Viec WHERE id_congviec = ?",
            [jobId],
            (err, job) => {
                if (err || job.length === 0) {
                    return res.status(err ? 500 : 404).json({ 
                        success: false, 
                        message: err ? "Lỗi server" : "Công việc không tồn tại" 
                    });
                }

                const nhaTuyenDungId = job[0].id_nhatuyendung;

                // Kiểm tra đã lưu chưa
                db.query(
                    "SELECT id_luu FROM Ung_Vien_Luu WHERE ghi_chu = ? AND id_nguoitimviec = ?",
                    [jobId, userId],
                    (err, saved) => {
                        if (err) {
                            console.error("Lỗi khi kiểm tra lưu:", err);
                            return res.status(500).json({ success: false, message: "Lỗi server" });
                        }

                        if (saved.length > 0) {
                            return res.status(400).json({ 
                                success: false, 
                                message: "Bạn đã lưu công việc này trước đó" 
                            });
                        }

                        // Lưu công việc (sử dụng ghi_chu để lưu id_congviec)
                        db.query(
                            "INSERT INTO Ung_Vien_Luu (id_nhatuyendung, id_nguoitimviec, ghi_chu, ngay_luu) VALUES (?, ?, ?, NOW())",
                            [nhaTuyenDungId, userId, jobId],
                            (err) => {
                                if (err) {
                                    console.error("Lỗi khi lưu:", err);
                                    return res.status(500).json({ success: false, message: "Lỗi server" });
                                }
                                res.json({ success: true, message: "Đã lưu công việc" });
                            }
                        );
                    }
                );
            }
        );
    });
};

const unsaveJob = (req, res) => {
    const userId = req.session.user?.id;
    const jobId = req.params.id;

    verifyJobSeeker(userId, (err, isJobSeeker) => {
        if (err || !isJobSeeker) {
            return res.status(err ? 500 : 403).json({ 
                success: false, 
                message: err ? "Lỗi server" : "Không có quyền truy cập" 
            });
        }

        // Xóa bản ghi lưu công việc
        db.query(
            "DELETE FROM Ung_Vien_Luu WHERE ghi_chu = ? AND id_nguoitimviec = ?",
            [jobId, userId],
            (err, result) => {
                if (err) {
                    console.error("Lỗi khi bỏ lưu:", err);
                    return res.status(500).json({ success: false, message: "Lỗi server" });
                }

                if (result.affectedRows === 0) {
                    return res.status(404).json({ 
                        success: false, 
                        message: "Công việc chưa được lưu" 
                    });
                }

                res.json({ success: true, message: "Đã bỏ lưu công việc" });
            }
        );
    });
};

const getSavedJobs = (req, res) => {
    const userId = req.session.user?.id;
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    if (!userId) {
        return res.status(401).json({ 
            success: false, 
            message: "Unauthorized" 
        });
    }

    // Query tổng số lượng
    const countQuery = `
        SELECT COUNT(*) as total 
        FROM Ung_Vien_Luu ul
        JOIN Cong_Viec cv ON ul.ghi_chu = cv.id_congviec
        WHERE ul.id_nguoitimviec = ? AND cv.trang_thai = 'hoatdong' AND cv.ngay_het_han >= CURDATE()
    `;

    db.query(countQuery, [userId], (err, countResult) => {
        if (err) {
            console.error("Lỗi khi đếm công việc đã lưu:", err);
            return res.status(500).json({ success: false, message: "Lỗi server" });
        }

        // Query dữ liệu
        const dataQuery = `
            SELECT 
                cv.id_congviec, cv.tieu_de, cv.mo_ta, cv.luong, cv.dia_diem, 
                cv.ngay_dang, cv.ngay_het_han, ct.ten_congty, ct.logo
            FROM Ung_Vien_Luu ul
            JOIN Cong_Viec cv ON ul.ghi_chu = cv.id_congviec
            JOIN Cong_Ty ct ON cv.id_congty = ct.id_congty
            WHERE ul.id_nguoitimviec = ? AND cv.trang_thai = 'hoatdong' AND cv.ngay_het_han >= CURDATE()
            ORDER BY ul.ngay_luu DESC
            LIMIT ? OFFSET ?
        `;

        db.query(dataQuery, [userId, parseInt(limit), parseInt(offset)], (err, savedJobs) => {
            if (err) {
                console.error("Lỗi khi lấy công việc đã lưu:", err);
                return res.status(500).json({ success: false, message: "Lỗi server" });
            }

            res.json({
                success: true,
                data: {
                    total: countResult[0].total,
                    page: parseInt(page),
                    limit: parseInt(limit),
                    jobs: savedJobs
                }
            });
        });
    });
};

// 6. Quản lý thông báo (cập nhật session)
const getNotifications = (req, res) => {
    const userId = req.session.user?.id;
    const { unread, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    // Sửa câu query để không dùng da_doc nếu cột không tồn tại
    let query = `
        SELECT id_thongbao, noi_dung, loai, ngay_tao
        FROM Thong_Bao
        WHERE id_nguoidung = ? OR id_nguoidung IS NULL
    `;
    const params = [userId];

    

    const countQuery = query.replace(/SELECT.*?FROM/, 'SELECT COUNT(*) as total FROM');

    db.query(countQuery, params, (err, countResult) => {
        if (err) {
            console.error("Lỗi khi đếm thông báo:", err);
            return res.status(500).json({ success: false, message: "Lỗi server" });
        }

        query += ` ORDER BY ngay_tao DESC LIMIT ? OFFSET ?`;
        params.push(parseInt(limit), parseInt(offset));

        db.query(query, params, (err, notifications) => {
            if (err) {
                console.error("Lỗi khi lấy thông báo:", err);
                return res.status(500).json({ success: false, message: "Lỗi server" });
            }

            res.json({
                success: true,
                data: {
                    total: countResult[0].total,
                    page: parseInt(page),
                    limit: parseInt(limit),
                    notifications
                }
            });
        });
    });
};

const markNotificationAsRead = (req, res) => {
    const userId = req.session.user?.id;
    const notificationId = req.params.id;

    if (!userId) {
        return res.status(401).json({ 
            success: false, 
            message: "Unauthorized" 
        });
    }

    db.query(`
        UPDATE Thong_Bao
        SET da_doc = 1
        WHERE id_thongbao = ? AND (id_nguoidung = ? OR id_nguoidung IS NULL)
    `, [notificationId, userId], (err, result) => {
        if (err) {
            console.error("Lỗi khi đánh dấu đã đọc:", err);
            return res.status(500).json({ success: false, message: "Lỗi server" });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: "Thông báo không tồn tại" });
        }

        res.json({ success: true, message: "Đã đánh dấu đã đọc" });
    });
};

// 7. Công việc đề xuất (cập nhật session)
const getRecommendedJobs = (req, res) => {
    const userId = req.session.user?.id;
    const { page = 1, limit = 4 } = req.query;
    const offset = (page - 1) * limit;

    if (!userId) {
        return res.status(401).json({ 
            success: false, 
            message: "Unauthorized" 
        });
    }

    db.query(`
        SELECT ky_nang FROM Ho_So_Ca_Nhan
        WHERE id_nguoitimviec = ?
    `, [userId], (err, profile) => {
        if (err) {
            console.error("Lỗi khi lấy kỹ năng:", err);
            return res.status(500).json({ success: false, message: "Lỗi server" });
        }

        if (profile.length === 0 || !profile[0].ky_nang) {
            return res.status(400).json({ 
                success: false, 
                message: "Vui lòng cập nhật kỹ năng trong hồ sơ" 
            });
        }

        const userSkills = profile[0].ky_nang.split(',').map(skill => skill.trim());

        const countQuery = `
            SELECT COUNT(DISTINCT cv.id_congviec) AS total
            FROM Cong_Viec cv
            JOIN Cong_Viec_Ky_Nang cvkn ON cv.id_congviec = cvkn.id_congviec
            JOIN Danh_Muc_Ky_Nang dmkn ON cvkn.id_kynang = dmkn.id_kynang
            WHERE cv.trang_thai = 'hoatdong' 
              AND cv.ngay_het_han >= CURDATE()
              AND dmkn.ten_kynang IN (?)
        `;

        db.query(countQuery, [userSkills], (err, countResult) => {
            if (err) {
                console.error("Lỗi khi đếm công việc đề xuất:", err);
                return res.status(500).json({ success: false, message: "Lỗi server" });
            }

            const dataQuery = `
                SELECT 
                    cv.id_congviec, cv.tieu_de, cv.mo_ta, cv.luong, cv.dia_diem, 
                    cv.ngay_dang, cv.ngay_het_han, ct.ten_congty, ct.logo,
                    COUNT(DISTINCT dmkn.id_kynang) AS matched_skills
                FROM Cong_Viec cv
                JOIN Cong_Ty ct ON cv.id_congty = ct.id_congty
                JOIN Cong_Viec_Ky_Nang cvkn ON cv.id_congviec = cvkn.id_congviec
                JOIN Danh_Muc_Ky_Nang dmkn ON cvkn.id_kynang = dmkn.id_kynang
                WHERE cv.trang_thai = 'hoatdong' 
                  AND cv.ngay_het_han >= CURDATE()
                  AND dmkn.ten_kynang IN (?)
                GROUP BY cv.id_congviec
                ORDER BY matched_skills DESC, cv.ngay_dang DESC
                LIMIT ? OFFSET ?
            `;

            db.query(dataQuery, [userSkills, parseInt(limit), parseInt(offset)], (err, jobs) => {
                if (err) {
                    console.error("Lỗi khi lấy công việc đề xuất:", err);
                    return res.status(500).json({ success: false, message: "Lỗi server" });
                }

                res.json({
                    success: true,
                    data: {
                        total: countResult[0].total,
                        page: parseInt(page),
                        limit: parseInt(limit),
                        jobs
                    }
                });
            });
        });
    });
};
//api lấy tất cả công việc
const getAllActiveJobs = (req, res) => {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    // Query lấy tất cả công việc đang hoạt động
    const query = `
        SELECT 
            cv.id_congviec, cv.tieu_de, cv.mo_ta, cv.luong, cv.dia_diem, 
            cv.ngay_dang, cv.ngay_het_han, ct.ten_congty, ct.logo,
            GROUP_CONCAT(DISTINCT dmkn.ten_kynang) AS ky_nang
        FROM Cong_Viec cv
        JOIN Cong_Ty ct ON cv.id_congty = ct.id_congty
        LEFT JOIN Cong_Viec_Ky_Nang cvkn ON cv.id_congviec = cvkn.id_congviec
        LEFT JOIN Danh_Muc_Ky_Nang dmkn ON cvkn.id_kynang = dmkn.id_kynang
        WHERE cv.trang_thai = 'hoatdong' AND cv.ngay_het_han >= CURDATE()
        GROUP BY cv.id_congviec
        ORDER BY cv.ngay_dang DESC
        LIMIT ? OFFSET ?
    `;

    // Query đếm tổng số công việc
    const countQuery = `
        SELECT COUNT(*) as total 
        FROM Cong_Viec 
        WHERE trang_thai = 'hoatdong' AND ngay_het_han >= CURDATE()
    `;

    db.query(countQuery, (err, countResult) => {
        if (err) {
            console.error("Lỗi khi đếm công việc:", err);
            return res.status(500).json({ success: false, message: "Lỗi server" });
        }

        db.query(query, [parseInt(limit), parseInt(offset)], (err, jobs) => {
            if (err) {
                console.error("Lỗi khi lấy danh sách công việc:", err);
                return res.status(500).json({ success: false, message: "Lỗi server" });
            }

            res.json({
                success: true,
                data: {
                    total: countResult[0].total,
                    page: parseInt(page),
                    limit: parseInt(limit),
                    jobs: jobs.map(job => ({
                        ...job,
                        ky_nang: job.ky_nang ? job.ky_nang.split(',') : []
                    }))
                }
            });
        });
    });
    // rút đơn
const withdrawApplication = async (req, res) => {
    try {
      const applicationId = req.params.id;
      const userId = req.session.user.id;
  
      // Kiểm tra đơn ứng tuyển có thuộc về user này không
      const application = await Application.findOne({
        where: {
          id_hoso: applicationId,
          id_nguoitimviec: userId,
          trang_thai: 'choxuly' // Chỉ cho phép rút khi đang chờ xử lý
        }
      });
  
      if (!application) {
        return res.status(404).json({ 
          success: false, 
          message: 'Không tìm thấy đơn ứng tuyển hoặc không thể rút' 
        });
      }
  
      // Xóa đơn ứng tuyển
      await application.destroy();
  
      res.json({ success: true, message: 'Đã rút đơn ứng tuyển thành công' });
    } catch (error) {
      console.error('Lỗi khi rút đơn ứng tuyển:', error);
      res.status(500).json({ success: false, message: 'Lỗi server' });
    }
  };
};


module.exports = {
    withdrawApplication,
    getProfile,
    createOrUpdateProfile,
    searchJobs,
    getJobDetails,
    applyForJob,
    getApplications,
    withdrawApplication,
    saveJob,
    unsaveJob,
    getSavedJobs,
    getNotifications,
    markNotificationAsRead,
    getRecommendedJobs,
    getAllActiveJobs 
};