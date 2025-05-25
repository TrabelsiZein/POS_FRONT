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
      component: () => import('@/views/posting-group/GeneralProductPostingGroup.vue'),
      meta: {
        action: "READ",
        resource: "GeneralProductPostingGroup",
      },
    },
    {
      path: '/general-business-posting-group',
      name: 'GeneralBusinessPostingGroup_READ',
      component: () => import('@/views/posting-group/GeneralBusinessPostingGroup.vue'),
      meta: {
        action: "READ",
        resource: "GeneralBusinessPostingGroup",
      },
    },
    {
      path: '/general-ledger-account',
      name: 'GeneralLedgerAccount_READ',
      component: () => import('@/views/GeneralLedgerAccountList.vue'),
      meta: {
        action: "READ",
        resource: "GeneralLedgerAccount",
      },
    },
    {
      path: '/general-ledger-account-sheet',
      name: 'GeneralLedgerAccount_WRITE',
      component: () => import('@/views/GeneralLedgerAccountSheet.vue'),
      meta: {
        action: "WRITE",
        resource: "GeneralLedgerAccount",
      },
    },
    {
      path: '/general-ledger-account-sheet/:id',
      name: 'GeneralLedgerAccount_EDIT',
      component: () => import('@/views/GeneralLedgerAccountSheet.vue'),
      meta: {
        action: "EDIT",
        resource: "GeneralLedgerAccount",
      },
    },
    {
      path: '/currency',
      name: 'Currency_READ',
      component: () => import('@/views/Currency.vue'),
      meta: {
        action: "READ",
        resource: "Currency",
      },
    },
    {
      path: '/item-discount-group',
      name: 'ItemDiscountGroup_READ',
      component: () => import('@/views/ItemDiscountGroup.vue'),
      meta: {
        action: "READ",
        resource: "ItemDiscountGroup",
      },
    },
    {
      path: '/location',
      name: 'Location_READ',
      component: () => import('@/views/LocationList.vue'),
      meta: {
        action: "READ",
        resource: "Location",
      },
    },
    {
      path: '/location-sheet',
      name: 'Location_WRITE',
      component: () => import('@/views/LocationSheet.vue'),
      meta: {
        action: "WRITE",
        resource: "Location",
      },
    },
    {
      path: '/location-sheet/:id',
      name: 'Location_EDIT',
      component: () => import('@/views/LocationSheet.vue'),
      meta: {
        action: "EDIT",
        resource: "Location",
      },
    },
    {
      path: '/series',
      name: 'SeriesHeader_READ',
      component: () => import('@/views/SeriesHeader.vue'),
      meta: {
        action: "READ",
        resource: "SeriesHeader",
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
      path: '/general_ledger_setup-setup',
      name: 'GeneralLedgerSetup_READ',
      component: () => import('@/views/setup/GeneralLedgerSetup.vue'),
      meta: {
        action: "READ",
        resource: "GeneralLedgerSetup",
      },
    },
    {
      path: '/item-tracking-code',
      name: 'ItemTrackingCode_READ',
      component: () => import('@/views/item/ItemTrackingCode.vue'),
      meta: {
        action: "READ",
        resource: "ItemTrackingCode",
      },
    },
    {
      path: '/item-family',
      name: 'ItemFamily_READ',
      component: () => import('@/views/item/ItemFamily.vue'),
      meta: {
        action: "READ",
        resource: "ItemFamily",
      },
    },
    {
      path: '/item-sub-family',
      name: 'ItemSubFamily_READ',
      component: () => import('@/views/item/ItemSubFamily.vue'),
      meta: {
        action: "READ",
        resource: "ItemSubFamily",
      },
    },
        {
      path: '/item',
      name: 'Item_READ',
      component: () => import('@/views/item/ItemList.vue'),
      meta: {
        action: "READ",
        resource: "Item",
      },
    },
    {
      path: '/item-sheet',
      name: 'Item_WRITE',
      component: () => import('@/views/item/ItemSheet.vue'),
      meta: {
        action: "WRITE",
        resource: "Item",
      },
    },
    {
      path: '/item-sheet/:id',
      name: 'Item_EDIT',
      component: () => import('@/views/item/ItemSheet.vue'),
      meta: {
        action: "EDIT",
        resource: "Item",
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
