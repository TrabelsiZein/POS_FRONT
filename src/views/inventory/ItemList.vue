<template>

    <b-overlay :show="showLoading" spinner-variant="primary">

        <List :componentName="$options.entity" />

    </b-overlay>
</template>

<script>

import List from '@/views/components/list/List.vue';

export default {
    name: 'ItemList',
    entity: 'Item',
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