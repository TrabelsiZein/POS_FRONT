export default [
  {
    title: 'Administration',
    icon: 'SettingsIcon',
    children: [
      {
        title: 'Users',
        icon: 'UsersIcon',
        route: { name: 'admin-users' },
        resource: 'admin-users',
        action: 'read',
      },
      {
        title: 'Customers',
        icon: 'UsersIcon',
        route: { name: 'admin-customers' },
        resource: 'admin-customers',
        action: 'read',
      },
      {
        title: 'Locations',
        icon: 'MapPinIcon',
        route: { name: 'admin-locations' },
        resource: 'admin-locations',
        action: 'read',
      },
      {
        title: 'Payment Methods',
        icon: 'CreditCardIcon',
        route: { name: 'admin-payment-methods' },
        resource: 'admin-payment-methods',
        action: 'read',
      },
      {
        title: 'General Setup',
        icon: 'SlidersIcon',
        route: { name: 'admin-general-setup' },
        resource: 'admin-general-setup',
        action: 'read',
      },
      {
        title: 'ERP Jobs',
        icon: 'RefreshCwIcon',
        route: { name: 'admin-erp-jobs' },
        resource: 'admin-erp-jobs',
        action: 'read',
      },
      {
        title: 'ERP Logs',
        icon: 'ActivityIcon',
        route: { name: 'admin-erp-communications' },
        resource: 'admin-erp-communications',
        action: 'read',
      },
    ],
  },
  {
    title: 'Tickets',
    icon: 'FileTextIcon',
    route: { name: 'tickets-history' },
    resource: 'tickets-history',
    action: 'read',
  },
  {
    title: 'Returns',
    icon: 'RotateCcwIcon',
    route: { name: 'admin-returns' },
    resource: 'admin-returns',
    action: 'read',
  },
  {
    title: 'Items',
    icon: 'PackageIcon',
    children: [
      {
        title: 'Items',
        icon: 'HashIcon',
        route: { name: 'admin-item-barcodes' },
        resource: 'admin-item-barcodes',
        action: 'read',
      },
      {
        title: 'Item Families',
        icon: 'LayersIcon',
        route: { name: 'admin-item-families' },
        resource: 'admin-item-families',
        action: 'read',
      },
      {
        title: 'Item Subfamilies',
        icon: 'GridIcon',
        route: { name: 'admin-item-subfamilies' },
        resource: 'admin-item-subfamilies',
        action: 'read',
      },
    ],
  },
  {
    title: 'Sessions',
    icon: 'ClockIcon',
    children: [
      {
        title: 'Admin Dashboard',
        icon: 'StarIcon',
        route: { name: 'admin-sessions' },
        resource: 'admin-sessions',
        action: 'read',
      },
      {
        title: 'Responsible Dashboard',
        icon: 'StarIcon',
        route: { name: 'responsible-sessions' },
        resource: 'responsible-sessions',
        action: 'read',
      },
      {
        title: 'Session History',
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
