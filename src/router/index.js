import Vue from 'vue'
import VueRouter from 'vue-router'
import { isUserLoggedIn } from '@/auth/utils'
import { canNavigate } from '@/libs/acl/routeProtection'
import settings from "./settings";
import postingGroup from "./posting-group";
import inventory from "./inventory";
import sales from "./sales";
import purchase from "./purchase";
import finance from "./finance";

Vue.use(VueRouter)

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  scrollBehavior() {
    return { x: 0, y: 0 }
  },
  routes: [
    ...settings,
    ...postingGroup,
    ...inventory,
    ...sales,
    ...purchase,
    ...finance,
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
      path: '/inventory-posting-setup',
      name: 'InventoryPostingSetup_READ',
      component: () => import('@/views/posting-setup/InventoryPostingSetup.vue'),
      meta: {
        action: "READ",
        resource: "InventoryPostingSetup",
      },
    },
    {
      path: '/vat-posting-setup',
      name: 'VatPostingSetup_READ',
      component: () => import('@/views/posting-setup/VatPostingSetup.vue'),
      meta: {
        action: "READ",
        resource: "VatPostingSetup",
      },
    },
    {
      path: '/general-posting-setup',
      name: 'GeneralPostingSetup_READ',
      component: () => import('@/views/posting-setup/GeneralPostingSetup.vue'),
      meta: {
        action: "READ",
        resource: "GeneralPostingSetup",
      },
    },
    {
      path: '/inventory-setup',
      name: 'InventorySetup_READ',
      component: () => import('@/views/setup/InventorySetup.vue'),
      meta: {
        action: "READ",
        resource: "InventorySetup",
      },
    },
    {
      path: '/sales-setup',
      name: 'SalesSetup_READ',
      component: () => import('@/views/setup/SalesSetup.vue'),
      meta: {
        action: "READ",
        resource: "SalesSetup",
      },
    },
    {
      path: '/purchase-setup',
      name: 'PurchaseSetup_READ',
      component: () => import('@/views/setup/PurchaseSetup.vue'),
      meta: {
        action: "READ",
        resource: "PurchaseSetup",
      },
    },
    {
      path: '/general_ledger_setup',
      name: 'GeneralLedgerSetup_READ',
      component: () => import('@/views/setup/GeneralLedgerSetup.vue'),
      meta: {
        action: "READ",
        resource: "GeneralLedgerSetup",
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
