<template>
  <div id="app">
    <!-- Thanh điều hướng -->
    <nav>
      <ul>
        <li v-if="!isLoggedIn"><router-link to="/login">Đăng Nhập</router-link></li>
        <li v-if="!isLoggedIn"><router-link to="/register">Đăng Ký</router-link></li>

       

        <!-- Chỉ hiển thị nếu là nhà tuyển dụng -->
        <li v-if="isLoggedIn && userRole === 'nguoituyendung'">
          <router-link to="/employer">Quản Lý Công Việc</router-link>
        </li>

        <!-- Đăng xuất (hiển thị với tất cả các role) -->
        <li v-if="isLoggedIn"><button @click="logout">Đăng Xuất</button></li>
      </ul>
    </nav>

    <!-- Hiển thị nội dung theo đường dẫn -->
    <router-view />
  </div>
</template>

<script>
export default {
  data() {
    return {
      userRole: null,
      isLoggedIn: !!localStorage.getItem("user"), // Thêm isLoggedIn vào data
    };
  },
  methods: {
    getUserRole() {
      try {
        const user = JSON.parse(localStorage.getItem("user"));
        this.userRole = user?.vai_tro || null;
        this.isLoggedIn = !!user; // Cập nhật trạng thái đăng nhập
      } catch (error) {
        this.userRole = null;
        this.isLoggedIn = false;
      }
    },
    logout() {
      localStorage.removeItem("user");
      this.userRole = null;
      this.isLoggedIn = false; // Cập nhật trạng thái đăng nhập
      this.$router.push("/login");
    },
  },
  mounted() {
    this.getUserRole();
  },
  watch: {
    // Theo dõi thay đổi trong localStorage để cập nhật giao diện
    isLoggedIn(newValue) {
      console.log("Trạng thái đăng nhập thay đổi:", newValue);
    },
  },
};
</script>

<style>
/* CSS cho thanh điều hướng */
nav ul {
  list-style-type: none;
  display: flex;
  gap: 20px;
  padding: 0;
  background-color: #f9f9f9;
  margin-bottom: 20px;
  border-radius: 5px;
  padding: 10px;
}

nav ul li {
  display: inline;
}

nav ul li a {
  text-decoration: none;
  color: #42b983;
  font-weight: bold;
}

nav ul li a.router-link-active {
  color: #35495e;
}

button {
  background-color: #f44336;
  color: white;
  border: none;
  padding: 10px;
  cursor: pointer;
  border-radius: 5px;
}

button:hover {
  background-color: #e53935;
}
</style>
