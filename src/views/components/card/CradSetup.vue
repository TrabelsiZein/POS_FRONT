<template>
    <b-overlay :show="showLoading" spinner-variant="primary" id="card-container">
        <b-card>

            <BreadcrumbCard :breadcrumbData="breadcrumbData" :componentName="componentName" @reset="$emit('reset')"
                @save="$emit('save')" />

            <hr>

            <slot name="card-body"></slot>

        </b-card>
    </b-overlay>
</template>

<script>
import BreadcrumbCard from '../BreadcrumbCard.vue';

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
        showLoading: {
            type: Boolean,
            required: true
        }
    },
    components: {
        BreadcrumbCard
    },

}

</script>