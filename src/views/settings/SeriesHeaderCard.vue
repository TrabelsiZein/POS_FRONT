<template>
    <b-overlay :show="showLoading" spinner-variant="primary">
        <Card :componentName="$options.entity" :componentLineName="$options.entityLine" @saveClicked="saveLineClicked"
            ref="cardComponent" />
    </b-overlay>
</template>

<script>

import Card from '@/views/components/card/Card.vue';
import { getColumnDefinitionForCard } from '@/entities/entitiesConfigService';

export default {
    name: 'SeriesHeaderCard',
    entity: 'SeriesHeader',
    entityLine: 'SeriesLine',
    components: {
        Card,
    },
    data() {
        return {
            showLoading: false,
            salesHeader: null, // Store the header data
        }
    },
    methods: {
        async saveLineClicked(salesLineData) {
            console.log("Sales Line Data received:", salesLineData);
            console.log("Sales Header Data:", this.salesHeader);

            this.showLoading = true;

            try {
                // Get the current series header data from the Card component
                const headerData = this.$refs.cardComponent.entity;

                // Guard: header must be saved first
                if (!headerData?.id) {
                    this.$swal.fire({
                        position: "absolute",
                        icon: "warning",
                        title: "Impossible d'ajouter une ligne",
                        text: "Veuillez d'abord sauvegarder la souche.",
                        showConfirmButton: true
                    });
                    return;
                }

                // Validate mandatory fields for the line
                const validationErrors = this.validateLineMandatoryFields(salesLineData);
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

                // Prepare line payload with header context
                const payload = {
                    ...salesLineData,
                    documentId: headerData.id,
                    documentNo: headerData.no,
                };

                // Persist the line
                const seriesLineDef = getColumnDefinitionForCard('SeriesLine');
                await this.$http.post(seriesLineDef.apiURI, payload);

                // Success toast
                await this.$swal.fire({
                    position: "absolute",
                    icon: "success",
                    title: "Ligne ajoutée avec succès.",
                    showConfirmButton: true,
                    timer: 2500
                });

                // Refresh the lines list on the card
                await this.$refs.cardComponent.refreshLines();

            } catch (error) {
                console.error("Error saving series line:", error);
                this.$swal.fire({
                    position: "absolute",
                    icon: "error",
                    title: "Erreur lors de l'ajout de la ligne.",
                    text: error.response?.data?.message || "Une erreur est survenue.",
                    showConfirmButton: true
                });
            } finally {
                this.showLoading = false;
            }

        },
        
        validateLineMandatoryFields(lineData) {
            const errors = [];
            const seriesLineDef = getColumnDefinitionForCard('SeriesLine');
            
            // Get all fields from the SeriesLine definition
            let allFields = [];
            if (seriesLineDef.tabs && seriesLineDef.tabs.length) {
                seriesLineDef.tabs.forEach(tab => {
                    if (tab.fields) {
                        allFields = allFields.concat(tab.fields);
                    }
                });
            } else if (seriesLineDef.fields) {
                allFields = seriesLineDef.fields;
            }
            
            // Check each mandatory field
            allFields.forEach(field => {
                if (field.mandatory) {
                    const value = lineData[field.field];
                    if (!value || (typeof value === 'string' && value.trim() === '')) {
                        errors.push(field.label.fr || field.field);
                    }
                }
            });
            
            return errors;
        },

    }

}
</script>

<style lang="scss"></style>