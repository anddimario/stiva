import Vue from 'vue';
import Router from 'vue-router';

import HomePage from '../home/HomePage'
import LoginPage from '../login/LoginPage'
import RegisterPage from '../register/RegisterPage'
import ListUsersPage from '../user/List'
import AddUserPage from '../user/AddPage'
import UpdateUserPage from '../user/UpdatePage'
import AddContentPage from '../content/AddPage'
import ListContentPage from '../content/List'
import UploadPage from '../upload/Upload'
import ListUploadPage from '../upload/List'
import DashPage from '../dash/Dash'
import GetRecoveryToken from '../passwordRecovery/GetToken'
import RecoveryPassword from '../passwordRecovery/Recovery'

Vue.use(Router);

export const router = new Router({
  mode: 'history',
  routes: [
    { path: '/', component: HomePage },
    { path: '/login', component: LoginPage },
    { path: '/register', component: RegisterPage },
    { path: '/users/list', component: ListUsersPage },
    { path: '/users/add', component: AddUserPage },
    { path: '/users/update', component: UpdateUserPage },
    { path: '/contents/add', component: AddContentPage },
    { path: '/contents', component: ListContentPage },
    { path: '/uploads/add', component: UploadPage },
    { path: '/uploads', component: ListUploadPage },
    { path: '/dash', component: DashPage },
    { path: '/get-recovery-token', component: GetRecoveryToken },
    { path: '/recovery-password', component: RecoveryPassword },

    // otherwise redirect to home
    { path: '*', redirect: '/' }
  ]
});

router.beforeEach((to, from, next) => {
  // redirect to login page if not logged in and trying to access a restricted page
  const publicPages = ['/', '/login', '/register', '/get-recovery-token', '/recovery-password'];
  const authRequired = !publicPages.includes(to.path);
  const loggedIn = localStorage.getItem('user');

  if (authRequired && !loggedIn) {
    return next('/login');
  }

  next();
})
