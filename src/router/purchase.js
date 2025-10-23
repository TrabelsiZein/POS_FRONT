export default [
    {
        path: '/vendor',
        name: 'Vendor_READ',
        component: () => import('@/views/purchase/VendorList.vue'),
        meta: {
            action: "READ",
            resource: "Vendor",
        },
    },
    {
        path: '/vendor-card',
        name: 'Vendor_WRITE',
        component: () => import('@/views/purchase/VendorCard.vue'),
        meta: {
            action: "WRITE",
            resource: "Vendor",
        },
    },
    {
        path: '/vendor-card/:id',
        name: 'Vendor_EDIT',
        component: () => import('@/views/purchase/VendorCard.vue'),
        meta: {
            action: "EDIT",
            resource: "Vendor",
        },
    },
]