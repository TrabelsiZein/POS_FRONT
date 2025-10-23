<template>

    <b-overlay :show="showLoading" spinner-variant="primary">

        <List :componentName="$options.entity" :onlyListComponent="true" />

    </b-overlay>
</template>

<script>

import List from '@/views/components/list/List.vue';

export default {
    name: 'StockKeepingUnitList',
    entity: 'StockKeepingUnit',
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