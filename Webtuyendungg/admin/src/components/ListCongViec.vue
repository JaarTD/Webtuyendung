<template>
    <div class="job-management">
      <div class="header">
        <h1>Quản lý công việc</h1>
        <div class="search-filter">
          <input 
            type="text" 
            v-model="searchQuery" 
            placeholder="Tìm kiếm công việc..." 
            @input="searchJobs"
          >
          <select v-model="statusFilter" @change="filterJobs">
            <option value="">Tất cả trạng thái</option>
            <option value="hoatdong">Đang hoạt động</option>
            <option value="khonghoatdong">Không hoạt động</option>
          </select>
        </div>
      </div>
      
      <div class="job-table">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Tiêu đề</th>
              <th>Công ty</th>
              <th>Lương</th>
              <th>Địa điểm</th>
              <th>Ngày đăng</th>
              <th>Hạn nộp</th>
              <th>Trạng thái</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
    <tr v-for="job in paginatedJobs" :key="job.id_congviec">
      <td>{{ job.id_congviec }}</td>
      <td>{{ job.tieu_de }}</td>
      <td>{{ job.ten_congty || 'N/A' }}</td>
      <td>{{ formatSalary(job.luong) }}</td>
      <td>{{ job.dia_diem }}</td>
      <td>{{ formatDate(job.ngay_dang) }}</td>
      <td :class="{ 'expired': isExpired(job.ngay_het_han) }">
        {{ formatDate(job.ngay_het_han) }}
      </td>
      <td>
        <span :class="['status-badge', job.trang_thai]">
          {{ job.trang_thai === 'hoatdong' ? 'Hoạt động' : 'Không hoạt động' }}
        </span>
      </td>
      <td class="actions">
        <button 
          @click="toggleJobStatus(job)"
          :class="['status-btn', job.trang_thai === 'khonghoatdong' ? 'activate' : 'deactivate']"
        >
          {{ job.trang_thai === 'khonghoatdong' ? 'Kích hoạt' : 'Vô hiệu hóa' }}
        </button>
        <button class="view-btn" @click="viewJobDetails(job)">
          Xem chi tiết
        </button>
        <button 
          class="delete-btn" 
          @click="deleteJob(job)"
        >
          Xóa
        </button>
      </td>
    </tr>
  </tbody>
        </table>
      </div>
      
      <div class="pagination">
        <button 
          @click="prevPage" 
          :disabled="currentPage === 1"
        >
          Trước
        </button>
        <span>Trang {{ currentPage }} / {{ totalPages }}</span>
        <button 
          @click="nextPage" 
          :disabled="currentPage === totalPages"
        >
          Sau
        </button>
      </div>
      
      <!-- Job Detail Modal -->
      <div v-if="selectedJob" class="modal">
        <div class="modal-content">
          <span class="close" @click="selectedJob = null">&times;</span>
          <h2>Chi tiết công việc</h2>
          <div class="job-details">
            <div class="detail-row">
              <span class="label">ID:</span>
              <span>{{ selectedJob.id_congviec }}</span>
            </div>
            <div class="detail-row">
              <span class="label">Tiêu đề:</span>
              <span>{{ selectedJob.tieu_de }}</span>
            </div>
            <div class="detail-row">
              <span class="label">Công ty:</span>
              <span>{{ selectedJob.ten_congty }}</span>
            </div>
            <div class="detail-row">
              <span class="label">Mô tả:</span>
              <span>{{ selectedJob.mo_ta }}</span>
            </div>
  
            
            <div class="detail-row">
              <span class="label">Lương:</span>
              <span>{{ formatSalary(selectedJob.luong) }}</span>
            </div>
            <div class="detail-row">
              <span class="label">Địa điểm:</span>
              <span>{{ selectedJob.dia_diem }}</span>
            </div>
            <div class="detail-row">
              <span class="label">Ngày đăng:</span>
              <span>{{ formatDate(selectedJob.ngay_dang) }}</span>
            </div>
            <div class="detail-row">
              <span class="label">Hạn nộp:</span>
              <span :class="{ 'expired': isExpired(selectedJob.ngay_het_han) }">
                {{ formatDate(selectedJob.ngay_het_han) }}
              </span>
            </div>
            <div class="detail-row">
              <span class="label">Trạng thái:</span>
              <span :class="['status-badge', selectedJob.trang_thai]">
                {{ selectedJob.trang_thai === 'hoatdong' ? 'Hoạt động' : 'Không hoạt động' }}
              </span>
            </div>
            
            <h3>Kỹ năng yêu cầu</h3>
            <div class="detail-row">
              <span class="label">Yêu cầu:</span>
              <span>{{ selectedJob.yeu_cau }}</span>
            </div>
            
            <h3>Thống kê</h3>
<div class="stats">
  <div class="stat-item">
    <span class="stat-label">Lượt xem:</span>
    <span class="stat-value">{{ selectedJob.stats?.luot_xem || 0 }}</span>
  </div>
  <div class="stat-item">
    <span class="stat-label">Lượt ứng tuyển:</span>
    <span class="stat-value">{{ selectedJob.stats?.luot_ung_tuyen || 0 }}</span>
  </div>
</div>
          </div>
          
          <div class="modal-actions">
            <button 
              @click="toggleJobStatus(selectedJob)"
              :class="['status-btn', selectedJob.trang_thai === 'khonghoatdong' ? 'activate' : 'deactivate']"
            >
              {{ selectedJob.trang_thai === 'khonghoatdong' ? 'Kích hoạt' : 'Vô hiệu hóa' }}
            </button>
            <button 
              class="delete-btn"
              @click="deleteJob(selectedJob)"
            >
              Xóa công việc
            </button>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
import axios from "axios";

export default {
  name: "JobList",
  data() {
    return {
      jobs: [],
      filteredJobs: [],
      searchQuery: "",
      statusFilter: "",
      currentPage: 1,
      itemsPerPage: 10,
      selectedJob: null,
      isLoading: false
    };
  },
  methods: {
    formatDate(date) {
      return new Date(date).toLocaleDateString('vi-VN');
    },
    formatSalary(salary) {
      return new Intl.NumberFormat('vi-VN', { 
        style: 'currency', 
        currency: 'VND' 
      }).format(salary);
    },
    isExpired(deadline) {
      return new Date(deadline) < new Date();
    },
    async fetchJobs() {
      this.isLoading = true;
      try {
        const response = await axios.get("http://localhost:3000/api/jobs");
        this.jobs = response.data;
        this.filteredJobs = [...this.jobs];
      } catch (error) {
        console.error("Lỗi khi lấy danh sách công việc:", error);
        this.$notify.error({
          title: 'Lỗi',
          message: error.response?.data?.error || 'Không thể tải danh sách công việc'
        });
      } finally {
        this.isLoading = false;
      }
    },
    async fetchJobDetails(id) {
      try {
        const response = await axios.get(`http://localhost:3000/api/jobs/${id}`);
        return response.data;
      } catch (error) {
        console.error("Lỗi khi lấy chi tiết công việc:", error);
        this.$notify.error({
          title: 'Lỗi',
          message: error.response?.data?.message || 'Không thể tải chi tiết công việc'
        });
        return null;
      }
    },
    async toggleJobStatus(job) {
      try {
        const newStatus = job.trang_thai === 'hoatdong' ? 'khonghoatdong' : 'hoatdong';
        await axios.put(`http://localhost:3000/api/jobs/${job.id_congviec}`, {
          trang_thai: newStatus
        });
        
        job.trang_thai = newStatus;
        this.$notify({
          title: 'Thành công',
          message: `Đã ${newStatus === 'hoatdong' ? 'kích hoạt' : 'vô hiệu hóa'} công việc`,
          type: 'success'
        });
      } catch (error) {
        console.error("Lỗi khi thay đổi trạng thái:", error);
        this.$notify.error({
          title: 'Lỗi',
          message: error.response?.data?.error || 'Không thể thay đổi trạng thái'
        });
      }
    },
    async fetchJobStats(jobId) {
  try {
    const response = await axios.get(`http://localhost:3000/api/admin/jobs/${jobId}/stats`);
    return response.data.data || { views: 0, applications: 0 };
  } catch (error) {
    console.error("Lỗi khi lấy thống kê:", {
      message: error.message,
      response: error.response?.data
    });
    return { views: 0, applications: 0 };
  }

},
    async deleteJob(job) {
      if (!confirm(`Bạn có chắc chắn muốn xóa công việc "${job.tieu_de}"?`)) return;
      
      try {
        await axios.delete(`http://localhost:3000/api/jobs/${job.id_congviec}`);
        this.jobs = this.jobs.filter(j => j.id_congviec !== job.id_congviec);
        this.filteredJobs = this.filteredJobs.filter(j => j.id_congviec !== job.id_congviec);
        this.selectedJob = null;
        this.$notify({
          title: 'Thành công',
          message: 'Đã xóa công việc thành công',
          type: 'success'
        });
      } catch (error) {
        console.error("Lỗi khi xóa công việc:", error);
        this.$notify.error({
          title: 'Lỗi',
          message: error.response?.data?.error || 'Không thể xóa công việc'
        });
      }
    },
    async viewJobDetails(job) {
  try {
    this.selectedJob = job;
    
    // Load song song cả chi tiết và thống kê
    const [details, stats] = await Promise.all([
      this.fetchJobDetails(job.id_congviec),
      this.fetchJobStats(job.id_congviec)
    ]);
    
    console.log('Stats received:', stats); // Log để kiểm tra
    
    this.selectedJob = {
      ...job,
      ...(details || {}),
      stats: {
        luot_xem: stats.views || 0,
        luot_ung_tuyen: stats.applications || 0
      }
    };
  } catch (error) {
    console.error('Error loading job details:', error);
    this.$notify.error({
      title: 'Lỗi',
      message: 'Không thể tải chi tiết công việc'
    });
  }

},

    searchJobs() {
      const query = this.searchQuery.toLowerCase();
      this.filteredJobs = this.jobs.filter(job => 
        job.tieu_de.toLowerCase().includes(query) || 
        (job.ten_congty && job.ten_congty.toLowerCase().includes(query))
      );
      this.currentPage = 1;
    },
    filterJobs() {
      if (!this.statusFilter) {
        this.filteredJobs = [...this.jobs];
      } else {
        this.filteredJobs = this.jobs.filter(job => job.trang_thai === this.statusFilter);
      }
      this.currentPage = 1;
    },
    nextPage() {
      if (this.currentPage < this.totalPages) this.currentPage++;
    },
    prevPage() {
      if (this.currentPage > 1) this.currentPage--;
    }
  },
  computed: {
    paginatedJobs() {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      return this.filteredJobs.slice(start, start + this.itemsPerPage);
    },
    totalPages() {
      return Math.ceil(this.filteredJobs.length / this.itemsPerPage);
    }
  },
  mounted() {
    this.fetchJobs();
  }
};
</script>
  
  <style scoped>
  .job-management {
    padding: 20px;
    max-width: 1200px;
    margin: 0 auto;
  }
  
  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
  }
  
  .search-filter {
    display: flex;
    gap: 10px;
  }
  
  .search-filter input {
    padding: 8px 12px;
    border: 1px solid #ddd;
    border-radius: 4px;
    width: 250px;
  }
  
  .search-filter select {
    padding: 8px;
    border: 1px solid #ddd;
    border-radius: 4px;
  }
  
  .job-table {
    background: white;
    border-radius: 5px;
    box-shadow: 0 2px 5px rgba(0,0,0,0.1);
    overflow-x: auto;
  }
  
  table {
    width: 100%;
    border-collapse: collapse;
  }
  
  th, td {
    padding: 12px 15px;
    text-align: left;
    border-bottom: 1px solid #eee;
  }
  
  th {
    background-color: #f5f5f5;
    font-weight: 600;
  }
  
  .status-badge {
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 12px;
    font-weight: 500;
  }
  
  .status-badge.hoatdong {
    background-color: #e8f5e9;
    color: #388e3c;
  }
  
  .status-badge.khonghoatdong {
    background-color: #ffebee;
    color: #d32f2f;
  }
  
  .expired {
    color: #d32f2f;
    font-weight: 500;
  }
  
  .actions {
    display: flex;
    gap: 5px;
  }
  
  button {
    padding: 6px 10px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 13px;
  }
  
  .status-btn {
    color: white;
  }
  
  .activate {
    background-color: #4caf50;
  }
  
  .deactivate {
    background-color: #f44336;
  }
  
  .view-btn {
    background-color: #2196f3;
    color: white;
  }
  
  .delete-btn {
    background-color: #f44336;
    color: white;
  }
  
  .pagination {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 15px;
    margin-top: 20px;
  }
  
  .pagination button {
    padding: 8px 15px;
    background-color: #42b983;
    color: white;
  }
  
  .pagination button:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
  }
  
  /* Modal styles */
  .modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0,0,0,0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
  }
  
  .modal-content {
    background-color: white;
    padding: 25px;
    border-radius: 5px;
    width: 700px;
    max-height: 80vh;
    overflow-y: auto;
    position: relative;
  }
  
  .close {
    position: absolute;
    top: 15px;
    right: 20px;
    font-size: 24px;
    cursor: pointer;
  }
  
  .job-details {
    margin-top: 20px;
  }
  
  .detail-row {
    display: flex;
    margin-bottom: 10px;
  }
  
  .label {
    font-weight: 600;
    width: 120px;
    color: #555;
  }
  
  .skills {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin: 15px 0;
  }
  
  .skill-tag {
    background-color: #e3f2fd;
    color: #1976d2;
    padding: 4px 10px;
    border-radius: 15px;
    font-size: 13px;
  }
  
  .stats {
    display: flex;
    gap: 30px;
    margin: 15px 0;
  }
  
  .stat-item {
    display: flex;
    flex-direction: column;
  }
  
  .stat-label {
    font-size: 14px;
    color: #666;
  }
  
  .stat-value {
    font-size: 18px;
    font-weight: 600;
    color: #2c3e50;
  }
  
  .modal-actions {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    margin-top: 20px;
    padding-top: 20px;
    border-top: 1px solid #eee;
  }
  </style>