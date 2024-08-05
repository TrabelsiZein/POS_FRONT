<template>

    <b-overlay :show="showLoading" spinner-variant="primary">

        <b-modal hide-footer ref="modal" title="" scrollable size="lg">
            <b-row>

                <b-col cols="12">
                    <b-form-group label="N°">
                        <b-form-input v-model="unitOfMeasure.no" ref="no" />
                    </b-form-group>
                </b-col>

                <b-col cols="12">
                    <b-form-group label="Description">
                        <b-form-input v-model="unitOfMeasure.description" ref="description" />
                    </b-form-group>
                </b-col>

                <b-col cols="12">
                    <b-form-group label="Quantité par unité">
                        <b-form-input type="number" v-model="unitOfMeasure.qtyPerUnitOfMeasure"
                            ref="qtyPerUnitOfMeasure" />
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
                description: "",
                qtyPerUnitOfMeasure: 0
            },
            selectedEntity: null,
            componentName: "ItemUnitOfMeasure",
            componentAPI: "item_unit_of_measure",
            breadcrumbData: {
                title: "Unités De Mesure Article",
                route: [
                    {
                        text: 'Configuration',
                    },
                    {
                        text: 'Unités De Mesure Article',
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
                        headerName: "Description",
                        field: "description",
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
            this.entity = data;
            this.selectedEntity = { ...data };
            this.$refs['modal'].show();
            setTimeout(() => {
                this.$refs["no"].focus();
            }, 300);
        },
        async save() {
            this.showLoading = true;
            try {
                await this.$http.post(this.componentAPI, this.unitOfMeasure);
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
