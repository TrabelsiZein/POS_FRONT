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
      componentName: "Item",
      componentAPI: "item",
      showLoading: true,
      breadcrumbData: {
        title: "Liste Des Articles",
        route: [
          {
            text: 'Article',
          },
          {
            text: 'liste des articles',
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
            field: "description",
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