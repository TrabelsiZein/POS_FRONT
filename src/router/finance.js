export default [
    {
      path: '/general-ledger-account',
      name: 'GeneralLedgerAccount_READ',
      component: () => import('@/views/finance/GeneralLedgerAccountList.vue'),
      meta: {
        action: "READ",
        resource: "GeneralLedgerAccount",
      },
    },
    {
      path: '/general-ledger-account-card',
      name: 'GeneralLedgerAccount_WRITE',
      component: () => import('@/views/finance/GeneralLedgerAccountCard.vue'),
      meta: {
        action: "WRITE",
        resource: "GeneralLedgerAccount",
      },
    },
    {
      path: '/general-ledger-account-card/:id',
      name: 'GeneralLedgerAccount_EDIT',
      component: () => import('@/views/finance/GeneralLedgerAccountCard.vue'),
      meta: {
        action: "EDIT",
        resource: "GeneralLedgerAccount",
      },
    },
]