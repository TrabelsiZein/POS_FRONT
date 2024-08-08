<template>

  <b-overlay :show="showLoading" spinner-variant="primary">

    <List :componentName="componentName" :componentAPI="componentAPI" :breadcrumbData="breadcrumbData"
      :agGridData="agGridData" />

  </b-overlay>
</template>

<script>

import List from '@/views/components/list/List.vue';

export default {
  components: {
    List
  },
  data() {
    return {
      componentName: "GeneralLedgerAccount",
      componentAPI: "general_ledger_account",
      showLoading: true,
      breadcrumbData: {
        title: "Compte Grand Livre",
        route: [
          {
            text: 'Configuration',
          },
          {
            text: 'Compte Grand Livre',
            active: true,
          },
        ],
        withFilter: false
      },
      agGridData: {
        columnDefs: [
          {
            headerName: "N°",
            field: "no",
          },
          {
            headerName: "Nom",
            field: "name",
          },
          {
            headerName: "Type compte",
            field: "accountType",
          },
          {
            headerName: "Catégorie du compte",
            field: "accountCategory",
          },
          {
            headerName: "Groupe compta. Marché",
            field: "genBusinessPostingGroup",
          },
          {
            headerName: "Groupe compta. Produit",
            field: "genProductPostingGroup",
          },
        ],
        rows: []
      },
    }
  },
  created() {
    this.loadData();
  },
  methods: {
    async loadData() {
      let response = await this.$http.get(this.componentAPI);
      this.agGridData.rows = response.data;
      this.showLoading = false;
    }
  }
}
</script>