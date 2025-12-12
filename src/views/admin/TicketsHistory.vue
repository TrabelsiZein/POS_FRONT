<template>
  <div class="tickets-history-container">
    <div class="page-header">
      <h2 class="mb-0">Tickets History</h2>
      <b-button variant="outline-primary" @click="loadTickets">
        <feather-icon icon="RefreshCwIcon" size="16" />
        Refresh
      </b-button>
    </div>

    <!-- Filters and Search -->
    <b-card class="mb-2">
      <div @click="toggleFilters" role="button" tabindex="0" @keyup.enter="toggleFilters">
        <div class="d-flex align-items-center justify-content-between">
          <div class="d-flex align-items-center">
            <feather-icon icon="FilterIcon" size="18" class="mr-2 text-primary" />
            <h6 class="mb-0 text-primary font-weight-bold">
              Filters
              <span class="text-muted font-weight-normal ml-2">(Total: {{ totalRows }} {{ totalRows === 1 ? 'ticket' : 'tickets' }})</span>
            </h6>
          </div>
          <feather-icon :icon="filtersExpanded ? 'ChevronUpIcon' : 'ChevronDownIcon'" size="20" class="text-primary" />
        </div>
      </div>
      <b-collapse v-model="filtersExpanded" id="filters-collapse">
        <div class="pt-2">
          <!-- First Row: Search and Date Filters -->
          <b-row>
            <b-col cols="12" sm="6" md="6" lg="6" class="mb-2">
              <b-form-group label="Search" label-for="search-input" class="mb-0">
                <b-input-group>
                  <b-input-group-prepend>
                    <b-input-group-text class="bg-white">
                      <feather-icon icon="SearchIcon" size="16" />
                    </b-input-group-text>
                  </b-input-group-prepend>
                  <b-form-input id="search-input" v-model="filters.search"
                    placeholder="Search by ticket number, customer name..." @input="onFilterChange" />
                  <b-input-group-append>
                    <b-button variant="outline-secondary" @click="clearSearch" :disabled="!filters.search">
                      <feather-icon icon="XIcon" size="14" />
                    </b-button>
                  </b-input-group-append>
                </b-input-group>
              </b-form-group>
            </b-col>
            <b-col cols="12" sm="6" md="3" lg="3" class="mb-2">
              <b-form-group label="Date From" label-for="date-from" class="mb-0">
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
              <b-form-group label="Date To" label-for="date-to" class="mb-0">
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
          <!-- Second Row: Status Filters -->
          <b-row>
            <b-col cols="12" sm="6" md="4" lg="4" class="mb-2">
              <b-form-group label="Status" label-for="status-filter" class="mb-0">
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
              <b-form-group label="Sync Status" label-for="sync-status-filter" class="mb-0">
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
            <b-col cols="12" sm="6" md="4" lg="4" class="mb-2">
              <b-form-group label="Payment Method" label-for="payment-method-filter" class="mb-0">
                <b-input-group>
                  <b-input-group-prepend>
                    <b-input-group-text class="bg-white">
                      <feather-icon icon="CreditCardIcon" size="16" />
                    </b-input-group-text>
                  </b-input-group-prepend>
                  <b-form-select id="payment-method-filter" v-model="filters.paymentMethodId" :options="paymentMethodOptions"
                    @input="onFilterChange" />
                </b-input-group>
              </b-form-group>
            </b-col>
            <b-col cols="12" sm="6" md="4" lg="4" class="mb-2">
              <b-form-group label="Family" label-for="family-filter" class="mb-0">
                <b-input-group>
                  <b-input-group-prepend>
                    <b-input-group-text class="bg-white">
                      <feather-icon icon="LayersIcon" size="16" />
                    </b-input-group-text>
                  </b-input-group-prepend>
                  <b-form-select
                    id="family-filter"
                    v-model="filters.familyId"
                    :options="familyOptions"
                    @input="onFamilyChange"
                  />
                </b-input-group>
              </b-form-group>
            </b-col>
            <b-col cols="12" sm="6" md="4" lg="4" class="mb-2">
              <b-form-group label="Subfamily" label-for="subfamily-filter" class="mb-0">
                <b-input-group>
                  <b-input-group-prepend>
                    <b-input-group-text class="bg-white">
                      <feather-icon icon="GridIcon" size="16" />
                    </b-input-group-text>
                  </b-input-group-prepend>
                  <b-form-select
                    id="subfamily-filter"
                    v-model="filters.subFamilyId"
                    :options="subFamilyOptions"
                    :disabled="filters.familyId === 'all'"
                    @input="onSubFamilyChange"
                  />
                </b-input-group>
              </b-form-group>
            </b-col>
          </b-row>
        </div>
      </b-collapse>
    </b-card>

    <!-- Tickets Table -->
    <b-card>
      <b-table :items="tickets" :fields="ticketFields" striped hover responsive :busy="loading" :sort-by="sortBy"
        :sort-desc="sortDesc" @row-clicked="viewTicketDetails" class="cursor-pointer" show-empty>
        <template #table-busy>
          <div class="text-center my-2">
            <b-spinner class="align-middle"></b-spinner>
            <strong>Loading...</strong>
          </div>
        </template>

        <template #empty>
          <div class="text-center text-muted py-4">
            <p>No tickets found</p>
            <p class="small">Try adjusting your filters</p>
          </div>
        </template>

        <template #cell(salesNumber)="row">
          <strong class="text-primary">{{ row.item.salesNumber }}</strong>
        </template>

        <template #cell(salesDate)="row">
          {{ formatDate(row.item.salesDate) }}
        </template>

        <template #cell(customer)="row">
          <div v-if="row.item.customer">
            <div><strong>{{ row.item.customer.name }}</strong></div>
            <small class="text-muted">{{ row.item.customer.customerCode }}</small>
          </div>
          <span v-else class="text-muted">-</span>
        </template>

        <template #cell(totalAmount)="row">
          <strong>{{ formatPrice(row.item.totalAmount) }} TND</strong>
        </template>

        <template #cell(status)="row">
          <b-badge :variant="getStatusVariant(row.item.status)">
            {{ row.item.status }}
          </b-badge>
        </template>

        <template #cell(synchronizationStatus)="row">
          <div class="sync-status-cell">
            <b-badge :variant="getSyncStatusVariant(row.item.synchronizationStatus)" class="sync-badge">
              <feather-icon :icon="getSyncStatusIcon(row.item.synchronizationStatus)" size="12" class="mr-1" />
              {{ formatSyncStatus(row.item.synchronizationStatus) }}
            </b-badge>
            <small v-if="row.item.erpNo" class="text-muted d-block mt-1">
              ERP: {{ row.item.erpNo }}
            </small>
          </div>
        </template>
      </b-table>

      <!-- Pagination -->
      <div class="mt-3">
        <b-row align-v="center">
          <b-col cols="12" md="6" class="mb-2 mb-md-0">
            <div class="d-flex align-items-center">
              <label for="per-page-select" class="mr-2 mb-0">Items per page:</label>
              <b-form-select id="per-page-select" v-model="perPage" :options="perPageOptions" size="sm"
                style="width: auto;" @change="onPerPageChange" />
            </div>
          </b-col>
          <b-col cols="12" md="6">
            <div class="text-center text-md-right">
              <small class="text-muted">
                Showing {{ startIndex }} to {{ endIndex }} of {{ totalRows }} tickets
              </small>
            </div>
          </b-col>
        </b-row>
        <div class="d-flex justify-content-center mt-2">
          <b-pagination v-model="currentPage" :total-rows="totalRows" :per-page="perPage" align="center" />
        </div>
      </div>
    </b-card>

    <!-- Ticket Details Modal -->
    <b-modal id="ticket-details-modal" v-model="showDetailsModal" title="Ticket Details" size="xl"
      @hide="resetDetailsModal" scrollable>
      <div v-if="selectedTicket" class="ticket-details">
        <!-- Ticket Header Info -->
        <b-card class="mb-3">
          <b-row>
            <b-col md="6">
              <div class="detail-item">
                <strong>Ticket Number:</strong>
                <span class="ml-2">{{ selectedTicket.salesNumber }}</span>
              </div>
              <div class="detail-item">
                <strong>Date:</strong>
                <span class="ml-2">{{ formatDateTime(selectedTicket.salesDate) }}</span>
              </div>
              <div class="detail-item" v-if="selectedTicket.completedDate">
                <strong>Completed:</strong>
                <span class="ml-2">{{ formatDateTime(selectedTicket.completedDate) }}</span>
              </div>
              <div class="detail-item">
                <strong>Status:</strong>
                <b-badge :variant="getStatusVariant(selectedTicket.status)" class="ml-2">
                  {{ selectedTicket.status }}
                </b-badge>
              </div>
            </b-col>
            <b-col md="6">
              <div class="detail-item" v-if="selectedTicket.customer">
                <strong>Customer:</strong>
                <span class="ml-2">
                  {{ selectedTicket.customer.name }}
                  <small class="text-muted">({{ selectedTicket.customer.customerCode }})</small>
                </span>
              </div>
              <div class="detail-item" v-if="selectedTicket.createdByUser">
                <strong>Cashier:</strong>
                <span class="ml-2">{{ selectedTicket.createdByUser.fullName || selectedTicket.createdByUser.username
                  }}</span>
              </div>
              <div class="detail-item" v-if="selectedTicket.cashierSession">
                <strong>Session:</strong>
                <span class="ml-2">{{ selectedTicket.cashierSession.sessionNumber }}</span>
              </div>
            </b-col>
          </b-row>
        </b-card>

        <!-- Synchronization Information -->
        <b-card class="mb-3 sync-info-card">
          <div class="d-flex align-items-center mb-3">
            <feather-icon icon="CloudIcon" size="20" class="mr-2 text-primary" />
            <h5 class="mb-0">ERP Synchronization</h5>
          </div>
          <b-row>
            <b-col md="6">
              <div class="sync-detail-item">
                <label class="sync-label">Synchronization Status</label>
                <div class="sync-value">
                  <b-badge :variant="getSyncStatusVariant(selectedTicket.synchronizationStatus)" class="sync-badge-large">
                    <feather-icon :icon="getSyncStatusIcon(selectedTicket.synchronizationStatus)" size="14" class="mr-1" />
                    {{ formatSyncStatus(selectedTicket.synchronizationStatus) }}
                  </b-badge>
                </div>
              </div>
            </b-col>
            <b-col md="6">
              <div class="sync-detail-item">
                <label class="sync-label">ERP Document Number</label>
                <div class="sync-value">
                  <code v-if="selectedTicket.erpNo" class="erp-number">{{ selectedTicket.erpNo }}</code>
                  <span v-else class="text-muted">Not synchronized</span>
                </div>
              </div>
            </b-col>
          </b-row>
          <div v-if="selectedTicket.salesLines" class="mt-3">
            <div class="sync-summary">
              <small class="text-muted">
                Lines synchronized: 
                <strong>{{ getSyncedLinesCount(selectedTicket.salesLines) }} / {{ selectedTicket.salesLines.length }}</strong>
              </small>
            </div>
          </div>
        </b-card>

        <!-- Sales Lines -->
        <b-card class="mb-3">
          <h5 class="mb-3">Items</h5>
          <b-table :items="selectedTicket.salesLines || []" :fields="lineFields" striped small responsive class="sales-lines-table">
            <template #cell(item)="row">
              <div>
                <strong>{{ row.item.item.name }}</strong>
                <div class="small text-muted">{{ row.item.item.itemCode }}</div>
              </div>
            </template>
            <template #cell(quantity)="row">
              {{ row.item.quantity }}
            </template>
            <template #cell(unitPrice)="row">
              {{ formatPrice(row.item.unitPrice) }} TND
            </template>
            <template #cell(discount)="row">
              <div v-if="row.item.discountPercentage || row.item.discountAmount">
                <div v-if="row.item.discountPercentage" class="text-primary">
                  {{ formatPrice(row.item.discountPercentage) }}%
                </div>
                <div v-if="row.item.discountAmount" class="text-muted small">
                  -{{ formatPrice(row.item.discountAmount) }} TND
                </div>
              </div>
              <span v-else class="text-muted">—</span>
            </template>
            <template #cell(vat)="row">
              <div v-if="row.item.vatPercent || row.item.vatAmount">
                <div v-if="row.item.vatPercent" class="text-info">
                  {{ row.item.vatPercent }}%
                </div>
                <div v-if="row.item.vatAmount" class="text-muted small">
                  {{ formatPrice(row.item.vatAmount) }} TND
                </div>
              </div>
              <span v-else class="text-muted">—</span>
            </template>
            <template #cell(unitPriceIncludingVat)="row">
              <strong>{{ formatPrice(row.item.unitPriceIncludingVat) }} TND</strong>
            </template>
            <template #cell(lineTotalIncludingVat)="row">
              <strong class="text-success">{{ formatPrice(row.item.lineTotalIncludingVat) }} TND</strong>
            </template>
            <template #cell(synched)="row">
              <b-badge :variant="row.item.synched ? 'success' : 'secondary'" class="sync-indicator">
                <feather-icon :icon="row.item.synched ? 'CheckIcon' : 'XIcon'" size="12" class="mr-1" />
                {{ row.item.synched ? 'Synced' : 'Not Synced' }}
              </b-badge>
            </template>
          </b-table>
        </b-card>

        <!-- Payments -->
        <b-card class="mb-3" v-if="selectedTicket.payments && selectedTicket.payments.length > 0">
          <h5 class="mb-3">Payments</h5>
          <b-table :items="selectedTicket.payments" :fields="paymentFields" striped small responsive>
            <template #cell(paymentMethod)="row">
              {{ row.item.paymentMethod ? row.item.paymentMethod.name : '-' }}
            </template>
            <template #cell(amount)="row">
              <strong>{{ formatPrice(row.item.totalAmount) }} TND</strong>
            </template>
            <template #cell(reference)="row">
              {{ row.item.paymentReference || '-' }}
            </template>
            <template #cell(synched)="row">
              <b-badge :variant="row.item.synched ? 'success' : 'secondary'" class="sync-indicator">
                <feather-icon :icon="row.item.synched ? 'CheckIcon' : 'XIcon'" size="12" class="mr-1" />
                {{ row.item.synched ? 'Synced' : 'Not Synced' }}
              </b-badge>
            </template>
          </b-table>
        </b-card>

        <!-- Summary -->
        <b-card>
          <h5 class="mb-3">Summary</h5>
          <b-row>
            <b-col md="6" offset-md="6">
              <div class="summary-row">
                <span>Subtotal:</span>
                <span>{{ formatPrice(selectedTicket.subtotal) }} TND</span>
              </div>
              <div class="summary-row" v-if="selectedTicket.taxAmount">
                <span>Tax:</span>
                <span>{{ formatPrice(selectedTicket.taxAmount) }} TND</span>
              </div>
              <div class="summary-row" v-if="selectedTicket.discountAmount">
                <span>Discount:</span>
                <span>-{{ formatPrice(selectedTicket.discountAmount) }} TND</span>
              </div>
              <div class="summary-row total">
                <span><strong>Total:</strong></span>
                <span><strong>{{ formatPrice(selectedTicket.totalAmount) }} TND</strong></span>
              </div>
              <div class="summary-row" v-if="selectedTicket.paidAmount">
                <span>Paid:</span>
                <span class="text-success">{{ formatPrice(selectedTicket.paidAmount) }} TND</span>
              </div>
              <div class="summary-row" v-if="selectedTicket.changeAmount">
                <span>Change:</span>
                <span class="text-info">{{ formatPrice(selectedTicket.changeAmount) }} TND</span>
              </div>
            </b-col>
          </b-row>
          <div v-if="selectedTicket.notes" class="mt-3">
            <strong>Notes:</strong>
            <p class="text-muted">{{ selectedTicket.notes }}</p>
          </div>
        </b-card>
      </div>
      <template #modal-footer>
        <b-button variant="secondary" @click="showDetailsModal = false">
          Close
        </b-button>
        <b-button variant="primary" @click="printTicket" :disabled="loading">
          <feather-icon icon="PrinterIcon" size="16" />
          Print Duplicate
        </b-button>
      </template>
    </b-modal>

  </div>
</template>

<script>
import ToastificationContent from '@core/components/toastification/ToastificationContent.vue'
import ReceiptTemplate from '@/components/ReceiptTemplate.vue'
import JsBarcode from 'jsbarcode'

export default {
  name: 'TicketsHistory',
  data() {
    // Get today's date for default filter
    const today = new Date()
    const todayStr = today.toISOString().split('T')[0]

    return {
      tickets: [],
      allTickets: [], // Store all tickets for pagination
      filteredTickets: [],
      loading: false,
      sortBy: 'salesDate',
      sortDesc: true,
      showDetailsModal: false,
      selectedTicket: null,
      filtersExpanded: false,
      currentPage: 1,
      perPage: 10,
      perPageOptions: [
        { value: 10, text: '10' },
        { value: 20, text: '20' },
        { value: 50, text: '50' },
        { value: 100, text: '100' }
      ],
      paymentMethods: [],
      families: [],
      subFamilies: [],
      filters: {
        search: '',
        dateFrom: todayStr,
        dateTo: todayStr,
        status: 'all',
        syncStatus: 'all',
        paymentMethodId: 'all',
        familyId: 'all',
        subFamilyId: 'all'
      },
      statusOptions: [
        { value: 'all', text: 'All' },
        { value: 'COMPLETED', text: 'Completed' },
        { value: 'PENDING', text: 'Pending' },
        { value: 'CANCELLED', text: 'Cancelled' }
      ],
      syncStatusOptions: [
        { value: 'all', text: 'All' },
        { value: 'NOT_SYNCHED', text: 'Not Synced' },
        { value: 'PARTIALLY_SYNCHED', text: 'Partially Synced' },
        { value: 'TOTALLY_SYNCHED', text: 'Totally Synced' }
      ],
      ticketFields: [
        { key: 'salesNumber', label: 'Ticket #', sortable: true },
        { key: 'salesDate', label: 'Date', sortable: true },
        { key: 'customer', label: 'Customer', sortable: false },
        { key: 'totalAmount', label: 'Total', sortable: true },
        { key: 'status', label: 'Status', sortable: true },
        { key: 'synchronizationStatus', label: 'Sync Status', sortable: true }
      ],
      lineFields: [
        { key: 'item', label: 'Item' },
        { key: 'quantity', label: 'Qty' },
        { key: 'unitPrice', label: 'Unit Price HT' },
        { key: 'discount', label: 'Discount' },
        { key: 'vat', label: 'VAT' },
        { key: 'unitPriceIncludingVat', label: 'Unit Price TTC' },
        { key: 'lineTotalIncludingVat', label: 'Total TTC' },
        { key: 'synched', label: 'Synced', class: 'text-center' }
      ],
      paymentFields: [
        { key: 'paymentMethod', label: 'Payment Method' },
        { key: 'amount', label: 'Amount' },
        { key: 'reference', label: 'Reference' },
        { key: 'notes', label: 'Notes' },
        { key: 'synched', label: 'Synced', class: 'text-center' }
      ]
    }
  },
  computed: {
    totalRows() {
      return this.filteredTickets.length
    },
    paymentMethodOptions() {
      return [
        { value: 'all', text: 'All Payment Methods' },
        ...this.paymentMethods.map(pm => ({
          value: pm.id,
          text: pm.name
        }))
      ]
    },
    familyOptions() {
      return [
        { value: 'all', text: 'All Families' },
        ...this.families.map(f => ({ value: f.id, text: f.name }))
      ]
    },
    subFamilyOptions() {
      const options = this.subFamilies
        .filter(sf => this.filters.familyId === 'all' || (sf.itemFamily && sf.itemFamily.id === this.filters.familyId))
        .map(sf => ({ value: sf.id, text: sf.name }))
      return [
        { value: 'all', text: this.filters.familyId === 'all' ? 'Select a family first' : 'All Subfamilies' },
        ...options
      ]
    },
    startIndex() {
      return this.totalRows === 0 ? 0 : ((this.currentPage - 1) * this.perPage) + 1
    },
    endIndex() {
      return Math.min(this.currentPage * this.perPage, this.totalRows)
    }
  },
  watch: {
    currentPage() {
      this.updatePaginatedTickets()
    },
    perPage() {
      // When perPage changes, recalculate pagination
      if (this.currentPage > Math.ceil(this.totalRows / this.perPage)) {
        // If current page is beyond available pages, go to last page
        this.currentPage = Math.max(1, Math.ceil(this.totalRows / this.perPage))
      }
      this.updatePaginatedTickets()
    }
  },
  mounted() {
    this.loadPaymentMethods()
    this.loadFamilies()
    this.loadSubFamilies()
    this.loadTickets()
  },
  methods: {
    async loadFamilies() {
      try {
        const response = await this.$http.get('/item-family')
        this.families = Array.isArray(response.data) ? response.data : []
      } catch (error) {
        console.error('Error loading families:', error)
      }
    },
    async loadSubFamilies() {
      try {
        const response = await this.$http.get('/item-sub-family')
        this.subFamilies = Array.isArray(response.data) ? response.data : []
      } catch (error) {
        console.error('Error loading subfamilies:', error)
      }
    },
    async loadPaymentMethods() {
      try {
        const response = await this.$http.get('/payment-method')
        if (response.status === 200) {
          this.paymentMethods = (response.data || []).filter(pm => pm.active !== false)
        }
      } catch (error) {
        console.error('Error loading payment methods:', error)
      }
    },
    async loadTickets() {
      this.loading = true
      try {
        const params = {}
        if (this.filters.search) params.search = this.filters.search
        if (this.filters.dateFrom) params.dateFrom = this.filters.dateFrom
        if (this.filters.dateTo) params.dateTo = this.filters.dateTo
        if (this.filters.status && this.filters.status !== 'all') params.status = this.filters.status
        if (this.filters.syncStatus && this.filters.syncStatus !== 'all') params.syncStatus = this.filters.syncStatus
        if (this.filters.paymentMethodId && this.filters.paymentMethodId !== 'all') params.paymentMethodId = this.filters.paymentMethodId

        const response = await this.$http.get('/sales-header/history', { params })

        if (response.status === 200) {
          this.allTickets = response.data || []
          this.applyLocalFilters()
          // Reset to first page on new filter
          if (this.currentPage !== 1) {
            this.currentPage = 1
          } else {
            // If already on page 1, still need to update paginated tickets
            this.updatePaginatedTickets()
          }
        }
      } catch (error) {
        console.error('Error loading tickets:', error)
        this.$toast({
          component: ToastificationContent,
          props: {
            title: 'Error',
            icon: 'XIcon',
            text: 'Failed to load tickets. Please try again.',
            variant: 'danger'
          }
        })
      } finally {
        this.loading = false
      }
    },
    updatePaginatedTickets() {
      // Ensure allTickets exists
      if (!this.filteredTickets) {
        this.filteredTickets = []
      }

      if (this.filteredTickets.length === 0) {
        this.tickets = []
        return
      }

      // Ensure currentPage is valid
      const maxPage = Math.max(1, Math.ceil(this.filteredTickets.length / this.perPage))
      if (this.currentPage > maxPage) {
        this.currentPage = maxPage
        // Recursive call is not safe, use nextTick instead
        this.$nextTick(() => {
          this.updatePaginatedTickets()
        })
        return
      }
      if (this.currentPage < 1) {
        this.currentPage = 1
      }

      const start = (this.currentPage - 1) * this.perPage
      const end = start + this.perPage
      this.tickets = this.filteredTickets.slice(start, end)

      // Scroll to top of page on page change
      this.$nextTick(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' })
      })
    },
    onPerPageChange() {
      // Reset to first page when changing items per page
      this.currentPage = 1
      this.updatePaginatedTickets()
    },
    async viewTicketDetails(ticket) {
      this.loading = true
      try {
        const response = await this.$http.get(`/sales-header/${ticket.id}/details`)
        if (response.status === 200) {
          this.selectedTicket = response.data
          this.showDetailsModal = true
        }
      } catch (error) {
        console.error('Error loading ticket details:', error)
        this.$toast({
          component: ToastificationContent,
          props: {
            title: 'Error',
            icon: 'XIcon',
            text: 'Failed to load ticket details. Please try again.',
            variant: 'danger'
          }
        })
      } finally {
        this.loading = false
      }
    },
    resetDetailsModal() {
      this.selectedTicket = null
    },
    onFilterChange() {
      this.loadTickets()
    },
    onFamilyChange() {
      // Reset subfamily when family changes
      this.filters.subFamilyId = 'all'
      this.applyLocalFilters()
    },
    onSubFamilyChange() {
      this.applyLocalFilters()
    },
    applyLocalFilters() {
      const hasFamilyFilter = this.filters.familyId !== 'all'
      const hasSubFamilyFilter = this.filters.subFamilyId !== 'all'

      if (!hasFamilyFilter && !hasSubFamilyFilter) {
        this.filteredTickets = [...this.allTickets]
        this.updatePaginatedTickets()
        return
      }

      this.filteredTickets = this.allTickets.filter(ticket => {
        const lines = Array.isArray(ticket.salesLines) ? ticket.salesLines : []
        if (lines.length === 0) {
          return !hasFamilyFilter && !hasSubFamilyFilter
        }

        return lines.some(line => {
          const item = line.item || {}
          const familyId = item.itemFamily?.id || item.itemFamilyId
          const subFamilyId = item.itemSubFamily?.id || item.itemSubFamilyId
          const familyMatch = !hasFamilyFilter || familyId === this.filters.familyId
          const subFamilyMatch = !hasSubFamilyFilter || subFamilyId === this.filters.subFamilyId
          return familyMatch && subFamilyMatch
        })
      })

      this.currentPage = 1
      this.updatePaginatedTickets()
    },
    clearSearch() {
      this.filters.search = ''
      this.loadTickets()
    },
    toggleFilters() {
      this.filtersExpanded = !this.filtersExpanded
    },
    resetFilters() {
      const today = new Date()
      const todayStr = today.toISOString().split('T')[0]
      this.filters = {
        search: '',
        dateFrom: todayStr,
        dateTo: todayStr,
        status: 'all',
        syncStatus: 'all',
        paymentMethodId: 'all'
      }
      this.loadTickets()
    },
    formatDate(dateStr) {
      if (!dateStr) return '-'
      const date = new Date(dateStr)
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    },
    formatDateTime(dateStr) {
      if (!dateStr) return '-'
      const date = new Date(dateStr)
      return date.toLocaleString()
    },
    formatPrice(price) {
      if (!price) return '0.00'
      return parseFloat(price).toFixed(2)
    },
    getStatusVariant(status) {
      switch (status) {
        case 'COMPLETED':
          return 'success'
        case 'PENDING':
          return 'warning'
        case 'CANCELLED':
          return 'danger'
        default:
          return 'secondary'
      }
    },
    formatSyncStatus(status) {
      if (!status) return 'Not Synced'
      return status
        .split('_')
        .map(word => word.charAt(0) + word.slice(1).toLowerCase())
        .join(' ')
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
    getSyncedLinesCount(lines) {
      if (!lines || !Array.isArray(lines)) return 0
      return lines.filter(line => line.synched === true).length
    },
    printTicket() {
      if (!this.selectedTicket) return
      this.printTicketData(this.selectedTicket)
    },
    async printTicketData(ticketData) {
      if (!ticketData) return

      console.log('Printing duplicate ticket:', ticketData)

      // Use Vue to create component instance
      const Vue = this.$root.constructor || this.$options._base
      const ReceiptComponent = Vue.extend(ReceiptTemplate)

      // Create component instance with isDuplicate prop
      const instance = new ReceiptComponent({
        parent: this,
        propsData: {
          saleData: ticketData,
          isDuplicate: true
        }
      })

      // Mount the component
      instance.$mount()

      // Wait for component to mount and generate barcode
      await this.$nextTick()
      await new Promise(resolve => setTimeout(resolve, 200))

      // Generate barcode in the component if sales_number exists
      const barcodeValue = ticketData.salesNumber || null
      if (barcodeValue && instance.$el) {
        try {
          const svgElement = instance.$el.querySelector('.barcode-svg')
          if (svgElement) {
            JsBarcode(svgElement, barcodeValue, {
              format: 'CODE128',
              width: 1.5,
              height: 40,
              displayValue: false,
              margin: 5,
              background: '#ffffff',
              lineColor: '#000000'
            })
          }
        } catch (error) {
          console.error('Error generating barcode:', error)
        }
      }

      // Create a new window for printing
      const printWindow = window.open('', '_blank')
      if (!printWindow) {
        this.$toast({
          component: ToastificationContent,
          props: {
            title: 'Print Error',
            icon: 'XIcon',
            text: 'Please allow popups to print receipts',
            variant: 'warning'
          }
        })
        return
      }

      // Write receipt HTML to new window
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Receipt - ${ticketData.salesNumber} - DUPLICATE</title>
          <style>
            @page {
              size: 80mm auto;
              margin: 0;
            }
            body {
              margin: 0;
              padding: 10mm;
              font-family: 'Courier New', monospace;
              font-size: 12px;
              line-height: 1.4;
              background: white;
              color: black;
            }
            .receipt-template {
              width: 100%;
              max-width: 80mm;
            }
            .receipt-header { margin-bottom: 15px; }
            .receipt-header h2 { font-size: 16px; margin: 5px 0; font-weight: bold; text-align: center; }
            .receipt-header h3 { font-size: 14px; margin: 5px 0; font-weight: bold; text-align: center; }
            .duplicate-badge { 
              background: #ff0000 !important; 
              color: white !important; 
              font-weight: bold !important; 
              text-align: center !important; 
              padding: 10px !important; 
              margin: 10px 0 !important;
              font-size: 18px !important;
              border: 3px solid #000 !important;
              letter-spacing: 2px !important;
            }
            .receipt-divider { margin: 8px 0; text-align: center; }
            .receipt-info, .receipt-items, .receipt-totals, .receipt-payments { margin-bottom: 10px; }
            .receipt-row { display: flex; justify-content: space-between; margin-bottom: 4px; font-size: 12px; }
            .receipt-row.total { font-weight: bold; font-size: 14px; margin-top: 8px; }
            .receipt-row .label { text-align: left; }
            .receipt-row .value { text-align: right; font-weight: bold; }
            .item-name { flex: 2; text-align: left; }
            .item-qty { flex: 0.5; text-align: center; }
            .item-total { flex: 1; text-align: right; }
            .item-code { font-size: 10px; color: #666; margin-left: 10px; margin-bottom: 6px; }
            .receipt-section-header { font-weight: bold; text-align: center; margin: 8px 0; }
            .receipt-footer { margin-top: 20px; text-align: center; font-size: 11px; }
            .receipt-item { margin-bottom: 8px; }
            .payment-entry { margin-bottom: 8px; }
            .receipt-barcode { margin: 15px 0; text-align: center; }
            .barcode-container { display: flex; justify-content: center; align-items: center; margin: 10px 0; }
            .barcode-svg { max-width: 100%; height: auto; }
            .barcode-text { font-size: 11px; font-weight: bold; margin-top: 5px; letter-spacing: 1px; text-align: center; }
          </style>
        </head>
        <body>
          ${instance.$el.outerHTML}
        </body>
        </html>
      `)

      printWindow.document.close()

      // Wait for content to load, then print
      setTimeout(() => {
        printWindow.focus()
        printWindow.print()

        // Close window after printing
        setTimeout(() => {
          printWindow.close()
          if (instance && instance.$el) {
            instance.$destroy()
          }
        }, 1000)
      }, 500)
    }
  }
}
</script>

<style scoped>
.tickets-history-container {
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

.detail-item {
  margin-bottom: 10px;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid #e0e0e0;
}

.summary-row.total {
  border-top: 2px solid #28a745;
  border-bottom: 2px solid #28a745;
  margin-top: 10px;
  padding-top: 10px;
  font-size: 1.1rem;
}

.sync-status-cell {
  min-width: 120px;
}

.sync-badge {
  font-size: 11px;
  padding: 4px 8px;
  display: inline-flex;
  align-items: center;
}

.sync-indicator {
  font-size: 11px;
  padding: 4px 8px;
  display: inline-flex;
  align-items: center;
}

.sync-info-card {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border: 1px solid #dee2e6;
}

.sync-detail-item {
  margin-bottom: 15px;
}

.sync-label {
  font-size: 12px;
  color: #6c757d;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 600;
  margin-bottom: 6px;
  display: block;
}

.sync-value {
  font-size: 14px;
  color: #212529;
}

.sync-badge-large {
  font-size: 13px;
  padding: 6px 12px;
  display: inline-flex;
  align-items: center;
}

.erp-number {
  background: #fff;
  padding: 6px 10px;
  border-radius: 4px;
  border: 1px solid #dee2e6;
  font-size: 13px;
  color: #495057;
  font-weight: 600;
}

.sync-summary {
  padding-top: 12px;
  border-top: 1px solid #dee2e6;
}

/* Sales lines table enhancements */
.sales-lines-table {
  font-size: 13px;
}

.sales-lines-table .table td {
  vertical-align: middle;
  padding: 10px 8px;
}

.sales-lines-table .text-primary {
  font-weight: 600;
}

.sales-lines-table .text-info {
  font-weight: 600;
}

.sales-lines-table .text-success {
  font-weight: 600;
  font-size: 14px;
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

  .sync-status-cell {
    min-width: auto;
  }
}
</style>
