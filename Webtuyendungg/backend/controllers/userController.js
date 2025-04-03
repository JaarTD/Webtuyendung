const db = require("../config/db");

const getAllUsers = (req, res) => {
  db.query("SELECT * FROM Nguoi_Dung", (err, results) => {
    if (err) {
      console.error("Lỗi khi lấy danh sách người dùng:", err);
      return res.status(500).send("Lỗi server");
    }
    res.json(results);
  });
};

const createUser = (req, res) => {
  const { ten, email, mat_khau, vai_tro } = req.body;
  const query = "INSERT INTO Nguoi_Dung (ten, email, mat_khau, vai_tro) VALUES (?, ?, ?, ?)";

  db.query(query, [ten, email, mat_khau, vai_tro], (err, result) => {
    if (err) {
      console.error("Lỗi khi thêm người dùng:", err);
      return res.status(500).send("Lỗi server");
    }
    res.status(201).send("Thêm người dùng thành công!");
  });
};

const deleteUser = (req, res) => {
  const { id } = req.params;
  db.query("DELETE FROM Nguoi_Dung WHERE id_nguoidung = ?", [id], (err, result) => {
    if (err) {
      console.error("Lỗi khi xóa người dùng:", err);
      return res.status(500).send("Lỗi server");
    }
    res.send("Xóa người dùng thành công!");
  });
};
const toggleUserStatus = (req, res) => {
  console.log('Nhận yêu cầu thay đổi trạng thái:', {
    params: req.params,
    body: req.body,
    headers: req.headers
  });

  const { id } = req.params;
  const { action } = req.body;

  // Validate input
  if (!action || !['lock', 'unlock'].includes(action)) {
    console.error('Action không hợp lệ:', action);
    return res.status(400).json({ 
      success: false,
      error: "invalid_action",
      message: "Action phải là 'lock' hoặc 'unlock'"
    });
  }

  const newStatus = action === 'lock' ? 'locked' : 'active';
  
  db.query(
    "UPDATE nguoi_dung SET trang_thai = ? WHERE id_nguoidung = ?",
    [newStatus, id],
    (err, result) => {
      if (err) {
        console.error("Lỗi database:", err);
        return res.status(500).json({ 
          success: false,
          error: "database_error",
          message: "Lỗi khi cập nhật database"
        });
      }
      
      if (result.affectedRows === 0) {
        console.error('Không tìm thấy người dùng với ID:', id);
        return res.status(404).json({
          success: false,
          error: "user_not_found",
          message: "Không tìm thấy người dùng"
        });
      }
      
      console.log('Cập nhật thành công:', { userId: id, newStatus });
      res.json({ 
        success: true,
        message: `Đã ${newStatus === 'locked' ? 'khóa' : 'mở khóa'} người dùng thành công`,
        trang_thai: newStatus 
      });
    }
  );
};

module.exports = { getAllUsers, createUser, deleteUser, toggleUserStatus  };
