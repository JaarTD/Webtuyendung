<template>
  <div class="container">
    <h1>Đăng Ký</h1>
    <form @submit.prevent="register">
      <div class="form-group">
        <label for="ten">Tên:</label>
        <input type="text" v-model="ten" id="ten" required />
      </div>
      <div class="form-group">
        <label for="email">Email:</label>
        <input type="email" v-model="email" id="email" required />
      </div>
      <div class="form-group">
        <label for="mat_khau">Mật Khẩu:</label>
        <input type="password" v-model="mat_khau" id="mat_khau" required />
      </div>
      <div class="form-group">
        <label for="vai_tro">Vai Trò:</label>
        <select v-model="vai_tro" id="vai_tro" required>
          <option value="nguoitimviec">Người Tìm Việc</option>
          <option value="nhatuyendung">Nhà Tuyển Dụng</option>
        </select>
      </div>
      <button type="submit" class="btn-submit">Đăng Ký</button>
    </form>
  </div>
</template>

<script>
import axios from "axios";

export default {
  data() {
    return {
      ten: "",
      email: "",
      mat_khau: "",
      vai_tro: "nguoitimviec",
    };
  },
  methods: {
    register() {
  axios
    .post("http://localhost:3000/api/register", {
      ten: this.ten,
      email: this.email,
      mat_khau: this.mat_khau,
      vai_tro: this.vai_tro,
    })
    .then(() => {
      alert("Đăng ký thành công!");
      this.$router.push("/login"); // Chuyển hướng đến trang đăng nhập
    })
    .catch((error) => {
      alert(error.response.data || "Đã xảy ra lỗi khi đăng ký.");
    });
},
  },
};
</script>

<style scoped>
.container {
  max-width: 400px;
  margin: 50px auto;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 10px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  background: #fff;
}

h1 {
  text-align: center;
  color: #333;
  margin-bottom: 20px;
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
select {
  width: 90%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 15px;
}

input:focus,
select:focus {
  border-color: #4caf50;
  outline: none;
}

.btn-submit {
  width: 100%;
  padding: 10px;
  font-size: 16px;
  color: #fff;
  background-color: #4caf50;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.btn-submit:hover {
  background-color: #45a049;
}
</style>
