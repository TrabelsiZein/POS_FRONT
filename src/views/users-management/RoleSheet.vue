<template>
    <b-overlay :show="showLoading" spinner-variant="primary">
        <b-card>

            <BreadcrumbSheet :componentName="componentName" :componentAPI="componentAPI"
                :breadcrumbData="breadcrumbData" @reset="reset" @save="save" />

            <hr>

            <b-row>

                <b-col sm="12" md="12" lg="5">
                    <b-form-group label="Nom">
                        <b-form-input v-model="role.name" />
                    </b-form-group>
                </b-col>

                <b-col sm="12" md="12" lg="7">
                    <b-form-group label="Description">
                        <b-form-input v-model="role.description" />
                    </b-form-group>
                </b-col>

            </b-row>

            <!-- PERMISSION TABLE -->
            <b-card no-body class="border mt-1">
                <b-card-header class="p-1">
                    <b-card-title class="font-medium-2">
                        <feather-icon icon="LockIcon" size="18" />
                        <span class="align-middle ml-50">Permissions</span>
                    </b-card-title>
                </b-card-header>
                <b-table striped responsive class="mb-0" :items="permissionsData">
                    <!-- Permission name -->
                    <template #cell(permission)="data">
                        {{ data.item.permission }}
                    </template>
                    <!-- Permission checkboxes -->
                    <template #cell(read)="data">
                        <b-form-checkbox v-model="data.item.read" />
                    </template>
                    <template #cell(write)="data">
                        <b-form-checkbox v-model="data.item.write" />
                    </template>
                    <template #cell(edit)="data">
                        <b-form-checkbox v-model="data.item.edit" />
                    </template>
                    <template #cell(delete)="data">
                        <b-form-checkbox v-model="data.item.delete" />
                    </template>
                </b-table>
            </b-card>

        </b-card>
    </b-overlay>
</template>

<script>

import BreadcrumbSheet from '@/views/components/BreadcrumbSheet.vue';
export default {
    components: {
        BreadcrumbSheet
    },
    data() {
        return {
            showLoading: false,
            componentName: "RolesManagement",
            componentAPI: "role",
            breadcrumbData: {
                title: "Fiche Role",
                route: [
                    {
                        text: 'Configuration',
                    },
                    {
                        text: 'Roles',
                    },
                    {
                        text: 'Fiche',
                        active: true,
                    },
                ],
                showDeleteBtn: this.$route.params.id
            },
            role: {
                name: "",
                description: "",
                permissions: []
            },
            permissionsData: [
            ],
            permissionsDB: []
        }
    },
    async created() {
        await this.fetchPermissions();
        if (this.$route.params.id) {
            await this.findRoleById();
        }
    },
    methods: {
        async fetchPermissions() {
            let reponse = await this.$http.get("role/permissions-enum");
            reponse.data.forEach(element => {
                this.permissionsData.push({ "permission": element, read: false, write: false, edit: false, delete: false });
            });
            let _response = await this.$http.get("role/permissions-db");
            this.permissionsDB = _response.data;
        },
        async findRoleById() {
            this.showLoading = true;
            try {
                let response = await this.$http.get("role/" + this.$route.params.id);
                this.role = response.data;
                response.data.permissions.forEach(element => {
                    let permission = this.permissionsData.find(el => el.permission === element.page);
                    switch (element.action) {
                        case "READ":
                            permission.read = true;
                            break;
                        case "WRITE":
                            permission.write = true;
                            break;
                        case "EDIT":
                            permission.edit = true;
                            break;
                        case "DELETE":
                            permission.delete = true;
                            break;
                    }
                });
            } finally {
                this.showLoading = false;
            }
        },
        async reset() {
            this.role.name = "";
            this.role.description = "";
            this.permissionsData.forEach(element => {
                element.read = false;
                element.write = false;
                element.edit = false;
                element.delete = false;
            });
            if (this.$route.params.id) {
                await this.findRoleById();
            }
        },
        async save() {
            this.showLoading = true;
            try {
                this.permissionsData.forEach(element => {
                    if (element.read) {
                        this.role.permissions.push(this.permissionsDB.find(el => el.page === element.permission && el.action === "READ"));
                    }
                    if (element.write) {
                        this.role.permissions.push(this.permissionsDB.find(el => el.page === element.permission && el.action === "WRITE"));
                    }
                    if (element.edit) {
                        this.role.permissions.push(this.permissionsDB.find(el => el.page === element.permission && el.action === "EDIT"));
                    }
                    if (element.delete) {
                        this.role.permissions.push(this.permissionsDB.find(el => el.page === element.permission && el.action === "DELETE"));
                    }
                });
                await this.$http.post(this.componentAPI, this.role);
                this.$router.push({ name: this.componentName + "_READ" })
            } finally {
                this.showLoading = false;
            }
        }
    }
}
</script>