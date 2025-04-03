<template>
  <div class="applications-page-wrapper">
    <EmployerSidebar />

    <div class="main-content">
      <header class="page-header">
        <div class="header-top">
          <h1>Quản lý hồ sơ ứng tuyển</h1>
          <div class="application-stats">
            <span class="stat-item">
              <span class="stat-number">{{ applications.length }}</span>
              <span class="stat-label">Tổng hồ sơ</span>
            </span>
            <span class="stat-item">
              <span class="stat-number">{{ pendingCount }}</span>
              <span class="stat-label">Chờ xử lý</span>
            </span>
            <span class="stat-item">
              <span class="stat-number">{{ acceptedCount }}</span>
              <span class="stat-label">Đã chấp nhận</span>
            </span>
            <span class="stat-item">
              <span class="stat-number">{{ rejectedCount }}</span>
              <span class="stat-label">Bị từ chối</span>
            </span>
          </div>
        </div>
        <div class="filter-section">
  <label for="job-filter">Lọc theo công việc:</label>
  <select id="job-filter" v-model="selectedJobId" @change="fetchApplications">
    <option value="">Tất cả công việc</option>
    <option v-for="job in jobs" :key="job.id_congviec" :value="job.id_congviec">
      {{ job.tieu_de }}
    </option>
  </select>
</div>
      </header>

      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
        <p>Đang tải dữ liệu...</p>
      </div>

      <div v-else-if="error" class="error-state">
        <span class="error-icon">⚠️</span>
        <p>{{ error }}</p>
      </div>

      <div v-else class="applications-grid">
        <div v-if="applications.length === 0" class="empty-state">
          <i class="fas fa-folder-open empty-icon"></i>
          <p>Không có hồ sơ ứng tuyển nào</p>
        </div>

        <div v-for="application in applications" :key="application.id_hoso" class="application-card">
          <div class="card-header">
            <h3>{{ application.job_title || 'Không có tiêu đề' }}</h3>
            <span :class="['status-badge', application.trang_thai.toLowerCase()]">
              {{ translateStatus(application.trang_thai) }}
            </span>
          </div>
          
          <div class="applicant-info">
            <div class="info-item">
              <span class="info-label">Ứng viên:</span>
              <span class="info-value">{{ application.applicant_name || 'N/A' }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Liên hệ:</span>
              <span class="info-value">{{ application.applicant_email || 'N/A' }} | {{ application.so_dien_thoai || 'N/A' }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Ngày nộp:</span>
              <span class="info-value">{{ formatDate(application.ngay_nop) }}</span>
            </div>
          </div>
          
          <div class="card-actions">
            <button @click="viewApplication(application)" class="action-btn view">
              <i class="fas fa-eye"></i> Xem
            </button>
            <button @click="openUpdateModal(application)" class="action-btn update">
              <i class="fas fa-edit"></i> Cập nhật
            </button>
            <button @click="deleteApplication(application.id_hoso)" class="action-btn delete">
              <i class="fas fa-trash"></i> Xóa
            </button>
          </div>
        </div>
      </div>

      <!-- Update Status Modal -->
      <div v-if="showUpdateModal" class="modal-overlay">
        <div class="modal-container">
          <div class="modal-header">
            <h2>Cập nhật trạng thái</h2>
            <button @click="closeUpdateModal" class="close-btn">&times;</button>
          </div>
          <form @submit.prevent="updateApplication" class="modal-form">
            <div class="form-group">
              <label for="update_trang_thai">Trạng thái hồ sơ</label>
              <select id="update_trang_thai" v-model="selectedApplication.trang_thai" required>
                <option value="choxuly">Chờ xử lý</option>
                <option value="dachapnhan">Đã chấp nhận</option>
                <option value="bituchoi">Bị từ chối</option>
              </select>
            </div>
            <div class="form-actions">
              <button type="button" @click="closeUpdateModal" class="btn secondary">Hủy bỏ</button>
              <button type="submit" class="btn primary">Lưu thay đổi</button>
            </div>
          </form>
        </div>
      </div>

      <!-- View Details Modal -->
      <div v-if="showViewModal" class="modal-overlay">
        <div class="modal-container wide">
          <div class="modal-header">
            <h2>Chi tiết ứng viên</h2>
            <button @click="closeViewModal" class="close-btn">&times;</button>
          </div>
          <div v-if="applicantDetails" class="modal-body">
            <div class="detail-section">
              <h3>Thông tin cá nhân</h3>
              <div class="detail-grid">
                <div class="detail-item">
                  <span class="detail-label">Họ tên:</span>
                  <span class="detail-value">{{ applications.find(app => app.id_nguoitimviec === applicantDetails.profile.id_nguoitimviec)?.applicant_name || 'N/A' }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Điện thoại:</span>
                  <span class="detail-value">{{ applicantDetails.profile.so_dien_thoai || 'N/A' }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Giới tính:</span>
                  <span class="detail-value">{{ applicantDetails.profile.gioi_tinh || 'N/A' }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Kỹ năng:</span>
                  <span class="detail-value">{{ applicantDetails.profile.ky_nang || 'N/A' }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Kinh nghiệm:</span>
                  <span class="detail-value">{{ applicantDetails.profile.kinh_nghiem || 'N/A' }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Học vấn:</span>
                  <span class="detail-value">{{ applicantDetails.profile.hoc_van || 'N/A' }}</span>
                </div>
              </div>
            </div>

            <div class="detail-section" v-if="jobDetails">
              <h3>Thông tin công việc</h3>
              <div class="detail-grid">
                <div class="detail-item">
                  <span class="detail-label">Vị trí:</span>
                  <span class="detail-value">{{ jobDetails.tieu_de || 'N/A' }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Mức lương:</span>
                  <span class="detail-value">{{ formatCurrency(jobDetails.luong) }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Địa điểm:</span>
                  <span class="detail-value">{{ jobDetails.dia_diem || 'N/A' }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Ngày đăng:</span>
                  <span class="detail-value">{{ formatDate(jobDetails.ngay_dang) }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Mô tả công việc:</span>
                  <span class="detail-value">{{ jobDetails.mo_ta || 'N/A' }}</span>
                </div>
                <div class="detail-item full-width">
              <span class="detail-label">Yêu cầu công việc:</span>
              <div class="detail-value description-text">{{ jobDetails.yeu_cau || 'N/A' }}</div>
            </div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button @click="closeViewModal" class="btn secondary">Đóng</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import EmployerSidebar from './Sidebar.vue';

export default {
  name: 'JobApplications',
  components: {
    EmployerSidebar,
  },
  data() {
    return {
      applications: [],
      jobs: [],
      selectedJobId: '',
      loading: false,
      error: null,
      showUpdateModal: false,
      selectedApplication: null,
      id_nhatuyendung: null,
      showViewModal: false,
      applicantDetails: null,
      jobDetails: null,
    };
  },
  computed: {
    pendingCount() {
      return this.applications.filter(app => app.trang_thai === 'choxuly').length;
    },
    acceptedCount() {
      return this.applications.filter(app => app.trang_thai === 'dachapnhan').length;
    },
    rejectedCount() {
      return this.applications.filter(app => app.trang_thai === 'bituchoi').length;
    }
  },
  created() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    this.id_nhatuyendung = user.id_nguoidung || null;

    if (!this.id_nhatuyendung) {
      alert('Vui lòng đăng nhập để tiếp tục.');
      this.$router.push('/login');
      return;
    }

    this.fetchJobs();
    this.fetchApplications();
  },
  methods: {
    async fetchJobs() {
      try {
        const response = await axios.get(`http://localhost:3000/job-applications/employer/${this.id_nhatuyendung}/jobs`);
        this.jobs = response.data;
        if (this.jobs.length === 0) {
          console.log('Hiện tại bạn không có công việc nào.');
        }
      } catch (error) {
        console.error('Lỗi khi lấy danh sách công việc:', error);
      }
    },
    async fetchApplications() {
      this.loading = true;
      this.error = null;

      try {
        let url = `http://localhost:3000/job-applications/employer/${this.id_nhatuyendung}`;
        if (this.selectedJobId) {
          url = `http://localhost:3000/job-applications/${this.id_nhatuyendung}/job/${this.selectedJobId}`;
        }
        const response = await axios.get(url);
        this.applications = response.data;
        if (this.applications.length === 0) {
          this.error = this.selectedJobId
            ? 'Không có hồ sơ ứng tuyển nào cho công việc này.'
            : 'Hiện tại không có hồ sơ ứng tuyển nào.';
        }
      } catch (error) {
        this.error = 'Không thể tải danh sách hồ sơ ứng tuyển. Vui lòng thử lại sau.';
        console.error('Lỗi khi lấy danh sách hồ sơ ứng tuyển:', error);
      } finally {
        this.loading = false;
      }
    },
    async viewApplication(application) {
      try {
        const applicantResponse = await axios.get(`http://localhost:3000/job-applications/applicant/${application.id_nguoitimviec}`);
        this.applicantDetails = applicantResponse.data;

        const jobResponse = await axios.get(`http://localhost:3000/job-applications/job/${application.id_congviec}`);
        this.jobDetails = jobResponse.data;

        this.showViewModal = true;
      } catch (error) {
        if (error.response?.status === 404) {
          alert('Không tìm thấy thông tin ứng viên hoặc công việc.');
        } else {
          alert('Lỗi khi lấy thông tin chi tiết: ' + (error.response?.data?.error || error.message));
        }
      }
    },
    closeViewModal() {
      this.showViewModal = false;
      this.applicantDetails = null;
      this.jobDetails = null;
    },
    openUpdateModal(application) {
      this.selectedApplication = { ...application };
      this.showUpdateModal = true;
    },
    closeUpdateModal() {
      this.showUpdateModal = false;
      this.selectedApplication = null;
    },
    async updateApplication() {
      try {
        await axios.put(`http://localhost:3000/job-applications/${this.selectedApplication.id_hoso}`, {
          id_congviec: this.selectedApplication.id_congviec,
          id_nguoitimviec: this.selectedApplication.id_nguoitimviec,
          trang_thai: this.selectedApplication.trang_thai,
        });
        const index = this.applications.findIndex(app => app.id_hoso === this.selectedApplication.id_hoso);
        if (index !== -1) {
          this.applications[index] = { ...this.selectedApplication };
        }
        this.closeUpdateModal();
        alert('Cập nhật trạng thái thành công!');
      } catch (error) {
        alert('Lỗi khi cập nhật hồ sơ ứng tuyển: ' + (error.response?.data?.error || error.message));
      }
    },
    async deleteApplication(id) {
      if (confirm('Bạn có chắc chắn muốn xóa hồ sơ ứng tuyển này?')) {
        try {
          await axios.delete(`http://localhost:3000/job-applications/${id}`);
          this.applications = this.applications.filter(app => app.id_hoso !== id);
          alert('Xóa hồ sơ ứng tuyển thành công!');
        } catch (error) {
          alert('Lỗi khi xóa hồ sơ ứng tuyển: ' + (error.response?.data?.error || error.message));
        }
      }
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
        case 'choxuly':
          return 'Chờ xử lý';
        case 'dachapnhan':
          return 'Đã chấp nhận';
        case 'bituchoi':
          return 'Bị từ chối';
        default:
          return status;
      }
    },
  },
};
</script>

<style scoped>
.applications-page-wrapper {
  display: flex;
  min-height: 100vh;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background-color: #f5f7fa;
}

.main-content {
  flex-grow: 1;
  padding: 2rem;
  margin-left: 250px;
  max-width: calc(100% - 250px);
}

/* Header Styles */
.page-header {
  margin-bottom: 2rem;
}

.header-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.page-header h1 {
  font-size: 1.75rem;
  color: #2c3e50;
  margin: 0;
}

.application-stats {
  display: flex;
  gap: 1.5rem;
  background: #f8f9fa;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 60px;
}

.stat-number {
  font-size: 1.5rem;
  font-weight: 600;
  color: #2c3e50;
}

.stat-label {
  font-size: 0.8rem;
  color: #7f8c8d;
  margin-top: 0.25rem;
}

/* Màu sắc cho các trạng thái */
.application-stats .stat-item:nth-child(1) .stat-number {
  color: #3498db;
}
.application-stats .stat-item:nth-child(2) .stat-number {
  color: #f39c12;
}
.application-stats .stat-item:nth-child(3) .stat-number {
  color: #2ecc71;
}
.application-stats .stat-item:nth-child(4) .stat-number {
  color: #e74c3c;
}

.filter-section {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.filter-section label {
  font-weight: 500;
  color: #34495e;
}

.filter-section select {
  padding: 0.75rem 1rem;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
  background-color: white;
  font-size: 0.9rem;
  min-width: 250px;
  transition: border-color 0.3s;
}

.filter-section select:focus {
  outline: none;
  border-color: #4a90e2;
  box-shadow: 0 0 0 2px rgba(74, 144, 226, 0.2);
}

/* Loading and Error States */
.loading-state, .error-state, .empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  text-align: center;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #4a90e2;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-state {
  color: #e74c3c;
}

.error-icon {
  font-size: 2rem;
  margin-bottom: 1rem;
}

.empty-state {
  color: #7f8c8d;
  grid-column: 1 / -1;
}

.empty-icon {
  font-size: 3rem;
  color: #bdc3c7;
  margin-bottom: 1rem;
}

/* Applications Grid */
.applications-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.5rem;
}

.application-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  padding: 1.5rem;
  transition: transform 0.2s, box-shadow 0.2s;
  border: 1px solid #eaeaea;
}

.application-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #f0f0f0;
}

.card-header h3 {
  margin: 0;
  font-size: 1.1rem;
  color: #34495e;
  flex: 1;
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.status-badge.choxuly {
  background-color: #fff3e0;
  color: #e65100;
}

.status-badge.dachapnhan {
  background-color: #e8f5e9;
  color: #2e7d32;
}

.status-badge.bituchoi {
  background-color: #ffebee;
  color: #c62828;
}

.applicant-info {
  margin-bottom: 1.5rem;
}

.info-item {
  margin-bottom: 0.75rem;
}

.info-label {
  display: block;
  font-size: 0.8rem;
  color: #7f8c8d;
  margin-bottom: 0.25rem;
}

.info-value {
  font-size: 0.95rem;
  color: #2c3e50;
  word-break: break-word;
}

.card-actions {
  display: flex;
  gap: 0.5rem;
}

.action-btn {
  flex: 1;
  padding: 0.5rem;
  border-radius: 6px;
  border: none;
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.action-btn i {
  font-size: 0.9rem;
}

.action-btn.view {
  background-color: #e3f2fd;
  color: #1976d2;
}

.action-btn.view:hover {
  background-color: #bbdefb;
}

.action-btn.update {
  background-color: #e8f5e9;
  color: #2e7d32;
}

.action-btn.update:hover {
  background-color: #c8e6c9;
}

.action-btn.delete {
  background-color: #ffebee;
  color: #d32f2f;
}

.action-btn.delete:hover {
  background-color: #ffcdd2;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(2px);
}

.modal-container {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  animation: modalFadeIn 0.3s;
}

.modal-container.wide {
  max-width: 700px;
}

@keyframes modalFadeIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #eee;
}

.modal-header h2 {
  margin: 0;
  font-size: 1.5rem;
  color: #2c3e50;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #7f8c8d;
  transition: color 0.2s;
}

.close-btn:hover {
  color: #e74c3c;
}

.modal-form {
  padding: 1.5rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #2c3e50;
}

.form-group select {
  width: 100%;
  padding: 0.75rem;
  border-radius: 8px;
  border: 1px solid #ddd;
  font-size: 1rem;
  transition: border-color 0.2s;
}

.form-group select:focus {
  outline: none;
  border-color: #4a90e2;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
}

.btn {
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn.primary {
  background-color: #4a90e2;
  color: white;
  border: none;
}

.btn.primary:hover {
  background-color: #3a7bc8;
}

.btn.secondary {
  background-color: #f5f5f5;
  color: #2c3e50;
  border: none;
}

.btn.secondary:hover {
  background-color: #e0e0e0;
}

.modal-body {
  padding: 0 1.5rem;
}

.detail-section {
  margin-bottom: 2rem;
}

.detail-section h3 {
  font-size: 1.2rem;
  color: #2c3e50;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #eee;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1rem;
}

.detail-item {
  margin-bottom: 0.75rem;
}

.detail-label {
  display: block;
  font-size: 0.85rem;
  color: #7f8c8d;
  margin-bottom: 0.25rem;
}

.detail-value {
  font-size: 0.95rem;
  color: #2c3e50;
  word-break: break-word;
}

.modal-footer {
  padding: 1.5rem;
  border-top: 1px solid #eee;
  display: flex;
  justify-content: flex-end;
}

/* Responsive Adjustments */
@media (max-width: 768px) {
  .main-content {
    margin-left: 0;
    max-width: 100%;
    padding: 1rem;
  }

  .header-top {
    flex-direction: column;
    align-items: flex-start;
  }

  .application-stats {
    width: 100%;
    justify-content: space-between;
  }

  .filter-section {
    flex-direction: column;
    align-items: flex-start;
    width: 100%;
  }

  .filter-section select {
    width: 100%;
  }

  .applications-grid {
    grid-template-columns: 1fr;
  }

  .modal-container {
    width: 95%;
  }
}
</style>