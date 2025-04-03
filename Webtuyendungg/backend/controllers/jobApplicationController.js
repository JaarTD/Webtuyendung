const db = require('../config/db');

const applicationController = {
    getAllApplications: (req, res) => {
        db.query('SELECT * FROM Ho_So_Ung_Tuyen', (err, results) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            res.json(results);
        });
    },

    getApplicationById: (req, res) => {
        db.query('SELECT * FROM Ho_So_Ung_Tuyen WHERE id_hoso = ?', [req.params.id], (err, results) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            if (results.length === 0) {
                return res.status(404).json({ message: 'Application not found' });
            }
            res.json(results[0]);
        });
    },

    createApplication: (req, res) => {
        const applicationData = {
            id_congviec: req.body.id_congviec,
            id_nguoitimviec: req.body.id_nguoitimviec,
            trang_thai: req.body.trang_thai
        };

        db.query('INSERT INTO Ho_So_Ung_Tuyen SET ?', applicationData, (err, result) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            res.status(201).json({ id: result.insertId, ...applicationData });
        });
    },

    updateApplication: (req, res) => {
        const applicationData = {
            id_congviec: req.body.id_congviec,
            id_nguoitimviec: req.body.id_nguoitimviec,
            trang_thai: req.body.trang_thai
        };

        db.query('UPDATE Ho_So_Ung_Tuyen SET ? WHERE id_hoso = ?', [applicationData, req.params.id], (err, result) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            if (result.affectedRows === 0) {
                return res.status(404).json({ message: 'Application not found' });
            }
            res.json({ message: 'Application updated successfully' });
        });
    },

    deleteApplication: (req, res) => {
        db.query('DELETE FROM Ho_So_Ung_Tuyen WHERE id_hoso = ?', [req.params.id], (err, result) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            if (result.affectedRows === 0) {
                return res.status(404).json({ message: 'Application not found' });
            }
            res.json({ message: 'Application deleted successfully' });
        });
    },

    getApplicationsByJobAndEmployer: (req, res) => {
        const { id_nhatuyendung, id_congviec } = req.params;
        const query = `
            SELECT hs.*, cv.tieu_de AS job_title, nd.ten AS applicant_name, nd.email AS applicant_email, hscn.so_dien_thoai, hscn.gioi_tinh
            FROM Ho_So_Ung_Tuyen hs
            JOIN Cong_Viec cv ON hs.id_congviec = cv.id_congviec
            JOIN Nguoi_Dung nd ON hs.id_nguoitimviec = nd.id_nguoidung
            LEFT JOIN Ho_So_Ca_Nhan hscn ON hs.id_nguoitimviec = hscn.id_nguoitimviec
            WHERE cv.id_nhatuyendung = ?
            AND hs.id_congviec = ?
        `;
        db.query(query, [id_nhatuyendung, id_congviec], (err, results) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            res.json(results);
        });
    },

    getApplicationsByEmployer: (req, res) => {
        const { id_nhatuyendung } = req.params;
        const query = `
            SELECT hs.*, cv.tieu_de AS job_title, nd.ten AS applicant_name, nd.email AS applicant_email, hscn.so_dien_thoai, hscn.gioi_tinh
            FROM Ho_So_Ung_Tuyen hs
            JOIN Cong_Viec cv ON hs.id_congviec = cv.id_congviec
            JOIN Nguoi_Dung nd ON hs.id_nguoitimviec = nd.id_nguoidung
            LEFT JOIN Ho_So_Ca_Nhan hscn ON hs.id_nguoitimviec = hscn.id_nguoitimviec
            WHERE cv.id_nhatuyendung = ?
        `;
        db.query(query, [id_nhatuyendung], (err, results) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            res.json(results);
        });
    },

    getJobsByEmployer: (req, res) => {
        const { id_nhatuyendung } = req.params;
        const query = `
            SELECT id_congviec, tieu_de
            FROM Cong_Viec
            WHERE id_nhatuyendung = ?
        `;
        db.query(query, [id_nhatuyendung], (err, results) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            res.json(results);
        });
    },

    getApplicantDetails: (req, res) => {
        const { id_nguoitimviec } = req.params;

        const profileQuery = `
            SELECT *
            FROM Ho_So_Ca_Nhan
            WHERE id_nguoitimviec = ?
            ORDER BY ngay_tai_len DESC
            LIMIT 1
        `;

        const applicationsQuery = `
            SELECT hs.id_congviec, cv.tieu_de
            FROM Ho_So_Ung_Tuyen hs
            JOIN Cong_Viec cv ON hs.id_congviec = cv.id_congviec
            WHERE hs.id_nguoitimviec = ?
        `;

        db.query(profileQuery, [id_nguoitimviec], (err, profileResults) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            if (profileResults.length === 0) {
                return res.status(404).json({ message: 'Profile not found' });
            }

            db.query(applicationsQuery, [id_nguoitimviec], (err, applicationResults) => {
                if (err) {
                    return res.status(500).json({ error: err.message });
                }

                const response = {
                    profile: profileResults[0],
                    appliedJobs: applicationResults
                };

                res.json(response);
            });
        });
    },

    getJobDetails: (req, res) => {
        const { id_congviec } = req.params;
        const query = `
            SELECT *
            FROM Cong_Viec
            WHERE id_congviec = ?
        `;
        db.query(query, [id_congviec], (err, results) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            if (results.length === 0) {
                return res.status(404).json({ message: 'Job not found' });
            }
            res.json(results[0]);
        });
    }
};

module.exports = applicationController;