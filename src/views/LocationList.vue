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
      componentName: "Location",
      componentAPI: "location",
      showLoading: true,
      breadcrumbData: {
        title: "Liste Des Magasins",
        route: [
          {
            text: 'Configuration',
          },
          {
            text: 'Magasin',
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