<template>
  <div class="saved-jobs">
    <h1>Việc Làm Đã Lưu</h1>
    <div v-if="loading">Đang tải...</div>
    <div v-else>
      <div v-if="jobs.length === 0" class="empty">Bạn chưa lưu việc làm nào</div>
      <div v-else class="job-list">
        <div v-for="job in jobs" :key="job.id_congviec" class="job-item">
          <h3>{{ job.tieu_de }}</h3>
          <p>{{ job.ten_congty }} - {{ job.dia_diem }}</p>
          <button @click="unsaveJob(job.id_congviec)">Bỏ lưu</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { useAuthStore } from '@/stores/authStore';

export default {
  setup() {
    const authStore = useAuthStore();
    const jobs = ref([]);
    const loading = ref(true);

    const fetchSavedJobs = async () => {
      try {
        await authStore.checkSession(); // Kiểm tra session trước
        
        const response = await axios.get('http://localhost:3000/api/nguoitimviec/saved-jobs', {
          withCredentials: true, // Sử dụng cookie session
          params: {
            page: 1,
            limit: 10
          }
        });
        
        jobs.value = response.data.data.jobs || [];
      } catch (error) {
        console.error('Lỗi khi tải việc làm đã lưu:', error);
        if (error.response?.status === 401) {
          authStore.logout();
        }
      } finally {
        loading.value = false;
      }
    };

    const unsaveJob = async (jobId) => {
      try {
        await authStore.checkSession();
        
        await axios.delete(
          `http://localhost:3000/api/nguoitimviec/jobs/${jobId}/save`, 
          { withCredentials: true }
        );
        
        jobs.value = jobs.value.filter(job => job.id_congviec !== jobId);
      } catch (error) {
        console.error('Lỗi khi bỏ lưu việc làm:', error);
        if (error.response?.status === 401) {
          authStore.logout();
        }
      }
    };

    onMounted(fetchSavedJobs);

    return { jobs, loading, unsaveJob };
  }
};
</script>

<style scoped>
.saved-jobs {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

.job-item {
  border: 1px solid #ddd;
  padding: 1.5rem;
  margin-bottom: 1rem;
  border-radius: 8px;
  background: white;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.job-item h3 {
  margin: 0 0 0.5rem 0;
  color: #2c3e50;
}

.job-item p {
  margin: 0 0 1rem 0;
  color: #7f8c8d;
}

.job-item button {
  background-color: #e74c3c;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.job-item button:hover {
  background-color: #c0392b;
}

.empty {
  text-align: center;
  padding: 2rem;
  color: #7f8c8d;
  font-style: italic;
}
</style>