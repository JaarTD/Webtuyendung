<template>
    <div class="dashboard">
      <div class="welcome-banner">
        <h1>Xin chào, {{ userName }}!</h1>
        <p>Tìm công việc mơ ước của bạn ngay hôm nay</p>
        <router-link to="/job-seeker/jobs" class="btn-primary">
          Tìm việc ngay
        </router-link>
      </div>
  
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon">
            <i class="fas fa-file-alt"></i>
          </div>
          <div class="stat-info">
            <h3>{{ appliedJobsCount }}</h3>
            <p>Đơn ứng tuyển</p>
          </div>
        </div>
  
        <div class="stat-card">
          <div class="stat-icon">
            <i class="fas fa-bookmark"></i>
          </div>
          <div class="stat-info">
            <h3>{{ savedJobsCount }}</h3>
            <p>Việc đã lưu</p>
          </div>
        </div>
  
        <div class="stat-card">
          <div class="stat-icon">
            <i class="fas fa-bell"></i>
          </div>
          <div class="stat-info">
            <h3>{{ unreadNotifications }}</h3>
            <p>Thông báo mới</p>
          </div>
        </div>
      </div>
  
      <div class="recommended-jobs">
        <h2 class="section-title">Công việc phù hợp với bạn</h2>
        <div v-if="loadingJobs" class="loading-jobs">
          <i class="fas fa-spinner fa-spin"></i> Đang tải công việc...
        </div>
        <div v-else-if="recommendedJobs.length > 0" class="jobs-grid">
          <div v-for="job in recommendedJobs" :key="job.id_congviec" class="job-card">
            <div class="job-header">
              <h3>{{ job.tieu_de }}</h3>
              <p class="company">{{ job.ten_congty }}</p>
            </div>
            <div class="job-details">
              <p><i class="fas fa-map-marker-alt"></i> {{ job.dia_diem }}</p>
              <p><i class="fas fa-money-bill-wave"></i> {{ formatSalary(job.luong) }}</p>
            </div>
            <div class="job-actions">
              <router-link :to="`/job-seeker/jobs/${job.id_congviec}`" class="btn-view">
                Xem chi tiết
              </router-link>
              <button v-if="!job.da_luu" @click="saveJob(job.id_congviec)" class="btn-save">
                <i class="far fa-bookmark"></i>
              </button>
              <button v-else @click="unsaveJob(job.id_congviec)" class="btn-save saved">
                <i class="fas fa-bookmark"></i>
              </button>
            </div>
          </div>
        </div>
        <div v-else class="no-jobs">
          <p>Không có công việc nào phù hợp. Hãy cập nhật hồ sơ của bạn!</p>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import { ref, onMounted, computed } from 'vue';
  import axios from 'axios';
  import { useAuthStore } from '@/stores/authStore';
  import { useRouter } from 'vue-router';
  
  export default {
    setup() {
      const authStore = useAuthStore();
      const router = useRouter();
      
      // State management
      const stats = ref({
        appliedJobs: 0,
        savedJobs: 0,
        unreadNotifications: 0
      });
      const recommendedJobs = ref([]);
      const loading = ref({
        stats: true,
        jobs: true,
        auth: true
      });
      const errorMessage = ref('');
      const successMessage = ref('');
  
      // Computed properties
      const userName = computed(() => authStore.user?.ten || 'Ứng viên');
      const appliedJobsCount = computed(() => stats.value.appliedJobs);
      const savedJobsCount = computed(() => stats.value.savedJobs);
      const unreadNotifications = computed(() => stats.value.unreadNotifications);
      const loadingJobs = computed(() => loading.value.jobs);
  
      const formatSalary = (salary) => {
        if (!salary) return 'Thương lượng';
        return new Intl.NumberFormat('vi-VN', { 
          style: 'currency', 
          currency: 'VND',
          maximumFractionDigits: 0
        }).format(salary);
      };
  
      // Authentication check
      const checkAuth = async () => {
        try {
          loading.value.auth = true;
          await authStore.checkSession();
          
          if (!authStore.isAuthenticated) {
            errorMessage.value = 'Vui lòng đăng nhập để xem dashboard';
            router.push('/login');
            return false;
          }
          return true;
        } catch (error) {
          errorMessage.value = 'Lỗi xác thực: ' + (error.response?.data?.message || error.message);
          return false;
        } finally {
          loading.value.auth = false;
        }
      };
  
      // API Handlers
      const fetchStats = async () => {
        try {
          const isAuthenticated = await checkAuth();
          if (!isAuthenticated) return;
  
          loading.value.stats = true;
          errorMessage.value = '';
          
          const [applications, savedJobs, notifications] = await Promise.all([
            axios.get('http://localhost:3000/api/nguoitimviec/applications', {
              params: { limit: 1 },
              withCredentials: true
            }),
            axios.get('http://localhost:3000/api/nguoitimviec/saved-jobs', {
              params: { limit: 1 },
              withCredentials: true
            }),
            axios.get('http://localhost:3000/api/nguoitimviec/notifications', {
              params: { unread: true, limit: 1 },
              withCredentials: true
            })
          ]);
  
          stats.value = {
            appliedJobs: applications.data?.data?.total || 0,
            savedJobs: savedJobs.data?.data?.total || 0,
            unreadNotifications: notifications.data?.data?.notifications?.length || 0
          };
        } catch (error) {
          handleApiError(error);
        } finally {
          loading.value.stats = false;
        }
      };
  
      const fetchRecommendedJobs = async () => {
        try {
          loading.value.jobs = true;
          const response = await axios.get('http://localhost:3000/api/nguoitimviec/jobs/recommended', {
            params: { limit: 4 },
            withCredentials: true
          });
  
          const jobsWithSavedStatus = await Promise.all(
            response.data.data.jobs.map(async job => {
              try {
                const checkSavedRes = await axios.get(
                  `http://localhost:3000/api/nguoitimviec/jobs/${job.id_congviec}/check-saved`,
                  { withCredentials: true }
                );
                return {
                  ...job,
                  da_luu: checkSavedRes.data.isSaved || false
                };
              } catch (error) {
                console.error('Lỗi kiểm tra trạng thái lưu:', error);
                return { ...job, da_luu: false };
              }
            })
          );
  
          recommendedJobs.value = jobsWithSavedStatus;
          successMessage.value = 'Tải công việc đề xuất thành công';
          setTimeout(() => successMessage.value = '', 3000);
        } catch (error) {
          handleApiError(error);
        } finally {
          loading.value.jobs = false;
        }
      };
  
      const saveJob = async (jobId) => {
        try {
          await axios.post(
            `http://localhost:3000/api/nguoitimviec/jobs/${jobId}/save`,
            {},
            { withCredentials: true }
          );
  
          const jobIndex = recommendedJobs.value.findIndex(j => j.id_congviec === jobId);
          if (jobIndex !== -1) {
            recommendedJobs.value[jobIndex].da_luu = true;
          }
          stats.value.savedJobs += 1;
          successMessage.value = 'Đã lưu công việc thành công';
          setTimeout(() => successMessage.value = '', 3000);
        } catch (error) {
          handleApiError(error);
        }
      };
  
      const unsaveJob = async (jobId) => {
        try {
          await axios.delete(
            `http://localhost:3000/api/nguoitimviec/jobs/${jobId}/save`,
            { withCredentials: true }
          );
  
          const jobIndex = recommendedJobs.value.findIndex(j => j.id_congviec === jobId);
          if (jobIndex !== -1) {
            recommendedJobs.value[jobIndex].da_luu = false;
          }
          stats.value.savedJobs -= 1;
          successMessage.value = 'Đã bỏ lưu công việc';
          setTimeout(() => successMessage.value = '', 3000);
        } catch (error) {
          handleApiError(error);
        }
      };
  
      // Error handling
      const handleApiError = (error) => {
        console.error('API Error:', error);
        
        if (error.response?.status === 401) {
          errorMessage.value = 'Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.';
          authStore.logout();
          router.push('/login');
        } else {
          errorMessage.value = error.response?.data?.message || 
                            error.message || 
                            'Có lỗi xảy ra khi kết nối với server';
        }
        
        setTimeout(() => errorMessage.value = '', 5000);
      };
  
      // Lifecycle hook
      onMounted(async () => {
        await fetchStats();
        if (authStore.isAuthenticated) {
          await fetchRecommendedJobs();
        }
      });
  
      return {
        userName,
        appliedJobsCount,
        savedJobsCount,
        unreadNotifications,
        recommendedJobs,
        loadingJobs,
        errorMessage,
        successMessage,
        formatSalary,
        saveJob,
        unsaveJob
      };
    }
  };
  </script>
  
  <style scoped>
  /* Giữ nguyên các style như cũ */
  .dashboard {
    padding: 2rem 0;
  }
  
  .welcome-banner {
    background: linear-gradient(135deg, #42b983, #2c3e50);
    color: white;
    padding: 2rem;
    border-radius: 10px;
    margin-bottom: 2rem;
    text-align: center;
  }
  
  .welcome-banner h1 {
    font-size: 2.5rem;
    margin-bottom: 0.5rem;
  }
  
  .welcome-banner p {
    font-size: 1.2rem;
    margin-bottom: 1.5rem;
  }
  
  .btn-primary {
    background: white;
    color: #2c3e50;
    padding: 0.75rem 1.5rem;
    border-radius: 5px;
    text-decoration: none;
    font-weight: 600;
    transition: all 0.3s;
  }
  
  .btn-primary:hover {
    background: #f8f9fa;
    transform: translateY(-2px);
  }
  
  .stats-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1.5rem;
    margin-bottom: 2rem;
  }
  
  .stat-card {
    background: white;
    border-radius: 10px;
    padding: 1.5rem;
    display: flex;
    align-items: center;
    box-shadow: 0 4px 6px rgba(0,0,0,0.05);
  }
  
  .stat-icon {
    background-color: #f0f7f4;
    width: 60px;
    height: 60px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 1rem;
    color: #42b983;
    font-size: 1.5rem;
  }
  
  .stat-info h3 {
    font-size: 1.8rem;
    margin: 0;
    color: #2c3e50;
  }
  
  .stat-info p {
    margin: 0;
    color: #7f8c8d;
  }
  
  .section-title {
    color: #2c3e50;
    margin-bottom: 1.5rem;
    font-size: 1.5rem;
  }
  
  .jobs-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 1.5rem;
  }
  
  .job-card {
    background: white;
    border-radius: 10px;
    padding: 1.5rem;
    box-shadow: 0 4px 6px rgba(0,0,0,0.05);
    transition: transform 0.3s, box-shadow 0.3s;
  }
  
  .job-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 20px rgba(0,0,0,0.1);
  }
  
  .job-header h3 {
    margin: 0 0 0.5rem 0;
    color: #2c3e50;
  }
  
  .job-header .company {
    margin: 0;
    color: #7f8c8d;
    font-size: 0.9rem;
  }
  
  .job-details {
    margin: 1rem 0;
    color: #34495e;
  }
  
  .job-details p {
    margin: 0.5rem 0;
    display: flex;
    align-items: center;
  }
  
  .job-details i {
    margin-right: 0.5rem;
    color: #42b983;
  }
  
  .job-actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 1rem;
  }
  
  .btn-view {
    background-color: #42b983;
    color: white;
    padding: 0.5rem 1rem;
    border-radius: 5px;
    text-decoration: none;
    font-size: 0.9rem;
    transition: background-color 0.3s;
  }
  
  .btn-view:hover {
    background-color: #369f6b;
  }
  
  .btn-save {
    background: none;
    border: none;
    color: #bdc3c7;
    font-size: 1.2rem;
    cursor: pointer;
    transition: color 0.3s;
  }
  
  .btn-save:hover, .btn-save.saved {
    color: #42b983;
  }
  
  .loading-jobs {
    text-align: center;
    padding: 2rem;
    color: #7f8c8d;
    font-size: 1.1rem;
  }
  
  .no-jobs {
    text-align: center;
    padding: 2rem;
    color: #7f8c8d;
    font-size: 1.1rem;
    background: #f8f9fa;
    border-radius: 8px;
  }
  </style>