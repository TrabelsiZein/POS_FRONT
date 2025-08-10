<template>

    <b-overlay :show="showLoading" spinner-variant="primary">

        <CardPopup v-if="onlyListComponent" :componentName="componentName" ref="popup" :entityData="entityPopup"
            :editMode="editMode" @entitySaved="loadData" />

        <b-card>

            <Breadcrumb :filterFields="filterFields" :onlyListComponent="onlyListComponent"
                :componentName="componentName" :breadcrumbData="localBreadcrumbData" @editClicked="editClicked"
                @downloadClicked="downloadClicked" @printClicked="printClicked" @deleteClicked="deleteClicked"
                @updateSearchQuery="updateSearchQuery" @newClicked="newClicked"
                @filterSearchChnaged="filterSearchChnaged" />

            <hr>

            <AgGrid v-if="agGridColumnDefs" :sizeColumnsToFit="sizeColumnsToFit" :agGridColumnDefs="agGridColumnDefs"
                :agGridData="localAgGridData" ref="agGrid" @cellDoubleClicked="cellDoubleClicked"
                @onColumnChanged="onColumnChanged" @onGridReady="onGridReady" :multiRowSelection="multiRowSelection" />

        </b-card>

        <ListCustomizer v-if="columnApi" :columnApi="columnApi" :gridApi="gridApi" :sizeColumnsToFit="sizeColumnsToFit"
            @sizeColumnsToFit="sizeColumnsToFitChanged" :multiRowSelection="multiRowSelection"
            @multiRowSelectionChanged="multiRowSelectionChanged" @visibleColumnsChanged="visibleColumnsChanged" />

    </b-overlay>

</template>

<script>

import Breadcrumb from '../BreadcrumbList.vue'
import AgGrid from '../ag-grid/AgGrid.vue'
import * as XLSX from 'xlsx';
import FileSaver from 'file-saver';
import { getColumnDefinitionForList } from '@/entities/entitiesConfigService';
import { getBreadcrumbList } from '@/entities/entitiesConfigService';
import { getEntityApiURI } from '@/entities/entitiesConfigService';
import CardPopup from '../card/CardPopup.vue';

import ListCustomizer from './ListCustomizer.vue';

export default {
    components: {
        Breadcrumb,
        AgGrid,
        ListCustomizer,
        CardPopup
    },
    props: {
        componentName: {
            type: String,
            required: true,
        },
        breadcrumbData: {
            type: Object,
            required: false,
        },
        agGridData: {
            type: Array,
            required: false,
        },
        onlyListComponent: {
            type: Boolean,
        },
        retrieveDataFromParent: {
            type: Boolean,
            default: false,
        },
    },
    data() {
        return {
            editMode: false,
            entityPopup: {},
            filterFields: [],
            sizeColumnsToFit: true,
            multiRowSelection: false,
            agGridColumnDefs: null,
            showLoading: false,
            hasGridConfigChanged: false,
            columnApi: null,
            gridApi: null,
            localAgGridData: this.agGridData || [],
            localBreadcrumbData: this.breadcrumbData || {
                title: "",
                route: [],
                withFilter: false,
            },
        }
    },
    async mounted() {
        // If retrieveDataFromParent is false, show loading spinner
        if (!this.retrieveDataFromParent) {
            this.showLoading = true;
        }
        // If breadcrumbData is not provided, use default from columnDefinitions.js
        if (!this.breadcrumbData)
            this.localBreadcrumbData = getBreadcrumbList(this.componentName);
        // Add beforeunload event listener to save grid config
        window.addEventListener('beforeunload', this.handleBeforeUnload);

        // Default definitions from JS file
        const allDefs = getColumnDefinitionForList(this.componentName);

        try {
            const response = await this.$http.get("grid_config", {
                params: {
                    laptopKey: "laptopKey",
                    entity: this.componentName
                }
            });

            const config = response.data;
            if (!config?.configJson) {
                this.agGridColumnDefs = allDefs;
                return;
            }

            // Parse config JSON safely
            let parsed = config.configJson;
            if (typeof parsed === "string") parsed = JSON.parse(parsed);
            if (typeof parsed.configJson === "string") parsed = JSON.parse(parsed.configJson);
            else if (parsed.configJson) parsed = parsed.configJson;

            const columnState = parsed.columnState || [];
            const sizeColumnsToFit = parsed.sizeColumnsToFit ?? true;
            const multiRowSelection = parsed.multiRowSelection ?? false;
            this.multiRowSelection = multiRowSelection;
            this.sizeColumnsToFit = sizeColumnsToFit;


            // Build new columnDefs
            const mergedDefs = [];

            // Add saved columns with their config
            columnState.forEach(savedCol => {
                const defaultCol = allDefs.find(c => (c.colId || c.field) === savedCol.colId);
                if (defaultCol) {
                    mergedDefs.push({
                        ...defaultCol,
                        width: savedCol.width ?? defaultCol.width,
                        hide: savedCol.hide ?? defaultCol.hide,
                        pinned: savedCol.pinned ?? defaultCol.pinned,
                    });
                }
            });

            // Add missing default columns and hide them
            allDefs.forEach(defaultCol => {
                const colId = defaultCol.colId || defaultCol.field;
                const exists = mergedDefs.find(c => (c.colId || c.field) === colId);
                if (!exists) {
                    mergedDefs.push({
                        ...defaultCol,
                        hide: true
                    });
                }
            });

            if (this.multiRowSelection) {
                mergedDefs.unshift({
                    colId: '__checkbox__',
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
                });
            }

            this.agGridColumnDefs = mergedDefs;


        } catch (error) {
            console.log("Error loading grid config:", error);
            this.agGridColumnDefs = allDefs;
        }
    },
    beforeDestroy() {
        window.removeEventListener('beforeunload', this.handleBeforeUnload);
        this.saveGridConfigIfChanged();
    },
    methods: {
        sizeColumnsToFitChanged(value) {
            this.sizeColumnsToFit = value;
            this.hasGridConfigChanged = true;
            if (value) {
                const fullColumns = this.columnApi.getAllColumns().map(col => {
                    const colDef = col.getColDef();
                    return {
                        field: col.getColId(),
                        headerName: colDef.headerName,
                        width: col.getActualWidth(),
                        flex: col.getActualWidth() / 100,
                        hide: col.isVisible() === false,
                    };
                }).filter(col => col.field !== '__checkbox__');

                if (this.multiRowSelection)
                    fullColumns.unshift({
                        colId: '__checkbox__',
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
                    });
                this.agGridColumnDefs = fullColumns;
            } else {
                if (this.multiRowSelection) {
                    const allCols = this.columnApi.getAllColumns();
                    const colsToResize = allCols
                        .filter(col => col.getColId() !== '__checkbox__')  // exclude checkbox
                        .map(col => col.getColId());

                    this.columnApi.autoSizeColumns(colsToResize);
                } else
                    this.$refs.agGrid.gridOptions.columnApi.autoSizeAllColumns();
            }
        },
        multiRowSelectionChanged(val) {
            this.multiRowSelection = val;
            this.hasGridConfigChanged = true;
        },
        onColumnChanged(params) {
            this.hasGridConfigChanged = true;
            if (params.type === "columnVisible" || (params.type === "columnResized" && params.source === "uiColumnDragged")) {
                this.sizeColumnsToFit = false;
            }
        },
        saveGridConfigIfChanged() {
            if (!this.hasGridConfigChanged) return;

            const config = this.getCurrentGridColumnConfig();
            if (!config) return;


            // ❌ DO NOT wrap again in JSON.stringify(config)
            this.$http.post('grid_config', {
                configJson: config,
            }, {
                params: {
                    laptopKey: "laptopKey",
                    entity: this.componentName
                }
            });
        },
        getCurrentGridColumnConfig() {
            if (!this.$refs.agGrid.gridOptions.columnApi) return null;

            const columnState = this.$refs.agGrid.gridOptions.columnApi.getColumnState().filter(item => item.hide === false && item.colId != '__checkbox__'); // includes order, width, visibility
            const sortModel = this.gridApi.getSortModel(); // optional: saves sort order

            return {
                columnState,
                sortModel,
                sizeColumnsToFit: this.sizeColumnsToFit,
                multiRowSelection: this.multiRowSelection,
            };
        },
        visibleColumnsChanged(visibleColumns) {
            this.filterFields = visibleColumns.map(col => ({
                value: col.colId,
                text: col.headerName,
            }));
        },
        onGridReady(params) {
            this.gridApi = params.api;
            this.columnApi = params.columnApi;
            this.$emit('onGridReady');
        },
        editClicked() {
            if (this.$refs.agGrid.gridApi.getSelectedRows().length > 0) {
                const selectedData = this.$refs.agGrid.gridApi.getSelectedRows();
                if (this.onlyListComponent) {
                    this.editMode = true;
                    this.entityPopup = selectedData[0];
                    this.$refs.popup.$refs.modal.show();
                    this.$emit('editclicked', selectedData[0]);
                }
                else
                    this.$router.push({ name: this.componentName + "_EDIT", params: { id: selectedData[0].id } })
            }
        },
        cellDoubleClicked(params) {
            if (this.$can('EDIT', this.componentName))
                if (this.onlyListComponent) {
                    this.editMode = true;
                    this.entityPopup = params.data;
                    this.$refs.popup.$refs.modal.show();
                    this.$emit('editclicked', params.data);
                }
                else
                    this.$router.push({ name: this.componentName + "_EDIT", params: { id: params.data.id } })
        },
        newClicked() {
            if (this.onlyListComponent) {
                console.log("New clicked in List component, but no action defined.", this.entityData);
                for (const key in this.entityPopup) {
                    this.$set(this.entityPopup, key, null);
                }
                this.editMode = false;
                this.$refs.popup.$refs.modal.show();
                this.$emit('newClicked');
            }
        },
        // deleteClicked() {
        //     if (this.$refs.agGrid.gridApi.getSelectedRows().length > 0) {
        //         this.$swal({
        //             title: 'Êtes vous sûr?',
        //             text: "Vous ne pourrez pas revenir en arrière!",
        //             icon: 'question',
        //             showCancelButton: true,
        //             confirmButtonText: 'Oui, supprimer!',
        //             customClass: {
        //                 confirmButton: 'btn btn-primary',
        //                 cancelButton: 'btn btn-outline-danger ml-1',
        //             },
        //             buttonsStyling: false,
        //         }).then(async result => {
        //             if (result.value) {
        //                 this.showLoading = true;
        //                 try {
        //                     const selectedData = this.$refs.agGrid.gridApi.getSelectedRows();
        //                     await this.$http.delete(getEntityApiURI(this.componentName) + "/" + selectedData[0].id);
        //                     this.$swal({
        //                         title: 'Suppression effectuée avec succès',
        //                         icon: 'success',
        //                         customClass: {
        //                             confirmButton: 'btn btn-primary',
        //                         },
        //                         showClass: {
        //                             popup: 'animate__animated animate__flipInX',
        //                         },
        //                         buttonsStyling: false,
        //                     });
        //                     const index = this.$refs.agGrid._data.gridOptions.rowData.findIndex(item => item.id === selectedData[0].id);
        //                     this.$refs.agGrid._data.gridOptions.rowData.splice(index, 1);
        //                 } finally {
        //                     this.showLoading = false;
        //                 }
        //             }
        //         })
        //     }
        // },
        async deleteClicked() {
            // 1️⃣  Make sure at least one row is selected
            const api = this.$refs.agGrid.gridApi;
            const rowData = this.$refs.agGrid._data.gridOptions.rowData;
            const selection = api.getSelectedRows();

            if (!selection.length) return;   // nothing selected → nothing to do

            // 2️⃣  Confirm with the user (keep your existing wording / styling)
            const { value: confirmed } = await this.$swal({
                title: 'Êtes-vous sûr ?',
                text: `Vous allez supprimer ${selection.length} ligne${selection.length > 1 ? 's' : ''}.`,
                icon: 'question',
                showCancelButton: true,
                confirmButtonText: 'Oui, supprimer !',
                customClass: {
                    confirmButton: 'btn btn-primary',
                    cancelButton: 'btn btn-outline-danger ml-1',
                },
                buttonsStyling: false,
            });

            if (!confirmed) return;          // user cancelled

            this.showLoading = true;
            try {
                /* ------------------------------------------------------------------
                   3️⃣  Delete the rows on the server.
                       ▸ If your backend has a batch-delete endpoint, call it once
                         with the array of IDs.
                       ▸ Otherwise fire N parallel DELETE calls with Promise.all.
                   ------------------------------------------------------------------ */

                const ids = selection.map(r => r.id);

                // --- OPTION A: one call to /entities/batch?ids=1,2,3 ----------------
                // await this.$http.delete(getEntityApiURI(this.componentName) +
                //                         '/batch', { params: { ids } });

                // --- OPTION B: parallel individual calls ----------------------------
                await Promise.all(
                    ids.map(id =>
                        this.$http.delete(`${getEntityApiURI(this.componentName)}/${id}`)
                    )
                );

                /* ------------------------------------------------------------------
                   4️⃣  Remove the rows locally so the grid updates immediately.
                       ▸ With client-side row model use applyTransaction.
                   ------------------------------------------------------------------ */
                api.applyTransaction({ remove: selection });   // ag-Grid ≥ v24

                // If you still keep a copy in rowData, sync it as well:
                ids.forEach(id => {
                    const idx = rowData.findIndex(r => r.id === id);
                    if (idx !== -1) rowData.splice(idx, 1);
                });

                // 5️⃣  Success toast
                await this.$swal({
                    title: 'Suppression effectuée avec succès',
                    icon: 'success',
                    customClass: { confirmButton: 'btn btn-primary' },
                    showClass: { popup: 'animate__animated animate__flipInX' },
                    buttonsStyling: false,
                });
            } catch (err) {
                // 6️⃣  Optional: show a single error dialog if *any* deletion fails.
                console.error(err);
                await this.$swal({
                    title: 'Erreur lors de la suppression',
                    text: err.response?.data?.message ?? err.message,
                    icon: 'error',
                    customClass: { confirmButton: 'btn btn-primary' },
                    buttonsStyling: false,
                });
            } finally {
                this.showLoading = false;
            }
        },
        downloadClicked() {
            let data = [];
            this.$refs.agGrid.gridApi.forEachNodeAfterFilter(node => {
                data.push(node.data);
            });
            // Exclude columns with names "odata.etag" and "ETag"
            const excludedColumns = ['odata.etag', 'ETag', '@odata.etag', ""];
            const filteredData = data.map(obj => {
                // Filter out the excluded columns from each object
                const filteredObj = {};
                for (const key in obj) {
                    if (!excludedColumns.includes(key)) {
                        filteredObj[key] = obj[key];
                    }
                }
                return filteredObj;
            });

            // Extract the keys from the first object to create the header row
            const header = Object.keys(filteredData[0]);

            // Create an array of arrays, where each inner array represents a row
            const rows = filteredData.map(obj => Object.values(obj));

            // Insert the header row at the beginning of the array
            rows.unshift(header);

            // Convert the array of arrays to a worksheet
            const worksheet = XLSX.utils.aoa_to_sheet(rows);

            // Create a new workbook and append the worksheet
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');

            // Write the workbook data to an Excel file
            const excelData = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
            const blob = new Blob([excelData], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            FileSaver.saveAs(blob, this.componentName + '.xlsx');
        },
        printClicked() {
            // Get the visible columns
            const visibleColumns = this.$refs.agGrid.gridOptions.columnApi.getAllDisplayedColumns();

            // Get the list data
            let data = [];
            this.$refs.agGrid.gridApi.forEachNodeAfterFilter(node => {
                data.push(node.data);
            });

            // Columns to exclude
            const excludedColumns = ['odata.etag', 'ETag', '@odata.etag', ""];

            // Build the HTML content for printing
            let html = `<html><head>
                <title>${this.componentName}</title>
                <style>
                  /* Add your CSS styles here */
                  table {
                    border-collapse: collapse;
                    width: 100%;
                  }

                  th, td {
                    border: 1px solid black;
                    padding: 8px;
                    text-align: left;
                  }

                  th {
                    background-color: lightgray;
                  }
                </style>
              </head><body>`;

            // Generate the table from the data
            html += '<table>';

            // Add table headers
            html += '<thead><tr>';
            visibleColumns.forEach(column => {
                const key = column.getColDef().field;
                if (!excludedColumns.includes(key)) {
                    html += `<th>${key}</th>`;
                }
            });
            html += '</tr></thead>';

            // Add table rows
            html += '<tbody>';
            data.forEach(item => {
                html += '<tr>';
                visibleColumns.forEach(column => {
                    const key = column.getColDef().field;
                    if (!excludedColumns.includes(key)) {
                        html += `<td>${item[key]}</td>`;
                    }
                });
                html += '</tr>';
            });
            html += '</tbody>';

            // Close the HTML content
            html += '</table></body></html>';

            // Print the HTML content
            const printWindow = window.open('', '_blank');
            printWindow.document.open();
            printWindow.document.write(html);
            printWindow.document.close();
            printWindow.print();
        },
        updateSearchQuery(val) {
            this.$refs.agGrid.gridApi.setQuickFilter(val);
        },
        filterSearchChnaged(filters) {
            const filterModel = {};
            filters.forEach(filter => {
                if (filter.value) {
                    filterModel[filter.parameter] = {
                        filterType: 'text',
                        type: 'contains',
                        filter: filter.value
                    };
                }
            });
            this.$refs.agGrid.gridApi.setFilterModel(filterModel);
        },
        handleBeforeUnload() {
            this.saveGridConfigIfChanged();
        },
        async loadData() {
            this.showLoading = true;
            let response = await this.$http.get(getEntityApiURI(this.componentName));
            this.localAgGridData = response.data;
            this.showLoading = false;
        }
    },
    created() {
        if (!this.retrieveDataFromParent) {
            this.loadData();
        }
    },
}
</script>

<style scoped>
@media (max-width: 769px) {
    .ag-theme-balham {
        height: 80vh ! important;
    }
}
</style>