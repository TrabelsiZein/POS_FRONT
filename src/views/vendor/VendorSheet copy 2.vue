<template>
    <b-overlay :show="showLoading" spinner-variant="primary">
        <b-card>

            <BreadcrumbSheet :componentName="$options.name" :componentAPI="entityDefinition.apiURI"
                :breadcrumbData="breadcrumbData" @reset="reset" @save="save" />

            <hr>

            <app-collapse accordion type="border" v-for="tab in entityDefinition.tabs" :key="tab.id" class="mb-50">
                <app-collapse-item :title="tab.title.fr" :isVisible="tab.open">
                    <b-row>
                        <BcFormField v-for="field in getTabFields(tab.id)" :key="field.field" :label="field.label.fr"
                            :type="field.type"
                            :tooltip="field.tooltip ? field.tooltip.fr ? field.tooltip.fr : field.label.fr : field.label.fr"
                            :lookupComponentName="field.lookupEntity" :lookupApiURI="field.lookupEntity"
                            v-model="entity[field.field]" />
                    </b-row>
                </app-collapse-item>
            </app-collapse>

        </b-card>
    </b-overlay>
</template>

<script>

import BreadcrumbSheet from '@/views/components/BreadcrumbSheet.vue';
import BcFormField from '../components/form/BcFormField.vue';
import AppCollapse from '@core/components/app-collapse/AppCollapse.vue'
import AppCollapseItem from '@core/components/app-collapse/AppCollapseItem.vue'
import { getColumnDefinitionForCard } from '@/entities/entitiesConfigService';

export default {
    name: 'Vendor',
    components: {
        BreadcrumbSheet,
        BcFormField,
        AppCollapse,
        AppCollapseItem,
    },
    data() {
        return {
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
            entityDefinition: getColumnDefinitionForCard(this.$options.name),
        }
    },
    async created() {
        if (this.$route.params.id) {
            await this.findById();
        }
    },
    methods: {
        getTabFields(tabId) {
            return this.entityDefinition.fields.filter(
                f => f.tab === tabId && f.showCard
            );
        },
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