<template>
    <div>
        <Crad :breadcrumbData="breadcrumbData" :componentName="componentName" @reset="reset" @save="save"
            :showLoading="showLoading">

            <template #card-body>
                <b-row>

                    <b-col sm="12" md="6" lg="3">
                        <b-row>
                            <b-col>
                                <b-form-group label="Magasin obligatoire">
                                    <b-form-checkbox v-model="entity.isLocationMondatory" switch />
                                </b-form-group>
                            </b-col>
                            <b-col>
                                <b-form-group label="Éviter stock négatif">
                                    <b-form-checkbox v-model="entity.avoidNegativeStock" switch />
                                </b-form-group>
                            </b-col>
                        </b-row>
                    </b-col>

                    <b-col sm="12" md="6" lg="3">
                        <b-form-group label="Ajustement automatique des coûts">
                            <b-form-select size="sm" v-model="entity.automaticCostAdjustment"
                                :options="automaticCostAdjustmentOptions" />
                        </b-form-group>
                    </b-col>

                    <b-col sm="12" md="6" lg="3">
                        <b-form-group label="N° article">
                            <v-select class="select-size-sm" v-model="temNoSelected" label="description"
                                :options="seriesHeaderOptions" />
                        </b-form-group>
                    </b-col>

                    <b-col sm="12" md="6" lg="3">
                        <b-form-group label="N° ordre transfert">
                            <v-select class="select-size-sm" v-model="transferOrderNoSelected" label="description"
                                :options="seriesHeaderOptions" />
                        </b-form-group>
                    </b-col>

                    <b-col sm="12" md="6" lg="3">
                        <b-form-group label="N° expéd. transfert enreg.">
                            <v-select class="select-size-sm" v-model="registeredTransferShipmentNoSelected"
                                label="description" :options="seriesHeaderOptions" />
                        </b-form-group>
                    </b-col>

                    <b-col sm="12" md="6" lg="3">
                        <b-form-group label="N° récept. transfert enreg.">
                            <v-select class="select-size-sm" v-model="registeredTransferReceiptNoSelected"
                                label="description" :options="seriesHeaderOptions" />
                        </b-form-group>
                    </b-col>

                    <b-col sm="12" md="6" lg="3">
                        <b-form-group label="N° Inventaire">
                            <v-select class="select-size-sm" v-model="inventoryNoSelected" label="description"
                                :options="seriesHeaderOptions" />
                        </b-form-group>
                    </b-col>

                    <b-col sm="12" md="6" lg="3">
                        <b-form-group label="Ajustement automatique des coûts">
                            <b-form-select size="sm" v-model="entity.defaultStockEvaluationMode"
                                :options="defaultStockEvaluationModeOptions" />
                        </b-form-group>
                    </b-col>

                    <b-col sm="12" md="6" lg="3">
                        <b-form-group label="Période coût moyen">
                            <b-form-select size="sm" v-model="entity.averageCostPeriod"
                                :options="averageCostPeriodOptions" />
                        </b-form-group>
                    </b-col>

                    <b-col sm="12" md="6" lg="3">
                        <b-form-group label="Générateur Code Article">
                            <b-form-checkbox v-model="entity.itemNoGenerator" switch />
                        </b-form-group>
                    </b-col>

                    <b-col sm="12" md="6" lg="3">
                        <b-form-group label="Nbre jours classification ABC">
                            <b-form-input type="number" oninput="this.value = Math.round(this.value);" size="sm"
                                v-model="entity.numberOfDaysABCClassification" />
                        </b-form-group>
                    </b-col>

                    <b-col sm="12" md="6" lg="3">
                        <b-form-group label="Nbre jours classification ABC">
                            <b-form-input type="number" oninput="this.value = Math.round(this.value);" size="sm"
                                v-model="entity.numberOfDaysCBNCalculation" />
                        </b-form-group>
                    </b-col>

                    <b-col sm="12" md="6" lg="2">
                        <b-form-group label="% Classe A">
                            <b-form-input type="number" size="sm" v-model="entity.percentClassA" />
                        </b-form-group>
                    </b-col>

                    <b-col sm="12" md="6" lg="2">
                        <b-form-group label="% Classe B">
                            <b-form-input type="number" size="sm" v-model="entity.percentClassB" />
                        </b-form-group>
                    </b-col>

                    <b-col sm="12" md="6" lg="2">
                        <b-form-group label="% Classe C">
                            <b-form-input type="number" size="sm" v-model="entity.percentClassC" />
                        </b-form-group>
                    </b-col>

                    <b-col sm="12" md="6" lg="2">
                        <b-form-group label="% Classe X">
                            <b-form-input type="number" size="sm" v-model="entity.percentClassX" />
                        </b-form-group>
                    </b-col>

                    <b-col sm="12" md="6" lg="2">
                        <b-form-group label="% Classe Y">
                            <b-form-input type="number" size="sm" v-model="entity.percentClassY" />
                        </b-form-group>
                    </b-col>

                    <b-col sm="12" md="6" lg="2">
                        <b-form-group label="% Classe Z">
                            <b-form-input type="number" size="sm" v-model="entity.percentClassZ" />
                        </b-form-group>
                    </b-col>

                    <b-col sm="12" md="6" lg="2">
                        <b-form-group label="Couverture Max. Classe AX">
                            <b-form-input type="number" size="sm" v-model="entity.maximumCoverageClassAX" />
                        </b-form-group>
                    </b-col>

                    <b-col sm="12" md="6" lg="2">
                        <b-form-group label="Couverture Min. Classe AX">
                            <b-form-input type="number" size="sm" v-model="entity.minimumCoverageClassAX" />
                        </b-form-group>
                    </b-col>

                    <b-col sm="12" md="6" lg="2">
                        <b-form-group label="Couverture Max. Classe BX">
                            <b-form-input type="number" size="sm" v-model="entity.maximumCoverageClassBX" />
                        </b-form-group>
                    </b-col>

                    <b-col sm="12" md="6" lg="2">
                        <b-form-group label="Couverture Min. Classe BX">
                            <b-form-input type="number" size="sm" v-model="entity.minimumCoverageClassBX" />
                        </b-form-group>
                    </b-col>

                    <b-col sm="12" md="6" lg="2">
                        <b-form-group label="Couverture Max. Classe CX">
                            <b-form-input type="number" size="sm" v-model="entity.maximumCoverageClassCX" />
                        </b-form-group>
                    </b-col>

                    <b-col sm="12" md="6" lg="2">
                        <b-form-group label="Couverture Min. Classe CX">
                            <b-form-input type="number" size="sm" v-model="entity.minimumCoverageClassCX" />
                        </b-form-group>
                    </b-col>


                    <b-col sm="12" md="6" lg="2">
                        <b-form-group label="Couverture Max. Classe AY">
                            <b-form-input type="number" size="sm" v-model="entity.maximumCoverageClassAY" />
                        </b-form-group>
                    </b-col>

                    <b-col sm="12" md="6" lg="2">
                        <b-form-group label="Couverture Min. Classe AY">
                            <b-form-input type="number" size="sm" v-model="entity.minimumCoverageClassAY" />
                        </b-form-group>
                    </b-col>

                    <b-col sm="12" md="6" lg="2">
                        <b-form-group label="Couverture Max. Classe BY">
                            <b-form-input type="number" size="sm" v-model="entity.maximumCoverageClassBY" />
                        </b-form-group>
                    </b-col>

                    <b-col sm="12" md="6" lg="2">
                        <b-form-group label="Couverture Min. Classe BY">
                            <b-form-input type="number" size="sm" v-model="entity.minimumCoverageClassBY" />
                        </b-form-group>
                    </b-col>

                    <b-col sm="12" md="6" lg="2">
                        <b-form-group label="Couverture Max. Classe CY">
                            <b-form-input type="number" size="sm" v-model="entity.maximumCoverageClassCY" />
                        </b-form-group>
                    </b-col>

                    <b-col sm="12" md="6" lg="2">
                        <b-form-group label="Couverture Min. Classe CY">
                            <b-form-input type="number" size="sm" v-model="entity.minimumCoverageClassCY" />
                        </b-form-group>
                    </b-col>


                    <b-col sm="12" md="6" lg="2">
                        <b-form-group label="Couverture Max. Classe AZ">
                            <b-form-input type="number" size="sm" v-model="entity.maximumCoverageClassAZ" />
                        </b-form-group>
                    </b-col>

                    <b-col sm="12" md="6" lg="2">
                        <b-form-group label="Couverture Min. Classe AZ">
                            <b-form-input type="number" size="sm" v-model="entity.minimumCoverageClassAZ" />
                        </b-form-group>
                    </b-col>

                    <b-col sm="12" md="6" lg="2">
                        <b-form-group label="Couverture Max. Classe BZ">
                            <b-form-input type="number" size="sm" v-model="entity.maximumCoverageClassBZ" />
                        </b-form-group>
                    </b-col>

                    <b-col sm="12" md="6" lg="2">
                        <b-form-group label="Couverture Min. Classe BZ">
                            <b-form-input type="number" size="sm" v-model="entity.minimumCoverageClassBZ" />
                        </b-form-group>
                    </b-col>

                    <b-col sm="12" md="6" lg="2">
                        <b-form-group label="Couverture Max. Classe CZ">
                            <b-form-input type="number" size="sm" v-model="entity.maximumCoverageClassCZ" />
                        </b-form-group>
                    </b-col>

                    <b-col sm="12" md="6" lg="2">
                        <b-form-group label="Couverture Min. Classe CZ">
                            <b-form-input type="number" size="sm" v-model="entity.minimumCoverageClassCZ" />
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
            componentName: "InventorySetup",
            componentAPI: "inventory_setup",
            entity: {},
            breadcrumbData: {
                title: "Paramètres Stock",
                route: [
                    {
                        text: 'Configuration',
                    },
                    {
                        text: 'Paramètres Stock',
                    },
                ],
            },
            seriesHeaderOptions: [],
            temNoSelected: null,
            transferOrderNoSelected: null,
            registeredTransferShipmentNoSelected: null,
            registeredTransferReceiptNoSelected: null,
            inventoryNoSelected: null,
            automaticCostAdjustmentOptions: ["Never", "Day", "Week", "Month", "Quarter", "Year", "Always"],
            defaultStockEvaluationModeOptions: ["FIFO", "LIFO", "Specific", "Medium", "Standard"],
            averageCostPeriodOptions: ["Day", "Week", "Month", "Quarter", "Year", "Accounting_Period"]
        }
    },
    created() {
        this.loadData();
        this.loadSeriesHeader();
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
        loadSeriesHeader() {
            this.$http.get("series_header").then(response => {
                this.seriesHeaderOptions = response.data;
            });
        }
    },
    watch: {
        temNoSelected(value) {
            this.entity.itemNo = value.no;
        },
        transferOrderNoSelected(value) {
            this.entity.transferOrderNo = value.no;
        },
        registeredTransferShipmentNoSelected(value) {
            this.entity.registeredTransferShipmentNo = value.no;
        },
        registeredTransferReceiptNoSelected(value) {
            this.entity.registeredTransferReceiptNo = value.no;
        },
        inventoryNoSelected(value) {
            this.entity.inventoryNo = value.no;
        }
    }
}

</script>

<style lang="scss">
@import '@core/scss/vue/libs/vue-select.scss';
</style>