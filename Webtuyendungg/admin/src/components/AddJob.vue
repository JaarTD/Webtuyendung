<template>
    <div class="container mx-auto p-4">
      <h2 class="text-2xl font-bold mb-4">Thêm Công Việc</h2>
      <form @submit.prevent="submitJob" class="space-y-4 bg-white p-6 rounded-lg shadow-md">
        <div>
          <label class="block text-gray-700">Nhà tuyển dụng ID:</label>
          <input v-model="job.id_nhatuyendung" type="text" class="w-full p-2 border rounded" required />
        </div>
        <div>
          <label class="block text-gray-700">Tiêu đề:</label>
          <input v-model="job.tieu_de" type="text" class="w-full p-2 border rounded" required />
        </div>
        <div>
          <label class="block text-gray-700">Mô tả:</label>
          <textarea v-model="job.mo_ta" class="w-full p-2 border rounded" required></textarea>
        </div>
        <div>
          <label class="block text-gray-700">Yêu cầu:</label>
          <textarea v-model="job.yeu_cau" class="w-full p-2 border rounded" required></textarea>
        </div>
        <div>
          <label class="block text-gray-700">Lương:</label>
          <input v-model="job.luong" type="number" class="w-full p-2 border rounded" required />
        </div>
        <div>
          <label class="block text-gray-700">Địa điểm:</label>
          <input v-model="job.dia_diem" type="text" class="w-full p-2 border rounded" required />
        </div>
        <div>
          <label class="block text-gray-700">Ngày đăng:</label>
          <input v-model="job.ngay_dang" type="date" class="w-full p-2 border rounded" required />
        </div>
        <div>
          <label class="block text-gray-700">Ngày hết hạn:</label>
          <input v-model="job.ngay_het_han" type="date" class="w-full p-2 border rounded" required />
        </div>
        <div>
          <label class="block text-gray-700">Trạng thái:</label>
          <select v-model="job.trang_thai" class="w-full p-2 border rounded" required>
            <option value="hoatdong">Hoạt động</option>
            <option value="khonghoatdong">Không hoạt động</option>
          </select>
        </div>
        <button type="submit" class="bg-blue-500 text-white p-2 rounded">Thêm Công Việc</button>
      </form>
    </div>
  </template>
  
  <script>
  import axios from 'axios';
  export default {
    data() {
      return {
        job: {
          id_nhatuyendung: '',
          tieu_de: '',
          mo_ta: '',
          yeu_cau: '',
          luong: '',
          dia_diem: '',
          ngay_dang: '',
          ngay_het_han: '',
          trang_thai: 'hoatdong'
        }
      };
    },
    methods: {
      async submitJob() {
        try {
          const response = await axios.post('http://localhost:3000/congviec', this.job);
          alert(response.data.message);
          this.resetForm();
        } catch (error) {
          alert('Lỗi: ' + (error.response?.data.error || error.message));
        }
      },
      resetForm() {
        this.job = {
          id_nhatuyendung: '',
          tieu_de: '',
          mo_ta: '',
          yeu_cau: '',
          luong: '',
          dia_diem: '',
          ngay_dang: '',
          ngay_het_han: '',
          trang_thai: 'hoatdong'
        };
      }
    }
  };
  </script>
  
  <style>
  .container {
    max-width: 600px;
  }
  </style>
  