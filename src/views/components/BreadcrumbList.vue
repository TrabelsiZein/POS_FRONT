<template>

    <div>
        <b-row class="content-header">

            <!-- Content Left -->
            <b-col class="content-header-left mb-2" sm="12" md="5" lg="7">
                <b-row class="breadcrumbs-top">
                    <b-col cols="12">
                        <h2 class="content-header-title float-left pr-1 mb-0">
                            {{ breadcrumbData.title }}
                        </h2>
                        <div class="breadcrumb-wrapper">
                            <b-breadcrumb>
                                <b-breadcrumb-item to="/">
                                    <feather-icon icon="HomeIcon" size="16" class="align-text-top" />
                                </b-breadcrumb-item>
                                <b-breadcrumb-item v-for="item in breadcrumbData.route" :key="item.text"
                                    :active="item.active" :to="item.to">
                                    {{ item.text }}
                                </b-breadcrumb-item>
                            </b-breadcrumb>
                        </div>
                    </b-col>
                </b-row>
            </b-col>

            <!-- Content Right -->
            <!-- <b-col class="content-header-right text-md-right d-md-block d-none mb-1" md="5" cols="12"> -->
            <b-col class="content-header-right text-md-right mb-1" sm="12" md="7" lg="5">

                <b-button variant="relief-info" class="btn-icon mr-50 " @click="searchClicked">
                    <feather-icon icon="SearchIcon" />
                </b-button>

                <b-button variant="relief-info" class="btn-icon mr-50 " @click="filterClicked">
                    <feather-icon icon="FilterIcon" />
                </b-button>

                <b-button variant="relief-dark" class="btn-icon mr-50" v-if="breadcrumbData.withFilter">
                    <feather-icon icon="FilterIcon" />
                </b-button>

                <b-button variant="relief-secondary" class="btn-icon mr-50" @click="$emit('downloadClicked')">
                    <feather-icon icon="DownloadIcon" />
                </b-button>

                <b-button variant="relief-warning" class="btn-icon mr-50" @click="$emit('printClicked')">
                    <feather-icon icon="PrinterIcon" />
                </b-button>

                <b-button variant="relief-danger" class="btn-icon mr-50" v-if="$can('DELETE', componentName)"
                    @click="$emit('deleteClicked')">
                    <feather-icon icon="Trash2Icon" />
                </b-button>

                <b-button variant="relief-primary" class="btn-icon mr-50" v-if="$can('EDIT', componentName)"
                    @click="$emit('editClicked')">
                    <feather-icon icon="EditIcon" />
                </b-button>

                <b-button variant="relief-success" class="btn-icon" v-if="$can('WRITE', componentName)"
                    @click="newClicked">
                    <feather-icon icon="PlusIcon" />
                </b-button>

            </b-col>


            <!-- Search Input -->
            <b-col cols="12" v-if="showSearchBar">
                <b-form-group>
                    <b-input-group class="input-group-merge">
                        <b-input-group-prepend is-text>
                            <feather-icon icon="SearchIcon" />
                        </b-input-group-prepend>
                        <b-form-input id="icons-search" ref="icons-search" v-model="inputSearch"
                            @input="updateSearchQuery" placeholder="Recherche..." />
                    </b-input-group>
                </b-form-group>
            </b-col>

            <!-- <b-form-checkbox checked="true" class="custom-control-primary" name="check-button" switch>
            <span class="switch-icon-left">
                ET
            </span>
            <span class="switch-icon-right">
                OU
            </span>
        </b-form-checkbox> -->


        </b-row>

        <!-- Filter Comboboxs -->
        <div v-if="showFilterBar">
            <b-row v-for="(filter, index) in filters" :key="index" class="">
                <!-- Paramètre -->
                <b-col sm="12" md="6" lg="4">
                    <b-form-group label="Paramètre" label-for="param-select">
                        <b-form-select id="param-select" size="sm" v-model="filter.parameter" :options="filterFields"
                            label="label" />
                    </b-form-group>
                </b-col>

                <!-- Valeur -->
                <b-col sm="12" md="6" lg="4">
                    <b-form-group label="Valeur" label-for="value-input">
                        <b-form-input id="value-input" size="sm" v-model="filter.value" @input="filterSearchChnaged" />
                    </b-form-group>
                </b-col>

                <!-- Actions (Add / Delete) -->
                <b-col sm="12" md="6" lg="4" class="mt-2 text-right">
                    <!-- Delete (if more than one row) -->
                    <b-button v-if="filters.length > 1" variant="outline-danger" size="sm"
                        @click="deleteRow(index)">
                        Supprimer
                    </b-button>

                    <!-- Add (only on the last row) -->
                    <b-button v-if="index === filters.length - 1" variant="outline-success" size="sm" class="ml-1 "
                        @click="filters.push({ parameter: '', value: '' })">
                        Ajouter
                    </b-button>
                </b-col>
            </b-row>
        </div>

    </div>

</template>

<script>

export default {
    props: {
        filterFields: {
            type: Array,
            required: false,
        },
        componentName: {
            type: String,
            required: true,
        },
        breadcrumbData: {
            type: Object,
            required: true,
        },
        onlyListComponent: {
            type: Boolean,
        },
    },
    data() {
        return {
            filters: [{ parameter: "", value: "" }],
            paramsOptions: ["Code", "Désignation"],
            inputSearch: "",
            showSearchBar: false,
            showFilterBar: false,
        }
    },
    methods: {
        newClicked() {
            if (this.onlyListComponent)
                this.$emit("newClicked");
            else
                this.$router.push({ name: this.componentName + "_WRITE" })
        },
        searchClicked() {
            this.showSearchBar = !this.showSearchBar;
            if (this.showSearchBar)
                setTimeout(() => {
                    this.$refs["icons-search"].focus();
                }, 100);
        },
        filterClicked() {
            this.showFilterBar = !this.showFilterBar;
        },
        updateSearchQuery(value) {
            this.$emit('updateSearchQuery', value)
        },
        deleteRow(index) {
            this.filters.splice(index, 1);
            this.$emit('filterSearchChnaged', this.filters);
        },
        filterSearchChnaged() {
            this.$emit('filterSearchChnaged', this.filters);
        },
    },
}
</script>

<style lang="scss" scoped>
@import '~@core/scss/base/bootstrap-extended/include';
@import '~@core/scss/base/components/variables-dark';
</style>