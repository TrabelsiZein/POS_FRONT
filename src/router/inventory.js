export default [

    {
        path: '/item',
        name: 'Item_READ',
        component: () => import('@/views/inventory/ItemList.vue'),
        meta: {
            action: "READ",
            resource: "Item",
        },
    },
    {
        path: '/item-card',
        name: 'Item_WRITE',
        component: () => import('@/views/inventory/ItemCard.vue'),
        meta: {
            action: "WRITE",
            resource: "Item",
        },
    },
    {
        path: '/item-card/:id',
        name: 'Item_EDIT',
        component: () => import('@/views/inventory/ItemCard.vue'),
        meta: {
            action: "EDIT",
            resource: "Item",
        },
    },
    {
        path: '/item-tracking-code',
        name: 'ItemTrackingCode_READ',
        component: () => import('@/views/inventory/ItemTrackingCode.vue'),
        meta: {
            action: "READ",
            resource: "ItemTrackingCode",
        },
    },
    {
        path: '/item-family',
        name: 'ItemFamily_READ',
        component: () => import('@/views/inventory/ItemFamily.vue'),
        meta: {
            action: "READ",
            resource: "ItemFamily",
        },
    },
    {
        path: '/item-sub-family',
        name: 'ItemSubFamily_READ',
        component: () => import('@/views/inventory/ItemSubFamily.vue'),
        meta: {
            action: "READ",
            resource: "ItemSubFamily",
        },
    },
    {
        path: '/item-unit-of-measure',
        name: 'ItemUnitOfMeasure_READ',
        component: () => import('@/views/inventory/ItemUnitOfMeasure.vue'),
        meta: {
            action: "READ",
            resource: "ItemUnitOfMeasure",
        },
    },
    {
        path: '/item-discount-group',
        name: 'ItemDiscountGroup_READ',
        component: () => import('@/views/inventory/ItemDiscountGroup.vue'),
        meta: {
            action: "READ",
            resource: "ItemDiscountGroup",
        },
    },
    {
        path: '/item-variants',
        name: 'ItemVariants_READ',
        component: () => import('@/views/inventory/ItemVariants.vue'),
        meta: {
            action: "READ",
            resource: "ItemVariants",
        },
    },
        {
        path: '/stock-keeping-unit',
        name: 'StockKeepingUnit_READ',
        component: () => import('@/views/inventory/StockKeepingUnit.vue'),
        meta: {
            action: "READ",
            resource: "StockKeepingUnit",
        },
    },
    {
      path: '/location',
      name: 'Location_READ',
      component: () => import('@/views/inventory/LocationList.vue'),
      meta: {
        action: "READ",
        resource: "Location",
      },
    },
    {
      path: '/location-card',
      name: 'Location_WRITE',
      component: () => import('@/views/inventory/LocationCard.vue'),
      meta: {
        action: "WRITE",
        resource: "Location",
      },
    },
    {
      path: '/location-card/:id',
      name: 'Location_EDIT',
      component: () => import('@/views/inventory/LocationCard.vue'),
      meta: {
        action: "EDIT",
        resource: "Location",
      },
    },
]