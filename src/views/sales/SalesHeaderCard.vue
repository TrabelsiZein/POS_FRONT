<template>
    <b-overlay :show="showLoading" spinner-variant="primary">
        <Card :componentName="$options.entity" :componentLineName="$options.entityLine"
            @saveClicked="saveLineClicked" ref="cardComponent" />
    </b-overlay>
</template>

<script>

import Card from '@/views/components/card/Card.vue';
import { getColumnDefinitionForCard } from '@/entities/entitiesConfigService';

export default {
    name: 'SalesHeaderCard',
    entity: 'SalesHeader',
    entityLine: 'SalesLine',
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
                // Get the current sales header data from the Card component
                const headerData = this.$refs.cardComponent.entity;
                
                // Check if header has an ID, if not, show error
                if (!headerData.id) {
                    this.$swal.fire({
                        position: "absolute",
                        icon: "warning",
                        title: "Impossible d'ajouter une ligne",
                        text: "Veuillez d'abord sauvegarder l'en-tête de vente.",
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
                
                // Prepare the sales line data with header context
                const enrichedSalesLineData = {
                    ...salesLineData,
                    // Copy essential header fields to the line
                    documentType: headerData.documentType,
                    documentNo: headerData.no,
                    documentId: headerData.id,
                    sellToCustomerNo: headerData.sellToCustomerNo,
                    billToCustomerNo: headerData.billToCustomerNo,
                    currencyNo: headerData.currencyNo,
                    paymentTermsNo: headerData.paymentTermsNo,
                    locationNo: headerData.locationNo,
                    shortcutDimension1Code: headerData.shortcutDimension1Code,
                    shortcutDimension2Code: headerData.shortcutDimension2Code,
                    customerPriceGroupNo: headerData.customerPriceGroupNo,
                    customerDiscGroup: headerData.customerDiscGroup,
                    pricesIncludingVAT: headerData.pricesIncludingVAT,
                    genBusPostingGroupNo: headerData.genBusPostingGroupNo,
                    vatBusPostingGroupNo: headerData.vatBusPostingGroupNo,
                    territoryNo: headerData.territoryNo,
                    responsibilityCenterNo: headerData.responsibilityCenterNo,
                    // Set default values for new line
                    lineNo: await this.getNextLineNo(headerData.no),
                    quantity: salesLineData.quantity || 1,
                    unitPrice: salesLineData.unitPrice || 0,
                    allowLineDisc: headerData.allowLineDisc !== undefined ? headerData.allowLineDisc : true,
                    allowInvoiceDisc: true,
                    // Set type to 'Item' by default if not specified
                    type: salesLineData.type || 'ITEM'
                };
                
                console.log("Enriched Sales Line Data:", enrichedSalesLineData);
                
                // Call the API to save the sales line
                const salesLineEntityDef = getColumnDefinitionForCard('SalesLine');
                await this.$http.post(salesLineEntityDef.apiURI, enrichedSalesLineData);
                
                // Show success message
                this.$swal.fire({
                    position: "absolute",
                    icon: "success",
                    title: "Ligne de vente ajoutée avec succès.",
                    showConfirmButton: true,
                    timer: 3000
                });
                
                // Refresh the sales lines list
                await this.$refs.cardComponent.refreshLines();
                
            } catch (error) {
                console.error("Error saving sales line:", error);
                
                // Show error message
                this.$swal.fire({
                    position: "absolute",
                    icon: "error",
                    title: "Erreur lors de l'ajout de la ligne de vente.",
                    text: error.response?.data?.message || "Une erreur est survenue.",
                    showConfirmButton: true
                });
            } finally {
                this.showLoading = false;
            }
        },
        
        async getNextLineNo(documentNo) {
            console.log(documentNo);
            return 10000;
            // try {
            //     // Get the highest line number for this document
            //     const salesLineEntityDef = getColumnDefinitionForCard('SalesLine');
            //     const response = await this.$http.get(`${salesLineEntityDef.apiURI}/max-line-no/${documentNo}`);
            //     return (response.data.maxLineNo || 0) + 10000; // Standard line number increment
            // } catch (error) {
            //     console.warn("Could not get next line number, using default:", error);
            //     return 10000; // Default first line number
            // }
        },
        
        validateLineMandatoryFields(lineData) {
            const errors = [];
            const salesLineDef = getColumnDefinitionForCard('SalesLine');
            
            // Get all fields from the SalesLine definition
            let allFields = [];
            if (salesLineDef.tabs && salesLineDef.tabs.length) {
                salesLineDef.tabs.forEach(tab => {
                    if (tab.fields) {
                        allFields = allFields.concat(tab.fields);
                    }
                });
            } else if (salesLineDef.fields) {
                allFields = salesLineDef.fields;
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
        }
    }

}
</script>

<style lang="scss"></style>