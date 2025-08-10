<template>

    <b-overlay :show="showLoading" spinner-variant="primary">

        <b-modal hide-footer ref="modal" title="" scrollable size="lg">
            <b-row>

                <b-col cols="12">
                    <b-form-group label="N°">
                        <b-form-input v-model="entity.no" ref="no" />
                    </b-form-group>
                </b-col>

                <b-col cols="12">
                    <b-form-group label="Calcul date échéance">
                        <b-form-datepicker v-model="entity.dueDateCalculation" />
                    </b-form-group>
                </b-col>

                <b-col cols="12">
                    <b-form-group label="% Remise">
                        <b-form-input type="number" v-model="entity.discountPercent" />
                    </b-form-group>
                </b-col>

            </b-row>

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


        </b-modal>

        <List :onlyListComponent="true" :componentName="componentName" :componentAPI="componentAPI"
            :breadcrumbData="breadcrumbData" :agGridData="agGridData" @newClicked="newClicked"
            @editclicked="editclicked" />

    </b-overlay>
</template>

<script>

import List from '@/views/components/list/List.vue';

export default {
    components: {
        List
    },
    data() {
        return {
            showLoading: true,
            entity: {},
            emptyEntity: {
                no: "",
                dueDateCalculation: "",
                discountPercent: "",
            },
            selectedEntity: null,
            componentName: "PaymentTerms",
            componentAPI: "payment_terms",
            breadcrumbData: {
                title: "Liste Des conditions de paiement",
                route: [
                    {
                        text: 'Configuration',
                    },
                    {
                        text: 'Conditions de paiement',
                        active: true,
                    },
                ],
                withFilter: false
            },
            agGridData: {
                columnDefs: [
                    {
                        headerName: "Code",
                        field: "no",
                    },
                    {
                        headerName: "Calcul date échéance",
                        field: "dueDateCalculation",
                    },
                    {
                        headerName: "% Remise",
                        field: "discountPercent",
                    },
                ],
                rows: []
            },
        }
    },
    created() {
        this.entity = { ...this.emptyEntity };
        this.loadData();
    },
    methods: {
        async loadData() {
            let response = await this.$http.get(this.componentAPI);
            this.agGridData.rows = response.data;
            this.showLoading = false;
        },
        newClicked() {
            this.entity = { ...this.emptyEntity };
            this.selectedEntity = null;
            this.$refs['modal'].show();
            setTimeout(() => {
                this.$refs["no"].focus();
            }, 300);
        },
        editclicked(data) {
            this.entity = { ...data };
            this.selectedEntity = { ...data };
            this.$refs['modal'].show();
            setTimeout(() => {
                this.$refs["no"].focus();
            }, 300);
        },
        async save() {
            this.showLoading = true;
            try {
                await this.$http.post(this.componentAPI, this.entity);
                this.$refs["modal"].hide();
                this.loadData();
            } catch {
                this.showLoading = false;
            }
        },
        reset() {
            if (this.selectedEntity == null)
                this.entity = { ...this.emptyEntity };
            else
                this.entity = { ...this.selectedEntity };
        }
    }
}
</script>