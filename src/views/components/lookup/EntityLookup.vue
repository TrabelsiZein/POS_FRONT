<template>
    <div class="relative w-full">


        <b-input-group>
            <b-form-input :size="size" :value="localValue" readonly :title="localValue" :disabled="disabled" />
            <b-input-group-append is-text>
                <feather-icon icon="SearchIcon" class="cursor-pointer" @click="openModal" :class="{ 'disabled': disabled }" />
            </b-input-group-append>
        </b-input-group>



        <b-modal hide-footer ref="modal" scrollable :size="localLookupSize">

            <List :componentName="componentName" :showBreadCrumbOpenNewTab="true"
                :hideBreadCrumbPath="true" @lookupItemClicked="cellDoubleClicked" :onlyListComponent="true" />

        </b-modal>


    </div>
</template>

<script>

import List from '@/views/components/list/List.vue';

export default {
    name: 'EntityLookup',
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
        disabled: {
            type: Boolean,
            default: false,
            required: false,
        },
    },
    components: {
        List
    },
    data() {
        return {
            localValue: this.selectedItem,
            localLookupSize: this.lookupSize,
            agGridData: {
                columnDefs: this.columnDefs,
                rows: []
            },
            loadedComponent: null
        };
    },
    mounted() {
        // this.loadComponent()
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
        // async loadComponent() {
        //     const routeName = this.componentName + '_READ';

        //     const matchedRoute = this.$router.options.routes.find(route => route.name === routeName);

        //     if (matchedRoute && matchedRoute.component) {
        //         const comp = await matchedRoute.component()
        //         this.loadedComponent = comp.default // important!
        //     } else {
        //         console.warn(`Route not found for name: ${routeName}`)
        //     }
        // },
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
            if (!this.disabled) {
                this.$refs['modal'].show();
            }
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
            this.localValue = params.no;
            this.$emit("onItemSelected", params, this.field)
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

.disabled {
    opacity: 0.5;
    cursor: not-allowed !important;
    pointer-events: none;
}
</style>
