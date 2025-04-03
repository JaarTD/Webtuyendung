<template>
  <div class="post-job-wrapper">
    <!-- Thanh Sidebar -->
    <EmployerSidebar />

    <!-- Nội dung chính -->
    <div class="main-content">
      <h1>{{ isEdit ? 'Cập nhật công việc' : 'Đăng tin tuyển dụng' }}</h1>
      <form @submit.prevent="submitJob" class="job-form">
        <!-- Dropdown chọn tên công ty -->
        <div class="form-group">
          <label for="company">Tên Công Ty</label>
          <select
            id="company"
            v-model="job.id_congty"
            required
            :disabled="companies.length === 0"
          >
            <option value="" disabled>Chọn công ty</option>
            <option v-for="company in companies" :key="company.id_congty" :value="company.id_congty">
              {{ company.ten_congty }}
            </option>
          </select>
          <p v-if="companies.length === 0" class="error-message">Không tìm thấy công ty nào!</p>
        </div>

        <div class="form-group">
          <label for="tieu_de">Tiêu Đề Công Việc</label>
          <input
            type="text"
            id="tieu_de"
            v-model="job.tieu_de"
            placeholder="Nhập tiêu đề công việc"
            required
          />
        </div>

        <div class="form-group">
          <label for="mo_ta">Mô Tả Công Việc</label>
          <textarea
            id="mo_ta"
            v-model="job.mo_ta"
            placeholder="Nhập mô tả công việc"
            rows="5"
            required
          ></textarea>
        </div>

        <div class="form-group">
          <label for="yeu_cau">Yêu Cầu Công Việc</label>
          <textarea
            id="yeu_cau"
            v-model="job.yeu_cau"
            placeholder="Nhập yêu cầu công việc"
            rows="5"
            required
          ></textarea>
        </div>

        <div class="form-group">
          <label for="luong">Mức Lương (VNĐ)</label>
          <input
            type="number"
            id="luong"
            v-model="job.luong"
            placeholder="Nhập mức lương"
            step="0.01"
            required
          />
        </div>

        <div class="form-group">
          <label for="dia_diem">Địa Điểm</label>
          <input
            type="text"
            id="dia_diem"
            v-model="job.dia_diem"
            placeholder="Nhập địa điểm làm việc"
            required
          />
        </div>

        <div class="form-group">
          <label for="ngay_dang">Ngày Đăng</label>
          <input
            type="date"
            id="ngay_dang"
            v-model="job.ngay_dang"
            required
          />
        </div>

        <div class="form-group">
          <label for="ngay_het_han">Ngày Hết Hạn</label>
          <input
            type="date"
            id="ngay_het_han"
            v-model="job.ngay_het_han"
            required
          />
        </div>

        <div class="form-group">
          <label for="trang_thai">Trạng Thái</label>
          <select id="trang_thai" v-model="job.trang_thai" required>
            <option value="hoatdong">Hoạt động</option>
            <option value="khonghoatdong">Không hoạt động</option>
          </select>
        </div>

        <div class="form-actions">
          <button type="submit" class="submit-btn">{{ isEdit ? 'Cập nhật' : 'Đăng Tin' }}</button>
          <button type="button" @click="goBack" class="cancel-btn">Hủy</button>
        </div>

        <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
        <p v-if="successMessage" class="success-message">{{ successMessage }}</p>
      </form>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import EmployerSidebar from './Sidebar.vue';

export default {
  name: 'PostJob',
  components: {
    EmployerSidebar,
  },
  data() {
    return {
      job: {
        id_nhatuyendung: '',
        id_congty: '',
        tieu_de: '',
        mo_ta: '',
        yeu_cau: '',
        luong: '',
        dia_diem: '',
        ngay_dang: '',
        ngay_het_han: '',
        trang_thai: 'hoatdong',
      },
      companies: [],
      errorMessage: '',
      successMessage: '',
      isEdit: false,
    };
  },
  async created() {
    this.fetchCurrentUser();
    const jobId = this.$route.query.id;
    if (jobId) {
      this.isEdit = true;
      await this.fetchJob(jobId);
    } else {
      await this.fetchCompanies();
    }
  },
  methods: {
    fetchCurrentUser() {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      this.job.id_nhatuyendung = user.id_nguoidung || null;

      if (!this.job.id_nhatuyendung) {
        this.errorMessage = 'Vui lòng đăng nhập để tiếp tục.';
        this.$router.push('/login');
      }
    },
    async fetchCompanies() {
      if (!this.job.id_nhatuyendung) return;
      try {
        const response = await axios.get('http://localhost:3000/api/companies', {
          params: { id_nhatuyendung: this.job.id_nhatuyendung },
        });
        this.companies = response.data;
      } catch (error) {
        this.errorMessage = error.response?.data?.message || 'Không thể lấy danh sách công ty!';
        console.error('Error fetching companies:', error);
      }
    },
    async fetchJob(jobId) {
      try {
        const response = await axios.get(`http://localhost:3000/api/jobs/${jobId}`);
        this.job = { ...response.data };
        await this.fetchCompanies();
      } catch (error) {
        this.errorMessage = error.response?.data?.message || 'Không thể tải thông tin công việc!';
        console.error('Error fetching job:', error);
      }
    },
    async submitJob() {
      this.errorMessage = '';
      this.successMessage = '';

      if (!this.job.id_congty) {
        this.errorMessage = 'Vui lòng chọn một công ty!';
        return;
      }

      try {
        if (this.isEdit) {
          const response = await axios.put(`http://localhost:3000/api/jobs/${this.$route.query.id}`, this.job);
          this.successMessage = response.data.message || 'Cập nhật công việc thành công!';
        } else {
          const response = await axios.post('http://localhost:3000/api/jobs', this.job);
          this.successMessage = response.data.message || 'Đăng tin thành công!';
        }
        setTimeout(() => {
          this.$router.push('/employer');
        }, 2000);
      } catch (error) {
        this.errorMessage = error.response?.data?.message || 'Đã xảy ra lỗi khi lưu công việc!';
        console.error('Error saving job:', error);
      }
    },
    goBack() {
      this.$router.push('/employer');
    },
  },
};
</script>

<style scoped>
.post-job-wrapper {
  display: flex;
}

.main-content {
  margin-left: 250px;
  padding: 20px;
  flex-grow: 1;
  max-width: calc(100% - 250px);
}

.post-job {
  max-width: 1200px;
  margin: 0 auto;
}

h1 {
  color: #333;
  margin-bottom: 20px;
}

.job-form {
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.form-group {
  margin-bottom: 20px;
}

label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
  color: #555;
}

input,
textarea,
select {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

textarea {
  resize: vertical;
}

.form-actions {
  display: flex;
  gap: 15px;
  justify-content: flex-end;
}

.submit-btn {
  padding: 10px 20px;
  background-color: #28a745;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.submit-btn:hover {
  background-color: #218838;
}

.cancel-btn {
  padding: 10px 20px;
  background-color: #dc3545;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.cancel-btn:hover {
  background-color: #c82333;
}

.error-message {
  color: #dc3545;
  margin-top: 10px;
}

.success-message {
  color: #28a745;
  margin-top: 10px;
}
</style>