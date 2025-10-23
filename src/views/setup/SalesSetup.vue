<template>
    <b-overlay :show="showLoading" spinner-variant="primary">
        <Card :componentName="$options.entity" :isSetup="true"/>
    </b-overlay>
</template>

<script>

import Card from '@/views/components/card/Card.vue';

export default {
    name: 'SalesSetupCard',
    entity: 'SalesSetup',
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