<template>

    <b-overlay :show="showLoading" spinner-variant="primary">

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


                <b-col cols="12">
                    <b-form-group label="Gpe compta. produit TVA par défaut">
                        <v-select v-model="selectedVatProductPostingGroup" label="description"
                            :options="vatProductPostingGroupOptions" />
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
            :breadcrumbData="breadcrumbData" :agGridData="agGridData" @newClicked="newClicked"
            @editclicked="editclicked" />

    </b-overlay>
</template>

<script>

import List from '@/views/components/list/List.vue';
import vSelect from 'vue-select'

export default {
    components: {
        List,
        vSelect
    },
    data() {
        return {
            showLoading: true,
            entity: {},
            emptyEntity: {
                no: "",
                description: "",
                defVatProdPostingGroup: ""
            },
            selectedEntity: null,
            componentName: "GeneralProductPostingGroup",
            componentAPI: "general_product_posting_group",
            breadcrumbData: {
                title: "Groupe compta. Produit",
                route: [
                    {
                        text: 'Configuration',
                    },
                    {
                        text: 'Groupe compta. Produit',
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
                ],
                rows: []
            },
            vatProductPostingGroupOptions: [],
            selectedVatProductPostingGroup: null
        }
    },
    created() {
        this.entity = { ...this.emptyEntity };
        this.loadData();
    },
    methods: {
        async loadData() {
            this.entity = { ...this.emptyEntity };
            this.loadVatProductPostingGroup();
            let response = await this.$http.get(this.componentAPI);
            this.agGridData.rows = response.data;
            this.showLoading = false;
        },
        newClicked() {
            this.entity = { ...this.emptyEntity };
            this.selectedEntity = null;
            this.selectedVatProductPostingGroup = null;
            this.$refs['modal'].show();
            setTimeout(() => {
                this.$refs["no"].focus();
            }, 300);
        },
        editclicked(data) {
            this.entity = { ...data };
            this.selectedEntity = { ...data };
            if (data.defVatProdPostingGroup != null && data.defVatProdPostingGroup != '')
                this.selectedVatProductPostingGroup = this.vatProductPostingGroupOptions.find(el => el.no === data.defVatProdPostingGroup);
            else
                this.selectedVatProductPostingGroup = null;
            this.$refs['modal'].show();
            setTimeout(() => {
                this.$refs["no"].focus();
            }, 300);
        },
        async save() {
            this.showLoading = true;
            try {
                if (this.selectedVatProductPostingGroup != null)
                    this.entity.defVatProdPostingGroup = this.selectedVatProductPostingGroup.no;
                else
                    this.entity.defVatProdPostingGroup = null;
                await this.$http.post(this.componentAPI, this.entity);
                this.$refs["modal"].hide();
                this.loadData();
            } catch (error) {
                console.log(error);
                this.showLoading = false;
            }
        },
        reset() {
            if (this.selectedEntity == null)
                this.entity = { ...this.emptyEntity };
            else
                this.entity = { ...this.selectedEntity };
            if (this.entity.defVatProdPostingGroup != null && this.entity.defVatProdPostingGroup != '')
                this.selectedVatProductPostingGroup = this.vatProductPostingGroupOptions.find(el => el.no === this.entity.defVatProdPostingGroup);
        },
        loadVatProductPostingGroup() {
            this.$http.get("vat_product_posting_group").then(response => {
                this.vatProductPostingGroupOptions = response.data;
            });
        },
    }
}
</script>

<style lang="scss">
@import '@core/scss/vue/libs/vue-select.scss';

.v-select .vs__dropdown-menu {
    z-index: 1050;
    position: relative;
}
</style>