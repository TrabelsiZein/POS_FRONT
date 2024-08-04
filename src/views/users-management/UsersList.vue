<template>

  <div>

    <List :componentName="componentName" :breadcrumbData="breadcrumbData" :agGridData="agGridData" />

  </div>
</template>

<script>

import List from '@/views/components/list/List.vue';
import BadgeCell from '@/views/components/ag-grid/BadgeCell.vue'

export default {
  components: {
    List
  },
  data() {
    return {
      componentName: "UsersManagement",
      breadcrumbData: {
        title: "Liste Des Utilisateurs",
        route: [
          {
            text: 'Configuration',
          },
          {
            text: 'Utilisateurs',
          },
          {
            text: 'Liste',
            active: true,
          },
        ]
      },
      agGridData: {
        singleClickEdit: true,
        columnDefs: [
          {
            headerName: "Username",
            field: "username",
          },
          {
            headerName: "Email",
            field: "email",
          },
          {
            headerName: "Statut",
            field: "active",
            cellRendererFramework: 'badgeCell',
            cellRendererParams: { componentName: "UsersManagement" },
            width: 100
          },
        ],
        rows: []
      },
    }
  },
  created() {
    this.$options.components.badgeCell = BadgeCell;
    this.loadData();
  },
  methods: {
    async loadData() {
      let response = await this.$http.get("user");
      this.agGridData.rows = response.data;
    }
  }
}
</script>

<style></style>
