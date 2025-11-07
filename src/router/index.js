import Vue from 'vue'
import VueRouter from 'vue-router'
import { isUserLoggedIn, getUserData, getHomeRouteForLoggedInUser } from '@/auth/utils'
import { canNavigate } from '@/libs/acl/routeProtection'

Vue.use(VueRouter)

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  scrollBehavior() {
    return { x: 0, y: 0 }
  },
  routes: [
    // POS Routes
    {
      path: '/pos/open-session',
      name: 'pos-open-session',
      component: () => import('@/views/pos/OpenSession.vue'),
      meta: {
        requiresAuth: true,
        requiredRole: 'POS_USER',
        skipSessionCheck: true
      }
    },
    {
      path: '/pos/items',
      name: 'pos-item-selection',
      component: () => import('@/views/pos/ItemSelection.vue'),
      meta: {
        requiresAuth: true,
        requiredRole: 'POS_USER',
        requiresSession: true
      }
    },
    {
      path: '/pos/customers',
      name: 'pos-customers',
      component: () => import('@/views/pos/CustomerManagement.vue'),
      meta: {
        requiresAuth: true,
        requiredRole: 'POS_USER',
        requiresSession: true
      }
    },
    {
      path: '/admin/customers',
      name: 'admin-customers',
      component: () => import('@/views/pos/CustomerManagement.vue'),
      meta: {
        requiresAuth: true,
        allowedRoles: ['ADMIN', 'RESPONSIBLE']
      }
    },
    {
      path: '/pos/payment',
      name: 'pos-payment',
      component: () => import('@/views/pos/Payment.vue'),
      meta: {
        requiresAuth: true,
        requiredRole: 'POS_USER',
        requiresSession: true
      }
    },
    {
      path: '/pos/return',
      name: 'pos-return',
      component: () => import('@/views/pos/ReturnProducts.vue'),
      meta: {
        requiresAuth: true,
        requiredRole: 'POS_USER',
        requiresSession: true
      }
    },
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/Home.vue'),
    },
    // Admin Routes
    {
      path: '/admin/users',
      name: 'admin-users',
      component: () => import('@/views/admin/UserManagement.vue'),
      meta: {
        requiresAuth: true,
        requiredRole: 'ADMIN'
      }
    },
    {
      path: '/admin/sessions',
      name: 'admin-sessions',
      component: () => import('@/views/admin/SessionDashboard.vue'),
      meta: {
        requiresAuth: true,
        requiredRole: 'ADMIN'
      }
    },
    {
      path: '/admin/sessions/history',
      name: 'admin-sessions-history',
      component: () => import('@/views/admin/SessionHistory.vue'),
      meta: {
        requiresAuth: true,
        requiredRole: 'ADMIN'
      }
    },
    {
      path: '/tickets/history',
      name: 'tickets-history',
      component: () => import('@/views/admin/TicketsHistory.vue'),
      meta: {
        requiresAuth: true,
        allowedRoles: ['ADMIN', 'RESPONSIBLE']
      }
    },
    {
      path: '/admin/item-barcodes',
      name: 'admin-item-barcodes',
      component: () => import('@/views/admin/ItemBarcodes.vue'),
      meta: {
        requiresAuth: true,
        allowedRoles: ['ADMIN', 'RESPONSIBLE']
      }
    },
    {
      path: '/admin/item-families',
      name: 'admin-item-families',
      component: () => import('@/views/admin/ItemFamiliesManagement.vue'),
      meta: {
        requiresAuth: true,
        allowedRoles: ['ADMIN']
      }
    },
    {
      path: '/admin/item-subfamilies',
      name: 'admin-item-subfamilies',
      component: () => import('@/views/admin/ItemSubFamiliesManagement.vue'),
      meta: {
        requiresAuth: true,
        allowedRoles: ['ADMIN']
      }
    },
    {
      path: '/admin/locations',
      name: 'admin-locations',
      component: () => import('@/views/admin/LocationsManagement.vue'),
      meta: {
        requiresAuth: true,
        allowedRoles: ['ADMIN']
      }
    },
    {
      path: '/admin/general-setup',
      name: 'admin-general-setup',
      component: () => import('@/views/admin/GeneralSetupManagement.vue'),
      meta: {
        requiresAuth: true,
        allowedRoles: ['ADMIN']
      }
    },
    {
      path: '/admin/returns',
      name: 'admin-returns',
      component: () => import('@/views/admin/ReturnsManagement.vue'),
      meta: {
        requiresAuth: true,
        allowedRoles: ['ADMIN', 'RESPONSIBLE']
      }
    },
    // Responsible Routes (also accessible by ADMIN)
    {
      path: '/responsible/sessions',
      name: 'responsible-sessions',
      component: () => import('@/views/admin/SessionDashboard.vue'),
      meta: {
        requiresAuth: true,
        // Allow both ADMIN and RESPONSIBLE to access
        allowedRoles: ['ADMIN', 'RESPONSIBLE']
      }
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

router.beforeEach(async (to, _, next) => {
  const isLoggedIn = isUserLoggedIn()

  // Redirect to login if not logged in
  if (!isLoggedIn && to.name !== 'login') {
    return next({ name: 'login' })
  }

  // Check role-based access
  if (to.meta.requiredRole) {
    const userData = getUserData()
    if (!userData || userData.role !== to.meta.requiredRole) {
      return next({ name: 'misc-not-authorized' })
    }
  }
  
  // Check allowed roles (for routes that allow multiple roles)
  if (to.meta.allowedRoles && Array.isArray(to.meta.allowedRoles)) {
    const userData = getUserData()
    if (!userData || !to.meta.allowedRoles.includes(userData.role)) {
      return next({ name: 'misc-not-authorized' })
    }
  }

  // Check for cashier session if required (for POS_USER)
  // Only check once on first access, then use cached value from store
  if (to.meta.requiresSession && !to.meta.skipSessionCheck) {
    const userData = getUserData()
    if (userData && userData.role === 'POS_USER') {
      const store = require('@/store').default
      const sessionChecked = store.getters['pos/isSessionChecked']
      const hasOpenSession = store.getters['pos/hasOpenSession']
      
      // Only check API if we haven't checked yet (first time or after logout/login)
      if (!sessionChecked) {
        const session = await store.dispatch('pos/checkSession')
        if (!session) {
          return next({ name: 'pos-open-session' })
        }
      } else if (!hasOpenSession) {
        // Session was checked but no open session found
        return next({ name: 'pos-open-session' })
      }
      // If session is checked and exists, allow navigation without API call
    }
  }

  // Redirect if logged in and trying to access login page
  if (to.meta.redirectIfLoggedIn && isLoggedIn) {
    const userData = getUserData()
    const homeRoute = getHomeRouteForLoggedInUser(userData?.role)
    return next(homeRoute)
  }

  // For authenticated users without specific route, redirect based on role
  if (isLoggedIn && to.name === 'home') {
    const userData = getUserData()
    const homeRoute = getHomeRouteForLoggedInUser(userData?.role)
    if (homeRoute.name !== 'home') {
      return next(homeRoute)
    }
  }

  if (!canNavigate(to)) {
    return next({ name: 'misc-not-authorized' })
  }

  return next()
})

export default router
