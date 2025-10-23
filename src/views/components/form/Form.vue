<template>
    <div>

        <!-- Case: Entity has tabs -->
        <template v-if="entityDefinition.tabs && entityDefinition.tabs.length">
            <app-collapse accordion type="border" v-for="tab in entityDefinition.tabs" :key="tab.id" class="mb-50">
                <app-collapse-item :title="tab.title.fr" :isVisible="tab.open">
                    <b-row>
                        <BcFormField :isPopup="isPopup" v-for="(field, index) in tab.fields || []" :key="field.field"
                            :label="field.label.fr" :type="field.type"
                            :tooltip="field.tooltip ? field.tooltip.fr ? field.tooltip.fr : field.label.fr : field.label.fr"
                            :lookupComponentName="field.lookupEntity" :lookupApiURI="field.lookupApiURI"
                            :value="entity[field.field]" @input="onFieldInput(field.field, $event)"
                            :autoFocus="index === 0" :ref="'ref_' + index" :componentName="componentName" :field="field.field" :apiURI="entityDefinition.apiURI"
                            :mandatory="field.mandatory || false" :disabled="field.disabled || false"/>
                    </b-row>
                </app-collapse-item>
            </app-collapse>
        </template>

        <template v-else>
            <b-row>
                <BcFormField :isPopup="isPopup" v-for="(field, index) in entityDefinition.fields || []"
                    :key="field.field" :label="field.label.fr" :type="field.type"
                    :tooltip="field.tooltip ? field.tooltip.fr ? field.tooltip.fr : field.label.fr : field.label.fr"
                    :lookupComponentName="field.lookupEntity" :lookupApiURI="field.lookupApiURI"
                    :value="entity[field.field]" @input="onFieldInput(field.field, $event)" :autoFocus="index === 0"
                    :ref="'ref_' + index" :componentName="componentName" :field="field.field" :apiURI="entityDefinition.apiURI"
                    :mandatory="field.mandatory || false" :disabled="field.disabled || false"/>
            </b-row>
        </template>

    </div>
</template>

<script>

import BcFormField from '../form/BcFormField.vue';
import AppCollapse from '@core/components/app-collapse/AppCollapse.vue'
import AppCollapseItem from '@core/components/app-collapse/AppCollapseItem.vue'

export default {
    props: {
        entityDefinition: {
            type: Object,
            required: true,
        },
        entity: {
            type: Object,
            required: true,
        },
        isPopup: {
            type: Boolean,
            default: false
        },
        componentName: {
            type: String,
            required: false,
        },
    },
    emits: ['update:entity'],
    components: {
        BcFormField,
        AppCollapse,
        AppCollapseItem,
    },
    methods: {
        /**
         * Called whenever any BcFormField emits @input.
         * We build a new entity object merging in the one changed field,
         * then emit it up to the parent.
         */
        onFieldInput(fieldName, newValue) {
            this.$emit('update:entity', {
                ...this.entity,
                [fieldName]: newValue,
            })
        },
    },
}
</script>