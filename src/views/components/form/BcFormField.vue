<template>
    <b-col :cols="12" :md="colSize" :lg="colSize" :xl="colSize">
        <b-form-group :label-cols-md="labelCols">
            <template #label>
                <div class="d-flex align-items-center">
                    <span class="text-truncate" :title="tooltip || label"
                        style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 160px;">
                        {{ label }}
                    </span>
                    <div class="flex-grow-1 ml-50" style="border-bottom: 1px dotted #999; height: 1px;"></div>
                </div>
            </template>

            <!-- default input rendering or slot fallback -->
            <template v-if="!$slots.default">
                <b-form-input v-if="type == 'String'" v-model="inputValue" size="sm" :title="inputValue" ref="input" />
                <b-form-input v-else-if="type == 'Number'" type="number" v-model="inputValue" size="sm"
                    :title="inputValue" ref="input" />
                <b-form-checkbox v-else-if="type === 'Boolean'" v-model="inputValue" switch
                    :title="inputValue ? 'Yes' : 'No'" ref="input" />
                <EntityLookup v-else-if="type === 'Lookup'" :title="label" :componentName="lookupComponentName"
                    :apiURI="lookupApiURI" :selectedItem="inputValue" @onItemSelected="onLookupItemSelected"
                    ref="input" />
                <b-form-select v-else-if="type === 'Dropdown'" size="sm" v-model="inputValue" :options="dropdownOptions"
                    :title="inputValue" ref="input" />
            </template>

            <slot />
        </b-form-group>
    </b-col>
</template>

<script>

import EntityLookup from '@/views/components/lookup/EntityLookup.vue';
import layoutState from '@/layouts/layoutListenerService.js';

export default {
    name: 'BcFormField',
    components: {
        EntityLookup,
    },
    props: {
        label: { type: String, required: true },
        labelCols: { type: Number, default: 4, required: false },
        tooltip: { type: String, default: null, required: false },
        value: [String, Number, Boolean],
        // types : ['String', 'Number', 'Boolean', 'Lookup', 'Dropdown']
        type: {
            type: String,
            default: 'String',
            required: false
        },
        lookupComponentName: {
            type: String,
            default: null,
            required: false
        },
        lookupApiURI: {
            type: String,
            default: null,
            required: false
        },
        dropdownOptions: {
            type: Array,
            default: () => [],
            required: false
        },
        isPopup: {
            type: Boolean,
            default: false
        },
        autoFocus: {
            type: Boolean,
            default: false
        },
    },
    emits: ['input'],
    computed: {
        inputValue: {
            get() {
                return this.value
            },
            set(val) {
                this.$emit('input', val)
            }
        },
        colSize() {
            return this.isPopup ? 12 : layoutState.colSize;
        },
    },
    methods: {
        onLookupItemSelected(data) {
            this.$emit('input', data.no);
        },
        focus() {
            this.$refs.input?.focus?.();
        }
    },
    mounted() {
        if (this.autoFocus) {
            this.$nextTick(() => {
                this.$refs.input?.focus?.();
            });
        }
    },
}
</script>
