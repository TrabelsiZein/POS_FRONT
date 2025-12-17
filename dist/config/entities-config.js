// const noField = { field: 'no', headerName: 'N°', hide: false, type: 'string' };
const noField = { field: 'no', label: { fr: 'N°', en: '', ar: '' }, showList: true, showCard: true, type: 'String', tooltip: { fr: '', en: '', ar: '' }, tab: 1, mandatory: true };
const descriptionField = { field: 'description', label: { fr: 'Description', en: '', ar: '' }, showList: true, showCard: true, type: 'String', tooltip: { fr: '', en: '', ar: '' }, tab: 1, mandatory: true };
const nameField = { field: 'name', label: { fr: 'Nom', en: '', ar: '' }, showList: true, showCard: true, type: 'String', tooltip: { fr: '', en: '', ar: '' }, tab: 1 };

const auditFields = [
    { field: 'id', label: { fr: 'Id', en: 'Id', ar: 'Id' }, showList: false, showCard: false, type: 'Long', tooltip: { fr: 'Id', en: 'Id', ar: 'Id' } },
    { field: 'createdAt', label: { fr: 'Créé Le', en: '', ar: '' }, showList: false, showCard: false, type: 'String', tooltip: { fr: '', en: '', ar: '' } },
    { field: 'createdBy', label: { fr: 'Créé Par', en: '', ar: '' }, showList: false, showCard: false, type: 'String', tooltip: { fr: '', en: '', ar: '' } },
    { field: 'updatedAt', label: { fr: 'Modifié Le', en: '', ar: '' }, showList: false, showCard: false, type: 'String', tooltip: { fr: '', en: '', ar: '' } },
    { field: 'updatedBy', label: { fr: 'Modifié Par', en: '', ar: '' }, showList: false, showCard: false, type: 'String', tooltip: { fr: '', en: '', ar: '' } }
];

const contactFields = [
    { field: 'email', label: { fr: 'E-mail', en: '', ar: '' }, showList: true, showCard: true, type: 'String', tooltip: { fr: '', en: '', ar: '' }, tab: 1 },
    { field: 'phone', label: { fr: 'Téléphone', en: '', ar: '' }, showList: true, showCard: true, type: 'String', tooltip: { fr: '', en: '', ar: '' }, tab: 1 }
];

const defaultFields = {
    noDescription: [noField, descriptionField],
    noName: [noField, nameField],
    contact: [noField, nameField, ...contactFields],
};

// List of entities that have series headers
const entitiesWithSeriesHeaders = [
    'Customer',
    'Currency',
    'SalesHeader',
    'Vendor',
    'Item',
];

window.entities = {
    // ========================================
    // SALES MODULE ENTITIES
    // ========================================
    Customer: {
        apiURI: 'customer',
        titleList: { fr: 'Liste des clients', en: 'Customer List', ar: 'قائمة العملاء' },
        titleForm: { fr: 'Fiche Client', en: 'Customer Card', ar: 'بطاقة العميل' },
        breadcrumb: ['Ventes'],
        tabs: [
            { id: 1, title: { fr: 'Général', en: 'General', ar: 'عام' }, open: true },
            { id: 2, title: { fr: 'Comptabilité', en: 'Accounting', ar: 'المحاسبة' }, open: false },
            { id: 3, title: { fr: 'Facturation', en: 'Billing', ar: 'الفوترة' }, open: false }
        ],
        fields: [
            ...defaultFields.noName,
            { field: 'name2', label: { fr: 'Nom 2', en: 'Name 2', ar: 'الاسم 2' }, showList: false, showCard: true, type: 'String', tooltip: { fr: '', en: '', ar: '' }, tab: 1 },
            { field: 'address', label: { fr: 'Adresse', en: 'Address', ar: 'العنوان' }, showList: false, showCard: true, type: 'String', tooltip: { fr: '', en: '', ar: '' }, tab: 1 },
            { field: 'contact', label: { fr: 'Contact', en: 'Contact', ar: 'جهة الاتصال' }, showList: false, showCard: true, type: 'String', tooltip: { fr: '', en: '', ar: '' }, tab: 1 },
            { field: 'phoneNo', label: { fr: 'N° téléphone', en: 'Phone No', ar: 'رقم الهاتف' }, showList: true, showCard: true, type: 'String', tooltip: { fr: '', en: '', ar: '' }, tab: 1 },
            { field: 'email', label: { fr: 'Adresse e-mail', en: 'E-mail', ar: 'البريد الإلكتروني' }, showList: true, showCard: true, type: 'String', tooltip: { fr: '', en: '', ar: '' }, tab: 1 },
            { field: 'territoryNo', label: { fr: 'Code secteur', en: 'Territory Code', ar: 'كود القطاع' }, showList: false, showCard: true, type: 'Lookup', lookupEntity: 'Territory', tooltip: { fr: '', en: '', ar: '' }, tab: 1 },
            { field: 'customerPostingGroupNo', label: { fr: 'Groupe compta. client', en: 'Customer Posting Group', ar: 'مجموعة محاسبة العميل' }, showList: false, showCard: true, type: 'Lookup', lookupEntity: 'CustomerPostingGroup', tooltip: { fr: '', en: '', ar: '' }, tab: 2 },
            { field: 'currencyNo', label: { fr: 'Code devise', en: 'Currency Code', ar: 'كود العملة' }, showList: false, showCard: true, type: 'Lookup', lookupEntity: 'Currency', tooltip: { fr: '', en: '', ar: '' }, tab: 2 },
            { field: 'paymentTermsNo', label: { fr: 'Code condition paiement', en: 'Payment Terms', ar: 'شروط الدفع' }, showList: false, showCard: true, type: 'Lookup', lookupEntity: 'PaymentTerms', tooltip: { fr: '', en: '', ar: '' }, tab: 2 },
            { field: 'purchaserNo', label: { fr: 'Code acheteur', en: 'Purchaser Code', ar: 'كود المشتري' }, showList: false, showCard: true, type: 'Lookup', lookupEntity: 'SalesPersonPurchaser', tooltip: { fr: '', en: '', ar: '' }, tab: 2 },
            { field: 'shippingAgentNo', label: { fr: 'Code transporteur', en: 'Shipment Agent', ar: 'وكيل الشحن' }, showList: false, showCard: true, type: 'Lookup', lookupEntity: 'ShipmentAgent', tooltip: { fr: '', en: '', ar: '' }, tab: 2 },
            { field: 'billToCustomerNo', label: { fr: 'N° client à facturer', en: 'Bill To Customer No', ar: 'رقم العميل للفوترة' }, showList: false, showCard: true, type: 'Lookup', lookupEntity: 'Customer', tooltip: { fr: '', en: '', ar: '' }, tab: 3 },
            { field: 'paymentMethodNo', label: { fr: 'Code mode de règlement', en: 'Payment Method', ar: 'طريقة الدفع' }, showList: false, showCard: true, type: 'Lookup', lookupEntity: 'PaymentMethod', tooltip: { fr: '', en: '', ar: '' }, tab: 2 },
            { field: 'balance', label: { fr: 'Solde', en: 'Balance', ar: 'الرصيد' }, showList: true, showCard: true, type: 'Number', tooltip: { fr: '', en: '', ar: '' }, tab: 2 },
            { field: 'balanceLCY', label: { fr: 'Solde DS', en: 'Balance LCY', ar: 'الرصيد بالعملة المحلية' }, showList: false, showCard: true, type: 'Number', tooltip: { fr: '', en: '', ar: '' }, tab: 2 },
            { field: 'pricesIncludingVAT', label: { fr: 'Prix TTC', en: 'Prices Including VAT', ar: 'الأسعار شاملة الضريبة' }, showList: false, showCard: true, type: 'Boolean', tooltip: { fr: '', en: '', ar: '' }, tab: 2 },
            { field: 'vatRegistrationNo', label: { fr: 'Matricule fiscal', en: 'VAT Registration No', ar: 'رقم تسجيل الضريبة' }, showList: false, showCard: true, type: 'String', tooltip: { fr: '', en: '', ar: '' }, tab: 2 },
            { field: 'genBusPostingGroupNo', label: { fr: 'Groupe compta. marché', en: 'Gen. Business Posting Group', ar: 'مجموعة محاسبة السوق' }, showList: false, showCard: true, type: 'Lookup', lookupEntity: 'GeneralBusinessPostingGroup', tooltip: { fr: '', en: '', ar: '' }, tab: 2 },
            { field: 'seriesHeaderNo', label: { fr: 'Souches de n°', en: 'No. Series', ar: 'سلسلة الأرقام' }, showList: false, showCard: true, type: 'Lookup', lookupEntity: 'SeriesHeader', tooltip: { fr: '', en: '', ar: '' }, tab: 2 },
            { field: 'vatBusPostingGroupNo', label: { fr: 'Groupe compta. marché TVA', en: 'VAT Business Posting Group', ar: 'مجموعة محاسبة السوق للضريبة' }, showList: false, showCard: true, type: 'Lookup', lookupEntity: 'VatBusinessPostingGroup', tooltip: { fr: '', en: '', ar: '' }, tab: 2 },
            { field: 'locationNo', label: { fr: 'Code magasin', en: 'Location Code', ar: 'كود الموقع' }, showList: false, showCard: true, type: 'Lookup', lookupEntity: 'Location', tooltip: { fr: '', en: '', ar: '' }, tab: 2 },
            ...auditFields
        ]
    },

    SalesSetup: {
        apiURI: 'sales_setup',
        titleList: { fr: 'Configuration Ventes', en: 'Sales Setup', ar: 'إعدادات المبيعات' },
        titleForm: { fr: 'Configuration Ventes', en: 'Sales Setup', ar: 'إعداد المبيعات' },
        breadcrumb: ['Ventes'],
        tabs: [
            { id: 1, title: { fr: 'Général', en: 'General', ar: 'عام' }, open: true },
            { id: 2, title: { fr: 'Séries de numéros', en: 'Number Series', ar: 'سلاسل الأرقام' }, open: false },
            { id: 3, title: { fr: 'Archivage', en: 'Archiving', ar: 'الأرشفة' }, open: false }
        ],
        fields: [
            { field: 'mandatoryExtDocNo', label: { fr: 'N° doc externe obligatoire', en: 'Mandatory External Doc No', ar: 'رقم المستند الخارجي إلزامي' }, showCard: true, type: 'Boolean', tooltip: { fr: '', en: '', ar: '' }, tab: 1 },
            { field: 'calculateInvoiceDiscount', label: { fr: 'Calculer remise facture', en: 'Calculate Invoice Discount', ar: 'حساب خصم الفاتورة' }, showCard: true, type: 'Boolean', tooltip: { fr: '', en: '', ar: '' }, tab: 1 },
            { field: 'allowVATDifference', label: { fr: 'Autoriser différence TVA', en: 'Allow VAT Difference', ar: 'السماح باختلاف الضريبة' }, showCard: true, type: 'Boolean', tooltip: { fr: '', en: '', ar: '' }, tab: 1 },
            { field: 'defaultAccountingDate', label: { fr: 'Date comptable par défaut', en: 'Default Accounting Date', ar: 'التاريخ المحاسبي الافتراضي' }, showCard: true, type: 'Dropdown', tooltip: { fr: '', en: '', ar: '' }, tab: 1 },
            { field: 'defaultQuantityToShip', label: { fr: 'Quantité à expédier par défaut', en: 'Default Quantity To Ship', ar: 'الكمية المراد شحنها افتراضياً' }, showCard: true, type: 'Dropdown', tooltip: { fr: '', en: '', ar: '' }, tab: 1 },
            { field: 'customerNo', label: { fr: 'N° client', en: 'Customer No', ar: 'رقم العميل' }, showCard: true, type: 'Lookup', lookupEntity: 'SeriesHeader', tooltip: { fr: '', en: '', ar: '' }, tab: 2 },
            { field: 'quoteNo', label: { fr: 'N° devis', en: 'Quote No', ar: 'رقم عرض السعر' }, showCard: true, type: 'Lookup', lookupEntity: 'SeriesHeader', tooltip: { fr: '', en: '', ar: '' }, tab: 2 },
            { field: 'orderNo', label: { fr: 'N° commande', en: 'Order No', ar: 'رقم الطلب' }, showCard: true, type: 'Lookup', lookupEntity: 'SeriesHeader', tooltip: { fr: '', en: '', ar: '' }, tab: 2 },
            { field: 'invoiceNo', label: { fr: 'N° facture', en: 'Invoice No', ar: 'رقم الفاتورة' }, showCard: true, type: 'Lookup', lookupEntity: 'SeriesHeader', tooltip: { fr: '', en: '', ar: '' }, tab: 2 },
            { field: 'registeredInvoiceNo', label: { fr: 'N° facture enregistrée', en: 'Registered Invoice No', ar: 'رقم الفاتورة المسجلة' }, showCard: true, type: 'Lookup', lookupEntity: 'SeriesHeader', tooltip: { fr: '', en: '', ar: '' }, tab: 2 },
            { field: 'creditMemoNo', label: { fr: 'N° avoir', en: 'Credit Memo No', ar: 'رقم مذكرة الائتمان' }, showCard: true, type: 'Lookup', lookupEntity: 'SeriesHeader', tooltip: { fr: '', en: '', ar: '' }, tab: 2 },
            { field: 'registeredCreditMemoNo', label: { fr: 'N° avoir enregistré', en: 'Registered Credit Memo No', ar: 'رقم مذكرة الائتمان المسجلة' }, showCard: true, type: 'Lookup', lookupEntity: 'SeriesHeader', tooltip: { fr: '', en: '', ar: '' }, tab: 2 },
            { field: 'registeredShipmentNo', label: { fr: 'N° expédition enregistrée', en: 'Registered Shipment No', ar: 'رقم الشحنة المسجلة' }, showCard: true, type: 'Lookup', lookupEntity: 'SeriesHeader', tooltip: { fr: '', en: '', ar: '' }, tab: 2 },
            { field: 'openOrderNo', label: { fr: 'N° commande ouverte', en: 'Open Order No', ar: 'رقم الطلب المفتوح' }, showCard: true, type: 'Lookup', lookupEntity: 'SeriesHeader', tooltip: { fr: '', en: '', ar: '' }, tab: 2 },
            { field: 'returnNo', label: { fr: 'N° retour', en: 'Return No', ar: 'رقم الإرجاع' }, showCard: true, type: 'Lookup', lookupEntity: 'SeriesHeader', tooltip: { fr: '', en: '', ar: '' }, tab: 2 },
            { field: 'registeredReturnShipmentNo', label: { fr: 'N° expédition retour enregistrée', en: 'Registered Return Shipment No', ar: 'رقم شحنة الإرجاع المسجلة' }, showCard: true, type: 'Lookup', lookupEntity: 'SeriesHeader', tooltip: { fr: '', en: '', ar: '' }, tab: 2 },
            { field: 'archiveCurrencies', label: { fr: 'Archiver devises', en: 'Archive Currencies', ar: 'أرشفة العملات' }, showCard: true, type: 'Boolean', tooltip: { fr: '', en: '', ar: '' }, tab: 3 },
            { field: 'archiveOrders', label: { fr: 'Archiver commandes', en: 'Archive Orders', ar: 'أرشفة الطلبات' }, showCard: true, type: 'Boolean', tooltip: { fr: '', en: '', ar: '' }, tab: 3 },
            { field: 'archiveOpenOrders', label: { fr: 'Archiver commandes ouvertes', en: 'Archive Open Orders', ar: 'أرشفة الطلبات المفتوحة' }, showCard: true, type: 'Boolean', tooltip: { fr: '', en: '', ar: '' }, tab: 3 },
            { field: 'archiveReturns', label: { fr: 'Archiver retours', en: 'Archive Returns', ar: 'أرشفة الإرجاعات' }, showCard: true, type: 'Boolean', tooltip: { fr: '', en: '', ar: '' }, tab: 3 },
            ...auditFields
        ]
    },

    // ========================================
    // PURCHASE MODULE ENTITIES
    // ========================================
    Vendor: {
        apiURI: 'vendor',
        titleList: { fr: 'Liste des fournisseurs', en: 'Vendor List', ar: 'قائمة الموردين' },
        titleForm: { fr: 'Fiche Fournisseur', en: 'Vendor Card', ar: 'بطاقة المورد' },
        breadcrumb: ['Achats'],
        tabs: [
            { id: 1, title: { fr: 'Général', en: 'General', ar: 'عام' }, open: true },
            { id: 2, title: { fr: 'Comptabilité', en: 'Accounting', ar: 'المحاسبة' }, open: false }
        ],
        fields: [
            ...defaultFields.noName,
            { field: 'name2', label: { fr: 'Nom 2', en: 'Name 2', ar: 'الاسم 2' }, showList: false, showCard: true, type: 'String', tooltip: { fr: '', en: '', ar: '' }, tab: 1 },
            { field: 'address', label: { fr: 'Adresse', en: 'Address', ar: 'العنوان' }, showList: false, showCard: true, type: 'String', tooltip: { fr: '', en: '', ar: '' }, tab: 1 },
            { field: 'contact', label: { fr: 'Contact', en: 'Contact', ar: 'جهة الاتصال' }, showList: false, showCard: true, type: 'String', tooltip: { fr: '', en: '', ar: '' }, tab: 1 },
            { field: 'phoneNo', label: { fr: 'N° téléphone', en: 'Phone No', ar: 'رقم الهاتف' }, showList: true, showCard: true, type: 'String', tooltip: { fr: '', en: '', ar: '' }, tab: 1 },
            { field: 'email', label: { fr: 'Adresse e-mail', en: 'E-mail', ar: 'البريد الإلكتروني' }, showList: true, showCard: true, type: 'String', tooltip: { fr: '', en: '', ar: '' }, tab: 1 },
            { field: 'territoryNo', label: { fr: 'Code secteur', en: 'Territory Code', ar: 'كود القطاع' }, showList: false, showCard: true, type: 'Lookup', lookupEntity: 'Territory', tooltip: { fr: '', en: '', ar: '' }, tab: 1 },
            { field: 'globalDimension1Code', label: { fr: 'Code axe principal 1', en: 'Global Dimension 1', ar: 'البعد العام 1' }, showList: false, showCard: true, type: 'String', tooltip: { fr: '', en: '', ar: '' }, tab: 2 },
            { field: 'globalDimension2Code', label: { fr: 'Code axe principal 2', en: 'Global Dimension 2', ar: 'البعد العام 2' }, showList: false, showCard: true, type: 'String', tooltip: { fr: '', en: '', ar: '' }, tab: 2 },
            { field: 'vendorPostingGroupNo', label: { fr: 'Groupe compta. fournisseur', en: 'Vendor Posting Group', ar: 'مجموعة محاسبة المورد' }, showList: false, showCard: true, type: 'Lookup', lookupEntity: 'VendorPostingGroup', tooltip: { fr: '', en: '', ar: '' }, tab: 2 },
            { field: 'currencyNo', label: { fr: 'Code devise', en: 'Currency Code', ar: 'كود العملة' }, showList: false, showCard: true, type: 'Lookup', lookupEntity: 'Currency', tooltip: { fr: '', en: '', ar: '' }, tab: 2 },
            { field: 'paymentTermsNo', label: { fr: 'Code condition paiement', en: 'Payment Terms', ar: 'شروط الدفع' }, showList: false, showCard: true, type: 'Lookup', lookupEntity: 'PaymentTerms', tooltip: { fr: '', en: '', ar: '' }, tab: 2 },
            { field: 'purchaserNo', label: { fr: 'Code acheteur', en: 'Purchaser Code', ar: 'كود المشتري' }, showList: false, showCard: true, type: 'Lookup', lookupEntity: 'SalesPersonPurchaser', tooltip: { fr: '', en: '', ar: '' }, tab: 2 },
            { field: 'shippingAgentNo', label: { fr: 'Code transporteur', en: 'Shipment Agent', ar: 'وكيل الشحن' }, showList: false, showCard: true, type: 'Lookup', lookupEntity: 'ShipmentAgent', tooltip: { fr: '', en: '', ar: '' }, tab: 2 },
            { field: 'payToVendorNo', label: { fr: 'N° fournisseur à payer', en: 'Pay To Vendor No', ar: 'رقم المورد للدفع' }, showList: false, showCard: true, type: 'Lookup', lookupEntity: 'Vendor', tooltip: { fr: '', en: '', ar: '' }, tab: 2 },
            { field: 'paymentMethodNo', label: { fr: 'Code mode de règlement', en: 'Payment Method', ar: 'طريقة الدفع' }, showList: false, showCard: true, type: 'Lookup', lookupEntity: 'PaymentMethod', tooltip: { fr: '', en: '', ar: '' }, tab: 2 },
            { field: 'balance', label: { fr: 'Solde', en: 'Balance', ar: 'الرصيد' }, showList: true, showCard: true, type: 'Number', tooltip: { fr: '', en: '', ar: '' }, tab: 2 },
            { field: 'balanceLCY', label: { fr: 'Solde DS', en: 'Balance LCY', ar: 'الرصيد بالعملة المحلية' }, showList: false, showCard: true, type: 'Number', tooltip: { fr: '', en: '', ar: '' }, tab: 2 },
            { field: 'pricesIncludingVAT', label: { fr: 'Prix TTC', en: 'Prices Including VAT', ar: 'الأسعار شاملة الضريبة' }, showList: false, showCard: true, type: 'Boolean', tooltip: { fr: '', en: '', ar: '' }, tab: 2 },
            { field: 'vatRegistrationNo', label: { fr: 'Matricule fiscal', en: 'VAT Registration No', ar: 'رقم تسجيل الضريبة' }, showList: false, showCard: true, type: 'String', tooltip: { fr: '', en: '', ar: '' }, tab: 2 },
            { field: 'genBusPostingGroupNo', label: { fr: 'Groupe compta. marché', en: 'Gen. Business Posting Group', ar: 'مجموعة محاسبة السوق' }, showList: false, showCard: true, type: 'Lookup', lookupEntity: 'GeneralBusinessPostingGroup', tooltip: { fr: '', en: '', ar: '' }, tab: 2 },
            { field: 'seriesNo', label: { fr: 'Souches de n°', en: 'No. Series', ar: 'سلسلة الأرقام' }, showList: false, showCard: true, type: 'Lookup', lookupEntity: 'SeriesHeader', tooltip: { fr: '', en: '', ar: '' }, tab: 2 },
            { field: 'vatBusPostingGroupNo', label: { fr: 'Groupe compta. marché TVA', en: 'VAT Business Posting Group', ar: 'مجموعة محاسبة السوق للضريبة' }, showList: false, showCard: true, type: 'Lookup', lookupEntity: 'VatBusinessPostingGroup', tooltip: { fr: '', en: '', ar: '' }, tab: 2 },
            { field: 'locationNo', label: { fr: 'Code magasin', en: 'Location Code', ar: 'كود الموقع' }, showList: false, showCard: true, type: 'Lookup', lookupEntity: 'Location', tooltip: { fr: '', en: '', ar: '' }, tab: 2 },
            ...auditFields
        ]
    },
    // ========================================
    // FINANCE MODULE ENTITIES
    // ========================================
    GeneralLedgerAccount: {
        apiURI: 'general_ledger_account',
        titleList: { fr: 'Liste des comptes grand livre', en: 'General Ledger Account List', ar: 'قائمة حسابات دفتر الأستاذ' },
        titleForm: { fr: 'Compte Grand Livre', en: 'General Ledger Account', ar: 'حساب دفتر الأستاذ' },
        breadcrumb: ['Finance'],
        fields: [
            { field: 'no', label: { fr: 'N°', en: 'No', ar: 'الرقم' }, showList: true, showCard: true, type: 'String', tooltip: { fr: '', en: '', ar: '' }, tab: 1 },
            { field: 'name', label: { fr: 'Nom', en: 'Name', ar: 'الاسم' }, showList: true, showCard: true, type: 'String', tooltip: { fr: '', en: '', ar: '' }, tab: 1 },
            { field: 'accountType', label: { fr: 'Type compte', en: 'Account Type', ar: 'نوع الحساب' }, showList: true, showCard: true, type: 'Dropdown', tooltip: { fr: '', en: '', ar: '' }, tab: 1 },
            { field: 'mainAxisCode1', label: { fr: 'Code axe principal 1', en: 'Main Axis Code 1', ar: 'كود المحور الرئيسي 1' }, showList: true, showCard: true, type: 'String', tooltip: { fr: '', en: '', ar: '' }, tab: 1 },
            { field: 'mainAxisCode2', label: { fr: 'Code axe principal 2', en: 'Main Axis Code 2', ar: 'كود المحور الرئيسي 2' }, showList: true, showCard: true, type: 'String', tooltip: { fr: '', en: '', ar: '' }, tab: 1 },
            { field: 'accountCategory', label: { fr: 'Catégorie du compte', en: 'Account Category', ar: 'فئة الحساب' }, showList: true, showCard: true, type: 'Dropdown', tooltip: { fr: '', en: '', ar: '' }, tab: 1 },
            { field: 'managementOrBalance', label: { fr: 'Gestion/Bilan', en: 'Management Or Balance', ar: 'الإدارة/الميزانية' }, showList: true, showCard: true, type: 'Dropdown', tooltip: { fr: '', en: '', ar: '' }, tab: 1 },
            { field: 'debitOrCredit', label: { fr: 'Débit/Crédit', en: 'Debit Or Credit', ar: 'مدين/دائن' }, showList: true, showCard: true, type: 'Dropdown', tooltip: { fr: '', en: '', ar: '' }, tab: 1 },
            { field: 'blocked', label: { fr: 'Bloqué', en: 'Blocked', ar: 'محظور' }, showList: true, showCard: true, type: 'Boolean', tooltip: { fr: '', en: '', ar: '' }, tab: 1 },
            { field: 'directImputation', label: { fr: 'Imputation directe', en: 'Direct Imputation', ar: 'الإسناد المباشر' }, showList: true, showCard: true, type: 'Boolean', tooltip: { fr: '', en: '', ar: '' }, tab: 1 },
            { field: 'totalization', label: { fr: 'Totalisation', en: 'Totalization', ar: 'التجميع' }, showList: true, showCard: true, type: 'String', tooltip: { fr: '', en: '', ar: '' }, tab: 1 },
            { field: 'vatBusinessPostingGroupNo', label: { fr: 'Groupe compta. marché TVA', en: 'VAT Business Posting Group', ar: 'مجموعة محاسبة السوق للضريبة' }, showList: false, showCard: true, type: 'Lookup', lookupEntity: 'VatBusinessPostingGroup', tooltip: { fr: '', en: '', ar: '' }, tab: 1 },
            { field: 'vatProductPostingGroupNo', label: { fr: 'Groupe compta. produit TVA', en: 'VAT Product Posting Group', ar: 'مجموعة محاسبة منتج الضريبة' }, showList: false, showCard: true, type: 'Lookup', lookupEntity: 'VatProductPostingGroup', tooltip: { fr: '', en: '', ar: '' }, tab: 1 },
            { field: 'genBusinessPostingGroupNo', label: { fr: 'Groupe compta. marché', en: 'Gen. Business Posting Group', ar: 'مجموعة محاسبة السوق' }, showList: false, showCard: true, type: 'Lookup', lookupEntity: 'GeneralBusinessPostingGroup', tooltip: { fr: '', en: '', ar: '' }, tab: 1 },
            { field: 'genProductPostingGroupNo', label: { fr: 'Groupe compta. produit', en: 'Gen. Product Posting Group', ar: 'مجموعة محاسبة المنتج' }, showList: false, showCard: true, type: 'Lookup', lookupEntity: 'GeneralProductPostingGroup', tooltip: { fr: '', en: '', ar: '' }, tab: 1 },
            ...auditFields
        ]
    },

    PaymentMethod: {
        apiURI: 'payment_method',
        titleList: { fr: 'Liste des mode de règlement', en: 'Payment Method List', ar: 'قائمة طرق الدفع' },
        titleForm: { fr: 'Mode de règlement', en: 'Payment Method', ar: 'طريقة الدفع' },
        breadcrumb: ['Finance'],
        fields: [...defaultFields.noDescription, ...auditFields]
    },

    PaymentTerms: {
        apiURI: 'payment_terms',
        titleList: { fr: 'Les conditions de paiement', en: 'Payment Terms List', ar: 'قائمة شروط الدفع' },
        titleForm: { fr: 'Condition de paiement', en: 'Payment Terms', ar: 'شروط الدفع' },
        breadcrumb: ['Finance'],
        fields: [
            { field: 'no', label: { fr: 'N°', en: 'No', ar: 'الرقم' }, showList: true, showCard: true, type: 'String', tooltip: { fr: '', en: '', ar: '' }, tab: 1 },
            { field: 'dueDateCalculation', label: { fr: 'Calcul date échéance', en: 'Due Date Calculation', ar: 'حساب تاريخ الاستحقاق' }, showList: true, showCard: true, type: 'Date', tooltip: { fr: '', en: '', ar: '' }, tab: 1 },
            { field: 'discountPercent', label: { fr: '% Remise', en: 'Discount %', ar: '% الخصم' }, showList: true, showCard: true, type: 'Number', tooltip: { fr: '', en: '', ar: '' }, tab: 1 },
            ...auditFields
        ]
    },

    // ========================================
    // CONTACT MODULE ENTITIES
    // ========================================
    SalesPersonPurchaser: {
        apiURI: 'sales_person_purchaser',
        titleList: { fr: 'Vendeur/Acheteur', en: 'Sales Person/Purchaser List', ar: 'قائمة البائعين/المشترين' },
        titleForm: { fr: 'Vendeur/Acheteur', en: 'Sales Person/Purchaser', ar: 'البائع/المشتري' },
        breadcrumb: ['Configuration'],
        fields: [...defaultFields.contact, ...auditFields]
    },

    ShipmentAgent: {
        apiURI: 'shipment_agent',
        titleList: { fr: 'Liste des transporteurs', en: 'Shipment Agent List', ar: 'قائمة وكلاء الشحن' },
        titleForm: { fr: 'Transporteur', en: 'Shipment Agent', ar: 'وكيل الشحن' },
        breadcrumb: ['Configuration'],
        fields: [...defaultFields.contact, ...auditFields]
    },

    // ========================================
    // SYSTEM MODULE ENTITIES
    // ========================================
    Territory: {
        apiURI: 'territory',
        titleList: { fr: 'Liste Des Secteurs', en: 'Territory List', ar: 'قائمة القطاعات' },
        titleForm: { fr: 'Secteur', en: 'Territory', ar: 'القطاع' },
        breadcrumb: ['Configuration'],
        fields: [
            { field: 'no', label: { fr: 'N°', en: 'No', ar: 'الرقم' }, showList: true, showCard: true, type: 'String', tooltip: { fr: '', en: '', ar: '' }, tab: 1 },
            { field: 'name', label: { fr: 'Nom', en: 'Name', ar: 'الاسم' }, showList: true, showCard: true, type: 'String', tooltip: { fr: '', en: '', ar: '' }, tab: 1 },
            ...auditFields
        ]
    },

    // ========================================
    // SETUP MODULE ENTITIES
    // ========================================
    GeneralLedgerSetup: {
        apiURI: 'general_ledger_setup',
        titleList: { fr: 'Configuration Grand Livre', en: 'General Ledger Setup', ar: 'إعدادات دفتر الأستاذ' },
        titleForm: { fr: 'Configuration Grand Livre', en: 'General Ledger Setup', ar: 'إعداد دفتر الأستاذ' },
        breadcrumb: ['Finance'],
        fields: [
            { field: 'allowPostingFrom', label: { fr: 'Début période validation', en: 'Allow Posting From', ar: 'بداية فترة التحقق' }, showCard: true, type: 'Date', tooltip: { fr: '', en: '', ar: '' }, tab: 1 },
            { field: 'allowPostingTo', label: { fr: 'Fin période validation', en: 'Allow Posting To', ar: 'نهاية فترة التحقق' }, showCard: true, type: 'Date', tooltip: { fr: '', en: '', ar: '' }, tab: 1 },
            { field: 'inventoryRoundingPrecision', label: { fr: 'Précision arrondi stock', en: 'Inventory Rounding Precision', ar: 'دقة تقريب المخزون' }, showCard: true, type: 'Number', tooltip: { fr: '', en: '', ar: '' }, tab: 1 },
            { field: 'stampDutyAmount', label: { fr: 'Montant timbre', en: 'Stamp Duty Amount', ar: 'مبلغ الطابع' }, showCard: true, type: 'Number', tooltip: { fr: '', en: '', ar: '' }, tab: 1 },
            { field: 'lcyNo', label: { fr: 'N° devise locale', en: 'LCY No', ar: 'رقم العملة المحلية' }, showCard: true, type: 'Lookup', lookupEntity: 'Currency', tooltip: { fr: '', en: '', ar: '' }, tab: 1 },
            { field: 'salesStampDutyAccountNo', label: { fr: 'Compte timbre vente', en: 'Sales Stamp Duty Account', ar: 'حساب طابع البيع' }, showCard: true, type: 'Lookup', lookupEntity: 'GeneralLedgerAccount', tooltip: { fr: '', en: '', ar: '' }, tab: 1 },
            { field: 'purchaseStampDutyAccounNot', label: { fr: 'Compte timbre achat', en: 'Purchase Stamp Duty Account', ar: 'حساب طابع الشراء' }, showCard: true, type: 'Lookup', lookupEntity: 'GeneralLedgerAccount', tooltip: { fr: '', en: '', ar: '' }, tab: 1 },
            ...auditFields
        ]
    },
    // ========================================
    // INVENTORY MODULE ENTITIES
    // ========================================
    InventorySetup: {
        apiURI: 'inventory_setup',
        titleList: { fr: 'Configuration Stock', en: 'Inventory Setup', ar: 'إعدادات المخزون' },
        titleForm: { fr: 'Configuration Stock', en: 'Inventory Setup', ar: 'إعدادات المخزون' },
        breadcrumb: ['Stock'],
        tabs: [
            { id: 1, title: { fr: 'Général', en: 'General', ar: 'عام' }, open: true },
            { id: 2, title: { fr: 'Séries de numéros', en: 'Number Series', ar: 'سلاسل الأرقام' }, open: false },
            { id: 3, title: { fr: 'Classification ABC', en: 'ABC Classification', ar: 'تصنيف ABC' }, open: false }
        ],
        fields: [
            { field: 'isLocationMondatory', label: { fr: 'Magasin Obligatoire', en: 'Location Mandatory', ar: 'الموقع إلزامي' }, showCard: true, type: 'Boolean', tooltip: { fr: '', en: '', ar: '' }, tab: 1 },
            { field: 'automaticCostAdjustment', label: { fr: 'Ajustement coût automatique', en: 'Automatic Cost Adjustment', ar: 'تعديل التكلفة التلقائي' }, showCard: true, type: 'Dropdown', tooltip: { fr: '', en: '', ar: '' }, tab: 1 },
            { field: 'avoidNegativeStock', label: { fr: 'Éviter stock négatif', en: 'Avoid Negative Stock', ar: 'تجنب المخزون السلبي' }, showCard: true, type: 'Boolean', tooltip: { fr: '', en: '', ar: '' }, tab: 1 },
            { field: 'defaultStockEvaluationMode', label: { fr: 'Mode évaluation stock par défaut', en: 'Default Stock Evaluation Mode', ar: 'وضع تقييم المخزون الافتراضي' }, showCard: true, type: 'Dropdown', tooltip: { fr: '', en: '', ar: '' }, tab: 1 },
            { field: 'averageCostPeriod', label: { fr: 'Période coût moyen', en: 'Average Cost Period', ar: 'فترة التكلفة المتوسطة' }, showCard: true, type: 'Dropdown', tooltip: { fr: '', en: '', ar: '' }, tab: 1 },
            { field: 'itemNoGenerator', label: { fr: 'Générateur N° article', en: 'Item No Generator', ar: 'مولد رقم الصنف' }, showCard: true, type: 'Boolean', tooltip: { fr: '', en: '', ar: '' }, tab: 1 },
            { field: 'itemNo', label: { fr: 'N° article', en: 'Item No', ar: 'رقم الصنف' }, showCard: true, type: 'Lookup', lookupEntity: 'SeriesHeader', tooltip: { fr: '', en: '', ar: '' }, tab: 2 },
            { field: 'transferOrderNo', label: { fr: 'N° ordre transfert', en: 'Transfer Order No', ar: 'رقم أمر النقل' }, showCard: true, type: 'Lookup', lookupEntity: 'SeriesHeader', tooltip: { fr: '', en: '', ar: '' }, tab: 2 },
            { field: 'registeredTransferShipmentNo', label: { fr: 'N° expédition transfert enregistrée', en: 'Registered Transfer Shipment No', ar: 'رقم شحنة النقل المسجلة' }, showCard: true, type: 'Lookup', lookupEntity: 'SeriesHeader', tooltip: { fr: '', en: '', ar: '' }, tab: 2 },
            { field: 'registeredTransferReceiptNo', label: { fr: 'N° réception transfert enregistrée', en: 'Registered Transfer Receipt No', ar: 'رقم استلام النقل المسجل' }, showCard: true, type: 'Lookup', lookupEntity: 'SeriesHeader', tooltip: { fr: '', en: '', ar: '' }, tab: 2 },
            { field: 'inventoryNo', label: { fr: 'N° inventaire', en: 'Inventory No', ar: 'رقم المخزون' }, showCard: true, type: 'Lookup', lookupEntity: 'SeriesHeader', tooltip: { fr: '', en: '', ar: '' }, tab: 2 },
            { field: 'numberOfDaysABCClassification', label: { fr: 'Nombre de jours classification ABC', en: 'Number of Days ABC Classification', ar: 'عدد أيام تصنيف ABC' }, showCard: true, type: 'Number', tooltip: { fr: '', en: '', ar: '' }, tab: 3 },
            { field: 'numberOfDaysCBNCalculation', label: { fr: 'Nombre de jours calcul CBN', en: 'Number of Days CBN Calculation', ar: 'عدد أيام حساب CBN' }, showCard: true, type: 'Number', tooltip: { fr: '', en: '', ar: '' }, tab: 3 },
            { field: 'percentClassA', label: { fr: '% Classe A', en: '% Class A', ar: '% الفئة أ' }, showCard: true, type: 'Number', tooltip: { fr: '', en: '', ar: '' }, tab: 3 },
            { field: 'percentClassB', label: { fr: '% Classe B', en: '% Class B', ar: '% الفئة ب' }, showCard: true, type: 'Number', tooltip: { fr: '', en: '', ar: '' }, tab: 3 },
            { field: 'percentClassC', label: { fr: '% Classe C', en: '% Class C', ar: '% الفئة ج' }, showCard: true, type: 'Number', tooltip: { fr: '', en: '', ar: '' }, tab: 3 },
            ...auditFields
        ]
    },

    SalesSetup: {
        apiURI: 'sales_setup',
        titleList: { fr: 'Configuration Ventes', en: 'Sales Setup', ar: 'إعدادات المبيعات' },
        titleForm: { fr: 'Configuration Ventes', en: 'Sales Setup', ar: 'إعدادات المبيعات' },
        breadcrumb: ['Ventes'],
        tabs: [
            { id: 1, title: { fr: 'Général', en: 'General', ar: 'عام' }, open: true },
            { id: 2, title: { fr: 'Séries de numéros', en: 'Number Series', ar: 'سلاسل الأرقام' }, open: false },
            { id: 3, title: { fr: 'Archivage', en: 'Archiving', ar: 'الأرشفة' }, open: false }
        ],
        fields: [
            { field: 'creditAlert', label: { fr: 'Alerte crédit', en: 'Credit Alert', ar: 'تنبيه الائتمان' }, showCard: true, type: 'Boolean', tooltip: { fr: '', en: '', ar: '' }, tab: 1 },
            { field: 'outOfStockAlert', label: { fr: 'Alerte rupture stock', en: 'Out of Stock Alert', ar: 'تنبيه نفاد المخزون' }, showCard: true, type: 'Boolean', tooltip: { fr: '', en: '', ar: '' }, tab: 1 },
            { field: 'mandatoryExtDocNo', label: { fr: 'N° doc externe obligatoire', en: 'Mandatory External Doc No', ar: 'رقم المستند الخارجي إلزامي' }, showCard: true, type: 'Boolean', tooltip: { fr: '', en: '', ar: '' }, tab: 1 },
            { field: 'calculateInvoiceDiscount', label: { fr: 'Calculer remise facture', en: 'Calculate Invoice Discount', ar: 'حساب خصم الفاتورة' }, showCard: true, type: 'Boolean', tooltip: { fr: '', en: '', ar: '' }, tab: 1 },
            { field: 'allowVATDifference', label: { fr: 'Autoriser différence TVA', en: 'Allow VAT Difference', ar: 'السماح باختلاف الضريبة' }, showCard: true, type: 'Boolean', tooltip: { fr: '', en: '', ar: '' }, tab: 1 },
            { field: 'defaultAccountingDate', label: { fr: 'Date comptable par défaut', en: 'Default Accounting Date', ar: 'التاريخ المحاسبي الافتراضي' }, showCard: true, type: 'Dropdown', tooltip: { fr: '', en: '', ar: '' }, tab: 1 },
            { field: 'defaultQuantityToShip', label: { fr: 'Quantité à expédier par défaut', en: 'Default Quantity To Ship', ar: 'الكمية المراد شحنها افتراضياً' }, showCard: true, type: 'Dropdown', tooltip: { fr: '', en: '', ar: '' }, tab: 1 },
            { field: 'customerNo', label: { fr: 'N° client', en: 'Customer No', ar: 'رقم العميل' }, showCard: true, type: 'Lookup', lookupEntity: 'SeriesHeader', tooltip: { fr: '', en: '', ar: '' }, tab: 2 },
            { field: 'currencyNo', label: { fr: 'N° devise', en: 'Currency No', ar: 'رقم العملة' }, showCard: true, type: 'Lookup', lookupEntity: 'SeriesHeader', tooltip: { fr: '', en: '', ar: '' }, tab: 2 },
            { field: 'orderNo', label: { fr: 'N° commande', en: 'Order No', ar: 'رقم الطلب' }, showCard: true, type: 'Lookup', lookupEntity: 'SeriesHeader', tooltip: { fr: '', en: '', ar: '' }, tab: 2 },
            { field: 'invoiceNo', label: { fr: 'N° facture', en: 'Invoice No', ar: 'رقم الفاتورة' }, showCard: true, type: 'Lookup', lookupEntity: 'SeriesHeader', tooltip: { fr: '', en: '', ar: '' }, tab: 2 },
            { field: 'registeredInvoiceNo', label: { fr: 'N° facture enregistrée', en: 'Registered Invoice No', ar: 'رقم الفاتورة المسجلة' }, showCard: true, type: 'Lookup', lookupEntity: 'SeriesHeader', tooltip: { fr: '', en: '', ar: '' }, tab: 2 },
            { field: 'creditMemoNo', label: { fr: 'N° avoir', en: 'Credit Memo No', ar: 'رقم مذكرة الائتمان' }, showCard: true, type: 'Lookup', lookupEntity: 'SeriesHeader', tooltip: { fr: '', en: '', ar: '' }, tab: 2 },
            { field: 'registredCreditMemoNo', label: { fr: 'N° avoir enregistré', en: 'Registered Credit Memo No', ar: 'رقم مذكرة الائتمان المسجلة' }, showCard: true, type: 'Lookup', lookupEntity: 'SeriesHeader', tooltip: { fr: '', en: '', ar: '' }, tab: 2 },
            { field: 'registeredShipmentNo', label: { fr: 'N° expédition enregistrée', en: 'Registered Shipment No', ar: 'رقم الشحنة المسجلة' }, showCard: true, type: 'Lookup', lookupEntity: 'SeriesHeader', tooltip: { fr: '', en: '', ar: '' }, tab: 2 },
            { field: 'openOrderNo', label: { fr: 'N° commande ouverte', en: 'Open Order No', ar: 'رقم الطلب المفتوح' }, showCard: true, type: 'Lookup', lookupEntity: 'SeriesHeader', tooltip: { fr: '', en: '', ar: '' }, tab: 2 },
            { field: 'returnNo', label: { fr: 'N° retour', en: 'Return No', ar: 'رقم الإرجاع' }, showCard: true, type: 'Lookup', lookupEntity: 'SeriesHeader', tooltip: { fr: '', en: '', ar: '' }, tab: 2 },
            { field: 'registeredReturnReceiptNo', label: { fr: 'N° réception retour enregistrée', en: 'Registered Return Receipt No', ar: 'رقم استلام الإرجاع المسجل' }, showCard: true, type: 'Lookup', lookupEntity: 'SeriesHeader', tooltip: { fr: '', en: '', ar: '' }, tab: 2 },
            { field: 'archiveCurrencies', label: { fr: 'Archiver devises', en: 'Archive Currencies', ar: 'أرشفة العملات' }, showCard: true, type: 'Boolean', tooltip: { fr: '', en: '', ar: '' }, tab: 3 },
            { field: 'archiveOrders', label: { fr: 'Archiver commandes', en: 'Archive Orders', ar: 'أرشفة الطلبات' }, showCard: true, type: 'Boolean', tooltip: { fr: '', en: '', ar: '' }, tab: 3 },
            { field: 'archiveOpenOrders', label: { fr: 'Archiver commandes ouvertes', en: 'Archive Open Orders', ar: 'أرشفة الطلبات المفتوحة' }, showCard: true, type: 'Boolean', tooltip: { fr: '', en: '', ar: '' }, tab: 3 },
            { field: 'archiveReturns', label: { fr: 'Archiver retours', en: 'Archive Returns', ar: 'أرشفة الإرجاعات' }, showCard: true, type: 'Boolean', tooltip: { fr: '', en: '', ar: '' }, tab: 3 },
            ...auditFields
        ]
    },

    ItemVariants: {
        apiURI: 'item_variants',
        titleList: { fr: 'Liste des variantes d\'articles', en: 'Item Variants List', ar: 'قائمة متغيرات الأصناف' },
        titleForm: { fr: 'Variante d\'article', en: 'Item Variant', ar: 'متغير الصنف' },
        breadcrumb: ['Stock'],
        fields: [
            ...defaultFields.noDescription,
            { field: 'itemNo', label: { fr: 'N° article', en: 'Item No', ar: 'رقم الصنف' }, showList: true, showCard: true, type: 'Lookup', lookupEntity: 'Item', tooltip: { fr: '', en: '', ar: '' }, tab: 1 },
            ...auditFields
        ]
    },

    ItemUnitOfMeasure: {
        apiURI: 'item_unit_of_measure',
        titleList: { fr: 'Liste des unités de mesure d\'articles', en: 'Item Unit Of Measure List', ar: 'قائمة وحدات قياس الأصناف' },
        titleForm: { fr: 'Unité de mesure d\'article', en: 'Item Unit Of Measure', ar: 'وحدة قياس الصنف' },
        breadcrumb: ['Stock'],
        fields: [
            ...defaultFields.noDescription,
            { field: 'qtyPerUnitOfMeasure', label: { fr: 'Quantité par unité de mesure', en: 'Qty Per Unit Of Measure', ar: 'الكمية لكل وحدة قياس' }, showList: true, showCard: true, type: 'Number', tooltip: { fr: '', en: '', ar: '' }, tab: 1 },
            ...auditFields
        ]
    },

    ItemTrackingCode: {
        apiURI: 'item_tracking_code',
        titleList: { fr: 'Liste des codes de suivi d\'articles', en: 'Item Tracking Code List', ar: 'قائمة رموز تتبع الأصناف' },
        titleForm: { fr: 'Code de suivi d\'article', en: 'Item Tracking Code', ar: 'رمز تتبع الصنف' },
        breadcrumb: ['Stock'],
        fields: [
            ...defaultFields.noDescription,
            { field: 'strictExpirationPosting', label: { fr: 'Validation expiration stricte', en: 'Strict Expiration Posting', ar: 'التحقق الصارم من انتهاء الصلاحية' }, showList: true, showCard: true, type: 'Boolean', tooltip: { fr: '', en: '', ar: '' }, tab: 1 },
            ...auditFields
        ]
    },

    ItemSubFamily: {
        apiURI: 'item_sub_family',
        titleList: { fr: 'Liste des sous-familles d\'articles', en: 'Item Sub Family List', ar: 'قائمة العائلات الفرعية للأصناف' },
        titleForm: { fr: 'Sous-famille d\'article', en: 'Item Sub Family', ar: 'العائلة الفرعية للصنف' },
        breadcrumb: ['Stock'],
        fields: [
            ...defaultFields.noDescription,
            { field: 'familyNo', label: { fr: 'N° famille', en: 'Family No', ar: 'رقم العائلة' }, showList: true, showCard: true, type: 'Lookup', lookupEntity: 'ItemFamily', tooltip: { fr: '', en: '', ar: '' }, tab: 1 },
            ...auditFields
        ]
    },

    ItemFamily: {
        apiURI: 'item_family',
        titleList: { fr: 'Liste des familles d\'articles', en: 'Item Family List', ar: 'قائمة عائلات الأصناف' },
        titleForm: { fr: 'Famille d\'article', en: 'Item Family', ar: 'عائلة الصنف' },
        breadcrumb: ['Stock'],
        fields: [...defaultFields.noDescription, ...auditFields]
    },

    ItemDiscountGroup: {
        apiURI: 'item_discount_group',
        titleList: { fr: 'Liste des groupes de remise d\'articles', en: 'Item Discount Group List', ar: 'قائمة مجموعات خصم الأصناف' },
        titleForm: { fr: 'Groupe de remise d\'article', en: 'Item Discount Group', ar: 'مجموعة خصم الصنف' },
        breadcrumb: ['Stock'],
        fields: [...defaultFields.noDescription, ...auditFields]
    },

    Item: {
        apiURI: 'item',
        titleList: { fr: 'Liste des articles', en: 'Item List', ar: 'قائمة الأصناف' },
        titleForm: { fr: 'Article', en: 'Item', ar: 'الصنف' },
        breadcrumb: ['Stock'],
        tabs: [
            { id: 1, title: { fr: 'Général', en: 'General', ar: 'عام' }, open: true },
            { id: 2, title: { fr: 'Prix et coûts', en: 'Pricing & Costs', ar: 'التسعير والتكاليف' }, open: false },
            { id: 3, title: { fr: 'Stock', en: 'Inventory', ar: 'المخزون' }, open: false },
            { id: 4, title: { fr: 'Dimensions', en: 'Dimensions', ar: 'الأبعاد' }, open: false },
            { id: 5, title: { fr: 'Fiscal', en: 'Tax', ar: 'الضريبي' }, open: false }
        ],
        fields: [
            ...defaultFields.noDescription,
            { field: 'description2', label: { fr: 'Description 2', en: 'Description 2', ar: 'الوصف 2' }, showList: false, showCard: true, type: 'String', tooltip: { fr: '', en: '', ar: '' }, tab: 1 },
            { field: 'baseUnitOfMeasureNo', label: { fr: 'Unité de base', en: 'Base Unit Of Measure', ar: 'الوحدة الأساسية' }, showList: false, showCard: true, type: 'Lookup', lookupEntity: 'UnitOfMeasure', tooltip: { fr: '', en: '', ar: '' }, tab: 1 },
            { field: 'type', label: { fr: 'Type', en: 'Type', ar: 'النوع' }, showList: true, showCard: true, type: 'Dropdown', tooltip: { fr: '', en: '', ar: '' }, tab: 1 },
            { field: 'inventoryPostingGroupNo', label: { fr: 'Groupe compta. stock', en: 'Inventory Posting Group', ar: 'مجموعة محاسبة المخزون' }, showList: false, showCard: true, type: 'Lookup', lookupEntity: 'InventoryPostingGroup', tooltip: { fr: '', en: '', ar: '' }, tab: 1 },
            { field: 'itemDiscountGroupNo', label: { fr: 'Groupe remise article', en: 'Item Discount Group', ar: 'مجموعة خصم الصنف' }, showList: false, showCard: true, type: 'Lookup', lookupEntity: 'ItemDiscountGroup', tooltip: { fr: '', en: '', ar: '' }, tab: 1 },
            { field: 'allowInvoiceDisc', label: { fr: 'Autoriser remise facture', en: 'Allow Invoice Discount', ar: 'السماح بخصم الفاتورة' }, showList: false, showCard: true, type: 'Boolean', tooltip: { fr: '', en: '', ar: '' }, tab: 2 },
            { field: 'unitPrice', label: { fr: 'Prix unitaire', en: 'Unit Price', ar: 'السعر الوحدة' }, showList: true, showCard: true, type: 'Number', tooltip: { fr: '', en: '', ar: '' }, tab: 2 },
            { field: 'priceProfitCalculation', label: { fr: 'Calcul prix/bénéfice', en: 'Price Profit Calculation', ar: 'حساب السعر/الربح' }, showList: false, showCard: true, type: 'Dropdown', tooltip: { fr: '', en: '', ar: '' }, tab: 2 },
            { field: 'profitPercent', label: { fr: '% Bénéfice', en: 'Profit %', ar: '% الربح' }, showList: false, showCard: true, type: 'Number', tooltip: { fr: '', en: '', ar: '' }, tab: 2 },
            { field: 'costingMethod', label: { fr: 'Méthode de coût', en: 'Costing Method', ar: 'طريقة التكلفة' }, showList: false, showCard: true, type: 'Dropdown', tooltip: { fr: '', en: '', ar: '' }, tab: 2 },
            { field: 'unitCost', label: { fr: 'Coût unitaire', en: 'Unit Cost', ar: 'تكلفة الوحدة' }, showList: false, showCard: true, type: 'Number', tooltip: { fr: '', en: '', ar: '' }, tab: 2 },
            { field: 'standardCost', label: { fr: 'Coût standard', en: 'Standard Cost', ar: 'التكلفة المعيارية' }, showList: false, showCard: true, type: 'Number', tooltip: { fr: '', en: '', ar: '' }, tab: 2 },
            { field: 'lastDirectCost', label: { fr: 'Dernier coût direct', en: 'Last Direct Cost', ar: 'آخر تكلفة مباشرة' }, showList: false, showCard: true, type: 'Number', tooltip: { fr: '', en: '', ar: '' }, tab: 2 },
            { field: 'directNetUnitCost', label: { fr: 'Coût net unitaire direct', en: 'Direct Net Unit Cost', ar: 'التكلفة الصافية المباشرة للوحدة' }, showList: false, showCard: true, type: 'Number', tooltip: { fr: '', en: '', ar: '' }, tab: 2 },
            { field: 'indirectCostPercent', label: { fr: '% Coût indirect', en: 'Indirect Cost %', ar: '% التكلفة غير المباشرة' }, showList: false, showCard: true, type: 'Number', tooltip: { fr: '', en: '', ar: '' }, tab: 2 },
            { field: 'costIsAdjusted', label: { fr: 'Coût ajusté', en: 'Cost Is Adjusted', ar: 'التكلفة معدلة' }, showList: false, showCard: true, type: 'Boolean', tooltip: { fr: '', en: '', ar: '' }, tab: 2 },
            { field: 'vendorNo', label: { fr: 'N° fournisseur', en: 'Vendor No', ar: 'رقم المورد' }, showList: false, showCard: true, type: 'Lookup', lookupEntity: 'Vendor', tooltip: { fr: '', en: '', ar: '' }, tab: 3 },
            { field: 'vendorName', label: { fr: 'Nom fournisseur', en: 'Vendor Name', ar: 'اسم المورد' }, showList: false, showCard: true, type: 'String', tooltip: { fr: '', en: '', ar: '' }, tab: 3 },
            { field: 'maximumInventory', label: { fr: 'Stock maximum', en: 'Maximum Inventory', ar: 'الحد الأقصى للمخزون' }, showList: false, showCard: true, type: 'Number', tooltip: { fr: '', en: '', ar: '' }, tab: 3 },
            { field: 'reorderQuantity', label: { fr: 'Quantité réapprovisionnement', en: 'Reorder Quantity', ar: 'كمية إعادة الطلب' }, showList: false, showCard: true, type: 'Number', tooltip: { fr: '', en: '', ar: '' }, tab: 3 },
            { field: 'grossWeight', label: { fr: 'Poids brut', en: 'Gross Weight', ar: 'الوزن الإجمالي' }, showList: false, showCard: true, type: 'Number', tooltip: { fr: '', en: '', ar: '' }, tab: 3 },
            { field: 'netWeight', label: { fr: 'Poids net', en: 'Net Weight', ar: 'الوزن الصافي' }, showList: false, showCard: true, type: 'Number', tooltip: { fr: '', en: '', ar: '' }, tab: 3 },
            { field: 'unitsPerParcel', label: { fr: 'Unités par colis', en: 'Units Per Parcel', ar: 'الوحدات لكل طرد' }, showList: false, showCard: true, type: 'Number', tooltip: { fr: '', en: '', ar: '' }, tab: 3 },
            { field: 'unitVolume', label: { fr: 'Volume unitaire', en: 'Unit Volume', ar: 'حجم الوحدة' }, showList: false, showCard: true, type: 'Number', tooltip: { fr: '', en: '', ar: '' }, tab: 3 },
            { field: 'blocked', label: { fr: 'Bloqué', en: 'Blocked', ar: 'محظور' }, showList: false, showCard: true, type: 'Boolean', tooltip: { fr: '', en: '', ar: '' }, tab: 3 },
            { field: 'blockReason', label: { fr: 'Raison blocage', en: 'Block Reason', ar: 'سبب الحظر' }, showList: false, showCard: true, type: 'String', tooltip: { fr: '', en: '', ar: '' }, tab: 3 },
            { field: 'inventory', label: { fr: 'Stock', en: 'Inventory', ar: 'المخزون' }, showList: true, showCard: true, type: 'Number', tooltip: { fr: '', en: '', ar: '' }, tab: 3 },
            { field: 'priceIncludesVAT', label: { fr: 'Prix TTC', en: 'Price Includes VAT', ar: 'السعر شامل الضريبة' }, showList: false, showCard: true, type: 'Boolean', tooltip: { fr: '', en: '', ar: '' }, tab: 4 },
            { field: 'genProdPostingGroupNo', label: { fr: 'Groupe compta. produit', en: 'Gen. Product Posting Group', ar: 'مجموعة محاسبة المنتج' }, showList: false, showCard: true, type: 'Lookup', lookupEntity: 'GeneralProductPostingGroup', tooltip: { fr: '', en: '', ar: '' }, tab: 4 },
            { field: 'seriesHeaderNo', label: { fr: 'Souches de n°', en: 'No. Series', ar: 'سلسلة الأرقام' }, showList: false, showCard: true, type: 'Lookup', lookupEntity: 'SeriesHeader', tooltip: { fr: '', en: '', ar: '' }, tab: 4 },
            { field: 'vatProdPostingGroupNo', label: { fr: 'Groupe compta. produit TVA', en: 'VAT Product Posting Group', ar: 'مجموعة محاسبة منتج الضريبة' }, showList: false, showCard: true, type: 'Lookup', lookupEntity: 'VatProductPostingGroup', tooltip: { fr: '', en: '', ar: '' }, tab: 4 },
            { field: 'globalDimension1Code', label: { fr: 'Code axe principal 1', en: 'Global Dimension 1', ar: 'البعد العام 1' }, showList: false, showCard: true, type: 'String', tooltip: { fr: '', en: '', ar: '' }, tab: 4 },
            { field: 'globalDimension2Code', label: { fr: 'Code axe principal 2', en: 'Global Dimension 2', ar: 'البعد العام 2' }, showList: false, showCard: true, type: 'String', tooltip: { fr: '', en: '', ar: '' }, tab: 4 },
            { field: 'stockoutWarning', label: { fr: 'Avertissement rupture', en: 'Stockout Warning', ar: 'تحذير نفاد المخزون' }, showList: false, showCard: true, type: 'Dropdown', tooltip: { fr: '', en: '', ar: '' }, tab: 3 },
            { field: 'preventNegativeInventory', label: { fr: 'Prévenir stock négatif', en: 'Prevent Negative Inventory', ar: 'منع المخزون السلبي' }, showList: false, showCard: true, type: 'Dropdown', tooltip: { fr: '', en: '', ar: '' }, tab: 3 },
            { field: 'replenishmentSystem', label: { fr: 'Système réapprovisionnement', en: 'Replenishment System', ar: 'نظام إعادة التموين' }, showList: false, showCard: true, type: 'Dropdown', tooltip: { fr: '', en: '', ar: '' }, tab: 3 },
            { field: 'salesUnitOfMeasureNo', label: { fr: 'Unité vente', en: 'Sales Unit Of Measure', ar: 'وحدة البيع' }, showList: false, showCard: true, type: 'Lookup', lookupEntity: 'UnitOfMeasure', tooltip: { fr: '', en: '', ar: '' }, tab: 3 },
            { field: 'purchUnitOfMeasureNo', label: { fr: 'Unité achat', en: 'Purchase Unit Of Measure', ar: 'وحدة الشراء' }, showList: false, showCard: true, type: 'Lookup', lookupEntity: 'UnitOfMeasure', tooltip: { fr: '', en: '', ar: '' }, tab: 3 },
            { field: 'expirationCalculation', label: { fr: 'Calcul expiration', en: 'Expiration Calculation', ar: 'حساب انتهاء الصلاحية' }, showList: false, showCard: true, type: 'String', tooltip: { fr: '', en: '', ar: '' }, tab: 5 },
            { field: 'submittedToFODEC', label: { fr: 'Soumis FODEC', en: 'Submitted To FODEC', ar: 'مقدم لـ FODEC' }, showList: false, showCard: true, type: 'Boolean', tooltip: { fr: '', en: '', ar: '' }, tab: 5 },
            { field: 'submittedToIRPP', label: { fr: 'Soumis IRPP', en: 'Submitted To IRPP', ar: 'مقدم لـ IRPP' }, showList: false, showCard: true, type: 'Boolean', tooltip: { fr: '', en: '', ar: '' }, tab: 5 },
            { field: 'submittedToTL', label: { fr: 'Soumis TL', en: 'Submitted To TL', ar: 'مقدم لـ TL' }, showList: false, showCard: true, type: 'Boolean', tooltip: { fr: '', en: '', ar: '' }, tab: 5 },
            { field: 'taxLowPercent', label: { fr: '% Taxe faible', en: 'Tax Low %', ar: '% الضريبة المنخفضة' }, showList: false, showCard: true, type: 'Number', tooltip: { fr: '', en: '', ar: '' }, tab: 5 },
            { field: 'familyNo', label: { fr: 'N° famille', en: 'Family No', ar: 'رقم العائلة' }, showList: false, showCard: true, type: 'Lookup', lookupEntity: 'ItemFamily', tooltip: { fr: '', en: '', ar: '' }, tab: 1 },
            { field: 'subfamilyNo', label: { fr: 'N° sous-famille', en: 'Subfamily No', ar: 'رقم العائلة الفرعية' }, showList: false, showCard: true, type: 'Lookup', lookupEntity: 'ItemSubFamily', tooltip: { fr: '', en: '', ar: '' }, tab: 1 },
            ...auditFields
        ]
    },

    InventoryPostingSetup: {
        apiURI: 'inventory_posting_setup',
        titleList: { fr: 'Liste des paramètres compta. stock', en: 'Inventory Posting Setup List', ar: 'قائمة إعدادات محاسبة المخزون' },
        titleForm: { fr: 'Paramètre compta. stock', en: 'Inventory Posting Setup', ar: 'إعداد محاسبة المخزون' },
        breadcrumb: ['Stock'],
        fields: [
            { field: 'locationNo', label: { fr: 'N° magasin', en: 'Location No', ar: 'رقم الموقع' }, showList: true, showCard: true, type: 'Lookup', lookupEntity: 'Location', tooltip: { fr: '', en: '', ar: '' }, tab: 1 },
            { field: 'invtPostingGroupNo', label: { fr: 'Groupe compta. stock', en: 'Inventory Posting Group', ar: 'مجموعة محاسبة المخزون' }, showList: true, showCard: true, type: 'Lookup', lookupEntity: 'InventoryPostingGroup', tooltip: { fr: '', en: '', ar: '' }, tab: 1 },
            { field: 'inventoryAccountNo', label: { fr: 'Compte stock', en: 'Inventory Account', ar: 'حساب المخزون' }, showList: true, showCard: true, type: 'Lookup', lookupEntity: 'GeneralLedgerAccount', tooltip: { fr: '', en: '', ar: '' }, tab: 1 },
            ...auditFields
        ]
    },

    InventoryPostingGroup: {
        apiURI: 'inventory_posting_group',
        titleList: { fr: 'Liste des groupes compta. stock', en: 'Inventory Posting Group List', ar: 'قائمة مجموعات محاسبة المخزون' },
        titleForm: { fr: 'Groupe compta. stock', en: 'Inventory Posting Group', ar: 'مجموعة محاسبة المخزون' },
        breadcrumb: ['Stock'],
        fields: [...defaultFields.noDescription, ...auditFields]
    },

    GeneralProductPostingGroup: {
        apiURI: 'general_product_posting_group',
        titleList: { fr: 'Liste des groupes compta. produit', en: 'General Product Posting Group List', ar: 'قائمة مجموعات محاسبة المنتج' },
        titleForm: { fr: 'Groupe compta. produit', en: 'General Product Posting Group', ar: 'مجموعة محاسبة المنتج' },
        breadcrumb: ['Finance'],
        fields: [
            ...defaultFields.noDescription,
            { field: 'defVatProdPostingGroupNo', label: { fr: 'Groupe compta. produit TVA par défaut', en: 'Default VAT Product Posting Group', ar: 'مجموعة محاسبة منتج الضريبة الافتراضية' }, showList: false, showCard: true, type: 'Lookup', lookupEntity: 'VatProductPostingGroup', tooltip: { fr: '', en: '', ar: '' }, tab: 1 },
            ...auditFields
        ]
    },

    GeneralPostingSetup: {
        apiURI: 'general_posting_setup',
        titleList: { fr: 'Liste des paramètres compta. généraux', en: 'General Posting Setup List', ar: 'قائمة إعدادات المحاسبة العامة' },
        titleForm: { fr: 'Paramètre compta. général', en: 'General Posting Setup', ar: 'إعداد المحاسبة العامة' },
        breadcrumb: ['Finance'],
        fields: [
            { field: 'genBusPostingGroupNo', label: { fr: 'Groupe compta. marché', en: 'Gen. Business Posting Group', ar: 'مجموعة محاسبة السوق' }, showList: true, showCard: true, type: 'Lookup', lookupEntity: 'GeneralBusinessPostingGroup', tooltip: { fr: '', en: '', ar: '' }, tab: 1 },
            { field: 'genProdPostingGroupNo', label: { fr: 'Groupe compta. produit', en: 'Gen. Product Posting Group', ar: 'مجموعة محاسبة المنتج' }, showList: true, showCard: true, type: 'Lookup', lookupEntity: 'GeneralProductPostingGroup', tooltip: { fr: '', en: '', ar: '' }, tab: 1 },
            { field: 'salesAccountNo', label: { fr: 'Compte vente', en: 'Sales Account', ar: 'حساب البيع' }, showList: true, showCard: true, type: 'Lookup', lookupEntity: 'GeneralLedgerAccount', tooltip: { fr: '', en: '', ar: '' }, tab: 1 },
            { field: 'purchaseAccountNo', label: { fr: 'Compte achat', en: 'Purchase Account', ar: 'حساب الشراء' }, showList: true, showCard: true, type: 'Lookup', lookupEntity: 'GeneralLedgerAccount', tooltip: { fr: '', en: '', ar: '' }, tab: 1 },
            { field: 'salesCreditMemoAccountNo', label: { fr: 'Compte avoir vente', en: 'Sales Credit Memo Account', ar: 'حساب مذكرة ائتمان البيع' }, showList: true, showCard: true, type: 'Lookup', lookupEntity: 'GeneralLedgerAccount', tooltip: { fr: '', en: '', ar: '' }, tab: 1 },
            { field: 'purchaseCreditMemoAccountNo', label: { fr: 'Compte avoir achat', en: 'Purchase Credit Memo Account', ar: 'حساب مذكرة ائتمان الشراء' }, showList: true, showCard: true, type: 'Lookup', lookupEntity: 'GeneralLedgerAccount', tooltip: { fr: '', en: '', ar: '' }, tab: 1 },
            ...auditFields
        ]
    },

    GeneralLedgerSetup: {
        apiURI: 'general_ledger_setup',
        titleList: { fr: 'Configuration Grand Livre', en: 'General Ledger Setup', ar: 'إعدادات الدفتر العام' },
        titleForm: { fr: 'Configuration Grand Livre', en: 'General Ledger Setup', ar: 'إعداد الدفتر العام' },
        breadcrumb: ['Finance'],
        fields: [
            { field: 'allowPostingFrom', label: { fr: 'Début période validation', en: 'Allow Posting From', ar: 'بداية فترة التحقق' }, showCard: true, type: 'Date', tooltip: { fr: '', en: '', ar: '' }, tab: 1 },
            { field: 'allowPostingTo', label: { fr: 'Fin période validation', en: 'Allow Posting To', ar: 'نهاية فترة التحقق' }, showCard: true, type: 'Date', tooltip: { fr: '', en: '', ar: '' }, tab: 1 },
            { field: 'inventoryRoundingPrecision', label: { fr: 'Précision arrondi stock', en: 'Inventory Rounding Precision', ar: 'دقة تقريب المخزون' }, showCard: true, type: 'Number', tooltip: { fr: '', en: '', ar: '' }, tab: 1 },
            { field: 'stampDutyAmount', label: { fr: 'Montant timbre', en: 'Stamp Duty Amount', ar: 'مبلغ الطابع' }, showCard: true, type: 'Number', tooltip: { fr: '', en: '', ar: '' }, tab: 1 },
            { field: 'lcyNo', label: { fr: 'N° devise locale', en: 'Local Currency No', ar: 'رقم العملة المحلية' }, showCard: true, type: 'Lookup', lookupEntity: 'Currency', tooltip: { fr: '', en: '', ar: '' }, tab: 1 },
            { field: 'salesStampDutyAccountNo', label: { fr: 'Compte timbre vente', en: 'Sales Stamp Duty Account', ar: 'حساب طابع البيع' }, showCard: true, type: 'Lookup', lookupEntity: 'GeneralLedgerAccount', tooltip: { fr: '', en: '', ar: '' }, tab: 1 },
            { field: 'purchaseStampDutyAccounNot', label: { fr: 'Compte timbre achat', en: 'Purchase Stamp Duty Account', ar: 'حساب طابع الشراء' }, showCard: true, type: 'Lookup', lookupEntity: 'GeneralLedgerAccount', tooltip: { fr: '', en: '', ar: '' }, tab: 1 },
            ...auditFields
        ]
    },

    GeneralLedgerAccount: {
        apiURI: 'general_ledger_account',
        titleList: { fr: 'Compte Grand Livre', en: 'General Ledger Account', ar: 'حساب الدفتر العام' },
        titleForm: { fr: 'Compte Grand Livre', en: 'General Ledger Account', ar: 'حساب الدفتر العام' },
        breadcrumb: ['Finance'],
        fields: [
            { field: 'no', label: { fr: 'N°', en: 'No', ar: 'الرقم' }, showList: true, showCard: true, type: 'String', tooltip: { fr: '', en: '', ar: '' }, tab: 1 },
            { field: 'name', label: { fr: 'Nom', en: 'Name', ar: 'الاسم' }, showList: true, showCard: true, type: 'String', tooltip: { fr: '', en: '', ar: '' }, tab: 1 },
            { field: 'accountType', label: { fr: 'Type compte', en: 'Account Type', ar: 'نوع الحساب' }, showList: true, showCard: true, type: 'Dropdown', tooltip: { fr: '', en: '', ar: '' }, tab: 1 },
            { field: 'mainAxisCode1', label: { fr: 'Code axe principal 1', en: 'Main Axis Code 1', ar: 'كود المحور الرئيسي 1' }, showList: true, showCard: true, type: 'String', tooltip: { fr: '', en: '', ar: '' }, tab: 1 },
            { field: 'mainAxisCode2', label: { fr: 'Code axe principal 2', en: 'Main Axis Code 2', ar: 'كود المحور الرئيسي 2' }, showList: true, showCard: true, type: 'String', tooltip: { fr: '', en: '', ar: '' }, tab: 1 },
            { field: 'accountCategory', label: { fr: 'Catégorie du compte', en: 'Account Category', ar: 'فئة الحساب' }, showList: true, showCard: true, type: 'Dropdown', tooltip: { fr: '', en: '', ar: '' }, tab: 1 },
            { field: 'managementOrBalance', label: { fr: 'Gestion/Bilan', en: 'Management/Balance', ar: 'الإدارة/الميزانية' }, showList: true, showCard: true, type: 'Dropdown', tooltip: { fr: '', en: '', ar: '' }, tab: 1 },
            { field: 'debitOrCredit', label: { fr: 'Débit/Crédit', en: 'Debit/Credit', ar: 'الخصم/الائتمان' }, showList: true, showCard: true, type: 'Dropdown', tooltip: { fr: '', en: '', ar: '' }, tab: 1 },
            { field: 'blocked', label: { fr: 'Bloqué', en: 'Blocked', ar: 'محظور' }, showList: true, showCard: true, type: 'Boolean', tooltip: { fr: '', en: '', ar: '' }, tab: 1 },
            { field: 'directImputation', label: { fr: 'Imputation directe', en: 'Direct Imputation', ar: 'الإسناد المباشر' }, showList: true, showCard: true, type: 'Boolean', tooltip: { fr: '', en: '', ar: '' }, tab: 1 },
            { field: 'totalization', label: { fr: 'Totalisation', en: 'Totalization', ar: 'التجميع' }, showList: true, showCard: true, type: 'String', tooltip: { fr: '', en: '', ar: '' }, tab: 1 },
            { field: 'vatBusinessPostingGroupNo', label: { fr: 'Groupe compta. marché TVA', en: 'VAT Business Posting Group', ar: 'مجموعة محاسبة السوق للضريبة' }, showList: false, showCard: true, type: 'Lookup', lookupEntity: 'VatBusinessPostingGroup', tooltip: { fr: '', en: '', ar: '' }, tab: 2 },
            { field: 'vatProductPostingGroupNo', label: { fr: 'Groupe compta. produit TVA', en: 'VAT Product Posting Group', ar: 'مجموعة محاسبة منتج الضريبة' }, showList: false, showCard: true, type: 'Lookup', lookupEntity: 'VatProductPostingGroup', tooltip: { fr: '', en: '', ar: '' }, tab: 2 },
            { field: 'genBusinessPostingGroupNo', label: { fr: 'Groupe compta. marché', en: 'Gen. Business Posting Group', ar: 'مجموعة محاسبة السوق' }, showList: false, showCard: true, type: 'Lookup', lookupEntity: 'GeneralBusinessPostingGroup', tooltip: { fr: '', en: '', ar: '' }, tab: 2 },
            { field: 'genProductPostingGroupNo', label: { fr: 'Groupe compta. produit', en: 'Gen. Product Posting Group', ar: 'مجموعة محاسبة المنتج' }, showList: false, showCard: true, type: 'Lookup', lookupEntity: 'GeneralProductPostingGroup', tooltip: { fr: '', en: '', ar: '' }, tab: 2 },
            ...auditFields
        ]
    },

    GeneralBusinessPostingGroup: {
        apiURI: 'general_business_posting_group',
        titleList: { fr: 'Liste des groupes compta. marché', en: 'General Business Posting Group List', ar: 'قائمة مجموعات محاسبة السوق' },
        titleForm: { fr: 'Groupe compta. marché', en: 'General Business Posting Group', ar: 'مجموعة محاسبة السوق' },
        breadcrumb: ['Finance'],
        fields: [
            ...defaultFields.noDescription,
            { field: 'vatBusinessPostingGroupNo', label: { fr: 'Groupe compta. marché TVA par défaut', en: 'Default VAT Business Posting Group', ar: 'مجموعة محاسبة السوق للضريبة الافتراضية' }, showList: false, showCard: true, type: 'Lookup', lookupEntity: 'VatBusinessPostingGroup', tooltip: { fr: '', en: '', ar: '' }, tab: 1 },
            ...auditFields
        ]
    },

    CustomerPriceGroup: {
        apiURI: 'customer_price_group',
        titleList: { fr: 'Liste des groupes prix client', en: 'Customer Price Group List', ar: 'قائمة مجموعات أسعار العملاء' },
        titleForm: { fr: 'Groupe prix client', en: 'Customer Price Group', ar: 'مجموعة أسعار العميل' },
        breadcrumb: ['Ventes'],
        fields: [...defaultFields.noDescription, ...auditFields]
    },

    CustomerPostingGroup: {
        apiURI: 'customer_posting_group',
        titleList: { fr: 'Liste des groupes compta. client', en: 'Customer Posting Group List', ar: 'قائمة مجموعات محاسبة العملاء' },
        titleForm: { fr: 'Groupe compta. client', en: 'Customer Posting Group', ar: 'مجموعة محاسبة العميل' },
        breadcrumb: ['Ventes'],
        fields: [
            { field: 'no', label: { fr: 'N°', en: 'No', ar: 'الرقم' }, showList: true, showCard: true, type: 'String', tooltip: { fr: '', en: '', ar: '' }, tab: 1 },
            { field: 'receivablesAccount', label: { fr: 'Compte créances', en: 'Receivables Account', ar: 'حساب الذمم المدينة' }, showList: true, showCard: true, type: 'Lookup', lookupEntity: 'GeneralLedgerAccount', tooltip: { fr: '', en: '', ar: '' }, tab: 1 },
            ...auditFields
        ]
    },

    CustomerDiscountGroup: {
        apiURI: 'customer_discount_group',
        titleList: { fr: 'Liste des groupes remise client', en: 'Customer Discount Group List', ar: 'قائمة مجموعات خصم العملاء' },
        titleForm: { fr: 'Groupe remise client', en: 'Customer Discount Group', ar: 'مجموعة خصم العميل' },
        breadcrumb: ['Ventes'],
        fields: [...defaultFields.noDescription, ...auditFields]
    },

    Currency: {
        apiURI: 'currency',
        titleList: { fr: 'Liste des devises', en: 'Currency List', ar: 'قائمة العملات' },
        titleForm: { fr: 'Devise', en: 'Currency', ar: 'العملة' },
        breadcrumb: ['Configuration'],
        fields: [...defaultFields.noDescription, ...auditFields]
    },

    Company: {
        apiURI: 'company',
        titleList: { fr: 'Liste des sociétés', en: 'Company List', ar: 'قائمة الشركات' },
        titleForm: { fr: 'Société', en: 'Company', ar: 'الشركة' },
        breadcrumb: ['Configuration'],
        tabs: [
            { id: 1, title: { fr: 'Général', en: 'General', ar: 'عام' }, open: true },
            { id: 2, title: { fr: 'Contact', en: 'Contact', ar: 'جهة الاتصال' }, open: false },
            { id: 3, title: { fr: 'Juridique', en: 'Legal', ar: 'القانوني' }, open: false }
        ],
        fields: [
            { field: 'name', label: { fr: 'Nom', en: 'Name', ar: 'الاسم' }, showList: true, showCard: true, type: 'String', tooltip: { fr: '', en: '', ar: '' }, tab: 1 },
            { field: 'name2', label: { fr: 'Nom 2', en: 'Name 2', ar: 'الاسم 2' }, showList: false, showCard: true, type: 'String', tooltip: { fr: '', en: '', ar: '' }, tab: 1 },
            { field: 'address', label: { fr: 'Adresse', en: 'Address', ar: 'العنوان' }, showList: false, showCard: true, type: 'String', tooltip: { fr: '', en: '', ar: '' }, tab: 1 },
            { field: 'address2', label: { fr: 'Adresse 2', en: 'Address 2', ar: 'العنوان 2' }, showList: false, showCard: true, type: 'String', tooltip: { fr: '', en: '', ar: '' }, tab: 1 },
            { field: 'postalCode', label: { fr: 'Code postal', en: 'Postal Code', ar: 'الرمز البريدي' }, showList: false, showCard: true, type: 'String', tooltip: { fr: '', en: '', ar: '' }, tab: 1 },
            { field: 'city', label: { fr: 'Ville', en: 'City', ar: 'المدينة' }, showList: false, showCard: true, type: 'String', tooltip: { fr: '', en: '', ar: '' }, tab: 1 },
            { field: 'email', label: { fr: 'E-mail', en: 'E-mail', ar: 'البريد الإلكتروني' }, showList: false, showCard: true, type: 'String', tooltip: { fr: '', en: '', ar: '' }, tab: 2 },
            { field: 'email2', label: { fr: 'E-mail 2', en: 'E-mail 2', ar: 'البريد الإلكتروني 2' }, showList: false, showCard: true, type: 'String', tooltip: { fr: '', en: '', ar: '' }, tab: 2 },
            { field: 'phone', label: { fr: 'Téléphone', en: 'Phone', ar: 'الهاتف' }, showList: false, showCard: true, type: 'String', tooltip: { fr: '', en: '', ar: '' }, tab: 2 },
            { field: 'phone2', label: { fr: 'Téléphone 2', en: 'Phone 2', ar: 'الهاتف 2' }, showList: false, showCard: true, type: 'String', tooltip: { fr: '', en: '', ar: '' }, tab: 2 },
            { field: 'faxNumber', label: { fr: 'N° fax', en: 'Fax Number', ar: 'رقم الفاكس' }, showList: false, showCard: true, type: 'String', tooltip: { fr: '', en: '', ar: '' }, tab: 2 },
            { field: 'taxIdentificationNumber', label: { fr: 'N° identification fiscale', en: 'Tax Identification Number', ar: 'رقم التعريف الضريبي' }, showList: false, showCard: true, type: 'String', tooltip: { fr: '', en: '', ar: '' }, tab: 3 },
            { field: 'commercialRegister', label: { fr: 'Registre du commerce', en: 'Commercial Register', ar: 'سجل التجارة' }, showList: false, showCard: true, type: 'String', tooltip: { fr: '', en: '', ar: '' }, tab: 3 },
            { field: 'legalStatus', label: { fr: 'Statut légal', en: 'Legal Status', ar: 'الحالة القانونية' }, showList: false, showCard: true, type: 'String', tooltip: { fr: '', en: '', ar: '' }, tab: 3 },
            { field: 'capital', label: { fr: 'Capital', en: 'Capital', ar: 'رأس المال' }, showList: false, showCard: true, type: 'Number', tooltip: { fr: '', en: '', ar: '' }, tab: 3 },
            { field: 'manager', label: { fr: 'Gérant', en: 'Manager', ar: 'المدير' }, showList: false, showCard: true, type: 'String', tooltip: { fr: '', en: '', ar: '' }, tab: 3 },
            { field: 'image', label: { fr: 'Image', en: 'Image', ar: 'الصورة' }, showList: false, showCard: true, type: 'String', tooltip: { fr: '', en: '', ar: '' }, tab: 1 },
            { field: 'visa', label: { fr: 'Visa', en: 'Visa', ar: 'التأشيرة' }, showList: false, showCard: true, type: 'String', tooltip: { fr: '', en: '', ar: '' }, tab: 1 },
            ...auditFields
        ]
    },

    // ========================================
    // PURCHASE MODULE ENTITIES
    // ========================================
    VendorPostingGroup: {
        apiURI: 'vendor_posting_group',
        titleList: { fr: 'Liste des groupes compta. fournisseur', en: 'Vendor Posting Group List', ar: 'قائمة مجموعات محاسبة الموردين' },
        titleForm: { fr: 'Groupe compta. fournisseur', en: 'Vendor Posting Group', ar: 'مجموعة محاسبة المورد' },
        breadcrumb: ['Achats'],
        fields: [
            { field: 'no', label: { fr: 'N°', en: 'No', ar: 'الرقم' }, showList: true, showCard: true, type: 'String', tooltip: { fr: '', en: '', ar: '' }, tab: 1 },
            { field: 'payablesAccount', label: { fr: 'Compte fournisseurs', en: 'Payables Account', ar: 'حساب الموردين' }, showList: true, showCard: true, type: 'Lookup', lookupEntity: 'GeneralLedgerAccount', tooltip: { fr: '', en: '', ar: '' }, tab: 1 },
            ...auditFields
        ]
    },

    Vendor: {
        apiURI: 'vendor',
        titleList: { fr: 'Liste des fournisseurs', en: 'Vendor List', ar: 'قائمة الموردين' },
        titleForm: { fr: 'Fiche Fournisseur', en: 'Vendor Card', ar: 'بطاقة المورد' },
        breadcrumb: ['Achats'],
        tabs: [
            { id: 1, title: { fr: 'Général', en: 'General', ar: 'عام' }, open: true },
            { id: 2, title: { fr: 'Comptabilité', en: 'Accounting', ar: 'المحاسبة' }, open: false }
        ],
        fields: [
            ...defaultFields.noName,
            { field: 'name2', label: { fr: 'Nom 2', en: 'Name 2', ar: 'الاسم 2' }, showList: false, showCard: true, type: 'String', tooltip: { fr: '', en: '', ar: '' }, tab: 1 },
            { field: 'address', label: { fr: 'Adresse', en: 'Address', ar: 'العنوان' }, showList: false, showCard: true, type: 'String', tooltip: { fr: '', en: '', ar: '' }, tab: 1 },
            { field: 'contact', label: { fr: 'Contact', en: 'Contact', ar: 'جهة الاتصال' }, showList: false, showCard: true, type: 'String', tooltip: { fr: '', en: '', ar: '' }, tab: 1 },
            { field: 'phoneNo', label: { fr: 'N° téléphone', en: 'Phone No', ar: 'رقم الهاتف' }, showList: true, showCard: true, type: 'String', tooltip: { fr: '', en: '', ar: '' }, tab: 1 },
            { field: 'email', label: { fr: 'Adresse e-mail', en: 'E-mail', ar: 'البريد الإلكتروني' }, showList: true, showCard: true, type: 'String', tooltip: { fr: '', en: '', ar: '' }, tab: 1 },
            { field: 'territoryNo', label: { fr: 'Code secteur', en: 'Territory Code', ar: 'كود القطاع' }, showList: false, showCard: true, type: 'Lookup', lookupEntity: 'Territory', tooltip: { fr: '', en: '', ar: '' }, tab: 1 },
            { field: 'globalDimension1Code', label: { fr: 'Code axe principal 1', en: 'Global Dimension 1', ar: 'البعد العام 1' }, showList: false, showCard: true, type: 'String', tooltip: { fr: '', en: '', ar: '' }, tab: 2 },
            { field: 'globalDimension2Code', label: { fr: 'Code axe principal 2', en: 'Global Dimension 2', ar: 'البعد العام 2' }, showList: false, showCard: true, type: 'String', tooltip: { fr: '', en: '', ar: '' }, tab: 2 },
            { field: 'vendorPostingGroupNo', label: { fr: 'Groupe compta. fournisseur', en: 'Vendor Posting Group', ar: 'مجموعة محاسبة المورد' }, showList: false, showCard: true, type: 'Lookup', lookupEntity: 'VendorPostingGroup', tooltip: { fr: '', en: '', ar: '' }, tab: 2 },
            { field: 'currencyNo', label: { fr: 'Code devise', en: 'Currency Code', ar: 'كود العملة' }, showList: false, showCard: true, type: 'Lookup', lookupEntity: 'Currency', tooltip: { fr: '', en: '', ar: '' }, tab: 2 },
            { field: 'paymentTermsNo', label: { fr: 'Code condition paiement', en: 'Payment Terms', ar: 'شروط الدفع' }, showList: false, showCard: true, type: 'Lookup', lookupEntity: 'PaymentTerms', tooltip: { fr: '', en: '', ar: '' }, tab: 2 },
            { field: 'purchaserNo', label: { fr: 'Code acheteur', en: 'Purchaser Code', ar: 'كود المشتري' }, showList: false, showCard: true, type: 'Lookup', lookupEntity: 'SalesPersonPurchaser', tooltip: { fr: '', en: '', ar: '' }, tab: 2 },
            { field: 'shippingAgentNo', label: { fr: 'Code transporteur', en: 'Shipment Agent', ar: 'وكيل الشحن' }, showList: false, showCard: true, type: 'Lookup', lookupEntity: 'ShipmentAgent', tooltip: { fr: '', en: '', ar: '' }, tab: 2 },
            { field: 'payToVendorNo', label: { fr: 'N° fournisseur à payer', en: 'Pay To Vendor No', ar: 'رقم المورد للدفع' }, showList: false, showCard: true, type: 'Lookup', lookupEntity: 'Vendor', tooltip: { fr: '', en: '', ar: '' }, tab: 2 },
            { field: 'paymentMethodNo', label: { fr: 'Code mode de règlement', en: 'Payment Method', ar: 'طريقة الدفع' }, showList: false, showCard: true, type: 'Lookup', lookupEntity: 'PaymentMethod', tooltip: { fr: '', en: '', ar: '' }, tab: 2 },
            { field: 'balance', label: { fr: 'Solde', en: 'Balance', ar: 'الرصيد' }, showList: true, showCard: true, type: 'Number', tooltip: { fr: '', en: '', ar: '' }, tab: 2 },
            { field: 'balanceLCY', label: { fr: 'Solde DS', en: 'Balance LCY', ar: 'الرصيد بالعملة المحلية' }, showList: false, showCard: true, type: 'Number', tooltip: { fr: '', en: '', ar: '' }, tab: 2 },
            { field: 'pricesIncludingVAT', label: { fr: 'Prix TTC', en: 'Prices Including VAT', ar: 'الأسعار شاملة الضريبة' }, showList: false, showCard: true, type: 'Boolean', tooltip: { fr: '', en: '', ar: '' }, tab: 2 },
            { field: 'vatRegistrationNo', label: { fr: 'Matricule fiscal', en: 'VAT Registration No', ar: 'رقم تسجيل الضريبة' }, showList: false, showCard: true, type: 'String', tooltip: { fr: '', en: '', ar: '' }, tab: 2 },
            { field: 'genBusPostingGroupNo', label: { fr: 'Groupe compta. marché', en: 'Gen. Business Posting Group', ar: 'مجموعة محاسبة السوق' }, showList: false, showCard: true, type: 'Lookup', lookupEntity: 'GeneralBusinessPostingGroup', tooltip: { fr: '', en: '', ar: '' }, tab: 2 },
            { field: 'seriesNo', label: { fr: 'Souches de n°', en: 'No. Series', ar: 'سلسلة الأرقام' }, showList: false, showCard: true, type: 'Lookup', lookupEntity: 'SeriesHeader', tooltip: { fr: '', en: '', ar: '' }, tab: 2 },
            { field: 'vatBusPostingGroupNo', label: { fr: 'Groupe compta. marché TVA', en: 'VAT Business Posting Group', ar: 'مجموعة محاسبة السوق للضريبة' }, showList: false, showCard: true, type: 'Lookup', lookupEntity: 'VatBusinessPostingGroup', tooltip: { fr: '', en: '', ar: '' }, tab: 2 },
            { field: 'locationNo', label: { fr: 'Code magasin', en: 'Location Code', ar: 'كود الموقع' }, showList: false, showCard: true, type: 'Lookup', lookupEntity: 'Location', tooltip: { fr: '', en: '', ar: '' }, tab: 2 },
            ...auditFields
        ]
    },

    PurchaseSetup: {
        apiURI: 'purchase_setup',
        titleList: { fr: 'Configuration Achats', en: 'Purchase Setup', ar: 'إعدادات المشتريات' },
        titleForm: { fr: 'Configuration Achats', en: 'Purchase Setup', ar: 'إعداد المشتريات' },
        breadcrumb: ['Achats'],
        tabs: [
            { id: 1, title: { fr: 'Général', en: 'General', ar: 'عام' }, open: true },
            { id: 2, title: { fr: 'Séries de numéros', en: 'Number Series', ar: 'سلاسل الأرقام' }, open: false },
            { id: 3, title: { fr: 'Archivage', en: 'Archiving', ar: 'الأرشفة' }, open: false }
        ],
        fields: [
            { field: 'mandatoryExtDocNo', label: { fr: 'N° doc externe obligatoire', en: 'Mandatory External Doc No', ar: 'رقم المستند الخارجي إلزامي' }, showCard: true, type: 'Boolean', tooltip: { fr: '', en: '', ar: '' }, tab: 1 },
            { field: 'calculateInvoiceDiscount', label: { fr: 'Calculer remise facture', en: 'Calculate Invoice Discount', ar: 'حساب خصم الفاتورة' }, showCard: true, type: 'Boolean', tooltip: { fr: '', en: '', ar: '' }, tab: 1 },
            { field: 'allowVATDifference', label: { fr: 'Autoriser différence TVA', en: 'Allow VAT Difference', ar: 'السماح باختلاف الضريبة' }, showCard: true, type: 'Boolean', tooltip: { fr: '', en: '', ar: '' }, tab: 1 },
            { field: 'defaultAccountingDate', label: { fr: 'Date comptable par défaut', en: 'Default Accounting Date', ar: 'التاريخ المحاسبي الافتراضي' }, showCard: true, type: 'Dropdown', tooltip: { fr: '', en: '', ar: '' }, tab: 1 },
            { field: 'defaultQuantityToReceive', label: { fr: 'Quantité à recevoir par défaut', en: 'Default Quantity To Receive', ar: 'الكمية المراد استلامها افتراضياً' }, showCard: true, type: 'Dropdown', tooltip: { fr: '', en: '', ar: '' }, tab: 1 },
            { field: 'vendorNo', label: { fr: 'N° fournisseur', en: 'Vendor No', ar: 'رقم المورد' }, showCard: true, type: 'Lookup', lookupEntity: 'SeriesHeader', tooltip: { fr: '', en: '', ar: '' }, tab: 2 },
            { field: 'requestQuoteNo', label: { fr: 'N° demande devis', en: 'Request Quote No', ar: 'رقم طلب عرض السعر' }, showCard: true, type: 'Lookup', lookupEntity: 'SeriesHeader', tooltip: { fr: '', en: '', ar: '' }, tab: 2 },
            { field: 'orderNo', label: { fr: 'N° commande', en: 'Order No', ar: 'رقم الطلب' }, showCard: true, type: 'Lookup', lookupEntity: 'SeriesHeader', tooltip: { fr: '', en: '', ar: '' }, tab: 2 },
            { field: 'invoiceNo', label: { fr: 'N° facture', en: 'Invoice No', ar: 'رقم الفاتورة' }, showCard: true, type: 'Lookup', lookupEntity: 'SeriesHeader', tooltip: { fr: '', en: '', ar: '' }, tab: 2 },
            { field: 'registeredInvoiceNo', label: { fr: 'N° facture enregistrée', en: 'Registered Invoice No', ar: 'رقم الفاتورة المسجلة' }, showCard: true, type: 'Lookup', lookupEntity: 'SeriesHeader', tooltip: { fr: '', en: '', ar: '' }, tab: 2 },
            { field: 'creditMemoNo', label: { fr: 'N° avoir', en: 'Credit Memo No', ar: 'رقم مذكرة الائتمان' }, showCard: true, type: 'Lookup', lookupEntity: 'SeriesHeader', tooltip: { fr: '', en: '', ar: '' }, tab: 2 },
            { field: 'registeredCreditMemoNo', label: { fr: 'N° avoir enregistré', en: 'Registered Credit Memo No', ar: 'رقم مذكرة الائتمان المسجلة' }, showCard: true, type: 'Lookup', lookupEntity: 'SeriesHeader', tooltip: { fr: '', en: '', ar: '' }, tab: 2 },
            { field: 'registeredReceiptNo', label: { fr: 'N° réception enregistrée', en: 'Registered Receipt No', ar: 'رقم الاستلام المسجل' }, showCard: true, type: 'Lookup', lookupEntity: 'SeriesHeader', tooltip: { fr: '', en: '', ar: '' }, tab: 2 },
            { field: 'openOrderNo', label: { fr: 'N° commande ouverte', en: 'Open Order No', ar: 'رقم الطلب المفتوح' }, showCard: true, type: 'Lookup', lookupEntity: 'SeriesHeader', tooltip: { fr: '', en: '', ar: '' }, tab: 2 },
            { field: 'returnNo', label: { fr: 'N° retour', en: 'Return No', ar: 'رقم الإرجاع' }, showCard: true, type: 'Lookup', lookupEntity: 'SeriesHeader', tooltip: { fr: '', en: '', ar: '' }, tab: 2 },
            { field: 'registeredReturnShipmentNo', label: { fr: 'N° expédition retour enregistrée', en: 'Registered Return Shipment No', ar: 'رقم شحنة الإرجاع المسجلة' }, showCard: true, type: 'Lookup', lookupEntity: 'SeriesHeader', tooltip: { fr: '', en: '', ar: '' }, tab: 2 },
            { field: 'archiveCurrencies', label: { fr: 'Archiver devises', en: 'Archive Currencies', ar: 'أرشفة العملات' }, showCard: true, type: 'Boolean', tooltip: { fr: '', en: '', ar: '' }, tab: 3 },
            { field: 'archiveOrders', label: { fr: 'Archiver commandes', en: 'Archive Orders', ar: 'أرشفة الطلبات' }, showCard: true, type: 'Boolean', tooltip: { fr: '', en: '', ar: '' }, tab: 3 },
            { field: 'archiveOpenOrders', label: { fr: 'Archiver commandes ouvertes', en: 'Archive Open Orders', ar: 'أرشفة الطلبات المفتوحة' }, showCard: true, type: 'Boolean', tooltip: { fr: '', en: '', ar: '' }, tab: 3 },
            { field: 'archiveReturns', label: { fr: 'Archiver retours', en: 'Archive Returns', ar: 'أرشفة الإرجاعات' }, showCard: true, type: 'Boolean', tooltip: { fr: '', en: '', ar: '' }, tab: 3 },
            ...auditFields
        ]
    },

    // ========================================
    // VAT MODULE ENTITIES
    // ========================================
    VatProductPostingGroup: {
        apiURI: 'vat_product_posting_group',
        titleList: { fr: 'Liste des groupes compta. produit TVA', en: 'VAT Product Posting Group List', ar: 'قائمة مجموعات محاسبة منتج الضريبة' },
        titleForm: { fr: 'Groupe compta. produit TVA', en: 'VAT Product Posting Group', ar: 'مجموعة محاسبة منتج الضريبة' },
        breadcrumb: ['Finance'],
        fields: [...defaultFields.noDescription, ...auditFields]
    },

    VatPostingSetup: {
        apiURI: 'vat_posting_setup',
        titleList: { fr: 'Liste des paramètres compta. TVA', en: 'VAT Posting Setup List', ar: 'قائمة إعدادات محاسبة الضريبة' },
        titleForm: { fr: 'Paramètre compta. TVA', en: 'VAT Posting Setup', ar: 'إعداد محاسبة الضريبة' },
        breadcrumb: ['Finance'],
        fields: [
            { field: 'vat', label: { fr: 'TVA', en: 'VAT', ar: 'الضريبة' }, showList: true, showCard: true, type: 'Number', tooltip: { fr: '', en: '', ar: '' }, tab: 1 },
            { field: 'vatBusPostingGroupNo', label: { fr: 'Groupe compta. marché TVA', en: 'VAT Business Posting Group', ar: 'مجموعة محاسبة السوق للضريبة' }, showList: true, showCard: true, type: 'Lookup', lookupEntity: 'VatBusinessPostingGroup', tooltip: { fr: '', en: '', ar: '' }, tab: 1 },
            { field: 'vatProdPostingGroupNo', label: { fr: 'Groupe compta. produit TVA', en: 'VAT Product Posting Group', ar: 'مجموعة محاسبة منتج الضريبة' }, showList: true, showCard: true, type: 'Lookup', lookupEntity: 'VatProductPostingGroup', tooltip: { fr: '', en: '', ar: '' }, tab: 1 },
            { field: 'salesVatAccountNo', label: { fr: 'Compte TVA vente', en: 'Sales VAT Account', ar: 'حساب ضريبة البيع' }, showList: true, showCard: true, type: 'Lookup', lookupEntity: 'GeneralLedgerAccount', tooltip: { fr: '', en: '', ar: '' }, tab: 1 },
            { field: 'purchaseVatAccountNo', label: { fr: 'Compte TVA achat', en: 'Purchase VAT Account', ar: 'حساب ضريبة الشراء' }, showList: true, showCard: true, type: 'Lookup', lookupEntity: 'GeneralLedgerAccount', tooltip: { fr: '', en: '', ar: '' }, tab: 1 },
            ...auditFields
        ]
    },

    VatBusinessPostingGroup: {
        apiURI: 'vat_business_posting_group',
        titleList: { fr: 'Liste des groupes compta. marché TVA', en: 'VAT Business Posting Group List', ar: 'قائمة مجموعات محاسبة السوق للضريبة' },
        titleForm: { fr: 'Groupe compta. marché TVA', en: 'VAT Business Posting Group', ar: 'مجموعة محاسبة السوق للضريبة' },
        breadcrumb: ['Finance'],
        fields: [...defaultFields.noDescription, ...auditFields]
    },

    // ========================================
    // SALES MODULE ENTITIES
    // ========================================
    SalesHeader: {
        apiURI: 'sales_header',
        titleList: { fr: 'Liste des en-têtes vente', en: 'Sales Header List', ar: 'قائمة رؤوس المبيعات' },
        titleForm: { fr: 'En-tête vente', en: 'Sales Header', ar: 'رأس البيع' },
        breadcrumb: ['Ventes'],
        tabs: [
            { id: 1, title: { fr: 'Général', en: 'General', ar: 'عام' }, open: true },
            { id: 2, title: { fr: 'Facturation', en: 'Billing', ar: 'الفوترة' }, open: false },
            { id: 3, title: { fr: 'Livraison', en: 'Shipping', ar: 'الشحن' }, open: false },
            { id: 4, title: { fr: 'Dimensions', en: 'Dimensions', ar: 'الأبعاد' }, open: false }
        ],
        fields: [
            { field: 'no', label: { fr: 'N°', en: 'No', ar: 'الرقم' }, showList: true, showCard: true, type: 'String', tooltip: { fr: '', en: '', ar: '' }, tab: 1, mandatory: true, disabled: true },
            { field: 'documentType', label: { fr: 'Type document', en: 'Document Type', ar: 'نوع المستند' }, showList: true, showCard: true, type: 'Dropdown', tooltip: { fr: '', en: '', ar: '' }, tab: 1, disabled: true },
            { field: 'sellToCustomerNo', label: { fr: 'N° client vente', en: 'Sell To Customer No', ar: 'رقم عميل البيع' }, showList: true, showCard: true, type: 'Lookup', lookupEntity: 'Customer', tooltip: { fr: '', en: '', ar: '' }, tab: 1,disabled: true },
            { field: 'sellToCustomerName', label: { fr: 'Nom client vente', en: 'Sell To Customer Name', ar: 'اسم عميل البيع' }, showList: false, showCard: true, type: 'String', tooltip: { fr: '', en: '', ar: '' }, tab: 1 },
            { field: 'billToCustomerNo', label: { fr: 'N° client facturation', en: 'Bill To Customer No', ar: 'رقم عميل الفوترة' }, showList: false, showCard: true, type: 'Lookup', lookupEntity: 'Customer', tooltip: { fr: '', en: '', ar: '' }, tab: 2 },
            { field: 'billToName', label: { fr: 'Nom facturation', en: 'Bill To Name', ar: 'اسم الفوترة' }, showList: false, showCard: true, type: 'String', tooltip: { fr: '', en: '', ar: '' }, tab: 2 },
            { field: 'address', label: { fr: 'Adresse', en: 'Address', ar: 'العنوان' }, showList: false, showCard: true, type: 'String', tooltip: { fr: '', en: '', ar: '' }, tab: 1 },
            { field: 'billToContact', label: { fr: 'Contact facturation', en: 'Bill To Contact', ar: 'جهة اتصال الفوترة' }, showList: false, showCard: true, type: 'String', tooltip: { fr: '', en: '', ar: '' }, tab: 2 },
            { field: 'shippingAgentNo', label: { fr: 'Code transporteur', en: 'Shipping Agent', ar: 'وكيل الشحن' }, showList: false, showCard: true, type: 'Lookup', lookupEntity: 'ShipmentAgent', tooltip: { fr: '', en: '', ar: '' }, tab: 3 },
            { field: 'shipToName', label: { fr: 'Nom livraison', en: 'Ship To Name', ar: 'اسم التسليم' }, showList: false, showCard: true, type: 'String', tooltip: { fr: '', en: '', ar: '' }, tab: 3 },
            { field: 'shipToAddress', label: { fr: 'Adresse livraison', en: 'Ship To Address', ar: 'عنوان التسليم' }, showList: false, showCard: true, type: 'String', tooltip: { fr: '', en: '', ar: '' }, tab: 3 },
            { field: 'orderDate', label: { fr: 'Date commande', en: 'Order Date', ar: 'تاريخ الطلب' }, showList: true, showCard: true, type: 'Date', tooltip: { fr: '', en: '', ar: '' }, tab: 1,disabled: true },
            { field: 'postingDate', label: { fr: 'Date comptabilisation', en: 'Posting Date', ar: 'تاريخ القيد' }, showList: true, showCard: true, type: 'Date', tooltip: { fr: '', en: '', ar: '' }, tab: 1 },
            { field: 'postingDescription', label: { fr: 'Description comptabilisation', en: 'Posting Description', ar: 'وصف القيد' }, showList: false, showCard: true, type: 'String', tooltip: { fr: '', en: '', ar: '' }, tab: 1 },
            { field: 'paymentTermsNo', label: { fr: 'Code condition paiement', en: 'Payment Terms', ar: 'شروط الدفع' }, showList: false, showCard: true, type: 'Lookup', lookupEntity: 'PaymentTerms', tooltip: { fr: '', en: '', ar: '' }, tab: 2 },
            { field: 'dueDate', label: { fr: 'Date échéance', en: 'Due Date', ar: 'تاريخ الاستحقاق' }, showList: false, showCard: true, type: 'Date', tooltip: { fr: '', en: '', ar: '' }, tab: 2 },
            { field: 'locationNo', label: { fr: 'Code magasin', en: 'Location Code', ar: 'كود الموقع' }, showList: false, showCard: true, type: 'Lookup', lookupEntity: 'Location', tooltip: { fr: '', en: '', ar: '' }, tab: 3 },
            { field: 'shortcutDimension1Code', label: { fr: 'Code axe principal 1', en: 'Shortcut Dimension 1', ar: 'البعد المختصر 1' }, showList: false, showCard: true, type: 'String', tooltip: { fr: '', en: '', ar: '' }, tab: 4 },
            { field: 'shortcutDimension2Code', label: { fr: 'Code axe principal 2', en: 'Shortcut Dimension 2', ar: 'البعد المختصر 2' }, showList: false, showCard: true, type: 'String', tooltip: { fr: '', en: '', ar: '' }, tab: 4 },
            { field: 'customerPostingGroupNo', label: { fr: 'Groupe compta. client', en: 'Customer Posting Group', ar: 'مجموعة محاسبة العميل' }, showList: false, showCard: true, type: 'Lookup', lookupEntity: 'CustomerPostingGroup', tooltip: { fr: '', en: '', ar: '' }, tab: 2 },
            { field: 'currencyNo', label: { fr: 'Code devise', en: 'Currency Code', ar: 'كود العملة' }, showList: false, showCard: true, type: 'Lookup', lookupEntity: 'Currency', tooltip: { fr: '', en: '', ar: '' }, tab: 2 },
            { field: 'currencyFactor', label: { fr: 'Facteur devise', en: 'Currency Factor', ar: 'عامل العملة' }, showList: false, showCard: true, type: 'Number', tooltip: { fr: '', en: '', ar: '' }, tab: 2 },
            { field: 'customerPriceGroupNo', label: { fr: 'Groupe prix client', en: 'Customer Price Group', ar: 'مجموعة أسعار العميل' }, showList: false, showCard: true, type: 'Lookup', lookupEntity: 'CustomerPriceGroup', tooltip: { fr: '', en: '', ar: '' }, tab: 2 },
            { field: 'pricesIncludingVAT', label: { fr: 'Prix TTC', en: 'Prices Including VAT', ar: 'الأسعار شاملة الضريبة' }, showList: false, showCard: true, type: 'Boolean', tooltip: { fr: '', en: '', ar: '' }, tab: 2 ,disabled: true},
            { field: 'customerDiscGroup', label: { fr: 'Groupe remise client', en: 'Customer Discount Group', ar: 'مجموعة خصم العميل' }, showList: false, showCard: true, type: 'Lookup', lookupEntity: 'CustomerDiscountGroup', tooltip: { fr: '', en: '', ar: '' }, tab: 2 },
            { field: 'salespersonNo', label: { fr: 'Code vendeur', en: 'Salesperson No', ar: 'رقم البائع' }, showList: false, showCard: true, type: 'Lookup', lookupEntity: 'SalesPersonPurchaser', tooltip: { fr: '', en: '', ar: '' }, tab: 1 },
            { field: 'noPrinted', label: { fr: 'N° imprimé', en: 'No Printed', ar: 'رقم مطبوع' }, showList: false, showCard: true, type: 'Number', tooltip: { fr: '', en: '', ar: '' }, tab: 1 },
            { field: 'ship', label: { fr: 'Livrer', en: 'Ship', ar: 'شحن' }, showList: false, showCard: true, type: 'Boolean', tooltip: { fr: '', en: '', ar: '' }, tab: 3 },
            { field: 'invoice', label: { fr: 'Facturer', en: 'Invoice', ar: 'فوترة' }, showList: false, showCard: true, type: 'Boolean', tooltip: { fr: '', en: '', ar: '' }, tab: 2 },
            { field: 'amount', label: { fr: 'Montant', en: 'Amount', ar: 'المبلغ' }, showList: true, showCard: true, type: 'Number', tooltip: { fr: '', en: '', ar: '' }, tab: 2 },
            { field: 'amountIncludingVAT', label: { fr: 'Montant TTC', en: 'Amount Including VAT', ar: 'المبلغ شامل الضريبة' }, showList: true, showCard: true, type: 'Number', tooltip: { fr: '', en: '', ar: '' }, tab: 2 },
            { field: 'postingNo', label: { fr: 'N° comptabilisation', en: 'Posting No', ar: 'رقم القيد' }, showList: false, showCard: true, type: 'String', tooltip: { fr: '', en: '', ar: '' }, tab: 1 },
            { field: 'lastShippingNo', label: { fr: 'Dernier N° expédition', en: 'Last Shipping No', ar: 'آخر رقم شحنة' }, showList: false, showCard: true, type: 'String', tooltip: { fr: '', en: '', ar: '' }, tab: 3 },
            { field: 'vatRegistrationNo', label: { fr: 'Matricule fiscal', en: 'VAT Registration No', ar: 'رقم تسجيل الضريبة' }, showList: false, showCard: true, type: 'String', tooltip: { fr: '', en: '', ar: '' }, tab: 2 },
            { field: 'genBusPostingGroupNo', label: { fr: 'Groupe compta. marché', en: 'Gen. Business Posting Group', ar: 'مجموعة محاسبة السوق' }, showList: false, showCard: true, type: 'Lookup', lookupEntity: 'GeneralBusinessPostingGroup', tooltip: { fr: '', en: '', ar: '' }, tab: 4 },
            { field: 'documentDate', label: { fr: 'Date document', en: 'Document Date', ar: 'تاريخ المستند' }, showList: false, showCard: true, type: 'Date', tooltip: { fr: '', en: '', ar: '' }, tab: 1 },
            { field: 'externalDocumentNo', label: { fr: 'N° doc externe', en: 'External Document No', ar: 'رقم المستند الخارجي' }, showList: false, showCard: true, type: 'String', tooltip: { fr: '', en: '', ar: '' }, tab: 1 },
            { field: 'paymentMethodNo', label: { fr: 'Code mode de règlement', en: 'Payment Method', ar: 'طريقة الدفع' }, showList: false, showCard: true, type: 'Lookup', lookupEntity: 'PaymentMethod', tooltip: { fr: '', en: '', ar: '' }, tab: 2 },
            { field: 'seriesNo', label: { fr: 'Souches de n°', en: 'No. Series', ar: 'سلسلة الأرقام' }, showList: false, showCard: true, type: 'Lookup', lookupEntity: 'SeriesHeader', tooltip: { fr: '', en: '', ar: '' }, tab: 1 },
            { field: 'postingSeriesNo', label: { fr: 'Souches comptabilisation', en: 'Posting Series No', ar: 'سلسلة القيد' }, showList: false, showCard: true, type: 'Lookup', lookupEntity: 'SeriesHeader', tooltip: { fr: '', en: '', ar: '' }, tab: 1 },
            { field: 'shipmentSeriesNo', label: { fr: 'Souches expédition', en: 'Shipment Series No', ar: 'سلسلة الشحنة' }, showList: false, showCard: true, type: 'Lookup', lookupEntity: 'SeriesHeader', tooltip: { fr: '', en: '', ar: '' }, tab: 3 },
            { field: 'vatBusPostingGroupNo', label: { fr: 'Groupe compta. marché TVA', en: 'VAT Business Posting Group', ar: 'مجموعة محاسبة السوق للضريبة' }, showList: false, showCard: true, type: 'Lookup', lookupEntity: 'VatBusinessPostingGroup', tooltip: { fr: '', en: '', ar: '' }, tab: 4 },
            { field: 'status', label: { fr: 'Statut', en: 'Status', ar: 'الحالة' }, showList: true, showCard: true, type: 'Dropdown', tooltip: { fr: '', en: '', ar: '' }, tab: 1 },
            { field: 'invoiceDiscountCalculation', label: { fr: 'Calcul remise facture', en: 'Invoice Discount Calculation', ar: 'حساب خصم الفاتورة' }, showList: false, showCard: true, type: 'Dropdown', tooltip: { fr: '', en: '', ar: '' }, tab: 2 },
            { field: 'invoiceDiscountValue', label: { fr: 'Valeur remise facture', en: 'Invoice Discount Value', ar: 'قيمة خصم الفاتورة' }, showList: false, showCard: true, type: 'Number', tooltip: { fr: '', en: '', ar: '' }, tab: 2 },
            { field: 'quoteNo', label: { fr: 'N° devis', en: 'Quote No', ar: 'رقم عرض السعر' }, showList: false, showCard: true, type: 'String', tooltip: { fr: '', en: '', ar: '' }, tab: 1 },
            { field: 'phoneNo', label: { fr: 'N° téléphone', en: 'Phone No', ar: 'رقم الهاتف' }, showList: false, showCard: true, type: 'String', tooltip: { fr: '', en: '', ar: '' }, tab: 1 },
            { field: 'email', label: { fr: 'E-mail', en: 'E-mail', ar: 'البريد الإلكتروني' }, showList: false, showCard: true, type: 'String', tooltip: { fr: '', en: '', ar: '' }, tab: 1 },
            { field: 'invoiceDiscountAmount', label: { fr: 'Montant remise facture', en: 'Invoice Discount Amount', ar: 'مبلغ خصم الفاتورة' }, showList: false, showCard: true, type: 'Number', tooltip: { fr: '', en: '', ar: '' }, tab: 2 },
            { field: 'responsibilityCenterNo', label: { fr: 'N° centre responsabilité', en: 'Responsibility Center No', ar: 'رقم مركز المسؤولية' }, showList: false, showCard: true, type: 'Lookup', lookupEntity: 'ResponsibilityCenter', tooltip: { fr: '', en: '', ar: '' }, tab: 4 },
            { field: 'shippingAdvice', label: { fr: 'Avis expédition', en: 'Shipping Advice', ar: 'إشعار الشحن' }, showList: false, showCard: true, type: 'Dropdown', tooltip: { fr: '', en: '', ar: '' }, tab: 3 },
            { field: 'requestedDeliveryDate', label: { fr: 'Date livraison demandée', en: 'Requested Delivery Date', ar: 'تاريخ التسليم المطلوب' }, showList: false, showCard: true, type: 'Date', tooltip: { fr: '', en: '', ar: '' }, tab: 3 },
            { field: 'promisedDeliveryDate', label: { fr: 'Date livraison promise', en: 'Promised Delivery Date', ar: 'تاريخ التسليم الموعود' }, showList: false, showCard: true, type: 'Date', tooltip: { fr: '', en: '', ar: '' }, tab: 3 },
            { field: 'returnReceiptSeriesNo', label: { fr: 'Souches réception retour', en: 'Return Receipt Series No', ar: 'سلسلة استلام الإرجاع' }, showList: false, showCard: true, type: 'Lookup', lookupEntity: 'SeriesHeader', tooltip: { fr: '', en: '', ar: '' }, tab: 3 },
            { field: 'lastReturnReceiptNo', label: { fr: 'Dernier N° réception retour', en: 'Last Return Receipt No', ar: 'آخر رقم استلام إرجاع' }, showList: false, showCard: true, type: 'String', tooltip: { fr: '', en: '', ar: '' }, tab: 3 },
            { field: 'allowLineDisc', label: { fr: 'Autoriser remise ligne', en: 'Allow Line Discount', ar: 'السماح بخصم السطر' }, showList: false, showCard: true, type: 'Boolean', tooltip: { fr: '', en: '', ar: '' }, tab: 2 },
            { field: 'territoryNo', label: { fr: 'Code secteur', en: 'Territory Code', ar: 'كود القطاع' }, showList: false, showCard: true, type: 'Lookup', lookupEntity: 'Territory', tooltip: { fr: '', en: '', ar: '' }, tab: 4 },
            { field: 'stampDuty', label: { fr: 'Timbre', en: 'Stamp Duty', ar: 'الطابع' }, showList: false, showCard: true, type: 'Boolean', tooltip: { fr: '', en: '', ar: '' }, tab: 2 },
            { field: 'stampDutyAmount', label: { fr: 'Montant timbre', en: 'Stamp Duty Amount', ar: 'مبلغ الطابع' }, showList: false, showCard: true, type: 'Number', tooltip: { fr: '', en: '', ar: '' }, tab: 2 },
            ...auditFields
        ]
    },

    SalesLine: {
        apiURI: 'sales_line',
        titleList: { fr: 'Liste des lignes vente', en: 'Sales Line List', ar: 'قائمة أسطر المبيعات' },
        titleForm: { fr: 'Ligne vente', en: 'Sales Line', ar: 'سطر البيع' },
        breadcrumb: ['Ventes'],
        tabs: [
            { id: 1, title: { fr: 'Général', en: 'General', ar: 'عام' }, open: true },
            { id: 2, title: { fr: 'Quantités', en: 'Quantities', ar: 'الكميات' }, open: false },
            { id: 3, title: { fr: 'Prix et remises', en: 'Pricing & Discounts', ar: 'التسعير والخصومات' }, open: false },
            { id: 4, title: { fr: 'Dimensions', en: 'Dimensions', ar: 'الأبعاد' }, open: false }
        ],
        fields: [
            { field: 'documentType', label: { fr: 'Type document', en: 'Document Type', ar: 'نوع المستند' }, showList: true, showCard: true, type: 'Dropdown', tooltip: { fr: '', en: '', ar: '' }, tab: 1 },
            { field: 'documentNo', label: { fr: 'N° document', en: 'Document No', ar: 'رقم المستند' }, showList: true, showCard: true, type: 'String', tooltip: { fr: '', en: '', ar: '' }, tab: 1 },
            { field: 'lineNo', label: { fr: 'N° ligne', en: 'Line No', ar: 'رقم السطر' }, showList: true, showCard: true, type: 'Number', tooltip: { fr: '', en: '', ar: '' }, tab: 1 },
            { field: 'type', label: { fr: 'Type', en: 'Type', ar: 'النوع' }, showList: true, showCard: true, type: 'Dropdown', tooltip: { fr: '', en: '', ar: '' }, tab: 1 },
            { field: 'sellToCustomerNo', label: { fr: 'N° client vente', en: 'Sell To Customer No', ar: 'رقم عميل البيع' }, showList: false, showCard: true, type: 'Lookup', lookupEntity: 'Customer', tooltip: { fr: '', en: '', ar: '' }, tab: 1 },
            { field: 'itemNo', label: { fr: 'N° article', en: 'Item No', ar: 'رقم الصنف' }, showList: true, showCard: true, type: 'Lookup', lookupEntity: 'Item', tooltip: { fr: '', en: '', ar: '' }, tab: 1 },
            { field: 'description', label: { fr: 'Description', en: 'Description', ar: 'الوصف' }, showList: true, showCard: true, type: 'String', tooltip: { fr: '', en: '', ar: '' }, tab: 1 },
            { field: 'description2', label: { fr: 'Description 2', en: 'Description 2', ar: 'الوصف 2' }, showList: false, showCard: true, type: 'String', tooltip: { fr: '', en: '', ar: '' }, tab: 1 },
            { field: 'locationNo', label: { fr: 'Code magasin', en: 'Location Code', ar: 'كود الموقع' }, showList: false, showCard: true, type: 'Lookup', lookupEntity: 'Location', tooltip: { fr: '', en: '', ar: '' }, tab: 1 },
            { field: 'postingGroupNo', label: { fr: 'Groupe compta. stock', en: 'Posting Group', ar: 'مجموعة المحاسبة' }, showList: false, showCard: true, type: 'Lookup', lookupEntity: 'InventoryPostingGroup', tooltip: { fr: '', en: '', ar: '' }, tab: 1 },
            { field: 'quantity', label: { fr: 'Quantité', en: 'Quantity', ar: 'الكمية' }, showList: true, showCard: true, type: 'Number', tooltip: { fr: '', en: '', ar: '' }, tab: 2 },
            { field: 'outstandingQuantity', label: { fr: 'Quantité en attente', en: 'Outstanding Quantity', ar: 'الكمية المعلقة' }, showList: true, showCard: true, type: 'Number', tooltip: { fr: '', en: '', ar: '' }, tab: 2 },
            { field: 'qtyToInvoice', label: { fr: 'Qté à facturer', en: 'Qty To Invoice', ar: 'الكمية للفوترة' }, showList: false, showCard: true, type: 'Number', tooltip: { fr: '', en: '', ar: '' }, tab: 2 },
            { field: 'qtyToShip', label: { fr: 'Qté à expédier', en: 'Qty To Ship', ar: 'الكمية للشحن' }, showList: false, showCard: true, type: 'Number', tooltip: { fr: '', en: '', ar: '' }, tab: 2 },
            { field: 'unitPrice', label: { fr: 'Prix unitaire', en: 'Unit Price', ar: 'السعر الوحدة' }, showList: true, showCard: true, type: 'Number', tooltip: { fr: '', en: '', ar: '' }, tab: 3 },
            { field: 'unitCostLCY', label: { fr: 'Coût unitaire DS', en: 'Unit Cost LCY', ar: 'تكلفة الوحدة بالعملة المحلية' }, showList: false, showCard: true, type: 'Number', tooltip: { fr: '', en: '', ar: '' }, tab: 3 },
            { field: 'vatPercent', label: { fr: '% TVA', en: 'VAT %', ar: '% الضريبة' }, showList: false, showCard: true, type: 'Number', tooltip: { fr: '', en: '', ar: '' }, tab: 3 },
            { field: 'lineDiscountPercent', label: { fr: '% Remise ligne', en: 'Line Discount %', ar: '% خصم السطر' }, showList: false, showCard: true, type: 'Number', tooltip: { fr: '', en: '', ar: '' }, tab: 3 },
            { field: 'lineDiscountAmount', label: { fr: 'Montant remise ligne', en: 'Line Discount Amount', ar: 'مبلغ خصم السطر' }, showList: false, showCard: true, type: 'Number', tooltip: { fr: '', en: '', ar: '' }, tab: 3 },
            { field: 'amount', label: { fr: 'Montant', en: 'Amount', ar: 'المبلغ' }, showList: true, showCard: true, type: 'Number', tooltip: { fr: '', en: '', ar: '' }, tab: 3 },
            { field: 'amountIncludingVAT', label: { fr: 'Montant TTC', en: 'Amount Including VAT', ar: 'المبلغ شامل الضريبة' }, showList: true, showCard: true, type: 'Number', tooltip: { fr: '', en: '', ar: '' }, tab: 3 },
            { field: 'allowInvoiceDisc', label: { fr: 'Autoriser remise facture', en: 'Allow Invoice Discount', ar: 'السماح بخصم الفاتورة' }, showList: false, showCard: true, type: 'Boolean', tooltip: { fr: '', en: '', ar: '' }, tab: 3 },
            { field: 'shortcutDimension1Code', label: { fr: 'Code axe principal 1', en: 'Shortcut Dimension 1', ar: 'البعد المختصر 1' }, showList: false, showCard: true, type: 'String', tooltip: { fr: '', en: '', ar: '' }, tab: 4 },
            { field: 'shortcutDimension2Code', label: { fr: 'Code axe principal 2', en: 'Shortcut Dimension 2', ar: 'البعد المختصر 2' }, showList: false, showCard: true, type: 'String', tooltip: { fr: '', en: '', ar: '' }, tab: 4 },
            { field: 'customerPriceGroupNo', label: { fr: 'Groupe prix client', en: 'Customer Price Group', ar: 'مجموعة أسعار العميل' }, showList: false, showCard: true, type: 'Lookup', lookupEntity: 'CustomerPriceGroup', tooltip: { fr: '', en: '', ar: '' }, tab: 3 },
            { field: 'outstandingAmount', label: { fr: 'Montant en attente', en: 'Outstanding Amount', ar: 'المبلغ المعلق' }, showList: false, showCard: true, type: 'Number', tooltip: { fr: '', en: '', ar: '' }, tab: 2 },
            { field: 'qtyShippedNotInvoiced', label: { fr: 'Qté expédiée non facturée', en: 'Qty Shipped Not Invoiced', ar: 'الكمية المشحونة غير المفوترة' }, showList: false, showCard: true, type: 'Number', tooltip: { fr: '', en: '', ar: '' }, tab: 2 },
            { field: 'shippedNotInvoiced', label: { fr: 'Expédié non facturé', en: 'Shipped Not Invoiced', ar: 'مشحون غير مفوتر' }, showList: false, showCard: true, type: 'Number', tooltip: { fr: '', en: '', ar: '' }, tab: 2 },
            { field: 'quantityShipped', label: { fr: 'Quantité expédiée', en: 'Quantity Shipped', ar: 'الكمية المشحونة' }, showList: false, showCard: true, type: 'Number', tooltip: { fr: '', en: '', ar: '' }, tab: 2 },
            { field: 'quantityInvoiced', label: { fr: 'Quantité facturée', en: 'Quantity Invoiced', ar: 'الكمية المفوترة' }, showList: false, showCard: true, type: 'Number', tooltip: { fr: '', en: '', ar: '' }, tab: 2 },
            { field: 'shipmentNo', label: { fr: 'N° expédition', en: 'Shipment No', ar: 'رقم الشحنة' }, showList: false, showCard: true, type: 'String', tooltip: { fr: '', en: '', ar: '' }, tab: 2 },
            { field: 'shipmentLineNo', label: { fr: 'N° ligne expédition', en: 'Shipment Line No', ar: 'رقم سطر الشحنة' }, showList: false, showCard: true, type: 'Number', tooltip: { fr: '', en: '', ar: '' }, tab: 2 },
            { field: 'profitPercent', label: { fr: '% Bénéfice', en: 'Profit %', ar: '% الربح' }, showList: false, showCard: true, type: 'Number', tooltip: { fr: '', en: '', ar: '' }, tab: 3 },
            { field: 'billToCustomerNo', label: { fr: 'N° client facturation', en: 'Bill To Customer No', ar: 'رقم عميل الفوترة' }, showList: false, showCard: true, type: 'Lookup', lookupEntity: 'Customer', tooltip: { fr: '', en: '', ar: '' }, tab: 1 },
            { field: 'invDiscountAmount', label: { fr: 'Montant remise facture', en: 'Invoice Discount Amount', ar: 'مبلغ خصم الفاتورة' }, showList: false, showCard: true, type: 'Number', tooltip: { fr: '', en: '', ar: '' }, tab: 3 },
            { field: 'purchaseOrderNo', label: { fr: 'N° commande achat', en: 'Purchase Order No', ar: 'رقم طلب الشراء' }, showList: false, showCard: true, type: 'String', tooltip: { fr: '', en: '', ar: '' }, tab: 1 },
            { field: 'purchOrderLineNo', label: { fr: 'N° ligne commande achat', en: 'Purchase Order Line No', ar: 'رقم سطر طلب الشراء' }, showList: false, showCard: true, type: 'Number', tooltip: { fr: '', en: '', ar: '' }, tab: 1 },
            { field: 'dropShipment', label: { fr: 'Livraison directe', en: 'Drop Shipment', ar: 'التسليم المباشر' }, showList: false, showCard: true, type: 'Boolean', tooltip: { fr: '', en: '', ar: '' }, tab: 1 },
            { field: 'genBusPostingGroupNo', label: { fr: 'Groupe compta. marché', en: 'Gen. Business Posting Group', ar: 'مجموعة محاسبة السوق' }, showList: false, showCard: true, type: 'Lookup', lookupEntity: 'GeneralBusinessPostingGroup', tooltip: { fr: '', en: '', ar: '' }, tab: 4 },
            { field: 'genProdPostingGroupNo', label: { fr: 'Groupe compta. produit', en: 'Gen. Product Posting Group', ar: 'مجموعة محاسبة المنتج' }, showList: false, showCard: true, type: 'Lookup', lookupEntity: 'GeneralProductPostingGroup', tooltip: { fr: '', en: '', ar: '' }, tab: 4 },
            { field: 'vatBusPostingGroupNo', label: { fr: 'Groupe compta. marché TVA', en: 'VAT Business Posting Group', ar: 'مجموعة محاسبة السوق للضريبة' }, showList: false, showCard: true, type: 'Lookup', lookupEntity: 'VatBusinessPostingGroup', tooltip: { fr: '', en: '', ar: '' }, tab: 4 },
            { field: 'vatProdPostingGroupNo', label: { fr: 'Groupe compta. produit TVA', en: 'VAT Product Posting Group', ar: 'مجموعة محاسبة منتج الضريبة' }, showList: false, showCard: true, type: 'Lookup', lookupEntity: 'VatProductPostingGroup', tooltip: { fr: '', en: '', ar: '' }, tab: 4 },
            { field: 'currencyNo', label: { fr: 'Code devise', en: 'Currency Code', ar: 'كود العملة' }, showList: false, showCard: true, type: 'Lookup', lookupEntity: 'Currency', tooltip: { fr: '', en: '', ar: '' }, tab: 4 },
            { field: 'outstandingAmountLCY', label: { fr: 'Montant en attente DS', en: 'Outstanding Amount LCY', ar: 'المبلغ المعلق بالعملة المحلية' }, showList: false, showCard: true, type: 'Number', tooltip: { fr: '', en: '', ar: '' }, tab: 2 },
            { field: 'shippedNotInvoicedLCY', label: { fr: 'Expédié non facturé DS', en: 'Shipped Not Invoiced LCY', ar: 'مشحون غير مفوتر بالعملة المحلية' }, showList: false, showCard: true, type: 'Number', tooltip: { fr: '', en: '', ar: '' }, tab: 2 },
            { field: 'shippedNotInvLCYNoVAT', label: { fr: 'Expédié non facturé DS HT', en: 'Shipped Not Inv LCY No VAT', ar: 'مشحون غير مفوتر بالعملة المحلية بدون ضريبة' }, showList: false, showCard: true, type: 'Number', tooltip: { fr: '', en: '', ar: '' }, tab: 2 },
            { field: 'reservedQuantity', label: { fr: 'Quantité réservée', en: 'Reserved Quantity', ar: 'الكمية المحجوزة' }, showList: false, showCard: true, type: 'Number', tooltip: { fr: '', en: '', ar: '' }, tab: 2 },
            { field: 'reserve', label: { fr: 'Réserver', en: 'Reserve', ar: 'حجز' }, showList: false, showCard: true, type: 'Dropdown', tooltip: { fr: '', en: '', ar: '' }, tab: 2 },
            { field: 'blanketOrderNo', label: { fr: 'N° commande ouverte', en: 'Blanket Order No', ar: 'رقم الطلب المفتوح' }, showList: false, showCard: true, type: 'String', tooltip: { fr: '', en: '', ar: '' }, tab: 1 },
            { field: 'blanketOrderLineNo', label: { fr: 'N° ligne commande ouverte', en: 'Blanket Order Line No', ar: 'رقم سطر الطلب المفتوح' }, showList: false, showCard: true, type: 'Number', tooltip: { fr: '', en: '', ar: '' }, tab: 1 },
            { field: 'vatBaseAmount', label: { fr: 'Montant base TVA', en: 'VAT Base Amount', ar: 'مبلغ أساس الضريبة' }, showList: false, showCard: true, type: 'Number', tooltip: { fr: '', en: '', ar: '' }, tab: 3 },
            { field: 'unitCost', label: { fr: 'Coût unitaire', en: 'Unit Cost', ar: 'تكلفة الوحدة' }, showList: false, showCard: true, type: 'Number', tooltip: { fr: '', en: '', ar: '' }, tab: 3 },
            { field: 'lineAmount', label: { fr: 'Montant ligne', en: 'Line Amount', ar: 'مبلغ السطر' }, showList: false, showCard: true, type: 'Number', tooltip: { fr: '', en: '', ar: '' }, tab: 3 },
            { field: 'lineDiscountCalculation', label: { fr: 'Calcul remise ligne', en: 'Line Discount Calculation', ar: 'حساب خصم السطر' }, showList: false, showCard: true, type: 'Dropdown', tooltip: { fr: '', en: '', ar: '' }, tab: 3 },
            { field: 'itemVariantNo', label: { fr: 'N° variante article', en: 'Item Variant No', ar: 'رقم متغير الصنف' }, showList: false, showCard: true, type: 'Lookup', lookupEntity: 'ItemVariants', tooltip: { fr: '', en: '', ar: '' }, tab: 1 },
            { field: 'binCode', label: { fr: 'Code emplacement', en: 'Bin Code', ar: 'كود الموقع' }, showList: false, showCard: true, type: 'String', tooltip: { fr: '', en: '', ar: '' }, tab: 1 },
            { field: 'qtyPerUnitOfMeasure', label: { fr: 'Qté par unité de mesure', en: 'Qty Per Unit Of Measure', ar: 'الكمية لكل وحدة قياس' }, showList: false, showCard: true, type: 'Number', tooltip: { fr: '', en: '', ar: '' }, tab: 2 },
            { field: 'unitOfMeasureNo', label: { fr: 'N° unité de mesure', en: 'Unit Of Measure No', ar: 'رقم وحدة القياس' }, showList: false, showCard: true, type: 'Lookup', lookupEntity: 'ItemUnitOfMeasure', tooltip: { fr: '', en: '', ar: '' }, tab: 2 },
            { field: 'unitOfMeasure', label: { fr: 'Unité de mesure', en: 'Unit Of Measure', ar: 'وحدة القياس' }, showList: false, showCard: true, type: 'String', tooltip: { fr: '', en: '', ar: '' }, tab: 2 },
            { field: 'responsibilityCenterNo', label: { fr: 'N° centre responsabilité', en: 'Responsibility Center No', ar: 'رقم مركز المسؤولية' }, showList: false, showCard: true, type: 'Lookup', lookupEntity: 'ResponsibilityCenter', tooltip: { fr: '', en: '', ar: '' }, tab: 4 },
            { field: 'familyNo', label: { fr: 'N° famille', en: 'Family No', ar: 'رقم العائلة' }, showList: false, showCard: true, type: 'Lookup', lookupEntity: 'ItemFamily', tooltip: { fr: '', en: '', ar: '' }, tab: 1 },
            { field: 'subFamilyNo', label: { fr: 'N° sous-famille', en: 'Sub Family No', ar: 'رقم العائلة الفرعية' }, showList: false, showCard: true, type: 'Lookup', lookupEntity: 'ItemSubFamily', tooltip: { fr: '', en: '', ar: '' }, tab: 1 },
            { field: 'returnQtyToReceive', label: { fr: 'Qté retour à recevoir', en: 'Return Qty To Receive', ar: 'كمية الإرجاع للاستلام' }, showList: false, showCard: true, type: 'Number', tooltip: { fr: '', en: '', ar: '' }, tab: 2 },
            { field: 'returnQtyRcdNotInvd', label: { fr: 'Qté retour reçue non facturée', en: 'Return Qty Received Not Invoiced', ar: 'كمية الإرجاع المستلمة غير المفوترة' }, showList: false, showCard: true, type: 'Number', tooltip: { fr: '', en: '', ar: '' }, tab: 2 },
            { field: 'returnQtyReceived', label: { fr: 'Qté retour reçue', en: 'Return Qty Received', ar: 'كمية الإرجاع المستلمة' }, showList: false, showCard: true, type: 'Number', tooltip: { fr: '', en: '', ar: '' }, tab: 2 },
            { field: 'returnReceiptNo', label: { fr: 'N° réception retour', en: 'Return Receipt No', ar: 'رقم استلام الإرجاع' }, showList: false, showCard: true, type: 'String', tooltip: { fr: '', en: '', ar: '' }, tab: 2 },
            { field: 'returnReceiptLineNo', label: { fr: 'N° ligne réception retour', en: 'Return Receipt Line No', ar: 'رقم سطر استلام الإرجاع' }, showList: false, showCard: true, type: 'Number', tooltip: { fr: '', en: '', ar: '' }, tab: 2 },
            { field: 'allowLineDisc', label: { fr: 'Autoriser remise ligne', en: 'Allow Line Discount', ar: 'السماح بخصم السطر' }, showList: false, showCard: true, type: 'Boolean', tooltip: { fr: '', en: '', ar: '' }, tab: 3 },
            { field: 'customerDiscGroupNo', label: { fr: 'Groupe remise client', en: 'Customer Discount Group', ar: 'مجموعة خصم العميل' }, showList: false, showCard: true, type: 'Lookup', lookupEntity: 'CustomerDiscountGroup', tooltip: { fr: '', en: '', ar: '' }, tab: 3 },
            { field: 'barCode', label: { fr: 'Code-barres', en: 'Bar Code', ar: 'الرمز الشريطي' }, showList: false, showCard: true, type: 'String', tooltip: { fr: '', en: '', ar: '' }, tab: 1 },
            { field: 'itemTrackingCodeNo', label: { fr: 'Code suivi article', en: 'Item Tracking Code', ar: 'رمز تتبع الصنف' }, showList: false, showCard: true, type: 'Lookup', lookupEntity: 'ItemTrackingCode', tooltip: { fr: '', en: '', ar: '' }, tab: 1 },
            ...auditFields
        ]
    },

    // ========================================
    // INVENTORY MODULE ENTITIES
    // ========================================
    StockKeepingUnit: {
        apiURI: 'stock_keeping_unit',
        titleList: { fr: 'Liste des unités de stockage', en: 'Stock Keeping Unit List', ar: 'قائمة وحدات التخزين' },
        titleForm: { fr: 'Unité de stockage', en: 'Stock Keeping Unit', ar: 'وحدة التخزين' },
        breadcrumb: ['Stock'],
        tabs: [
            { id: 1, title: { fr: 'Général', en: 'General', ar: 'عام' }, open: true },
            { id: 2, title: { fr: 'Coûts', en: 'Costs', ar: 'التكاليف' }, open: false },
            { id: 3, title: { fr: 'Stock', en: 'Inventory', ar: 'المخزون' }, open: false },
            { id: 4, title: { fr: 'Dimensions', en: 'Dimensions', ar: 'الأبعاد' }, open: false }
        ],
        fields: [
            { field: 'itemNo', label: { fr: 'N° article', en: 'Item No', ar: 'رقم الصنف' }, showList: true, showCard: true, type: 'Lookup', lookupEntity: 'Item', tooltip: { fr: '', en: '', ar: '' }, tab: 1 },
            { field: 'locationNo', label: { fr: 'N° magasin', en: 'Location No', ar: 'رقم الموقع' }, showList: true, showCard: true, type: 'Lookup', lookupEntity: 'Location', tooltip: { fr: '', en: '', ar: '' }, tab: 1 },
            { field: 'variantNo', label: { fr: 'N° variante', en: 'Variant No', ar: 'رقم المتغير' }, showList: true, showCard: true, type: 'Lookup', lookupEntity: 'ItemVariants', tooltip: { fr: '', en: '', ar: '' }, tab: 1 },
            { field: 'description', label: { fr: 'Description', en: 'Description', ar: 'الوصف' }, showList: true, showCard: true, type: 'String', tooltip: { fr: '', en: '', ar: '' }, tab: 1 },
            { field: 'unitCost', label: { fr: 'Coût unitaire', en: 'Unit Cost', ar: 'تكلفة الوحدة' }, showList: true, showCard: true, type: 'Number', tooltip: { fr: '', en: '', ar: '' }, tab: 2 },
            { field: 'standardCost', label: { fr: 'Coût standard', en: 'Standard Cost', ar: 'التكلفة المعيارية' }, showList: false, showCard: true, type: 'Number', tooltip: { fr: '', en: '', ar: '' }, tab: 2 },
            { field: 'lastDirectCost', label: { fr: 'Dernier coût direct', en: 'Last Direct Cost', ar: 'آخر تكلفة مباشرة' }, showList: false, showCard: true, type: 'Number', tooltip: { fr: '', en: '', ar: '' }, tab: 2 },
            { field: 'vendorNo', label: { fr: 'N° fournisseur', en: 'Vendor No', ar: 'رقم المورد' }, showList: false, showCard: true, type: 'Lookup', lookupEntity: 'Vendor', tooltip: { fr: '', en: '', ar: '' }, tab: 1 },
            { field: 'dateFilter', label: { fr: 'Filtre date', en: 'Date Filter', ar: 'مرشح التاريخ' }, showList: false, showCard: true, type: 'Date', tooltip: { fr: '', en: '', ar: '' }, tab: 3 },
            { field: 'globalDimension1Code', label: { fr: 'Code axe principal 1', en: 'Global Dimension 1', ar: 'البعد العام 1' }, showList: false, showCard: true, type: 'String', tooltip: { fr: '', en: '', ar: '' }, tab: 4 },
            { field: 'globalDimension2Code', label: { fr: 'Code axe principal 2', en: 'Global Dimension 2', ar: 'البعد العام 2' }, showList: false, showCard: true, type: 'String', tooltip: { fr: '', en: '', ar: '' }, tab: 4 },
            { field: 'inventory', label: { fr: 'Stock', en: 'Inventory', ar: 'المخزون' }, showList: true, showCard: true, type: 'Number', tooltip: { fr: '', en: '', ar: '' }, tab: 3 },
            { field: 'familyNo', label: { fr: 'N° famille', en: 'Family No', ar: 'رقم العائلة' }, showList: false, showCard: true, type: 'Lookup', lookupEntity: 'ItemFamily', tooltip: { fr: '', en: '', ar: '' }, tab: 1 },
            { field: 'subfamilyNo', label: { fr: 'N° sous-famille', en: 'Subfamily No', ar: 'رقم العائلة الفرعية' }, showList: false, showCard: true, type: 'Lookup', lookupEntity: 'ItemSubFamily', tooltip: { fr: '', en: '', ar: '' }, tab: 1 },
            { field: 'maximumCoverage', label: { fr: 'Couverture maximum', en: 'Maximum Coverage', ar: 'الغطاء الأقصى' }, showList: false, showCard: true, type: 'Number', tooltip: { fr: '', en: '', ar: '' }, tab: 3 },
            { field: 'minimumCoverage', label: { fr: 'Couverture minimum', en: 'Minimum Coverage', ar: 'الغطاء الأدنى' }, showList: false, showCard: true, type: 'Number', tooltip: { fr: '', en: '', ar: '' }, tab: 3 },
            ...auditFields
        ]
    },

    Location: {
        apiURI: 'location',
        titleList: { fr: 'Liste des magasins', en: 'Location List', ar: 'قائمة المواقع' },
        titleForm: { fr: 'Magasin', en: 'Location', ar: 'الموقع' },
        breadcrumb: ['Stock'],
        fields: [
            { field: 'no', label: { fr: 'N°', en: 'No', ar: 'الرقم' }, showList: true, showCard: true, type: 'String', tooltip: { fr: '', en: '', ar: '' }, tab: 1 },
            { field: 'name', label: { fr: 'Nom', en: 'Name', ar: 'الاسم' }, showList: true, showCard: true, type: 'String', tooltip: { fr: '', en: '', ar: '' }, tab: 1 },
            { field: 'address', label: { fr: 'Adresse', en: 'Address', ar: 'العنوان' }, showList: false, showCard: true, type: 'String', tooltip: { fr: '', en: '', ar: '' }, tab: 1 },
            { field: 'city', label: { fr: 'Ville', en: 'City', ar: 'المدينة' }, showList: false, showCard: true, type: 'String', tooltip: { fr: '', en: '', ar: '' }, tab: 1 },
            { field: 'phoneNo', label: { fr: 'N° téléphone', en: 'Phone No', ar: 'رقم الهاتف' }, showList: false, showCard: true, type: 'String', tooltip: { fr: '', en: '', ar: '' }, tab: 1 },
            { field: 'contact', label: { fr: 'Contact', en: 'Contact', ar: 'جهة الاتصال' }, showList: false, showCard: true, type: 'String', tooltip: { fr: '', en: '', ar: '' }, tab: 1 },
            { field: 'postalCode', label: { fr: 'Code postal', en: 'Postal Code', ar: 'الرمز البريدي' }, showList: false, showCard: true, type: 'String', tooltip: { fr: '', en: '', ar: '' }, tab: 1 },
            { field: 'email', label: { fr: 'E-mail', en: 'E-mail', ar: 'البريد الإلكتروني' }, showList: false, showCard: true, type: 'String', tooltip: { fr: '', en: '', ar: '' }, tab: 1 },
            { field: 'homePage', label: { fr: 'Page d\'accueil', en: 'Home Page', ar: 'الصفحة الرئيسية' }, showList: false, showCard: true, type: 'String', tooltip: { fr: '', en: '', ar: '' }, tab: 1 },
            { field: 'useAsInTransit', label: { fr: 'Utiliser comme transit', en: 'Use As In Transit', ar: 'استخدام كعبور' }, showList: false, showCard: true, type: 'Boolean', tooltip: { fr: '', en: '', ar: '' }, tab: 1 },
            { field: 'inventory', label: { fr: 'Stock', en: 'Inventory', ar: 'المخزون' }, showList: true, showCard: true, type: 'Number', tooltip: { fr: '', en: '', ar: '' }, tab: 1 },
            ...auditFields
        ]
    },

    // ========================================
    // SYSTEM MODULE ENTITIES
    // ========================================
    SeriesHeader: {
        apiURI: 'series_header',
        titleList: { fr: 'Liste des souches de numéros', en: 'Series Header List', ar: 'قائمة رؤوس السلاسل' },
        titleForm: { fr: 'Souche de numéros', en: 'Series Header', ar: 'رأس السلسلة' },
        breadcrumb: ['Configuration'],
        fields: [
            ...defaultFields.noDescription,
            { field: 'defaultNo', label: { fr: 'N° par défaut', en: 'Default No', ar: 'الرقم الافتراضي' }, showList: false, showCard: true, type: 'Boolean', tooltip: { fr: '', en: '', ar: '' }, tab: 1 },
            { field: 'manualNo', label: { fr: 'N° manuel', en: 'Manual No', ar: 'الرقم اليدوي' }, showList: false, showCard: true, type: 'Boolean', tooltip: { fr: '', en: '', ar: '' }, tab: 1 },
            { field: 'chronologicalOrder', label: { fr: 'Ordre chronologique', en: 'Chronological Order', ar: 'الترتيب الزمني' }, showList: false, showCard: true, type: 'Boolean', tooltip: { fr: '', en: '', ar: '' }, tab: 1 },
            { field: 'type', label: { fr: 'Type', en: 'Type', ar: 'النوع' }, showList: true, showCard: true, type: 'Dropdown', tooltip: { fr: '', en: '', ar: '' }, tab: 1, mandatory: true },
            ...auditFields
        ]
    },

    SeriesLine: {
        apiURI: 'series_line',
        titleList: { fr: 'Liste des lignes de souches', en: 'Series Line List', ar: 'قائمة أسطر السلاسل' },
        titleForm: { fr: 'Ligne de souche', en: 'Series Line', ar: 'سطر السلسلة' },
        breadcrumb: ['Configuration'],
        fields: [
            { field: 'documentNo', label: { fr: 'N° document', en: 'Document No', ar: 'رقم المستند' }, showList: true, showCard: true, type: 'String', tooltip: { fr: '', en: '', ar: '' }, tab: 1,disabled:true },
            { field: 'documentId', label: { fr: 'ID document', en: 'Document ID', ar: 'معرف المستند' }, showList: false, showCard: false, type: 'Number', tooltip: { fr: '', en: '', ar: '' }, tab: 1, },
            { field: 'startDate', label: { fr: 'Date début', en: 'Start Date', ar: 'تاريخ البداية' }, showList: true, showCard: true, type: 'Date', tooltip: { fr: '', en: '', ar: '' }, tab: 1, mandatory: true },
            { field: 'startNo', label: { fr: 'N° début', en: 'Start No', ar: 'رقم البداية' }, showList: true, showCard: true, type: 'String', tooltip: { fr: '', en: '', ar: '' }, tab: 1, mandatory: true },
            { field: 'endNo', label: { fr: 'N° fin', en: 'End No', ar: 'رقم النهاية' }, showList: true, showCard: true, type: 'String', tooltip: { fr: '', en: '', ar: '' }, tab: 1 },
            { field: 'lastNoUsed', label: { fr: 'Dernier N° utilisé', en: 'Last No Used', ar: 'آخر رقم مستخدم' }, showList: true, showCard: true, type: 'String', tooltip: { fr: '', en: '', ar: '' }, tab: 1,disabled:true },
            { field: 'lastDateUsed', label: { fr: 'Dernière date utilisée', en: 'Last Date Used', ar: 'آخر تاريخ مستخدم' }, showList: true, showCard: true, type: 'Date', tooltip: { fr: '', en: '', ar: '' }, tab: 1,disabled:true },
            ...auditFields
        ]
    },

    UnitOfMeasure: {
        apiURI: 'unit_of_measure',
        titleList: { fr: 'Liste des unités de mesure', en: 'Unit Of Measure List', ar: 'قائمة وحدات القياس' },
        titleForm: { fr: 'Unité de mesure', en: 'Unit Of Measure', ar: 'وحدة القياس' },
        breadcrumb: ['Configuration'],
        fields: [...defaultFields.noDescription, ...auditFields]
    },

    Territory: {
        apiURI: 'territory',
        titleList: { fr: 'Liste Des Secteurs', en: 'Territory List', ar: 'قائمة القطاعات' },
        titleForm: { fr: 'Secteur', en: 'Territory', ar: 'القطاع' },
        breadcrumb: ['Configuration'],
        fields: [
            { field: 'no', label: { fr: 'N°', en: 'No', ar: 'الرقم' }, showList: true, showCard: true, type: 'String', tooltip: { fr: '', en: '', ar: '' }, tab: 1 },
            { field: 'name', label: { fr: 'Nom', en: 'Name', ar: 'الاسم' }, showList: true, showCard: true, type: 'String', tooltip: { fr: '', en: '', ar: '' }, tab: 1 },
            ...auditFields
        ]
    },

    // ========================================
    // CONTACT MODULE ENTITIES
    // ========================================
    SalesPersonPurchaser: {
        apiURI: 'sales_person_purchaser',
        titleList: { fr: 'Vendeur/Acheteur', en: 'Sales Person/Purchaser List', ar: 'قائمة البائعين/المشترين' },
        titleForm: { fr: 'Vendeur/Acheteur', en: 'Sales Person/Purchaser', ar: 'البائع/المشتري' },
        breadcrumb: ['Configuration'],
        fields: [...defaultFields.contact, ...auditFields]
    },

    ShipmentAgent: {
        apiURI: 'shipment_agent',
        titleList: { fr: 'Liste des transporteurs', en: 'Shipment Agent List', ar: 'قائمة وكلاء الشحن' },
        titleForm: { fr: 'Transporteur', en: 'Shipment Agent', ar: 'وكيل الشحن' },
        breadcrumb: ['Configuration'],
        fields: [...defaultFields.contact, ...auditFields]
    },

    ResponsibilityCenter: {
        apiURI: 'responsibility_center',
        titleList: { fr: 'Liste des centres de responsabilité', en: 'Responsibility Center List', ar: 'قائمة مراكز المسؤولية' },
        titleForm: { fr: 'Centre de responsabilité', en: 'Responsibility Center', ar: 'مركز المسؤولية' },
        breadcrumb: ['Configuration'],
        fields: [
            ...defaultFields.contact,
            { field: 'address', label: { fr: 'Adresse', en: 'Address', ar: 'العنوان' }, showList: false, showCard: true, type: 'String', tooltip: { fr: '', en: '', ar: '' }, tab: 1 },
            { field: 'city', label: { fr: 'Ville', en: 'City', ar: 'المدينة' }, showList: false, showCard: true, type: 'String', tooltip: { fr: '', en: '', ar: '' }, tab: 1 },
            ...auditFields
        ]
    },

    // ========================================
    // FINANCE MODULE ENTITIES
    // ========================================
    PaymentTerms: {
        apiURI: 'payment_terms',
        titleList: { fr: 'Les conditions de paiement', en: 'Payment Terms List', ar: 'قائمة شروط الدفع' },
        titleForm: { fr: 'Condition de paiement', en: 'Payment Terms', ar: 'شروط الدفع' },
        breadcrumb: ['Finance'],
        fields: [
            { field: 'no', label: { fr: 'N°', en: 'No', ar: 'الرقم' }, showList: true, showCard: true, type: 'String', tooltip: { fr: '', en: '', ar: '' }, tab: 1 },
            { field: 'dueDateCalculation', label: { fr: 'Calcul date échéance', en: 'Due Date Calculation', ar: 'حساب تاريخ الاستحقاق' }, showList: true, showCard: true, type: 'Date', tooltip: { fr: '', en: '', ar: '' }, tab: 1 },
            { field: 'discountPercent', label: { fr: '% Remise', en: 'Discount %', ar: '% الخصم' }, showList: true, showCard: true, type: 'Number', tooltip: { fr: '', en: '', ar: '' }, tab: 1 },
            ...auditFields
        ]
    },

    PaymentMethod: {
        apiURI: 'payment_method',
        titleList: { fr: 'Liste des mode de règlement', en: 'Payment Method List', ar: 'قائمة طرق الدفع' },
        titleForm: { fr: 'Mode de règlement', en: 'Payment Method', ar: 'طريقة الدفع' },
        breadcrumb: ['Finance'],
        fields: [...defaultFields.noDescription, ...auditFields]
    }
};

// Export the entitiesWithSeriesHeaders list for use in components
window.entitiesWithSeriesHeaders = entitiesWithSeriesHeaders;
