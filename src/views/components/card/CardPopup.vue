<template>
    <b-modal hide-footer v-model="showPopup" ref="modal" :title="entityDefinition.titleForm" scrollable size="xl"
        no-close-on-esc no-close-on-backdrop>

        <b-overlay :show="showLoading" spinner-variant="primary">
            <Form :isPopup="true" :entityDefinition="entityDefinition" :entity.sync="entity" v-model="entity"
                :componentName="componentName" ref="form" />
            <hr>

            <b-row class="text-right">


                <b-col cols="12" md="12">
                    <b-button variant="outline-primary" class="mr-50" @click="reset">
                        <feather-icon icon="RotateCcwIcon" />
                        Reset
                    </b-button>
                    <b-button variant="relief-success" @click="save">
                        <feather-icon icon="SaveIcon" />
                        Sauvegarder
                    </b-button>
                </b-col>


            </b-row>

        </b-overlay>

    </b-modal>
</template>

<script>

import Form from '../form/Form.vue';
import { getColumnDefinitionForCard } from '@/entities/entitiesConfigService';

export default {
    name: 'CardPopup',
    props: {
        enableAutoSave: {
            type: Boolean,
            required: false,
            default: true,
        },
        componentName: {
            type: String,
            required: true,
        },
        entityData: {
            type: Object,
            required: false,
        },
        editMode: {
            type: Boolean,
            required: false,
        },
    },
    components: {
        Form
    },
    data() {
        return {
            localEditMode: this.editMode || false,
            showPopup: false,
            showLoading: false,
            entity: {},
            selectedEntity: {},
            entityDefinition: getColumnDefinitionForCard(this.componentName),
        }
    },
    watch: {
        showPopup(newValue) {
            if (newValue) {
                setTimeout(() => {
                    const inputComponent = this.$refs.form.$refs.ref_0[0];
                    inputComponent.focus();
                }, 200);
            }
        },
        entityData: {
            handler(newValue) {
                this.entity = newValue;
                this.selectedEntity = newValue;
            },
            immediate: true,
        },
        editMode(newValue) {
            this.localEditMode = newValue;
        }
    },
    methods: {
        async reset() {
            this.entity = this.localEditMode ? this.selectedEntity : {};
        },
        async save() {
            if (this.enableAutoSave) {
                this.showLoading = true;
                try {
                    await this.$http.post(this.entityDefinition.apiURI, this.entity);
                    this.$refs.modal.hide();
                } finally {
                    this.showLoading = false;
                    this.$emit('entitySaved', this.entity);
                }
            } else {
                this.$refs.modal.hide();
                this.$emit('saveClicked', this.entity);
            }
        }
    },
}
</script>

<style lang="scss"></style>