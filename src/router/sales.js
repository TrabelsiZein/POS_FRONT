export default [
    {
        path: '/customer',
        name: 'Customer_READ',
        component: () => import('@/views/sales/CustomerList.vue'),
        meta: {
            action: "READ",
            resource: "Customer",
        },
    },
    {
        path: '/customer-card',
        name: 'Customer_WRITE',
        component: () => import('@/views/sales/CustomerCard.vue'),
        meta: {
            action: "WRITE",
            resource: "Customer",
        },
    },
    {
        path: '/customer-card/:id',
        name: 'Customer_EDIT',
        component: () => import('@/views/sales/CustomerCard.vue'),
        meta: {
            action: "EDIT",
            resource: "Customer",
        },
    },
    {
        path: '/customer-discount-group',
        name: 'CustomerDiscountGroup_READ',
        component: () => import('@/views/sales/CustomerDiscountGroup.vue'),
        meta: {
            action: "READ",
            resource: "CustomerDiscountGroup",
        },
    },
    {
        path: '/customer-price-group',
        name: 'CustomerPriceGroup_READ',
        component: () => import('@/views/sales/CustomerPriceGroup.vue'),
        meta: {
            action: "READ",
            resource: "CustomerPriceGroup",
        },
    },
    {
        path: '/sales-header',
        name: 'SalesHeader_READ',
        component: () => import('@/views/sales/SalesHeaderList.vue'),
        meta: {
            action: "READ",
            resource: "SalesHeader",
        },
    },
    {
        path: '/sales-header-card',
        name: 'SalesHeader_WRITE',
        component: () => import('@/views/sales/SalesHeaderCard.vue'),
        meta: {
            action: "WRITE",
            resource: "SalesHeader",
        },
    },
    {
        path: '/sales-header-card/:id',
        name: 'SalesHeader_EDIT',
        component: () => import('@/views/sales/SalesHeaderCard.vue'),
        meta: {
            action: "EDIT",
            resource: "SalesHeader",
        },
    },
]