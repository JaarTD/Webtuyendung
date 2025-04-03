<template>
  <div class="applications-container">
    <h2>Đơn Ứng Tuyển Của Tôi</h2>
    
    <!-- Thông báo trạng thái -->
    <div v-if="loading" class="loading">
      <i class="fas fa-spinner fa-spin"></i> Đang tải danh sách ứng tuyển...
    </div>
    
    <div v-if="errorMessage" class="alert alert-danger">
      <i class="fas fa-exclamation-circle"></i> {{ errorMessage }}
    </div>
    
    <!-- Bộ lọc trạng thái -->
    <div class="filter-section">
      <select v-model="statusFilter" @change="fetchApplications" class="form-control">
        <option value="">Tất cả trạng thái</option>
        <option value="choxuly">Chờ xử lý</option>
        <option value="daxuly">Đã xử lý</option>
        <option value="dachapnhan">Đã chấp nhận</option>
        <option value="bituchoi">Bị từ chối</option>
      </select>
    </div>
    
    <!-- Danh sách đơn ứng tuyển -->
    <div class="applications-list">
      <div v-if="applications.length === 0 && !loading" class="no-applications">
        <i class="fas fa-file-alt"></i>
        <p>Bạn chưa có đơn ứng tuyển nào</p>
      </div>
      
      <div v-for="app in filteredApplications" :key="app.id_hoso" class="application-card">
        <div class="application-header">
          <h3>{{ app.tieu_de }}</h3>
          <span :class="'status-badge status-' + app.trang_thai">
            {{ getStatusText(app.trang_thai) }}
          </span>
        </div>
        
        <div class="application-details">
          <p><i class="fas fa-building"></i> {{ app.ten_congty }}</p>
          <p><i class="fas fa-map-marker-alt"></i> {{ app.dia_diem }}</p>
          <p><i class="fas fa-calendar-alt"></i> Nộp ngày: {{ formatDate(app.ngay_nop) }}</p>
        </div>
        
        <div class="application-actions">
          <button @click="viewJob(app.id_congviec)" class="btn-view">
            <i class="fas fa-eye"></i> Xem chi tiết
          </button>
          <button 
            @click="withdrawApplication(app.id_hoso)" 
            v-if="app.trang_thai === 'choxuly'"
            class="btn-withdraw"
          >
            <i class="fas fa-undo"></i> Rút đơn
          </button>
        </div>
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
    const successMessage = ref('');
    const applications = ref([]);
    const statusFilter = ref('');
    const loading = ref(false);
    const errorMessage = ref('');
    
    // Computed property để lọc ứng tuyển theo trạng thái
    const filteredApplications = computed(() => {
      if (!statusFilter.value) return applications.value;
      return applications.value.filter(app => app.trang_thai === statusFilter.value);
    });

    const getStatusText = (status) => {
      const statusMap = {
        'choxuly': 'Chờ xử lý',
        'daxuly': 'Đã xem xét',
        'dachapnhan': 'Đã chấp nhận',
        'bituchoi': 'Bị từ chối'
      };
      return statusMap[status] || status;
    };

    const formatDate = (dateString) => {
      const options = { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      };
      return new Date(dateString).toLocaleDateString('vi-VN', options);
    };

    const fetchApplications = async () => {
      try {
        loading.value = true;
        errorMessage.value = '';
        
        await authStore.checkSession();
        
        if (!authStore.isAuthenticated) {
          errorMessage.value = 'Vui lòng đăng nhập để xem đơn ứng tuyển';
          return;
        }

        const response = await axios.get('http://localhost:3000/api/nguoitimviec/applications', { 
          withCredentials: true
        });
        
        applications.value = response.data.data?.applications || [];
      } catch (error) {
        handleApiError(error);
      } finally {
        loading.value = false;
      }
    };

    const withdrawApplication = async (applicationId) => {
  if (!confirm('Bạn có chắc chắn muốn rút đơn ứng tuyển này?')) return;
  
  try {
    loading.value = true;
    
    await authStore.checkSession();
    
    // Sửa endpoint API để phù hợp với backend
    await axios.delete(
      `http://localhost:3000/api/nguoitimviec/applications/${applicationId}`,
      { withCredentials: true }
    );
    
    // Cập nhật UI ngay lập tức
    applications.value = applications.value.filter(app => app.id_hoso !== applicationId);
    
    // Hiển thị thông báo thành công
    errorMessage.value = '';
    setTimeout(() => {
      successMessage.value = 'Đã rút đơn ứng tuyển thành công';
      setTimeout(() => successMessage.value = '', 3000);
    }, 0);
  } catch (error) {
    console.error('Lỗi khi rút đơn ứng tuyển:', error);
    handleApiError(error);
  } finally {
    loading.value = false;
  }
};
    const viewJob = (jobId) => {
      router.push(`/job-seeker/jobs/${jobId}`);
    };
    
    const handleApiError = (error) => {
      if (error.response) {
        if (error.response.status === 401) {
          errorMessage.value = 'Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.';
          authStore.logout();
          router.push('/login');
        } else {
          errorMessage.value = error.response.data?.message || 
                             'Có lỗi xảy ra khi tải đơn ứng tuyển';
        }
      } else if (error.request) {
        errorMessage.value = 'Không thể kết nối đến máy chủ';
      } else {
        errorMessage.value = 'Đã xảy ra lỗi không xác định';
      }
    };

    onMounted(fetchApplications);

    return {
      applications,
      filteredApplications,
      statusFilter,
      loading,
      errorMessage,
      getStatusText,
      formatDate,
      withdrawApplication,
      viewJob
    };
  }
};
</script>

<style scoped>
.applications-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
  font-family: 'Inter', sans-serif;
}

h2 {
  color: #2c3e50;
  margin-bottom: 1.5rem;
  text-align: center;
  font-size: 1.8rem;
}

.loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.8rem;
  padding: 1.2rem;
  margin: 1.5rem 0;
  color: #4361ee;
  background-color: rgba(67, 97, 238, 0.1);
  border-radius: 8px;
  font-weight: 500;
}

.alert {
  padding: 1rem 1.5rem;
  margin-bottom: 1.5rem;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 0.8rem;
  font-weight: 500;
  background-color: #fff5f5;
  color: #ff5252;
  border-left: 4px solid #ff5252;
}

.filter-section {
  margin-bottom: 2rem;
}

.form-control {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.3s;
}

.form-control:focus {
  border-color: #42b983;
  outline: none;
}

.applications-list {
  display: grid;
  gap: 1.5rem;
}

.no-applications {
  text-align: center;
  padding: 3rem;
  color: #7f8c8d;
  background: #f8f9fa;
  border-radius: 12px;
}

.no-applications i {
  font-size: 2.5rem;
  margin-bottom: 1rem;
  color: #bdc3c7;
}

.application-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  transition: transform 0.3s, box-shadow 0.3s;
}

.application-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.1);
}

.application-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.application-header h3 {
  color: #2c3e50;
  margin: 0;
  font-size: 1.2rem;
}

.status-badge {
  padding: 0.35rem 0.8rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 500;
}

.status-choxuly {
  background-color: #fff3e0;
  color: #ff9800;
}

.status-daxuly {
  background-color: #e3f2fd;
  color: #2196f3;
}

.status-dachapnhan {
  background-color: #e8f5e9;
  color: #4caf50;
}

.status-bituchoi {
  background-color: #ffebee;
  color: #f44336;
}

.application-details {
  margin-bottom: 1.2rem;
}

.application-details p {
  margin: 0.6rem 0;
  color: #34495e;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.application-details i {
  width: 1.2rem;
  color: #7f8c8d;
}

.application-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
}

.btn-view, .btn-withdraw {
  padding: 0.65rem 1.25rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s;
}

.btn-view {
  background-color: #42b983;
  color: white;
}

.btn-view:hover {
  background-color: #369f6b;
}

.btn-withdraw {
  background-color: #fff5f5;
  color: #f44336;
  border: 1px solid #f44336;
}

.btn-withdraw:hover {
  background-color: #ffebee;
}

@media (max-width: 768px) {
  .applications-container {
    padding: 1.5rem;
  }
  
  .application-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .application-actions {
    flex-direction: column;
  }
  
  .btn-view, .btn-withdraw {
    width: 100%;
    justify-content: center;
  }
}
</style>