<template>
    <b-overlay :show="showLoading" spinner-variant="primary">
        <b-card>

            <BreadcrumbSheet :componentName="componentName" :componentAPI="componentAPI"
                :breadcrumbData="breadcrumbData" @reset="reset" @save="save" />

            <hr>

            <b-row>

                <b-col sm="12" md="6" lg="4">
                    <b-form-group label="N°">
                        <b-form-input size="sm" v-model="entity.no" />
                    </b-form-group>
                </b-col>

                <b-col sm="12" md="6" lg="4">
                    <b-form-group label="Nom">
                        <b-form-input size="sm" v-model="entity.name" />
                    </b-form-group>
                </b-col>

                <b-col sm="12" md="6" lg="4">
                    <b-form-group label="Nom 2">
                        <b-form-input size="sm" v-model="entity.name2" />
                    </b-form-group>
                </b-col>

                <b-col sm="12" md="6" lg="12">
                    <b-form-group label="Adresse">
                        <b-form-textarea size="sm" v-model="entity.address" rows="2" />
                    </b-form-group>
                </b-col>

                <b-col sm="12" md="6" lg="12">
                    <b-form-group label="Contact">
                        <b-form-textarea size="sm" v-model="entity.contact" rows="1" />
                    </b-form-group>
                </b-col>

                <b-col sm="12" md="6" lg="3">
                    <b-form-group label="Groupe compta. marché">
                        <EntityLookup :key="lookupKey" title="Groupe compta. marché"
                            componentName="GeneralBusinessPostingGroup" apiURI="general_business_posting_group"
                            :selectedItem="entity.genBusPostingGroup" field="genBusPostingGroup"
                            @onItemSelected="onLookupItemSelected" />
                    </b-form-group>
                </b-col>

                <b-col sm="12" md="6" lg="3">
                    <b-form-group label="Téléphone">
                        <b-form-input size="sm" v-model="entity.phoneNo" />
                    </b-form-group>
                </b-col>

                <b-col sm="12" md="6" lg="3">
                    <b-form-group label="Code secteur">
                        <EntityLookup :key="lookupKey" title="Secteurs" componentName="Territory" apiURI="territory"
                            field="territoryCode" :selectedItem="entity.territoryCode"
                            @onItemSelected="onLookupItemSelected" :columnDefs="territoryColumnDefs" />
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
                    <b-form-group label="Groupe compta. fournisseur">
                        <b-form-input size="sm" v-model="entity.vendorPostingGroup" />
                    </b-form-group>
                </b-col>

                <b-col sm="12" md="6" lg="3">
                    <b-form-group label="Code devise">
                        <EntityLookup :key="lookupKey" title="Code devise" componentName="Currency" apiURI="currency"
                            field="currencyCode" :selectedItem="entity.currencyCode"
                            @onItemSelected="onLookupItemSelected" />
                    </b-form-group>
                </b-col>

                <b-col sm="12" md="6" lg="3">
                    <b-form-group label="Code condition paiement">
                        <EntityLookup :key="lookupKey" title="Conditions de paiement" componentName="PaymentTerms"
                            apiURI="payment_terms" field="paymentTermsCode" :selectedItem="entity.paymentTermsCode"
                            @onItemSelected="onLookupItemSelected" :columnDefs="PaymentTermsColumnDefs" />
                    </b-form-group>
                </b-col>

                <b-col sm="12" md="6" lg="3">
                    <b-form-group label="Code acheteur">
                        <EntityLookup :key="lookupKey" title="Acheteurs" componentName="SalesPersonPurchaser"
                            apiURI="sales_person_purchaser" field="purchaserCode" :selectedItem="entity.purchaserCode"
                            @onItemSelected="onLookupItemSelected" :columnDefs="PersonColumnDefs" />
                    </b-form-group>
                </b-col>

                <b-col sm="12" md="6" lg="3">
                    <b-form-group label="Code transporteur">
                        <EntityLookup :key="lookupKey" title="Transporteurs" componentName="ShipmentAgent"
                            apiURI="shipment_agent" field="shippingAgentCode" :selectedItem="entity.shippingAgentCode"
                            @onItemSelected="onLookupItemSelected" :columnDefs="PersonColumnDefs" />
                    </b-form-group>
                </b-col>

                <b-col sm="12" md="6" lg="3">
                    <b-form-group label="N° fournisseur à payer">
                        <EntityLookup :key="lookupKey" title="N° fournisseur à payer" componentName="Vendor"
                            apiURI="vendor" field="payToVendorNo" :selectedItem="entity.payToVendorNo"
                            @onItemSelected="onLookupItemSelected" />
                    </b-form-group>
                </b-col>

                <b-col sm="12" md="6" lg="3">
                    <b-form-group label="Code mode de règlement">
                        <EntityLookup :key="lookupKey" title="Code mode de règlement" componentName="PaymentMethod"
                            apiURI="payment_method" field="paymentMethodCode" :selectedItem="entity.paymentMethodCode"
                            @onItemSelected="onLookupItemSelected" />
                    </b-form-group>
                </b-col>

                <b-col sm="12" md="6" lg="3">
                    <b-form-group label="Prix TTC">
                        <b-form-checkbox v-model="entity.pricesIncludingVAT" class="mr-0 mt-50" switch inline />
                    </b-form-group>
                </b-col>

                <b-col sm="12" md="6" lg="3">
                    <b-form-group label="Matricule fiscal">
                        <b-form-input size="sm" v-model="entity.vatregistrationNo" />
                    </b-form-group>
                </b-col>

                <b-col sm="12" md="6" lg="3">
                    <b-form-group label="Email">
                        <b-form-input size="sm" v-model="entity.email" />
                    </b-form-group>
                </b-col>

                <b-col sm="12" md="6" lg="3">
                    <b-form-group label="Souches de n°">
                        <EntityLookup :key="lookupKey" title="Souches de n°" componentName="SeriesHeader"
                            apiURI="series_header" field="noSeries" :selectedItem="entity.noSeries"
                            @onItemSelected="onLookupItemSelected" />
                    </b-form-group>
                </b-col>

                <b-col sm="12" md="6" lg="3">
                    <b-form-group label="Groupe compta. marché TVA">
                        <EntityLookup :key="lookupKey" title="Groupe compta. marché TVA"
                            componentName="GeneralBusinessPostingGroup" apiURI="general_business_posting_group"
                            field="vatbusPostingGroup" :selectedItem="entity.vatbusPostingGroup"
                            @onItemSelected="onLookupItemSelected" />
                    </b-form-group>
                </b-col>

                <b-col sm="12" md="6" lg="3">
                    <b-form-group label="Code magasin">
                        <EntityLookup :key="lookupKey" title="Code magasin" componentName="Location" apiURI="location"
                            field="locationCode" :selectedItem="entity.locationCode"
                            @onItemSelected="onLookupItemSelected" :columnDefs="[
                                { headerName: 'N°', field: 'no' },
                                { headerName: 'Name', field: 'name' },
                            ]" />
                    </b-form-group>
                </b-col>

            </b-row>

        </b-card>
    </b-overlay>
</template>

<script>

import BreadcrumbSheet from '@/views/components/BreadcrumbSheet.vue';
import EntityLookup from '@/views/components/lookup/EntityLookup.vue';

export default {
    components: {
        BreadcrumbSheet,
        EntityLookup
    },
    data() {
        return {
            PersonColumnDefs: [
                {
                    headerName: "Code",
                    field: "no",
                },
                {
                    headerName: "Nom",
                    field: "name",
                },
                {
                    headerName: "Email",
                    field: "email",
                },
                {
                    headerName: "Téléphone",
                    field: "phone",
                },
            ],
            territoryColumnDefs: [{ headerName: 'N°', field: 'no' }, { headerName: 'Nom', field: 'name' }],
            PaymentTermsColumnDefs: [{ headerName: 'N°', field: 'no' }, { headerName: "Calcul date échéance", field: "dueDateCalculation", }, { headerName: "% Remise", field: "discountPercent", }],
            lookupKey: 0,
            showLoading: false,
            componentName: "Vendor",
            componentAPI: "vendor",
            breadcrumbData: {
                title: "Fiche Fournisseur",
                route: [
                    {
                        text: 'Fournisseurs',
                    },
                    {
                        text: 'Liste des fournisseurs',
                    },
                    {
                        text: 'Fiche',
                        active: true,
                    },
                ],
                showDeleteBtn: this.$route.params.id
            },
            entity: {},
        }
    },
    async created() {
        if (this.$route.params.id) {
            await this.findById();
        }
    },
    methods: {
        onLookupItemSelected(data, field) {
            this.entity[field] = data.no;
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
            this.entity = {};
            if (this.$route.params.id) {
                this.findById();
            }
            this.lookupKey += 1;
        },
        async save() {
            this.showLoading = true;
            try {
                await this.$http.post(this.componentAPI, this.entity);
                this.$router.push({ name: this.componentName + "_READ" })
            } finally {
                this.showLoading = false;
            }
        }
    }
}
</script>

<style lang="scss"></style>