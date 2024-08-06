<template>

  <b-overlay :show="showLoading" spinner-variant="primary">

    <b-modal hide-footer ref="modal-series-lines" title="" scrollable size="xl">
      <SeriesLine :seriesHeaderNo="seriesHeaderNo" />
    </b-modal>

    <b-modal hide-footer ref="modal" title="" scrollable size="lg">
      <b-row>

        <b-col cols="12">
          <b-form-group label="N°">
            <b-form-input v-model="entity.no" ref="no" />
          </b-form-group>
        </b-col>

        <b-col cols="12">
          <b-form-group label="Description">
            <b-form-input v-model="entity.description" ref="description" />
          </b-form-group>
        </b-col>

        <b-col sm="12" md="6" lg="3">
          <b-form-group label="Type">
            <b-form-select size="sm" v-model="entity.type" :options="seriesTypeOptions" />
          </b-form-group>
        </b-col>

        <b-col sm="12" md="6" lg="3">
          <b-form-group label="N° par défaut">
            <b-form-checkbox v-model="entity.defaultNo" class="mr-0 mt-50" switch inline />
          </b-form-group>
        </b-col>

        <b-col sm="12" md="6" lg="3">
          <b-form-group label="N° manuels">
            <b-form-checkbox v-model="entity.manualNo" class="mr-0 mt-50" switch inline />
          </b-form-group>
        </b-col>

        <b-col sm="12" md="6" lg="3">
          <b-form-group label="Ordre chronologique">
            <b-form-checkbox v-model="entity.chronologicalOrder" class="mr-0 mt-50" switch inline />
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
import BLinkCellRenderer from './components/ag-grid/BLinkCellRenderer.vue';
import SeriesLine from './SeriesLine.vue';
export default {
  components: {
    List,
    SeriesLine
  },
  data() {
    return {
      seriesHeaderNo: "",
      showLoading: true,
      entity: {},
      emptyEntity: {
        no: "",
        description: "",
        defaultNo: false,
        manualNo: false,
        chronologicalOrder: false,
      },
      seriesTypeOptions: ["Annual", "Monthly", "None"],
      selectedEntity: null,
      componentName: "SeriesHeader",
      componentAPI: "series_header",
      breadcrumbData: {
        title: "Liste Des Souches",
        route: [
          {
            text: 'Configuration',
          },
          {
            text: 'Souches',
            active: true,
          },
        ],
        withFilter: false
      },
      agGridData: {
        columnDefs: [
          {
            headerName: "Code",
            field: "no",
          },
          {
            headerName: "Description",
            field: "description",
          },
          {
            hide: !this.$can("READ", "SeriesLine"),
            headerName: "#",
            cellRendererFramework: 'bLinkCellRenderer',
            cellRendererParams: { linkClicked: this.openSeriesLines, }
          },
        ],
        rows: []
      },
    }
  },
  created() {
    this.$options.components.bLinkCellRenderer = BLinkCellRenderer;
    this.entity = { ...this.emptyEntity };
    this.loadData();
  },
  methods: {
    openSeriesLines(data) {
      this.seriesHeaderNo = data.no;
      this.$refs["modal-series-lines"].show();
    },
    async loadData() {
      let response = await this.$http.get(this.componentAPI);
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