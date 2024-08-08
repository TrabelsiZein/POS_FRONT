<template>

    <b-overlay :show="showLoading" spinner-variant="primary">

        <b-modal hide-footer ref="modal" title="" scrollable size="lg">
            <b-row>

                <b-col cols="12">
                    <b-form-group label="Groupe compta. marché">
                        <v-select v-model="selectedGenBusinessPostingGroup" label="description"
                            :options="genBusinessPostingGroupOptions" />
                    </b-form-group>
                </b-col>

                <b-col cols="12">
                    <b-form-group label="Groupe compta. produit">
                        <v-select v-model="selectedGenProductPostingGroup" label="description"
                            :options="genProductPostingGroupOptions" />
                    </b-form-group>
                </b-col>

                <b-col cols="12">
                    <b-form-group label="Compte vente">
                        <v-select v-model="selectedSalesAccount" label="name" :options="salesAccountOptions" />
                    </b-form-group>
                </b-col>

                <b-col cols="12">
                    <b-form-group label="Compte achat">
                        <v-select v-model="selectedPurchaseAccount" label="name" :options="purchaseAccountOptions" />
                    </b-form-group>
                </b-col>

                <b-col cols="12">
                    <b-form-group label="Compte avoir vente">
                        <v-select v-model="selectedSalesCreditMemoAccount" label="name"
                            :options="salesCreditMemoAccountOptions" />
                    </b-form-group>
                </b-col>

                <b-col cols="12">
                    <b-form-group label="Compte avoir achat">
                        <v-select v-model="selectedPurchaseCreditMemoAccount" label="name"
                            :options="purchaseCreditMemoAccountOptions" />
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
                genBusPostingGroup: "",
                genProdPostingGroup: "",
                salesAccount: "",
                purchaseAccount: "",
                salesCreditMemoAccount: "",
                purchaseCreditMemoAccount: ""
            },
            selectedEntity: null,
            componentName: "GeneralPostingSetup",
            componentAPI: "general_posting_setup",
            breadcrumbData: {
                title: "Paramètres compta.",
                route: [
                    {
                        text: 'Configuration',
                    },
                    {
                        text: 'Paramètres compta.',
                        active: true,
                    },
                ],
                withFilter: false
            },
            agGridData: {
                columnDefs: [
                    {
                        headerName: "Groupe compta. marché",
                        field: "genBusPostingGroup",
                    },
                    {
                        headerName: "Groupe compta. produit",
                        field: "genProdPostingGroup",
                    },
                    {
                        headerName: "Compte vente",
                        field: "salesAccount",
                    },
                    {
                        headerName: "Compte achat",
                        field: "purchaseAccount",
                    },
                    {
                        headerName: "Compte avoir vente",
                        field: "salesCreditMemoAccount",
                    },
                    {
                        headerName: "Compte avoir achat",
                        field: "purchaseCreditMemoAccount",
                    },
                ],
                rows: []
            },
            genBusinessPostingGroupOptions: [],
            selectedGenBusinessPostingGroup: null,
            genProductPostingGroupOptions: [],
            selectedGenProductPostingGroup: null,
            salesAccountOptions: [],
            selectedSalesAccount: null,
            purchaseAccountOptions: [],
            selectedPurchaseAccount: null,
            salesCreditMemoAccountOptions: [],
            selectedSalesCreditMemoAccount: null,
            purchaseCreditMemoAccountOptions: [],
            selectedPurchaseCreditMemoAccount: null,
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
            this.selectedGenBusinessPostingGroup = null;
            this.selectedGenProductPostingGroup = null;
            this.selectedSalesAccount = null;
            this.selectedPurchaseAccount = null;
            this.selectedSalesCreditMemoAccount = null;
            this.selectedPurchaseCreditMemoAccount = null;
            this.$refs['modal'].show();
        },
        editclicked(data) {
            this.entity = { ...data };
            this.selectedEntity = { ...data };

            if (data.genBusPostingGroup != null && data.genBusPostingGroup != '')
                this.selectedGenBusinessPostingGroup = this.genBusinessPostingGroupOptions.find(el => el.no === data.genBusPostingGroup);
            else
                this.selectedGenBusinessPostingGroup = null;

            if (data.genProdPostingGroup != null && data.genProdPostingGroup != '')
                this.selectedGenProductPostingGroup = this.genProductPostingGroupOptions.find(el => el.no === data.genProdPostingGroup);
            else
                this.selectedGenProductPostingGroup = null;

            if (data.salesAccount != null && data.salesAccount != '')
                this.selectedSalesAccount = this.salesAccountOptions.find(el => el.no === data.salesAccount);
            else
                this.selectedSalesAccount = null;

            if (data.purchaseAccount != null && data.purchaseAccount != '')
                this.selectedPurchaseAccount = this.purchaseAccountOptions.find(el => el.no === data.purchaseAccount);
            else
                this.selectedPurchaseAccount = null;

            if (data.salesCreditMemoAccount != null && data.salesCreditMemoAccount != '')
                this.selectedSalesCreditMemoAccount = this.salesCreditMemoAccountOptions.find(el => el.no === data.salesCreditMemoAccount);
            else
                this.selectedSalesCreditMemoAccount = null;

            if (data.purchaseCreditMemoAccount != null && data.purchaseCreditMemoAccount != '')
                this.selectedPurchaseCreditMemoAccount = this.purchaseCreditMemoAccountOptions.find(el => el.no === data.purchaseCreditMemoAccount);
            else
                this.selectedPurchaseCreditMemoAccount = null;

            this.$refs['modal'].show();
        },
        async save() {
            this.showLoading = true;
            try {

                if (this.selectedGenBusinessPostingGroup != null)
                    this.entity.genBusPostingGroup = this.selectedGenBusinessPostingGroup.no;
                else
                    this.entity.genBusPostingGroup = null;

                if (this.selectedGenProductPostingGroup != null)
                    this.entity.genProdPostingGroup = this.selectedGenProductPostingGroup.no;
                else
                    this.entity.genProdPostingGroup = null;

                if (this.selectedSalesAccount != null)
                    this.entity.salesAccount = this.selectedSalesAccount.no;
                else
                    this.entity.salesAccount = null;

                if (this.selectedPurchaseAccount != null)
                    this.entity.purchaseAccount = this.selectedPurchaseAccount.no;
                else
                    this.entity.purchaseAccount = null;

                if (this.selectedSalesCreditMemoAccount != null)
                    this.entity.salesCreditMemoAccount = this.selectedSalesCreditMemoAccount.no;
                else
                    this.entity.salesCreditMemoAccount = null;

                if (this.selectedPurchaseCreditMemoAccount != null)
                    this.entity.purchaseCreditMemoAccount = this.selectedPurchaseCreditMemoAccount.no;
                else
                    this.entity.purchaseCreditMemoAccount = null;

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

            if (this.entity.genBusPostingGroup != null && this.entity.genBusPostingGroup != '')
                this.selectedGenBusinessPostingGroup = this.genBusinessPostingGroupOptions.find(el => el.no === this.entity.genBusPostingGroup);
            else
                this.selectedGenBusinessPostingGroup = null;

            if (this.entity.genProdPostingGroup != null && this.entity.genProdPostingGroup != '')
                this.selectedGenProductPostingGroup = this.genProductPostingGroupOptions.find(el => el.no === this.entity.genProdPostingGroup);
            else
                this.selectedGenProductPostingGroup = null;

            if (this.entity.salesAccount != null && this.entity.salesAccount != '')
                this.selectedSalesAccount = this.salesAccountOptions.find(el => el.no === this.entity.salesAccount);
            else
                this.selectedSalesAccount = null;

            if (this.entity.purchaseAccount != null && this.entity.purchaseAccount != '')
                this.selectedPurchaseAccount = this.purchaseAccountOptions.find(el => el.no === this.entity.purchaseAccount);
            else
                this.selectedPurchaseAccount = null;

            if (this.entity.salesCreditMemoAccount != null && this.entity.salesCreditMemoAccount != '')
                this.selectedSalesCreditMemoAccount = this.salesCreditMemoAccountOptions.find(el => el.no === this.entity.salesCreditMemoAccount);
            else
                this.selectedSalesCreditMemoAccount = null;

            if (this.entity.purchaseCreditMemoAccount != null && this.entity.purchaseCreditMemoAccount != '')
                this.selectedPurchaseCreditMemoAccount = this.purchaseCreditMemoAccountOptions.find(el => el.no === this.entity.purchaseCreditMemoAccount);
            else
                this.selectedPurchaseCreditMemoAccount = null;
        },
        loadVatBusinessPostingGroup() {
            this.$http.get("general_business_posting_group").then(response => {
                this.genBusinessPostingGroupOptions = response.data;
            });
        },
        loadVatProductPostingGroup() {
            this.$http.get("general_product_posting_group").then(response => {
                this.genProductPostingGroupOptions = response.data;
            });
        },
        loadGeneralLedgerAccount() {
            this.$http.get("general_ledger_account").then(response => {
                this.salesAccountOptions = response.data;
                this.purchaseAccountOptions = response.data;
                this.salesCreditMemoAccountOptions = response.data;
                this.purchaseCreditMemoAccountOptions = response.data;
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