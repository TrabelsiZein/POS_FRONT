<template>
  <div class="erp-communications-container">
    <div class="page-header">
      <h2 class="mb-0">{{ $t('admin.erpCommunications.title') }}</h2>
      <b-button variant="outline-primary" @click="loadCommunications" :disabled="loading">
        <feather-icon icon="RefreshCwIcon" size="16" class="mr-50" />
        {{ $t('admin.erpCommunications.refresh') }}
      </b-button>
    </div>

    <b-card class="mb-3">
      <b-row>
        <b-col cols="12" lg="4">
          <b-form-group :label="$t('admin.erpCommunications.search')" label-for="communication-search" class="mb-lg-0">
            <b-input-group>
              <b-form-input id="communication-search" v-model="searchTerm"
                :placeholder="$t('admin.erpCommunications.searchPlaceholder')" />
              <b-input-group-append>
                <b-button variant="outline-secondary" @click="clearSearch" :disabled="!searchTerm">
                  <feather-icon icon="XIcon" size="14" />
                </b-button>
              </b-input-group-append>
            </b-input-group>
          </b-form-group>
        </b-col>
        <b-col cols="12" lg="2">
          <b-form-group :label="$t('admin.erpCommunications.status')" label-for="status-filter" class="mb-lg-0">
            <b-form-select id="status-filter" v-model="statusFilter" :options="statusOptions" />
          </b-form-group>
        </b-col>
        <b-col cols="12" lg="2">
          <b-form-group :label="$t('admin.erpCommunications.operation')" label-for="operation-filter" class="mb-lg-0">
            <b-form-select id="operation-filter" v-model="operationFilter" :options="operationOptions" />
          </b-form-group>
        </b-col>
        <b-col cols="12" lg="2">
          <b-form-group :label="$t('admin.erpCommunications.from')" label-for="from-date" class="mb-lg-0">
            <b-form-input id="from-date" type="date" v-model="fromDate" />
          </b-form-group>
        </b-col>
        <b-col cols="12" lg="2">
          <b-form-group :label="$t('admin.erpCommunications.to')" label-for="to-date" class="mb-0">
            <b-form-input id="to-date" type="date" v-model="toDate" />
          </b-form-group>
        </b-col>
      </b-row>
      <b-row class="mt-1">
        <b-col cols="12" class="d-flex align-items-end justify-content-lg-end">
          <small class="text-muted">
            {{ $t('admin.erpCommunications.showing') }} {{ totalRows }} {{ totalRows === 1 ? $t('admin.erpCommunications.communication') : $t('admin.erpCommunications.communications') }}
          </small>
        </b-col>
      </b-row>
    </b-card>

    <b-card>
      <b-table :items="paginatedCommunications" :fields="fields" striped hover responsive show-empty :busy="loading">
        <template #table-busy>
          <div class="text-center my-2">
            <b-spinner class="align-middle" />
            <strong class="ml-1">{{ $t('admin.erpCommunications.loading') }}</strong>
          </div>
        </template>

        <template #empty>
          <div class="text-center py-4">
            <feather-icon icon="InboxIcon" size="48" class="text-muted mb-2" />
            <p class="text-muted mb-0">{{ $t('admin.erpCommunications.noCommunicationsFound') }}</p>
          </div>
        </template>

        <template #cell(status)="row">
          <b-badge :variant="statusVariant(row.item.status)">
            {{ row.item.status }}
          </b-badge>
        </template>

        <template #cell(startedAt)="row">
          {{ formatDateTime(row.item.startedAt) }}
        </template>

        <template #cell(completedAt)="row">
          {{ formatDateTime(row.item.completedAt) }}
        </template>

        <template #cell(durationMs)="row">
          <span v-if="row.item.durationMs != null">
            {{ (row.item.durationMs / 1000).toFixed(2) }}s
          </span>
          <span v-else class="text-muted">-</span>
        </template>

        <template #cell(errorMessage)="row">
          <span class="text-truncate d-inline-block" style="max-width: 260px;">
            {{ row.item.errorMessage || '—' }}
          </span>
        </template>

        <template #cell(actions)="row">
          <div class="d-flex justify-content-end">
            <b-button size="sm" variant="outline-primary" @click="openDetails(row.item)">
              {{ $t('admin.erpCommunications.details') }}
            </b-button>
          </div>
        </template>
      </b-table>

      <div class="mt-3">
        <b-row align-v="center">
          <b-col cols="12" md="6" class="mb-2 mb-md-0">
            <div class="d-flex align-items-center">
              <label for="communications-per-page" class="mr-2 mb-0">{{ $t('admin.erpCommunications.itemsPerPage') }}</label>
              <b-form-select id="communications-per-page" v-model="perPage" :options="perPageOptions" size="sm"
                style="width: auto;" />
            </div>
          </b-col>
          <b-col cols="12" md="6">
            <div class="text-center text-md-right">
              <small class="text-muted">
                {{ $t('admin.erpCommunications.showing') }} {{ startIndex }} {{ $t('admin.erpJobs.to') }} {{ endIndex }} {{ $t('admin.erpCommunications.of') }} {{ totalRows }} {{ totalRows === 1 ? $t('admin.erpCommunications.communication') : $t('admin.erpCommunications.communications') }}
              </small>
            </div>
          </b-col>
        </b-row>
        <div class="d-flex justify-content-center mt-2">
          <b-pagination v-model="currentPage" :total-rows="totalRows" :per-page="perPage" align="center" />
        </div>
      </div>
    </b-card>

    <b-modal id="communication-details" v-model="showDetailsModal" size="xl" :title="$t('admin.erpCommunications.communicationDetails')" ok-only
      :ok-title="$t('admin.erpJobs.close')" ok-variant="primary">
      <div v-if="selectedCommunication">
        <!-- URL Section - Full Width -->
        <b-card class="mb-3 url-card" v-if="selectedCommunication.url">
          <div class="d-flex align-items-center mb-2">
            <feather-icon icon="LinkIcon" size="18" class="mr-2 text-primary" />
            <strong class="text-primary">{{ $t('admin.erpCommunications.endpointUrl') }}</strong>
          </div>
          <div class="url-container">
            <code class="url-text">{{ selectedCommunication.url }}</code>
            <b-button size="sm" variant="outline-primary" class="copy-btn"
              @click="copyToClipboard(selectedCommunication.url)" v-b-tooltip.hover :title="$t('admin.erpCommunications.copyUrl')">
              <feather-icon icon="CopyIcon" size="14" />
            </b-button>
          </div>
        </b-card>

        <!-- Operation Details Section -->
        <b-card class="mb-3">
          <h6 class="section-title mb-3">
            <feather-icon icon="InfoIcon" size="16" class="mr-2" />
            {{ $t('admin.erpCommunications.operationDetails') }}
          </h6>
          <b-row>
            <b-col cols="12" md="6">
              <div class="detail-item mb-3">
                <label class="detail-label">{{ $t('admin.erpCommunications.operation') }}</label>
                <div class="detail-value">{{ formatOperation(selectedCommunication.operation) }}</div>
              </div>
              <div class="detail-item mb-3">
                <label class="detail-label">{{ $t('admin.erpCommunications.status') }}</label>
                <div class="detail-value">
                  <b-badge :variant="statusVariant(selectedCommunication.status)" class="status-badge">
                    {{ selectedCommunication.status }}
                  </b-badge>
                </div>
              </div>
            </b-col>
            <b-col cols="12" md="6">
              <div class="detail-item mb-3">
                <label class="detail-label">{{ $t('admin.erpCommunications.started') }}</label>
                <div class="detail-value">{{ formatDateTime(selectedCommunication.startedAt) || '—' }}</div>
              </div>
              <div class="detail-item mb-3">
                <label class="detail-label">{{ $t('admin.erpCommunications.completed') }}</label>
                <div class="detail-value">{{ formatDateTime(selectedCommunication.completedAt) || '—' }}</div>
              </div>
              <div class="detail-item mb-3">
                <label class="detail-label">{{ $t('admin.erpCommunications.duration') }}</label>
                <div class="detail-value">
                  <span v-if="selectedCommunication.durationMs != null">
                    {{ (selectedCommunication.durationMs / 1000).toFixed(2) }}s
                  </span>
                  <span v-else>—</span>
                </div>
              </div>
            </b-col>
          </b-row>
        </b-card>

        <!-- Error Message Section -->
        <b-alert variant="danger" show v-if="selectedCommunication.errorMessage" class="mb-3">
          <div class="d-flex align-items-start">
            <feather-icon icon="AlertCircleIcon" size="20" class="mr-2 mt-1" />
            <div>
              <strong class="d-block mb-1">{{ $t('admin.erpCommunications.errorMessage') }}</strong>
              <div>{{ selectedCommunication.errorMessage }}</div>
            </div>
          </div>
        </b-alert>

        <!-- Request Payload Section -->
        <b-card class="mb-3">
          <div class="d-flex justify-content-between align-items-center mb-2">
            <h6 class="section-title mb-0">
              <feather-icon icon="SendIcon" size="16" class="mr-2" />
              {{ $t('admin.erpCommunications.requestPayload') }}
            </h6>
            <b-button size="sm" variant="outline-secondary"
              @click="copyToClipboard(selectedCommunication.requestPayload)" v-b-tooltip.hover :title="$t('admin.erpCommunications.copyRequest')">
              <feather-icon icon="CopyIcon" size="14" class="mr-1" />
              {{ $t('admin.erpCommunications.copy') }}
            </b-button>
          </div>
          <pre class="payload">{{ formatJson(selectedCommunication.requestPayload) }}</pre>
        </b-card>

        <!-- Response Payload Section -->
        <b-card>
          <div class="d-flex justify-content-between align-items-center mb-2">
            <h6 class="section-title mb-0">
              <feather-icon icon="InboxIcon" size="16" class="mr-2" />
              {{ $t('admin.erpCommunications.responsePayload') }}
            </h6>
            <b-button size="sm" variant="outline-secondary"
              @click="copyToClipboard(selectedCommunication.responsePayload)" v-b-tooltip.hover :title="$t('admin.erpCommunications.copyResponse')">
              <feather-icon icon="CopyIcon" size="14" class="mr-1" />
              {{ $t('admin.erpCommunications.copy') }}
            </b-button>
          </div>
          <pre class="payload">{{ formatJson(selectedCommunication.responsePayload) }}</pre>
        </b-card>
      </div>
    </b-modal>
  </div>
</template>

<script>
import moment from 'moment'
import ToastificationContent from '@core/components/toastification/ToastificationContent.vue'

export default {
  name: 'ErpCommunications',
  data() {
    const today = moment().format('YYYY-MM-DD')
    return {
      communications: [],
      loading: false,
      searchTerm: '',
      statusFilter: 'ALL',
      operationFilter: 'ALL',
      fromDate: today,
      toDate: today,
      currentPage: 1,
      perPage: 20,
      perPageOptions: [
        { value: 20, text: '20' },
        { value: 50, text: '50' },
        { value: 100, text: '100' },
        { value: 200, text: '200' },
      ],
      showDetailsModal: false,
      selectedCommunication: null,
    }
  },
  computed: {
    fields() {
      return [
        { key: 'operation', label: this.$t('admin.erpCommunications.operation'), sortable: true },
        { key: 'status', label: this.$t('admin.erpCommunications.status'), sortable: true },
        { key: 'startedAt', label: this.$t('admin.erpCommunications.started'), sortable: true },
        { key: 'completedAt', label: this.$t('admin.erpCommunications.completed'), sortable: true },
        { key: 'durationMs', label: this.$t('admin.erpCommunications.duration'), sortable: true },
        { key: 'errorMessage', label: this.$t('admin.erpCommunications.error'), sortable: false },
        { key: 'actions', label: '', sortable: false, class: 'text-right' },
      ]
    },
    statusOptions() {
      return [
        { value: 'ALL', text: this.$t('admin.erpCommunications.allStatuses') },
        { value: 'SUCCESS', text: this.$t('admin.erpCommunications.success') },
        { value: 'WARNING', text: this.$t('admin.erpCommunications.warning') },
        { value: 'ERROR', text: this.$t('admin.erpCommunications.error') },
      ]
    },
    operationOptions() {
      const operations = new Set()
      this.communications.forEach(comm => {
        if (comm.operation) {
          operations.add(comm.operation)
        }
      })
      const sorted = Array.from(operations).sort()
      return [
        { value: 'ALL', text: this.$t('admin.erpCommunications.allOperations') },
        ...sorted.map(op => ({ value: op, text: this.formatOperation(op) })),
      ]
    },
    filteredCommunications() {
      const term = this.searchTerm.trim().toLowerCase()
      return this.communications.filter(comm => {
        if (this.statusFilter !== 'ALL' && comm.status !== this.statusFilter) {
          return false
        }
        if (this.operationFilter !== 'ALL' && comm.operation !== this.operationFilter) {
          return false
        }
        if (!term) {
          return true
        }
        return [
          comm.url,
          comm.errorMessage,
          comm.requestPayload,
          comm.responsePayload,
          comm.operation,
          comm.status,
        ].some(value => value && value.toString().toLowerCase().includes(term))
      })
    },
    totalRows() {
      return this.filteredCommunications.length
    },
    paginatedCommunications() {
      const start = (this.currentPage - 1) * this.perPage
      return this.filteredCommunications.slice(start, start + this.perPage)
    },
    startIndex() {
      return this.totalRows === 0 ? 0 : (this.currentPage - 1) * this.perPage + 1
    },
    endIndex() {
      return Math.min(this.currentPage * this.perPage, this.totalRows)
    },
  },
  watch: {
    searchTerm() {
      this.currentPage = 1
    },
    statusFilter() {
      this.currentPage = 1
    },
    operationFilter() {
      this.currentPage = 1
    },
    perPage(newValue, oldValue) {
      if (newValue !== oldValue) {
        this.currentPage = 1
      }
    },
    fromDate(newValue, oldValue) {
      if (newValue !== oldValue) {
        this.loadCommunications()
      }
    },
    toDate(newValue, oldValue) {
      if (newValue !== oldValue) {
        this.loadCommunications()
      }
    },
    filteredCommunications(newList) {
      const maxPage = Math.max(1, Math.ceil(newList.length / this.perPage))
      if (this.currentPage > maxPage) {
        this.currentPage = maxPage
      }
    },
  },
  mounted() {
    this.loadCommunications()
  },
  methods: {
    async loadCommunications() {
      this.loading = true
      try {
        const response = await this.$http.get('/admin/erp/communications', {
          params: {
            limit: 500,
            from: this.fromDate,
            to: this.toDate,
          },
        })
        this.communications = Array.isArray(response.data) ? response.data : []
      } catch (error) {
        console.error('Error loading ERP communications:', error)
        this.$toast({
          component: ToastificationContent,
          props: {
            title: this.$t('common.error'),
            icon: 'AlertCircleIcon',
            text: this.$t('admin.erpCommunications.failedToLoad'),
            variant: 'danger',
          },
        })
      } finally {
        this.loading = false
      }
    },
    formatDateTime(value) {
      if (!value) {
        return null
      }
      return moment(value).format('YYYY-MM-DD HH:mm:ss')
    },
    statusVariant(status) {
      switch (status) {
        case 'SUCCESS':
          return 'success'
        case 'WARNING':
          return 'warning'
        case 'ERROR':
          return 'danger'
        default:
          return 'secondary'
      }
    },
    clearSearch() {
      this.searchTerm = ''
    },
    openDetails(communication) {
      this.selectedCommunication = communication
      this.showDetailsModal = true
    },
    formatJson(payload) {
      if (!payload) {
        return '—'
      }
      try {
        const parsed = JSON.parse(payload)
        return JSON.stringify(parsed, null, 2)
      } catch (error) {
        return payload
      }
    },
    formatOperation(operation) {
      if (!operation) return ''
      return operation
        .toString()
        .toLowerCase()
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
    },
    async copyToClipboard(text) {
      if (!text) return
      try {
        await navigator.clipboard.writeText(text)
        this.$toast({
          component: ToastificationContent,
          props: {
            title: this.$t('admin.erpCommunications.copied'),
            icon: 'CheckIcon',
            text: this.$t('admin.erpCommunications.contentCopied'),
            variant: 'success',
          },
        })
      } catch (error) {
        console.error('Failed to copy:', error)
        this.$toast({
          component: ToastificationContent,
          props: {
            title: this.$t('common.error'),
            icon: 'AlertCircleIcon',
            text: this.$t('admin.erpCommunications.failedToCopy'),
            variant: 'danger',
          },
        })
      }
    },
  },
}
</script>

<style scoped>
.erp-communications-container {
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

.payload {
  max-height: 300px;
  overflow: auto;
  background: #f8f9fa;
  padding: 12px;
  border-radius: 6px;
  font-size: 13px;
  line-height: 1.5;
  border: 1px solid #e9ecef;
}

.url-card {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border: 1px solid #dee2e6;
}

.url-container {
  display: flex;
  align-items: center;
  gap: 10px;
  background: white;
  padding: 12px;
  border-radius: 6px;
  border: 1px solid #dee2e6;
}

.url-text {
  flex: 1;
  word-break: break-all;
  font-size: 13px;
  color: #495057;
  margin: 0;
  padding: 0;
  background: transparent;
}

.copy-btn {
  flex-shrink: 0;
  padding: 4px 8px;
}

.section-title {
  color: #495057;
  font-weight: 600;
  display: flex;
  align-items: center;
}

.detail-item {
  padding-bottom: 8px;
  border-bottom: 1px solid #f0f0f0;
}

.detail-item:last-child {
  border-bottom: none;
}

.detail-label {
  font-size: 12px;
  color: #6c757d;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 600;
  margin-bottom: 4px;
  display: block;
}

.detail-value {
  font-size: 14px;
  color: #212529;
  font-weight: 500;
}

.status-badge {
  font-size: 12px;
  padding: 4px 10px;
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
