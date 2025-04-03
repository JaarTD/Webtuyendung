const db = require("../config/db");

// Đăng ký tài khoản
const register = async (req, res) => {
  try {
    const { ten, email, mat_khau, vai_tro } = req.body;

    const [users] = await db.promise().query("SELECT * FROM Nguoi_Dung WHERE email = ?", [email]);
    if (users.length > 0) {
      return res.status(400).json({ message: "Email đã tồn tại." });
    }

    const query = "INSERT INTO Nguoi_Dung (ten, email, mat_khau, vai_tro) VALUES (?, ?, ?, ?)";
    await db.promise().query(query, [ten, email, mat_khau, vai_tro]);

    res.status(201).json({ message: "Đăng ký thành công." });
  } catch (error) {
    console.error("Lỗi khi đăng ký:", error);
    res.status(500).json({ message: "Lỗi server!", error: error.message });
  }
};

// Đăng nhập
const login = async (req, res) => {
  try {
    const { email, mat_khau } = req.body;

    const [users] = await db.promise().query("SELECT * FROM Nguoi_Dung WHERE email = ?", [email]);

    if (users.length === 0) {
      return res.status(400).json({ message: "Email không tồn tại!" });
    }

    const user = users[0];

    // Kiểm tra trạng thái tài khoản
    if (user.trang_thai === 'locked') {
      return res.status(403).json({ 
        message: "Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên." 
      });
    }

    console.log("Mật khẩu nhập:", mat_khau);
    console.log("Mật khẩu DB:", user.mat_khau);

    if (mat_khau !== user.mat_khau) {
      return res.status(401).json({ message: "Mật khẩu không đúng!" });
    }

    // Lưu session
    req.session.user = {
      id: user.id_nguoidung,
      email: user.email,
      vai_tro: user.vai_tro,
      trang_thai: user.trang_thai // Thêm trạng thái vào session
    };

    res.json({
      message: "Đăng nhập thành công!",
      user: {
        id_nguoidung: user.id_nguoidung,
        email: user.email,
        vai_tro: user.vai_tro,
        trang_thai: user.trang_thai
      }
    });
  } catch (error) {
    console.error("Lỗi đăng nhập:", error);
    res.status(500).json({ message: "Lỗi server!" });
  }
};

// Kiểm tra session
const checkSession = (req, res) => {
  if (req.session.user) {
    res.json({
      id_nguoidung: req.session.user.id,
      email: req.session.user.email,
      vai_tro: req.session.user.vai_tro,
    });
  } else {
    res.status(404).json({ message: "Không tìm thấy session!" });
  }
};

module.exports = { register, login, checkSession };