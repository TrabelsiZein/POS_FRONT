<template>
    <b-overlay :show="showLoading" spinner-variant="primary">
        <Card :componentName="$options.entity" />
    </b-overlay>
</template>

<script>

import Card from '@/views/components/card/Card.vue';

export default {
    name: 'VendorCard',
    entity: 'Vendor',
    components: {
        Card,
    },
    data() {
        return {
            showLoading: false,
        }
    },

}
</script>

<style lang="scss"></style>