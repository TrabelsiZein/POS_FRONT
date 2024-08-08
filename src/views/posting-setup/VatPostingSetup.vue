<template>

    <b-overlay :show="showLoading" spinner-variant="primary">

        <b-modal hide-footer ref="modal" title="" scrollable size="lg">
            <b-row>

                <b-col cols="12">
                    <b-form-group label="% TVA">
                        <b-form-input type="number" v-model="entity.vat" ref="vat" />
                    </b-form-group>
                </b-col>

                <b-col cols="12">
                    <b-form-group label="Groupe compta. marché TVA">
                        <v-select v-model="selectedVatBusinessPostingGroup" label="description"
                            :options="vatBusinessPostingGroupOptions" />
                    </b-form-group>
                </b-col>

                <b-col cols="12">
                    <b-form-group label="Groupe compta. produit TVA">
                        <v-select v-model="selectedVatProductPostingGroup" label="description"
                            :options="vatProductPostingGroupOptions" />
                    </b-form-group>
                </b-col>

                <b-col cols="12">
                    <b-form-group label="Compte TVA vente">
                        <v-select v-model="selectedSalesVatAccount" label="name" :options="salesVatAccountOptions" />
                    </b-form-group>
                </b-col>

                <b-col cols="12">
                    <b-form-group label="Compte TVA achat">
                        <v-select v-model="selectedPurchaseVatAccount" label="name"
                            :options="purchaseVatAccountOptions" />
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
                vat: 0,
                vatBusPostingGroup: "",
                vatProdPostingGroup: "",
                salesVatAccount: "",
                purchaseVatAccount: "",
            },
            selectedEntity: null,
            componentName: "VatPostingSetup",
            componentAPI: "vat_posting_setup",
            breadcrumbData: {
                title: "Paramètres compta. TVA",
                route: [
                    {
                        text: 'Configuration',
                    },
                    {
                        text: 'Paramètres compta. TVA',
                        active: true,
                    },
                ],
                withFilter: false
            },
            agGridData: {
                columnDefs: [
                    {
                        headerName: "Groupe compta. marché TVA",
                        field: "vatBusPostingGroup",
                    },
                    {
                        headerName: "Groupe compta. produit TVA",
                        field: "vatProdPostingGroup",
                    },
                    {
                        headerName: "Compte TVA vente",
                        field: "salesVatAccount",
                    },
                    {
                        headerName: "Compte TVA achat",
                        field: "purchaseVatAccount",
                    },
                    {
                        headerName: "% TVA",
                        field: "vat",
                    },
                ],
                rows: []
            },
            vatBusinessPostingGroupOptions: [],
            selectedVatBusinessPostingGroup: null,
            vatProductPostingGroupOptions: [],
            selectedVatProductPostingGroup: null,
            salesVatAccountOptions: [],
            selectedSalesVatAccount: null,
            purchaseVatAccountOptions: [],
            selectedPurchaseVatAccount: null,
        }
    },
    created() {
        this.entity = { ...this.emptyEntity };
        this.loadData();
    },
    methods: {
        async loadData() {
            this.entity = { ...this.emptyEntity };
            this.loadVatBusinessPostingGroup();
            this.loadVatProductPostingGroup();
            this.loadGeneralLedgerAccount();
            let response = await this.$http.get(this.componentAPI);
            this.agGridData.rows = response.data;
            this.showLoading = false;
        },
        newClicked() {
            this.entity = { ...this.emptyEntity };
            this.selectedEntity = null;
            this.selectedVatBusinessPostingGroup = null;
            this.selectedVatProductPostingGroup = null;
            this.selectedSalesVatAccount = null;
            this.selectedPurchaseVatAccount = null;
            this.$refs['modal'].show();
            setTimeout(() => {
                this.$refs["vat"].focus();
            }, 300);
        },
        editclicked(data) {
            this.entity = { ...data };
            this.selectedEntity = { ...data };
            if (data.vatBusPostingGroup != null && data.vatBusPostingGroup != '')
                this.selectedVatBusinessPostingGroup = this.vatBusinessPostingGroupOptions.find(el => el.no === data.vatBusPostingGroup);
            else
                this.selectedVatBusinessPostingGroup = null;

            if (data.vatProdPostingGroup != null && data.vatProdPostingGroup != '')
                this.selectedVatProductPostingGroup = this.vatProductPostingGroupOptions.find(el => el.no === data.vatProdPostingGroup);
            else
                this.selectedVatProductPostingGroup = null;

            if (data.salesVatAccount != null && data.salesVatAccount != '')
                this.selectedSalesVatAccount = this.salesVatAccountOptions.find(el => el.no === data.salesVatAccount);
            else
                this.selectedSalesVatAccount = null;

            if (data.purchaseVatAccount != null && data.purchaseVatAccount != '')
                this.selectedPurchaseVatAccount = this.purchaseVatAccountOptions.find(el => el.no === data.purchaseVatAccount);
            else
                this.selectedPurchaseVatAccount = null;

            this.$refs['modal'].show();
            setTimeout(() => {
                this.$refs["vat"].focus();
            }, 300);
        },
        async save() {
            this.showLoading = true;
            try {
                if (this.selectedVatBusinessPostingGroup != null)
                    this.entity.vatBusPostingGroup = this.selectedVatBusinessPostingGroup.no;
                else
                    this.entity.vatBusPostingGroup = null;

                if (this.selectedVatProductPostingGroup != null)
                    this.entity.vatProdPostingGroup = this.selectedVatProductPostingGroup.no;
                else
                    this.entity.vatProdPostingGroup = null;

                if (this.selectedSalesVatAccount != null)
                    this.entity.salesVatAccount = this.selectedSalesVatAccount.no;
                else
                    this.entity.salesVatAccount = null;

                if (this.selectedPurchaseVatAccount != null)
                    this.entity.purchaseVatAccount = this.selectedPurchaseVatAccount.no;
                else
                    this.entity.purchaseVatAccount = null;

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

            if (this.entity.vatBusPostingGroup != null && this.entity.vatBusPostingGroup != '')
                this.selectedVatBusinessPostingGroup = this.vatBusinessPostingGroupOptions.find(el => el.no === this.entity.vatBusPostingGroup);
            else
                this.selectedVatBusinessPostingGroup = null;

            if (this.entity.vatProdPostingGroup != null && this.entity.vatProdPostingGroup != '')
                this.selectedVatProductPostingGroup = this.vatProductPostingGroupOptions.find(el => el.no === this.entity.vatProdPostingGroup);
            else
                this.selectedVatProductPostingGroup = null;

            if (this.entity.salesVatAccount != null && this.entity.salesVatAccount != '')
                this.selectedSalesVatAccount = this.salesVatAccountOptions.find(el => el.no === this.entity.salesVatAccount);
            else
                this.selectedSalesVatAccount = null;

            if (this.entity.purchaseVatAccount != null && this.entity.purchaseVatAccount != '')
                this.selectedPurchaseVatAccount = this.purchaseVatAccountOptions.find(el => el.no === this.entity.purchaseVatAccount);
            else
                this.selectedPurchaseVatAccount = null;
        },
        loadVatBusinessPostingGroup() {
            this.$http.get("vat_business_posting_group").then(response => {
                this.vatBusinessPostingGroupOptions = response.data;
            });
        },
        loadVatProductPostingGroup() {
            this.$http.get("vat_product_posting_group").then(response => {
                this.vatProductPostingGroupOptions = response.data;
            });
        },
        loadGeneralLedgerAccount() {
            this.$http.get("general_ledger_account").then(response => {
                this.salesVatAccountOptions = response.data;
                this.purchaseVatAccountOptions = response.data;
            });
        },
    }
}
</script>

<style lang="scss" scoped>
@import '@core/scss/vue/libs/vue-select.scss';

.v-select .vs__dropdown-menu {
    z-index: 1050;
    position: relative;
}
</style>