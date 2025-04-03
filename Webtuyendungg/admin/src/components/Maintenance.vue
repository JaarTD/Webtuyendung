<template>
    <div class="maintenance-page">
      <div class="maintenance-container">
        <div class="maintenance-icon">
          <i class="fas fa-tools"></i>
        </div>
        <h1>Hệ thống đang bảo trì</h1>
        <p>{{ maintenanceMessage }}</p>
        
        <div v-if="maintenanceTime" class="maintenance-time">
          <p><i class="fas fa-clock"></i> Thời gian bảo trì: {{ maintenanceTime }}</p>
        </div>
        
        <div class="refresh-btn">
          <button @click="refreshPage">
            <i class="fas fa-sync-alt"></i> Tải lại trang
          </button>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    name: 'MaintenancePage',
    data() {
      return {
        maintenanceMessage: 'Hệ thống đang bảo trì. Vui lòng quay lại sau.',
        startTime: null,
        endTime: null
      };
    },
    computed: {
      maintenanceTime() {
        if (this.startTime && this.endTime) {
          return `Từ ${this.formatTime(this.startTime)} đến ${this.formatTime(this.endTime)}`;
        }
        return null;
      }
    },
    created() {
      this.fetchMaintenanceStatus();
    },
    methods: {
      async fetchMaintenanceStatus() {
        try {
          const response = await this.$axios.get('http://localhost:3000/api/system/maintenance/status');
          this.maintenanceMessage = response.data.message;
          this.startTime = response.data.startTime;
          this.endTime = response.data.endTime;
        } catch (error) {
          console.error('Error fetching maintenance status:', error);
        }
      },
      formatTime(timestamp) {
        return new Date(timestamp).toLocaleString();
      },
      refreshPage() {
        window.location.reload();
      }
    }
  };
  </script>
  
  <style scoped>
  .maintenance-page {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    background-color: #f8f9fa;
    padding: 2rem;
  }
  
  .maintenance-container {
    text-align: center;
    max-width: 600px;
    padding: 2rem;
    background: white;
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  }
  
  .maintenance-icon {
    font-size: 4rem;
    color: #4361ee;
    margin-bottom: 1.5rem;
  }
  
  .maintenance-icon i {
    animation: pulse 2s infinite;
  }
  
  h1 {
    font-size: 2rem;
    color: #2b2d42;
    margin-bottom: 1rem;
  }
  
  p {
    font-size: 1.1rem;
    color: #6c757d;
    margin-bottom: 1.5rem;
  }
  
  .maintenance-time {
    margin: 1.5rem 0;
    padding: 1rem;
    background: #f1f3f9;
    border-radius: 8px;
    display: inline-block;
  }
  
  .maintenance-time p {
    margin: 0;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  
  .refresh-btn button {
    padding: 0.75rem 1.5rem;
    background: #4361ee;
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 500;
    transition: all 0.3s;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin: 0 auto;
  }
  
  .refresh-btn button:hover {
    background: #3a56d4;
    transform: translateY(-2px);
  }
  
  @keyframes pulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.1); }
    100% { transform: scale(1); }
  }
  </style>