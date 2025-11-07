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
        title: 'Item Barcodes',
        icon: 'HashIcon',
        route: { name: 'admin-item-barcodes' },
        resource: 'admin-item-barcodes',
        action: 'read',
      },
    ],
  },
  {
    title: 'Sessions',
    icon: 'ClockIcon',
    children: [
      {
        title: 'Session Dashboard',
        icon: 'StarIcon',
        route: { name: 'admin-sessions' },
        resource: 'admin-sessions',
        action: 'read',
      },
      {
        title: 'Session Dashboard',
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
