<template>
  <div class="company-info-wrapper">
    <!-- Thanh Sidebar -->
    <EmployerSidebar />

    <!-- Nội dung chính -->
    <div class="main-content">
      <h2>Thông Tin Doanh Nghiệp</h2>
      <p>Quản lý thông tin công ty của bạn tại đây.</p>

      <!-- Form để tạo hoặc cập nhật công ty -->
      <form class="company-form" @submit.prevent="handleSubmit">
        <div class="form-group">
          <label for="companyName">Tên Công Ty</label>
          <input
            type="text"
            id="companyName"
            v-model="form.ten_congty"
            placeholder="Nhập tên công ty"
            required
          />
        </div>
        <div class="form-group">
          <label for="nganhNghe">Ngành Nghề</label>
          <input
            type="text"
            id="nganhNghe"
            v-model="form.nganh_nghe"
            placeholder="Nhập ngành nghề"
            required
          />
        </div>
        <div class="form-group">
          <label for="moTa">Mô Tả</label>
          <textarea
            id="moTa"
            v-model="form.mo_ta"
            placeholder="Nhập mô tả công ty"
            rows="4"
          ></textarea>
        </div>
        <div class="form-group">
          <label for="diaChi">Địa Chỉ</label>
          <input
            type="text"
            id="diaChi"
            v-model="form.dia_chi"
            placeholder="Nhập địa chỉ"
          />
        </div>
        <div class="form-group">
          <label for="website">Website</label>
          <input
            type="url"
            id="website"
            v-model="form.website"
            placeholder="Nhập website (nếu có)"
          />
        </div>
        <div class="form-group">
          <label for="logo">Logo (URL)</label>
          <input
            type="url"
            id="logo"
            v-model="form.logo"
            placeholder="Nhập URL logo (nếu có)"
          />
        </div>
        <button type="submit" class="submit-btn">Cập Nhật</button>
        <button v-if="isEditing" type="button" class="cancel-btn" @click="resetForm">Hủy</button>
      </form>

      <!-- Danh sách công ty -->
      <div class="company-list" v-if="companies.length">
        <h3>Danh Sách Công Ty</h3>
        <ul>
          <li v-for="company in companies" :key="company.id_congty">
            {{ company.ten_congty }}
            <button @click="editCompany(company.id_congty)" class="edit-btn">Sửa</button>
            <button @click="deleteCompany(company.id_congty)" class="delete-btn">Xóa</button>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import EmployerSidebar from './Sidebar.vue'; // Import Sidebar

export default {
  name: 'CompanyInfo',
  components: {
    EmployerSidebar, // Đăng ký Sidebar
  },
  data() {
    return {
      form: {
        id_nhatuyendung: null,
        ten_congty: '',
        nganh_nghe: '',
        mo_ta: '',
        dia_chi: '',
        website: '',
        logo: '',
      },
      companies: [],
      isEditing: false,
      editingCompanyId: null,
    };
  },
  created() {
    // Lấy id_nhatuyendung từ localStorage
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    console.log('User from localStorage:', user); // Thêm log để kiểm tra
    this.form.id_nhatuyendung = user.id_nguoidung || null;

    if (!this.form.id_nhatuyendung) {
      alert('Vui lòng đăng nhập để tiếp tục.');
      this.$router.push('/login');
      return;
    }

    // Lấy danh sách công ty khi component được tạo
    this.fetchCompanies();
  },
  methods: {
    async fetchCompanies() {
      try {
        const response = await axios.get('http://localhost:3000/api/companies', {
          params: { id_nhatuyendung: this.form.id_nhatuyendung },
        });
        this.companies = response.data;

        // Nếu đã có công ty, tự động điền thông tin vào form và chuyển sang chế độ chỉnh sửa
        if (this.companies.length > 0) {
          const company = this.companies[0];
          await this.editCompany(company.id_congty);
        }
      } catch (error) {
        console.error('Lỗi khi lấy danh sách công ty:', error);
        const errorMessage = error.response?.data?.message || error.message || 'Không thể lấy danh sách công ty.';
        alert(errorMessage);
      }
    },
    async editCompany(id) {
      try {
        const response = await axios.get(`http://localhost:3000/api/companies/${id}`);
        this.form = { ...response.data };
        this.isEditing = true;
        this.editingCompanyId = id;
      } catch (error) {
        console.error('Lỗi khi lấy thông tin công ty:', error);
        const errorMessage = error.response?.data?.message || error.message || 'Không thể lấy thông tin công ty.';
        alert(errorMessage);
      }
    },
    async handleSubmit() {
      // Kiểm tra dữ liệu trước khi gửi
      if (!this.form.ten_congty || !this.form.nganh_nghe) {
        alert('Vui lòng điền đầy đủ Tên Công Ty và Ngành Nghề.');
        return;
      }

      console.log('Dữ liệu gửi đi:', this.form); // Thêm log để kiểm tra dữ liệu gửi đi
      if (this.isEditing) {
        // Cập nhật công ty
        try {
          await axios.put(`http://localhost:3000/api/companies/${this.editingCompanyId}`, this.form);
          alert('Cập nhật thông tin công ty thành công!');
          this.fetchCompanies(); // Tải lại danh sách công ty để cập nhật form
        } catch (error) {
          console.error('Lỗi khi cập nhật công ty:', error);
          const errorMessage = error.response?.data?.message || error.message || 'Không thể cập nhật công ty.';
          alert(errorMessage);
        }
      } else {
        // Tạo mới công ty
        try {
          await axios.post('http://localhost:3000/api/companies', this.form);
          alert('Cập nhật thông tin công ty thành công!');
          this.fetchCompanies(); // Tải lại danh sách công ty để cập nhật form
        } catch (error) {
          console.error('Lỗi khi tạo công ty:', error);
          const errorMessage = error.response?.data?.message || error.message || 'Không thể tạo công ty.';
          alert(errorMessage);
        }
      }
    },
    async deleteCompany(id) {
      try {
        await axios.delete(`http://localhost:3000/api/companies/${id}`, {
          params: { id_nhatuyendung: this.form.id_nhatuyendung },
        });
        alert('Xóa công ty thành công!');
        this.resetForm();
        this.fetchCompanies();
      } catch (error) {
        console.error('Lỗi khi xóa công ty:', error);
        const errorMessage = error.response?.data?.message || error.message || 'Không thể xóa công ty.';
        alert(errorMessage);
      }
    },
    resetForm() {
      this.form = {
        id_nhatuyendung: this.form.id_nhatuyendung,
        ten_congty: '',
        nganh_nghe: '',
        mo_ta: '',
        dia_chi: '',
        website: '',
        logo: '',
      };
      this.isEditing = false;
      this.editingCompanyId = null;
    },
  },
};
</script>

<style scoped>
.company-info-wrapper {
  display: flex;
}

.main-content {
  margin-left: 250px; /* Đẩy nội dung chính sang phải để không bị che bởi Sidebar */
  padding: 1rem;
  flex-grow: 1;
  max-width: calc(100% - 250px);
}

.company-info h2 {
  font-size: 1.8rem;
  color: #333;
  margin-bottom: 1rem;
}

.company-info h3 {
  font-size: 1.5rem;
  color: #333;
  margin-top: 2rem;
  margin-bottom: 1rem;
}

.company-info p {
  font-size: 1.1rem;
  color: #666;
  margin-bottom: 2rem;
}

.company-form {
  max-width: 600px;
  margin: 0 auto;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #555;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 0.75rem;
  font-size: 1rem;
  border: 1px solid #ddd;
  border-radius: 5px;
  transition: border-color 0.3s ease;
}

.form-group textarea {
  resize: vertical;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #007bff;
}

.submit-btn {
  background-color: #007bff;
  color: white;
  padding: 0.75rem 2rem;
  border: none;
  border-radius: 5px;
  font-size: 1.1rem;
  cursor: pointer;
  transition: background-color 0.3s ease;
  margin-right: 1rem;
}

.submit-btn:hover {
  background-color: #0056b3;
}

.cancel-btn {
  background-color: #6c757d;
  color: white;
  padding: 0.75rem 2rem;
  border: none;
  border-radius: 5px;
  font-size: 1.1rem;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.cancel-btn:hover {
  background-color: #5a6268;
}

.company-list ul {
  list-style: none;
  padding: 0;
}

.company-list li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  background: #f8f9fa;
  border-radius: 5px;
  margin-bottom: 0.5rem;
}

.edit-btn {
  background-color: #28a745;
  color: white;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.edit-btn:hover {
  background-color: #218838;
}

.delete-btn {
  background-color: #dc3545;
  color: white;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.delete-btn:hover {
  background-color: #c82333;
}
</style>