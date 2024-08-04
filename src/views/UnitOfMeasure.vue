<template>

    <b-overlay :show="showLoading" spinner-variant="primary">

        <b-modal hide-footer ref="modal" title="" scrollable size="lg">
            <b-row>

                <b-col cols="12">
                    <b-form-group label="Code">
                        <b-form-input v-model="unitOfMeasure.no" ref="no" />
                    </b-form-group>
                </b-col>

                <b-col cols="12">
                    <b-form-group label="Description">
                        <b-form-input v-model="unitOfMeasure.description" ref="description" />
                    </b-form-group>
                </b-col>

            </b-row>

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
            unitOfMeasure: {
                no: "",
                description: ""
            },
            selectedUnitOfMeasure: {},
            componentName: "UnitOfMeasure",
            componentAPI: "unit_of_measure",
            breadcrumbData: {
                title: "Unités De Mesure",
                route: [
                    {
                        text: 'Configuration',
                    },
                    {
                        text: 'Unités De Mesure',
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
        this.loadData();
    },
    methods: {
        async loadData() {
            let response = await this.$http.get(this.componentAPI);
            this.agGridData.rows = response.data;
            this.showLoading = false;
        },
        newClicked() {
            this.unitOfMeasure = {
                no: "",
                description: ""
            };
            this.selectedUnitOfMeasure = {
                no: "",
                description: ""
            };
            this.$refs['modal'].show();
            setTimeout(() => {
                this.$refs["no"].focus();
            }, 300);
        },
        editclicked(data) {
            this.unitOfMeasure = data;
            this.selectedUnitOfMeasure = { ...data };
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
            this.unitOfMeasure = { ...this.selectedUnitOfMeasure };
        }
    }
}
</script>

<style></style>