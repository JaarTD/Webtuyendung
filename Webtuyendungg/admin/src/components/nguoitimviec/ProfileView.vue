<template>
    <div class="profile-container">
      <h2>{{ profile.id_hoso ? 'Hồ Sơ Cá Nhân' : 'Tạo Hồ Sơ Mới' }}</h2>
      
      <!-- Thông báo trạng thái -->
      <div v-if="loading" class="loading">
        <i class="fas fa-spinner fa-spin"></i> {{ profile.id_hoso ? 'Đang tải hồ sơ...' : 'Đang tạo hồ sơ...' }}
      </div>
      
      <div v-if="errorMessage" class="alert alert-danger">
        <i class="fas fa-exclamation-circle"></i> {{ errorMessage }}
      </div>
      
      <div v-if="successMessage" class="alert alert-success">
        <i class="fas fa-check-circle"></i> {{ successMessage }}
      </div>
  
      <!-- Form hồ sơ -->
      <form @submit.prevent="handleProfile" class="profile-form">
        <div class="form-row">
          <div class="form-group col-md-6">
            <label>Số điện thoại <span class="required">*</span></label>
            <input 
              v-model="profile.so_dien_thoai" 
              type="text" 
              class="form-control"
              required
              placeholder="Nhập số điện thoại"
            >
          </div>
          
          <div class="form-group col-md-6">
            <label>Giới tính <span class="required">*</span></label>
            <select 
              v-model="profile.gioi_tinh" 
              class="form-control"
              required
            >
              <option value="Nam">Nam</option>
              <option value="Nữ">Nữ</option>
              <option value="Khác">Khác</option>
            </select>
          </div>
        </div>
  
        <div class="form-group">
          <label>Kỹ năng (phân cách bằng dấu phẩy) <span class="required">*</span></label>
          <textarea 
            v-model="profile.ky_nang" 
            class="form-control"
            required
            placeholder="Ví dụ: JavaScript, HTML, CSS, React"
          ></textarea>
          <small class="form-text text-muted">Liệt kê các kỹ năng của bạn, cách nhau bằng dấu phẩy</small>
        </div>
        
        <div class="form-group">
          <label>Kinh nghiệm làm việc</label>
          <textarea 
            v-model="profile.kinh_nghiem" 
            class="form-control"
            rows="4"
            placeholder="Mô tả kinh nghiệm làm việc của bạn..."
          ></textarea>
        </div>
        
        <div class="form-group">
          <label>Học vấn</label>
          <textarea 
            v-model="profile.hoc_van" 
            class="form-control"
            rows="3"
            placeholder="Trình độ học vấn, bằng cấp..."
          ></textarea>
        </div>
        
        <button 
          type="submit" 
          class="btn btn-primary"
          :disabled="loading"
        >
          <span v-if="loading" class="spinner-border spinner-border-sm"></span>
          {{ loading ? 'Đang xử lý...' : (profile.id_hoso ? 'Cập nhật hồ sơ' : 'Tạo hồ sơ') }}
        </button>
      </form>
    </div>
  </template>
  
  <script>
  import { ref, onMounted } from 'vue';
  import axios from 'axios';
  import { useAuthStore } from '@/stores/authStore';
  
  export default {
    setup() {
      const authStore = useAuthStore();
      const profile = ref({
        id_hoso: null,
        so_dien_thoai: '',
        gioi_tinh: 'Nam',
        ky_nang: '',
        kinh_nghiem: '',
        hoc_van: ''
      });
      const loading = ref(false);
      const errorMessage = ref('');
      const successMessage = ref('');
  
      const fetchProfile = async () => {
        try {
          loading.value = true;
          errorMessage.value = '';
          
          await authStore.checkSession();
          
          if (!authStore.user) {
            errorMessage.value = 'Vui lòng đăng nhập để xem hồ sơ';
            return;
          }
  
          const response = await axios.get(
            'http://localhost:3000/api/nguoitimviec/profile', 
            { withCredentials: true }
          );
          
          if (response.data.success) {
            profile.value = {
              ...response.data.data,
              ky_nang: response.data.data.ky_nang ? 
                response.data.data.ky_nang.split(',').join(', ') : ''
            };
          } else {
            // Nếu không có hồ sơ, giữ giá trị mặc định
            profile.value = {
              id_hoso: null,
              so_dien_thoai: '',
              gioi_tinh: 'Nam',
              ky_nang: '',
              kinh_nghiem: '',
              hoc_van: ''
            };
          }
        } catch (error) {
          if (error.response?.status === 404) {
            // Nếu không tìm thấy hồ sơ, giữ giá trị mặc định
            profile.value = {
              id_hoso: null,
              so_dien_thoai: '',
              gioi_tinh: 'Nam',
              ky_nang: '',
              kinh_nghiem: '',
              hoc_van: ''
            };
          } else {
            handleApiError(error);
          }
        } finally {
          loading.value = false;
        }
      };
  
      const handleProfile = async () => {
        try {
          loading.value = true;
          errorMessage.value = '';
          successMessage.value = '';
          
          // Chuẩn bị dữ liệu
          const payload = {
            so_dien_thoai: profile.value.so_dien_thoai,
            gioi_tinh: profile.value.gioi_tinh,
            ky_nang: profile.value.ky_nang.split(',').map(s => s.trim()).join(','),
            kinh_nghiem: profile.value.kinh_nghiem,
            hoc_van: profile.value.hoc_van
          };
          
          // Gọi API
          const response = await axios.put(
            'http://localhost:3000/api/nguoitimviec/profile',
            payload,
            { withCredentials: true }
          );
          
          // Hiển thị thông báo
          successMessage.value = response.data.message || 
            (profile.value.id_hoso ? 'Cập nhật hồ sơ thành công!' : 'Tạo hồ sơ thành công!');
          
          // Sau 3 giây ẩn thông báo
          setTimeout(() => successMessage.value = '', 3000);
          
          // Fetch lại profile để cập nhật id_hoso nếu là tạo mới
          await fetchProfile();
        } catch (error) {
          handleApiError(error);
        } finally {
          loading.value = false;
        }
      };
  
      const handleApiError = (error) => {
        if (error.response) {
          if (error.response.status === 401) {
            errorMessage.value = 'Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.';
            authStore.logout();
          } else {
            errorMessage.value = error.response.data?.message || 
                               error.response.data?.error || 
                               'Có lỗi xảy ra khi xử lý yêu cầu';
          }
        } else {
          errorMessage.value = 'Không thể kết nối đến server';
        }
      };
  
      onMounted(() => {
        fetchProfile();
      });
  
      return { 
        profile, 
        handleProfile, 
        loading,
        successMessage,
        errorMessage 
      };
    }
  };
  </script>
  
  <style scoped>
  .profile-container {
    font-family: 'Segoe UI', 'Roboto', sans-serif;
    --primary-color: #4361ee;
    --success-color: #4cc9f0;
    --danger-color: #f72585;
    --text-color: #2b2d42;
    --light-gray: #f8f9fa;
    --border-color: #dee2e6;
    max-width: 800px;
    margin: 2rem auto;
    padding: 2rem;
    background: white;
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  }
  
  .profile-container h2 {
    color: var(--text-color);
    font-size: 1.8rem;
    font-weight: 600;
    margin-bottom: 1.5rem;
    position: relative;
    padding-bottom: 0.5rem;
    text-align: center;
  }
  
  .profile-container h2::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 80px;
    height: 3px;
    background: linear-gradient(to right, var(--primary-color), var(--success-color));
  }
  
  .loading {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 1rem;
    margin-bottom: 1.5rem;
    color: var(--primary-color);
    background-color: rgba(67, 97, 238, 0.1);
    border-radius: 8px;
    font-weight: 500;
  }
  
  .alert {
    padding: 1rem;
    margin-bottom: 1.5rem;
    border-radius: 8px;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    font-weight: 500;
  }
  
  .alert-danger {
    background-color: rgba(247, 37, 133, 0.1);
    color: var(--danger-color);
    border-left: 4px solid var(--danger-color);
  }
  
  .alert-success {
    background-color: rgba(76, 201, 240, 0.1);
    color: var(--success-color);
    border-left: 4px solid var(--success-color);
  }
  
  .profile-form {
    margin-top: 2rem;
  }
  
  .form-row {
    display: flex;
    gap: 1.5rem;
    margin-bottom: 1.5rem;
  }
  
  .form-group {
    flex: 1;
    margin-bottom: 1.5rem;
  }
  
  .form-group label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 500;
    color: var(--text-color);
  }
  
  .required {
    color: var(--danger-color);
  }
  
  .form-control {
    width: 100%;
    padding: 0.75rem 1rem;
    border: 1px solid var(--border-color);
    border-radius: 8px;
    font-size: 1rem;
    transition: all 0.3s ease;
    background-color: var(--light-gray);
  }
  
  .form-control:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 3px rgba(67, 97, 238, 0.2);
  }
  
  textarea.form-control {
    min-height: 120px;
    resize: vertical;
  }
  
  select.form-control {
    appearance: none;
    background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
    background-repeat: no-repeat;
    background-position: right 1rem center;
    background-size: 1em;
  }
  
  .btn-primary {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 0.75rem 2rem;
    background-color: var(--primary-color);
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 1rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s ease;
    margin-top: 1rem;
    width: 100%;
  }
  
  .btn-primary:hover {
    background-color: #3a56d4;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(67, 97, 238, 0.3);
  }
  
  .btn-primary:disabled {
    background-color: #adb5bd;
    transform: none;
    box-shadow: none;
    cursor: not-allowed;
  }
  
  .spinner-border {
    width: 1rem;
    height: 1rem;
    border-width: 0.15em;
  }
  
  .form-text {
    color: #6c757d;
    font-size: 0.875rem;
    margin-top: 0.25rem;
  }
  
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  .profile-form {
    animation: fadeIn 0.5s ease-out;
  }
  
  @media (max-width: 768px) {
    .profile-container {
      padding: 1.5rem;
      margin: 1rem;
    }
    
    .form-row {
      flex-direction: column;
      gap: 0;
    }
  }
  </style>