<template>
  <!-- Giữ nguyên template của bạn -->
  <div class="job-detail-wrapper">
    <!-- Thanh Sidebar -->
    <Sidebar />

    <!-- Nội dung chính -->
    <div class="main-content">
      <!-- Header -->
      <div class="dashboard-header">
        <h1>Chi tiết công việc</h1>
        <button @click="goBack" class="back-btn">Quay lại</button>
      </div>

      <!-- Thông tin chi tiết công việc -->
      <div v-if="loading" class="loading">Đang tải dữ liệu...</div>
      <div v-else-if="error" class="error">{{ error }}</div>
      <div v-else class="job-detail">
        <h2>{{ job.tieu_de }}</h2>
        <p><strong>Công ty:</strong> {{ job.ten_congty }}</p>
        <p><strong>Địa điểm:</strong> {{ job.dia_diem }}</p>
        <p><strong>Lương:</strong> {{ formatCurrency(job.luong) }} VNĐ</p>
        <p><strong>Ngày đăng:</strong> {{ formatDate(job.ngay_dang) }}</p>
        <p><strong>Ngày hết hạn:</strong> {{ formatDate(job.ngay_het_han) }}</p>
        <p><strong>Trạng thái:</strong> 
          <span :class="['status', job.trang_thai.toLowerCase()]">
            {{ translateStatus(job.trang_thai) }}
          </span>
        </p>
        <p><strong>Lượt xem:</strong> {{ job.luot_xem || 0 }}</p>
        <p><strong>Lượt ứng tuyển:</strong> {{ job.luot_ung_tuyen || 0 }}</p>
        <h3>Mô tả công việc</h3>
        <p>{{ job.mo_ta }}</p>
        <h3>Yêu cầu</h3>
        <p>{{ job.yeu_cau }}</p>
      </div>
    </div>
  </div>
</template>

<script>
// Giữ nguyên script của bạn
import axios from 'axios';
import Sidebar from './Sidebar.vue';

export default {
name: 'JobDetail',
components: {
  Sidebar,
},
data() {
  return {
    job: null,
    loading: false,
    error: null,
  };
},
created() {
  const jobId = this.$route.params.id;
  this.fetchJobDetail(jobId);
},
methods: {
  async fetchJobDetail(jobId) {
    this.loading = true;
    this.error = null;
    try {
      const response = await axios.get(`http://localhost:3000/api/jobs/${jobId}`, {
        withCredentials: true,
      });
      console.log('Dữ liệu chi tiết công việc:', response.data);
      this.job = response.data;
    } catch (error) {
      console.error('Lỗi khi lấy chi tiết công việc:', error);
      if (error.response) {
        if (error.response.status === 401 || error.response.status === 403) {
          this.error = 'Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.';
          this.$router.push('/login');
        } else if (error.response.status === 404) {
          this.error = 'Không tìm thấy công việc.';
        } else {
          this.error = error.response.data?.message || 'Không thể tải chi tiết công việc. Vui lòng thử lại sau.';
        }
      } else {
        this.error = 'Không thể kết nối đến server. Vui lòng kiểm tra kết nối và thử lại.';
      }
    } finally {
      this.loading = false;
    }
  },
  goBack() {
    this.$router.push('/employer');
  },
  formatDate(date) {
    if (!date) return 'N/A';
    const d = new Date(date);
    return d.toLocaleDateString('vi-VN');
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
  formatCurrency(amount) {
    if (!amount) return '0';
    return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  },
},
};
</script>

<style scoped>
.job-detail-wrapper {
display: flex;
min-height: 100vh;
background-color: #f5f7fa;
}

.main-content {
margin-left: 250px;
padding: 30px;
flex-grow: 1;
max-width: calc(100% - 250px);
background-color: #f5f7fa;
}

.dashboard-header {
display: flex;
justify-content: space-between;
align-items: center;
margin-bottom: 30px;
padding-bottom: 15px;
border-bottom: 1px solid #eaeaea;
}

.dashboard-header h1 {
font-size: 24px;
color: #2c3e50;
margin: 0;
}

.back-btn {
padding: 10px 20px;
background-color: #3498db;
color: white;
border: none;
border-radius: 6px;
cursor: pointer;
font-size: 14px;
transition: all 0.3s ease;
display: flex;
align-items: center;
gap: 5px;
}

.back-btn:hover {
background-color: #2980b9;
transform: translateY(-2px);
box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.job-detail {
background: white;
padding: 30px;
border-radius: 12px;
box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.job-detail h2 {
margin-bottom: 25px;
color: #2c3e50;
font-size: 28px;
border-bottom: 2px solid #3498db;
padding-bottom: 10px;
}

.job-detail h3 {
margin-top: 25px;
margin-bottom: 15px;
color: #2c3e50;
font-size: 20px;
border-left: 4px solid #3498db;
padding-left: 10px;
}

.job-detail p {
margin: 12px 0;
line-height: 1.8;
color: #34495e;
font-size: 16px;
}

.job-detail strong {
color: #2c3e50;
font-weight: 600;
}

.status {
padding: 6px 12px;
border-radius: 20px;
font-size: 14px;
font-weight: 500;
display: inline-block;
}

.status.hoatdong {
background: #e8f5e9;
color: #2e7d32;
}

.status.khonghoatdong {
background: #ffebee;
color: #c62828;
}

.loading,
.error {
text-align: center;
padding: 30px;
font-size: 18px;
background: white;
border-radius: 8px;
box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.loading {
color: #3498db;
}

.error {
color: #e74c3c;
}

/* Thêm hiệu ứng hover cho các phần tử tương tác */
.job-detail {
transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.job-detail:hover {
transform: translateY(-5px);
box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
}

/* Responsive cho mobile */
@media (max-width: 768px) {
.main-content {
  margin-left: 0;
  max-width: 100%;
  padding: 20px;
}

.job-detail {
  padding: 20px;
}

.job-detail h2 {
  font-size: 24px;
}
}
</style>