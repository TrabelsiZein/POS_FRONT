// Utility to safely access entities from global config
const getEntities = () => {
  if (!window.entities) {
    console.warn('⚠️ window.entities is not defined. Make sure entities-config.js is loaded.');
    return {};
  }
  return window.entities;
};

export const getColumnDefinitionForList = entityName => {
  const entity = getEntities()[entityName];
  if (!entity || !entity.fields) return [];

  return entity.fields.map(element => ({
    field: element.field,
    headerName: element.label?.fr || element.headerName || element.field,
    hide: !element.showList,
  }));
};

// export const getColumnDefinitionForCard = entityName => {
//   return getEntities()[entityName] || {};
// };

export const getColumnDefinitionForCard = (entityName, locale = 'fr') => {
  console.log("getColumnDefinitionForCard is called with entityName:", entityName);

  const entity = getEntities()[entityName];
  if (!entity) return null;
  
  
  const apiURI = entity.apiURI || '';
  const titleForm = entity.titleForm?.[locale] || '';
  
  const rawFields = (entity.fields.filter(item => item.showCard) || []).flat();

  // Enrich fields with lookupApiURI if needed
  rawFields.forEach(field => {
    if (field.type === 'Lookup' && field.lookupEntity) {
      field.lookupApiURI = getEntityApiURI(field.lookupEntity) || null;
    }
  });

  // Case 1: With Tabs
  if (Array.isArray(entity.tabs)) {
    const tabMap = {};

    entity.tabs.forEach(tab => {
      tabMap[tab.id] = { ...tab, fields: [] };
    });

    rawFields.forEach(field => {
      const tabId = field.tab ?? 1;
      if (tabMap[tabId]) {
        tabMap[tabId].fields.push(field);
      }
    });

    return {
      apiURI,
      titleForm,
      tabs: Object.values(tabMap)
    };
  }

  // Case 2: No Tabs
  return {
    apiURI,
    titleForm,
    fields: rawFields
  };
};



export const getEntityApiURI = entityName => {
  return getEntities()[entityName]?.apiURI || '';
};

export const getBreadcrumbList = (entityName, locale = 'fr') => {
  const entity = getEntities()[entityName];
  if (!entity) return null;

  const baseCrumbs = (entity.breadcrumb || []).map(text => ({ text }));

  return {
    title: entity.titleList?.[locale] || '',
    route: [
      ...baseCrumbs,
      {
        text: entity.titleList?.[locale] || '',
        active: true,
      },
    ],
  };
};

export const getBreadcrumbCard = (entityName, $route, locale = 'fr') => {
  const entity = getEntities()[entityName];
  if (!entity) return null;

  const baseCrumbs = (entity.breadcrumb || []).map(text => ({ text }));

  return {
    title: entity.titleForm?.[locale] || '',
    route: [
      ...baseCrumbs,
      {
        text: entity.titleList?.[locale] || '',
      },
      {
        text: 'Fiche',
        active: true,
      },
    ],
    showDeleteBtn: !!$route?.params?.id,
  };
};
