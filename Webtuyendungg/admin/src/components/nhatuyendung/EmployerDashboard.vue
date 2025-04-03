<template>
  <div class="employer-dashboard-wrapper">
    <Sidebar />

    <div class="main-content">
      <!-- Header với gradient đẹp hơn -->
      <div class="dashboard-header">
        <div class="header-content">
          <h1><i class="fas fa-briefcase"></i> Trang quản lý nhà tuyển dụng</h1>
          <div class="user-profile">
            <span class="welcome-text">Xin chào, <strong>{{ userName }}</strong></span>
            <button @click="logout" class="logout-btn">
              <i class="fas fa-sign-out-alt"></i> Đăng xuất
            </button>
          </div>
        </div>
      </div>

      <!-- Thống kê với hiệu ứng hover -->
      <div class="stats-grid">
        <div class="stat-card active-jobs">
          <div class="stat-icon">
            <i class="fas fa-check-circle"></i>
          </div>
          <div class="stat-content">
            <h3>Công việc đang hoạt động</h3>
            <p class="stat-number">{{ stats.activeJobs }}</p>
          </div>
        </div>
        
        <!-- <div class="stat-card applications">
          <div class="stat-icon">
            <i class="fas fa-file-alt"></i>
          </div>
          <div class="stat-content">
            <h3>Hồ sơ ứng tuyển</h3>
            <p class="stat-number">{{ stats.applications }}</p>
          </div>
        </div>
        
        <div class="stat-card interviews">
          <div class="stat-icon">
            <i class="fas fa-handshake"></i>
          </div>
          <div class="stat-content">
            <h3>Phỏng vấn</h3>
            <p class="stat-number">{{ stats.interviews }}</p>
          </div>
        </div> -->
      </div>

      <!-- Danh sách công việc với card đẹp hơn -->
      <div class="recent-jobs">
        <div class="section-header">
          <h2><i class="fas fa-list-ul"></i> Công việc gần đây</h2>
          <router-link to="/post-job" class="add-job-btn">
            <i class="fas fa-plus"></i> Đăng công việc mới
          </router-link>
        </div>
        
        <div v-if="loading" class="loading">
          <i class="fas fa-spinner fa-spin"></i> Đang tải dữ liệu...
        </div>
        
        <div v-else-if="error" class="error">
          <i class="fas fa-exclamation-triangle"></i> {{ error }}
        </div>
        
        <div v-else class="jobs-list">
          <div 
            v-for="job in recentJobs" 
            :key="job.id_congviec" 
            class="job-card"
            :class="{ 'inactive-job': job.trang_thai === 'khonghoatdong' }"
          >
            <div class="job-logo">
              <img
                :src="job.logo || 'https://via.placeholder.com/50'"
                alt="Logo công ty"
                @error="onImageError(job.id_congviec, job.logo)"
                class="company-logo"
              />
            </div>
            
            <div class="job-info">
              <div class="job-header">
                <h3 class="job-title">{{ job.tieu_de }}</h3>
                <span class="job-status" :class="job.trang_thai">
                  {{ translateStatus(job.trang_thai) }}
                </span>
              </div>
              
              <div class="job-details">
                <div class="detail-item">
                  <i class="fas fa-building"></i>
                  <span>{{ job.ten_congty || 'N/A' }}</span>
                </div>
                
                <div class="detail-item">
                  <i class="fas fa-map-marker-alt"></i>
                  <span>{{ job.dia_diem || 'N/A' }}</span>
                </div>
                
                <div class="detail-item">
                  <i class="fas fa-money-bill-wave"></i>
                  <span>{{ formatCurrency(job.luong) || 'N/A' }}</span>
                </div>
                
              
              </div>
            </div>
            
            <div class="job-actions">
              <button @click="viewJob(job.id_congviec)" class="view-btn">
                <i class="fas fa-eye"></i> Xem
              </button>
              <button @click="editJob(job.id_congviec)" class="edit-btn">
                <i class="fas fa-edit"></i> Sửa
              </button>
              <button @click="deleteJob(job.id_congviec)" class="delete-btn">
                <i class="fas fa-trash-alt"></i> Xóa
              </button>
            </div>
          </div>
          
          <div v-if="recentJobs.length === 0" class="no-jobs">
            <i class="fas fa-folder-open"></i>
            <p>Bạn chưa đăng công việc nào.</p>
            <router-link to="/post-job" class="add-job-link">
              Đăng công việc ngay
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import Sidebar from './Sidebar.vue';

export default {
  name: 'EmployerDashboard',
  components: {
    Sidebar,
  },
  data() {
    return {
      userName: '',
      stats: {
        activeJobs: 0,
        applications: 0,
        interviews: 0,
      },
      recentJobs: [],
      loading: false,
      error: null,
    };
  },
  created() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!user || !user.id_nguoidung || user.vai_tro !== 'nhatuyendung') {
      this.error = 'Vui lòng đăng nhập với tài khoản nhà tuyển dụng.';
      this.$router.push('/login');
      return;
    }

    this.userName = user.ten || 'Nhà tuyển dụng';
    const id_nhatuyendung = user.id_nguoidung;

    this.fetchJobs(id_nhatuyendung);
  },
  methods: {
    async fetchJobs(id_nhatuyendung) {
      console.log('Đang lấy danh sách công việc cho id_nhatuyendung:', id_nhatuyendung);
      this.loading = true;
      this.error = null;
      try {
        const response = await axios.get('http://localhost:3000/api/jobs/employer', {
          params: { id_nhatuyendung },
          withCredentials: true,
        });
        console.log('Dữ liệu công việc trả về:', response.data);

        this.recentJobs = response.data || [];

        // Kiểm tra ngày hết hạn và cập nhật trạng thái nếu cần
        const currentDate = new Date();
        for (let job of this.recentJobs) {
          const expiryDate = new Date(job.ngay_het_han);
          if (currentDate > expiryDate && job.trang_thai === 'hoatdong') {
            console.log(`Công việc ${job.id_congviec} đã hết hạn. Cập nhật trạng thái thành không hoạt động.`);
            await this.updateJobStatus(job.id_congviec, 'khonghoatdong');
            job.trang_thai = 'khonghoatdong';
          }
        }

        // Log để kiểm tra giá trị logo
        this.recentJobs.forEach(job => {
          console.log(`Công việc ${job.id_congviec}: ten_congty=${job.ten_congty}, logo=${job.logo}, trang_thai=${job.trang_thai}`);
        });

        this.stats.activeJobs = this.recentJobs.filter(job => job.trang_thai === 'hoatdong').length;
        this.stats.applications = this.recentJobs.reduce((total, job) => total + (job.luot_ung_tuyen || 0), 0);
        this.stats.interviews = Math.floor(this.stats.applications * 0.3);
      } catch (error) {
        console.error('Lỗi khi lấy danh sách công việc:', error);
        if (error.response) {
          if (error.response.status === 401 || error.response.status === 403) {
            this.error = 'Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.';
            this.$router.push('/login');
          } else if (error.response.status === 400) {
            this.error = 'Thiếu thông tin id_nhatuyendung. Vui lòng đăng nhập lại.';
            this.$router.push('/login');
          } else {
            this.error = error.response.data?.message || 'Không thể tải danh sách công việc. Vui lòng thử lại sau.';
          }
        } else {
          this.error = 'Không thể kết nối đến server. Vui lòng kiểm tra kết nối và thử lại.';
        }
      } finally {
        this.loading = false;
      }
    },
    async updateJobStatus(jobId, status) {
      try {
        await axios.put(`http://localhost:3000/api/jobs/${jobId}`, {
          trang_thai: status,
        }, {
          withCredentials: true,
        });
        console.log(`Cập nhật trạng thái công việc ${jobId} thành ${status} thành công.`);
      } catch (error) {
        console.error(`Lỗi khi cập nhật trạng thái công việc ${jobId}:`, error);
      }
    },
    async deleteJob(jobId) {
      if (!confirm('Bạn có chắc muốn xóa công việc này không?')) return;

      try {
        await axios.delete(`http://localhost:3000/api/jobs/${jobId}`, {
          withCredentials: true,
        });
        this.recentJobs = this.recentJobs.filter(job => job.id_congviec !== jobId);
        this.updateStats();
        alert('Xóa công việc thành công!');
      } catch (error) {
        console.error('Lỗi khi xóa công việc:', error);
        alert(error.response?.data?.message || 'Không thể xóa công việc. Vui lòng thử lại.');
      }
    },
    editJob(jobId) {
      this.$router.push(`/post-job?id=${jobId}`);
    },
    viewJob(jobId) {
      this.$router.push(`/job-detail/${jobId}`);
    },
    updateStats() {
      this.stats.activeJobs = this.recentJobs.filter(job => job.trang_thai === 'hoatdong').length;
      this.stats.applications = this.recentJobs.reduce((total, job) => total + (job.luot_ung_tuyen || 0), 0);
      this.stats.interviews = Math.floor(this.stats.applications * 0.3);
    },
    logout() {
      localStorage.removeItem('user');
      this.$router.push('/login');
    },
    formatDate(date) {
      if (!date) return 'N/A';
      const d = new Date(date);
      return d.toLocaleDateString('vi-VN');
    },
    formatCurrency(amount) {
      if (!amount) return 'N/A';
      return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    },
    translateStatus(status) {
      switch (status) {
        case 'hoatdong':
          return 'Hoạt động';
        case 'khonghoatdong':
          return 'Không hoạt động';
        default:
          return 'Không xác định';
      }
    },
    onImageError(jobId, logoUrl) {
      console.log(`Lỗi tải logo cho công việc ${jobId}. Logo URL: ${logoUrl}`);
    },
  },
};
</script>

<style scoped>
/* Font Awesome */
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css');

/* Tổng thể */
.employer-dashboard-wrapper {
  display: flex;
  min-height: 100vh;
  background-color: #f8fafc;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

/* Nội dung chính */
.main-content {
  margin-left: 250px;
  padding: 30px;
  flex-grow: 1;
  max-width: calc(100% - 250px);
}

/* Header */
.dashboard-header {
  margin-bottom: 30px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  color: white;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.dashboard-header h1 {
  font-size: 1.8rem;
  font-weight: 600;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 10px;
}

.user-profile {
  display: flex;
  align-items: center;
  gap: 20px;
}

.welcome-text {
  font-size: 1.1rem;
}

.logout-btn {
  padding: 10px 20px;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.logout-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
}

/* Thống kê */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 25px;
  margin-bottom: 40px;
}

.stat-card {
  background: white;
  padding: 25px;
  border-radius: 15px;
  box-shadow: 0 6px 15px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 20px;
  position: relative;
  overflow: hidden;
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}

.stat-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 5px;
  height: 100%;
}

.stat-card.active-jobs::before {
  background: #10b981;
}
.stat-card.applications::before {
  background: #3b82f6;
}
.stat-card.interviews::before {
  background: #f59e0b;
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: white;
}

.stat-card.active-jobs .stat-icon {
  background: #10b981;
}
.stat-card.applications .stat-icon {
  background: #3b82f6;
}
.stat-card.interviews .stat-icon {
  background: #f59e0b;
}

.stat-content {
  flex: 1;
}

.stat-card h3 {
  font-size: 1.1rem;
  font-weight: 500;
  color: #64748b;
  margin: 0 0 5px 0;
}

.stat-number {
  font-size: 2rem;
  font-weight: 700;
  margin: 0;
}

.stat-card.active-jobs .stat-number {
  color: #10b981;
}
.stat-card.applications .stat-number {
  color: #3b82f6;
}
.stat-card.interviews .stat-number {
  color: #f59e0b;
}

/* Danh sách công việc */
.recent-jobs {
  background: white;
  padding: 30px;
  border-radius: 15px;
  box-shadow: 0 6px 15px rgba(0, 0, 0, 0.05);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
}

.section-header h2 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 10px;
}

.add-job-btn {
  padding: 10px 20px;
  background: #4f46e5;
  color: white;
  border: none;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 500;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.add-job-btn:hover {
  background: #4338ca;
  transform: translateY(-2px);
  box-shadow: 0 4px 10px rgba(79, 70, 229, 0.3);
}

/* Danh sách công việc dạng card */
.jobs-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.job-card {
  display: flex;
  align-items: center;
  background: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  position: relative;
  border: 1px solid #e2e8f0;
}

.job-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 15px rgba(0, 0, 0, 0.1);
  border-color: #cbd5e1;
}

/* Style cho công việc không hoạt động */
.inactive-job {
  opacity: 0.8;
  filter: grayscale(30%);
}

.inactive-job::after {
  content: 'KHÔNG HOẠT ĐỘNG';
  position: absolute;
  top: 10px;
  right: 10px;
  background-color: #ef4444;
  color: white;
  padding: 3px 8px;
  border-radius: 4px;
  font-size: 0.7rem;
  font-weight: bold;
}

.job-logo {
  margin-right: 20px;
}

.company-logo {
  width: 70px;
  height: 70px;
  object-fit: contain;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  padding: 5px;
  background: white;
}

.job-info {
  flex: 1;
}

.job-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.job-title {
  font-size: 1.3rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
}

.job-status {
  font-size: 0.8rem;
  padding: 4px 10px;
  border-radius: 20px;
  font-weight: 500;
}

.job-status.hoatdong {
  background: #d1fae5;
  color: #065f46;
}
.job-status.khonghoatdong {
  background: #fee2e2;
  color: #b91c1c;
}

.job-details {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 15px;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #475569;
  font-size: 0.95rem;
}

.detail-item i {
  color: #64748b;
  width: 20px;
  text-align: center;
}

.job-actions {
  display: flex;
  gap: 10px;
}

button {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 6px;
}

button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.view-btn {
  background: #3b82f6;
  color: white;
}

.view-btn:hover {
  background: #2563eb;
}

.edit-btn {
  background: #f59e0b;
  color: white;
}

.edit-btn:hover {
  background: #d97706;
}

.delete-btn {
  background: #ef4444;
  color: white;
}

.delete-btn:hover {
  background: #dc2626;
}

.no-jobs {
  text-align: center;
  padding: 40px 25px;
  color: #64748b;
  border: 2px dashed #e2e8f0;
  border-radius: 12px;
}

.no-jobs i {
  font-size: 2.5rem;
  color: #cbd5e1;
  margin-bottom: 15px;
}

.no-jobs p {
  font-size: 1.1rem;
  margin: 10px 0;
}

.add-job-link {
  display: inline-block;
  margin-top: 15px;
  padding: 8px 20px;
  background: #4f46e5;
  color: white;
  text-decoration: none;
  border-radius: 6px;
  transition: all 0.3s ease;
}

.add-job-link:hover {
  background: #4338ca;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(79, 70, 229, 0.2);
}

.loading,
.error {
  text-align: center;
  padding: 40px 25px;
  font-size: 1.1rem;
  color: #64748b;
  border-radius: 12px;
  background: #f8fafc;
}

.loading i {
  margin-right: 10px;
  animation: spin 1s linear infinite;
}

.error {
  color: #ef4444;
  background: #fef2f2;
}

.error i {
  margin-right: 10px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Responsive */
@media (max-width: 1024px) {
  .main-content {
    margin-left: 0;
    max-width: 100%;
  }

  .stats-grid {
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  }

  .job-card {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }

  .job-logo {
    margin-right: 0;
    margin-bottom: 10px;
  }

  .job-actions {
    width: 100%;
    justify-content: flex-end;
  }
}

@media (max-width: 768px) {
  .dashboard-header {
    flex-direction: column;
    gap: 15px;
    text-align: center;
  }

  .header-content {
    flex-direction: column;
    gap: 15px;
  }

  .user-profile {
    flex-direction: column;
    gap: 10px;
  }

  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }

  .job-details {
    grid-template-columns: 1fr;
  }

  button {
    padding: 8px 12px;
    font-size: 0.9rem;
  }
}
</style>