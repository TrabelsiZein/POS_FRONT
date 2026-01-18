<template>
  <div class="general-setup-container">
    <!-- Enhanced Header -->
    <div class="page-header">
      <div class="header-content">
        <div class="header-title-section">
          <feather-icon icon="SettingsIcon" size="28" class="header-icon text-primary mr-2" />
          <div>
            <h2 class="mb-0">{{ $t('admin.generalSetupManagement.title') }}</h2>
            <p class="text-muted mb-0 small">{{ $t('admin.generalSetupManagement.subtitle') }}</p>
          </div>
        </div>
        <b-button variant="primary" @click="loadGeneralSetup" :disabled="loading">
          <feather-icon icon="RefreshCwIcon" size="16" class="mr-1" :class="{ 'spin': loading }" />
          {{ $t('admin.generalSetupManagement.refresh') }}
        </b-button>
      </div>
    </div>

    <!-- Search and Stats Card -->
    <b-card class="mb-3 search-card">
      <b-row align-v="center">
        <b-col cols="12" md="8">
          <b-form-group :label="$t('admin.generalSetupManagement.search')" label-for="search-input" class="mb-0">
            <b-input-group>
              <b-input-group-prepend>
                <span class="input-group-text">
                  <feather-icon icon="SearchIcon" size="16" />
                </span>
              </b-input-group-prepend>
              <b-form-input id="search-input" v-model="searchTerm"
                :placeholder="$t('admin.generalSetupManagement.searchPlaceholder')" />
              <b-input-group-append v-if="searchTerm">
                <b-button variant="outline-secondary" @click="clearSearch">
                  <feather-icon icon="XIcon" size="14" />
                </b-button>
              </b-input-group-append>
            </b-input-group>
          </b-form-group>
        </b-col>
        <b-col cols="12" md="4" class="text-md-right mt-2 mt-md-0">
          <div class="stats-badge">
            <feather-icon icon="InfoIcon" size="14" class="mr-1" />
            <strong>{{ totalRows }}</strong>
            <span class="ml-1">{{ totalRows === 1 ? $t('admin.generalSetupManagement.setting') : $t('admin.generalSetupManagement.settings') }}</span>
          </div>
        </b-col>
      </b-row>
    </b-card>

    <!-- Settings Table Card -->
    <b-card class="settings-card">
      <b-table :items="paginatedSettings" :fields="setupFields" striped hover responsive :busy="loading" show-empty
        class="settings-table">
        <template #table-busy>
          <div class="text-center my-4">
            <b-spinner class="align-middle" />
            <p class="mt-2 mb-0">{{ $t('admin.generalSetupManagement.loading') }}</p>
          </div>
        </template>

        <template #empty>
          <div class="text-center py-5">
            <feather-icon icon="SettingsIcon" size="64" class="text-muted mb-3" />
            <p class="text-muted mb-0">{{ $t('admin.generalSetupManagement.noSettingsFound') }}</p>
          </div>
        </template>

        <template #cell(code)="row">
          <div class="code-cell">
            <feather-icon icon="KeyIcon" size="14" class="mr-1 text-primary" />
            <code class="code-text">{{ row.item.code }}</code>
          </div>
        </template>

        <template #cell(valeur)="row">
          <div class="value-cell">
            <code class="value-text">{{ row.item.valeur || '-' }}</code>
          </div>
        </template>

        <template #cell(description)="row">
          <div class="description-cell">
            <span class="description-text" v-if="row.item.description" :title="row.item.description">
              {{ row.item.description }}
            </span>
            <span class="text-muted" v-else>-</span>
          </div>
        </template>

        <template #cell(readOnly)="row">
          <b-badge :variant="row.item.readOnly ? 'info' : 'success'" class="status-badge">
            <feather-icon :icon="row.item.readOnly ? 'LockIcon' : 'UnlockIcon'" size="12" class="mr-1" />
            {{ row.item.readOnly ? $t('admin.generalSetupManagement.readOnly') : $t('admin.generalSetupManagement.editable') }}
          </b-badge>
        </template>

        <template #cell(actions)="row">
          <div class="text-right">
            <b-button variant="primary" size="sm" @click="openEditModal(row.item)"
              :disabled="row.item.readOnly" class="action-btn">
              <feather-icon icon="EditIcon" size="14" class="mr-1" />
              {{ $t('common.edit') }}
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
      @hidden="resetEditForm" size="lg" centered>
      <div v-if="settingToEdit">
        <!-- Code Section -->
        <b-form-group :label="$t('admin.generalSetupManagement.code')">
          <b-form-input :value="settingToEdit.code" disabled class="disabled-input" />
        </b-form-group>

        <!-- Value Section -->
        <b-form-group :label="$t('admin.generalSetupManagement.value')" label-for="setting-value">
          <b-form-input id="setting-value" v-model="editForm.valeur" required class="value-input"
            :placeholder="$t('admin.generalSetupManagement.valuePlaceholder')" />
          <small class="form-text text-muted">{{ $t('admin.generalSetupManagement.valueHelp') }}</small>
        </b-form-group>

        <!-- Description Section -->
        <b-form-group :label="$t('admin.generalSetupManagement.description')" label-for="setting-description">
          <b-form-textarea id="setting-description" v-model="editForm.description" rows="3"
            :placeholder="$t('admin.generalSetupManagement.optionalDescription')" disabled class="disabled-input" />
        </b-form-group>

        <!-- Divider -->
        <hr class="my-3" />

        <!-- Audit Information Section -->
        <div class="audit-info-section">
          <h6 class="audit-info-title">
            <feather-icon icon="InfoIcon" size="16" class="mr-1" />
            {{ $t('admin.generalSetupManagement.auditInformation') }}
          </h6>
          <b-row>
            <b-col cols="12" md="6">
              <div class="audit-info-item">
                <label class="audit-label">{{ $t('admin.generalSetupManagement.lastUpdatedBy') }}</label>
                <div class="audit-value">
                  <feather-icon icon="UserIcon" size="14" class="mr-1 text-primary" />
                  <strong>{{ settingToEdit.updatedBy || settingToEdit.createdBy || 'System' }}</strong>
                </div>
              </div>
            </b-col>
            <b-col cols="12" md="6">
              <div class="audit-info-item">
                <label class="audit-label">{{ $t('admin.generalSetupManagement.lastUpdatedAt') }}</label>
                <div class="audit-value">
                  <feather-icon icon="ClockIcon" size="14" class="mr-1 text-primary" />
                  <strong>{{ formatDateTime(settingToEdit.updatedAt || settingToEdit.createdAt) }}</strong>
                </div>
              </div>
            </b-col>
            <b-col cols="12" md="6" v-if="settingToEdit.createdBy && settingToEdit.createdBy !== settingToEdit.updatedBy">
              <div class="audit-info-item">
                <label class="audit-label">{{ $t('admin.generalSetupManagement.createdBy') }}</label>
                <div class="audit-value">
                  <feather-icon icon="UserPlusIcon" size="14" class="mr-1 text-info" />
                  <span>{{ settingToEdit.createdBy }}</span>
                </div>
              </div>
            </b-col>
            <b-col cols="12" md="6" v-if="settingToEdit.createdAt && settingToEdit.createdAt !== settingToEdit.updatedAt">
              <div class="audit-info-item">
                <label class="audit-label">{{ $t('admin.generalSetupManagement.createdAt') }}</label>
                <div class="audit-value">
                  <feather-icon icon="CalendarIcon" size="14" class="mr-1 text-info" />
                  <span>{{ formatDateTime(settingToEdit.createdAt) }}</span>
                </div>
              </div>
            </b-col>
          </b-row>
        </div>
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
    formatDateTime(dateTime) {
      if (!dateTime) return this.$t('admin.generalSetupManagement.notAvailable')
      
      try {
        let date
        const dateStr = String(dateTime).trim()
        
        // Handle the custom format from backend: "yyyy-MM-dd | HH:mm:ss"
        if (dateStr.includes(' | ')) {
          // Parse the custom format: "yyyy-MM-dd | HH:mm:ss"
          const parts = dateStr.split(' | ')
          if (parts.length === 2) {
            const [datePart, timePart] = parts
            const dateComponents = datePart.split('-')
            const timeComponents = timePart.split(':')
            
            if (dateComponents.length >= 3 && timeComponents.length >= 2) {
              const year = parseInt(dateComponents[0], 10)
              const month = parseInt(dateComponents[1], 10) - 1 // JavaScript months are 0-indexed
              const day = parseInt(dateComponents[2], 10)
              const hour = parseInt(timeComponents[0], 10)
              const minute = parseInt(timeComponents[1], 10)
              const second = timeComponents.length > 2 ? parseInt(timeComponents[2], 10) : 0
              
              date = new Date(year, month, day, hour, minute, second)
            } else {
              date = new Date(dateTime)
            }
          } else {
            date = new Date(dateTime)
          }
        } else {
          // Try standard Date constructor (handles ISO format, timestamps, etc.)
          date = new Date(dateTime)
        }
        
        // Check if date is valid
        if (isNaN(date.getTime())) {
          console.warn('Invalid date format:', dateTime)
          return this.$t('admin.generalSetupManagement.notAvailable')
        }
        
        // Format the date
        return date.toLocaleString('en-US', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false
        })
      } catch (error) {
        console.error('Error formatting date:', dateTime, error)
        return this.$t('admin.generalSetupManagement.notAvailable')
      }
    },
    async loadGeneralSetup() {
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
  padding: 24px;
  background: #f8f9fa;
  min-height: 100vh;
}

/* Enhanced Header */
.page-header {
  margin-bottom: 24px;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.header-title-section {
  display: flex;
  align-items: center;
  color: white;
}

.header-title-section h2 {
  margin: 0;
  color: white;
  font-weight: 600;
}

.header-title-section .small {
  color: rgba(255, 255, 255, 0.9);
  margin-top: 4px;
}

.header-icon {
  color: white !important;
}

/* Search Card */
.search-card {
  border: none;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
  border-radius: 8px;
}

.stats-badge {
  display: inline-flex;
  align-items: center;
  padding: 8px 16px;
  background: #f0f4f8;
  border-radius: 20px;
  font-size: 14px;
}

/* Settings Card */
.settings-card {
  border: none;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  overflow: hidden;
}

.settings-table {
  margin-bottom: 0;
}

.settings-table >>> thead th {
  background: #f8f9fa;
  border-bottom: 2px solid #dee2e6;
  font-weight: 600;
  text-transform: uppercase;
  font-size: 12px;
  letter-spacing: 0.5px;
  color: #495057;
  padding: 16px 12px;
}

.settings-table >>> tbody td {
  padding: 16px 12px;
  vertical-align: middle;
}

.code-cell {
  display: flex;
  align-items: center;
}

.code-text {
  background: #e7f3ff;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
  color: #0066cc;
  border: 1px solid #b3d9ff;
}

.value-cell {
  max-width: 300px;
}

.value-text {
  background: #f0f8ff;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 13px;
  color: #0066cc;
  word-break: break-word;
  display: inline-block;
  max-width: 100%;
}

.description-cell {
  max-width: 400px;
}

.description-text {
  font-size: 13px;
  line-height: 1.5;
  color: #495057;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  padding: 6px 12px;
  font-size: 12px;
  font-weight: 500;
  border-radius: 20px;
}

.action-btn {
  display: inline-flex;
  align-items: center;
  font-weight: 500;
}

/* Modal Styles */
.disabled-input {
  background-color: #f8f9fa;
  cursor: not-allowed;
}

.value-input {
  font-weight: 500;
  font-size: 15px;
}

.audit-info-section {
  background: #f8f9fa;
  padding: 16px;
  border-radius: 8px;
  border: 1px solid #e9ecef;
  margin-top: 8px;
}

.audit-info-title {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
  color: #495057;
  font-weight: 600;
  font-size: 14px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.audit-info-item {
  margin-bottom: 12px;
}

.audit-label {
  display: block;
  font-size: 12px;
  font-weight: 600;
  color: #6c757d;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 4px;
}

.audit-value {
  display: flex;
  align-items: center;
  font-size: 14px;
  color: #212529;
}

.audit-value strong {
  color: #495057;
}

/* Loading spinner animation */
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.spin {
  animation: spin 1s linear infinite;
}

/* Responsive */
@media (max-width: 767.98px) {
  .general-setup-container {
    padding: 16px;
  }

  .header-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  .header-content .btn {
    width: 100%;
  }

  .description-cell {
    max-width: 200px;
  }

  .value-cell {
    max-width: 150px;
  }
}

@media (max-width: 575.98px) {
  .page-header {
    margin-bottom: 16px;
  }

  .header-title-section h2 {
    font-size: 20px;
  }
}
</style>
