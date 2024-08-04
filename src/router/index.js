import Vue from 'vue'
import VueRouter from 'vue-router'
import { isUserLoggedIn } from '@/auth/utils'
import { canNavigate } from '@/libs/acl/routeProtection'

Vue.use(VueRouter)

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  scrollBehavior() {
    return { x: 0, y: 0 }
  },
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/Home.vue'),
    },
    {
      path: '/roles-list',
      name: 'RolesManagement_READ',
      component: () => import('@/views/users-management/RolesList.vue'),
      meta: {
        action: "READ",
        resource: "RolesManagement",
      },
    },
    {
      path: '/role-sheet',
      name: 'RolesManagement_WRITE',
      component: () => import('@/views/users-management/RoleSheet.vue'),
      meta: {
        action: "WRITE",
        resource: "RolesManagement",
      },
    },
    {
      path: '/role-sheet/:id',
      name: 'RolesManagement_EDIT',
      component: () => import('@/views/users-management/RoleSheet.vue'),
      meta: {
        action: "EDIT",
        resource: "RolesManagement",
      },
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/Login.vue'),
      meta: {
        layout: 'full',
        redirectIfLoggedIn: true
      },
    },
    {
      path: '/not-authorized',
      name: 'misc-not-authorized',
      component: () => import('@/views/error/NotAuthorized.vue'),
      meta: {
        layout: 'full',
      },
    },
    {
      path: '/error-404',
      name: 'error-404',
      component: () => import('@/views/error/Error404.vue'),
      meta: {
        layout: 'full',
      },
    },
    {
      path: '*',
      redirect: 'error-404',
    },
  ],
})

router.beforeEach((to, _, next) => {
  const isLoggedIn = isUserLoggedIn()

  if (!canNavigate(to)) {
    // Redirect to login if not logged in
    if (!isLoggedIn) return next({ name: 'auth-login' })

    // If logged in => not authorized
    return next({ name: 'misc-not-authorized' })
  }

  // Redirect if logged in
  if (to.meta.redirectIfLoggedIn && isLoggedIn) {
    next({ name: 'home' })
  }

  return next()
})

export default router
