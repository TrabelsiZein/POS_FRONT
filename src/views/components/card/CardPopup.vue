<template>
    <b-modal hide-footer v-model="showPopup" ref="modal" :title="entityDefinition.titleForm" scrollable size="xl"
        no-close-on-esc no-close-on-backdrop>

        <b-overlay :show="showLoading" spinner-variant="primary">
            <Form :isPopup="true" :entityDefinition="entityDefinition" :entity.sync="entity" v-model="entity"
                :componentName="componentName" :isEditMode="localEditMode" :seriesHeaderData="seriesHeaderData"
                ref="form" />
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

        </b-overlay>

    </b-modal>
</template>

<script>

import Form from '../form/Form.vue';
import { getColumnDefinitionForCard } from '@/entities/entitiesConfigService';

export default {
    name: 'CardPopup',
    props: {
        enableAutoSave: {
            type: Boolean,
            required: false,
            default: true,
        },
        componentName: {
            type: String,
            required: true,
        },
        entityData: {
            type: Object,
            required: false,
        },
        editMode: {
            type: Boolean,
            required: false,
        },
    },
    components: {
        Form
    },
    data() {
        return {
            localEditMode: this.editMode || false,
            showPopup: false,
            showLoading: false,
            entity: {},
            selectedEntity: {},
            entityDefinition: getColumnDefinitionForCard(this.componentName),
            seriesHeaderData: null,
        }
    },
    async created() {
        // Fetch series header data if this entity has series headers
        if (!this.localEditMode)
            await this.loadSeriesHeaderData();
    },
    watch: {
        showPopup(newValue) {
            if (newValue) {
                setTimeout(() => {
                    const inputComponent = this.$refs.form.$refs.ref_0[0];
                    inputComponent.focus();
                }, 200);
            }
        },
        entityData: {
            handler(newValue) {
                this.entity = newValue;
                this.selectedEntity = newValue;
            },
            immediate: true,
        },
        editMode(newValue) {
            this.localEditMode = newValue;
        }
    },
    methods: {
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
        async reset() {
            this.entity = this.localEditMode ? this.selectedEntity : {};
        },
        async save() {
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

            if (this.enableAutoSave) {
                this.showLoading = true;
                try {
                    const seriesHeaderNo = this.seriesHeaderData ? this.seriesHeaderData.no : null;
                    await this.$http.post(this.entityDefinition.apiURI, this.entity, {
                        params: { seriesHeaderNo }
                    });
                    this.$refs.modal.hide();
                } finally {
                    this.showLoading = false;
                    this.$emit('entitySaved', this.entity);
                }
            } else {
                this.$refs.modal.hide();
                this.$emit('saveClicked', this.entity);
            }
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