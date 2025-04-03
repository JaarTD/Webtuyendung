<template>
    <div class="application-management">
      <div class="header">
        <h1>Quản lý ứng tuyển</h1>
        <div class="search-filter">
          <input 
            type="text" 
            v-model="searchQuery" 
            placeholder="Tìm kiếm ứng viên hoặc công việc..." 
            @input="searchApplications"
          >
          <select v-model="statusFilter" @change="filterApplications">
            <option value="">Tất cả trạng thái</option>
            <option value="choxuly">Chờ xử lý</option>
            <option value="daxuly">Đã xử lý</option>
            <option value="dachapnhan">Đã chấp nhận</option>
            <option value="bituchoi">Bị từ chối</option>
          </select>
        </div>
      </div>
      
      <div class="application-table">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Ứng viên</th>
              <th>Công việc</th>
              <th>Công ty</th>
              <th>Ngày nộp</th>
              <th>Trạng thái</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="app in paginatedApplications" :key="app.id_hoso">
              <td>{{ app.id_hoso }}</td>
              <td>{{ app.ung_vien }}</td>
              <td>{{ app.cong_viec }}</td>
              <td>{{ app.cong_ty }}</td>
              <td>{{ formatDate(app.ngay_nop) }}</td>
              <td>
                <span :class="['status-badge', app.trang_thai]">
                  {{ formatStatus(app.trang_thai) }}
                </span>
              </td>
              <td class="actions">
                <button 
                  class="view-btn"
                  @click="viewApplicationDetails(app)"
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
      
      <!-- Application Detail Modal -->
      <div v-if="selectedApplication" class="modal">
        <div class="modal-content">
          <span class="close" @click="selectedApplication = null">&times;</span>
          <h2>Chi tiết hồ sơ ứng tuyển</h2>
          <div class="application-details">
            <div class="detail-row">
              <span class="label">ID:</span>
              <span>{{ selectedApplication.id_hoso }}</span>
            </div>
            <div class="detail-row">
              <span class="label">Ứng viên:</span>
              <span>{{ selectedApplication.ung_vien }}</span>
            </div>
            <div class="detail-row">
              <span class="label">Email:</span>
              <span>{{ selectedApplication.email }}</span>
            </div>
            <div class="detail-row">
              <span class="label">Số điện thoại:</span>
              <span>{{ selectedApplication.so_dien_thoai }}</span>
            </div>
            <div class="detail-row">
              <span class="label">Công việc:</span>
              <span>{{ selectedApplication.cong_viec }}</span>
            </div>
            <div class="detail-row">
              <span class="label">Công ty:</span>
              <span>{{ selectedApplication.cong_ty }}</span>
            </div>
            <div class="detail-row">
              <span class="label">Ngày nộp:</span>
              <span>{{ formatDate(selectedApplication.ngay_nop) }}</span>
            </div>
            <div class="detail-row">
              <span class="label">Trạng thái:</span>
              <span :class="['status-badge', selectedApplication.trang_thai]">
                {{ formatStatus(selectedApplication.trang_thai) }}
              </span>
            </div>
            
            <h3>Thông tin hồ sơ</h3>
            <div class="profile-info">
              <div class="detail-row">
                <span class="label">Giới tính:</span>
                <span>{{ selectedApplication.gioi_tinh }}</span>
              </div>
              <div class="detail-row">
                <span class="label">Kỹ năng:</span>
                <span>{{ selectedApplication.ky_nang }}</span>
              </div>
              <div class="detail-row">
                <span class="label">Kinh nghiệm:</span>
                <span>{{ selectedApplication.kinh_nghiem }}</span>
              </div>
              <div class="detail-row">
                <span class="label">Học vấn:</span>
                <span>{{ selectedApplication.hoc_van }}</span>
              </div>
            </div>
            
            <h3>Phản hồi từ nhà tuyển dụng</h3>
            <div v-if="selectedApplication.feedback" class="feedback">
              <p>{{ selectedApplication.feedback }}</p>
              <small>{{ formatDate(selectedApplication.feedback_date) }}</small>
            </div>
            <div v-else>
              <p>Chưa có phản hồi</p>
            </div>
          </div>
          
          <div class="modal-actions">
            <button 
              v-if="selectedApplication.trang_thai === 'choxuly'"
              class="accept-btn"
              @click="updateApplicationStatus('dachapnhan')"
            >
              Chấp nhận
            </button>
            <button 
              v-if="selectedApplication.trang_thai === 'choxuly'"
              class="reject-btn"
              @click="updateApplicationStatus('bituchoi')"
            >
              Từ chối
            </button>
            <button 
              class="close-btn"
              @click="selectedApplication = null"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    name: "ApplicationList",
    data() {
      return {
        applications: [],
        filteredApplications: [],
        searchQuery: "",
        statusFilter: "",
        currentPage: 1,
        itemsPerPage: 10,
        totalPages: 1,
        selectedApplication: null
      };
    },
    methods: {
      formatDate(date) {
        return new Date(date).toLocaleDateString();
      },
      formatStatus(status) {
        const statusMap = {
          'choxuly': 'Chờ xử lý',
          'daxuly': 'Đã xử lý',
          'dachapnhan': 'Đã chấp nhận',
          'bituchoi': 'Bị từ chối'
        };
        return statusMap[status] || status;
      },
      fetchApplications() {
        // Giả lập API call
        setTimeout(() => {
          // Mock data
          this.applications = [
            {
              id_hoso: 1,
              ung_vien: "Nguyễn Văn A",
              email: "nguyenvana@example.com",
              so_dien_thoai: "0123456789",
              gioi_tinh: "Nam",
              ky_nang: "HTML, CSS, JavaScript, React",
              kinh_nghiem: "2 năm làm Frontend Developer",
              hoc_van: "Đại học Bách Khoa",
              cong_viec: "Lập trình viên Frontend",
              cong_ty: "Công ty Cổ phần A",
              ngay_nop: "2023-05-12",
              trang_thai: "choxuly",
              feedback: null,
              feedback_date: null
            },
            {
              id_hoso: 2,
              ung_vien: "Trần Thị B",
              email: "tranthib@example.com",
              so_dien_thoai: "0987654321",
              gioi_tinh: "Nữ",
              ky_nang: "Digital Marketing, Facebook Ads",
              kinh_nghiem: "1 năm làm Marketing Online",
              hoc_van: "Đại học Kinh tế",
              cong_viec: "Nhân viên Marketing",
              cong_ty: "Công ty TNHH B",
              ngay_nop: "2023-05-18",
              trang_thai: "dachapnhan",
              feedback: "Hồ sơ phù hợp với yêu cầu công việc. Mời đến phỏng vấn vào ngày 25/05.",
              feedback_date: "2023-05-20"
            },
            // Thêm nhiều hồ sơ khác...
          ];
          
          this.filteredApplications = [...this.applications];
          this.totalPages = Math.ceil(this.filteredApplications.length / this.itemsPerPage);
        }, 500);
      },
      searchApplications() {
        if (!this.searchQuery) {
          this.filteredApplications = [...this.applications];
        } else {
          const query = this.searchQuery.toLowerCase();
          this.filteredApplications = this.applications.filter(app => 
            app.ung_vien.toLowerCase().includes(query) || 
            app.cong_viec.toLowerCase().includes(query)
          );
        }
        this.currentPage = 1;
        this.totalPages = Math.ceil(this.filteredApplications.length / this.itemsPerPage);
      },
      filterApplications() {
        if (!this.statusFilter) {
          this.filteredApplications = [...this.applications];
        } else {
          this.filteredApplications = this.applications.filter(app => 
            app.trang_thai === this.statusFilter
          );
        }
        this.currentPage = 1;
        this.totalPages = Math.ceil(this.filteredApplications.length / this.itemsPerPage);
      },
      viewApplicationDetails(app) {
        this.selectedApplication = app;
      },
      updateApplicationStatus(newStatus) {
        // Giả lập API call để cập nhật trạng thái
        setTimeout(() => {
          this.selectedApplication.trang_thai = newStatus;
          if (newStatus === 'dachapnhan') {
            this.selectedApplication.feedback = "Ứng viên đã được chấp nhận. Vui lòng liên hệ để biết thêm chi tiết.";
          } else if (newStatus === 'bituchoi') {
            this.selectedApplication.feedback = "Rất tiếc, hồ sơ của bạn không phù hợp với yêu cầu công việc.";
          }
          this.selectedApplication.feedback_date = new Date().toISOString();
          
          // Cập nhật trong danh sách
          const index = this.applications.findIndex(a => a.id_hoso === this.selectedApplication.id_hoso);
          if (index !== -1) {
            this.applications[index] = {...this.selectedApplication};
          }
          
          this.$notify({
            title: 'Thành công',
            message: `Đã cập nhật trạng thái hồ sơ thành "${this.formatStatus(newStatus)}"`,
            type: 'success'
          });
        }, 300);
      },
      nextPage() {
        if (this.currentPage < this.totalPages) {
          this.currentPage++;
        }
      },
      prevPage() {
        if (this.currentPage > 1) {
          this.currentPage--;
        }
      }
    },
    computed: {
      paginatedApplications() {
        const start = (this.currentPage - 1) * this.itemsPerPage;
        const end = start + this.itemsPerPage;
        return this.filteredApplications.slice(start, end);
      }
    },
    mounted() {
      this.fetchApplications();
    }
  };
  </script>
  
  <style scoped>
  .application-management {
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
    width: 300px;
  }
  
  .search-filter select {
    padding: 8px;
    border: 1px solid #ddd;
    border-radius: 4px;
  }
  
  .application-table {
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
  
  .status-badge.choxuly {
    background-color: #fff3e0;
    color: #e65100;
  }
  
  .status-badge.daxuly {
    background-color: #e3f2fd;
    color: #1976d2;
  }
  
  .status-badge.dachapnhan {
    background-color: #e8f5e9;
    color: #388e3c;
  }
  
  .status-badge.bituchoi {
    background-color: #ffebee;
    color: #d32f2f;
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
  
  .application-details {
    margin-top: 20px;
  }
  
  .detail-row {
    display: flex;
    margin-bottom: 10px;
  }
  
  .label {
    font-weight: 600;
    width: 150px;
    color: #555;
  }
  
  .profile-info {
    margin-top: 15px;
    padding: 15px;
    background-color: #f9f9f9;
    border-radius: 5px;
  }
  
  .feedback {
    margin-top: 15px;
    padding: 15px;
    background-color: #e3f2fd;
    border-radius: 5px;
  }
  
  .feedback small {
    display: block;
    margin-top: 5px;
    color: #666;
  }
  
  .modal-actions {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    margin-top: 20px;
    padding-top: 20px;
    border-top: 1px solid #eee;
  }
  
  .accept-btn {
    background-color: #4caf50;
    color: white;
  }
  
  .reject-btn {
    background-color: #f44336;
    color: white;
  }
  
  .close-btn {
    background-color: #9e9e9e;
    color: white;
  }
  </style>