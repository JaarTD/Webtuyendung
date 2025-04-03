import { createRouter, createWebHistory } from 'vue-router';
import DangNhap from '../components/DangNhap.vue';
import DangKi from '../components/DangKi.vue';
import UserList from '../components/UserList.vue';
import AdminDashboard from '../components/QuanTri.vue';
import EmployerDashboard from '../components/nhatuyendung/EmployerDashboard.vue';
import CompanyInfo from '../components/nhatuyendung/CompanyInfo.vue';
import PostJob from '../components/nhatuyendung/PostJob.vue';
import Applications from '../components/nhatuyendung/JobApplications.vue';
import JobDetail from '../components/nhatuyendung/JobDetail.vue';
import CompanyList from '../components/CompanyList.vue';
import ApplicationList from '@/components/ApplicationList';
import SystemSettings from '@/components/SystemSettings.vue';
import axios from 'axios';
import ListCongViec from '../components/ListCongViec.vue';

const routes = [
  { path: '/login', name: 'DangNhap', component: DangNhap },
  { path: '/register', name: 'DangKi', component: DangKi },
  { path: '/userlist', name: 'UserList', component: UserList, meta: { requiresAuth: true } },
  { path: '/admin', component: AdminDashboard, meta: { requiresAdmin: true } },
  { path: '/admin/userlist', component: UserList, meta: { requiresAdmin: true } },
  { 
    path: '/admin/system', 
    name: 'SystemSettings', 
    component: SystemSettings, 
    meta: { requiresAdmin: true } 
  },
  {
    path: '/maintenance',
    name: 'Maintenance',
    component: () => import('@/components/Maintenance.vue'),
    meta: { isMaintenance: true }
  },
  { path: '/employer', name: 'EmployerDashboard', component: EmployerDashboard, meta: { requiresAuth: true, requiresEmployer: true } },
  { path: '/company-info', name: 'CompanyInfo', component: CompanyInfo, meta: { requiresAuth: true, requiresEmployer: true } },
  { path: '/post-job', name: 'PostJob', component: PostJob, meta: { requiresAuth: true, requiresEmployer: true } },
  { path: '/applications', name: 'Applications', component: Applications, meta: { requiresAuth: true, requiresEmployer: true } },
  { path: '/job-detail/:id', name: 'JobDetail', component: JobDetail, meta: { requiresAuth: true } },
  {
    path: '/admin/joblist',
    name: 'ListCongViec',
    component: ListCongViec,
    meta: { requiresAdmin: true }
  },
  {
    path: '/admin/companies',
    name: 'CompanyList',
    component: CompanyList,
    meta: { requiresAdmin: true }
  },
  {
    path: '/admin/applications',
    name: 'ApplicationList',
    component: ApplicationList,
    meta: { requiresAdmin: true }
  },
  
  // ============= THÊM ROUTES CHO NGƯỜI TÌM VIỆC =============
  {
    path: '/job-seeker',
    component: () => import('@/components/nguoitimviec/JobSeekerLayout.vue'),
    meta: { requiresAuth: true, requiresJobSeeker: true },
    redirect: { name: 'JobSeekerDashboard' }, // Chuyển hướng đến Dashboard thay vì Profile
    children: [
      {
        path: 'home',
        name: 'JobSeekerDashboard',
        component: () => import('@/components/nguoitimviec/JobSeekerDashboard.vue'),
      },
      {
        path: 'profile',
        name: 'JobSeekerProfile',
        component: () => import('@/components/nguoitimviec/ProfileView.vue')
      },
      {
        path: 'jobs',
        name: 'JobSearch',
        component: () => import('@/components/nguoitimviec/JobSearch.vue')
      },
      {
        path: 'jobs/:id',
        name: 'JobSeekerJobDetail',
        component: () => import('@/components/nguoitimviec/JobDetails.vue'),
        props: true
      },
      {
        path: 'applications',
        name: 'JobSeekerApplications',
        component: () => import('@/components/nguoitimviec/JobApplications.vue')
      },
      {
        path: 'saved-jobs',
        name: 'SavedJobs',
        component: () => import('@/components/nguoitimviec/SavedJobs.vue')
      },
      {
        path: 'notifications',
        name: 'JobSeekerNotifications',
        component: () => import('@/components/nguoitimviec/JobSeekerNotifications.vue')
      }
    ]
  },
  // ========================================================
  
  { path: '/', redirect: '/login' },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach(async (to, from, next) => {
  // Cho phép truy cập vào trang maintenance khi cần
  if (to.meta.isMaintenance) {
    next();
    return;
  }

  try {
    // Gọi API kiểm tra trạng thái bảo trì
    const response = await axios.get('/api/system/maintenance/status');
    if (response.data.enabled) {
      next('/maintenance');
      return;
    }
  } catch (error) {
    console.error('Lỗi khi kiểm tra trạng thái bảo trì:', error);
  }

  // Kiểm tra đăng nhập và quyền truy cập
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isAdmin = user.vai_tro === 'quantri';
  const isEmployer = user.vai_tro === 'nhatuyendung';
  const isJobSeeker = user.vai_tro === 'nguoitimviec';

  if (to.meta.requiresAuth && !user.vai_tro) {
    alert('Bạn cần đăng nhập để truy cập!');
    next('/login');
  } else if (to.meta.requiresAdmin && !isAdmin) {
    alert('Bạn không có quyền truy cập trang Admin!');
    next('/login');
  } else if (to.meta.requiresEmployer && !isEmployer) {
    alert('Bạn không có quyền truy cập trang Nhà tuyển dụng!');
    next('/login');
  } else if (to.meta.requiresJobSeeker && !isJobSeeker) {
    alert('Bạn không có quyền truy cập trang Người tìm việc!');
    next('/login');
  } else {
    next();
  }
});

export default router;