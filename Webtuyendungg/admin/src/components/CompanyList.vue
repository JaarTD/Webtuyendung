<template>
    <div class="company-management">
      <div class="header">
        <h1>Quản lý công ty</h1>
        <div class="search-filter">
          <input 
            type="text" 
            v-model="searchQuery" 
            placeholder="Tìm kiếm công ty..." 
            @input="searchCompanies"
          >
          <select v-model="industryFilter" @change="filterCompanies">
            <option value="">Tất cả ngành nghề</option>
            <option v-for="industry in industries" :key="industry" :value="industry">
              {{ industry }}
            </option>
          </select>
        </div>
      </div>
      
      <div class="company-table">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Tên công ty</th>
              <th>Ngành nghề</th>
              <th>Địa chỉ</th>
              <th>Website</th>
              <th>Số công việc</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="company in paginatedCompanies" :key="company.id_congty">
              <td>{{ company.id_congty }}</td>
              <td>{{ company.ten_congty }}</td>
              <td>{{ company.nganh_nghe }}</td>
              <td>{{ company.dia_chi }}</td>
              <td>
                <a v-if="company.website" :href="company.website" target="_blank">
                  {{ company.website }}
                </a>
                <span v-else>N/A</span>
              </td>
              <td>{{ company.job_count }}</td>
              <td class="actions">
                <button 
                  class="view-btn"
                  @click="viewCompanyDetails(company)"
                >
                  Xem chi tiết
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
      
      <!-- Company Detail Modal -->
      <div v-if="selectedCompany" class="modal">
        <div class="modal-content">
          <span class="close" @click="selectedCompany = null">&times;</span>
          <h2>Chi tiết công ty</h2>
          <div class="company-details">
            <div class="detail-row">
              <span class="label">ID:</span>
              <span>{{ selectedCompany.id_congty }}</span>
            </div>
            <div class="detail-row">
              <span class="label">Tên công ty:</span>
              <span>{{ selectedCompany.ten_congty }}</span>
            </div>
            <div class="detail-row">
              <span class="label">Ngành nghề:</span>
              <span>{{ selectedCompany.nganh_nghe }}</span>
            </div>
            <div class="detail-row">
              <span class="label">Mô tả:</span>
              <span>{{ selectedCompany.mo_ta || 'N/A' }}</span>
            </div>
            <div class="detail-row">
              <span class="label">Địa chỉ:</span>
              <span>{{ selectedCompany.dia_chi }}</span>
            </div>
            <div class="detail-row">
              <span class="label">Website:</span>
              <span>
                <a v-if="selectedCompany.website" :href="selectedCompany.website" target="_blank">
                  {{ selectedCompany.website }}
                </a>
                <span v-else>N/A</span>
              </span>
            </div>
            <div class="detail-row">
              <span class="label">Logo:</span>
              <span>
                <img 
                  v-if="selectedCompany.logo" 
                  :src="selectedCompany.logo" 
                  alt="Company Logo" 
                  class="company-logo"
                >
                <span v-else>N/A</span>
              </span>
            </div>
            
            <h3>Thông tin nhà tuyển dụng</h3>
            <div class="recruiter-info">
              <div class="detail-row">
                <span class="label">Tên:</span>
                <span>{{ selectedCompany.recruiter?.ten || 'N/A' }}</span>
              </div>
              <div class="detail-row">
                <span class="label">Email:</span>
                <span>{{ selectedCompany.recruiter?.email || 'N/A' }}</span>
              </div>
            </div>
            
            <h3>Công việc đang tuyển ({{ selectedCompany.jobs?.length || 0 }})</h3>
            <div v-if="selectedCompany.jobs && selectedCompany.jobs.length > 0" class="company-jobs">
              <div v-for="job in selectedCompany.jobs" :key="job.id_congviec" class="job-item">
                <div class="job-title">{{ job.tieu_de }}</div>
                <div class="job-meta">
                  <span>{{ formatSalary(job.luong) }}</span>
                  <span>{{ job.dia_diem }}</span>
                  <span :class="['status-badge', job.trang_thai]">
                    {{ job.trang_thai === 'hoatdong' ? 'Hoạt động' : 'Không hoạt động' }}
                  </span>
                </div>
              </div>
            </div>
            <div v-else>
              <p>Công ty chưa đăng công việc nào</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
import axios from "axios";

export default {
  name: "CompanyList",
  data() {
    return {
      companies: [],
      filteredCompanies: [],
      searchQuery: "",
      industryFilter: "",
      industries: [],
      currentPage: 1,
      itemsPerPage: 10,
      totalPages: 1,
      selectedCompany: null
    };
  },
  methods: {
    formatSalary(salary) {
      return new Intl.NumberFormat('vi-VN', { 
        style: 'currency', 
        currency: 'VND' 
      }).format(salary);
    },
    async fetchCompanies() {
      try {
        const response = await axios.get("http://localhost:3000/api/congty");
        this.companies = response.data.data;
        this.industries = response.data.industries;
        this.filteredCompanies = [...this.companies];
        this.totalPages = Math.ceil(this.filteredCompanies.length / this.itemsPerPage);
      } catch (error) {
        console.error("Lỗi khi lấy danh sách công ty:", error);
      }
    },
    async searchCompanies() {
      try {
        const response = await axios.get("http://localhost:3000/api/congty/search", {
          params: {
            query: this.searchQuery,
            industry: this.industryFilter
          }
        });
        this.filteredCompanies = response.data.data;
        this.currentPage = 1;
        this.totalPages = Math.ceil(this.filteredCompanies.length / this.itemsPerPage);
      } catch (error) {
        console.error("Lỗi khi tìm kiếm công ty:", error);
      }
    },
    async viewCompanyDetails(company) {
      try {
        const response = await axios.get(`http://localhost:3000/api/congty/${company.id_congty}`);
        this.selectedCompany = response.data.data;
      } catch (error) {
        console.error("Lỗi khi lấy chi tiết công ty:", error);
      }
    },
    nextPage() {
      if (this.currentPage < this.totalPages) this.currentPage++;
    },
    prevPage() {
      if (this.currentPage > 1) this.currentPage--;
    }
  },
  computed: {
    paginatedCompanies() {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      return this.filteredCompanies.slice(start, start + this.itemsPerPage);
    }
  },
  mounted() {
    this.fetchCompanies();
  }
};
</script>
  
  <style scoped>
  .company-management {
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
  
  .company-table {
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
  
  .view-btn {
    background-color: #2196f3;
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
  
  .company-details {
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
  
  .company-logo {
    max-width: 100px;
    max-height: 100px;
  }
  
  .recruiter-info {
    margin-top: 15px;
    padding: 15px;
    background-color: #f9f9f9;
    border-radius: 5px;
  }
  
  .company-jobs {
    margin-top: 15px;
  }
  
  .job-item {
    padding: 15px;
    border: 1px solid #eee;
    border-radius: 5px;
    margin-bottom: 10px;
  }
  
  .job-title {
    font-weight: 600;
    margin-bottom: 5px;
  }
  
  .job-meta {
    display: flex;
    gap: 15px;
    font-size: 14px;
    color: #666;
  }
  
  .status-badge {
    padding: 2px 6px;
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
  </style>