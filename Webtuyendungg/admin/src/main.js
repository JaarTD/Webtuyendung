import { createApp } from 'vue';
import App from './App.vue';
import router from './router'; 
import { createPinia } from 'pinia';

const app = createApp(App);

const pinia = createPinia();

// Kiểm tra trạng thái đăng nhập khi chuyển trang
router.beforeEach((to, from, next) => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  // 1. Kiểm tra nếu tài khoản bị khóa (thêm phần này)
  if (user?.trang_thai === 'locked') {
    localStorage.removeItem("user");
    alert("Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên.");
    return next("/login"); // Chuyển hướng về login
  }

  // 2. Logic kiểm tra đăng nhập hiện có (giữ nguyên)
  if (!user?.id_nguoidung && to.path !== "/login" && to.path !== "/register") {
    next("/login");
  } else if (user?.id_nguoidung) {
    if (to.path === "/login" || to.path === "/register") {
      // Chuyển hướng theo vai trò
      if (user.vai_tro === "quantri") {
        next("/admin");
      } else if (user.vai_tro === "nhatuyendung") {
        next("/employer");
      } else {
        next("/home");
      }
    } else {
      next();
    }
  } else {
    next();
  }
});
app.use(pinia);
app.use(router);
app.mount('#app');