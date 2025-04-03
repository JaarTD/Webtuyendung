<template>
  <div class="job-details-container">
    <!-- Loading state -->
    <div v-if="loading" class="loading-overlay">
      <div class="loading-content">
        <i class="fas fa-spinner fa-spin"></i>
        <p>Đang tải thông tin công việc...</p>
      </div>
    </div>

    <!-- Error state -->
    <div v-else-if="error" class="error-message">
      <i class="fas fa-exclamation-triangle"></i>
      <h3>Đã xảy ra lỗi</h3>
      <p>{{ error }}</p>
      <button @click="fetchJobDetails" class="btn-retry">
        Thử lại
      </button>
    </div>

    <!-- No data state -->
    <div v-else-if="!job" class="no-data-message">
      <i class="fas fa-file-alt"></i>
      <h3>Không tìm thấy công việc</h3>
      <p>Không có thông tin cho công việc này hoặc có thể đã bị xóa</p>
      <router-link to="/job-seeker/jobs" class="btn-back">
        Quay lại danh sách
      </router-link>
    </div>

    <!-- Main content -->
    <div v-else class="job-details-content">
      <div class="job-main-section">
        <div class="job-header">
          <h1>{{ job.tieu_de || 'Không có tiêu đề' }}</h1>
          
          <div class="company-info">
            <img :src="job.logo || '/images/default-company.png'" 
                 :alt="job.ten_congty || 'Công ty'"
                 class="company-logo">
            <div>
              <p class="company-name">{{ job.ten_congty || 'Công ty không xác định' }}</p>
              <p v-if="job.nganh_nghe" class="company-industry">
                {{ job.nganh_nghe }}
              </p>
            </div>
          </div>
          
          <div class="job-meta">
            <span v-if="job.dia_diem">
              <i class="fas fa-map-marker-alt"></i> {{ job.dia_diem }}
            </span>
            <span>
              <i class="fas fa-money-bill-wave"></i> 
              {{ formatSalary(job.luong) }}
            </span>
            <span v-if="job.ngay_het_han">
              <i class="fas fa-clock"></i> 
              Hạn nộp: {{ formatDate(job.ngay_het_han) }}
            </span>
          </div>
          
          <div class="job-actions">
            <button 
              v-if="!hasApplied" 
              @click="applyJob" 
              class="btn-apply"
              :disabled="actionLoading"
            >
              <span v-if="!actionLoading">Ứng tuyển ngay</span>
              <span v-else><i class="fas fa-spinner fa-spin"></i> Đang xử lý...</span>
            </button>
            <div v-else class="applied-status">
              <i class="fas fa-check-circle"></i> Đã ứng tuyển
            </div>
            
            <button 
              v-if="!isSaved" 
              @click="saveJob" 
              class="btn-save"
              :disabled="actionLoading"
              title="Lưu công việc"
            >
              <i class="far fa-bookmark"></i> Lưu
            </button>
            <button 
              v-else 
              @click="unsaveJob" 
              class="btn-save saved"
              :disabled="actionLoading"
              title="Bỏ lưu"
            >
              <i class="fas fa-bookmark"></i> Đã lưu
            </button>
          </div>
        </div>
        
        <div class="job-content">
          <div v-if="job.mo_ta" class="job-section">
            <h2><i class="fas fa-tasks"></i> Mô tả công việc</h2>
            <div class="job-description" v-html="job.mo_ta"></div>
          </div>
          
          <div v-if="job.yeu_cau" class="job-section">
            <h2><i class="fas fa-user-tie"></i> Yêu cầu ứng viên</h2>
            <div class="job-requirements" v-html="job.yeu_cau"></div>
          </div>
          
          <div v-if="job.quyen_loi" class="job-section">
            <h2><i class="fas fa-gift"></i> Quyền lợi</h2>
            <div class="job-benefits" v-html="job.quyen_loi"></div>
          </div>
          
          <div v-if="job.ky_nang && job.ky_nang.length > 0" class="job-section">
            <h2><i class="fas fa-tools"></i> Kỹ năng yêu cầu</h2>
            <div class="job-skills">
              <span v-for="(skill, index) in job.ky_nang" :key="index" class="skill-tag">
                {{ skill }}
              </span>
            </div>
          </div>
        </div>
      </div>
      
      <div class="job-sidebar">
        <div class="company-card">
          <div class="company-header">
            <img :src="job.logo || '/images/default-company.png'" 
                 class="company-logo-large"
                 :alt="job.ten_congty || 'Công ty'">
            <h3>{{ job.ten_congty || 'Công ty không xác định' }}</h3>
            <p v-if="job.nganh_nghe" class="industry">{{ job.nganh_nghe }}</p>
          </div>
          
          <div class="company-info">
            <p v-if="job.dia_chi">
              <i class="fas fa-map-marker-alt"></i> {{ job.dia_chi }}
            </p>
            <p v-if="job.website">
              <i class="fas fa-globe"></i> 
              <a :href="job.website" target="_blank">{{ job.website }}</a>
            </p>
            <p v-else>
              <i class="fas fa-globe"></i> Không có website
            </p>
          </div>
          
          <router-link 
            v-if="job.id_congty"
            :to="`/companies/${job.id_congty}`" 
            class="btn-view-company"
          >
            Xem công ty
          </router-link>
        </div>
        
        <div class="similar-jobs">
          <h3>Công việc tương tự</h3>
          <div v-if="similarJobsLoading" class="loading-jobs">
            <i class="fas fa-spinner fa-spin"></i> Đang tải...
          </div>
          <div v-else-if="similarJobs.length > 0" class="similar-jobs-list">
            <div 
              v-for="similarJob in similarJobs" 
              :key="similarJob.id_congviec" 
              class="similar-job-item"
              @click="$router.push(`/job-seeker/jobs/${similarJob.id_congviec}`)"
            >
              <h4>{{ similarJob.tieu_de || 'Không có tiêu đề' }}</h4>
              <p class="company">{{ similarJob.ten_congty || 'Công ty không xác định' }}</p>
              <p class="salary">{{ formatSalary(similarJob.luong) }}</p>
            </div>
          </div>
          <div v-else class="no-similar-jobs">
            <p>Hiện không có công việc tương tự</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import axios from 'axios';
import { useAuthStore } from '@/stores/authStore';

export default {
  setup() {
    const route = useRoute();
    const authStore = useAuthStore();
    
    // State management
    const job = ref(null);
    const loading = ref(true);
    const error = ref(null);
    const hasApplied = ref(false);
    const isSaved = ref(false);
    const actionLoading = ref(false);
    const similarJobs = ref([]);
    const similarJobsLoading = ref(false);

    // Helper functions
    const formatSalary = (salary) => {
      if (!salary) return 'Thương lượng';
      return new Intl.NumberFormat('vi-VN', { 
        style: 'currency', 
        currency: 'VND',
        maximumFractionDigits: 0
      }).format(salary);
    };

    const formatDate = (dateString) => {
      if (!dateString) return 'Không xác định';
      const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
      return new Date(dateString).toLocaleDateString('vi-VN', options);
    };

    // API functions
    const fetchJobDetails = async () => {
      try {
        loading.value = true;
        error.value = null;
        
        const jobId = route.params.id;
        if (!jobId) {
          throw new Error('Thiếu ID công việc');
        }

        // Gọi API chi tiết công việc
        const response = await axios.get(
          `http://localhost:3000/api/nguoitimviec/jobs/${jobId}`,
          { 
            withCredentials: true,
            headers: {
              'Content-Type': 'application/json'
            }
          }
        );

        if (!response.data || !response.data.success) {
          throw new Error(response.data?.message || 'Dữ liệu không hợp lệ');
        }

        job.value = response.data.data;
        
        // Nếu người dùng đã đăng nhập, kiểm tra trạng thái ứng tuyển và lưu
        if (authStore.isAuthenticated) {
          await checkApplicationStatus();
          await checkSavedStatus();
        }
        
      } catch (err) {
        console.error('Error fetching job details:', err);
        error.value = err.response?.data?.message || 
                     err.message || 
                     'Lỗi khi tải thông tin công việc';
      } finally {
        loading.value = false;
      }
    };

    const checkApplicationStatus = async () => {
      try {
        const response = await axios.get(
          `http://localhost:3000/api/nguoitimviec/jobs/${route.params.id}/check-application`,
          { withCredentials: true }
        );
        hasApplied.value = response.data?.hasApplied || false;
      } catch (err) {
        console.error('Check application status error:', err);
      }
    };

    const checkSavedStatus = async () => {
      try {
        const response = await axios.get(
          `http://localhost:3000/api/nguoitimviec/jobs/${route.params.id}/check-saved`,
          { withCredentials: true }
        );
        isSaved.value = response.data?.isSaved || false;
      } catch (err) {
        console.error('Check saved status error:', err);
      }
    };

    // Action handlers
    const applyJob = async () => {
      try {
        actionLoading.value = true;
        await axios.post(
          `http://localhost:3000/api/nguoitimviec/jobs/${route.params.id}/apply`,
          {},
          { withCredentials: true }
        );
        hasApplied.value = true;
      } catch (err) {
        console.error('Apply job error:', err);
        error.value = err.response?.data?.message || 'Lỗi khi ứng tuyển';
      } finally {
        actionLoading.value = false;
      }
    };

    const saveJob = async () => {
      try {
        actionLoading.value = true;
        await axios.post(
          `http://localhost:3000/api/nguoitimviec/jobs/${route.params.id}/save`,
          {},
          { withCredentials: true }
        );
        isSaved.value = true;
      } catch (err) {
        console.error('Save job error:', err);
        error.value = err.response?.data?.message || 'Lỗi khi lưu công việc';
      } finally {
        actionLoading.value = false;
      }
    };

    const unsaveJob = async () => {
      try {
        actionLoading.value = true;
        await axios.delete(
          `http://localhost:3000/api/nguoitimviec/jobs/${route.params.id}/save`,
          { withCredentials: true }
        );
        isSaved.value = false;
      } catch (err) {
        console.error('Unsave job error:', err);
        error.value = err.response?.data?.message || 'Lỗi khi bỏ lưu công việc';
      } finally {
        actionLoading.value = false;
      }
    };

    // Fetch similar jobs
    const fetchSimilarJobs = async () => {
      try {
        similarJobsLoading.value = true;
        const response = await axios.get(
          `http://localhost:3000/api/jobs/${route.params.id}/similar`,
          { withCredentials: true }
        );
        similarJobs.value = response.data?.data || [];
      } catch (err) {
        console.error('Fetch similar jobs error:', err);
      } finally {
        similarJobsLoading.value = false;
      }
    };

    // Lifecycle hook
    onMounted(async () => {
      await fetchJobDetails();
      if (job.value) {
        await fetchSimilarJobs();
      }
    });

    return {
      job,
      loading,
      error,
      hasApplied,
      isSaved,
      actionLoading,
      similarJobs,
      similarJobsLoading,
      fetchJobDetails,
      applyJob,
      saveJob,
      unsaveJob,
      formatSalary,
      formatDate
    };
  }
};
</script>

<style scoped>
.job-details-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  position: relative;
}

/* Loading state */
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.loading-content {
  text-align: center;
  color: #42b983;
}

.loading-content i {
  font-size: 3rem;
  margin-bottom: 1rem;
}

/* Error state */
.error-message {
  padding: 2rem;
  text-align: center;
  background: #ffebee;
  border-radius: 8px;
  margin: 2rem 0;
  color: #ff5252;
}

.error-message i {
  font-size: 2rem;
  margin-bottom: 1rem;
}

.error-message h3 {
  margin-bottom: 0.5rem;
}

.btn-retry {
  margin-top: 1rem;
  padding: 0.5rem 1rem;
  background: #42b983;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

/* No data state */
.no-data-message {
  padding: 2rem;
  text-align: center;
  background: #f5f5f5;
  border-radius: 8px;
  margin: 2rem 0;
  color: #757575;
}

.no-data-message i {
  font-size: 2rem;
  margin-bottom: 1rem;
}

.no-data-message h3 {
  margin-bottom: 0.5rem;
}

.btn-back {
  margin-top: 1rem;
  padding: 0.5rem 1rem;
  background: #42b983;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  text-decoration: none;
  display: inline-block;
}

/* Main content */
.job-details-content {
  display: flex;
  gap: 2rem;
}

.job-main-section {
  flex: 3;
}

.job-sidebar {
  flex: 1;
}

/* Job header */
.job-header {
  padding-bottom: 1.5rem;
  border-bottom: 1px solid #e0e0e0;
  margin-bottom: 1.5rem;
}

.job-header h1 {
  font-size: 1.8rem;
  margin-bottom: 1rem;
  color: #2c3e50;
}

.company-info {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.company-logo {
  width: 60px;
  height: 60px;
  object-fit: contain;
  border-radius: 4px;
  background: #f5f5f5;
  padding: 5px;
}

.company-name {
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.company-industry {
  color: #7f8c8d;
  font-size: 0.9rem;
}

/* Job meta */
.job-meta {
  display: flex;
  gap: 1.5rem;
  margin: 1.5rem 0;
  flex-wrap: wrap;
}

.job-meta span {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #34495e;
}

.job-meta i {
  color: #42b983;
}

/* Job actions */
.job-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
}

.btn-apply {
  padding: 0.75rem 1.5rem;
  background: #42b983;
  color: white;
  border: none;
  border-radius: 4px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-apply:hover {
  background: #369f6b;
}

.btn-apply:disabled {
  background: #bdc3c7;
  cursor: not-allowed;
}

.applied-status {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #27ae60;
  font-weight: 600;
}

.btn-save {
  padding: 0.75rem;
  background: none;
  border: 1px solid #bdc3c7;
  border-radius: 4px;
  cursor: pointer;
  color: #7f8c8d;
  transition: all 0.2s;
}

.btn-save:hover {
  border-color: #42b983;
  color: #42b983;
}

.btn-save.saved {
  border-color: #42b983;
  color: #42b983;
}

.btn-save:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

/* Job content sections */
.job-content {
  margin-top: 2rem;
}

.job-section {
  margin-bottom: 2rem;
}

.job-section h2 {
  font-size: 1.3rem;
  margin-bottom: 1rem;
  color: #2c3e50;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.job-section h2 i {
  color: #42b983;
}

.job-description,
.job-requirements,
.job-benefits {
  line-height: 1.6;
  color: #34495e;
}

/* Skills */
.job-skills {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 1rem;
}

.skill-tag {
  background: #e0f2f1;
  color: #00796b;
  padding: 0.35rem 0.75rem;
  border-radius: 20px;
  font-size: 0.85rem;
}

/* Sidebar */
.company-card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  padding: 1.5rem;
  margin-bottom: 2rem;
}

.company-header {
  text-align: center;
  margin-bottom: 1.5rem;
}

.company-logo-large {
  width: 100%;
  max-height: 120px;
  object-fit: contain;
  margin-bottom: 1rem;
  background: #f5f5f5;
  border-radius: 4px;
  padding: 10px;
}

.company-header h3 {
  margin-bottom: 0.5rem;
}

.industry {
  color: #7f8c8d;
  font-size: 0.9rem;
}

.company-info {
  margin-bottom: 1.5rem;
}

.company-info p {
  margin-bottom: 0.75rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #34495e;
}

.company-info a {
  color: #3498db;
  text-decoration: none;
}

.company-info a:hover {
  text-decoration: underline;
}

.company-info i {
  color: #42b983;
  width: 20px;
}

.btn-view-company {
  display: block;
  text-align: center;
  padding: 0.75rem;
  background: #f5f5f5;
  color: #2c3e50;
  border-radius: 4px;
  text-decoration: none;
  font-weight: 500;
  transition: background 0.2s;
}

.btn-view-company:hover {
  background: #e0e0e0;
}

/* Similar jobs */
.similar-jobs h3 {
  font-size: 1.2rem;
  margin-bottom: 1rem;
  color: #2c3e50;
}

.loading-jobs {
  text-align: center;
  padding: 1rem;
  color: #7f8c8d;
}

.similar-jobs-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.similar-job-item {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  padding: 1rem;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.similar-job-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.similar-job-item h4 {
  margin-bottom: 0.5rem;
  color: #2c3e50;
}

.similar-job-item .company {
  font-size: 0.9rem;
  color: #7f8c8d;
  margin-bottom: 0.25rem;
}

.similar-job-item .salary {
  font-weight: 500;
  color: #27ae60;
}

.no-similar-jobs {
  padding: 1rem;
  text-align: center;
  color: #7f8c8d;
  background: #f5f5f5;
  border-radius: 4px;
}

/* Responsive */
@media (max-width: 768px) {
  .job-details-content {
    flex-direction: column;
  }
  
  .job-sidebar {
    margin-top: 2rem;
  }
}
</style>