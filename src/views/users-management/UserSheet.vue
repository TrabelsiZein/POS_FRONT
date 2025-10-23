<template>
    <b-overlay :show="showLoading" spinner-variant="primary">
        <b-card>

            <BreadcrumbSheet :componentName="componentName" :componentAPI="componentAPI"
                :breadcrumbData="breadcrumbData" @reset="reset" @save="save" />

            <hr>

            <b-row>

                <b-col sm="12" md="6" lg="3">
                    <b-form-group label="Username">
                        <b-form-input v-model="user.username" />
                    </b-form-group>
                </b-col>

                <b-col sm="12" md="6" lg="3">
                    <b-form-group label="Mot de passe">
                        <b-form-input v-model="user.password" :disabled="$route.params.id != undefined" />
                    </b-form-group>
                </b-col>

                <b-col sm="12" md="6" lg="3">
                    <b-form-group label="Email">
                        <b-form-input v-model="user.email" />
                    </b-form-group>
                </b-col>

                <b-col sm="12" md="6" lg="3">
                    <b-form-group label="Active">
                        <b-form-checkbox v-model="user.active" class="mr-0 mt-50" switch inline />
                    </b-form-group>
                </b-col>

            </b-row>

            <!-- PERMISSION TABLE -->
            <b-card no-body class="border mt-1">
                <b-card-header class="p-1">
                    <b-card-title class="font-medium-2">
                        <feather-icon icon="LockIcon" size="18" />
                        <span class="align-middle ml-50">Roles</span>
                    </b-card-title>
                </b-card-header>
                <b-table striped responsive class="mb-0" :items="rolesData" :fields="fields">
                    <template #cell(selected)="data">
                        <b-form-checkbox v-model="data.item.selected" />
                    </template>
                </b-table>
            </b-card>

        </b-card>
    </b-overlay>
</template>

<script>

import BreadcrumbSheet from '@/views/components/breadCrumb/BreadcrumbCard.vue';
export default {
    components: {
        BreadcrumbSheet
    },
    data() {
        return {
            showLoading: false,
            componentName: "UsersManagement",
            componentAPI: "user",
            breadcrumbData: {
                title: "Fiche Utilisateur",
                route: [
                    {
                        text: 'Configuration',
                    },
                    {
                        text: 'Utilisateurs',
                    },
                    {
                        text: 'Fiche',
                        active: true,
                    },
                ],
                showDeleteBtn: this.$route.params.id
            },
            user: {
                username: "",
                email: "",
                password: "",
                active: true,
                roles: []
            },
            rolesData: [],
            fields: ['name', 'selected'],
        }
    },
    async created() {
        await this.fetchRoles();
        if (this.$route.params.id) {
            await this.findUserById();
        }
    },
    methods: {
        async fetchRoles() {
            let response = await this.$http.get("role");
            this.rolesData = response.data;
        },
        async findUserById() {
            this.showLoading = true;
            try {
                let response = await this.$http.get("user/" + this.$route.params.id);
                this.user = response.data;
                this.user.roles.forEach(element => {
                    let role = this.rolesData.find(el => el.id === element.id);
                    role["selected"] = true;
                });
            } finally {
                this.showLoading = false;
            }
            this.rolesData = [...this.rolesData];
        },
        async reset() {
            this.user.username = "";
            this.user.password = "";
            this.user.email = "";
            this.user.active = true;
            this.rolesData.forEach(element => {
                element.selected = false;
            });
            if (this.$route.params.id) {
                await this.findUserById();
            }
        },
        async save() {
            this.showLoading = true;
            try {
                this.user.roles = [];
                this.rolesData.forEach(element => {
                    if (element.selected) {
                        this.user.roles.push(element);
                    }
                });
                await this.$http.post(this.componentAPI, this.user);
                this.$router.push({ name: this.componentName + "_READ" })
            } finally {
                this.showLoading = false;
            }
        }
    }
}
</script>