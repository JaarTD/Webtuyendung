<template>
  <div class="job-search">
    <div class="search-header">
      <h1>Tìm kiếm công việc</h1>
      <div class="search-filters">
        <div class="search-input">
          <i class="fas fa-search"></i>
          <input 
            v-model="searchParams.keyword" 
            placeholder="Từ khóa (ví dụ: Nhân viên IT, Kế toán...)"
            @keyup.enter="searchJobs"
          >
        </div>
        
        <div class="filter-row">
          <div class="filter-group">
            <label><i class="fas fa-map-marker-alt"></i> Địa điểm</label>
            <input v-model="searchParams.location" placeholder="Toàn quốc">
          </div>
          
          <div class="filter-group">
            <label><i class="fas fa-money-bill-wave"></i> Mức lương</label>
            <div class="salary-range">
              <input 
                v-model="searchParams.salary_min" 
                type="number" 
                placeholder="Từ"
              >
              <span>-</span>
              <input 
                v-model="searchParams.salary_max" 
                type="number" 
                placeholder="Đến"
              >
            </div>
          </div>
          
          <div class="filter-group">
            <label><i class="fas fa-tools"></i> Kỹ năng</label>
            <input 
              v-model="searchParams.skills" 
              placeholder="Nhập kỹ năng (cách nhau bằng dấu phẩy)"
            >
          </div>
          
          <button class="search-btn" @click="searchJobs">
            <i class="fas fa-search"></i> Tìm kiếm
          </button>
          
          <button class="show-all-btn" @click="showAllJobs">
            <i class="fas fa-list"></i> Hiển thị tất cả
          </button>
        </div>
      </div>
    </div>
    
    <div class="search-results">
      <div class="results-header">
        <h2 v-if="!isShowingAll">Kết quả tìm kiếm ({{ totalJobs }} công việc)</h2>
        <h2 v-else>Tất cả công việc đang tuyển ({{ totalJobs }} công việc)</h2>
        <div class="sort-options">
          <label>Sắp xếp:</label>
          <select v-model="searchParams.sort" @change="handleSortChange">
            <option value="newest">Mới nhất</option>
            <option value="salary_high">Lương cao nhất</option>
            <option value="salary_low">Lương thấp nhất</option>
          </select>
        </div>
      </div>
      
      <div class="job-list">
        <div v-for="job in jobs" :key="job.id_congviec" class="job-card">
          <div class="job-logo">
            <img :src="job.logo || '/images/default-company.png'" alt="Company Logo">
          </div>
          
          <div class="job-info">
            <h3>{{ job.tieu_de }}</h3>
            <p class="company">{{ job.ten_congty }}</p>
            
            <div class="job-meta">
              <span><i class="fas fa-map-marker-alt"></i> {{ job.dia_diem }}</span>
              <span><i class="fas fa-money-bill-wave"></i> {{ formatSalary(job.luong) }}</span>
              <span><i class="fas fa-clock"></i> {{ formatDate(job.ngay_dang) }}</span>
            </div>
            
            <div class="job-skills">
              <span v-for="(skill, index) in job.ky_nang" :key="index" class="skill-tag">
                {{ skill }}
              </span>
            </div>
          </div>
          
          
          <div class="job-actions">
  <router-link 
    :to="`/job-seeker/jobs/${job.id_congviec}`" 
    class="btn-view"
  >
    <i class="fas fa-eye"></i> Xem chi tiết
  </router-link>
  
  <router-link 
    :to="`/job-seeker/jobs/${job.id_congviec}`" 
    class="btn-apply"
  >
    Ứng tuyển ngay
  </router-link>
  
  <button 
    v-if="!job.da_luu" 
    @click.stop="saveJob(job.id_congviec)" 
    class="btn-save"
    title="Lưu công việc"
  >
    <i class="far fa-bookmark"></i>
  </button>
  <button 
    v-else 
    @click.stop="unsaveJob(job.id_congviec)" 
    class="btn-save saved"
    title="Bỏ lưu"
  >
    <i class="fas fa-bookmark"></i>
  </button>
</div>
        </div>
        
        <div v-if="jobs.length === 0" class="no-results">
          <i class="fas fa-search"></i>
          <p>Không tìm thấy công việc phù hợp</p>
        </div>
      </div>
      
      <div class="pagination" v-if="totalPages > 1">
        <button 
          @click="prevPage" 
          :disabled="currentPage === 1"
          class="page-btn"
        >
          <i class="fas fa-chevron-left"></i>
        </button>
        
        <span class="page-info">
          Trang {{ currentPage }} / {{ totalPages }}
        </span>
        
        <button 
          @click="nextPage" 
          :disabled="currentPage >= totalPages"
          class="page-btn"
        >
          <i class="fas fa-chevron-right"></i>
        </button>
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
    const currentPage = ref(1);
    const totalPages = ref(1);
    const totalJobs = ref(0);
    const isShowingAll = ref(false);

    const searchParams = ref({
      keyword: '',
      location: '',
      salary_min: null,
      salary_max: null,
      skills: '',
      sort: 'newest',
      page: 1,
      limit: 10
    });

    const formatSalary = (salary) => {
      return new Intl.NumberFormat('vi-VN', { 
        style: 'currency', 
        currency: 'VND',
        maximumFractionDigits: 0
      }).format(salary);
    };

    const formatDate = (dateString) => {
      const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
      return new Date(dateString).toLocaleDateString('vi-VN', options);
    };

    const searchJobs = async () => {
  try {
    await authStore.checkSession();
    isShowingAll.value = false;
    
    const params = {
      ...searchParams.value,
      page: currentPage.value
    };
    
    const response = await axios.get('http://localhost:3000/api/nguoitimviec/jobs', { 
      params,
      withCredentials: true
    });
    
    // Kiểm tra và xử lý response theo cấu trúc thực tế
    if (response.data && response.data.data) {
      jobs.value = response.data.data.jobs.map(job => ({
        ...job,
        ky_nang: Array.isArray(job.ky_nang) ? job.ky_nang : (job.ky_nang ? job.ky_nang.split(',') : []),
        da_luu: job.isSaved || false
      }));
      totalJobs.value = response.data.data.total || 0;
      totalPages.value = Math.ceil(totalJobs.value / searchParams.value.limit);
    } else {
      jobs.value = [];
      totalJobs.value = 0;
      totalPages.value = 1;
      console.error('Cấu trúc response không hợp lệ:', response.data);
    }
  } catch (error) {
    console.error('Lỗi khi tìm kiếm công việc:', error);
    jobs.value = [];
    totalJobs.value = 0;
    totalPages.value = 1;
    
    if (error.response?.status === 401) {
      authStore.logout();
    }
  }
};

    const getAllActiveJobs = async () => {
      try {
        await authStore.checkSession();
        isShowingAll.value = true;
        
        const params = {
          page: currentPage.value,
          limit: searchParams.value.limit
        };
        
        const response = await axios.get('http://localhost:3000/api/nguoitimviec/jobsall', { 
          params,
          withCredentials: true
        });
        
        jobs.value = response.data.data.jobs.map(job => ({
          ...job,
          ky_nang: Array.isArray(job.ky_nang) ? job.ky_nang : (job.ky_nang ? [job.ky_nang] : []),
          da_luu: job.isSaved || false
        }));
        totalJobs.value = response.data.data.total;
        totalPages.value = Math.ceil(response.data.data.total / searchParams.value.limit);
      } catch (error) {
        console.error('Lỗi khi lấy tất cả công việc:', error);
        if (error.response?.status === 401) {
          authStore.logout();
        }
      }
    };

    const showAllJobs = () => {
      currentPage.value = 1;
      getAllActiveJobs();
    };

    const handleSortChange = () => {
      currentPage.value = 1;
      if (isShowingAll.value) {
        getAllActiveJobs();
      } else {
        searchJobs();
      }
    };

    const saveJob = async (jobId) => {
      try {
        await authStore.checkSession();
        
        await axios.post(
          `http://localhost:3000/api/nguoitimviec/jobs/${jobId}/save`, 
          {}, 
          { withCredentials: true }
        );
        
        // Cập nhật trạng thái lưu ngay lập tức
        const jobIndex = jobs.value.findIndex(j => j.id_congviec === jobId);
        if (jobIndex !== -1) {
          jobs.value[jobIndex].da_luu = true;
        }
      } catch (error) {
        console.error('Lỗi khi lưu công việc:', error);
        if (error.response?.status === 401) {
          authStore.logout();
        }
      }
    };

    const unsaveJob = async (jobId) => {
      try {
        await authStore.checkSession();
        
        await axios.delete(
          `http://localhost:3000/api/nguoitimviec/jobs/${jobId}/save`, 
          { withCredentials: true }
        );
        
        // Cập nhật trạng thái lưu ngay lập tức
        const jobIndex = jobs.value.findIndex(j => j.id_congviec === jobId);
        if (jobIndex !== -1) {
          jobs.value[jobIndex].da_luu = false;
        }
      } catch (error) {
        console.error('Lỗi khi bỏ lưu công việc:', error);
        if (error.response?.status === 401) {
          authStore.logout();
        }
      }
    };

    const nextPage = () => {
      currentPage.value++;
      if (isShowingAll.value) {
        getAllActiveJobs();
      } else {
        searchJobs();
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const prevPage = () => {
      currentPage.value--;
      if (isShowingAll.value) {
        getAllActiveJobs();
      } else {
        searchJobs();
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    onMounted(searchJobs);

    return {
      jobs,
      currentPage,
      totalPages,
      totalJobs,
      isShowingAll,
      searchParams,
      formatSalary,
      formatDate,
      searchJobs,
      showAllJobs,
      saveJob,
      unsaveJob,
      nextPage,
      prevPage,
      handleSortChange
    };
  }
};
</script>

<style scoped>
.job-search {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 0;
}

.search-header {
  background-color: #f8f9fa;
  padding: 2rem;
  border-radius: 10px;
  margin-bottom: 2rem;
}

.search-header h1 {
  color: #2c3e50;
  margin-bottom: 1.5rem;
}

.search-input {
  position: relative;
  margin-bottom: 1.5rem;
}

.search-input i {
  position: absolute;
  left: 15px;
  top: 50%;
  transform: translateY(-50%);
  color: #7f8c8d;
}

.search-input input {
  width: 100%;
  padding: 12px 20px 12px 45px;
  border: 1px solid #ddd;
  border-radius: 30px;
  font-size: 1rem;
  transition: border-color 0.3s;
}

.search-input input:focus {
  border-color: #42b983;
  outline: none;
}

.filter-row {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  align-items: flex-end;
}

.filter-group {
  flex: 1;
  min-width: 200px;
}

.filter-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: #2c3e50;
  font-weight: 500;
}

.filter-group input {
  width: 100%;
  padding: 10px 15px;
  border: 1px solid #ddd;
  border-radius: 5px;
}

.salary-range {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.salary-range input {
  flex: 1;
}

.salary-range span {
  color: #7f8c8d;
}

.search-btn, .show-all-btn {
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
  font-weight: 500;
  align-self: flex-end;
  transition: background-color 0.3s;
  height: 40px;
}

.search-btn {
  background-color: #42b983;
}

.search-btn:hover {
  background-color: #369f6b;
}

.show-all-btn {
  background-color: #3498db;
  margin-left: 0.5rem;
}

.show-all-btn:hover {
  background-color: #2980b9;
}

.search-btn i, .show-all-btn i {
  margin-right: 5px;
}

.results-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.results-header h2 {
  color: #2c3e50;
  font-size: 1.3rem;
}

.sort-options {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.sort-options label {
  color: #7f8c8d;
}

.sort-options select {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 5px;
}

.job-list {
  display: grid;
  gap: 1.5rem;
}

.job-card {
  background: white;
  border-radius: 10px;
  padding: 1.5rem;
  display: flex;
  gap: 1.5rem;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
  transition: transform 0.3s, box-shadow 0.3s;
}

.job-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 5px 15px rgba(0,0,0,0.1);
}

.job-logo {
  width: 80px;
  height: 80px;
  border-radius: 5px;
  overflow: hidden;
  flex-shrink: 0;
}

.job-logo img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.job-info {
  flex: 1;
}

.job-info h3 {
  margin: 0 0 0.5rem 0;
  color: #2c3e50;
}

.company {
  margin: 0 0 1rem 0;
  color: #7f8c8d;
  font-size: 0.9rem;
}

.job-meta {
  display: flex;
  gap: 1.5rem;
  margin-bottom: 1rem;
  color: #34495e;
  font-size: 0.9rem;
}

.job-meta i {
  margin-right: 5px;
  color: #42b983;
}

.job-skills {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.skill-tag {
  background-color: #f0f7f4;
  color: #42b983;
  padding: 0.3rem 0.8rem;
  border-radius: 20px;
  font-size: 0.8rem;
}

.job-actions {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  align-items: center;
}

.btn-apply {
  background-color: #42b983;
  color: white;
  padding: 0.5rem 1.5rem;
  border-radius: 5px;
  text-decoration: none;
  font-weight: 500;
  transition: background-color 0.3s;
  white-space: nowrap;
}

.btn-apply:hover {
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

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-top: 2rem;
}

.page-btn {
  background: white;
  border: 1px solid #ddd;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  cursor: pointer;
  transition: background-color 0.3s;
}

.page-btn:hover:not(:disabled) {
  background-color: #f0f7f4;
  border-color: #42b983;
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-info {
  color: #7f8c8d;
}

.no-results {
  text-align: center;
  padding: 3rem;
  color: #7f8c8d;
}

.no-results i {
  font-size: 3rem;
  margin-bottom: 1rem;
  color: #bdc3c7;
}

.no-results p {
  font-size: 1.2rem;
}

@media (max-width: 768px) {
  .filter-row {
    flex-direction: column;
  }
  
  .filter-group {
    width: 100%;
  }
  
  .search-btn, .show-all-btn {
    width: 100%;
    margin-left: 0;
    margin-top: 0.5rem;
  }
  
  .job-card {
    flex-direction: column;
  }
  
  .job-actions {
    flex-direction: row;
    margin-top: 1rem;
  }
}
</style>