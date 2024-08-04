<template>

    <b-row class="content-header">

        <!-- Content Left -->
        <b-col class="content-header-left mb-2" sm="12" md="5" lg="6">
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
        <b-col class="content-header-right text-md-right mb-1" sm="12" md="7" lg="6">

            <b-button variant="outline-secondary" class="mr-50" @click="backClicked">
                <feather-icon icon="ArrowLeftIcon" />
                <!-- <span class="align-middle">Back</span> -->
            </b-button>

            <b-button variant="outline-primary" class="mr-50" @click="$emit('reset')">
                <feather-icon icon="RotateCcwIcon" />
                <!-- <span class="align-middle">Reset</span> -->
            </b-button>

            <b-button variant="relief-danger" class="mr-50" @click="deletClicked" v-if="breadcrumbData.showDeleteBtn">
                <feather-icon icon="Trash2Icon" />
                <!-- <span class="align-middle">Supprimer</span> -->
            </b-button>

            <b-button variant="relief-success" @click="$emit('save')">
                <feather-icon icon="SaveIcon" class="mr-50" />
                <span class="align-middle">Sauvegarder</span>
            </b-button>

        </b-col>

    </b-row>

</template>

<script>

export default {
    props: {
        componentName: {
            type: String,
            required: true,
        },
        componentAPI: {
            type: String,
            required: true,
        },
        breadcrumbData: {
            type: Object,
            required: true,
        },
    },
    methods: {
        backClicked() {
            this.$router.push({ name: this.componentName + "_READ" })
        },
        deletClicked() {
            this.$swal({
                title: 'Êtes vous sûr?',
                text: "Vous ne pourrez pas revenir en arrière !",
                icon: 'question',
                showCancelButton: true,
                confirmButtonText: 'Oui, supprimer !',
                customClass: {
                    confirmButton: 'btn btn-primary',
                    cancelButton: 'btn btn-outline-danger ml-1',
                },
                buttonsStyling: false,
            }).then(async result => {
                if (result.value) {
                    this.showLoading = true;
                    try {
                        await this.$http.delete(this.componentAPI + "/" + this.$route.params.id);
                        this.$swal({
                            title: 'Suppression effectuée avec succès',
                            icon: 'success',
                            customClass: {
                                confirmButton: 'btn btn-primary',
                            },
                            showClass: {
                                popup: 'animate__animated animate__flipInX',
                            },
                            buttonsStyling: false,
                        });
                        this.$router.push({ name: this.componentName + "_READ" });
                    } finally {
                        this.showLoading = false;
                    }
                }
            })
        }
    }
}
</script>