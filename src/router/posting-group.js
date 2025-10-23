export default [
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
        path: '/vendor-posting-group',
        name: 'VendorPostingGroup_READ',
        component: () => import('@/views/posting-group/VendorPostingGroup.vue'),
        meta: {
            action: "READ",
            resource: "VendorPostingGroup",
        },
    },
    {
        path: '/customer-posting-group',
        name: 'CustomerPostingGroup_READ',
        component: () => import('@/views/posting-group/CustomerPostingGroup.vue'),
        meta: {
            action: "READ",
            resource: "CustomerPostingGroup",
        },
    },

]