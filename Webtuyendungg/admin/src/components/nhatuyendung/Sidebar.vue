<template>
    <div class="sidebar">
      <div class="sidebar-header">
        <h3>Quản lý nhà tuyển dụng</h3>
      </div>
      <ul class="sidebar-menu">
        <li>
          <button @click="goToHome" class="sidebar-btn">
            <span class="icon">🏠</span> Trang chủ
          </button>
        </li>
        <li>
          <button @click="goToCompanyInfo" class="sidebar-btn">
            <span class="icon">🏢</span> Thông tin doanh nghiệp
          </button>
        </li>
        <li>
          <button @click="goToPostJob" class="sidebar-btn">
            <span class="icon">📝</span> Đăng tin
          </button>
        </li>
        <li>
          <button @click="goToApplications" class="sidebar-btn">
            <span class="icon">📄</span> Hồ sơ ứng tuyển
          </button>
        </li>
      </ul>
    </div>
  </template>
  
  <script>
  export default {
    name: 'EmployerSidebar',
    methods: {
      goToHome() {
        this.$router.push('/employer'); // Điều hướng đến trang chủ (EmployerDashboard)
      },
      goToCompanyInfo() {
        this.$router.push('/company-info');
      },
      goToPostJob() {
        this.$router.push('/post-job');
      },
      goToApplications() {
        this.$router.push('/applications');
      },
    },
  };
  </script>
  
  <style scoped>
  .sidebar {
    width: 250px;
    height: 100vh;
    background-color: #2c3e50;
    color: white;
    position: fixed;
    top: 0;
    left: 0;
    display: flex;
    flex-direction: column;
    padding-top: 20px;
    box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1);
  }
  
  .sidebar-header {
    padding: 20px;
    text-align: center;
    border-bottom: 1px solid #34495e;
  }
  
  .sidebar-header h3 {
    margin: 0;
    font-size: 1.5rem;
  }
  
  .sidebar-menu {
    list-style: none;
    padding: 0;
    margin: 0;
    flex-grow: 1;
  }
  
  .sidebar-menu li {
    margin: 10px 0;
  }
  
  .sidebar-btn {
    width: 100%;
    padding: 15px 20px;
    background: none;
    border: none;
    color: white;
    text-align: left;
    font-size: 1rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 10px;
    transition: background-color 0.3s;
  }
  
  .sidebar-btn:hover {
    background-color: #34495e;
  }
  
  .sidebar-btn .icon {
    font-size: 1.2rem;
  }
  </style>