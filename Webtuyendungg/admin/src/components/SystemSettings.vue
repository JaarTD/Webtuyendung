<template>
    <div class="admin-container">
      <!-- Main Content -->
      <div class="admin-main">
        <div class="admin-content">
          <!-- Header -->
          <div class="content-header">
            <h1>Cài đặt hệ thống</h1>
            <div class="header-actions">
              <div class="notification-bell">
                <i class="fas fa-bell"></i>
                <span class="notification-badge">3</span>
              </div>
              <div class="current-time">
                <i class="fas fa-clock"></i>
                <span>{{ currentTime }}</span>
              </div>
            </div>
          </div>
  
          <!-- Tabs Navigation -->
          <div class="settings-tabs">
            <button 
              v-for="tab in tabs" 
              :key="tab.id"
              @click="activeTab = tab.id"
              :class="{ active: activeTab === tab.id }"
            >
              <i :class="tab.icon"></i>
              {{ tab.name }}
            </button>
          </div>
  
          <!-- Tab Content -->
          <div class="settings-content">
            <!-- Maintenance Settings -->
            <div v-if="activeTab === 'maintenance'" class="tab-pane">
              <div class="settings-card">
                <h3><i class="fas fa-tools"></i> Chế độ bảo trì</h3>
                
                <div class="form-group">
                  <label>Kích hoạt chế độ bảo trì</label>
                  <div class="toggle-switch">
                    <input type="checkbox" id="maintenance-toggle" v-model="maintenanceSettings.enabled">
                    <label for="maintenance-toggle"></label>
                  </div>
                </div>
                
                <div v-if="maintenanceSettings.enabled">
                  <div class="form-group">
                    <label>Thông báo bảo trì</label>
                    <textarea 
                      v-model="maintenanceSettings.message" 
                      placeholder="Nhập thông báo hiển thị cho người dùng"
                      rows="4"
                    ></textarea>
                  </div>
                  
                  <div class="form-group">
                    <label>IP được phép truy cập (mỗi IP một dòng)</label>
                    <textarea
                      v-model="maintenanceSettings.allowedIPsText"
                      placeholder="Nhập các IP được phép truy cập, mỗi IP một dòng"
                      rows="4"
                      @input="updateAllowedIPs"
                    ></textarea>
                    <p class="hint">Các địa chỉ IP này sẽ vẫn có thể truy cập hệ thống</p>
                  </div>
                  
                  <div v-if="maintenanceSettings.startTime" class="form-group">
                    <label>Thời gian bảo trì</label>
                    <div class="time-info">
                      <p><strong>Bắt đầu:</strong> {{ formatDateTime(maintenanceSettings.startTime) }}</p>
                      <p><strong>Kết thúc dự kiến:</strong> {{ formatDateTime(maintenanceSettings.endTime) }}</p>
                    </div>
                  </div>
                </div>
                
                <div class="form-actions">
                  <button 
                    class="save-btn" 
                    @click="toggleMaintenance"
                    :class="{ danger: maintenanceSettings.enabled }"
                  >
                    {{ maintenanceSettings.enabled ? 'Tắt bảo trì' : 'Bật bảo trì' }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  

        

  <script>
  import axios from 'axios';
  
  export default {
    name: 'SystemSettings',
    data() {
  return {
    currentTime: new Date().toLocaleString(),
    activeTab: 'maintenance',
    tabs: [
      { id: 'general', name: 'Cấu hình chung', icon: 'fas fa-cog' },
      { id: 'email', name: 'Cấu hình Email', icon: 'fas fa-envelope' },
      { id: 'maintenance', name: 'Bảo trì hệ thống', icon: 'fas fa-tools' }
    ],
    maintenanceSettings: {
      enabled: false,
      message: 'Hệ thống đang bảo trì. Vui lòng quay lại sau.',
      allowedIPs: [],
      allowedIPsText: '',
      startTime: null,
      endTime: null
    }
  };
},
  methods: {
    async toggleMaintenance() {
  try {
    if (this.maintenanceSettings.enabled) {
      await axios.post('/api/system/maintenance/disable');
      this.$notify({
        title: 'Thành công',
        message: 'Đã tắt chế độ bảo trì',
        type: 'success'
      });
    } else {
      const response = await axios.post('/api/system/maintenance/enable', {
        message: this.maintenanceSettings.message,
        allowedIPs: this.maintenanceSettings.allowedIPs
      });
      
      // Cập nhật trạng thái local
      this.maintenanceSettings = {
        ...this.maintenanceSettings,
        enabled: true,
        startTime: response.data.startTime,
        endTime: response.data.endTime
      };
      
      this.$notify({
        title: 'Thành công',
        message: 'Đã bật chế độ bảo trì',
        type: 'success'
      });
    }
  } catch (error) {
    console.error('Lỗi khi thay đổi chế độ bảo trì:', error);
    
    // Xử lý lỗi an toàn hơn
    let errorMessage = 'Không thể thay đổi chế độ bảo trì';
    if (error.response) {
      errorMessage = error.response.data?.message || 
                    error.response.statusText || 
                    errorMessage;
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    this.$notify.error({
      title: 'Lỗi',
      message: errorMessage
    });
    
    // Reset trạng thái nếu có lỗi
    this.maintenanceSettings.enabled = false;
  }

  },
    updateAllowedIPs() {
    this.maintenanceSettings.allowedIPs = this.maintenanceSettings.allowedIPsText
      .split('\n')
      .map(ip => ip.trim())
      .filter(ip => ip !== '');
  },
    
    async fetchMaintenanceStatus() {
      try {
        const response = await axios.get('/api/system/maintenance/status');
        this.maintenanceSettings = response.data;
      } catch (error) {
        console.error('Lỗi khi lấy trạng thái bảo trì:', error);
      }
    }
  },
  mounted() {
    this.fetchMaintenanceStatus();
    this.timeInterval = setInterval(() => {
      this.currentTime = new Date().toLocaleString();
    }, 60000);
  },
  beforeUnmount() {
    clearInterval(this.timeInterval);
  }
  
};
</script>

<style scoped>
/* Biến màu sắc và phông chữ */
:root {
  --primary: #4361ee;
  --primary-light: #3a86ff;
  --secondary: #7209b7;
  --success: #4cc9f0;
  --warning: #f8961e;
  --danger: #ef233c;
  --dark: #2b2d42;
  --light: #f8f9fa;
  --gray: #6c757d;
  --white: #ffffff;
  --sidebar-bg: #1a2035;
  --sidebar-text: #a0a7c1;
  --sidebar-active: #2d3653;
}

/* Layout tổng thể */
.admin-container {
  display: flex;
  min-height: 100vh;
  background-color: #f5f7fb;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}

.admin-main {
  flex: 1;
  overflow-x: hidden;
  background-color: var(--light);
}

.admin-content {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

/* Header */
.content-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(0,0,0,0.05);
}

.content-header h1 {
  color: var(--dark);
  font-size: 1.75rem;
  font-weight: 700;
  margin: 0;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.notification-bell {
  position: relative;
  cursor: pointer;
  color: var(--gray);
  font-size: 1.25rem;
  transition: all 0.2s;
}

.notification-bell:hover {
  color: var(--primary);
  transform: translateY(-2px);
}

.notification-badge {
  position: absolute;
  top: -5px;
  right: -5px;
  background: var(--danger);
  color: white;
  border-radius: 50%;
  width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.65rem;
  font-weight: 600;
}

.current-time {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--gray);
  font-size: 0.875rem;
  font-weight: 500;
}

.current-time i {
  font-size: 1rem;
}

/* Tabs navigation */
.settings-tabs {
  display: flex;
  border-bottom: 1px solid #e0e0e0;
  margin-bottom: 2rem;
}

.settings-tabs button {
  padding: 0.75rem 1.5rem;
  background: none;
  border: none;
  border-bottom: 3px solid transparent;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--gray);
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
  position: relative;
}

.settings-tabs button i {
  font-size: 1rem;
}

.settings-tabs button:hover {
  color: var(--primary);
}

.settings-tabs button.active {
  color: var(--primary);
  border-bottom-color: var(--primary);
  font-weight: 600;
}

/* Cards và form */
.settings-content {
  background: var(--white);
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
  padding: 2rem;
}

.settings-card {
  margin-bottom: 2rem;
}

.settings-card h3 {
  font-size: 1.25rem;
  color: var(--dark);
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-weight: 600;
}

.settings-card h3 i {
  color: var(--primary);
}

/* Form elements */
.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: var(--dark);
  font-size: 0.875rem;
}

.form-group input[type="text"],
.form-group input[type="email"],
.form-group input[type="number"],
.form-group input[type="password"],
.form-group textarea,
.form-group select {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 0.875rem;
  transition: all 0.3s;
  background-color: var(--light);
}

.form-group input:focus,
.form-group textarea:focus,
.form-group select:focus {
  border-color: var(--primary);
  outline: none;
  box-shadow: 0 0 0 3px rgba(67, 97, 238, 0.1);
}

.form-group textarea {
  min-height: 120px;
  resize: vertical;
}

/* Logo upload */
.logo-upload {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.logo-preview {
  width: 100px;
  height: 100px;
  object-fit: contain;
  border: 1px dashed #d1d3e2;
  border-radius: 8px;
  padding: 0.5rem;
  background-color: var(--light);
}

.logo-upload button {
  padding: 0.5rem 1rem;
  background: var(--white);
  border: 1px solid #d1d3e2;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 0.875rem;
  font-weight: 500;
}

.logo-upload button:hover {
  background: #f1f3f9;
  border-color: var(--primary);
  color: var(--primary);
}

.logo-upload input[type="file"] {
  display: none;
}

/* Buttons */
.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
}

.save-btn {
  padding: 0.75rem 1.5rem;
  background: var(--primary);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.875rem;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.save-btn:hover {
  background: var(--primary-light);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(67, 97, 238, 0.2);
}

.save-btn.danger {
  background: var(--danger);
}

.save-btn.danger:hover {
  background: #d90429;
  box-shadow: 0 4px 12px rgba(239, 35, 60, 0.2);
}

.test-btn {
  padding: 0.75rem 1.5rem;
  background: var(--warning);
  color: var(--white);
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.875rem;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.test-btn:hover {
  background: #f3722c;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(248, 150, 30, 0.2);
}

/* Toggle switch hiện đại */
.toggle-switch {
  position: relative;
  display: inline-block;
  width: 50px;
  height: 26px;
}

.toggle-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-switch label {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  transition: .4s;
  border-radius: 34px;
}

.toggle-switch label:before {
  position: absolute;
  content: "";
  height: 18px;
  width: 18px;
  left: 4px;
  bottom: 4px;
  background-color: white;
  transition: .4s;
  border-radius: 50%;
}

.toggle-switch input:checked + label {
  background-color: var(--primary);
}

.toggle-switch input:checked + label:before {
  transform: translateX(24px);
}

/* Responsive */
@media (max-width: 768px) {
  .admin-content {
    padding: 1.5rem;
  }
  
  .content-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .header-actions {
    width: 100%;
    justify-content: space-between;
  }
  
  .settings-tabs {
    overflow-x: auto;
    white-space: nowrap;
    padding-bottom: 0.5rem;
  }
  
  .form-actions {
    flex-direction: column;
  }
  
  .save-btn, .test-btn {
    width: 100%;
    justify-content: center;
  }
  
  .logo-upload {
    flex-direction: column;
    align-items: flex-start;
  }
}

/* Animation */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.tab-pane {
  animation: fadeIn 0.3s ease-out;
}
</style>