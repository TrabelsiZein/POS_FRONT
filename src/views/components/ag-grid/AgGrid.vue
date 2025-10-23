<template>

    <ag-grid-vue :gridOptions="gridOptions" :headerHeight="32" :rowHeight="50"
        :class="isDark ? 'ag-theme-balham-dark' : 'ag-theme-balham'" style="width: 100%; height: 67vh;"
        :defaultColDef="defaultColDef" @grid-ready="onGridReady" @first-data-rendered="onFirstDataRendered"
        :pagination="true" paginationPageSize="30" :columnDefs="agGridColumnDefs" :rowData="agGridData"
        :overlayLoadingTemplate="overlayLoadingTemplate" :tooltipShowDelay="2000">
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
            type: Array,
            required: true,
        },
        agGridColumnDefs: {
            type: Array,
            required: true,
        },
        sizeColumnsToFit: {
            type: Boolean,
            default: true,
        },
        multiRowSelection: {
            type: Boolean,
            default: false,
        },
    },
    setup() {
        const { skin } = useAppConfig()
        const isDark = computed(() => skin.value === 'dark')
        return { skin, isDark }
    },
    data() {
        return {
            handleColumnsConfigChanged: false,
            overlayLoadingTemplate: '<span class="ag-overlay-loading-center">Merci de patienter pendant le chargement des données...</span>',
            gridOptions: {
                localeText: frenshVersion,
                rowSelection: this.multiRowSelection ? 'multiple' : 'single',
                suppressCellSelection: true,
                enableCellTextSelection: true,
                onColumnMoved: params => {
                    this.onColumnChanged(params);
                },
                onColumnVisible: params => {
                    this.onColumnChanged(params);
                },
                onColumnResized: params => {
                    if (params.finished) {
                        this.onColumnChanged(params);
                    }
                }
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
                tooltipValueGetter: params => this.getTooltipContent(params.data),
            },
            gridApi: null,
            columnApi: null,
        }
    },
    methods: {
        onColumnChanged(params) {
            if (this.handleColumnsConfigChanged)
                this.$emit('onColumnChanged', params);
        },
        getTooltipContent(data) {
            const { createdBy, createdAt, updatedBy, updatedAt } = data;
            return `Created By: ${createdBy}\nCreated At: ${createdAt}\nUpdated By: ${updatedBy}\nUpdated At: ${updatedAt}`;
        },
        onCellValueChanged(params) {
            this.$emit('onCellValueChanged', params);
        },
        onCellClicked(params) {
            this.$emit('onCellClicked', params);
        },
        handleCellDoubleClick(params) {
            this.$emit('cellDoubleClicked', params);
        },
        onFirstDataRendered(params) {
            this.$emit('onFirstDataRendered');
            params.api.hideOverlay();
            this.handleColumnsConfigChanged = true;
        },
        onGridReady(params) {
            // params.api.showLoadingOverlay();
            this.gridApi = params.api;
            this.columnApi = params.columnApi;
            if (this.sizeColumnsToFit) {
                if (!/Mobi/i.test(navigator.userAgent))
                    this.gridApi.sizeColumnsToFit();
            }
            // else
            //     this.columnApi.autoSizeAllColumns();
            this.$emit('onGridReady', params);
        },
        updateSearchQuery(val) {
            this.gridApi.setQuickFilter(val);
        },
    },
    watch: {
        multiRowSelection(val) {

            // 1. Update grid option (note: this does NOT apply dynamically)
            this.gridOptions.rowSelection = val ? 'multiple' : 'single';

            // 2. Deselect all selected rows
            if (this.gridApi) {
                this.gridApi.deselectAll();
            }

            // 3. Define unique colId for checkbox column
            const checkboxColId = '__checkbox__';

            // 4. Get current column definitions
            const currentDefs = this.gridApi.getColumnDefs();

            // 5. Check if checkbox column already exists
            const checkboxExists = currentDefs.some(col => col.colId === checkboxColId);

            if (val) {
                if (!checkboxExists) {
                    const checkboxCol = {
                        colId: checkboxColId,
                        headerName: '',
                        checkboxSelection: true,
                        headerCheckboxSelection: true,
                        width: 40,
                        pinned: 'left',
                        resizable: false,
                        suppressColumnsToolPanel: true,
                        suppressMovable: true,
                        filter: false,
                        sortable: false
                    };

                    this.gridApi.setColumnDefs([checkboxCol, ...currentDefs]);
                } else {
                    this.columnApi.setColumnVisible(checkboxColId, true);
                }
            } else {
                if (checkboxExists) {
                    this.columnApi.setColumnVisible(checkboxColId, false);
                    // const updatedDefs = this.gridApi
                    //     .getColumnDefs()
                    //     .filter(col => col.colId !== checkboxColId);

                    // this.gridApi.setColumnDefs(updatedDefs);
                }
            }
            if (this.sizeColumnsToFit) {                
                if (!/Mobi/i.test(navigator.userAgent))
                    this.gridApi.sizeColumnsToFit();
            }
        }
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

<style>
.ag-tooltip {
    white-space: pre-wrap;
    /* Ensures line breaks are respected */
    background-color: #ffffff;
    /* Optional: Background color */
    border: 1px solid #cccccc;
    /* Optional: Border */
    padding: 5px;
    /* Optional: Padding */
    border-radius: 3px;
    /* Optional: Rounded corners */
}
</style>