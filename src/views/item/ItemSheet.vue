<template>
    <b-overlay :show="showLoading" spinner-variant="primary">
        <b-card>

            <BreadcrumbSheet :componentName="componentName" :componentAPI="componentAPI"
                :breadcrumbData="breadcrumbData" @reset="reset" @save="save" />

            <hr>

            <b-row>

                <b-col sm="12" md="6" lg="3">
                    <b-form-group label="N°">
                        <b-form-input size="sm" v-model="entity.no" />
                    </b-form-group>
                </b-col>

                <b-col sm="12" md="6" lg="5">
                    <b-form-group label="Description">
                        <b-form-input size="sm" v-model="entity.description" />
                    </b-form-group>
                </b-col>

                <b-col sm="12" md="6" lg="4">
                    <b-form-group label="Description 2">
                        <b-form-input size="sm" v-model="entity.description2" />
                    </b-form-group>
                </b-col>

                <b-col sm="12" md="6" lg="3">
                    <b-form-group label="Unité de base">
                        <v-select class="select-size-sm" v-model="selectedBaseUnitOfMeasure" label="description"
                            :options="baseUnitOfMeasureOptions" />
                    </b-form-group>
                </b-col>

                <b-col sm="12" md="6" lg="3">
                    <b-form-group label="Type">
                        <b-form-select size="sm" v-model="entity.type" :options="typeOptions" />
                    </b-form-group>
                </b-col>

                <b-col sm="12" md="6" lg="3">
                    <b-form-group label="Groupe compta. stock">
                        <v-select class="select-size-sm" v-model="selectedInventoryPostingGroup" label="description"
                            :options="inventoryPostingGroupOptions" />
                    </b-form-group>
                </b-col>

                <b-col sm="12" md="6" lg="3">
                    <b-form-group label="Groupe rem. article">
                        <v-select class="select-size-sm" v-model="selectedItemDiscountGroup" label="description"
                            :options="itemDiscountGroupOptions" />
                    </b-form-group>
                </b-col>

                <b-col sm="12" md="6" lg="3">
                    <b-form-group label="Remise facture autorisée">
                        <b-form-checkbox v-model="entity.allowInvoiceDisc" class="mr-0 mt-50" switch inline />
                    </b-form-group>
                </b-col>

                <b-col sm="12" md="6" lg="3">
                    <b-form-group label="Prix unitaire">
                        <b-form-input type="number" size="sm" v-model="entity.unitPrice" />
                    </b-form-group>
                </b-col>

                <b-col sm="12" md="6" lg="3">
                    <b-form-group label="Calcul prix ou marge">
                        <b-form-select size="sm" v-model="entity.priceProfitCalculation"
                            :options="priceProfitCalculationOptions" />
                    </b-form-group>
                </b-col>

                <b-col sm="12" md="6" lg="3">
                    <b-form-group label="% marge sur vente">
                        <b-form-input type="number" size="sm" v-model="entity.profitPercent" />
                    </b-form-group>
                </b-col>

                <b-col sm="12" md="6" lg="3">
                    <b-form-group label="Mode évaluation stock">
                        <b-form-select size="sm" v-model="entity.costingMethod" :options="costingMethodOptions" />
                    </b-form-group>
                </b-col>

                <b-col sm="12" md="6" lg="3">
                    <b-form-group label="Coût unitaire">
                        <b-form-input type="number" size="sm" v-model="entity.unitCost" />
                    </b-form-group>
                </b-col>

                <b-col sm="12" md="6" lg="3">
                    <b-form-group label="Coût standard">
                        <b-form-input type="number" size="sm" v-model="entity.standardCost" />
                    </b-form-group>
                </b-col>

                <b-col sm="12" md="6" lg="3">
                    <b-form-group label="Dernier coût direct">
                        <b-form-input type="number" size="sm" v-model="entity.lastDirectCost" />
                    </b-form-group>
                </b-col>

                <b-col sm="12" md="6" lg="3">
                    <b-form-group label="Coût unitaire direct Net">
                        <b-form-input type="number" size="sm" v-model="entity.directNetUnitCost" />
                    </b-form-group>
                </b-col>

                <b-col sm="12" md="6" lg="3">
                    <b-form-group label="% coût indirect">
                        <b-form-input type="number" size="sm" v-model="entity.indirectCostPercent" />
                    </b-form-group>
                </b-col>

                <b-col sm="12" md="6" lg="3">
                    <b-form-group label="Coût ajusté">
                        <b-form-checkbox v-model="entity.costIsAdjusted" class="mr-0 mt-50" switch inline />
                    </b-form-group>
                </b-col>

                <b-col sm="12" md="6" lg="3">
                    <b-form-group label="Fournisseur">
                        <v-select class="select-size-sm" v-model="vendorOptions" label="description"
                            :options="itemDiscountGroupOptions" disabled />
                    </b-form-group>
                </b-col>

                <b-col sm="12" md="6" lg="3">
                    <b-form-group label="Stock maximum">
                        <b-form-input type="number" size="sm" v-model="entity.maximumInventory" />
                    </b-form-group>
                </b-col>

                <b-col sm="12" md="6" lg="3">
                    <b-form-group label="Quantité de réappro.">
                        <b-form-input type="number" size="sm" v-model="entity.reorderQuantity" />
                    </b-form-group>
                </b-col>

                <b-col sm="12" md="6" lg="3">
                    <b-form-group label="Poids brut">
                        <b-form-input type="number" size="sm" v-model="entity.grossWeight" />
                    </b-form-group>
                </b-col>

                <b-col sm="12" md="6" lg="3">
                    <b-form-group label="Poids net">
                        <b-form-input type="number" size="sm" v-model="entity.netWeight" />
                    </b-form-group>
                </b-col>

                <b-col sm="12" md="6" lg="3">
                    <b-form-group label="Conditionnement">
                        <b-form-input type="number" size="sm" v-model="entity.unitsPerParcel" />
                    </b-form-group>
                </b-col>

                <b-col sm="12" md="6" lg="3">
                    <b-form-group label="Volume unitaire">
                        <b-form-input type="number" size="sm" v-model="entity.unitVolume" />
                    </b-form-group>
                </b-col>

                <b-col sm="12" md="6" lg="3">
                    <b-form-group label="Bloqué">
                        <b-form-checkbox v-model="entity.blocked" class="mr-0 mt-50" switch inline />
                    </b-form-group>
                </b-col>

                <b-col sm="12" md="6" lg="3">
                    <b-form-group label="Prix TTC">
                        <b-form-checkbox v-model="entity.priceIncludesVAT" class="mr-0 mt-50" switch inline />
                    </b-form-group>
                </b-col>

                <b-col sm="12" md="6" lg="12">
                    <b-form-group label="Motif du blocage">
                        <b-form-textarea size="sm" v-model="entity.blockReason" rows="2" />
                    </b-form-group>
                </b-col>

                <b-col sm="12" md="6" lg="3">
                    <b-form-group label="Groupe compta. produit">
                        <v-select class="select-size-sm" v-model="selectedGenProdPostingGroup" label="description"
                            :options="genProdPostingGroupOptions" />
                    </b-form-group>
                </b-col>

                <b-col sm="12" md="6" lg="3">
                    <b-form-group label="N° de Souches">
                        <v-select class="select-size-sm" v-model="selectedNoSeries" label="description"
                            :options="noSeriesOptions" />
                    </b-form-group>
                </b-col>

                <b-col sm="12" md="6" lg="3">
                    <b-form-group label="Groupe compta. produit TVA">
                        <v-select class="select-size-sm" v-model="selectedVatProdPostingGroup" label="description"
                            :options="vatProdPostingGroupOptions" />
                    </b-form-group>
                </b-col>

                <b-col sm="12" md="6" lg="3">
                    <b-form-group label="Code axe principal 1">
                        <b-form-input size="sm" v-model="entity.globalDimension1Code" />
                    </b-form-group>
                </b-col>

                <b-col sm="12" md="6" lg="3">
                    <b-form-group label="Code axe principal 2">
                        <b-form-input size="sm" v-model="entity.globalDimension2Code" />
                    </b-form-group>
                </b-col>

                <b-col sm="12" md="6" lg="3">
                    <b-form-group label="Alerte rupture stock">
                        <b-form-select size="sm" v-model="entity.stockoutWarning" :options="stockoutWarningOptions" />
                    </b-form-group>
                </b-col>

                <b-col sm="12" md="6" lg="3">
                    <b-form-group label="Éviter stock négatif">
                        <b-form-select size="sm" v-model="entity.preventNegativeInventory"
                            :options="preventNegativeInventoryOptions" />
                    </b-form-group>
                </b-col>

                <b-col sm="12" md="6" lg="3">
                    <b-form-group label="Système réappro.">
                        <b-form-select size="sm" v-model="entity.replenishmentSystem"
                            :options="replenishmentSystemOptions" />
                    </b-form-group>
                </b-col>

                <b-col sm="12" md="6" lg="3">
                    <b-form-group label="Unité de vente">
                        <v-select class="select-size-sm" v-model="selectedSalesUnitOfMeasure" label="description"
                            :options="baseUnitOfMeasureOptions" />
                    </b-form-group>
                </b-col>

                <b-col sm="12" md="6" lg="3">
                    <b-form-group label="Unité d'achat">
                        <v-select class="select-size-sm" v-model="selectedPurchUnitOfMeasure" label="description"
                            :options="baseUnitOfMeasureOptions" />
                    </b-form-group>
                </b-col>

                <b-col sm="12" md="6" lg="3">
                    <b-form-group label="Code traçabilité">
                        <v-select class="select-size-sm" v-model="selectedItemTracking" label="description"
                            :options="itemTrackingOptions" />
                    </b-form-group>
                </b-col>

                <b-col sm="12" md="6" lg="3">
                    <b-form-group label="N° lot">
                        <v-select class="select-size-sm" v-model="selectedLotNos" label="description"
                            :options="noSeriesOptions" />
                    </b-form-group>
                </b-col>

                <b-col sm="12" md="6" lg="3">
                    <b-form-group label="Calcul péremption">
                        <b-form-input size="sm" v-model="entity.expirationCalculation" />
                    </b-form-group>
                </b-col>

                <b-col sm="12" md="6" lg="3">
                    <b-form-group label="Soumis au FODEC">
                        <b-form-checkbox v-model="entity.submittedToFODEC" class="mr-0 mt-50" switch inline />
                    </b-form-group>
                </b-col>

                <b-col sm="12" md="6" lg="3">
                    <b-form-group label="Soumis à l'avance / Impôt">
                        <b-form-checkbox v-model="entity.submittedToIRPP" class="mr-0 mt-50" switch inline />
                    </b-form-group>
                </b-col>

                <b-col sm="12" md="6" lg="3">
                    <b-form-group label="Soumis au DC">
                        <b-form-checkbox v-model="entity.submittedToTL" class="mr-0 mt-50" switch inline />
                    </b-form-group>
                </b-col>

                <b-col sm="12" md="6" lg="3">
                    <b-form-group label="% Droit de Consommation">
                        <b-form-input type="number" size="sm" v-model="entity.taxLowPercent" />
                    </b-form-group>
                </b-col>

                <b-col sm="12" md="6" lg="3">
                    <b-form-group label="Famille">
                        <v-select class="select-size-sm" v-model="selectedFamily" label="description"
                            :options="familyOptions" />
                    </b-form-group>
                </b-col>

                <b-col sm="12" md="6" lg="3">
                    <b-form-group label="Sous-Famille">
                        <v-select class="select-size-sm" v-model="selectedSubfamily" label="description"
                            :options="subfamilyOptions" />
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
            componentName: "Item",
            componentAPI: "item",
            breadcrumbData: {
                title: "Fiche Article",
                route: [
                    {
                        text: 'Article',
                    },
                    {
                        text: 'Liste des articles',
                    },
                    {
                        text: 'Fiche article',
                        active: true,
                    },
                ],
                showDeleteBtn: this.$route.params.id
            },
            entity: {},
            typeOptions: [{ value: "Inventory", text: "Inventory" }, { value: "Service", text: "Service" }, { value: "Non_Inventory", text: "Non_Inventory" }],
            priceProfitCalculationOptions: [{ value: "Profit_Price_Cost", text: "Profit_Price_Cost" }, { value: "Price_Cost_Profit", text: "Price_Cost_Profit" }, { value: "No_Relationship", text: "No_Relationship" }],
            costingMethodOptions: [{ value: "FIFO", text: "FIFO" }, { value: "LIFO", text: "LIFO" }, { value: "Specific", text: "Specific" }, { value: "Average", text: "Average" }, { value: "Standard", text: "Standard" }],
            stockoutWarningOptions: [{ value: "Default", text: "Default" }, { value: "No", text: "No" }, { value: "Yes", text: "Yes" }],
            preventNegativeInventoryOptions: [{ value: "Default", text: "Default" }, { value: "No", text: "No" }, { value: "Yes", text: "Yes" }],
            replenishmentSystemOptions: [{ value: "Purchase", text: "Purchase" }, { value: "Prod_Order", text: "Prod_Order" }, { value: "Assembly", text: "Assembly" }],
            baseUnitOfMeasureOptions: [],
            selectedBaseUnitOfMeasure: null,
            selectedSalesUnitOfMeasure: null,
            selectedPurchUnitOfMeasure: null,
            inventoryPostingGroupOptions: [],
            selectedInventoryPostingGroup: null,
            itemDiscountGroupOptions: [],
            selectedItemDiscountGroup: null,
            vendorOptions: [],
            selectedVendor: null,
            genProdPostingGroupOptions: [],
            selectedGenProdPostingGroup: null,
            noSeriesOptions: [],
            selectedNoSeries: null,
            selectedLotNos: null,
            vatProdPostingGroupOptions: [],
            selectedVatProdPostingGroup: null,
            itemTrackingOptions: [],
            selectedItemTracking: null,
            familyOptions: [],
            selectedFamily: null,
            subfamilyOptions: [],
            selectedSubfamily: null,
        }
    },
    async created() {
        if (this.$route.params.id) {
            await this.findById();
        }
        this.getUnits();
        this.getInventoryPostingGroup();
        this.getItemDiscountGroup();
        // this.getVendor();
        this.getGenProdPostingGroup();
        this.getSeriesHeader();
        this.getVatProdPostingGroup();
        this.getItemTracking();
        this.getFamily();
        this.getSubFamily();
    },
    methods: {
        async getUnits() {
            this.$http.get("unit_of_measure").then(response => {
                this.baseUnitOfMeasureOptions = response.data;
                if (this.entity.baseUnitOfMeasure != undefined && this.entity.baseUnitOfMeasure != null && this.entity.baseUnitOfMeasure != '') {
                    this.selectedBaseUnitOfMeasure = this.baseUnitOfMeasureOptions.find(element => element.no === this.entity.baseUnitOfMeasure)
                }
                if (this.entity.salesUnitOfMeasure != undefined && this.entity.salesUnitOfMeasure != null && this.entity.salesUnitOfMeasure != '') {
                    this.selectedSalesUnitOfMeasure = this.baseUnitOfMeasureOptions.find(element => element.no === this.entity.salesUnitOfMeasure)
                }
                if (this.entity.purchUnitOfMeasure != undefined && this.entity.purchUnitOfMeasure != null && this.entity.purchUnitOfMeasure != '') {
                    this.selectedPurchUnitOfMeasure = this.baseUnitOfMeasureOptions.find(element => element.no === this.entity.purchUnitOfMeasure)
                }
            });
        },
        async getInventoryPostingGroup() {
            this.$http.get("inventory_posting_group").then(response => {
                this.inventoryPostingGroupOptions = response.data;
                if (this.entity.inventoryPostingGroup != undefined && this.entity.inventoryPostingGroup != null && this.entity.inventoryPostingGroup != '') {
                    this.selectedInventoryPostingGroup = this.inventoryPostingGroupOptions.find(element => element.no === this.entity.inventoryPostingGroup)
                }
            });
        },
        async getItemDiscountGroup() {
            this.$http.get("item_discount_group").then(response => {
                this.itemDiscountGroupOptions = response.data;
                if (this.entity.itemDiscountGroup != undefined && this.entity.itemDiscountGroup != null && this.entity.itemDiscountGroup != '') {
                    this.selectedItemDiscountGroup = this.itemDiscountGroupOptions.find(element => element.no === this.entity.itemDiscountGroup)
                }
            });
        },
        async getVendor() {
            this.$http.get("vendor").then(response => {
                this.vendorOptions = response.data;
                if (this.entity.vendorNo != undefined && this.entity.vendorNo != null && this.entity.vendorNo != '') {
                    this.selectedVendor = this.vendorOptions.find(element => element.no === this.entity.vendorNo)
                }
            });
        },
        async getGenProdPostingGroup() {
            this.$http.get("general_product_posting_group").then(response => {
                this.genProdPostingGroupOptions = response.data;
                if (this.entity.genProdPostingGroup != undefined && this.entity.genProdPostingGroup != null && this.entity.genProdPostingGroup != '') {
                    this.selectedGenProdPostingGroup = this.genProdPostingGroupOptions.find(element => element.no === this.entity.genProdPostingGroup)
                }
            });
        },
        async getSeriesHeader() {
            this.$http.get("series_header").then(response => {
                this.noSeriesOptions = response.data;
                if (this.entity.noSeries != undefined && this.entity.noSeries != null && this.entity.noSeries != '') {
                    this.selectedNoSeries = this.noSeriesOptions.find(element => element.no === this.entity.noSeries)
                }
                if (this.entity.lotNos != undefined && this.entity.lotNos != null && this.entity.lotNos != '') {
                    this.selectedLotNos = this.noSeriesOptions.find(element => element.no === this.entity.lotNos)
                }
            });
        },
        async getVatProdPostingGroup() {
            this.$http.get("vat_product_posting_group").then(response => {
                this.vatProdPostingGroupOptions = response.data;
                if (this.entity.vatProdPostingGroup != undefined && this.entity.vatProdPostingGroup != null && this.entity.vatProdPostingGroup != '') {
                    this.selectedVatProdPostingGroup = this.vatProdPostingGroupOptions.find(element => element.no === this.entity.vatProdPostingGroup)
                }
            });
        },
        async getItemTracking() {
            this.$http.get("item_tracking_code").then(response => {
                this.itemTrackingOptions = response.data;
                if (this.entity.itemTracking != undefined && this.entity.itemTracking != null && this.entity.itemTracking != '') {
                    this.selectedItemTracking = this.itemTrackingOptions.find(element => element.no === this.entity.itemTracking)
                }
            });
        },
        async getFamily() {
            this.$http.get("item_family").then(response => {
                this.familyOptions = response.data;
                if (this.entity.family != undefined && this.entity.family != null && this.entity.family != '') {
                    this.selectedFamily = this.familyOptions.find(element => element.no === this.entity.family)
                }
            });
        },
        async getSubFamily() {
            this.$http.get("item_sub_family").then(response => {
                this.subfamilyOptions = response.data;
                if (this.entity.subfamily != undefined && this.entity.subfamily != null && this.entity.subfamily != '') {
                    this.selectedSubfamily = this.subfamilyOptions.find(element => element.no === this.entity.subfamily)
                }
            });
        },
        async findById() {
            this.showLoading = true;
            try {
                let response = await this.$http.get(this.componentAPI + "/" + this.$route.params.id);
                this.entity = response.data;
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
                if (this.selectedBaseUnitOfMeasure != null)
                    this.entity.baseUnitOfMeasure = this.selectedBaseUnitOfMeasure.no;
                else
                    this.entity.baseUnitOfMeasure = null;

                if (this.selectedInventoryPostingGroup != null)
                    this.entity.inventoryPostingGroup = this.selectedInventoryPostingGroup.no;
                else
                    this.entity.inventoryPostingGroup = null;

                if (this.selectedItemDiscountGroup != null)
                    this.entity.itemDiscountGroup = this.selectedItemDiscountGroup.no;
                else
                    this.entity.itemDiscountGroup = null;

                // if (this.selectedVendor != null) {
                //     this.entity.vendorNo = this.selectedVendor.no;
                //     this.entity.vendorName = this.selectedVendor.vendorName;
                // }
                // else {
                //     this.entity.vendorNo = null;
                //     this.entity.vendorName = null;
                // }

                if (this.selectedGenProdPostingGroup != null)
                    this.entity.genProdPostingGroup = this.selectedGenProdPostingGroup.no;
                else
                    this.entity.genProdPostingGroup = null;

                if (this.selectedNoSeries != null)
                    this.entity.noSeries = this.selectedNoSeries.no;
                else
                    this.entity.noSeries = null;

                if (this.selectedVatProdPostingGroup != null)
                    this.entity.vatProdPostingGroup = this.selectedVatProdPostingGroup.no;
                else
                    this.entity.vatProdPostingGroup = null;

                if (this.selectedSalesUnitOfMeasure != null)
                    this.entity.salesUnitOfMeasure = this.selectedSalesUnitOfMeasure.no;
                else
                    this.entity.salesUnitOfMeasure = null;

                if (this.selectedPurchUnitOfMeasure != null)
                    this.entity.purchUnitOfMeasure = this.selectedPurchUnitOfMeasure.no;
                else
                    this.entity.purchUnitOfMeasure = null;

                if (this.selectedItemTracking != null)
                    this.entity.itemTracking = this.selectedItemTracking.no;
                else
                    this.entity.itemTracking = null;

                if (this.selectedLotNos != null)
                    this.entity.lotNos = this.selectedLotNos.no;
                else
                    this.entity.lotNos = null;

                if (this.selectedFamily != null)
                    this.entity.family = this.selectedFamily.no;
                else
                    this.entity.family = null;

                if (this.selectedSubfamily != null)
                    this.entity.subfamily = this.selectedSubfamily.no;
                else
                    this.entity.subfamily = null;

                await this.$http.post(this.componentAPI, this.entity);
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