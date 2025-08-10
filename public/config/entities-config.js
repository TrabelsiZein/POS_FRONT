// const noField = { field: 'no', headerName: 'N°', hide: false, type: 'string' };
const noField = { field: 'no', label: { fr: 'N°', en: '', ar: '' }, showList: true, showCard: true, type: 'String', tooltip: { fr: '', en: '', ar: '' }, tab: 1 };
const descriptionField = { field: 'description', label: { fr: 'Description', en: '', ar: '' }, showList: true, showCard: true, type: 'String', tooltip: { fr: '', en: '', ar: '' }, tab: 1 };
const nameField = { field: 'name', label: { fr: 'Nom', en: '', ar: '' }, showList: true, showCard: true, type: 'String', tooltip: { fr: '', en: '', ar: '' }, tab: 1 };

const auditFields = [
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

window.entities = {
    Vendor: {
        apiURI: 'vendor',
        titleList: { fr: 'Liste des fournisseurs', en: 'Vendor', ar: 'المورد' },
        titleForm: { fr: 'Fiche Fournisseur', en: 'Vendor Card', ar: 'بطاقة المورد' },
        breadcrumb: ['Fournisseur'],
        tabs: [{ id: 1, title: { fr: 'Général', en: 'General', ar: 'عام' }, open: true }, { id: 2, title: { fr: 'Comptabilité', en: 'Accounting', ar: 'المحاسبة' }, open: false }],
        fields: [
            ...defaultFields.noName,
            { field: 'name2', label: { fr: 'Nom 2', en: '', ar: '' }, showList: false, showCard: true, type: 'String', tooltip: { fr: '', en: '', ar: '' }, tab: 1 },
            { field: 'address', label: { fr: 'Adresse', en: '', ar: '' }, showList: false, showCard: true, type: 'String', tooltip: { fr: '', en: '', ar: '' }, tab: 1 },
            { field: 'contact', label: { fr: 'Contact', en: '', ar: '' }, showList: false, showCard: true, type: 'String', tooltip: { fr: '', en: '', ar: '' }, tab: 1 },
            { field: 'phoneNo', label: { fr: 'N° téléphone', en: '', ar: '' }, showList: true, showCard: true, type: 'String', tooltip: { fr: '', en: '', ar: '' }, tab: 1 },
            { field: 'territoryCode', label: { fr: 'Code secteur', en: '', ar: '' }, showList: false, showCard: true, type: 'Lookup', lookupEntity: 'Territory', tooltip: { fr: '', en: '', ar: '' }, tab: 1 },
            { field: 'globalDimension1Code', label: { fr: 'Code axe principal 1', en: '', ar: '' }, showList: false, showCard: true, type: 'String', tooltip: { fr: '', en: '', ar: '' }, tab: 2 },
            { field: 'globalDimension2Code', label: { fr: 'Code axe principal 2', en: '', ar: '' }, showList: false, showCard: true, type: 'String', tooltip: { fr: '', en: '', ar: '' }, tab: 2 },
            { field: 'vendorPostingGroup', label: { fr: 'Groupe compta. fournisseur', en: '', ar: '' }, showList: false, showCard: true, type: 'String', tooltip: { fr: '', en: '', ar: '' }, tab: 1 },
            // { field: 'currencyCode', label: { fr: 'Code devise', en: '', ar: '' }, showList: false, showCard: true, type: 'Lookup', lookupEntity: 'Currency', tooltip: { fr: '', en: '', ar: '' }, tab: 1 },
            { field: 'paymentTermsCode', label: { fr: 'Code condition paiement', en: '', ar: '' }, showList: false, showCard: true, type: 'Lookup', lookupEntity: 'PaymentTerms', tooltip: { fr: '', en: '', ar: '' }, tab: 1 },
            { field: 'purchaserCode', label: { fr: 'Code acheteur', en: '', ar: '' }, showList: false, showCard: true, type: 'Lookup', lookupEntity: 'SalesPersonPurchaser', tooltip: { fr: '', en: '', ar: '' }, tab: 1 },
            { field: 'shippingAgentCode', label: { fr: 'Code transporteur', en: '', ar: '' }, showList: false, showCard: true, type: 'Lookup', lookupEntity: 'ShipmentAgent', tooltip: { fr: '', en: '', ar: '' }, tab: 1 },
            { field: 'payToVendorNo', label: { fr: 'N° fournisseur à payer', en: '', ar: '' }, showList: false, showCard: true, type: 'Lookup', lookupEntity: 'Vendor', tooltip: { fr: '', en: '', ar: '' }, tab: 1 },
            { field: 'paymentMethodCode', label: { fr: 'Code mode de règlement', en: '', ar: '' }, showList: false, showCard: true, type: 'Lookup', lookupEntity: 'PaymentMethod', tooltip: { fr: '', en: '', ar: '' }, tab: 1 },
            { field: 'balance', label: { fr: 'Solde', en: '', ar: '' }, showList: true, showCard: true, type: 'String', tooltip: { fr: '', en: '', ar: '' }, tab: 1 },
            { field: 'balanceLCY', label: { fr: 'Solde DS', en: '', ar: '' }, showList: false, showCard: true, type: 'String', tooltip: { fr: '', en: '', ar: '' }, tab: 1 },
            { field: 'pricesIncludingVAT', label: { fr: 'Prix TTC', en: '', ar: '' }, showList: false, showCard: true, type: 'Boolean', tooltip: { fr: '', en: '', ar: '' }, tab: 1 },
            { field: 'vatRegistrationNo', label: { fr: 'Matricule fiscal', en: '', ar: '' }, showList: false, showCard: true, type: 'String', tooltip: { fr: '', en: '', ar: '' }, tab: 1 },
            // { field: 'genBusPostingGroup', label: { fr: 'Groupe compta. marché', en: '', ar: '' }, showList: false, showCard: true, type: 'Lookup', lookupEntity: 'GeneralBusinessPostingGroup', tooltip: { fr: '', en: '', ar: '' }, tab: 1 },
            { field: 'email', label: { fr: 'Adresse e-mail', en: '', ar: '' }, showList: false, showCard: true, type: 'String', tooltip: { fr: '', en: '', ar: '' }, tab: 1 },
            // { field: 'noSeries', label: { fr: 'Souches de n°', en: '', ar: '' }, showList: false, showCard: true, type: 'Lookup', lookupEntity: 'SeriesHeader', tooltip: { fr: '', en: '', ar: '' }, tab: 2 },
            // { field: 'vatBusPostingGroup', label: { fr: 'Groupe compta. marché TVA', en: '', ar: '' }, showList: false, showCard: true, type: 'Lookup', lookupEntity: 'GeneralBusinessPostingGroup', tooltip: { fr: '', en: '', ar: '' }, tab: 1 },
            // { field: 'locationCode', label: { fr: 'Code magasin', en: '', ar: '' }, showList: false, showCard: true, type: 'Lookup', lookupEntity: 'Location', tooltip: { fr: '', en: '', ar: '' }, tab: 2 },
            ...auditFields
        ]
    },
    PaymentMethod: {
        apiURI: 'payment_method',
        titleList: { fr: 'Liste des mode de règlement', en: '', ar: '' },
        titleForm: { fr: 'Mode de règlement', en: '', ar: '' },
        breadcrumb: ['Finance'],
        fields: [...defaultFields.noDescription, ...auditFields]
    },

    PaymentTerms: {
        apiURI: 'payment_terms',
        titleList: { fr: 'Les conditions de paiement', en: '', ar: '' },
        titleForm: { fr: 'Condition de paiement', en: '', ar: '' },
        breadcrumb: ['Finance'],
        fields: [
            noField,
            { field: 'dueDateCalculation', headerName: 'Calcul date échéance', showList: true, showCard: true, type: 'Date' },
            { field: 'discountPercent', headerName: '% Remise', showList: true, showCard: true, type: 'Number' },
            ...auditFields
        ]
    },

    SalesPersonPurchaser: {
        apiURI: 'sales_person_purchaser',
        titleList: { fr: 'Vendeur/Acheteur', en: '', ar: '' },
        titleForm: { fr: 'Vendeur/Acheteur', en: '', ar: '' },
        fields: [...defaultFields.contact, ...auditFields]
    },

    ShipmentAgent: {
        apiURI: 'shipment_agent',
        titleList: { fr: 'Vendeur/Acheteur', en: '', ar: '' },
        titleForm: { fr: 'Vendeur/Acheteur', en: '', ar: '' },
        fields: [...defaultFields.contact, ...auditFields]
    },

    Territory: {
        apiURI: 'territory',
        titleList: { fr: 'Liste Des Secteurs', en: '', ar: '' },
        titleForm: { fr: 'Secteur', en: '', ar: '' },
        breadcrumb: ['Configuration'],
        fields: [...defaultFields.noName, ...auditFields]
    },
};
