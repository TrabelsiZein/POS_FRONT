<template>

    <ag-grid-vue :gridOptions="gridOptions" :headerHeight="32" :rowHeight="50"
        :class="isDark ? 'ag-theme-balham-dark' : 'ag-theme-balham'" style="width: 100%; height: 67vh;"
        :defaultColDef="defaultColDef" @grid-ready="onGridReady" :pagination="true" paginationPageSize="30"
        :columnDefs="agGridData.columnDefs" :rowData="agGridData.rows" :overlayLoadingTemplate="overlayLoadingTemplate">
    </ag-grid-vue>

</template>

<script>
import "ag-grid-community/dist/styles/ag-grid.css";
import '@/assets/ag-grid/ag-theme-balham.css';
import '@/assets/ag-grid/ag-theme-balham-dark.css';
import {
    AgGridVue
} from 'ag-grid-vue';
import useAppConfig from '@core/app-config/useAppConfig'
import { computed } from '@vue/composition-api'
import frenshVersion from "@/utils/frenshAgGrid";

export default {
    components: {
        AgGridVue
    },
    props: {
        agGridData: {
            type: Object,
            required: true,
        },
        pageTitle: {
            type: String,
        },
        autoSizeColumns: {
            type: Boolean
        },
    },
    setup() {
        const { skin } = useAppConfig()
        const isDark = computed(() => skin.value === 'dark')
        return { skin, isDark }
    },
    data() {
        return {
            overlayLoadingTemplate: '<span class="ag-overlay-loading-center">Merci de patienter pendant le chargement des données...</span>',
            gridOptions: {
                localeText: frenshVersion,
                // rowSelection: "multiple",
                rowSelection: "single",
                suppressCellSelection: true,
                enableCellTextSelection: true,
            },
            defaultColDef: {
                onCellDoubleClicked: this.handleCellDoubleClick,
                onCellClicked: this.onCellClicked,
                onCellValueChanged: this.onCellValueChanged,
                sortable: true,
                resizable: true,
                suppressToolPanel: false,
                filter: true,
                cellStyle: {
                    // 'font-size': '.950rem',
                    // 'vertical-align': 'middle',
                    'font-weight': '500',
                    // 'font-weight': 'bold',
                    'border': '1px solid #EBE9F1',
                    'border-width': '1px',
                    'font-family': "'Montserrat', Helvetica, Arial, serif"
                },
            },
            gridApi: null,
            columnApi: null,
            collapseVisible: false,
        }
    },
    methods: {
        onCellValueChanged(params) {
            this.$emit('onCellValueChanged', params);
        },
        onCellClicked(params) {
            this.$emit('onCellClicked', params);
        },
        handleCellDoubleClick(params) {
            this.$emit('cellDoubleClicked', params);
        },
        filterClicked(obj) {
            this.collapseVisible = !this.collapseVisible;
            this.$emit('filterClicked', obj)
        },
        onFirstDataRendered(params) {
            this.$emit('onFirstDataRendered');
            params.api.hideOverlay();
        },
        onGridReady(params) {
            params.api.showLoadingOverlay();
            this.gridApi = params.api;
            this.columnApi = params.columnApi;
            if (!this.autoSizeColumns)
                if (!/Mobi/i.test(navigator.userAgent))
                    this.gridApi.sizeColumnsToFit();
            this.$emit('onGridReady');
        },
        updateSearchQuery(val) {
            this.gridApi.setQuickFilter(val);
        },
    }
}
</script>

<style scoped>
@media (max-width: 769px) {
    .ag-theme-balham {
        height: 80vh ! important;
    }
}
</style>