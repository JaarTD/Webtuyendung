const fs = require('fs');
const path = require('path');

const MAINTENANCE_FILE = path.join(__dirname, '../config/maintenance.json');

// Middleware kiểm tra trạng thái bảo trì
exports.checkMaintenance = (req, res, next) => {
  try {
    const maintenanceData = getMaintenanceData();
    const clientIP = req.ip || req.connection.remoteAddress;
    
    if (maintenanceData.enabled) {
      // Kiểm tra IP được phép
      if (maintenanceData.allowedIPs.includes(clientIP)) {
        return next();
      }
      
      // Kiểm tra route API (có thể cho phép một số API nhất định)
      if (req.path.startsWith('/api/auth') || req.path === '/api/system/maintenance/status') {
        return next();
      }
      
      return res.status(503).json({
        success: false,
        maintenance: true,
        message: maintenanceData.message,
        startTime: maintenanceData.startTime,
        endTime: maintenanceData.endTime
      });
    }
    
    next();
  } catch (error) {
    console.error('Maintenance middleware error:', error);
    next();
  }
};

// Bật chế độ bảo trì
exports.enableMaintenance = async (req, res) => {
    try {
      const { message, allowedIPs } = req.body;
      
      // Validate input
      if (!message || typeof message !== 'string') {
        return res.status(400).json({
          success: false,
          message: 'Thông báo bảo trì là bắt buộc và phải là chuỗi'
        });
      }
  
      const maintenanceData = {
        enabled: true,
        message: message.trim(),
        allowedIPs: Array.isArray(allowedIPs) ? allowedIPs.filter(ip => typeof ip === 'string') : [],
        startTime: new Date().toISOString(),
        endTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString() // 2 tiếng sau
      };
  
      await saveMaintenanceData(maintenanceData);
  
      res.json({
        success: true,
        data: maintenanceData
      });
    } catch (error) {
      console.error('Enable maintenance error:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi khi bật chế độ bảo trì',
        error: error.message
      });
    }
  };
// Tắt chế độ bảo trì
exports.disableMaintenance = async (req, res) => {
  try {
    const maintenanceData = {
      enabled: false,
      message: '',
      allowedIPs: [],
      startTime: null,
      endTime: null
    };
    
    fs.writeFileSync(MAINTENANCE_FILE, JSON.stringify(maintenanceData, null, 2));
    
    res.json({
      success: true,
      data: maintenanceData
    });
  } catch (error) {
    console.error('Disable maintenance error:', error);
    res.status(500).json({ success: false, message: 'Lỗi khi tắt chế độ bảo trì' });
  }
};

// Lấy trạng thái bảo trì
exports.getMaintenanceStatus = async (req, res) => {
    try {
      const maintenanceData = getMaintenanceData();
      res.json({
        success: true,
        data: {
          ...maintenanceData,
          allowedIPsText: maintenanceData.allowedIPs.join('\n')
        }
      });
    } catch (error) {
    console.error('Get maintenance status error:', error);
    res.status(500).json({ success: false, message: 'Lỗi khi lấy trạng thái bảo trì' });
  }
};

// Hàm helper đọc file bảo trì
function getMaintenanceData() {
    try {
      // Đảm bảo thư mục config tồn tại
      const configDir = path.join(__dirname, '../config');
      if (!fs.existsSync(configDir)) {
        fs.mkdirSync(configDir, { recursive: true });
      }
  
      const filePath = path.join(configDir, 'maintenance.json');
      
      // Nếu file không tồn tại, tạo file mới với dữ liệu mặc định
      if (!fs.existsSync(filePath)) {
        const defaultData = {
          enabled: false,
          message: '',
          allowedIPs: [],
          startTime: null,
          endTime: null
        };
        fs.writeFileSync(filePath, JSON.stringify(defaultData, null, 2));
        return defaultData;
      }
  
      // Đọc và kiểm tra nội dung file
      const fileContent = fs.readFileSync(filePath, 'utf8').trim();
      if (!fileContent) {
        throw new Error('File is empty');
      }
  
      return JSON.parse(fileContent);
    } catch (error) {
      console.error('Error reading maintenance file:', error);
      
      // Trả về dữ liệu mặc định nếu có lỗi
      return {
        enabled: false,
        message: '',
        allowedIPs: [],
        startTime: null,
        endTime: null
      };
    }
    function saveMaintenanceData(data) {
        try {
          const filePath = path.join(__dirname, '../config/maintenance.json');
          fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
          fs.chmodSync(filePath, 0o600); // Đặt quyền chỉ đọc/ghi cho owner
        } catch (error) {
          console.error('Error saving maintenance data:', error);
          throw error; // Ném lỗi để xử lý ở tầng trên
        }
      }
  }