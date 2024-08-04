<template>

  <div>

    <List :componentName="componentName" :componentAPI="componentAPI" :breadcrumbData="breadcrumbData"
      :agGridData="agGridData" />

  </div>
</template>

<script>

import List from '@/views/components/list/List.vue';

export default {
  components: {
    List
  },
  data() {
    return {
      componentName: "RolesManagement",
      componentAPI: "role",
      breadcrumbData: {
        title: "Liste Des Roles",
        route: [
          {
            text: 'Configuration',
          },
          {
            text: 'Roles',
          },
          {
            text: 'Liste',
            active: true,
          },
        ],
        withFilter: false
      },
      agGridData: {
        columnDefs: [
          {
            headerName: "Nom",
            field: "name",
          },
          {
            headerName: "Description",
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
      let response = await this.$http.get("role");
      this.agGridData.rows = response.data;
    }
  }
}
</script>

<style></style>
