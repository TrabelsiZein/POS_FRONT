<template>
  <div class="general-setup-container">
    <div class="page-header">
      <h2 class="mb-0">{{ $t('admin.generalSetupManagement.title') }}</h2>
      <b-button variant="outline-primary" @click="loadGeneralSetup">
        <feather-icon icon="RefreshCwIcon" size="16" />
        {{ $t('admin.generalSetupManagement.refresh') }}
      </b-button>
    </div>

    <b-card class="mb-3">
      <b-row>
        <b-col cols="12" md="6">
          <b-form-group :label="$t('admin.generalSetupManagement.search')" label-for="search-input">
            <b-input-group>
              <b-form-input id="search-input" v-model="searchTerm"
                :placeholder="$t('admin.generalSetupManagement.searchPlaceholder')" />
              <b-input-group-append>
                <b-button variant="outline-secondary" @click="clearSearch" :disabled="!searchTerm">
                  <feather-icon icon="XIcon" size="14" />
                </b-button>
              </b-input-group-append>
            </b-input-group>
          </b-form-group>
        </b-col>
        <b-col cols="12" md="6" class="d-flex align-items-end justify-content-md-end">
          <small class="text-muted">
            {{ $t('admin.generalSetupManagement.showing') }} {{ totalRows }} {{ totalRows === 1 ? $t('admin.generalSetupManagement.setting') : $t('admin.generalSetupManagement.settings') }}
          </small>
        </b-col>
      </b-row>
    </b-card>

    <b-card>
      <b-table :items="paginatedSettings" :fields="setupFields" striped hover responsive :busy="loading" show-empty>
        <template #table-busy>
          <div class="text-center text-danger my-2">
            <b-spinner class="align-middle" />
            <strong>{{ $t('admin.generalSetupManagement.loading') }}</strong>
          </div>
        </template>

        <template #empty>
          <div class="text-center py-4">
            <feather-icon icon="SettingsIcon" size="48" class="text-muted mb-2" />
            <p class="text-muted mb-0">{{ $t('admin.generalSetupManagement.noSettingsFound') }}</p>
          </div>
        </template>

        <template #cell(code)="row">
          <strong>{{ row.item.code }}</strong>
        </template>

        <template #cell(valeur)="row">
          <code class="text-primary">{{ row.item.valeur }}</code>
        </template>

        <template #cell(description)="row">
          <span class="small" v-if="row.item.description">{{ row.item.description }}</span>
          <span class="text-muted small" v-else>-</span>
        </template>

        <template #cell(readOnly)="row">
          <b-badge :variant="row.item.readOnly ? 'info' : 'secondary'">
            {{ row.item.readOnly ? $t('admin.generalSetupManagement.readOnly') : $t('admin.generalSetupManagement.editable') }}
          </b-badge>
        </template>

        <template #cell(actions)="row">
          <div class="text-right">
            <b-button variant="outline-primary" size="sm" @click="openEditModal(row.item)"
              :disabled="row.item.readOnly">
              <feather-icon icon="EditIcon" size="14" />
            </b-button>
          </div>
        </template>
      </b-table>

      <div class="mt-3">
        <b-row align-v="center">
          <b-col cols="12" md="6" class="mb-2 mb-md-0">
            <div class="d-flex align-items-center">
              <label for="per-page-select" class="mr-2 mb-0">{{ $t('admin.generalSetupManagement.itemsPerPage') }}</label>
              <b-form-select id="per-page-select" v-model="perPage" :options="perPageOptions" size="sm"
                style="width: auto;" />
            </div>
          </b-col>
          <b-col cols="12" md="6">
            <div class="text-center text-md-right">
              <small class="text-muted">
                {{ $t('admin.generalSetupManagement.showing') }} {{ startIndex }} {{ $t('admin.generalSetupManagement.to') }} {{ endIndex }} {{ $t('admin.generalSetupManagement.of') }} {{ totalRows }} {{ totalRows === 1 ? $t('admin.generalSetupManagement.setting') : $t('admin.generalSetupManagement.settings') }}
              </small>
            </div>
          </b-col>
        </b-row>
        <div class="d-flex justify-content-center mt-2">
          <b-pagination v-model="currentPage" :total-rows="totalRows" :per-page="perPage" align="center" />
        </div>
      </div>
    </b-card>

    <b-modal v-model="showEditModal" :title="$t('admin.generalSetupManagement.editSetting')" @ok="saveSetting" :ok-disabled="!canSaveSetting"
      @hidden="resetEditForm">
      <div v-if="settingToEdit">
        <b-form-group :label="$t('admin.generalSetupManagement.code')">
          <b-form-input :value="settingToEdit.code" disabled />
        </b-form-group>

        <b-form-group :label="$t('admin.generalSetupManagement.value')" label-for="setting-value">
          <b-form-input id="setting-value" v-model="editForm.valeur" required />
        </b-form-group>

        <b-form-group :label="$t('admin.generalSetupManagement.description')" label-for="setting-description">
          <b-form-textarea id="setting-description" v-model="editForm.description" rows="3"
            :placeholder="$t('admin.generalSetupManagement.optionalDescription')" disabled />
        </b-form-group>
      </div>
      <div v-else>
        <p class="text-muted mb-0">{{ $t('admin.generalSetupManagement.selectToEdit') }}</p>
      </div>
    </b-modal>
  </div>
</template>

<script>
import ToastificationContent from '@core/components/toastification/ToastificationContent.vue'

export default {
  name: 'GeneralSetupManagement',
  data() {
    return {
      settings: [],
      loading: false,
      searchTerm: '',
      currentPage: 1,
      perPage: 10,
      perPageOptions: [
        { value: 10, text: '10' },
        { value: 20, text: '20' },
        { value: 50, text: '50' },
        { value: 100, text: '100' }
      ],
      showEditModal: false,
      settingToEdit: null,
      editForm: {
        valeur: '',
        description: ''
      }
    }
  },
  computed: {
    setupFields() {
      return [
        { key: 'code', label: this.$t('admin.generalSetupManagement.code'), sortable: true },
        { key: 'valeur', label: this.$t('admin.generalSetupManagement.value'), sortable: true },
        { key: 'description', label: this.$t('admin.generalSetupManagement.description'), sortable: false },
        { key: 'readOnly', label: this.$t('admin.generalSetupManagement.readOnly'), sortable: true },
        { key: 'actions', label: this.$t('common.actions'), sortable: false, thClass: 'text-right', tdClass: 'text-right' }
      ]
    },
    filteredSettings() {
      if (!this.searchTerm) {
        return this.settings
      }

      const term = this.searchTerm.toLowerCase()
      return this.settings.filter(setting => {
        return (
          (setting.code && setting.code.toLowerCase().includes(term)) ||
          (setting.valeur && setting.valeur.toLowerCase().includes(term)) ||
          (setting.description && setting.description.toLowerCase().includes(term))
        )
      })
    },
    totalRows() {
      return this.filteredSettings.length
    },
    paginatedSettings() {
      const start = (this.currentPage - 1) * this.perPage
      return this.filteredSettings.slice(start, start + this.perPage)
    },
    startIndex() {
      return this.totalRows === 0 ? 0 : (this.currentPage - 1) * this.perPage + 1
    },
    endIndex() {
      return Math.min(this.currentPage * this.perPage, this.totalRows)
    },
    canSaveSetting() {
      return !!this.settingToEdit && this.editForm.valeur !== null && this.editForm.valeur !== undefined
    }
  },
  watch: {
    searchTerm() {
      this.currentPage = 1
    },
    perPage() {
      this.currentPage = 1
    },
    filteredSettings(newList) {
      const maxPage = Math.max(1, Math.ceil(newList.length / this.perPage))
      if (this.currentPage > maxPage) {
        this.currentPage = maxPage
      }
    }
  },
  mounted() {
    this.loadGeneralSetup()
  },
  methods: {
    async loadGeneralSetup() {
      this.loading = true
      try {
        const response = await this.$http.get('/general-setup')
        this.settings = Array.isArray(response.data) ? response.data : []
      } catch (error) {
        console.error('Error loading general setup:', error)
        this.$toast({
          component: ToastificationContent,
          props: {
            title: this.$t('common.error'),
            icon: 'AlertCircleIcon',
            text: this.$t('admin.generalSetupManagement.failedToLoad'),
            variant: 'danger'
          }
        })
      } finally {
        this.loading = false
      }
    },
    clearSearch() {
      this.searchTerm = ''
    },
    openEditModal(setting) {
      if (!setting || setting.readOnly) {
        this.$toast({
          component: ToastificationContent,
          props: {
            title: this.$t('admin.generalSetupManagement.readOnly'),
            icon: 'AlertCircleIcon',
            text: this.$t('admin.generalSetupManagement.readOnlyWarning'),
            variant: 'warning'
          }
        })
        return
      }

      this.settingToEdit = setting
      this.editForm = {
        valeur: setting.valeur,
        description: setting.description || ''
      }
      this.showEditModal = true
    },
    async saveSetting() {
      if (!this.settingToEdit) {
        return
      }

      try {
        const payload = {
          ...this.settingToEdit,
          valeur: this.editForm.valeur,
          description: this.editForm.description
        }

        const response = await this.$http.put(`/general-setup/${this.settingToEdit.id}`, payload)

        if (response.status === 200) {
          this.$toast({
            component: ToastificationContent,
            props: {
              title: this.$t('common.success'),
              icon: 'CheckCircleIcon',
              text: this.$t('admin.generalSetupManagement.updatedSuccessfully'),
              variant: 'success'
            }
          })
          this.showEditModal = false
          this.resetEditForm()
          await this.loadGeneralSetup()
        }
      } catch (error) {
        console.error('Error updating setting:', error)
        let errorMessage = this.$t('admin.generalSetupManagement.failedToUpdate')
        if (error.response && error.response.data) {
          errorMessage = error.response.data || errorMessage
        }
        this.$toast({
          component: ToastificationContent,
          props: {
            title: this.$t('common.error'),
            icon: 'XIcon',
            text: errorMessage,
            variant: 'danger'
          }
        })
      }
    },
    resetEditForm() {
      this.settingToEdit = null
      this.editForm = {
        valeur: '',
        description: ''
      }
    }
  }
}
</script>

<style scoped>
.general-setup-container {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-header h2 {
  margin: 0;
}

@media (max-width: 575.98px) {
  .page-header {
    flex-direction: column;
    align-items: stretch;
    gap: 15px;
  }

  .page-header .btn {
    width: 100%;
  }
}
</style>
