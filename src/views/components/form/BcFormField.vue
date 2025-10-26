<template>
    <b-col :cols="12" :md="colSize" :lg="colSize" :xl="colSize">
        <b-form-group :label-cols-md="labelCols">
            <template #label>
                <div class="d-flex align-items-center">
                    <span class="text-truncate" :title="tooltip || label"
                        style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 160px;">
                        {{ label }}<span v-if="mandatory" class="text-danger ml-1">*</span>
                    </span>
                    <div class="flex-grow-1 ml-50" style="border-bottom: 1px dotted #999; height: 1px;"></div>
                </div>
            </template>

            <!-- default input rendering or slot fallback -->
            <template v-if="!$slots.default">
                <b-form-input v-if="type == 'String'" v-model="inputValue" size="sm" :title="inputValue" ref="input" :disabled="isFieldDisabled" />
                <b-form-input v-else-if="type == 'Number'" type="number" v-model="inputValue" size="sm"
                    :title="inputValue" ref="input" :disabled="isFieldDisabled" />
                <b-form-checkbox v-else-if="type === 'Boolean'" v-model="inputValue" switch
                    :title="inputValue ? 'Yes' : 'No'" ref="input" :disabled="isFieldDisabled" /> 
                <b-form-datepicker v-else-if="type === 'Date'" v-model="inputValue" size="sm"
                    :title="inputValue ? 'Yes' : 'No'" ref="input" :disabled="isFieldDisabled" />
                <EntityLookup v-else-if="type === 'Lookup'" :title="label" :componentName="lookupComponentName"
                    :apiURI="lookupApiURI" :selectedItem="inputValue" @onItemSelected="onLookupItemSelected"
                    ref="input" :disabled="isFieldDisabled" />
                <b-form-select v-else-if="type === 'Dropdown'" size="sm" v-model="inputValue" :options="dropdownItems"
                    :title="inputValue" ref="input" :disabled="isFieldDisabled || dropdownLoading" />
            </template>

            <slot />
        </b-form-group>
    </b-col>
</template>

<script>

import layoutState from '@/layouts/layoutListenerService.js';

export default {
    name: 'BcFormField',
    components: {
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
        isPopup: {
            type: Boolean,
            default: false
        },
        autoFocus: {
            type: Boolean,
            default: false
        },
        field: { type: String, required: false },
        componentName: { type: String, required: false },
        apiURI: { type: String, required: false },
        mandatory: { type: Boolean, default: false, required: false },
        disabled: { type: Boolean, default: false, required: false },
        isEditMode: { type: Boolean, default: false, required: false },
        seriesHeaderData: { type: Object, default: null, required: false },
    },
    data() {
        return {
            dropdownItems: [],
            dropdownLoading: false,
        }
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
        isFieldDisabled() {
            // If field is "no" and we're in edit mode, disable it regardless of configuration
            if (this.field === 'no' && this.isEditMode) {
                return true;
            }
            // If field is "no" and manualNo is false, also disable it in creation mode
            if (this.field === 'no' && this.seriesHeaderData && !this.seriesHeaderData.manualNo) {
                return true;
            }
            // Otherwise, use the configured disabled state
            return this.disabled;
        },
    },
    methods: {
        async loadDropdown() {
            
            // guard
            if (this.type !== 'Dropdown' || !this.field || !this.componentName) {
                this.dropdownItems = []
                return
            }

            this.dropdownLoading = true
            try {
                // Ensure plain strings, not reactive objects
                const entity = String(this.componentName)
                const field = String(this.field)

                // Adjust the URL to your controller path
                const { data } = await this.$http.get(this.apiURI + '/getEnumValuesByField', {
                    params: { entity, field }
                })

                // The API returns ["Imputable","Title",...]
                // Map to BootstrapVue options: { value, text }
                this.dropdownItems = Array.isArray(data)
                    ? data.map(v => ({ value: v, text: v }))
                    : []
            } catch (e) {
                // eslint-disable-next-line no-console
                console.error('Dropdown load failed', e)
                this.dropdownItems = []
            } finally {
                this.dropdownLoading = false
            }
        },
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
        if (this.type === 'Dropdown') this.loadDropdown()
    },
}
</script>
