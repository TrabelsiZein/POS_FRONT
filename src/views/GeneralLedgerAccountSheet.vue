<template>
    <b-overlay :show="showLoading" spinner-variant="primary">
        <b-card>

            <BreadcrumbSheet :componentName="componentName" :componentAPI="componentAPI"
                :breadcrumbData="breadcrumbData" @reset="reset" @save="save" />

            <hr>

            <b-row>

                <b-col sm="12" md="6" lg="3">
                    <b-form-group label="N°">
                        <b-form-input size="sm" v-model="generalLedgerAccount.no" />
                    </b-form-group>
                </b-col>

                <b-col sm="12" md="6" lg="3">
                    <b-form-group label="Nom">
                        <b-form-input size="sm" v-model="generalLedgerAccount.name" />
                    </b-form-group>
                </b-col>

                <b-col sm="12" md="6" lg="3">
                    <b-form-group label="Type compte">
                        <b-form-select size="sm" v-model="generalLedgerAccount.accountType"
                            :options="accountTypeOptions" />
                    </b-form-group>
                </b-col>

                <b-col sm="12" md="6" lg="3">
                    <b-form-group label="Code axe principal 1">
                        <b-form-input size="sm" v-model="generalLedgerAccount.mainAxisCode1" />
                    </b-form-group>
                </b-col>

                <b-col sm="12" md="6" lg="3">
                    <b-form-group label="Code axe principal 2">
                        <b-form-input size="sm" v-model="generalLedgerAccount.mainAxisCode2" />
                    </b-form-group>
                </b-col>

                <b-col sm="12" md="6" lg="3">
                    <b-form-group label="Catégorie du compte">
                        <b-form-select size="sm" v-model="generalLedgerAccount.accountCategory"
                            :options="accountCategoryOptions" />
                    </b-form-group>
                </b-col>

                <b-col sm="12" md="6" lg="3">
                    <b-form-group label="Gestion/Bilan">
                        <b-form-select size="sm" v-model="generalLedgerAccount.managementOrBalance"
                            :options="managementOrBalanceOptions" />
                    </b-form-group>
                </b-col>

                <b-col sm="12" md="6" lg="3">
                    <b-form-group label="Débit/Crédit">
                        <b-form-select size="sm" v-model="generalLedgerAccount.debitOrCredit"
                            :options="debitOrCreditOptions" />
                    </b-form-group>
                </b-col>

                <b-col sm="12" md="6" lg="3">
                    <b-row>
                        <b-col>
                            <b-form-group label="Bloqué">
                                <b-form-checkbox v-model="generalLedgerAccount.blocked" class="mr-0 mt-50" switch
                                    inline />
                            </b-form-group>
                        </b-col>
                        <b-col>
                            <b-form-group label="Imputation directe">
                                <b-form-checkbox v-model="generalLedgerAccount.directImputation" class="mr-0 mt-50"
                                    switch inline />
                            </b-form-group>
                        </b-col>
                    </b-row>
                </b-col>

                <b-col sm="12" md="6" lg="3">
                    <b-form-group label="Totalisation">
                        <b-form-input size="sm" v-model="generalLedgerAccount.totalization" />
                    </b-form-group>
                </b-col>

                <b-col sm="12" md="6" lg="3">
                    <b-form-group label="Groupe compta. Marché">
                        <v-select class="select-size-sm" v-model="selectedGenBusinessPostingGroup" label="description"
                            :options="genBusinessPostingGroupOptions" />
                    </b-form-group>
                </b-col>

                <b-col sm="12" md="6" lg="3">
                    <b-form-group label="Groupe compta. Produit">
                        <v-select class="select-size-sm" v-model="selectedGenProductPostingGroup" label="description"
                            :options="genProductPostingGroupOptions" />
                    </b-form-group>
                </b-col>

            </b-row>

        </b-card>
    </b-overlay>
</template>

<script>

import BreadcrumbSheet from '@/views/components/BreadcrumbSheet.vue';
import vSelect from 'vue-select'

export default {
    components: {
        BreadcrumbSheet,
        vSelect
    },
    data() {
        return {
            showLoading: false,
            componentName: "GeneralLedgerAccount",
            componentAPI: "general_ledger_account",
            breadcrumbData: {
                title: "Fiche Compte Général",
                route: [
                    {
                        text: 'Configuration',
                    },
                    {
                        text: 'Compte Général',
                    },
                    {
                        text: 'Fiche',
                        active: true,
                    },
                ],
                showDeleteBtn: this.$route.params.id
            },
            generalLedgerAccount: {},
            accountTypeOptions: [{ value: "Imputable", text: "Imputable" }, { value: "Title", text: "Titre" }, { value: "Total", text: "Total" },
            { value: "TotalBeginning", text: "Début total" }, { value: "TotalEnd", text: "Fin total" }],
            accountCategoryOptions: [{ value: "Assets", text: "Immobilisations" }, { value: "Liabilities", text: "Emprunts et dettes" }, { value: "Equity", text: "Capitaux propres" },
            { value: "Revenue", text: "Revenus" }, { value: "CostOfGoodsSold", text: "Coût des marchandises vendues" }, { value: "Expenses", text: "Dépenses" }],
            managementOrBalanceOptions: [{ value: "Management", text: "Gestion" }, { value: "Balance", text: "Bilan" }],
            debitOrCreditOptions: [{ value: "Both", text: "Les deux" }, { value: "Debit", text: "Débit" }, { value: "Credit", text: "Crédit" }],
            genBusinessPostingGroupOptions: [],
            selectedGenBusinessPostingGroup: null,
            genProductPostingGroupOptions: [],
            selectedGenProductPostingGroup: null
        }
    },
    async created() {
        if (this.$route.params.id) {
            await this.findById();
        }
        this.getGeneralProductPostingGroup();
        this.getGeneralBusinessPostingGroup();
    },
    methods: {
        async getGeneralProductPostingGroup() {
            this.$http.get("general_product_posting_group").then(response => {
                this.genProductPostingGroupOptions = response.data;
                if (this.generalLedgerAccount.genProductPostingGroup != undefined && this.generalLedgerAccount.genProductPostingGroup != null && this.generalLedgerAccount.genProductPostingGroup != '') {
                    this.selectedGenProductPostingGroup = this.genProductPostingGroupOptions.find(element => element.no === this.generalLedgerAccount.genProductPostingGroup)
                }
            });
        },
        async getGeneralBusinessPostingGroup() {
            this.$http.get("general_business_posting_group").then(response => {
                this.genBusinessPostingGroupOptions = response.data;
                if (this.generalLedgerAccount.genBusinessPostingGroup != undefined && this.generalLedgerAccount.genBusinessPostingGroup != null && this.generalLedgerAccount.genBusinessPostingGroup != '') {
                    this.selectedGenBusinessPostingGroup = this.genBusinessPostingGroupOptions.find(element => element.no === this.generalLedgerAccount.genBusinessPostingGroup)
                }
            });
        },
        async findById() {
            this.showLoading = true;
            try {
                let response = await this.$http.get(this.componentAPI + "/" + this.$route.params.id);
                this.generalLedgerAccount = response.data;
            } finally {
                this.showLoading = false;
            }
        },
        async reset() {
            this.generalLedgerAccount = {};
            if (this.$route.params.id) {
                this.findById();
            }
        },
        async save() {
            this.showLoading = true;
            try {
                if (this.selectedGenProductPostingGroup != null)
                    this.generalLedgerAccount.genProductPostingGroup = this.selectedGenProductPostingGroup.no;
                else
                    this.generalLedgerAccount.genProductPostingGroup = null;

                if (this.selectedGenBusinessPostingGroup != null)
                    this.generalLedgerAccount.genBusinessPostingGroup = this.selectedGenBusinessPostingGroup.no;
                else
                    this.generalLedgerAccount.genBusinessPostingGroup = null;

                await this.$http.post(this.componentAPI, this.generalLedgerAccount);
                this.$router.push({ name: this.componentName + "_READ" })
            } finally {
                this.showLoading = false;
            }
        }
    }
}
</script>

<style lang="scss">
@import '@core/scss/vue/libs/vue-select.scss';
</style>