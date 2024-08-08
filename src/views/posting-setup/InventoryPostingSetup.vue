<template>

    <b-overlay :show="showLoading" spinner-variant="primary">

        <b-modal hide-footer ref="modal" title="" scrollable size="lg">
            <b-row>

                <b-col cols="12">
                    <b-form-group label="Magasin">
                        <v-select v-model="selectedLocation" label="name" :options="locationOptions" />
                    </b-form-group>
                </b-col>

                <b-col cols="12">
                    <b-form-group label="Groupe compta. stock">
                        <v-select v-model="selectedInventoryPostingGroup" label="description"
                            :options="inventoryPostingGroupOptions" />
                    </b-form-group>
                </b-col>

                <b-col cols="12">
                    <b-form-group label="Compte stocks">
                        <v-select v-model="selectedGLAccount" label="name" :options="gLAccountOptions" />
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
import vSelect from 'vue-select'

export default {
    components: {
        List,
        vSelect
    },
    data() {
        return {
            showLoading: true,
            entity: {},
            emptyEntity: {
                locationCode: "",
                invtPostingGroupCode: "",
                inventoryAccount: ""
            },
            selectedEntity: null,
            componentName: "InventoryPostingSetup",
            componentAPI: "inventory_posting_setup",
            breadcrumbData: {
                title: "Paramètres compta. Stock",
                route: [
                    {
                        text: 'Configuration',
                    },
                    {
                        text: 'Paramètres compta. Stock',
                        active: true,
                    },
                ],
                withFilter: false
            },
            agGridData: {
                columnDefs: [
                    {
                        headerName: "Code magasin",
                        field: "locationCode",
                    },
                    {
                        headerName: "Code groupe compta. stock",
                        field: "invtPostingGroupCode",
                    },
                    {
                        headerName: "Compte stocks",
                        field: "inventoryAccount",
                    },
                ],
                rows: []
            },
            locationOptions: [],
            selectedLocation: null,
            inventoryPostingGroupOptions: [],
            selectedInventoryPostingGroup: null,
            gLAccountOptions: [],
            selectedGLAccount: null
        }
    },
    created() {
        this.entity = { ...this.emptyEntity };
        this.loadData();
    },
    methods: {
        async loadData() {
            this.entity = { ...this.emptyEntity };
            this.loadLocation();
            this.loadInventoryPostingGroup();
            this.loadGeneralLedgerAccount();
            let response = await this.$http.get(this.componentAPI);
            this.agGridData.rows = response.data;
            this.showLoading = false;
        },
        newClicked() {
            this.entity = { ...this.emptyEntity };
            this.selectedEntity = null;
            this.selectedLocation = null;
            this.selectedInventoryPostingGroup = null;
            this.selectedGLAccount = null;
            this.$refs['modal'].show();
        },
        editclicked(data) {
            this.entity = { ...data };
            this.selectedEntity = { ...data };
            if (data.locationCode != null && data.locationCode != '')
                this.selectedLocation = this.locationOptions.find(el => el.no === data.locationCode);
            else
                this.selectedLocation = null;

            if (data.invtPostingGroupCode != null && data.invtPostingGroupCode != '')
                this.selectedInventoryPostingGroup = this.inventoryPostingGroupOptions.find(el => el.no === data.invtPostingGroupCode);
            else
                this.selectedInventoryPostingGroup = null;

            if (data.inventoryAccount != null && data.inventoryAccount != '')
                this.selectedGLAccount = this.gLAccountOptions.find(el => el.no === data.inventoryAccount);
            else
                this.selectedGLAccount = null;

            this.$refs['modal'].show();
        },
        async save() {
            this.showLoading = true;
            try {
                if (this.selectedLocation != null)
                    this.entity.locationCode = this.selectedLocation.no;
                else
                    this.entity.locationCode = null;

                if (this.selectedInventoryPostingGroup != null)
                    this.entity.invtPostingGroupCode = this.selectedInventoryPostingGroup.no;
                else
                    this.entity.invtPostingGroupCode = null;

                if (this.selectedGLAccount != null)
                    this.entity.inventoryAccount = this.selectedGLAccount.no;
                else
                    this.entity.inventoryAccount = null;

                await this.$http.post(this.componentAPI, this.entity);
                this.$refs["modal"].hide();
                this.loadData();
            } catch (error) {
                console.log(error);
                this.showLoading = false;
            }
        },
        reset() {
            if (this.selectedEntity == null)
                this.entity = { ...this.emptyEntity };
            else
                this.entity = { ...this.selectedEntity };

            if (this.entity.locationCode != null && this.entity.locationCode != '')
                this.selectedLocation = this.locationOptions.find(el => el.no === this.entity.locationCode);
            else
                this.selectedLocation = null;

            if (this.entity.invtPostingGroupCode != null && this.entity.invtPostingGroupCode != '')
                this.selectedInventoryPostingGroup = this.inventoryPostingGroupOptions.find(el => el.no === this.entity.invtPostingGroupCode);
            else
                this.selectedInventoryPostingGroup = null;

            if (this.entity.inventoryAccount != null && this.entity.inventoryAccount != '')
                this.selectedGLAccount = this.gLAccountOptions.find(el => el.no === this.entity.inventoryAccount);
            else
                this.selectedGLAccount = null;
        },
        loadLocation() {
            this.$http.get("location").then(response => {
                this.locationOptions = response.data;
            });
        },
        loadInventoryPostingGroup() {
            this.$http.get("inventory_posting_group").then(response => {
                this.inventoryPostingGroupOptions = response.data;
            });
        },
        loadGeneralLedgerAccount() {
            this.$http.get("general_ledger_account").then(response => {
                this.gLAccountOptions = response.data;
            });
        },
    }
}
</script>

<style lang="scss" scoped>
@import '@core/scss/vue/libs/vue-select.scss';

.v-select .vs__dropdown-menu {
    z-index: 1050;
    position: relative;
}
</style>