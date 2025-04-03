<template>
    <div class="job-seeker-layout">
      <!-- Header -->
      <header class="header">
        <div class="container">
          <div class="logo">
            <router-link to="/job-seeker">JobSeeker</router-link>
          </div>
          <nav class="main-nav">
            <router-link to="/job-seeker/home" active-class="active">
              <i class="fas fa-search"></i> Tìm việc
            </router-link>
            <router-link to="/job-seeker/applications" active-class="active">
              <i class="fas fa-file-alt"></i> Đơn ứng tuyển
              <span v-if="unreadApplicationsCount > 0" class="badge">{{ unreadApplicationsCount }}</span>
            </router-link>
            <router-link to="/job-seeker/saved-jobs" active-class="active">
              <i class="fas fa-bookmark"></i> Việc đã lưu
            </router-link>
            <router-link to="/job-seeker/notifications" active-class="active">
              <i class="fas fa-bell"></i> Thông báo
              <span v-if="unreadNotificationsCount > 0" class="badge">{{ unreadNotificationsCount }}</span>
            </router-link>
            <div class="user-dropdown">
              <img :src="userAvatar" class="avatar" alt="User">
              <div class="dropdown-content">
                <router-link to="/job-seeker/profile">
                  <i class="fas fa-user"></i> Hồ sơ
                </router-link>
                <a @click="logout">
                  <i class="fas fa-sign-out-alt"></i> Đăng xuất
                </a>
              </div>
            </div>
          </nav>
        </div>
      </header>
  
      <!-- Main Content -->
      <main class="main-content">
        <div class="container">
          <router-view></router-view>
        </div>
      </main>
  
      <!-- Footer -->
      <footer class="footer">
        <div class="container">
          <p>© 2023 JobSeeker - Tất cả quyền được bảo lưu</p>
        </div>
      </footer>
    </div>
  </template>
  
  <script>
  import { useAuthStore } from '@/stores/authStore';
  import { computed, ref, onMounted } from 'vue';
  import axios from 'axios';
  
  export default {
    setup() {
      const authStore = useAuthStore();
      const unreadNotificationsCount = ref(0);
      const unreadApplicationsCount = ref(0);
      
      const userAvatar = computed(() => {
        return authStore.user?.avatar || '/images/default-avatar.jpg';
      });
  
      const logout = () => {
        authStore.logout();
      };
  
      // API: Lấy số thông báo chưa đọc
      const fetchUnreadNotifications = async () => {
        try {
          const response = await axios.get('http://localhost:3000/api/nguoitimviec/notifications', {
            params: { unread: true }
          });
          unreadNotificationsCount.value = response.data.total;
        } catch (error) {
          console.error('Lỗi khi lấy thông báo:', error);
        }
      };
  
      // API: Lấy số đơn ứng tuyển có trạng thái mới
      const fetchUnreadApplications = async () => {
        try {
          const response = await axios.get('http://localhost:3000/api/nguoitimviec/applications', {
            params: { status: 'choxuly' }
          });
          unreadApplicationsCount.value = response.data.total;
        } catch (error) {
          console.error('Lỗi khi lấy đơn ứng tuyển:', error);
        }
      };
  
      onMounted(() => {
        if (authStore.isAuthenticated) {
          fetchUnreadNotifications();
          fetchUnreadApplications();
          
          // Thiết lập polling mỗi 5 phút để cập nhật thông báo
          const pollingInterval = setInterval(() => {
            fetchUnreadNotifications();
            fetchUnreadApplications();
          }, 5 * 60 * 1000);
          
          // Clear interval khi component unmount
          return () => clearInterval(pollingInterval);
        }
      });
  
      return { 
        userAvatar, 
        logout,
        unreadNotificationsCount,
        unreadApplicationsCount
      };
    }
  };
  </script>
  
  <style scoped>
  .job-seeker-layout {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
  }
  
  .container {
    width: 1200px;
    max-width: 95%;
    margin: 0 auto;
  }
  
  .header {
    background-color: #2c3e50;
    color: white;
    padding: 1rem 0;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  }
  
  .header .container {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .logo a {
    color: white;
    font-size: 1.5rem;
    font-weight: bold;
    text-decoration: none;
  }
  
  .main-nav {
    display: flex;
    gap: 1.5rem;
    align-items: center;
  }
  
  .main-nav a {
    color: white;
    text-decoration: none;
    font-weight: 500;
    transition: color 0.3s;
  }
  
  .main-nav a:hover, .main-nav a.active {
    color: #42b983;
  }
  
  .main-nav a i {
    margin-right: 5px;
  }
  
  .user-dropdown {
    position: relative;
    cursor: pointer;
  }
  
  .avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    object-fit: cover;
  }
  
  .dropdown-content {
    display: none;
    position: absolute;
    right: 0;
    background-color: white;
    min-width: 160px;
    box-shadow: 0 8px 16px rgba(0,0,0,0.1);
    z-index: 1;
    border-radius: 5px;
    overflow: hidden;
  }
  
  .dropdown-content a {
    color: #333;
    padding: 12px 16px;
    text-decoration: none;
    display: block;
    transition: background-color 0.3s;
  }
  
  .dropdown-content a:hover {
    background-color: #f5f5f5;
  }
  
  .user-dropdown:hover .dropdown-content {
    display: block;
  }
  
  .main-content {
    flex: 1;
    padding: 2rem 0;
    background-color: #f9f9f9;
  }
  .badge {
  background-color: #ff4757;
  color: white;
  border-radius: 50%;
  padding: 2px 6px;
  font-size: 0.75rem;
  margin-left: 5px;
  vertical-align: top;
}
  
  .footer {
    background-color: #2c3e50;
    color: white;
    text-align: center;
    padding: 1rem 0;
    margin-top: auto;
  }
  </style>