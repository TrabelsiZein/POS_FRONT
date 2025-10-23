<template>
    <div class="relative w-full">


        <b-input-group>
            <b-form-input :size="size" :value="localValue" readonly :title="localValue"  />
            <b-input-group-append is-text>
                <feather-icon icon="SearchIcon" class="cursor-pointer" @click="openModal" />
            </b-input-group-append>
        </b-input-group>



        <b-modal hide-footer ref="modal" scrollable :size="localLookupSize" hide-header-close>

            <template #modal-header>
                <div class="d-flex justify-content-between w-100 align-items-center">
                    <h5 class="modal-title mb-0">{{ title }}</h5>
                    <div>

                        <b-button variant="outline-success" class="btn-icon mr-50" size="sm" @click="openInNewTab">
                            <feather-icon icon="ExternalLinkIcon" />
                        </b-button>

                        <b-button variant="outline-primary" class="btn-icon mr-50" size="sm" @click="changeModalSize">
                            <feather-icon :icon="lookupSizeIcon" />
                        </b-button>

                        <b-button variant="outline-secondary" class="btn-icon" size="sm" @click="$refs.modal.hide()">
                            <feather-icon icon="XIcon" />
                        </b-button>

                    </div>
                </div>
            </template>

            <b-row>

                <b-col cols="10">
                    <b-form-group>
                        <b-input-group class="input-group-merge">
                            <b-input-group-prepend is-text>
                                <feather-icon icon="SearchIcon" />
                            </b-input-group-prepend>
                            <b-form-input id="icons-search" ref="icons-search" @input="updateSearchQuery"
                                placeholder="Recherche..." />
                        </b-input-group>
                    </b-form-group>
                </b-col>

                <b-col cols="2" class="text-right">
                    <b-button variant="outline-secondary" class="btn-icon" @click="refresh()">
                        <feather-icon icon="RefreshCcwIcon" />
                    </b-button>
                </b-col>

            </b-row>


            <AgGrid :agGridData="agGridData.rows" :agGridColumnDefs="agGridData.columnDefs" ref="agGrid" @onGridReady="onGridReady"
                @cellDoubleClicked="cellDoubleClicked" />

        </b-modal>


    </div>
</template>

<script>

import AgGrid from '@/views/components/ag-grid/AgGrid.vue';

export default {
    props: {
        columnDefs: {
            type: Array,
            required: false,
            default: () => ([
                { headerName: 'N°', field: 'no' },
                { headerName: 'Description', field: 'description' }
            ])
        },
        field: {
            type: String,
            required: false,
        },
        componentName: {
            type: String,
            required: true,
        },
        apiURI: {
            type: String,
            required: true,
        },
        selectedItem: {
            required: true,
            default: ""
        },
        size: {
            type: String,
            required: false,
            default: "sm"
        },
        lookupSize: {
            type: String,
            required: false,
            default: "xl"
        },
        title: {
            type: String,
            required: false,
        },
    },
    components: {
        AgGrid
    },
    data() {
        return {
            localValue: this.selectedItem,
            localLookupSize: this.lookupSize,
            agGridData: {
                columnDefs: this.columnDefs,
                rows: []
            },
        };
    },
    watch: {
        selectedItem: {
            handler(newValue) {
                this.localValue = newValue;
            },
            deep: true
        }
    },
    methods: {
        openInNewTab() {
            const url = this.$router.resolve({ name: this.componentName + "_READ" }).href;
            window.open(url, '_blank');
        },
        changeModalSize() {
            this.localLookupSize == "sm" ? this.localLookupSize = "lg" : (this.localLookupSize == "lg" ? this.localLookupSize = "xl" : this.localLookupSize = "sm");
            setTimeout(() => {
                this.$refs.agGrid.gridApi.sizeColumnsToFit();
            }, 200);
        },
        openModal() {
            this.$refs['modal'].show();
        },
        async getData() {
            this.$http.get(this.apiURI).then(response => {
                this.agGridData.rows = response.data;
            });
        },
        updateSearchQuery(value) {
            this.$refs.agGrid.gridApi.setQuickFilter(value);
        },
        cellDoubleClicked(params) {
            this.$refs.modal.hide();
            this.localValue = params.data.no;
            this.$emit("onItemSelected", params.data, this.field)
        },
        onGridReady() {
            this.getData();
        },
        refresh() {
            this.$refs.agGrid.gridApi.showLoadingOverlay();
            this.getData();
        }
    },
    computed: {
        lookupSizeIcon() {
            return this.localLookupSize == "sm" ? "Maximize2Icon" : (this.localLookupSize == "lg" ? "MaximizeIcon" : "MinimizeIcon");
        }
    },
};
</script>

<style scoped>
[dir] .form-control:disabled,
[dir] .form-control[readonly] {
    background-color: #fefcfc;
}
</style>
