export default [
  {
    title: 'admin.administration',
    icon: 'SettingsIcon',
    children: [
      {
        title: 'admin.users',
        icon: 'UsersIcon',
        route: { name: 'admin-users' },
        resource: 'admin-users',
        action: 'read',
      },
      {
        title: 'admin.customers',
        icon: 'UsersIcon',
        route: { name: 'admin-customers' },
        resource: 'admin-customers',
        action: 'read',
      },
      {
        title: 'admin.locations',
        icon: 'MapPinIcon',
        route: { name: 'admin-locations' },
        resource: 'admin-locations',
        action: 'read',
      },
      {
        title: 'admin.paymentMethods',
        icon: 'CreditCardIcon',
        route: { name: 'admin-payment-methods' },
        resource: 'admin-payment-methods',
        action: 'read',
      },
      {
        title: 'admin.generalSetup',
        icon: 'SlidersIcon',
        route: { name: 'admin-general-setup' },
        resource: 'admin-general-setup',
        action: 'read',
      },
      {
        title: 'admin.erpJobs.title',
        icon: 'RefreshCwIcon',
        route: { name: 'admin-erp-jobs' },
        resource: 'admin-erp-jobs',
        action: 'read',
      },
      {
        title: 'admin.erpLogs',
        icon: 'ActivityIcon',
        route: { name: 'admin-erp-communications' },
        resource: 'admin-erp-communications',
        action: 'read',
      },
    ],
  },
  {
    title: 'admin.tickets',
    icon: 'FileTextIcon',
    route: { name: 'tickets-history' },
    resource: 'tickets-history',
    action: 'read',
  },
  {
    title: 'admin.returns',
    icon: 'RotateCcwIcon',
    route: { name: 'admin-returns' },
    resource: 'admin-returns',
    action: 'read',
  },
  {
    title: 'admin.items',
    icon: 'PackageIcon',
    children: [
      {
        title: 'admin.items',
        icon: 'HashIcon',
        route: { name: 'admin-item-barcodes' },
        resource: 'admin-item-barcodes',
        action: 'read',
      },
      {
        title: 'admin.itemFamilies',
        icon: 'LayersIcon',
        route: { name: 'admin-item-families' },
        resource: 'admin-item-families',
        action: 'read',
      },
      {
        title: 'admin.itemSubfamilies',
        icon: 'GridIcon',
        route: { name: 'admin-item-subfamilies' },
        resource: 'admin-item-subfamilies',
        action: 'read',
      },
    ],
  },
  {
    title: 'admin.sessions',
    icon: 'ClockIcon',
    children: [
      {
        title: 'admin.adminDashboard',
        icon: 'StarIcon',
        route: { name: 'admin-sessions' },
        resource: 'admin-sessions',
        action: 'read',
      },
      {
        title: 'admin.responsibleDashboard',
        icon: 'StarIcon',
        route: { name: 'responsible-sessions' },
        resource: 'responsible-sessions',
        action: 'read',
      },
      {
        title: 'admin.sessionHistory.title',
        icon: 'ClockIcon',
        route: { name: 'admin-sessions-history' },
        resource: 'admin-sessions-history',
        action: 'read',
      },
    ],
    // Only show this group for RESPONSIBLE role
    // ADMIN will only see Administration menu (with Session Dashboard, Session History, and Customers inside)
  },
]
