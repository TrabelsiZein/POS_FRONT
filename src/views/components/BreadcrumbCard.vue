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

            <b-button variant="outline-primary" class="mr-50" @click="$emit('reset')">
                <feather-icon icon="RotateCcwIcon" />
            </b-button>

            <b-button variant="relief-success" @click="$emit('save')" v-if="$can('EDIT', componentName)">
                <feather-icon icon="SaveIcon" class="mr-50" />
                <span class="align-middle">Sauvegarder</span>
            </b-button>

        </b-col>

    </b-row>

</template>

<script>

export default {
    props: {
        breadcrumbData: {
            type: Object,
            required: true,
        },
        componentName: {
            type: String,
            required: true,
        },
    },
}
</script>