<template>

    <b-overlay :show="showLoading" spinner-variant="primary">

        <b-card>

            <Breadcrumb :componentName="componentName" :breadcrumbData="breadcrumbData" @editClicked="editClicked"
                @downloadClicked="downloadClicked" @printClicked="printClicked" @deleteClicked="deleteClicked"
                @updateSearchQuery="updateSearchQuery" />

            <hr>

            <AgGrid :agGridData="agGridData" ref="agGrid" @cellDoubleClicked="cellDoubleClicked" />

        </b-card>

    </b-overlay>
    
</template>

<script>

import Breadcrumb from '../BreadcrumbList.vue'
import AgGrid from '../ag-grid/AgGrid.vue'
import * as XLSX from 'xlsx';
import FileSaver from 'file-saver';

export default {
    components: {
        Breadcrumb,
        AgGrid
    },
    props: {
        componentName: {
            type: String,
            required: true,
        },
        componentAPI: {
            type: String,
            required: true,
        },
        breadcrumbData: {
            type: Object,
            required: true,
        },
        agGridData: {
            type: Object,
            required: true,
        },
    },
    data() {
        return {
            showLoading: false
        }
    },
    methods: {

        editClicked() {
            if (this.$refs.agGrid.gridApi.getSelectedRows().length > 0) {
                const selectedData = this.$refs.agGrid.gridApi.getSelectedRows();
                this.$router.push({ name: this.componentName + "_EDIT", params: { id: selectedData[0].id } })
            }
        },
        cellDoubleClicked(param) {
            this.$router.push({ name: this.componentName + "_EDIT", params: { id: param.data.id } })
        },
        deleteClicked() {
            if (this.$refs.agGrid.gridApi.getSelectedRows().length > 0) {
                this.$swal({
                    title: 'Êtes vous sûr?',
                    text: "Vous ne pourrez pas revenir en arrière !",
                    icon: 'question',
                    showCancelButton: true,
                    confirmButtonText: 'Oui, supprimer !',
                    customClass: {
                        confirmButton: 'btn btn-primary',
                        cancelButton: 'btn btn-outline-danger ml-1',
                    },
                    buttonsStyling: false,
                }).then(async result => {
                    if (result.value) {
                        this.showLoading = true;
                        try {
                            const selectedData = this.$refs.agGrid.gridApi.getSelectedRows();
                            await this.$http.delete(this.componentAPI + "/" + selectedData[0].id);
                            this.$swal({
                                title: 'Suppression effectuée avec succès',
                                icon: 'success',
                                customClass: {
                                    confirmButton: 'btn btn-primary',
                                },
                                showClass: {
                                    popup: 'animate__animated animate__flipInX',
                                },
                                buttonsStyling: false,
                            });
                            const index = this.$refs.agGrid._data.gridOptions.rowData.findIndex(item => item.id === selectedData[0].id);
                            this.$refs.agGrid._data.gridOptions.rowData.splice(index, 1);
                        } finally {
                            this.showLoading = false;
                        }
                    }
                })
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