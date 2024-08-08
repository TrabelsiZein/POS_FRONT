/* eslint-disable */
// prettier-ignore
export default {
  List: {
    key: 'title',
    data: [
      { title: 'Gestion Des Roles', route: { name: 'RolesManagement_READ' }, icon: 'LockIcon' },
      { title: 'Gestion Des Utilisateurs', route: { name: 'UsersManagement_READ' }, icon: 'UserIcon' },
      { title: 'Unités De Mesure', route: { name: 'UnitOfMeasure_READ' }, icon: 'CodepenIcon' },
      { title: 'Unités De Mesure Article', route: { name: 'ItemUnitOfMeasure_READ' }, icon: 'CodepenIcon' },
      { title: 'Groupe Compta. Stock', route: { name: 'InventoryPostingGroup_READ' }, icon: 'HardDriveIcon' },
      { title: 'Paramètres compta. Stock', route: { name: 'InventoryPostingSetup_READ' }, icon: 'SettingsIcon' },
      { title: 'Groupe compta. Produit TVA', route: { name: 'VatProductPostingGroup_READ' }, icon: 'HardDriveIcon' },
      { title: 'Groupe compta. Marché TVA', route: { name: 'VatBusinessPostingGroup_READ' }, icon: 'HardDriveIcon' },
      { title: 'Paramètres compta. TVA', route: { name: 'VatPostingSetup_READ' }, icon: 'SettingsIcon' },
      { title: 'Groupe compta. Produit', route: { name: 'GeneralProductPostingGroup_READ' }, icon: 'HardDriveIcon' },
      { title: 'Groupe compta. Marché', route: { name: 'GeneralBusinessPostingGroup_READ' }, icon: 'HardDriveIcon' },
      { title: 'Paramètres comptabilisation', route: { name: 'GeneralPostingSetup_READ' }, icon: 'SettingsIcon' },
      { title: 'Compte Général', route: { name: 'GeneralLedgerAccount_READ' }, icon: 'HardDriveIcon' },
      { title: 'Devise', route: { name: 'Currency_READ' }, icon: 'DollarSignIcon' },
      { title: 'Groupe Remises Article', route: { name: 'ItemDiscountGroup_READ' }, icon: 'PercentIcon' },
      { title: 'Magasin', route: { name: 'Location_READ' }, icon: 'MapIcon' },
      { title: 'Souches', route: { name: 'SeriesHeader_READ' }, icon: 'TerminalIcon' },
    ],
  },
  Card: {
    key: 'title',
    data: [
      { title: 'Paramètres Stock', route: { name: 'InventorySetup_READ' }, icon: 'SettingsIcon' },
      { title: 'Paramètres Vente', route: { name: 'SalesSetup_READ' }, icon: 'SettingsIcon' },
      { title: 'Paramètres Achat', route: { name: 'PurchaseSetup_READ' }, icon: 'SettingsIcon' },
      { title: 'Paramètres Grand Livre', route: { name: 'GeneralLedgerSetup_READ' }, icon: 'SettingsIcon' },
    ],
  },
}
