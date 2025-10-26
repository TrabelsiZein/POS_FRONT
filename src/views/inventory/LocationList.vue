<template>

    <b-overlay :show="showLoading" spinner-variant="primary">

        <List :componentName="$options.entity" />

    </b-overlay>
</template>

<script>

import List from '@/views/components/list/List.vue';

export default {
    name: 'Locationist',
    entity: 'Location',
    components: {
        List
    },
    data() {
        return {
            showLoading: false,
        }
    },
}
</script>