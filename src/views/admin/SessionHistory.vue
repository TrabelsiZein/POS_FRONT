<template>
  <div class="session-history-container">
    <div class="page-header">
      <h2 class="mb-0">{{ $t('admin.sessionHistory.title') }}</h2>
      <b-button variant="outline-primary" @click="loadSessions">
        <feather-icon icon="RefreshCwIcon" size="16" />
        {{ $t('admin.sessionHistory.refresh') }}
      </b-button>
    </div>

    <!-- Filters and Search -->
    <b-card class="mb-2">
      <div @click="toggleFilters" role="button" tabindex="0" @keyup.enter="toggleFilters">
        <div class="d-flex align-items-center justify-content-between">
          <div class="d-flex align-items-center">
            <feather-icon icon="FilterIcon" size="18" class="mr-2 text-primary" />
            <h6 class="mb-0 text-primary font-weight-bold">
              {{ $t('admin.sessionHistory.filters') }}
              <span class="text-muted font-weight-normal ml-2">({{ $t('admin.sessionHistory.total') }} {{ totalRows }} {{ totalRows === 1 ? $t('admin.sessionHistory.session') : $t('admin.sessionHistory.sessions') }})</span>
            </h6>
          </div>
          <feather-icon :icon="filtersExpanded ? 'ChevronUpIcon' : 'ChevronDownIcon'" size="20" class="text-primary" />
        </div>
      </div>
      <b-collapse v-model="filtersExpanded" id="filters-collapse">
        <div class="pt-2">
          <b-row>
            <b-col cols="12" sm="6" md="6" lg="6" class="mb-2">
              <b-form-group :label="$t('admin.sessionHistory.search')" label-for="search-input" class="mb-0">
                <b-input-group>
                  <b-input-group-prepend>
                    <b-input-group-text class="bg-white">
                      <feather-icon icon="SearchIcon" size="16" />
                    </b-input-group-text>
                  </b-input-group-prepend>
                  <b-form-input id="search-input" v-model="filters.search"
                    :placeholder="$t('admin.sessionHistory.searchPlaceholder')" @input="onFilterChange" />
                  <b-input-group-append>
                    <b-button variant="outline-secondary" @click="clearSearch" :disabled="!filters.search">
                      <feather-icon icon="XIcon" size="14" />
                    </b-button>
                  </b-input-group-append>
                </b-input-group>
              </b-form-group>
            </b-col>
            <b-col cols="12" sm="6" md="3" lg="3" class="mb-2">
              <b-form-group :label="$t('admin.sessionHistory.dateFrom')" label-for="date-from" class="mb-0">
                <b-input-group>
                  <b-input-group-prepend>
                    <b-input-group-text class="bg-white">
                      <feather-icon icon="CalendarIcon" size="16" />
                    </b-input-group-text>
                  </b-input-group-prepend>
                  <b-form-input id="date-from" v-model="filters.dateFrom" type="date" @input="onFilterChange" />
                </b-input-group>
              </b-form-group>
            </b-col>
            <b-col cols="12" sm="6" md="3" lg="3" class="mb-2">
              <b-form-group :label="$t('admin.sessionHistory.dateTo')" label-for="date-to" class="mb-0">
                <b-input-group>
                  <b-input-group-prepend>
                    <b-input-group-text class="bg-white">
                      <feather-icon icon="CalendarIcon" size="16" />
                    </b-input-group-text>
                  </b-input-group-prepend>
                  <b-form-input id="date-to" v-model="filters.dateTo" type="date" @input="onFilterChange" />
                </b-input-group>
              </b-form-group>
            </b-col>
          </b-row>
          <b-row>
            <b-col cols="12" sm="6" md="4" lg="4" class="mb-2">
              <b-form-group :label="$t('admin.sessionHistory.status')" label-for="status-filter" class="mb-0">
                <b-input-group>
                  <b-input-group-prepend>
                    <b-input-group-text class="bg-white">
                      <feather-icon icon="TagIcon" size="16" />
                    </b-input-group-text>
                  </b-input-group-prepend>
                  <b-form-select id="status-filter" v-model="filters.status" :options="statusOptions"
                    @input="onFilterChange" />
                </b-input-group>
              </b-form-group>
            </b-col>
            <b-col cols="12" sm="6" md="4" lg="4" class="mb-2">
              <b-form-group :label="$t('admin.sessionHistory.syncStatus')" label-for="sync-status-filter" class="mb-0">
                <b-input-group>
                  <b-input-group-prepend>
                    <b-input-group-text class="bg-white">
                      <feather-icon icon="CloudIcon" size="16" />
                    </b-input-group-text>
                  </b-input-group-prepend>
                  <b-form-select id="sync-status-filter" v-model="filters.syncStatus" :options="syncStatusOptions"
                    @input="onFilterChange" />
                </b-input-group>
              </b-form-group>
            </b-col>
          </b-row>
        </div>
      </b-collapse>
    </b-card>

    <!-- Sessions Table -->
    <b-card>
      <b-table :items="paginatedSessions" :fields="sessionFields" striped hover responsive :busy="loading" :sort-by="sortBy"
        :sort-desc="sortDesc" @row-clicked="viewSessionDetails" class="cursor-pointer" show-empty>
        <template #table-busy>
          <div class="text-center my-2">
            <b-spinner class="align-middle"></b-spinner>
            <strong>{{ $t('admin.sessionHistory.loadingText') }}</strong>
          </div>
        </template>

        <template #empty>
          <div class="text-center text-muted py-4">
            <p>{{ $t('admin.sessionHistory.noSessionsText') }}</p>
            <p class="small">{{ $t('admin.sessionHistory.tryAdjustingFilters') }}</p>
          </div>
        </template>

        <template #cell(sessionNumber)="row">
          <strong class="text-primary">{{ row.item.sessionNumber }}</strong>
        </template>

        <template #cell(cashierFullName)="row">
          {{ row.item.cashierFullName || row.item.cashierUsername }}
        </template>

        <template #cell(status)="row">
          <b-badge :variant="getStatusBadgeVariant(row.item.status)">
            {{ getStatusLabel(row.item.status) }}
          </b-badge>
        </template>

        <template #cell(synchronizationStatus)="row">
          <div class="sync-status-cell">
            <b-badge :variant="getSyncStatusVariant(row.item.synchronizationStatus)" class="sync-badge">
              <feather-icon :icon="getSyncStatusIcon(row.item.synchronizationStatus)" size="12" class="mr-1" />
              {{ formatSyncStatus(row.item.synchronizationStatus) }}
            </b-badge>
            <small v-if="row.item.erpNo" class="text-muted d-block mt-1">
              {{ $t('admin.sessionHistory.modal.erp') }} {{ row.item.erpNo }}
            </small>
          </div>
        </template>

        <template #cell(openedAt)="row">
          {{ formatDateTime(row.item.openedAt) }}
        </template>

        <template #cell(closedAt)="row">
          {{ formatDateTime(row.item.closedAt) || '-' }}
        </template>

        <template #cell(totalSalesAmount)="row">
          <strong>{{ formatPrice(row.item.totalSalesAmount || 0) }} TND</strong>
        </template>

        <template #cell(realCash)="row">
          {{ formatPrice(row.item.realCash || 0) }} TND
        </template>

        <template #cell(posUserClosureCash)="row">
          {{ formatPrice(row.item.posUserClosureCash || 0) }} TND
        </template>

        <template #cell(responsibleClosureCash)="row">
          <span v-if="row.item.responsibleClosureCash">
            {{ formatPrice(row.item.responsibleClosureCash) }} TND
          </span>
          <span v-else class="text-muted">-</span>
        </template>

        <template #cell(cashDifference)="row">
          <span :class="getDifferenceClass(row.item.cashDifference)">
            {{ formatPrice(row.item.cashDifference || 0) }} TND
          </span>
        </template>

        <template #cell(actions)="row">
          <b-button variant="primary" size="sm" @click.stop="viewSessionDetails(row.item)">
            {{ $t('admin.sessionHistory.viewDetails') }}
          </b-button>
        </template>
      </b-table>

      <!-- Pagination -->
      <div class="mt-3">
        <b-row align-v="center">
          <b-col cols="12" md="6" class="mb-2 mb-md-0">
            <div class="d-flex align-items-center">
              <label for="per-page-select" class="mr-2 mb-0">{{ $t('admin.sessionHistory.itemsPerPage') }}</label>
              <b-form-select id="per-page-select" v-model="perPage" :options="perPageOptions" size="sm"
                style="width: auto;" @change="onPerPageChange" />
            </div>
          </b-col>
          <b-col cols="12" md="6">
            <div class="text-center text-md-right">
              <small class="text-muted">
                {{ $t('admin.sessionHistory.showing') }} {{ startIndex }} {{ $t('admin.sessionHistory.to') }} {{ endIndex }} {{ $t('admin.sessionHistory.of') }} {{ totalRows }} {{ totalRows === 1 ? $t('admin.sessionHistory.session') : $t('admin.sessionHistory.sessions') }}
              </small>
            </div>
          </b-col>
        </b-row>
        <div class="d-flex justify-content-center mt-2">
          <b-pagination v-model="currentPage" :total-rows="totalRows" :per-page="perPage" align="center" />
        </div>
      </div>
    </b-card>

    <!-- Session Details Modal -->
    <b-modal
      v-model="showDetailsModal"
      :title="$t('admin.sessionHistory.sessionDetails')"
      size="xl"
      @hide="resetDetailsForm"
      scrollable
    >
      <div v-if="sessionDetails" class="session-details">
        <!-- Session Info -->
        <b-card class="mb-3">
          <h5 class="mb-3">{{ $t('admin.sessionHistory.modal.sessionInformation') }}</h5>
          <b-row>
            <b-col cols="12" md="6">
              <div class="detail-item">
                <strong>{{ $t('admin.sessionHistory.modal.sessionNumber') }}</strong>
                <span class="ml-2">{{ sessionDetails.session.sessionNumber }}</span>
              </div>
              <div class="detail-item">
                <strong>{{ $t('admin.sessionHistory.modal.cashier') }}</strong>
                <span class="ml-2">{{ sessionDetails.session.cashierName }}</span>
              </div>
              <div class="detail-item">
                <strong>{{ $t('admin.sessionHistory.modal.openedAt') }}</strong>
                <span class="ml-2">{{ formatDateTime(sessionDetails.session.openedAt) }}</span>
              </div>
              <div class="detail-item">
                <strong>{{ $t('admin.sessionHistory.modal.closedAt') }}</strong>
                <span class="ml-2">{{ formatDateTime(sessionDetails.session.closedAt) || '-' }}</span>
              </div>
              <div class="detail-item">
                <strong>{{ $t('admin.sessionHistory.modal.status') }}</strong>
                <b-badge :variant="getStatusBadgeVariant(sessionDetails.session.status)" class="ml-2">
                  {{ getStatusLabel(sessionDetails.session.status) }}
                </b-badge>
              </div>
            </b-col>
            <b-col cols="12" md="6">
              <div class="detail-item">
                <strong>{{ $t('admin.sessionHistory.modal.openingCash') }}</strong>
                <span class="ml-2">{{ formatPrice(sessionDetails.session.openingCash) }} TND</span>
              </div>
              <div class="detail-item">
                <strong>{{ $t('admin.sessionHistory.modal.realCash') }}</strong>
                <span class="ml-2">{{ formatPrice(sessionDetails.session.realCash) }} TND</span>
              </div>
              <div class="detail-item">
                <strong>{{ $t('admin.sessionHistory.modal.posUserClosureCash') }}</strong>
                <span class="ml-2">{{ formatPrice(sessionDetails.session.posUserClosureCash) }} TND</span>
              </div>
              <div class="detail-item" v-if="sessionDetails.session.responsibleClosureCash">
                <strong>{{ $t('admin.sessionHistory.modal.responsibleClosureCash') }}</strong>
                <span class="ml-2">{{ formatPrice(sessionDetails.session.responsibleClosureCash) }} TND</span>
              </div>
              <div class="detail-item">
                <strong>{{ $t('admin.sessionHistory.modal.salesCount') }}</strong>
                <span class="ml-2">{{ sessionDetails.salesCount }}</span>
              </div>
              <div class="detail-item">
                <strong>{{ $t('admin.sessionHistory.modal.totalSales') }}</strong>
                <span class="ml-2">{{ formatPrice(sessionDetails.totalSalesAmount) }} TND</span>
              </div>
            </b-col>
          </b-row>
        </b-card>

        <!-- Synchronization Information -->
        <b-card class="mb-3 sync-info-card">
          <div class="d-flex align-items-center mb-3">
            <feather-icon icon="CloudIcon" size="20" class="mr-2 text-primary" />
            <h5 class="mb-0">{{ $t('admin.sessionHistory.modal.erpSynchronization') }}</h5>
          </div>
          <b-row>
            <b-col md="6">
              <div class="sync-detail-item">
                <label class="sync-label">{{ $t('admin.sessionHistory.modal.synchronizationStatus') }}</label>
                <div class="sync-value">
                  <b-badge :variant="getSyncStatusVariant(sessionDetails.session.synchronizationStatus)" class="sync-badge-large">
                    <feather-icon :icon="getSyncStatusIcon(sessionDetails.session.synchronizationStatus)" size="14" class="mr-1" />
                    {{ formatSyncStatus(sessionDetails.session.synchronizationStatus) }}
                  </b-badge>
                </div>
              </div>
            </b-col>
            <b-col md="6">
              <div class="sync-detail-item">
                <label class="sync-label">{{ $t('admin.sessionHistory.modal.erpDocumentNumber') }}</label>
                <div class="sync-value">
                  <code v-if="sessionDetails.session.erpNo" class="erp-number">{{ sessionDetails.session.erpNo }}</code>
                  <span v-else class="text-muted">{{ $t('admin.sessionHistory.modal.notSynchronized') }}</span>
                </div>
              </div>
            </b-col>
          </b-row>
        </b-card>

        <!-- Payment Headers and Lines -->
        <b-card class="mb-3" v-if="sessionDetails.paymentHeaders && sessionDetails.paymentHeaders.length > 0">
          <h5 class="mb-3">{{ $t('admin.sessionHistory.modal.paymentHeadersLines') }}</h5>
          <div v-for="header in sessionDetails.paymentHeaders" :key="header.id" class="payment-header-section mb-4">
            <b-card class="bg-light">
              <div class="d-flex justify-content-between align-items-center mb-2">
                <div>
                  <strong>{{ $t('admin.sessionHistory.modal.paymentClass') }}</strong> {{ header.paymentClass }}
                  <span class="ml-2">
                    <b-badge :variant="getSyncStatusVariant(header.synchronizationStatus)" class="sync-badge">
                      <feather-icon :icon="getSyncStatusIcon(header.synchronizationStatus)" size="12" class="mr-1" />
                      {{ formatSyncStatus(header.synchronizationStatus) }}
                    </b-badge>
                  </span>
                </div>
                <div>
                  <small class="text-muted">{{ $t('admin.sessionHistory.modal.postDate') }} {{ formatDate(header.postDate) }}</small>
                  <span v-if="header.erpNo" class="ml-2">
                    <small class="text-muted">{{ $t('admin.sessionHistory.modal.erp') }} <code>{{ header.erpNo }}</code></small>
                  </span>
                </div>
              </div>
              <b-table 
                :items="getPaymentLinesForHeader(header.id)" 
                :fields="paymentLineFields" 
                small 
                striped 
                responsive
                class="payment-lines-table"
              >
                <template #cell(custNo)="row">
                  {{ row.item.custNo }}
                </template>
                <template #cell(amount)="row">
                  <strong>{{ formatPrice(row.item.amount) }} TND</strong>
                </template>
                <template #cell(ticketNo)="row">
                  {{ row.item.ticketNo }}
                </template>
                <template #cell(synched)="row">
                  <b-badge :variant="row.item.synched ? 'success' : 'secondary'" class="sync-indicator">
                    <feather-icon :icon="row.item.synched ? 'CheckIcon' : 'XIcon'" size="12" class="mr-1" />
                    {{ row.item.synched ? $t('admin.sessionHistory.modal.synced') : $t('admin.sessionHistory.modal.notSynced') }}
                  </b-badge>
                </template>
              </b-table>
            </b-card>
          </div>
        </b-card>

        <!-- Cash Count Lines (POS User) -->
        <b-card class="mb-3" v-if="posUserCashCounts.length > 0">
          <h5>{{ $t('admin.sessionHistory.modal.cashCountPosUser') }}</h5>
          <b-table
            :items="posUserCashCounts"
            :fields="cashCountFields"
            small
            striped
          >
            <template #cell(paymentMethod)="row">
              {{ row.item.paymentMethod ? row.item.paymentMethod.name : $t('common.cash') }}
            </template>
            <template #cell(lineTotal)="row">
              {{ formatPrice(row.item.lineTotal) }} TND
            </template>
            <template #cell(counterType)="row">
              <b-badge variant="info">{{ row.item.counterType }}</b-badge>
            </template>
          </b-table>
          <div class="mt-2">
            <strong>{{ $t('admin.sessionHistory.modal.total') }}: {{ formatPrice(posUserCashCountsTotal) }} TND</strong>
          </div>
        </b-card>

        <!-- Cash Count Lines (Responsible) -->
        <b-card class="mb-3" v-if="responsibleCashCounts.length > 0">
          <h5>{{ $t('admin.sessionHistory.modal.cashCountResponsible') }}</h5>
          <b-table
            :items="responsibleCashCounts"
            :fields="cashCountFields"
            small
            striped
          >
            <template #cell(paymentMethod)="row">
              {{ row.item.paymentMethod ? row.item.paymentMethod.name : $t('common.cash') }}
            </template>
            <template #cell(lineTotal)="row">
              {{ formatPrice(row.item.lineTotal) }} TND
            </template>
            <template #cell(counterType)="row">
              <b-badge variant="warning">{{ row.item.counterType }}</b-badge>
            </template>
          </b-table>
          <div class="mt-2">
            <strong>{{ $t('admin.sessionHistory.modal.total') }}: {{ formatPrice(responsibleCashCountsTotal) }} TND</strong>
          </div>
        </b-card>
      </div>
    </b-modal>
  </div>
</template>

<script>
import moment from 'moment'
import ToastificationContent from '@core/components/toastification/ToastificationContent.vue'
import { formatCurrencyAmount } from '@core/utils/filter'

export default {
  name: 'SessionHistory',
  data() {
    return {
      sessions: [],
      allSessions: [],
      filteredSessions: [],
      loading: false,
      showDetailsModal: false,
      sessionDetails: null,
      sortBy: 'openedAt',
      sortDesc: true,
      filtersExpanded: false,
      currentPage: 1,
      perPage: 10,
      perPageOptions: [
        { value: 10, text: '10' },
        { value: 20, text: '20' },
        { value: 50, text: '50' },
        { value: 100, text: '100' }
      ],
      filters: {
        search: '',
        dateFrom: '',
        dateTo: '',
        status: 'TERMINATED',
        syncStatus: 'all'
      }
    }
  },
  computed: {
    sessionFields() {
      return [
        { key: 'sessionNumber', label: this.$t('admin.sessionHistory.tableHeaders.sessionNumber'), sortable: true },
        { key: 'cashierFullName', label: this.$t('admin.sessionHistory.tableHeaders.cashier'), sortable: true },
        { key: 'status', label: this.$t('admin.sessionHistory.tableHeaders.status'), sortable: true },
        { key: 'synchronizationStatus', label: this.$t('admin.sessionHistory.tableHeaders.syncStatus'), sortable: true },
        { key: 'openedAt', label: this.$t('admin.sessionHistory.tableHeaders.openedAt'), sortable: true },
        { key: 'closedAt', label: this.$t('admin.sessionHistory.tableHeaders.closedAt'), sortable: true },
        { key: 'salesCount', label: this.$t('admin.sessionHistory.tableHeaders.sales'), sortable: true },
        { key: 'totalSalesAmount', label: this.$t('admin.sessionHistory.tableHeaders.totalSales'), sortable: true },
        { key: 'realCash', label: this.$t('admin.sessionHistory.tableHeaders.realCash'), sortable: true },
        { key: 'posUserClosureCash', label: this.$t('admin.sessionHistory.tableHeaders.posClosure'), sortable: true },
        { key: 'responsibleClosureCash', label: this.$t('admin.sessionHistory.tableHeaders.respClosure'), sortable: true },
        { key: 'cashDifference', label: this.$t('admin.sessionHistory.tableHeaders.difference'), sortable: true },
        { key: 'actions', label: this.$t('admin.sessionHistory.tableHeaders.actions'), sortable: false }
      ]
    },
    statusOptions() {
      return [
        { value: 'all', text: this.$t('admin.sessionHistory.statusValues.all') },
        { value: 'TERMINATED', text: this.$t('admin.sessionHistory.statusValues.terminated') },
        { value: 'CLOSED', text: this.$t('admin.sessionHistory.statusValues.closed') },
        { value: 'OPENED', text: this.$t('admin.sessionHistory.statusValues.opened') }
      ]
    },
    syncStatusOptions() {
      return [
        { value: 'all', text: this.$t('admin.sessionHistory.syncStatusValues.all') },
        { value: 'NOT_SYNCHED', text: this.$t('admin.sessionHistory.syncStatusValues.notSynced') },
        { value: 'PARTIALLY_SYNCHED', text: this.$t('admin.sessionHistory.syncStatusValues.partiallySynced') },
        { value: 'TOTALLY_SYNCHED', text: this.$t('admin.sessionHistory.syncStatusValues.totallySynced') }
      ]
    },
    totalRows() {
      return this.filteredSessions.length
    },
    startIndex() {
      return this.totalRows === 0 ? 0 : ((this.currentPage - 1) * this.perPage) + 1
    },
    endIndex() {
      return Math.min(this.currentPage * this.perPage, this.totalRows)
    },
    paginatedSessions() {
      const start = (this.currentPage - 1) * this.perPage
      const end = start + this.perPage
      return this.filteredSessions.slice(start, end)
    },
    posUserCashCounts() {
      if (!this.sessionDetails || !this.sessionDetails.cashCountLines) return []
      return this.sessionDetails.cashCountLines.filter(line => line.counterType === 'POS_USER')
    },
    responsibleCashCounts() {
      if (!this.sessionDetails || !this.sessionDetails.cashCountLines) return []
      return this.sessionDetails.cashCountLines.filter(line => line.counterType === 'RESPONSIBLE')
    },
    posUserCashCountsTotal() {
      return this.posUserCashCounts.reduce((sum, line) => sum + (line.lineTotal || 0), 0)
    },
    responsibleCashCountsTotal() {
      return this.responsibleCashCounts.reduce((sum, line) => sum + (line.lineTotal || 0), 0)
    },
    cashCountFields() {
      return [
        { key: 'denominationValue', label: this.$t('admin.sessionHistory.modal.value') },
        { key: 'quantity', label: this.$t('admin.sessionHistory.modal.qty') },
        { key: 'paymentMethod', label: this.$t('admin.sessionHistory.modal.paymentMethod') },
        { key: 'referenceNumber', label: this.$t('admin.sessionHistory.modal.reference') },
        { key: 'lineTotal', label: this.$t('admin.sessionHistory.modal.total') },
        { key: 'counterType', label: this.$t('admin.sessionHistory.modal.counter') }
      ]
    },
    paymentLineFields() {
      return [
        { key: 'custNo', label: this.$t('admin.sessionHistory.modal.customer') },
        { key: 'amount', label: this.$t('admin.sessionHistory.modal.amount') },
        { key: 'ticketNo', label: this.$t('admin.sessionHistory.modal.ticketNumber') },
        { key: 'fenceNo', label: this.$t('admin.sessionHistory.modal.fenceNumber') },
        { key: 'titleNumber', label: this.$t('admin.sessionHistory.modal.titleNumber') },
        { key: 'synched', label: this.$t('admin.sessionHistory.modal.synced'), class: 'text-center' }
      ]
    }
  },
  watch: {
    currentPage() {
      // Page change handled by computed property
    },
    perPage() {
      if (this.currentPage > Math.ceil(this.totalRows / this.perPage)) {
        this.currentPage = Math.max(1, Math.ceil(this.totalRows / this.perPage))
      }
    }
  },
  mounted() {
    this.loadSessions()
  },
  methods: {
    async loadSessions() {
      this.loading = true
      try {
        const response = await this.$http.get('/cashier-session/dashboard')
        this.allSessions = response.data || []
        this.applyFilters()
      } catch (error) {
        console.error('Error loading sessions:', error)
        this.$toast({
          component: ToastificationContent,
          props: {
            title: 'Error',
            icon: 'AlertCircleIcon',
            text: this.$t('admin.sessionHistory.errors.failedToLoadSessions'),
            variant: 'danger'
          }
        })
      } finally {
        this.loading = false
      }
    },
    applyFilters() {
      let filtered = [...this.allSessions]

      // Status filter
      if (this.filters.status && this.filters.status !== 'all') {
        filtered = filtered.filter(session => session.status === this.filters.status)
      }

      // Sync status filter
      if (this.filters.syncStatus && this.filters.syncStatus !== 'all') {
        filtered = filtered.filter(session => session.synchronizationStatus === this.filters.syncStatus)
      }

      // Search filter
      if (this.filters.search) {
        const search = this.filters.search.toLowerCase()
        filtered = filtered.filter(session => {
          const sessionNumber = (session.sessionNumber || '').toLowerCase()
          const cashierName = (session.cashierFullName || session.cashierUsername || '').toLowerCase()
          return sessionNumber.includes(search) || cashierName.includes(search)
        })
      }

      // Date filters
      if (this.filters.dateFrom) {
        const fromDate = moment(this.filters.dateFrom).startOf('day')
        filtered = filtered.filter(session => {
          const openedAt = moment(session.openedAt)
          return openedAt.isSameOrAfter(fromDate)
        })
      }

      if (this.filters.dateTo) {
        const toDate = moment(this.filters.dateTo).endOf('day')
        filtered = filtered.filter(session => {
          const openedAt = moment(session.openedAt)
          return openedAt.isSameOrBefore(toDate)
        })
      }

      this.filteredSessions = filtered
      if (this.currentPage > Math.ceil(this.filteredSessions.length / this.perPage)) {
        this.currentPage = Math.max(1, Math.ceil(this.filteredSessions.length / this.perPage))
      }
    },
    onFilterChange() {
      this.currentPage = 1
      this.applyFilters()
    },
    toggleFilters() {
      this.filtersExpanded = !this.filtersExpanded
    },
    clearSearch() {
      this.filters.search = ''
      this.onFilterChange()
    },
    resetFilters() {
      this.filters = {
        search: '',
        dateFrom: '',
        dateTo: '',
        status: 'TERMINATED',
        syncStatus: 'all'
      }
      this.onFilterChange()
    },
    onPerPageChange() {
      this.currentPage = 1
    },
    async viewSessionDetails(session) {
      try {
        const response = await this.$http.get(`/cashier-session/${session.id}/details`)
        this.sessionDetails = response.data
        this.showDetailsModal = true
      } catch (error) {
        console.error('Error loading session details:', error)
        this.$toast({
          component: ToastificationContent,
          props: {
            title: 'Error',
            icon: 'AlertCircleIcon',
            text: this.$t('admin.sessionHistory.errors.failedToLoadSessionDetails'),
            variant: 'danger'
          }
        })
      }
    },
    getPaymentLinesForHeader(headerId) {
      if (!this.sessionDetails || !this.sessionDetails.paymentLines) return []
      return this.sessionDetails.paymentLines.filter(line => line.paymentHeader && line.paymentHeader.id === headerId)
    },
    resetDetailsForm() {
      this.sessionDetails = null
    },
    formatPrice(price) {
      if (!price && price !== 0) return '0.00'
      return formatCurrencyAmount(price)
    },
    formatDateTime(dateString) {
      if (!dateString) return null
      return moment(dateString).format('YYYY-MM-DD HH:mm:ss')
    },
    formatDate(dateString) {
      if (!dateString) return null
      return moment(dateString).format('YYYY-MM-DD')
    },
    formatSyncStatus(status) {
      if (!status) return this.$t('admin.sessionHistory.syncStatusValues.notSynced')
      const statusMap = {
        'NOT_SYNCHED': this.$t('admin.sessionHistory.syncStatusValues.notSynced'),
        'PARTIALLY_SYNCHED': this.$t('admin.sessionHistory.syncStatusValues.partiallySynced'),
        'TOTALLY_SYNCHED': this.$t('admin.sessionHistory.syncStatusValues.totallySynced')
      }
      return statusMap[status] || status.split('_').map(word => word.charAt(0) + word.slice(1).toLowerCase()).join(' ')
    },
    getStatusLabel(status) {
      const statusMap = {
        'OPENED': this.$t('admin.sessionHistory.statusValues.opened'),
        'CLOSED': this.$t('admin.sessionHistory.statusValues.closed'),
        'TERMINATED': this.$t('admin.sessionHistory.statusValues.terminated')
      }
      return statusMap[status] || status
    },
    getSyncStatusVariant(status) {
      if (!status) return 'secondary'
      switch (status) {
        case 'TOTALLY_SYNCHED':
          return 'success'
        case 'PARTIALLY_SYNCHED':
          return 'warning'
        case 'NOT_SYNCHED':
          return 'secondary'
        default:
          return 'secondary'
      }
    },
    getSyncStatusIcon(status) {
      if (!status) return 'XIcon'
      switch (status) {
        case 'TOTALLY_SYNCHED':
          return 'CheckCircleIcon'
        case 'PARTIALLY_SYNCHED':
          return 'AlertCircleIcon'
        case 'NOT_SYNCHED':
          return 'XCircleIcon'
        default:
          return 'XCircleIcon'
      }
    },
    getStatusBadgeVariant(status) {
      switch (status) {
        case 'OPENED':
          return 'success'
        case 'CLOSED':
          return 'warning'
        case 'TERMINATED':
          return 'secondary'
        default:
          return 'secondary'
      }
    },
    getDifferenceClass(difference) {
      if (!difference && difference !== 0) return ''
      return difference >= 0 ? 'text-success' : 'text-danger'
    }
  }
}
</script>

<style scoped>
.session-history-container {
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

.cursor-pointer {
  cursor: pointer;
}

.sync-status-cell {
  min-width: 120px;
}

.sync-badge {
  display: inline-flex;
  align-items: center;
}

.sync-badge-large {
  display: inline-flex;
  align-items: center;
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
}

.sync-info-card {
  background-color: #f8f9fa;
  border-left: 4px solid #007bff;
}

.sync-detail-item {
  margin-bottom: 1rem;
}

.sync-label {
  display: block;
  font-size: 0.875rem;
  color: #6c757d;
  margin-bottom: 0.25rem;
  font-weight: 500;
}

.sync-value {
  font-size: 1rem;
}

.erp-number {
  background-color: #e9ecef;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-family: 'Courier New', monospace;
  font-size: 0.9rem;
}

.detail-item {
  margin-bottom: 0.75rem;
}

.payment-header-section {
  border: 1px solid #dee2e6;
  border-radius: 0.25rem;
}

.payment-lines-table {
  margin-top: 0.5rem;
}

.sync-indicator {
  display: inline-flex;
  align-items: center;
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
