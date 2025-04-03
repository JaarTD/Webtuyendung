const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const session = require("express-session");
require("dotenv").config();

const maintenanceController = require('./controllers/maintenance.controller');
const jobRoutes = require('./routes/jobRoutes');
const companyRoutes = require('./routes/companyRoutes');
const notificationRoutes = require("./routes/notificationRoutes");
const userRoutes = require("./routes/userRoutes");
const authRoutes = require("./routes/authRoutes");
const jobApplicationRoutes = require('./routes/jobApplicationRoutes');
const jobSkillRoutes = require('./routes/jobSkillRoutes');
const jobDocumentRoutes = require('./routes/jobDocumentRoutes');
const { isAdmin } = require("./middlewares/authMiddleware");
const adminRoutes = require("./routes/adminRoutes"); 
const congTyRoutes = require('./routes/congTyRoutes');
const maintenanceMiddleware = require('./controllers/maintenance.controller').checkMaintenance;
const nguoitimviecRoutes = require('./routes/nguoitimviecRoutes');
const app = express();
const PORT = process.env.PORT || 3000;

// Cấu hình session trước khi khai báo route
app.use(session({
  secret: process.env.SESSION_SECRET || "123456789",
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // Đổi thành true nếu dùng HTTPS
}));

// Middleware CORS
app.use(cors({
  origin: ['http://localhost:8080', 'http://localhost:8081', 'http://localhost:8082', 'http://localhost:8083'], // Chỉ định rõ các origin
  credentials: true, // Cho phép gửi cookie/session từ client
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

// Middleware body-parser
app.use(bodyParser.json());

// Sử dụng các routes
app.use("/api/auth", authRoutes);
app.use(maintenanceMiddleware); // Middleware kiểm tra bảo trì
app.use("/api/admin", adminRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/companies', companyRoutes);
app.use('/job-applications', jobApplicationRoutes);
app.use('/skills', jobSkillRoutes);
app.use('/documents', jobDocumentRoutes);
app.use("/thongbao", notificationRoutes);
app.use("/users", userRoutes);
app.use("/api", authRoutes);
app.use('/api/congty', congTyRoutes);
app.use('/api/nguoitimviec', nguoitimviecRoutes);
app.get('/api/system/maintenance/status', maintenanceController.getMaintenanceStatus);



// Route dành riêng cho Admin
app.get("/admin/dashboard", isAdmin, (req, res) => {
  res.json({ message: "Chào mừng đến trang quản trị!" });
});

// Lắng nghe server
app.listen(PORT, () => {
  console.log(`Server đang chạy tại http://localhost:${PORT}`);
});
