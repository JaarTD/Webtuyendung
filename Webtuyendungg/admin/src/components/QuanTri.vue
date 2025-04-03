<template>
  <div class="admin-container">
    <!-- Sidebar cải tiến -->
     
     <div class="admin-sidebar">
      <div class="sidebar-header">
        <div class="admin-avatar">
          <img :src="avatarUrl" alt="Admin Avatar" />
        </div>
        <h2>Admin Dashboard</h2>
        <p>Xin chào, Admin!</p>
      </div>
      
      <div class="sidebar-menu">
        <router-link to="/admin" class="sidebar-link" active-class="active">
          <i class="fas fa-tachometer-alt"></i>
          <span>Tổng quan</span>
          <div class="link-hover-effect"></div>
        </router-link>
        
        <router-link to="/admin/userlist" class="sidebar-link" active-class="active">
          <i class="fas fa-users"></i>
          <span>Quản lý người dùng</span>
          <div class="link-hover-effect"></div>
        </router-link>
        
        <router-link to="/admin/joblist" class="sidebar-link" active-class="active">
          <i class="fas fa-briefcase"></i>
          <span>Quản lý công việc</span>
          <div class="link-hover-effect"></div>
        </router-link>
        
        <router-link to="/admin/companies" class="sidebar-link" active-class="active">
          <i class="fas fa-building"></i>
          <span>Quản lý công ty</span>
          <div class="link-hover-effect"></div>
        </router-link>
        
        <div class="menu-divider"></div>
        
        <router-link to="/admin/system" class="sidebar-link" active-class="active">
          <i class="fas fa-cogs"></i>
          <span>Cài đặt hệ thống</span>
          <div class="link-hover-effect"></div>
        </router-link>
      </div>
      
      <div class="sidebar-footer">
        <button class="logout-btn">
          <i class="fas fa-sign-out-alt"></i>
          <span>Đăng xuất</span>
        </button>
      </div>
    </div>

    <!-- Main Content -->
    <div class="admin-main">
      <div class="admin-content">
        <!-- Header -->
        <div class="content-header">
          <h1>Tổng quan hệ thống</h1>
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
        
        <!-- Thống kê tổng quan -->
        <div class="dashboard-stats">
          <div class="stat-card gradient-blue">
            <div class="stat-icon">
              <i class="fas fa-users"></i>
            </div>
            <div class="stat-info">
              <h3>Tổng người dùng</h3>
              <p>{{ stats.totalUsers }}</p>
            </div>
            <div class="stat-trend up">
              <i class="fas fa-arrow-up"></i> 12%
            </div>
          </div>
          
          <div class="stat-card gradient-orange">
            <div class="stat-icon">
              <i class="fas fa-user-tie"></i>
            </div>
            <div class="stat-info">
              <h3>Nhà tuyển dụng</h3>
              <p>{{ stats.employers }}</p>
            </div>
            <div class="stat-trend up">
              <i class="fas fa-arrow-up"></i> 5%
            </div>
          </div>
          
          <div class="stat-card gradient-green">
            <div class="stat-icon">
              <i class="fas fa-user-graduate"></i>
            </div>
            <div class="stat-info">
              <h3>Người tìm việc</h3>
              <p>{{ stats.jobSeekers }}</p>
            </div>
            <div class="stat-trend down">
              <i class="fas fa-arrow-down"></i> 2%
            </div>
          </div>
        </div>

        <!-- Biểu đồ và hoạt động -->
        <div class="dashboard-content">
          <div class="chart-container">
            <div class="chart-header">
              <h2>Thống kê hệ thống</h2>
              <div class="chart-actions">
                <button class="chart-action-btn active">Tuần</button>
                <button class="chart-action-btn">Tháng</button>
                <button class="chart-action-btn">Năm</button>
              </div>
            </div>
            <div class="chart-wrapper">
              <canvas id="adminChart"></canvas>
            </div>
          </div>
          
          <div class="activities-container">
  <div class="activities-header">
    <h2>Hoạt động gần đây</h2>
    <button 
      class="view-all-btn" 
      @click="fetchRecentActivities"
      :disabled="loadingActivities"
    >
      <i class="fas fa-sync-alt" :class="{ 'fa-spin': loadingActivities }"></i>
      Tải lại
    </button>
  </div>
  
  <div v-if="loadingActivities" class="loading-state">
    <i class="fas fa-spinner fa-spin"></i> Đang tải...
  </div>
  
  <div v-else-if="activitiesError" class="error-state">
    <i class="fas fa-exclamation-triangle"></i> 
    {{ activitiesError }}
  </div>
  
  <div v-else-if="recentActivities.length === 0" class="empty-state">
    <i class="fas fa-info-circle"></i>
    Không có hoạt động nào
  </div>
  <div v-else class="activities-list">
    <div 
      v-for="activity in recentActivities" 
      :key="activity.id_hoatdong" 
      class="activity-item"
    >
      <div class="activity-icon" :class="getActivityClass(activity.loai_hoatdong)">
        <i :class="getActivityIcon(activity.loai_hoatdong)"></i>
      </div>
      <div class="activity-details">
        <p class="activity-title">{{ activity.mo_ta }}</p>
        <p 
          class="activity-time" 
          :class="{ 'text-muted': !activity.ngay_thuchien }"
        >
          {{ formatDate(activity.ngay_thuchien) }}
        </p>
      </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import Chart from "chart.js/auto";

export default {
  name: "AdminDashboard",
  data() {
    return {
      avatarUrl: "https://i.pinimg.com/736x/db/52/89/db5289464a09b13010c1c8dc177672e2.jpg",
      currentTime: new Date().toLocaleString(),
      stats: {
        totalUsers: 0,
        employers: 0,
        jobSeekers: 0,
        activeJobs: 0
      },
      recentActivities: [],
      chart: null,
      loadingActivities: false,
      activitiesError: null
    };
  },
  
  methods: {
    formatDate(dateString) {
      if (!dateString) return 'Chưa cập nhật';
      
      try {
        const date = new Date(dateString);
        
        if (isNaN(date.getTime())) {
          return 'Ngày không hợp lệ';
        }
        
        const options = {
          timeZone: 'Asia/Ho_Chi_Minh',
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        };
        
        return date.toLocaleString('vi-VN', options);
      } catch (error) {
        console.error('Lỗi định dạng ngày:', dateString, error);
        return 'Lỗi hiển thị ngày';
      }
    },
    
    getActivityDescription(type) {
      const descriptions = {
        phe_duyet_hoso: "Phê duyệt hồ sơ ứng viên",
        dang_bai_viec: "Đăng bài tuyển dụng mới",
        cap_nhat_congty: "Cập nhật thông tin công ty"
      };
      return descriptions[type] || `Hoạt động hệ thống (${type})`;
    },

    getActivityClass(type) {
      const classes = {
        phe_duyet_hoso: "bg-green",
        dang_bai_viec: "bg-blue",
        cap_nhat_congty: "bg-orange"
      };
      return classes[type] || "bg-purple";
    },
    
    getActivityIcon(type) {
      const icons = {
        phe_duyet_hoso: "fas fa-user-check",
        dang_bai_viec: "fas fa-briefcase",
        cap_nhat_congty: "fas fa-building"
      };
      return icons[type] || "fas fa-cog";
    },
    
    async fetchStats() {
      try {
        const response = await axios.get("http://localhost:3000/api/admin/stats");
        this.stats = response.data;
        this.updateChart();
      } catch (error) {
        console.error("Lỗi khi lấy số liệu thống kê:", error);
      }
    },
    
    async fetchRecentActivities() {
      this.loadingActivities = true;
      this.activitiesError = null;
      
      try {
        const response = await axios.get("http://localhost:3000/api/admin/hoatdong", {
          withCredentials: true
        });
        
        console.log("Dữ liệu hoạt động:", response.data);
        
        this.recentActivities = response.data.map(activity => ({
          ...activity,
          // Thêm mô tả hoạt động
          mo_ta: this.getActivityDescription(activity.loai_hoatdong),
          // Đảm bảo có trường ngày
          ngay_tao: activity.ngay_thuchien || new Date().toISOString()
        }));
        
      } catch (error) {
        console.error("Lỗi khi lấy hoạt động:", {
          message: error.message,
          response: error.response?.data
        });
        this.activitiesError = "Không thể tải danh sách hoạt động";
        this.recentActivities = [];
      } finally {
        this.loadingActivities = false;
      }
    },
    
    updateChart() {
      if (this.chart) {
        this.chart.destroy();
      }
      const ctx = document.getElementById("adminChart").getContext("2d");
      this.chart = new Chart(ctx, {
        type: "bar",
        data: {
          labels: ["Tổng người dùng", "Nhà tuyển dụng", "Người tìm việc"],
          datasets: [{
            label: "Số lượng",
            data: [
              this.stats.totalUsers,
              this.stats.employers,
              this.stats.jobSeekers
            ],
            backgroundColor: [
              "rgba(78, 115, 223, 0.8)",
              "rgba(246, 194, 62, 0.8)",
              "rgba(28, 200, 138, 0.8)"
            ],
            borderColor: [
              "rgba(78, 115, 223, 1)",
              "rgba(246, 194, 62, 1)",
              "rgba(28, 200, 138, 1)"
            ],
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              grid: {
                color: "rgba(0, 0, 0, 0.05)"
              }
            },
            x: {
              grid: {
                display: false
              }
            }
          }
        }
      });
    }
  },
  mounted() {
    this.fetchStats();
    this.fetchRecentActivities();

    this.timeInterval = setInterval(() => {
      this.currentTime = new Date().toLocaleString();
    }, 60000);
  },
  
  beforeUnmount() {
    clearInterval(this.timeInterval);
    if (this.chart) {
      this.chart.destroy();
    }
  }
};
</script>

<style scoped>
.admin-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
}
:root {
  --sidebar-bg: #1a2035;
  --sidebar-text: #a0a7c1;
  --sidebar-active: #2d3653;
  --primary: #4e73df;
  --secondary: #858796;
  --success: #1cc88a;
  --info: #36b9cc;
  --warning: #f6c23e;
  --danger: #e74a3b;
  --light: #f8f9fc;
  --dark: #5a5c69;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: 'Nunito', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.admin-container {
  display: flex;
  min-height: 100vh;
  background-color: #f8f9fc;
}

/* Sidebar cải tiến */
.admin-sidebar {
  width: 280px;
  background: var(--sidebar-bg);
  color: var(--sidebar-text);
  display: flex;
  flex-direction: column;
  height: 100vh;
  position: sticky;
  top: 0;
  box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
}

.sidebar-header {
  padding: 25px;
  text-align: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.admin-avatar {
  width: 80px;
  height: 80px;
  margin: 0 auto 15px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 30px;
  color: rgb(65, 30, 30);
}

.sidebar-header h2 {
  color: rgb(0, 0, 0);
  font-size: 18px;
  margin-bottom: 5px;
}

.sidebar-header p {
  font-size: 13px;
  opacity: 0.8;
}

.sidebar-menu {
  flex: 1;
  padding: 20px 0;
  overflow-y: auto;
}

.sidebar-link {
  display: flex;
  align-items: center;
  padding: 14px 25px;
  color: var(--sidebar-text);
  text-decoration: none;
  position: relative;
  transition: all 0.3s;
  margin: 5px 15px;
  border-radius: 5px;
}

.sidebar-link i {
  margin-right: 12px;
  width: 20px;
  text-align: center;
  font-size: 16px;
}

.sidebar-link span {
  font-size: 14px;
  font-weight: 500;
}

.link-hover-effect {
  position: absolute;
  left: 0;
  top: 0;
  width: 3px;
  height: 100%;
  background: var(--primary);
  opacity: 0;
  transition: all 0.3s;
  border-radius: 3px 0 0 3px;
}

.sidebar-link:hover {
  color: rgb(119, 71, 71);
  background: rgba(255, 255, 255, 0.05);
}

.sidebar-link:hover .link-hover-effect {
  opacity: 1;
}

.sidebar-link.active {
  background: var(--sidebar-active);
  color: rgb(135, 96, 96);
}

.sidebar-link.active .link-hover-effect {
  opacity: 1;
}

.menu-divider {
  height: 1px;
  background: rgba(255, 255, 255, 0.1);
  margin: 15px 20px;
}

.sidebar-footer {
  padding: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.logout-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: 12px;
  background: rgba(255, 255, 255, 0.1);
  color: var(--sidebar-text);
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 14px;
}

.logout-btn i {
  margin-right: 10px;
}

.logout-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  color: rgb(106, 78, 78);
}

/* Main content */
.admin-main {
  flex: 1;
  overflow-x: hidden;
}

.admin-content {
  padding: 25px;
}

.content-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.content-header h1 {
  color: var(--dark);
  font-size: 24px;
  font-weight: 700;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 20px;
}

.notification-bell {
  position: relative;
  cursor: pointer;
  color: var(--secondary);
  font-size: 18px;
}

.notification-badge {
  position: absolute;
  top: -5px;
  right: -5px;
  background: var(--danger);
  color: rgb(128, 84, 84);
  border-radius: 50%;
  width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
}

.current-time {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--secondary);
  font-size: 14px;
}

.current-time i {
  font-size: 16px;
}

/* Thống kê */
.dashboard-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card {
  background: white;
  border-radius: 10px;
  padding: 20px;
  display: flex;
  align-items: center;
  box-shadow: 0 0.15rem 1.75rem 0 rgba(58, 59, 69, 0.1);
  transition: transform 0.3s;
  position: relative;
  overflow: hidden;
}

.stat-card:hover {
  transform: translateY(-5px);
}

.stat-icon {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 15px;
  color: white;
  font-size: 20px;
}

.stat-info {
  flex: 1;
}

.stat-info h3 {
  font-size: 14px;
  color: var(--secondary);
  margin-bottom: 5px;
  font-weight: 600;
}

.stat-info p {
  font-size: 24px;
  font-weight: 700;
  color: var(--dark);
}

.stat-trend {
  font-size: 12px;
  font-weight: 600;
  padding: 3px 8px;
  border-radius: 20px;
}

.stat-trend.up {
  background: rgba(28, 200, 138, 0.1);
  color: var(--success);
}

.stat-trend.down {
  background: rgba(231, 74, 59, 0.1);
  color: var(--danger);
}

.gradient-blue {
  background: linear-gradient(135deg, #4e73df 0%, #224abe 100%);
}

.gradient-orange {
  background: linear-gradient(135deg, #f6c23e 0%, #dda20a 100%);
}

.gradient-green {
  background: linear-gradient(135deg, #1cc88a 0%, #13855c 100%);
}

.gradient-blue .stat-icon,
.gradient-blue .stat-info h3,
.gradient-blue .stat-info p,
.gradient-blue .stat-trend {
  color: white !important;
}

.gradient-orange .stat-icon,
.gradient-orange .stat-info h3,
.gradient-orange .stat-info p,
.gradient-orange .stat-trend {
  color: white !important;
}

.gradient-green .stat-icon,
.gradient-green .stat-info h3,
.gradient-green .stat-info p,
.gradient-green .stat-trend {
  color: white !important;
}

/* Biểu đồ và hoạt động */
.dashboard-content {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 20px;
}

.chart-container {
  background: white;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 0.15rem 1.75rem 0 rgba(58, 59, 69, 0.1);
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.chart-header h2 {
  font-size: 18px;
  color: var(--dark);
  font-weight: 600;
}

.chart-actions {
  display: flex;
  gap: 10px;
}

.chart-action-btn {
  padding: 5px 15px;
  background: #505c81;
  border: 1px solid #2f3239;
  border-radius: 5px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.3s;
}

.chart-action-btn:hover {
  background: #4b4b4c;
}

.chart-action-btn.active {
  background: var(--primary);
  color: rgb(77, 67, 67);
  border-color: var(--primary);
}

.chart-wrapper {
  height: 300px;
  position: relative;
}

/* Hoạt động gần đây */
.activities-container {
  background: rgb(255, 255, 255);
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 0.15rem 1.75rem 0 rgba(58, 59, 69, 0.1);
}

.activities-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.activities-header h2 {
  font-size: 18px;
  color: var(--dark);
  font-weight: 600;
}

.view-all-btn {
  background: none;
  border: none;
  color: var(--primary);
  font-size: 13px;
  cursor: pointer;
  transition: all 0.3s;
}

.view-all-btn:hover {
  text-decoration: underline;
}

.activities-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.activity-item {
  display: flex;
  gap: 15px;
  padding-bottom: 15px;
  border-bottom: 1px solid #5b5c76;
}

.activity-item:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.activity-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgb(89, 91, 118);
  font-size: 16px;
}

.bg-blue {
  background: var(--primary);
}

.bg-orange {
  background: var(--warning);
}

.bg-green {
  background: var(--success);
}

.bg-purple {
  background: #6f42c1;
}

.activity-details {
  flex: 1;
}

.activity-title {
  font-size: 14px;
  color: var(--dark);
  margin-bottom: 3px;
  font-weight: 500;
}

.activity-time {
  font-size: 12px;
  color: var(--secondary);
}

/* Responsive */
@media (max-width: 992px) {
  .dashboard-content {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .admin-sidebar {
    width: 70px;
    overflow: hidden;
  }
  
  .sidebar-header h2,
  .sidebar-header p,
  .sidebar-link span,
  .logout-btn span {
    display: none;
  }
  
  .sidebar-link {
    justify-content: center;
    margin: 5px 0;
  }
  
  .sidebar-link i {
    margin-right: 0;
    font-size: 18px;
  }
}
</style>