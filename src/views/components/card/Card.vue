<template>
    <b-overlay :show="showLoading" spinner-variant="primary">
        <b-card>

            <BreadcrumbSheet :componentName="componentName" :componentAPI="entityDefinition.apiURI"
                :breadcrumbData="localBreadcrumbData" @reset="reset" @save="save" />

            <hr>

            <Form :entityDefinition="entityDefinition" :entity.sync="entity" v-model="entity" />

        </b-card>
    </b-overlay>
</template>

<script>

import BreadcrumbSheet from '@/views/components/BreadcrumbSheet.vue';
import { getColumnDefinitionForCard } from '@/entities/entitiesConfigService';
import { getBreadcrumbCard } from '@/entities/entitiesConfigService';
import Form from '../form/Form.vue';

export default {
    props: {
        componentName: {
            type: String,
            required: true,
        },
        breadcrumbData: {
            type: Object,
            required: false,
        },
    },
    components: {
        BreadcrumbSheet,
        Form
    },
    data() {
        return {
            showLoading: false,
            entity: {},
            entityDefinition: getColumnDefinitionForCard(this.componentName),
            localBreadcrumbData: this.breadcrumbData || {
                title: "",
                route: [],
                withFilter: false,
            },
        }
    },
    async mounted() {
        // If breadcrumbData is not provided, use default from columnDefinitions.js
        if (!this.breadcrumbData)
            this.localBreadcrumbData = getBreadcrumbCard(this.componentName);
    },
    async created() {
        console.log("Entity Definition:", this.entityDefinition);
        if (this.$route.params.id) {
            await this.findById();
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
        async reset() {
            this.entity = {};
            if (this.$route.params.id) {
                this.findById();
            }
        },
        async save() {
            this.showLoading = true;
            try {
                await this.$http.post(this.entityDefinition.apiURI, this.entity);
                this.$router.push({ name: this.componentName + "_READ" })
            } finally {
                this.showLoading = false;
            }
        }
    },
}
</script>

<style lang="scss"></style>