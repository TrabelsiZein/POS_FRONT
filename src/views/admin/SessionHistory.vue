<template>
  <div class="session-history-container">
    <div class="page-header">
      <h2 class="mb-0">Session History</h2>
      <b-button variant="outline-primary" @click="loadSessions">
        <feather-icon icon="RefreshCwIcon" size="16" />
        Refresh
      </b-button>
    </div>

    <!-- Filters and Search -->
    <b-card class="mb-4">
      <b-row>
        <b-col cols="12" md="4">
          <b-form-group label="Search" label-for="search-input">
            <b-input-group>
              <b-form-input
                id="search-input"
                v-model="filters.search"
                placeholder="Search by session number, cashier..."
                @input="onFilterChange"
              />
              <b-input-group-append>
                <b-button variant="outline-secondary" @click="clearSearch">
                  <feather-icon icon="XIcon" size="16" />
                </b-button>
              </b-input-group-append>
            </b-input-group>
          </b-form-group>
        </b-col>
        <b-col cols="12" md="3">
          <b-form-group label="Date From" label-for="date-from">
            <b-form-input
              id="date-from"
              v-model="filters.dateFrom"
              type="date"
              @input="onFilterChange"
            />
          </b-form-group>
        </b-col>
        <b-col cols="12" md="3">
          <b-form-group label="Date To" label-for="date-to">
            <b-form-input
              id="date-to"
              v-model="filters.dateTo"
              type="date"
              @input="onFilterChange"
            />
          </b-form-group>
        </b-col>
        <b-col cols="12" md="2">
          <b-form-group label="Status" label-for="status-filter">
            <b-form-select
              id="status-filter"
              v-model="filters.status"
              :options="statusOptions"
              @input="onFilterChange"
            />
          </b-form-group>
        </b-col>
      </b-row>
      <b-row>
        <b-col cols="12" class="text-right">
          <b-button variant="secondary" @click="resetFilters" size="sm">
            Reset Filters
          </b-button>
        </b-col>
      </b-row>
    </b-card>

    <!-- Sessions Table -->
    <b-card>
      <div class="table-header mb-3">
        <div>
          <strong>Total: {{ filteredSessions.length }} sessions</strong>
        </div>
        <div class="text-muted">
          Showing TERMINATED sessions only
        </div>
      </div>
      <b-table
        :items="filteredSessions"
        :fields="sessionFields"
        striped
        hover
        responsive
        :busy="loading"
        :sort-by="sortBy"
        :sort-desc="sortDesc"
        @row-clicked="viewSessionDetails"
        class="cursor-pointer"
        show-empty
      >
        <template #table-busy>
          <div class="text-center my-2">
            <b-spinner class="align-middle"></b-spinner>
            <strong>Loading...</strong>
          </div>
        </template>

        <template #empty>
          <div class="text-center py-5">
            <feather-icon icon="InboxIcon" size="48" class="text-muted mb-3" />
            <h5 class="text-muted">No Sessions Found</h5>
            <p class="text-muted mb-0">No terminated sessions match your filters.</p>
          </div>
        </template>

        <template #cell(status)="row">
          <b-badge :variant="getStatusBadgeVariant(row.item.status)">
            {{ row.item.status }}
          </b-badge>
        </template>

        <template #cell(cashierFullName)="row">
          {{ row.item.cashierFullName || row.item.cashierUsername }}
        </template>

        <template #cell(openedAt)="row">
          {{ formatDateTime(row.item.openedAt) }}
        </template>

        <template #cell(closedAt)="row">
          {{ formatDateTime(row.item.closedAt) || '-' }}
        </template>

        <template #cell(totalSalesAmount)="row">
          ${{ formatPrice(row.item.totalSalesAmount || 0) }}
        </template>

        <template #cell(realCash)="row">
          ${{ formatPrice(row.item.realCash || 0) }}
        </template>

        <template #cell(posUserClosureCash)="row">
          ${{ formatPrice(row.item.posUserClosureCash || 0) }}
        </template>

        <template #cell(responsibleClosureCash)="row">
          <span v-if="row.item.responsibleClosureCash">
            ${{ formatPrice(row.item.responsibleClosureCash) }}
          </span>
          <span v-else class="text-muted">-</span>
        </template>

        <template #cell(cashDifference)="row">
          <span :class="getDifferenceClass(row.item.cashDifference)">
            ${{ formatPrice(row.item.cashDifference || 0) }}
          </span>
        </template>

        <template #cell(actions)="row">
          <b-button variant="primary" size="sm" @click.stop="viewSessionDetails(row.item)">
            View Details
          </b-button>
        </template>
      </b-table>
    </b-card>

    <!-- Session Details Modal -->
    <b-modal
      v-model="showDetailsModal"
      title="Session Details"
      size="xl"
      @hide="resetDetailsForm"
    >
      <div v-if="sessionDetails" class="session-details">
        <!-- Session Info -->
        <b-card class="mb-3">
          <h5>Session Information</h5>
          <b-row>
            <b-col cols="12" md="6">
              <p><strong>Session Number:</strong> {{ sessionDetails.session.sessionNumber }}</p>
              <p><strong>Cashier:</strong> {{ sessionDetails.session.cashierName }}</p>
              <p><strong>Opened At:</strong> {{ formatDateTime(sessionDetails.session.openedAt) }}</p>
              <p><strong>Closed At:</strong> {{ formatDateTime(sessionDetails.session.closedAt) || '-' }}</p>
            </b-col>
            <b-col cols="12" md="6">
              <p><strong>Status:</strong> 
                <b-badge :variant="getStatusBadgeVariant(sessionDetails.session.status)">
                  {{ sessionDetails.session.status }}
                </b-badge>
              </p>
              <p><strong>Opening Cash:</strong> ${{ formatPrice(sessionDetails.session.openingCash) }}</p>
              <p><strong>Real Cash:</strong> ${{ formatPrice(sessionDetails.session.realCash) }}</p>
              <p><strong>POS User Closure Cash:</strong> ${{ formatPrice(sessionDetails.session.posUserClosureCash) }}</p>
              <p v-if="sessionDetails.session.responsibleClosureCash">
                <strong>Responsible Closure Cash:</strong> ${{ formatPrice(sessionDetails.session.responsibleClosureCash) }}
              </p>
              <p><strong>Sales Count:</strong> {{ sessionDetails.salesCount }}</p>
              <p><strong>Total Sales:</strong> ${{ formatPrice(sessionDetails.totalSalesAmount) }}</p>
            </b-col>
          </b-row>
        </b-card>

        <!-- Cash Count Lines (POS User) -->
        <b-card class="mb-3" v-if="posUserCashCounts.length > 0">
          <h5>Cash Count - POS User</h5>
          <b-table
            :items="posUserCashCounts"
            :fields="cashCountFields"
            small
            striped
          >
            <template #cell(paymentMethod)="row">
              {{ row.item.paymentMethod ? row.item.paymentMethod.name : 'Cash' }}
            </template>
            <template #cell(lineTotal)="row">
              ${{ formatPrice(row.item.lineTotal) }}
            </template>
            <template #cell(counterType)="row">
              <b-badge variant="info">{{ row.item.counterType }}</b-badge>
            </template>
          </b-table>
          <div class="mt-2">
            <strong>Total: ${{ formatPrice(posUserCashCountsTotal) }}</strong>
          </div>
        </b-card>

        <!-- Cash Count Lines (Responsible) -->
        <b-card class="mb-3" v-if="responsibleCashCounts.length > 0">
          <h5>Cash Count - Responsible</h5>
          <b-table
            :items="responsibleCashCounts"
            :fields="cashCountFields"
            small
            striped
          >
            <template #cell(paymentMethod)="row">
              {{ row.item.paymentMethod ? row.item.paymentMethod.name : 'Cash' }}
            </template>
            <template #cell(lineTotal)="row">
              ${{ formatPrice(row.item.lineTotal) }}
            </template>
            <template #cell(counterType)="row">
              <b-badge variant="warning">{{ row.item.counterType }}</b-badge>
            </template>
          </b-table>
          <div class="mt-2">
            <strong>Total: ${{ formatPrice(responsibleCashCountsTotal) }}</strong>
          </div>
        </b-card>
      </div>
    </b-modal>
  </div>
</template>

<script>
import moment from 'moment'
import ToastificationContent from '@core/components/toastification/ToastificationContent.vue'

export default {
  name: 'SessionHistory',
  data() {
    return {
      sessions: [],
      loading: false,
      showDetailsModal: false,
      sessionDetails: null,
      sortBy: 'openedAt',
      sortDesc: true,
      filters: {
        search: '',
        dateFrom: '',
        dateTo: '',
        status: 'TERMINATED'
      },
      statusOptions: [
        { value: null, text: 'All Status' },
        { value: 'TERMINATED', text: 'Terminated' }
      ],
      sessionFields: [
        { key: 'sessionNumber', label: 'Session #', sortable: true },
        { key: 'cashierFullName', label: 'Cashier', sortable: true },
        { key: 'status', label: 'Status', sortable: true },
        { key: 'openedAt', label: 'Opened At', sortable: true },
        { key: 'closedAt', label: 'Closed At', sortable: true },
        { key: 'salesCount', label: 'Sales', sortable: true },
        { key: 'totalSalesAmount', label: 'Total Sales', sortable: true },
        { key: 'realCash', label: 'Real Cash', sortable: true },
        { key: 'posUserClosureCash', label: 'POS Closure', sortable: true },
        { key: 'responsibleClosureCash', label: 'Resp Closure', sortable: true },
        { key: 'cashDifference', label: 'Difference', sortable: true },
        { key: 'actions', label: 'Actions', sortable: false }
      ],
      cashCountFields: [
        { key: 'denominationValue', label: 'Value' },
        { key: 'quantity', label: 'Qty' },
        { key: 'paymentMethod', label: 'Payment Method' },
        { key: 'referenceNumber', label: 'Reference' },
        { key: 'lineTotal', label: 'Total' },
        { key: 'counterType', label: 'Counter' }
      ]
    }
  },
  computed: {
    filteredSessions() {
      let filtered = this.sessions.filter(session => session.status === 'TERMINATED')

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

      return filtered
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
        this.sessions = response.data
      } catch (error) {
        console.error('Error loading sessions:', error)
        this.$toast({
          component: ToastificationContent,
          props: {
            title: 'Error',
            icon: 'AlertCircleIcon',
            text: 'Failed to load sessions',
            variant: 'danger'
          }
        })
      } finally {
        this.loading = false
      }
    },
    onFilterChange() {
      // Filtering happens in computed property, so no action needed
    },
    clearSearch() {
      this.filters.search = ''
    },
    resetFilters() {
      this.filters = {
        search: '',
        dateFrom: '',
        dateTo: '',
        status: 'TERMINATED'
      }
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
            text: 'Failed to load session details',
            variant: 'danger'
          }
        })
      }
    },
    resetDetailsForm() {
      this.sessionDetails = null
    },
    formatPrice(price) {
      if (!price && price !== 0) return '0.00'
      return parseFloat(price).toFixed(2)
    },
    formatDateTime(dateString) {
      if (!dateString) return null
      return moment(dateString).format('YYYY-MM-DD HH:mm:ss')
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

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.cursor-pointer {
  cursor: pointer;
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

