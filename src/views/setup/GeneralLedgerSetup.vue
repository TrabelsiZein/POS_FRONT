<template>
    <div>
        <Crad :breadcrumbData="breadcrumbData" :componentName="componentName" @reset="reset" @save="save"
            :showLoading="showLoading">

            <template #card-body>
                <b-row>

                    <b-col sm="12" md="6" lg="3">
                        <b-form-group label="Compte droit de timbre Vente">
                            <v-select class="select-size-sm" v-model="salesStampDutyAccountSelected" label="name"
                                :options="glAccountsOptions" />
                        </b-form-group>
                    </b-col>

                    <b-col sm="12" md="6" lg="3">
                        <b-form-group label="Compte droit de timbre Achat">
                            <v-select class="select-size-sm" v-model="purchaseStampDutyAccountSelected" label="name"
                                :options="glAccountsOptions" />
                        </b-form-group>
                    </b-col>

                    <b-col sm="12" md="6" lg="3">
                        <b-form-group label="LCY Code">
                            <v-select class="select-size-sm" v-model="currencySelected" label="description"
                                :options="currencyOptions" />
                        </b-form-group>
                    </b-col>

                </b-row>

                <b-row>

                    <b-col sm="12" md="6" lg="3">
                        <b-form-group label="Début période validation">
                            <b-form-datepicker size="sm" v-model="entity.allowPostingFrom" />
                        </b-form-group>
                    </b-col>

                    <b-col sm="12" md="6" lg="3">
                        <b-form-group label="Fin période validation">
                            <b-form-datepicker size="sm" v-model="entity.allowPostingTo" />
                        </b-form-group>
                    </b-col>

                    <b-col sm="12" md="6" lg="3">
                        <b-form-group label="Précis. Arrondi">
                            <b-form-input type="number" size="sm" v-model="entity.inventoryRoundingPrecision" />
                        </b-form-group>
                    </b-col>

                    <b-col sm="12" md="6" lg="3">
                        <b-form-group label="Montant droit de timbre">
                            <b-form-input type="number" size="sm" v-model="entity.stampDutyAmount" />
                        </b-form-group>
                    </b-col>

                </b-row>
            </template>

        </Crad>
    </div>
</template>

<script>

import Crad from '../components/card/CradSetup.vue';
import vSelect from 'vue-select'

export default {
    components: {
        Crad,
        vSelect
    },
    data() {
        return {
            showLoading: true,
            componentName: "GeneralLedgerSetup",
            componentAPI: "general_ledger_setup",
            entity: {},
            breadcrumbData: {
                title: "Paramètres Grand Livre",
                route: [
                    {
                        text: 'Configuration',
                    },
                    {
                        text: 'Paramètres Grand Livre',
                    },
                ],
            },
            defaultAccountingDateOptions: ["Working_Date", "No_Date"],
            defaultQuantityToShipOptions: ["Balance", "Empty"],
            glAccountsOptions: [],
            currencyOptions: [],
            salesStampDutyAccountSelected: null,
            purchaseStampDutyAccountSelected: null,
            currencySelected: null,
        }
    },
    async created() {
        await this.loadData();
        await this.loadCurrencies();
        await this.loadGLAcounts();
    },
    methods: {
        async reset() {
            await this.loadData();
        },
        async save() {
            this.showLoading = true;
            try {
                await this.$http.post(this.componentAPI, this.entity);
                this.$swal.fire({
                    position: "absolute",
                    icon: "success",
                    title: "Modification effectuée avec succès.",
                    showConfirmButton: true,
                    timer: 5000
                });
            } finally {
                this.showLoading = false;
            }
        },
        async loadData() {
            let response = await this.$http.get(this.componentAPI);
            if (response.data.length > 0)
                this.entity = response.data[0];
            this.showLoading = false;
        },
        async loadCurrencies() {
            this.$http.get("currency").then(response => {
                this.currencyOptions = response.data;
            });
        },
        async loadGLAcounts() {
            this.$http.get("general_ledger_account").then(response => {
                this.glAccountsOptions = response.data;
                this.mapObjectResult();
            });
        },
        mapObjectResult() {
            if (this.entity.salesStampDutyAccount != null)
                this.salesStampDutyAccountSelected = this.glAccountsOptions.find(element => element.no === this.entity.salesStampDutyAccount);
            if (this.entity.purchaseStampDutyAccount != null)
                this.purchaseStampDutyAccountSelected = this.glAccountsOptions.find(element => element.no === this.entity.purchaseStampDutyAccount);
            if (this.entity.lcyno != null)
                this.currencySelected = this.currencyOptions.find(element => element.no === this.entity.lcyno);
        }
    },
    watch: {
        salesStampDutyAccountSelected(value) {
            this.entity.salesStampDutyAccount = value == null ? null : value.no;
        },
        purchaseStampDutyAccountSelected(value) {
            this.entity.purchaseStampDutyAccount = value == null ? null : value.no;
        },
        currencySelected(value) {
            this.entity.lcyno = value == null ? null : value.no;
        },
    }
}

</script>

<style lang="scss">
@import '@core/scss/vue/libs/vue-select.scss';
</style>