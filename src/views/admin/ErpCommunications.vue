<template>
  <div class="erp-communications-container">
    <div class="page-header">
      <h2 class="mb-0">ERP Communications</h2>
      <b-button variant="outline-primary" @click="loadCommunications" :disabled="loading">
        <feather-icon icon="RefreshCwIcon" size="16" class="mr-50" />
        Refresh
      </b-button>
    </div>

    <b-card class="mb-3">
      <b-row>
        <b-col cols="12" lg="4">
          <b-form-group label="Search" label-for="communication-search" class="mb-lg-0">
            <b-input-group>
              <b-form-input
                id="communication-search"
                v-model="searchTerm"
                placeholder="Search by reference, error message, payload..."
              />
              <b-input-group-append>
                <b-button variant="outline-secondary" @click="clearSearch" :disabled="!searchTerm">
                  <feather-icon icon="XIcon" size="14" />
                </b-button>
              </b-input-group-append>
            </b-input-group>
          </b-form-group>
        </b-col>
        <b-col cols="12" lg="2">
          <b-form-group label="Status" label-for="status-filter" class="mb-lg-0">
            <b-form-select
              id="status-filter"
              v-model="statusFilter"
              :options="statusOptions"
            />
          </b-form-group>
        </b-col>
        <b-col cols="12" lg="2">
          <b-form-group label="Operation" label-for="operation-filter" class="mb-lg-0">
            <b-form-select
              id="operation-filter"
              v-model="operationFilter"
              :options="operationOptions"
            />
          </b-form-group>
        </b-col>
        <b-col cols="12" lg="2">
          <b-form-group label="From" label-for="from-date" class="mb-lg-0">
            <b-form-input
              id="from-date"
              type="date"
              v-model="fromDate"
            />
          </b-form-group>
        </b-col>
        <b-col cols="12" lg="2">
          <b-form-group label="To" label-for="to-date" class="mb-0">
            <b-form-input
              id="to-date"
              type="date"
              v-model="toDate"
            />
          </b-form-group>
        </b-col>
      </b-row>
      <b-row class="mt-1">
        <b-col cols="12" class="d-flex align-items-end justify-content-lg-end">
          <small class="text-muted">
            Showing {{ totalRows }} {{ totalRows === 1 ? 'communication' : 'communications' }}
          </small>
        </b-col>
      </b-row>
    </b-card>

    <b-card>
      <b-table
        :items="paginatedCommunications"
        :fields="fields"
        striped
        hover
        responsive
        show-empty
        :busy="loading"
      >
        <template #table-busy>
          <div class="text-center my-2">
            <b-spinner class="align-middle" />
            <strong class="ml-1">Loading...</strong>
          </div>
        </template>

        <template #empty>
          <div class="text-center py-4">
            <feather-icon icon="InboxIcon" size="48" class="text-muted mb-2" />
            <p class="text-muted mb-0">No communications found.</p>
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
              Details
            </b-button>
          </div>
        </template>
      </b-table>

      <div class="mt-3">
        <b-row align-v="center">
          <b-col cols="12" md="6" class="mb-2 mb-md-0">
            <div class="d-flex align-items-center">
              <label for="communications-per-page" class="mr-2 mb-0">Items per page:</label>
              <b-form-select
                id="communications-per-page"
                v-model="perPage"
                :options="perPageOptions"
                size="sm"
                style="width: auto;"
              />
            </div>
          </b-col>
          <b-col cols="12" md="6">
            <div class="text-center text-md-right">
              <small class="text-muted">
                Showing {{ startIndex }} to {{ endIndex }} of {{ totalRows }} communications
              </small>
            </div>
          </b-col>
        </b-row>
        <div class="d-flex justify-content-center mt-2">
          <b-pagination
            v-model="currentPage"
            :total-rows="totalRows"
            :per-page="perPage"
            align="center"
          />
        </div>
      </div>
    </b-card>

    <b-modal
      id="communication-details"
      v-model="showDetailsModal"
      size="lg"
      title="Communication Details"
      ok-only
      ok-title="Close"
    >
      <div v-if="selectedCommunication">
        <b-row>
          <b-col cols="12" md="6">
            <p><strong>Operation:</strong> {{ selectedCommunication.operation }}</p>
            <p>
              <strong>Status:</strong>
              <b-badge :variant="statusVariant(selectedCommunication.status)">
                {{ selectedCommunication.status }}
              </b-badge>
            </p>
            <p><strong>Reference:</strong> {{ selectedCommunication.externalReference || '—' }}</p>
          </b-col>
          <b-col cols="12" md="6">
            <p><strong>Started:</strong> {{ formatDateTime(selectedCommunication.startedAt) || '—' }}</p>
            <p><strong>Completed:</strong> {{ formatDateTime(selectedCommunication.completedAt) || '—' }}</p>
            <p><strong>Duration:</strong>
              <span v-if="selectedCommunication.durationMs != null">
                {{ (selectedCommunication.durationMs / 1000).toFixed(2) }}s
              </span>
              <span v-else>—</span>
            </p>
          </b-col>
        </b-row>
        <b-alert variant="danger" show v-if="selectedCommunication.errorMessage">
          <strong>Error:</strong> {{ selectedCommunication.errorMessage }}
        </b-alert>
        <b-card class="mb-2">
          <h6>Request Payload</h6>
          <pre class="payload">{{ formatJson(selectedCommunication.requestPayload) }}</pre>
        </b-card>
        <b-card>
          <h6>Response Payload</h6>
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
      statusOptions: [
        { value: 'ALL', text: 'All statuses' },
        { value: 'SUCCESS', text: 'Success' },
        { value: 'WARNING', text: 'Warning' },
        { value: 'ERROR', text: 'Error' },
      ],
      showDetailsModal: false,
      selectedCommunication: null,
      fields: [
        { key: 'operation', label: 'Operation', sortable: true },
        { key: 'status', label: 'Status', sortable: true },
        { key: 'externalReference', label: 'Reference', sortable: true },
        { key: 'startedAt', label: 'Started', sortable: true },
        { key: 'completedAt', label: 'Completed', sortable: true },
        { key: 'durationMs', label: 'Duration', sortable: true },
        { key: 'errorMessage', label: 'Message', sortable: false },
        { key: 'actions', label: '', sortable: false, class: 'text-right' },
      ],
    }
  },
  computed: {
    operationOptions() {
      const operations = new Set()
      this.communications.forEach(comm => {
        if (comm.operation) {
          operations.add(comm.operation)
        }
      })
      const sorted = Array.from(operations).sort()
      return [
        { value: 'ALL', text: 'All operations' },
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
          comm.externalReference,
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
            title: 'Error',
            icon: 'AlertCircleIcon',
            text: 'Failed to load ERP communications',
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
  max-height: 240px;
  overflow: auto;
  background: #f8f9fa;
  padding: 12px;
  border-radius: 6px;
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


