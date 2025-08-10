export default [
  {
    path: '/territory',
    name: 'Territory_READ',
    component: () => import('@/views/settings/Territory.vue'),
    meta: {
      action: "READ",
      resource: "Territory",
    },
  },
  {
    path: '/payment-method',
    name: 'PaymentMethod_READ',
    component: () => import('@/views/settings/PaymentMethod.vue'),
    meta: {
      action: "READ",
      resource: "PaymentMethod",
    },
  },
  {
    path: '/payment-terms',
    name: 'PaymentTerms_READ',
    component: () => import('@/views/settings/PaymentTerms.vue'),
    meta: {
      action: "READ",
      resource: "PaymentTerms",
    },
  },
  {
    path: '/sales-person-purchaser',
    name: 'SalesPersonPurchaser_READ',
    component: () => import('@/views/settings/SalesPersonPurchaser.vue'),
    meta: {
      action: "READ",
      resource: "SalesPersonPurchaser",
    },
  },
  {
    path: '/shipment-agent',
    name: 'ShipmentAgent_READ',
    component: () => import('@/views/settings/ShipmentAgent.vue'),
    meta: {
      action: "READ",
      resource: "ShipmentAgent",
    },
  },

]
