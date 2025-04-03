<template>
  <div class="login-container">
    <h1>Đăng Nhập</h1>
    <form @submit.prevent="login">
      <div class="form-group">
        <label for="email">Email:</label>
        <input
          type="email"
          v-model="email"
          id="email"
          placeholder="Nhập email của bạn"
          required
        />
      </div>
      <div class="form-group">
        <label for="mat_khau">Mật Khẩu:</label>
        <input
          type="password"
          v-model="mat_khau"
          id="mat_khau"
          placeholder="Nhập mật khẩu"
          required
        />
      </div>
      <button type="submit" class="btn-login">Đăng Nhập</button>
      <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
    </form>
  </div>
</template>

<script>
import axios from "axios";

export default {
  data() {
    return {
      email: "",
      mat_khau: "",
      errorMessage: "",
    };
  },
  methods: {
    async login() {
  this.errorMessage = "";
  try {
    const response = await axios.post(
      "http://localhost:3000/api/login",
      {
        email: this.email,
        mat_khau: this.mat_khau,
      },
      { withCredentials: true }
    );

    console.log("Dữ liệu nhận được từ API:", response.data);

    const user = response.data.user;
    if (!user || !user.vai_tro) {
      this.errorMessage = "Dữ liệu người dùng không hợp lệ!";
      return;
    }

    // Kiểm tra trạng thái tài khoản
    if (user.trang_thai === 'locked') {
      this.errorMessage = "Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên.";
      return;
    }

    alert("Đăng nhập thành công!");
    localStorage.setItem("user", JSON.stringify(user));

    // Chuyển hướng dựa trên vai trò
    if (user.vai_tro === "quantri") {
      this.$router.push("/admin");
    } else if (user.vai_tro === "nhatuyendung") {
      this.$router.push("/employer");
    } else {
      this.$router.push("/job-seeker");
    }
  } catch (error) {
    console.error("Lỗi khi đăng nhập:", error);
    this.errorMessage =
      error.response?.data?.message || "Đăng nhập thất bại!";
  }
},
  },
};
</script>

<style scoped>
.login-container {
  max-width: 400px;
  margin: 50px auto;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 10px;
  background: #fff;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

h1 {
  text-align: center;
  color: #333;
  margin-bottom: 20px;
}

.form-group {
  margin-bottom: 15px;
}

label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
  color: #555;
}

input {
  width: 90%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 16px;
}

input:focus {
  border-color: #4caf50;
  outline: none;
}

.btn-login {
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

.btn-login:hover {
  background-color: #45a049;
}

.error-message {
  color: red;
  font-size: 14px;
  margin-top: 10px;
  text-align: center;
}
</style>