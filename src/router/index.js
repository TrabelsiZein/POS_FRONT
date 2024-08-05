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
      path: '/users-list',
      name: 'UsersManagement_READ',
      component: () => import('@/views/users-management/UsersList.vue'),
      meta: {
        action: "READ",
        resource: "UsersManagement",
      },
    },
    {
      path: '/user-sheet',
      name: 'UsersManagement_WRITE',
      component: () => import('@/views/users-management/UserSheet.vue'),
      meta: {
        action: "WRITE",
        resource: "UsersManagement",
      },
    },
    {
      path: '/user-sheet/:id',
      name: 'UsersManagement_EDIT',
      component: () => import('@/views/users-management/UserSheet.vue'),
      meta: {
        action: "EDIT",
        resource: "UsersManagement",
      },
    },
    {
      path: '/unit-of-measure',
      name: 'UnitOfMeasure_READ',
      component: () => import('@/views/UnitOfMeasure.vue'),
      meta: {
        action: "READ",
        resource: "UnitOfMeasure",
      },
    },
    {
      path: '/item-unit-of-measure',
      name: 'ItemUnitOfMeasure_READ',
      component: () => import('@/views/ItemUnitOfMeasure.vue'),
      meta: {
        action: "READ",
        resource: "ItemUnitOfMeasure",
      },
    },
    {
      path: '/inventory-posting-group',
      name: 'InventoryPostingGroup_READ',
      component: () => import('@/views/posting-group/InventoryPostingGroup.vue'),
      meta: {
        action: "READ",
        resource: "InventoryPostingGroup",
      },
    },
    {
      path: '/vat-product-posting-group',
      name: 'VatProductPostingGroup_READ',
      component: () => import('@/views/posting-group/VatProductPostingGroup.vue'),
      meta: {
        action: "READ",
        resource: "VatProductPostingGroup",
      },
    },
    {
      path: '/vat-business-posting-group',
      name: 'VatBusinessPostingGroup_READ',
      component: () => import('@/views/posting-group/VatBusinessPostingGroup.vue'),
      meta: {
        action: "READ",
        resource: "VatBusinessPostingGroup",
      },
    },
    {
      path: '/general-product-posting-group',
      name: 'GeneralProductPostingGroup_READ',
      component: () => import('@/views/posting-group/GenProductPostingGroup.vue'),
      meta: {
        action: "READ",
        resource: "GeneralProductPostingGroup",
      },
    },
    {
      path: '/general-business-posting-group',
      name: 'GeneralBusinessPostingGroup_READ',
      component: () => import('@/views/posting-group/GenBusinessPostingGroup.vue'),
      meta: {
        action: "READ",
        resource: "GeneralBusinessPostingGroup",
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

  // Redirect to login if not logged in
  if (!isLoggedIn && to.name != 'login') return next({ name: 'login' })

  if (!canNavigate(to)) {

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
