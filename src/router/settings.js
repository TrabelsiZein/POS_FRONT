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
  {
    path: '/responsibility-center',
    name: 'ResponsibilityCenter_READ',
    component: () => import('@/views/settings/ResponsibilityCenter.vue'),
    meta: {
      action: "READ",
      resource: "ResponsibilityCenter",
    },
  },
  {
    path: '/unit-of-measure',
    name: 'UnitOfMeasure_READ',
    component: () => import('@/views/settings/UnitOfMeasure.vue'),
    meta: {
      action: "READ",
      resource: "UnitOfMeasure",
    },
  },
  {
    path: '/currency',
    name: 'Currency_READ',
    component: () => import('@/views/settings/Currency.vue'),
    meta: {
      action: "READ",
      resource: "Currency",
    },
  },
  {
    path: '/series',
    name: 'SeriesHeader_READ',
    component: () => import('@/views/settings/SeriesHeaderList.vue'),
    meta: {
      action: "READ",
      resource: "SeriesHeader",
    },
  },
  {
    path: '/series-card',
    name: 'SeriesHeader_WRITE',
    component: () => import('@/views/settings/SeriesHeaderCard.vue'),
    meta: {
      action: "WRITE",
      resource: "SeriesHeader",
    },
  },
  {
    path: '/series-card/:id',
    name: 'SeriesHeader_EDIT',
    component: () => import('@/views/settings/SeriesHeaderCard.vue'),
    meta: {
      action: "EDIT",
      resource: "SeriesHeader",
    },
  },
]
