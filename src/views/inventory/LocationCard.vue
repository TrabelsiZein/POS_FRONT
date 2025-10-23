<template>
    <b-overlay :show="showLoading" spinner-variant="primary">
        <b-card>

            <BreadcrumbSheet :componentName="componentName" :componentAPI="componentAPI"
                :breadcrumbData="breadcrumbData" @reset="reset" @save="save" />

            <hr>

            <b-row>

                <b-col sm="12" md="6" lg="3">
                    <b-form-group label="N°">
                        <b-form-input size="sm" v-model="location.no" />
                    </b-form-group>
                </b-col>

                <b-col sm="12" md="6" lg="3">
                    <b-form-group label="Nom">
                        <b-form-input size="sm" v-model="location.name" />
                    </b-form-group>
                </b-col>

                <b-col sm="12" md="6" lg="6">
                    <b-form-group label="Adresse">
                        <b-form-input size="sm" v-model="location.address" />
                    </b-form-group>
                </b-col>

                <b-col sm="12" md="6" lg="3">
                    <b-form-group label="Ville">
                        <b-form-input size="sm" v-model="location.city" />
                    </b-form-group>
                </b-col>

                <b-col sm="12" md="6" lg="3">
                    <b-form-group label="N° Téléphone">
                        <b-form-input size="sm" v-model="location.phoneNo" />
                    </b-form-group>
                </b-col>

                <b-col sm="12" md="6" lg="3">
                    <b-form-group label="Contact">
                        <b-form-input size="sm" v-model="location.contact" />
                    </b-form-group>
                </b-col>

                <b-col sm="12" md="6" lg="3">
                    <b-form-group label="Code postal">
                        <b-form-input size="sm" v-model="location.postalCode" />
                    </b-form-group>
                </b-col>

                <b-col sm="12" md="6" lg="3">
                    <b-form-group label="Adresse e-mail">
                        <b-form-input size="sm" v-model="location.email" />
                    </b-form-group>
                </b-col>

                <b-col sm="12" md="6" lg="3">
                    <b-form-group label="Magasin de transit">
                        <b-form-checkbox v-model="location.useAsInTransit" class="mr-0 mt-50" switch inline />
                    </b-form-group>
                </b-col>

            </b-row>

        </b-card>
    </b-overlay>
</template>

<script>

import BreadcrumbSheet from '@/views/components/breadCrumb/BreadcrumbCard.vue';

export default {
    components: {
        BreadcrumbSheet,
    },
    data() {
        return {
            showLoading: false,
            componentName: "Location",
            componentAPI: "location",
            breadcrumbData: {
                title: "Fiche Magasin",
                route: [
                    {
                        text: 'Configuration',
                    },
                    {
                        text: 'Magasins',
                    },
                    {
                        text: 'Fiche',
                        active: true,
                    },
                ],
                showDeleteBtn: this.$route.params.id
            },
            location: {},
        }
    },
    async created() {
        if (this.$route.params.id) {
            await this.findById();
        }
    },
    methods: {
        async findById() {
            this.showLoading = true;
            try {
                let response = await this.$http.get(this.componentAPI + "/" + this.$route.params.id);
                this.location = response.data;
            } finally {
                this.showLoading = false;
            }
        },
        async reset() {
            this.location = {};
            if (this.$route.params.id) {
                this.findById();
            }
        },
        async save() {
            this.showLoading = true;
            try {
                await this.$http.post(this.componentAPI, this.location);
                this.$router.push({ name: this.componentName + "_READ" })
            } finally {
                this.showLoading = false;
            }
        }
    }
}
</script>