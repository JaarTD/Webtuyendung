<template>
  <div class="user-management">
    <div class="header">
      <h1>Quản lý người dùng</h1>
      <div class="search-filter">
        <input 
          type="text" 
          v-model="searchQuery" 
          placeholder="Tìm kiếm người dùng..." 
          @input="searchUsers"
        >
        <select v-model="roleFilter" @change="filterUsers">
          <option value="">Tất cả vai trò</option>
          <option value="nhatuyendung">Nhà tuyển dụng</option>
          <option value="nguoitimviec">Người tìm việc</option>
          <option value="quantri">Quản trị viên</option>
        </select>
      </div>
    </div>

    <div class="user-table">
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Tên</th>
            <th>Email</th>
            <th>Vai trò</th>
            <th>Ngày tạo</th>
            <th>Trạng thái</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in paginatedUsers" :key="user.id_nguoidung">
            <td>{{ user.id_nguoidung }}</td>
            
            <td>{{ user.ten }}</td>
            <td>{{ user.email }}</td>
            <td>
              <span :class="['role-badge', user.vai_tro]">
                {{ formatRole(user.vai_tro) }}
              </span>
            </td>
            <td>{{ formatDate(user.ngay_tao) }}</td>
            <td>
              <span :class="['status-badge', user.trang_thai === 'locked' ? 'blocked' : 'active']">
                {{ user.trang_thai === 'locked' ? 'Bị chặn' : 'Hoạt động' }}
              </span>
            </td>
            <td class="actions">
              <button 
                v-if="user.vai_tro !== 'quantri'" 
                @click="toggleUserStatus(user)"
                :class="['status-btn', user.trang_thai === 'locked' ? 'unblock' : 'block']"
              >
                {{ user.trang_thai === 'locked' ? 'Bỏ chặn' : 'Chặn' }}
              </button>
              <button class="view-btn" @click="viewUserDetails(user)">
                Xem chi tiết
              </button>
              <button 
                class="delete-btn" 
                @click="deleteUser(user.id_nguoidung)"
                v-if="user.vai_tro !== 'quantri'"
              >
                Xóa
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="pagination">
      <button @click="prevPage" :disabled="currentPage === 1">Trước</button>
      <span>Trang {{ currentPage }} / {{ totalPages }}</span>
      <button @click="nextPage" :disabled="currentPage === totalPages">Sau</button>
    </div>

    <!-- Modal chi tiết người dùng -->
    <div v-if="selectedUser" class="modal">
      <div class="modal-content">
        <span class="close" @click="selectedUser = null">&times;</span>
        <h2>Chi tiết người dùng</h2>
        <div class="user-details">
          
          <div class="detail-row">
            <span class="label">ID:</span>
            <span>{{ selectedUser.id_nguoidung }}</span>
          </div>
          <div class="detail-row">
            <span class="label">Tên:</span>
            <span>{{ selectedUser.ten }}</span>
          </div>
          <div class="detail-row">
            <span class="label">Email:</span>
            <span>{{ selectedUser.email }}</span>
          </div>
          <div class="detail-row">
            <span class="label">Vai trò:</span>
            <span>{{ formatRole(selectedUser.vai_tro) }}</span>
          </div>
          <div class="detail-row">
            <span class="label">Ngày tạo:</span>
            <span>{{ formatDate(selectedUser.ngay_tao) }}</span>
          </div>
          <div class="detail-row">
            <span class="label">Trạng thái:</span>
            <span :class="['status-badge', selectedUser.trang_thai === 'locked' ? 'blocked' : 'active']">
              {{ selectedUser.trang_thai === 'locked' ? 'Bị chặn' : 'Hoạt động' }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "UserList",
  data() {
    return {
      users: [],
      filteredUsers: [],
      searchQuery: "",
      roleFilter: "",
      currentPage: 1,
      itemsPerPage: 10,
      selectedUser: null,
      isLoading: false
    };
  },
  computed: {
    paginatedUsers() {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      return this.filteredUsers.slice(start, start + this.itemsPerPage);
    },
    totalPages() {
      return Math.ceil(this.filteredUsers.length / this.itemsPerPage);
    }
  },
  methods: {
    formatRole(role) {
      const roles = {
        'nhatuyendung': 'Nhà tuyển dụng',
        'nguoitimviec': 'Người tìm việc',
        'quantri': 'Quản trị viên'
      };
      return roles[role] || role;
    },
    formatDate(date) {
      return new Date(date).toLocaleDateString('vi-VN');
    },
    async fetchUsers() {
      this.isLoading = true;
      try {
        const response = await axios.get("http://localhost:3000/users");
        this.users = response.data;
        this.filteredUsers = [...this.users];
      } catch (error) {
        console.error("Lỗi khi lấy danh sách người dùng:", error);
        alert("Không thể tải danh sách người dùng");
      } finally {
        this.isLoading = false;
      }
    },
    async logAdminActivity(actionType, description, userId) {
    try {
      // Lấy ID admin từ store hoặc localStorage
      const adminId = this.$store.state.user.id || JSON.parse(localStorage.getItem('user')).id;
      
      await axios.post("http://localhost:3000/api/admin/activities", {
        id_quantri: adminId,
        loai_hoatdong: actionType,
        mo_ta: description,
        id_nguoidung: userId,
        ngay_thuchien: new Date().toISOString()
      }, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
    } catch (error) {
      console.error("Lỗi khi ghi log hoạt động:", error);
      // Không hiển thị thông báo lỗi cho người dùng để không ảnh hưởng trải nghiệm
    }
  },
    searchUsers() {
      const query = this.searchQuery.toLowerCase();
      this.filteredUsers = this.users.filter(user =>
        user.ten.toLowerCase().includes(query) || 
        user.email.toLowerCase().includes(query)
      );
      this.currentPage = 1;
    },
    filterUsers() {
      this.filteredUsers = this.roleFilter 
        ? this.users.filter(user => user.vai_tro === this.roleFilter)
        : [...this.users];
      this.currentPage = 1;
    },
    async toggleUserStatus(user) {
  try {
    const action = user.trang_thai === 'locked' ? 'unlock' : 'lock';
    const newStatus = user.trang_thai === 'locked' ? 'active' : 'locked';
    
    const response = await axios.put(
      `http://localhost:3000/users/${user.id_nguoidung}/status`,
      { action },
      {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      }
    );

    // Update status immediately
    user.trang_thai = newStatus;
    
    // Log admin activity (if needed)
    if (this.logAdminActivity) {
      await this.logAdminActivity(
        'chan_nguoidung',
        `Đã ${action === 'lock' ? 'chặn' : 'bỏ chặn'} người dùng ${user.ten}`,
        user.id_nguoidung
      );
    }
    
    this.$notify({
      title: 'Thành công',
      message: response.data?.message || `Đã ${action === 'lock' ? 'chặn' : 'bỏ chặn'} người dùng thành công`,
      type: 'success'
    });

  } catch (error) {
    console.error("Lỗi khi thay đổi trạng thái:", error);
    
    // Safe error handling
    let errorMessage = 'Không thể thay đổi trạng thái người dùng';
    
    if (error.response) {
      // HTTP error with response
      errorMessage = error.response.data?.message || 
                    error.response.data?.error || 
                    error.response.statusText;
    } else if (error.request) {
      // Request was made but no response received
      errorMessage = 'Không có phản hồi từ máy chủ';
    } else {
      // Other errors
      errorMessage = error.message || 'Lỗi không xác định';
    }
    
    this.$notify.error({
      title: 'Lỗi',
      message: errorMessage
    });
  }

    },
    viewUserDetails(user) {
      this.selectedUser = user;
    },
    async deleteUser(id) {
      if (!confirm("Bạn có chắc chắn muốn xóa người dùng này?")) return;
      
      try {
        await axios.delete(`http://localhost:3000/users/${id}`);
        this.fetchUsers(); // Tải lại danh sách sau khi xóa
      } catch (error) {
        console.error("Lỗi khi xóa người dùng:", error);
        alert("Không thể xóa người dùng");
      }
    },
    nextPage() {
      if (this.currentPage < this.totalPages) this.currentPage++;
    },
    prevPage() {
      if (this.currentPage > 1) this.currentPage--;
    }
  },
  mounted() {
    this.fetchUsers();
  }
};
</script>

<style scoped>
.user-management {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 15px;
}

.search-filter {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.search-filter input {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  min-width: 250px;
}

.search-filter select {
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.user-table {
  background: white;
  border-radius: 5px;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th, td {
  padding: 12px 15px;
  text-align: left;
  border-bottom: 1px solid #eee;
}

th {
  background-color: #f5f5f5;
  font-weight: 600;
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}

.role-badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.role-badge.nhatuyendung {
  background-color: #e3f2fd;
  color: #1976d2;
}

.role-badge.nguoitimviec {
  background-color: #e8f5e9;
  color: #388e3c;
}

.role-badge.quantri {
  background-color: #f3e5f5;
  color: #8e24aa;
}

.status-badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.status-badge.active {
  background-color: #e8f5e9;
  color: #388e3c;
}

.status-badge.blocked {
  background-color: #ffebee;
  color: #d32f2f;
}

.actions {
  display: flex;
  gap: 5px;
  flex-wrap: wrap;
}

button {
  padding: 6px 10px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
  white-space: nowrap;
}

.status-btn {
  color: white;
}

.block {
  background-color: #f44336;
}

.unblock {
  background-color: #4caf50;
}

.view-btn {
  background-color: #2196f3;
  color: white;
}

.delete-btn {
  background-color: #ff5722;
  color: white;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 15px;
  margin-top: 20px;
}

.pagination button {
  padding: 8px 15px;
  background-color: #42b983;
  color: white;
}

.pagination button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

/* Modal styles */
.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0,0,0,0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background-color: white;
  padding: 25px;
  border-radius: 5px;
  width: 90%;
  max-width: 500px;
  max-height: 80vh;
  overflow-y: auto;
  position: relative;
}

.close {
  position: absolute;
  top: 15px;
  right: 20px;
  font-size: 24px;
  cursor: pointer;
}

.user-details {
  margin-top: 20px;
}

.avatar-container {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}

.detail-avatar {
  width: 150px;
  height: 150px;
  border-radius: 50%;
  object-fit: cover;
}

.detail-row {
  display: flex;
  margin-bottom: 10px;
  padding: 8px 0;
  border-bottom: 1px solid #eee;
}

.label {
  font-weight: 600;
  width: 120px;
  color: #555;
}

@media (max-width: 768px) {
  .header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .search-filter {
    width: 100%;
  }
  
  .search-filter input {
    width: 100%;
  }
  
  table {
    font-size: 14px;
  }
  
  th, td {
    padding: 8px 10px;
  }
  
  .actions {
    flex-direction: column;
    gap: 5px;
  }
  
  button {
    width: 100%;
  }
}
</style>