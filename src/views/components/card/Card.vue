<template>
    <b-overlay :show="showLoading" spinner-variant="primary">
        <b-card>

            <BreadcrumbSheet :componentName="componentName" :componentAPI="entityDefinition.apiURI"
                :breadcrumbData="localBreadcrumbData" @reset="reset" @save="save" :isSetup="isSetup" />

            <hr>

            <Form :entityDefinition="entityDefinition" :entity.sync="entity" v-model="entity"
                :componentName="componentName" :isEditMode="!!$route.params.id" :seriesHeaderData="seriesHeaderData" />
            <hr>

            <List v-if="componentLineName && entityLoaded" :isCardLine="true" :componentName="componentLineName"
                :entityHeader="entity" :onlyListComponent="true" :linesEnabled="!!entity.id"
                @saveClicked="(data) => $emit('saveClicked', data)" ref="linesList" />

        </b-card>
    </b-overlay>
</template>

<script>

import BreadcrumbSheet from '@/views/components/breadCrumb/BreadcrumbCard.vue';
import { getColumnDefinitionForCard } from '@/entities/entitiesConfigService';
import { getBreadcrumbCard } from '@/entities/entitiesConfigService';
import Form from '../form/Form.vue';
import List from '@/views/components/list/List.vue';

export default {
    props: {
        isSetup: {
            type: Boolean,
            required: false,
            default: false,
        },
        componentName: {
            type: String,
            required: true,
        },
        componentLineName: {
            type: String,
            required: false,
        },
        breadcrumbData: {
            type: Object,
            required: false,
        },
    },
    components: {
        BreadcrumbSheet,
        Form,
        List
    },
    data() {
        return {
            showLoading: false,
            entity: {},
            entityLoaded: false,
            entityDefinition: getColumnDefinitionForCard(this.componentName),
            localBreadcrumbData: this.breadcrumbData || {
                title: "",
                route: [],
                withFilter: false,
            },
            seriesHeaderData: null,
        }
    },
    async mounted() {
        // If breadcrumbData is not provided, use default from columnDefinitions.js
        if (!this.breadcrumbData)
            this.localBreadcrumbData = getBreadcrumbCard(this.componentName);
    },
    async created() {
        console.log("Entity Definition:", this.entityDefinition);

        // Fetch series header data if this entity has series headers

        if (this.isSetup) {
            await this.loadData();
        }
        else if (this.$route.params.id) {
            await this.findById();
            this.entityLoaded = true;
        } else {
            await this.loadSeriesHeaderData();
            this.entityLoaded = true;
        }
    },
    methods: {
        async findById() {
            this.showLoading = true;
            try {
                let response = await this.$http.get(this.entityDefinition.apiURI + "/" + this.$route.params.id);
                this.entity = response.data;
            } finally {
                this.showLoading = false;
            }
        },
        async loadData() {
            this.showLoading = true;
            try {
                let response = await this.$http.get(this.entityDefinition.apiURI);
                if (response.data.length > 0)
                    this.entity = response.data[0];
            } finally {
                this.showLoading = false;
            }
        },
        async reset() {
            this.entity = {};
            if (this.$route.params.id) {
                this.findById();
            }
        },
        async save() {
            console.log("save", this.entityDefinition.apiURI);

            // Validate mandatory fields before saving
            const validationErrors = this.validateMandatoryFields();
            if (validationErrors.length > 0) {
                this.$swal.fire({
                    position: "absolute",
                    icon: "error",
                    title: "Champs obligatoires manquants",
                    html: `Les champs suivants sont obligatoires :<br><ul>${validationErrors.map(error => `<li>${error}</li>`).join('')}</ul>`,
                    showConfirmButton: true
                });
                return;
            }

            this.showLoading = true;
            try {
                const seriesHeaderNo = this.seriesHeaderData ? this.seriesHeaderData.no : null;
                const response = await this.$http.post(this.entityDefinition.apiURI, this.entity, {
                    params: { seriesHeaderNo }
                });

                // Update the entity with the returned data (including the ID)
                if (response.data) {
                    this.entity = { ...this.entity, ...response.data };
                }

                if (this.isSetup) {
                    this.$swal.fire({
                        position: "absolute",
                        icon: "success",
                        title: "Modification effectuée avec succès.",
                        showConfirmButton: true,
                        timer: 5000
                    });
                } else if (this.componentLineName) {
                    // If this is a header with lines, show success message and stay on card
                    this.$swal.fire({
                        position: "absolute",
                        icon: "success",
                        title: "En-tête sauvegardé avec succès.",
                        text: "Vous pouvez maintenant ajouter des lignes.",
                        showConfirmButton: true,
                        timer: 3000
                    });

                    // Update the URL to include the ID for proper edit mode
                    if (response.data && response.data.id && !this.$route.params.id) {
                        const newRoute = {
                            name: this.$route.name,
                            params: { ...this.$route.params, id: response.data.id },
                            query: this.$route.query
                        };
                        this.$router.replace(newRoute);
                    }
                } else {
                    // If this is a simple card without lines, go to list
                    this.$router.push({ name: this.componentName + "_READ" })
                }
            } finally {
                this.showLoading = false;
            }
        },
        async refreshLines() {
            // Refresh the lines list if it exists
            if (this.$refs.linesList && this.$refs.linesList.loadData) {
                await this.$refs.linesList.loadData();
            }
        },
        async loadSeriesHeaderData() {
            try {
                // Check if this entity has a seriesHeaderNo field
                const hasSeriesHeader = this.hasSeriesHeaderField();
                if (hasSeriesHeader) {
                    const response = await this.$http.get('/series_header/findByEntityName/' + this.componentName);
                    this.seriesHeaderData = response.data;
                }
            } catch (error) {
                console.warn('Error loading series header data:', error);
            }
        },
        hasSeriesHeaderField() {
            // Check if entity exists in the entitiesWithSeriesHeaders list
            return window.entitiesWithSeriesHeaders && window.entitiesWithSeriesHeaders.includes(this.componentName);
        },
        validateMandatoryFields() {
            const errors = [];

            // Get all fields from the entity definition
            let allFields = [];
            if (this.entityDefinition.tabs && this.entityDefinition.tabs.length) {
                // If entity has tabs, get fields from all tabs
                this.entityDefinition.tabs.forEach(tab => {
                    if (tab.fields) {
                        allFields = allFields.concat(tab.fields);
                    }
                });
            } else if (this.entityDefinition.fields) {
                // If entity has no tabs, get fields directly
                allFields = this.entityDefinition.fields;
            }

            // Check each mandatory field
            allFields.forEach(field => {
                if (field.mandatory) {
                    // Skip validation for "no" field if entity has series headers
                    if (field.field === 'no' && this.hasSeriesHeaderField()) {
                        return;
                    }
                    const value = this.entity[field.field];
                    if (!value || (typeof value === 'string' && value.trim() === '')) {
                        errors.push(field.label.fr || field.field);
                    }
                }
            });

            return errors;
        }
    },
}
</script>

<style lang="scss"></style>