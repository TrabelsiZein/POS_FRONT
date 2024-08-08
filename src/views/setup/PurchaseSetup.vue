<template>
    <div>
        <Crad :breadcrumbData="breadcrumbData" :componentName="componentName" @reset="reset" @save="save"
            :showLoading="showLoading">

            <template #card-body>
                <b-row>

                    <b-col sm="12" md="6" lg="3">
                        <b-form-group label="N° fournisseur">
                            <v-select class="select-size-sm" v-model="vendorNoSelected" label="description"
                                :options="seriesHeaderOptions" />
                        </b-form-group>
                    </b-col>

                    <b-col sm="12" md="6" lg="3">
                        <b-form-group label="N° demande de prix">
                            <v-select class="select-size-sm" v-model="currencyNoSelected" label="description"
                                :options="seriesHeaderOptions" />
                        </b-form-group>
                    </b-col>

                    <b-col sm="12" md="6" lg="3">
                        <b-form-group label="N° commande">
                            <v-select class="select-size-sm" v-model="orderNoSelected" label="description"
                                :options="seriesHeaderOptions" />
                        </b-form-group>
                    </b-col>

                    <b-col sm="12" md="6" lg="3">
                        <b-form-group label="N° facture">
                            <v-select class="select-size-sm" v-model="invoiceNoSelected" label="description"
                                :options="seriesHeaderOptions" />
                        </b-form-group>
                    </b-col>

                    <b-col sm="12" md="6" lg="3">
                        <b-form-group label="N° facture enregistrée">
                            <v-select class="select-size-sm" v-model="registeredInvoiceNoSelected" label="description"
                                :options="seriesHeaderOptions" />
                        </b-form-group>
                    </b-col>

                    <b-col sm="12" md="6" lg="3">
                        <b-form-group label="N° avoir">
                            <v-select class="select-size-sm" v-model="creditMemoNoSelected" label="description"
                                :options="seriesHeaderOptions" />
                        </b-form-group>
                    </b-col>

                    <b-col sm="12" md="6" lg="3">
                        <b-form-group label="N° avoir enregistré">
                            <v-select class="select-size-sm" v-model="registredCreditMemoNoSelected" label="description"
                                :options="seriesHeaderOptions" />
                        </b-form-group>
                    </b-col>

                    <b-col sm="12" md="6" lg="3">
                        <b-form-group label="N° réception enregistrée">
                            <v-select class="select-size-sm" v-model="registeredShipmentNoSelected" label="description"
                                :options="seriesHeaderOptions" />
                        </b-form-group>
                    </b-col>

                    <b-col sm="12" md="6" lg="3">
                        <b-form-group label="N° commande ouverte">
                            <v-select class="select-size-sm" v-model="openOrderNoSelected" label="description"
                                :options="seriesHeaderOptions" />
                        </b-form-group>
                    </b-col>

                    <b-col sm="12" md="6" lg="3">
                        <b-form-group label="N° retour">
                            <v-select class="select-size-sm" v-model="returnNoSelected" label="description"
                                :options="seriesHeaderOptions" />
                        </b-form-group>
                    </b-col>

                    <b-col sm="12" md="6" lg="3">
                        <b-form-group label="N° expédition retour enregistrée">
                            <v-select class="select-size-sm" v-model="registeredReturnReceiptNoSelected"
                                label="description" :options="seriesHeaderOptions" />
                        </b-form-group>
                    </b-col>
                </b-row>

                <b-row>

                    <b-col sm="12" md="6" lg="3">
                        <b-form-group label="Date comptabilisation par défaut">
                            <b-form-select size="sm" v-model="entity.defaultAccountingDate"
                                :options="defaultAccountingDateOptions" />
                        </b-form-group>
                    </b-col>

                    <b-col sm="12" md="6" lg="3">
                        <b-form-group label="Qté à recevoir par défaut">
                            <b-form-select size="sm" v-model="entity.defaultQuantityToReceive"
                                :options="defaultQuantityToShipOptions" />
                        </b-form-group>
                    </b-col>

                    <b-col sm="12" md="6" lg="3">
                        <b-form-group label="N° doc. ext. obligatoire">
                            <b-form-checkbox v-model="entity.mandatoryExtDocNo" switch />
                        </b-form-group>
                    </b-col>

                    <b-col sm="12" md="6" lg="3">
                        <b-form-group label="Calculer remise facture">
                            <b-form-checkbox v-model="entity.calculateInvoiceDiscount" switch />
                        </b-form-group>
                    </b-col>

                    <b-col sm="12" md="6" lg="3">
                        <b-form-group label="Autoriser différence TVA">
                            <b-form-checkbox v-model="entity.allowVATDifference" switch />
                        </b-form-group>
                    </b-col>

                    <b-col sm="12" md="6" lg="3">
                        <b-form-group label="Archiver devis">
                            <b-form-checkbox v-model="entity.archiveCurrencies" switch />
                        </b-form-group>
                    </b-col>

                    <b-col sm="12" md="6" lg="3">
                        <b-form-group label="Archiver commandes">
                            <b-form-checkbox v-model="entity.archiveOrders" switch />
                        </b-form-group>
                    </b-col>

                    <b-col sm="12" md="6" lg="3">
                        <b-form-group label="Archiver commandes ouvertes">
                            <b-form-checkbox v-model="entity.archiveOpenOrders" switch />
                        </b-form-group>
                    </b-col>

                    <b-col sm="12" md="6" lg="3">
                        <b-form-group label="Archiver retours">
                            <b-form-checkbox v-model="entity.archiveReturns" switch />
                        </b-form-group>
                    </b-col>

                </b-row>
            </template>

        </Crad>
    </div>
</template>

<script>

import Crad from '../components/card/Crad.vue';
import vSelect from 'vue-select'

export default {
    components: {
        Crad,
        vSelect
    },
    data() {
        return {
            showLoading: true,
            componentName: "PurchaseSetup",
            componentAPI: "purchase_setup",
            entity: {},
            breadcrumbData: {
                title: "Paramètres Achat",
                route: [
                    {
                        text: 'Configuration',
                    },
                    {
                        text: 'Paramètres Achat',
                    },
                ],
            },
            defaultAccountingDateOptions: ["Working_Date", "No_Date"],
            defaultQuantityToShipOptions: ["Remainder", "Blank"],
            seriesHeaderOptions: [],
            vendorNoSelected: null,
            currencyNoSelected: null,
            orderNoSelected: null,
            invoiceNoSelected: null,
            registeredInvoiceNoSelected: null,
            creditMemoNoSelected: null,
            registredCreditMemoNoSelected: null,
            registeredShipmentNoSelected: null,
            openOrderNoSelected: null,
            returnNoSelected: null,
            registeredReturnReceiptNoSelected: null,
        }
    },
    async created() {
        await this.loadData();
        await this.loadSeriesHeader();
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
        async loadSeriesHeader() {
            this.$http.get("series_header").then(response => {
                this.seriesHeaderOptions = response.data;
                this.mapObjectResult();
            });
        },
        mapObjectResult() {
            if (this.entity.vendorNo != null)
                this.vendorNoSelected = this.seriesHeaderOptions.find(element => element.no === this.entity.vendorNo);
            if (this.entity.requestQuoteNo != null)
                this.currencyNoSelected = this.seriesHeaderOptions.find(element => element.no === this.entity.requestQuoteNo);
            if (this.entity.orderNo != null)
                this.orderNoSelected = this.seriesHeaderOptions.find(element => element.no === this.entity.orderNo);
            if (this.entity.invoiceNo != null)
                this.invoiceNoSelected = this.seriesHeaderOptions.find(element => element.no === this.entity.invoiceNo);
            if (this.entity.registeredInvoiceNo != null)
                this.registeredInvoiceNoSelected = this.seriesHeaderOptions.find(element => element.no === this.entity.registeredInvoiceNo);
            if (this.entity.creditMemoNo != null)
                this.creditMemoNoSelected = this.seriesHeaderOptions.find(element => element.no === this.entity.creditMemoNo);
            if (this.entity.registeredCreditMemoNo != null)
                this.registredCreditMemoNoSelected = this.seriesHeaderOptions.find(element => element.no === this.entity.registeredCreditMemoNo);
            if (this.entity.registeredReceiptNo != null)
                this.registeredShipmentNoSelected = this.seriesHeaderOptions.find(element => element.no === this.entity.registeredReceiptNo);
            if (this.entity.openOrderNo != null)
                this.openOrderNoSelected = this.seriesHeaderOptions.find(element => element.no === this.entity.openOrderNo);
            if (this.entity.returnNo != null)
                this.returnNoSelected = this.seriesHeaderOptions.find(element => element.no === this.entity.returnNo);
            if (this.entity.registeredReturnShipmentNo != null)
                this.registeredReturnReceiptNoSelected = this.seriesHeaderOptions.find(element => element.no === this.entity.registeredReturnShipmentNo);
        }
    },
    watch: {
        vendorNoSelected(value) {
            this.entity.vendorNo = value == null ? null : value.no;
        },
        currencyNoSelected(value) {
            this.entity.requestQuoteNo = value == null ? null : value.no;
        },
        orderNoSelected(value) {
            this.entity.orderNo = value == null ? null : value.no;
        },
        invoiceNoSelected(value) {
            this.entity.invoiceNo = value == null ? null : value.no;
        },
        registeredInvoiceNoSelected(value) {
            this.entity.registeredInvoiceNo = value == null ? null : value.no;
        },
        creditMemoNoSelected(value) {
            this.entity.creditMemoNo = value == null ? null : value.no;
        },
        registredCreditMemoNoSelected(value) {
            this.entity.registeredCreditMemoNo = value == null ? null : value.no;
        },
        registeredShipmentNoSelected(value) {
            this.entity.registeredReceiptNo = value == null ? null : value.no;
        },
        openOrderNoSelected(value) {
            this.entity.openOrderNo = value == null ? null : value.no;
        },
        returnNoSelected(value) {
            this.entity.returnNo = value == null ? null : value.no;
        },
        registeredReturnReceiptNoSelected(value) {
            this.entity.registeredReturnShipmentNo = value == null ? null : value.no;
        }
    }
}

</script>

<style lang="scss">
@import '@core/scss/vue/libs/vue-select.scss';
</style>