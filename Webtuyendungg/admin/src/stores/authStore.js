import { defineStore } from "pinia";
import axios from "axios";


export const useAuthStore = defineStore("auth", {
  state: () => ({ 
    user: null,
    isAuthenticated: false
  }),
  
  actions: {
    async login(email, mat_khau) {
      try {
        const res = await axios.post(
          "http://localhost:3000/api/login", 
          { email, mat_khau }, 
          { withCredentials: true }
        );
        
        this.user = res.data.user;
        this.isAuthenticated = true;
        return res.data;
      } catch (error) {
        this.logout();
        throw error.response?.data || { message: "Đăng nhập thất bại" };
      }
    },
    
    async checkSession() {
      try {
        const res = await axios.get(
          "http://localhost:3000/api/check-session", 
          { withCredentials: true }
        );
        
        this.user = res.data;
        this.isAuthenticated = !!res.data;
        return res.data;
      } catch (error) {
        this.logout();
        return null;
      }
    },
    
    // logout() {
    //   this.user = null;
    //   this.isAuthenticated = false;
    //   // Gọi API logout nếu cần
    // },
    
    async verifyAuth() {
      if (this.isAuthenticated) return true;
      return await this.checkSession();
    }
  }
});