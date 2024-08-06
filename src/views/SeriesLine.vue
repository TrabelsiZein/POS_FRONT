<template>

  <b-overlay :show="showLoading" spinner-variant="primary">

    <b-modal hide-footer ref="modal" title="" scrollable size="lg">
      <b-row>

        <b-col sm="12" md="12" lg="6">
          <b-form-group label="Code souche">
            <b-form-input v-model="entity.documentNo" disabled />
          </b-form-group>
        </b-col>

        <b-col sm="12" md="12" lg="6">
          <b-form-group label="Date début">
            <b-form-datepicker v-model="entity.startDate" ref="no" />
          </b-form-group>
        </b-col>

        <b-col sm="12" md="12" lg="6">
          <b-form-group label="N° début">
            <b-form-input v-model="entity.startNo" />
          </b-form-group>
        </b-col>

        <b-col sm="12" md="12" lg="6">
          <b-form-group label="N° fin">
            <b-form-input v-model="entity.endNo" />
          </b-form-group>
        </b-col>

        <b-col sm="12" md="12" lg="6">
          <b-form-group label="Dernier n° utilisé">
            <b-form-input v-model="entity.lastNoUsed" />
          </b-form-group>
        </b-col>

        <b-col sm="12" md="12" lg="6">
          <b-form-group label="Dernière date utilisée">
            <b-form-datepicker v-model="entity.lastDateUsed" />
          </b-form-group>
        </b-col>

      </b-row>

      <hr>

      <b-row class="text-right">


        <b-col cols="12" md="12">
          <b-button variant="outline-primary" class="mr-50" @click="reset">
            <feather-icon icon="RotateCcwIcon" />
            Reset
          </b-button>
          <b-button variant="relief-success" @click="save">
            <feather-icon icon="SaveIcon" />
            Sauvegarder
          </b-button>
        </b-col>


      </b-row>


    </b-modal>

    <List :onlyListComponent="true" :componentName="componentName" :componentAPI="componentAPI"
      :breadcrumbData="breadcrumbData" :agGridData="agGridData" @newClicked="newClicked" @editclicked="editclicked" />

  </b-overlay>
</template>

<script>

import List from '@/views/components/list/List.vue';

export default {
  props: {
    seriesHeaderNo: {
      type: String,
      required: true,
    },
  },
  components: {
    List
  },
  data() {
    return {
      showLoading: true,
      entity: {},
      emptyEntity: {
        documentNo: this.seriesHeaderNo,
        startDate: "",
        startNo: "",
        endNo: "",
        lastNoUsed: "",
        lastDateUsed: "",
      },
      componentName: "SeriesLine",
      componentAPI: "series_line",
      breadcrumbData: {
        title: "Lignes De Souche",
        route: [
          {
            text: 'Configuration',
          },
          {
            text: 'Lignes De Souche',
            active: true,
          },
        ],
        withFilter: false
      },
      agGridData: {
        columnDefs: [
          {
            headerName: "Date début",
            field: "startDate",
          },
          {
            headerName: "N° début",
            field: "startNo",
          },
          {
            headerName: "N° fin",
            field: "endNo",
          },
          {
            headerName: "Dernier n° utilisé",
            field: "lastNoUsed",
          },
          {
            headerName: "Dernière date utilisée",
            field: "lastDateUsed",
          },
        ],
        rows: []
      },
    }
  },
  created() {
    this.entity = { ...this.emptyEntity };
    this.loadData();
  },
  methods: {
    async loadData() {
      let response = await this.$http.get(this.componentAPI + "/findByField", { params: { fieldName: "documentNo", operation: "=", value: this.seriesHeaderNo } });
      this.agGridData.rows = response.data;
      this.showLoading = false;
    },
    newClicked() {
      this.entity = { ...this.emptyEntity };
      this.selectedEntity = null;
      this.$refs['modal'].show();
      setTimeout(() => {
        this.$refs["no"].focus();
      }, 300);
    },
    editclicked(data) {
      this.entity = { ...data };
      this.selectedEntity = { ...data };
      this.$refs['modal'].show();
      setTimeout(() => {
        this.$refs["no"].focus();
      }, 300);
    },
    async save() {
      this.showLoading = true;
      try {
        await this.$http.post(this.componentAPI, this.entity);
        this.$refs["modal"].hide();
        this.loadData();
      } catch {
        this.showLoading = false;
      }
    },
    reset() {
      if (this.selectedEntity == null)
        this.entity = { ...this.emptyEntity };
      else
        this.entity = { ...this.selectedEntity };
    }
  }
}
</script>