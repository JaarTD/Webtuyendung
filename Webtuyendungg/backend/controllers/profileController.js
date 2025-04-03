const db = require("../config/db");

exports.getProfileById = async (req, res) => {
  try {
    const userId = req.params.id;
    const query = "SELECT * FROM Ho_So_Ca_Nhan WHERE id_hoso = ?";
    const [results] = await db.query(query, [userId]);

    if (results.length === 0) {
      return res.status(404).json({ message: "Không tìm thấy hồ sơ cá nhân" });
    }
    res.json(results[0]);
  } catch (err) {
    console.error("Lỗi khi lấy thông tin cá nhân:", err);
    res.status(500).json({ message: "Lỗi server" });
  }
};

exports.addProfile = async (req, res) => {
  try {
    const { id_nguoitimviec, ky_nang, kinh_nghiem, hoc_van } = req.body;
    const query = `
      INSERT INTO Ho_So_Ca_Nhan (id_nguoitimviec, ky_nang, kinh_nghiem, hoc_van)
      VALUES (?, ?, ?, ?)
    `;
    const [results] = await db.query(query, [id_nguoitimviec, ky_nang, kinh_nghiem, hoc_van]);

    res.status(201).json({ message: "Thêm hồ sơ cá nhân thành công", id_hoso: results.insertId });
  } catch (err) {
    console.error("Lỗi khi thêm hồ sơ cá nhân:", err);
    res.status(500).json({ message: "Lỗi server" });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const userId = req.params.id;
    const { ky_nang, kinh_nghiem, hoc_van } = req.body;
    const query = `
      UPDATE Ho_So_Ca_Nhan
      SET ky_nang = ?, kinh_nghiem = ?, hoc_van = ?, ngay_tai_len = CURRENT_TIMESTAMP
      WHERE id_hoso = ?
    `;
    const [results] = await db.query(query, [ky_nang, kinh_nghiem, hoc_van, userId]);

    if (results.affectedRows === 0) {
      return res.status(404).json({ message: "Không tìm thấy hồ sơ cá nhân" });
    }
    res.json({ message: "Sửa hồ sơ cá nhân thành công" });
  } catch (err) {
    console.error("Lỗi khi sửa hồ sơ cá nhân:", err);
    res.status(500).json({ message: "Lỗi server" });
  }
};

exports.deleteProfile = async (req, res) => {
  try {
    const userId = req.params.id;
    const query = "DELETE FROM Ho_So_Ca_Nhan WHERE id_hoso = ?";
    const [results] = await db.query(query, [userId]);

    if (results.affectedRows === 0) {
      return res.status(404).json({ message: "Không tìm thấy hồ sơ cá nhân" });
    }
    res.json({ message: "Xóa hồ sơ cá nhân thành công" });
  } catch (err) {
    console.error("Lỗi khi xóa hồ sơ cá nhân:", err);
    res.status(500).json({ message: "Lỗi server" });
  }
};
