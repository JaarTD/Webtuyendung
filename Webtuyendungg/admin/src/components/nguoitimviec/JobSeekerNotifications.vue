<template>
  <div class="notifications">
    <h1>Thông Báo</h1>
    <div v-if="loading">Đang tải thông báo...</div>
    <div v-else>
      <div v-if="notifications.length === 0" class="empty">Không có thông báo mới</div>
      <div v-else class="notification-list">
        <div 
          v-for="noti in notifications" 
          :key="noti.id_thongbao" 
          class="notification-item"
          :class="{ 'unread': !noti.da_doc }"
          @click="markAsRead(noti.id_thongbao)"
        >
          <div class="noti-content">{{ noti.noi_dung }}</div>
          <div class="noti-time">{{ formatTime(noti.ngay_tao) }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { useAuthStore } from '@/stores/authStore';

export default {
  setup() {
    const authStore = useAuthStore();
    const notifications = ref([]);
    const loading = ref(true);

    const fetchNotifications = async () => {  
      try {
        await authStore.checkSession(); // Kiểm tra session trước
        
        const response = await axios.get('http://localhost:3000/api/nguoitimviec/notifications', {
          withCredentials: true, // Sử dụng cookie session
          params: {
            page: 1,
            limit: 10
          }
        });
        
        notifications.value = response.data.data.notifications || [];
      } catch (error) {
        console.error('Lỗi khi tải thông báo:', error);
        if (error.response?.status === 401) {
          authStore.logout();
        }
      } finally {
        loading.value = false;
      }
    };

    const markAsRead = async (notificationId) => {
      try {
        await authStore.checkSession();
        
        await axios.put(
          `http://localhost:3000/api/nguoitimviec/notifications/${notificationId}/read`, 
          {}, 
          { withCredentials: true }
        );
        
        // Cập nhật trạng thái ngay lập tức
        const index = notifications.value.findIndex(n => n.id_thongbao === notificationId);
        if (index !== -1) {
          notifications.value[index].da_doc = 1;
        }
      } catch (error) {
        console.error('Lỗi khi đánh dấu đã đọc:', error);
        if (error.response?.status === 401) {
          authStore.logout();
        }
      }
    };

    const formatTime = (dateString) => {
      const options = { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit', 
        minute: '2-digit' 
      };
      return new Date(dateString).toLocaleDateString('vi-VN', options);
    };

    onMounted(fetchNotifications);

    return { 
      notifications, 
      loading, 
      markAsRead,
      formatTime
    };
  }
};
</script>

<style scoped>
.notifications {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

.notification-list {
  margin-top: 1.5rem;
}

.notification-item {
  border-bottom: 1px solid #eee;
  padding: 1rem 0;
  cursor: pointer;
  transition: background-color 0.2s;
}

.notification-item:hover {
  background-color: #f9f9f9;
}

.notification-item.unread {
  background-color: #f0f7ff;
}

.noti-content {
  font-size: 1rem;
  margin-bottom: 0.5rem;
}

.noti-time {
  color: #666;
  font-size: 0.8em;
}

.empty {
  text-align: center;
  padding: 2rem;
  color: #7f8c8d;
  font-style: italic;
}
</style>