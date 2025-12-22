<template>
  <div class="returns-management-container">
    <div class="page-header">
      <h2 class="mb-0">{{ $t('admin.returnsManagement.title') }}</h2>
      <b-button variant="outline-primary" @click="loadReturns">
        <feather-icon icon="RefreshCwIcon" size="16" />
        {{ $t('admin.returnsManagement.refresh') }}
      </b-button>
    </div>

    <!-- Filters and Search -->
    <b-card class="mb-2">
      <div @click="toggleFilters" role="button" tabindex="0" @keyup.enter="toggleFilters">
        <div class="d-flex align-items-center justify-content-between">
          <div class="d-flex align-items-center">
            <feather-icon icon="FilterIcon" size="18" class="mr-2 text-primary" />
            <h6 class="mb-0 text-primary font-weight-bold">
              {{ $t('admin.returnsManagement.filters') }}
              <span class="text-muted font-weight-normal ml-2">({{ $t('admin.returnsManagement.total') }} {{ totalRows }} {{ totalRows === 1 ? $t('admin.returnsManagement.return') :
                $t('admin.returnsManagement.returns') }})</span>
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
              <b-form-group :label="$t('admin.returnsManagement.search')" label-for="search-input" class="mb-0">
                <b-input-group>
                  <b-input-group-prepend>
                    <b-input-group-text class="bg-white">
                      <feather-icon icon="SearchIcon" size="16" />
                    </b-input-group-text>
                  </b-input-group-prepend>
                  <b-form-input id="search-input" v-model="filters.search"
                    :placeholder="$t('admin.returnsManagement.searchPlaceholder')" @input="onFilterChange" />
                  <b-input-group-append>
                    <b-button variant="outline-secondary" @click="clearSearch" :disabled="!filters.search">
                      <feather-icon icon="XIcon" size="14" />
                    </b-button>
                  </b-input-group-append>
                </b-input-group>
              </b-form-group>
            </b-col>
            <b-col cols="12" sm="6" md="3" lg="3" class="mb-2">
              <b-form-group :label="$t('admin.returnsManagement.dateFrom')" label-for="date-from" class="mb-0">
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
              <b-form-group :label="$t('admin.returnsManagement.dateTo')" label-for="date-to" class="mb-0">
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
            <b-col cols="12" sm="6" md="3" lg="3" class="mb-2">
              <b-form-group :label="$t('admin.returnsManagement.returnType')" label-for="return-type-filter" class="mb-0">
                <b-input-group>
                  <b-input-group-prepend>
                    <b-input-group-text class="bg-white">
                      <feather-icon icon="TagIcon" size="16" />
                    </b-input-group-text>
                  </b-input-group-prepend>
                  <b-form-select id="return-type-filter" v-model="filters.returnType" :options="returnTypeOptions"
                    @input="onFilterChange" />
                </b-input-group>
              </b-form-group>
            </b-col>
            <b-col cols="12" sm="6" md="3" lg="3" class="mb-2">
              <b-form-group :label="$t('admin.returnsManagement.voucherStatus')" label-for="voucher-status-filter" class="mb-0">
                <b-input-group>
                  <b-input-group-prepend>
                    <b-input-group-text class="bg-white">
                      <feather-icon icon="CreditCardIcon" size="16" />
                    </b-input-group-text>
                  </b-input-group-prepend>
                  <b-form-select id="voucher-status-filter" v-model="filters.voucherStatus"
                    :options="voucherStatusOptions" @input="onFilterChange" />
                </b-input-group>
              </b-form-group>
            </b-col>
            <b-col cols="12" sm="6" md="3" lg="3" class="mb-2">
              <b-form-group :label="$t('admin.returnsManagement.syncStatus')" label-for="sync-status-filter" class="mb-0">
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

    <!-- Returns Table -->
    <b-card>
      <b-table :items="returns" :fields="returnFields" striped hover responsive :busy="loading" :sort-by="sortBy"
        :sort-desc="sortDesc" @row-clicked="viewReturnDetails" class="cursor-pointer" show-empty>
        <template #table-busy>
          <div class="text-center text-danger my-2">
            <b-spinner class="align-middle"></b-spinner>
            <strong> {{ $t('admin.returnsManagement.loadingText') }}</strong>
          </div>
        </template>

        <template #empty>
          <div class="text-center py-4">
            <p class="text-muted">{{ $t('admin.returnsManagement.noReturns') }}</p>
          </div>
        </template>

        <template #cell(returnNumber)="row">
          <strong>{{ row.item.returnNumber }}</strong>
        </template>

        <template #cell(returnDate)="row">
          {{ formatDate(row.item.returnDate) }}
        </template>

        <template #cell(returnType)="row">
          <b-badge :variant="row.item.returnType === 'SIMPLE_RETURN' ? 'danger' : 'info'">
            {{ row.item.returnType === 'SIMPLE_RETURN' ? $t('admin.returnsManagement.simpleReturn') : $t('admin.returnsManagement.returnVoucher') }}
          </b-badge>
        </template>

        <template #cell(totalReturnAmount)="row">
          <strong>{{ formatTunCurrency(row.item.totalReturnAmount) }}</strong>
        </template>

        <template #cell(originalTicket)="row">
          <span v-if="row.item.originalSalesHeader">
            {{ row.item.originalSalesHeader.salesNumber }}
          </span>
          <span v-else class="text-muted">{{ $t('admin.returnsManagement.nA') }}</span>
        </template>

        <template #cell(voucherInfo)="row">
          <div v-if="row.item.returnVoucher">
            <div><strong>{{ row.item.returnVoucher.voucherNumber }}</strong></div>
            <div class="small text-muted">
              <span v-if="row.item.returnVoucher.status === 'PENDING'">
                {{ $t('admin.returnsManagement.remaining') }} {{ formatTunCurrency(getRemainingAmount(row.item.returnVoucher)) }}
              </span>
              <b-badge :variant="getVoucherStatusVariant(row.item.returnVoucher.status)" class="mt-1">
                {{ row.item.returnVoucher.status }}
              </b-badge>
            </div>
          </div>
          <span v-else class="text-muted">-</span>
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
              <label for="per-page-select" class="mr-2 mb-0">{{ $t('admin.returnsManagement.itemsPerPage') }}</label>
              <b-form-select id="per-page-select" v-model="perPage" :options="perPageOptions" size="sm"
                style="width: auto;" @change="onPerPageChange" />
            </div>
          </b-col>
          <b-col cols="12" md="6">
            <div class="text-center text-md-right">
              <small class="text-muted">
                {{ $t('admin.returnsManagement.showing') }} {{ startIndex }} {{ $t('admin.returnsManagement.to') }} {{ endIndex }} {{ $t('admin.returnsManagement.of') }} {{ totalRows }} {{ totalRows === 1 ? $t('admin.returnsManagement.return') : $t('admin.returnsManagement.returns') }}
              </small>
            </div>
          </b-col>
        </b-row>
        <div class="d-flex justify-content-center mt-2">
          <b-pagination v-model="currentPage" :total-rows="totalRows" :per-page="perPage" align="center"
            @change="onPageChange" />
        </div>
      </div>
    </b-card>

    <!-- Return Details Modal -->
    <b-modal id="return-details-modal" v-model="showDetailsModal" :title="$t('admin.returnsManagement.modal.returnDetails')" size="xl" hide-footer
      scrollable>
      <div v-if="selectedReturn">
        <!-- Return Header Info -->
        <b-card class="mb-3">
          <h5 class="mb-3">{{ $t('admin.returnsManagement.modal.returnInformation') }}</h5>
          <b-row>
            <b-col cols="12" md="6">
              <div class="detail-row">
                <span class="detail-label">{{ $t('admin.returnsManagement.modal.returnNumber') }}</span>
                <span class="detail-value"><strong>{{ selectedReturn.returnNumber }}</strong></span>
              </div>
              <div class="detail-row">
                <span class="detail-label">{{ $t('admin.returnsManagement.modal.returnDate') }}</span>
                <span class="detail-value">{{ formatDate(selectedReturn.returnDate) }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">{{ $t('admin.returnsManagement.modal.returnType') }}</span>
                <span class="detail-value">
                  <b-badge :variant="selectedReturn.returnType === 'SIMPLE_RETURN' ? 'danger' : 'info'">
                    {{ selectedReturn.returnType === 'SIMPLE_RETURN' ? $t('admin.returnsManagement.simpleReturn') : $t('admin.returnsManagement.returnVoucher') }}
                  </b-badge>
                </span>
              </div>
              <div class="detail-row">
                <span class="detail-label">{{ $t('admin.returnsManagement.modal.totalAmount') }}</span>
                <span class="detail-value"><strong>{{ formatTunCurrency(selectedReturn.totalReturnAmount) }}</strong></span>
              </div>
            </b-col>
            <b-col cols="12" md="6">
              <div class="detail-row" v-if="selectedReturn.originalSalesHeader">
                <span class="detail-label">{{ $t('admin.returnsManagement.modal.originalTicket') }}</span>
                <span class="detail-value">
                  <strong>{{ selectedReturn.originalSalesHeader.salesNumber }}</strong>
                  <br>
                  <small class="text-muted">{{ formatDate(selectedReturn.originalSalesHeader.salesDate) }}</small>
                </span>
              </div>
              <div class="detail-row" v-if="selectedReturn.notes">
                <span class="detail-label">{{ $t('admin.returnsManagement.modal.notes') }}</span>
                <span class="detail-value">{{ selectedReturn.notes }}</span>
              </div>
            </b-col>
          </b-row>
        </b-card>

        <!-- Synchronization Information -->
        <b-card class="mb-3 sync-info-card">
          <div class="d-flex align-items-center mb-3">
            <feather-icon icon="CloudIcon" size="20" class="mr-2 text-primary" />
            <h5 class="mb-0">{{ $t('admin.returnsManagement.modal.erpSynchronization') }}</h5>
          </div>
          <b-row>
            <b-col md="6">
              <div class="sync-detail-item">
                <label class="sync-label">{{ $t('admin.returnsManagement.modal.synchronizationStatus') }}</label>
                <div class="sync-value">
                  <b-badge :variant="getSyncStatusVariant(selectedReturn.synchronizationStatus)"
                    class="sync-badge-large">
                    <feather-icon :icon="getSyncStatusIcon(selectedReturn.synchronizationStatus)" size="14"
                      class="mr-1" />
                    {{ formatSyncStatus(selectedReturn.synchronizationStatus) }}
                  </b-badge>
                </div>
              </div>
            </b-col>
            <b-col md="6">
              <div class="sync-detail-item">
                <label class="sync-label">{{ $t('admin.returnsManagement.modal.erpDocumentNumber') }}</label>
                <div class="sync-value">
                  <code v-if="selectedReturn.erpNo" class="erp-number">{{ selectedReturn.erpNo }}</code>
                  <span v-else class="text-muted">{{ $t('admin.returnsManagement.modal.notSynchronized') }}</span>
                </div>
              </div>
            </b-col>
          </b-row>
          <div v-if="selectedReturn.returnLines" class="mt-3">
            <div class="sync-summary">
              <small class="text-muted">
                {{ $t('admin.returnsManagement.modal.linesSynchronized') }}:
                <strong>{{ getSyncedLinesCount(selectedReturn.returnLines) }} / {{ selectedReturn.returnLines.length
                  }}</strong>
              </small>
            </div>
          </div>
        </b-card>

        <!-- Voucher Information (if applicable) -->
        <b-card v-if="selectedReturn.returnVoucher" class="mb-3">
          <h5 class="mb-3">{{ $t('admin.returnsManagement.modal.voucherInformation') }}</h5>
          <b-row>
            <b-col cols="12" md="6">
              <div class="detail-row">
                <span class="detail-label">{{ $t('admin.returnsManagement.modal.voucherNumber') }}</span>
                <span class="detail-value"><strong>{{ selectedReturn.returnVoucher.voucherNumber }}</strong></span>
              </div>
              <div class="detail-row">
                <span class="detail-label">{{ $t('admin.returnsManagement.modal.voucherAmount') }}</span>
                <span class="detail-value"><strong>{{ formatTunCurrency(selectedReturn.returnVoucher.voucherAmount) }}</strong></span>
              </div>
              <div class="detail-row">
                <span class="detail-label">{{ $t('admin.returnsManagement.modal.usedAmount') }}</span>
                <span class="detail-value">{{ formatTunCurrency(selectedReturn.returnVoucher.usedAmount || 0) }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">{{ $t('admin.returnsManagement.modal.remainingAmount') }}</span>
                <span class="detail-value">
                  <strong class="text-success">{{ formatTunCurrency(getRemainingAmount(selectedReturn.returnVoucher)) }}</strong>
                </span>
              </div>
            </b-col>
            <b-col cols="12" md="6">
              <div class="detail-row">
                <span class="detail-label">{{ $t('admin.returnsManagement.modal.issueDate') }}</span>
                <span class="detail-value">{{ formatDate(selectedReturn.returnVoucher.voucherDate) }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">{{ $t('admin.returnsManagement.modal.expiryDate') }}</span>
                <span class="detail-value">
                  <span :class="{ 'text-danger': isVoucherExpired(selectedReturn.returnVoucher) }">
                    {{ formatDate(selectedReturn.returnVoucher.expiryDate) }}
                  </span>
                </span>
              </div>
              <div class="detail-row">
                <span class="detail-label">{{ $t('admin.returnsManagement.modal.status') }}</span>
                <span class="detail-value">
                  <b-badge :variant="getVoucherStatusVariant(selectedReturn.returnVoucher.status)">
                    {{ selectedReturn.returnVoucher.status }}
                  </b-badge>
                </span>
              </div>
              <div class="detail-row" v-if="selectedReturn.returnVoucher.customerName">
                <span class="detail-label">{{ $t('admin.returnsManagement.modal.customer') }}</span>
                <span class="detail-value">{{ selectedReturn.returnVoucher.customerName }}</span>
              </div>
            </b-col>
          </b-row>
        </b-card>

        <!-- Return Lines -->
        <b-card>
          <h5 class="mb-3">{{ $t('admin.returnsManagement.modal.returnedItems') }}</h5>
          <b-table :items="selectedReturn.returnLines || []" :fields="returnLineFields" small striped responsive>
            <template #cell(item)="row">
              <div>
                <strong>{{ row.item.item ? row.item.item.name : $t('admin.returnsManagement.nA') }}</strong>
                <div v-if="row.item.item && row.item.item.itemCode" class="small text-muted">
                  {{ $t('admin.returnsManagement.code') }}: {{ row.item.item.itemCode }}
                </div>
              </div>
            </template>

            <template #cell(quantity)="row">
              {{ row.item.quantity }}
            </template>

            <template #cell(unitPrice)="row">
              {{ formatTunCurrency(row.item.unitPrice) }}
            </template>

            <template #cell(lineTotal)="row">
              <strong>{{ formatTunCurrency(row.item.lineTotalIncludingVat || row.item.lineTotal) }}</strong>
            </template>

            <template #cell(synched)="row">
              <b-badge :variant="isSynched(row.item.synched) ? 'success' : 'secondary'" class="sync-indicator">
                <feather-icon :icon="isSynched(row.item.synched) ? 'CheckIcon' : 'XIcon'" size="12" class="mr-1" />
                {{ isSynched(row.item.synched) ? $t('admin.returnsManagement.modal.synced') : $t('admin.returnsManagement.modal.notSynced') }}
              </b-badge>
            </template>
          </b-table>
        </b-card>

        <!-- Actions -->
        <div class="text-right mt-3">
          <b-button v-if="selectedReturn.returnType === 'RETURN_VOUCHER' && selectedReturn.returnVoucher"
            variant="success" @click="printVoucher(selectedReturn)" class="mr-2">
            <feather-icon icon="PrinterIcon" size="16" class="mr-1" />
            {{ $t('admin.returnsManagement.modal.printVoucher') }}
          </b-button>
          <b-button variant="secondary" @click="showDetailsModal = false">
            {{ $t('admin.returnsManagement.modal.close') }}
          </b-button>
        </div>
      </div>
    </b-modal>
  </div>
</template>

<script>
import ToastificationContent from '@core/components/toastification/ToastificationContent.vue'
import ReceiptTemplate from '@/components/ReceiptTemplate.vue'
import JsBarcode from 'jsbarcode'
import moment from 'moment'

export default {
  name: 'ReturnsManagement',
  data() {
    // Get today's date for default filter
    const today = new Date()
    const todayStr = today.toISOString().split('T')[0]

    return {
      returns: [],
      loading: false,
      selectedReturn: null,
      showDetailsModal: false,
      sortBy: 'returnDate',
      sortDesc: true,
      currentPage: 1,
      perPage: 10,
      perPageOptions: [
        { value: 10, text: '10' },
        { value: 20, text: '20' },
        { value: 50, text: '50' },
        { value: 100, text: '100' }
      ],
      totalRows: 0,
      filters: {
        search: '',
        dateFrom: todayStr,
        dateTo: todayStr,
        returnType: null,
        voucherStatus: null,
        syncStatus: 'all'
      },
      filtersExpanded: false,
      returnFields: [
        { key: 'returnNumber', label: 'Return #', sortable: true },
        { key: 'returnDate', label: 'Date', sortable: true },
        { key: 'returnType', label: 'Type', sortable: true },
        { key: 'totalReturnAmount', label: 'Amount', sortable: true },
        { key: 'originalTicket', label: 'Original Ticket', sortable: false },
        { key: 'voucherInfo', label: 'Voucher Info', sortable: false },
        { key: 'synchronizationStatus', label: 'Sync Status', sortable: true }
      ]
    }
  },
  computed: {
    startIndex() {
      return this.totalRows === 0 ? 0 : ((this.currentPage - 1) * this.perPage) + 1
    },
    endIndex() {
      return Math.min(this.currentPage * this.perPage, this.totalRows)
    },
    returnLineFields() {
      return [
        { key: 'item', label: this.$t('admin.returnsManagement.modal.item') },
        { key: 'quantity', label: this.$t('admin.returnsManagement.modal.quantity') },
        { key: 'unitPrice', label: this.$t('admin.returnsManagement.modal.unitPrice') },
        { key: 'lineTotal', label: this.$t('admin.returnsManagement.modal.totalTTC') },
        { key: 'synched', label: this.$t('admin.returnsManagement.modal.synced'), class: 'text-center' }
      ]
    },
    returnTypeOptions() {
      return [
        { value: null, text: this.$t('admin.returnsManagement.allTypes') },
        { value: 'SIMPLE_RETURN', text: this.$t('admin.returnsManagement.simpleReturn') },
        { value: 'RETURN_VOUCHER', text: this.$t('admin.returnsManagement.returnVoucher') }
      ]
    },
    voucherStatusOptions() {
      return [
        { value: null, text: this.$t('admin.returnsManagement.allStatuses') },
        { value: 'PENDING', text: this.$t('admin.returnsManagement.pending') },
        { value: 'USED', text: this.$t('admin.returnsManagement.used') },
        { value: 'EXPIRED', text: this.$t('admin.returnsManagement.expired') }
      ]
    },
    syncStatusOptions() {
      return [
        { value: 'all', text: this.$t('admin.returnsManagement.all') },
        { value: 'NOT_SYNCHED', text: this.$t('admin.returnsManagement.notSynced') },
        { value: 'PARTIALLY_SYNCHED', text: this.$t('admin.returnsManagement.partiallySynced') },
        { value: 'TOTALLY_SYNCHED', text: this.$t('admin.returnsManagement.totallySynced') }
      ]
    }
  },
  mounted() {
    this.loadReturns()
  },
  methods: {
    async loadReturns() {
      this.loading = true
      try {
        const response = await this.$http.get('/return-header')
        let allReturns = response.data || []

        // Apply filters
        allReturns = this.applyFilters(allReturns)

        // Sort
        allReturns.sort((a, b) => {
          const aVal = a[this.sortBy]
          const bVal = b[this.sortBy]
          if (this.sortDesc) {
            return aVal > bVal ? -1 : aVal < bVal ? 1 : 0
          } else {
            return aVal < bVal ? -1 : aVal > bVal ? 1 : 0
          }
        })

        this.totalRows = allReturns.length

        // Paginate
        const start = (this.currentPage - 1) * this.perPage
        const end = start + this.perPage
        this.returns = allReturns.slice(start, end)
      } catch (error) {
        console.error('Error loading returns:', error)
        this.$toast({
          component: ToastificationContent,
          props: {
            title: 'Error',
            icon: 'XIcon',
            text: this.$t('admin.returnsManagement.errors.failedToLoad'),
            variant: 'danger'
          }
        })
      } finally {
        this.loading = false
      }
    },
    applyFilters(returns) {
      let filtered = returns

      // Search filter
      if (this.filters.search) {
        const search = this.filters.search.toLowerCase()
        filtered = filtered.filter(ret => {
          const returnNum = (ret.returnNumber || '').toLowerCase()
          const ticketNum = (ret.originalSalesHeader?.salesNumber || '').toLowerCase()
          const voucherNum = (ret.returnVoucher?.voucherNumber || '').toLowerCase()
          return returnNum.includes(search) || ticketNum.includes(search) || voucherNum.includes(search)
        })
      }

      // Date filters
      if (this.filters.dateFrom) {
        filtered = filtered.filter(ret => {
          const retDate = moment(ret.returnDate).format('YYYY-MM-DD')
          return retDate >= this.filters.dateFrom
        })
      }

      if (this.filters.dateTo) {
        filtered = filtered.filter(ret => {
          const retDate = moment(ret.returnDate).format('YYYY-MM-DD')
          return retDate <= this.filters.dateTo
        })
      }

      // Return type filter
      if (this.filters.returnType) {
        filtered = filtered.filter(ret => ret.returnType === this.filters.returnType)
      }

      // Voucher status filter
      if (this.filters.voucherStatus) {
        filtered = filtered.filter(ret => {
          return ret.returnVoucher && ret.returnVoucher.status === this.filters.voucherStatus
        })
      }

      // Sync status filter
      if (this.filters.syncStatus && this.filters.syncStatus !== 'all') {
        filtered = filtered.filter(ret => {
          return ret.synchronizationStatus === this.filters.syncStatus
        })
      }

      return filtered
    },
    onFilterChange() {
      this.currentPage = 1
      this.loadReturns()
    },
    onPageChange(page) {
      this.currentPage = page
      this.loadReturns()
    },
    onPerPageChange() {
      // Reset to first page when changing items per page
      this.currentPage = 1
      this.loadReturns()
    },
    clearSearch() {
      this.filters.search = ''
      this.onFilterChange()
    },
    toggleFilters() {
      this.filtersExpanded = !this.filtersExpanded
    },
    resetFilters() {
      // Get today's date for reset
      const today = new Date()
      const todayStr = today.toISOString().split('T')[0]

      this.filters = {
        search: '',
        dateFrom: todayStr,
        dateTo: todayStr,
        returnType: null,
        voucherStatus: null,
        syncStatus: 'all'
      }
      this.currentPage = 1
      this.loadReturns()
    },
    async viewReturnDetails(returnItem) {
      try {
        const response = await this.$http.get(`/return-header/${returnItem.id}/details`)

        // Merge API response with list item data to preserve sync status and ERP number
        this.selectedReturn = {
          ...response.data.returnHeader,
          // Preserve synchronization fields from list item (they might not be in details response)
          synchronizationStatus: response.data.returnHeader.synchronizationStatus || returnItem.synchronizationStatus,
          erpNo: response.data.returnHeader.erpNo || returnItem.erpNo
        }
        this.selectedReturn.returnLines = response.data.returnLines
        this.showDetailsModal = true
      } catch (error) {
        console.error('Error loading return details:', error)
        this.$toast({
          component: ToastificationContent,
          props: {
            title: 'Error',
            icon: 'XIcon',
            text: this.$t('admin.returnsManagement.errors.failedToLoadDetails'),
            variant: 'danger'
          }
        })
      }
    },
    async printVoucher(returnItem) {
      if (!returnItem.returnVoucher) {
        this.$toast({
          component: ToastificationContent,
          props: {
            title: 'Error',
            icon: 'XIcon',
            text: this.$t('admin.returnsManagement.errors.noVoucherFound'),
            variant: 'warning'
          }
        })
        return
      }

      // Load full return details if not already loaded
      let returnData = returnItem
      if (!returnData.returnLines) {
        try {
          const response = await this.$http.get(`/return-header/${returnItem.id}/details`)
          returnData = {
            ...response.data.returnHeader,
            returnLines: response.data.returnLines
          }
        } catch (error) {
          console.error('Error loading return details for printing:', error)
          this.$toast({
            component: ToastificationContent,
            props: {
              title: 'Error',
              icon: 'XIcon',
              text: this.$t('admin.returnsManagement.errors.failedToLoadForPrinting'),
              variant: 'danger'
            }
          })
          return
        }
      }

      // Prepare voucher data in the same format as sale data for ReceiptTemplate
      const returnLines = returnData.returnLines || []
      const voucherData = {
        salesNumber: returnData.returnVoucher.voucherNumber,
        salesDate: returnData.returnVoucher.voucherDate,
        totalAmount: returnData.returnVoucher.voucherAmount,
        subtotal: returnData.returnVoucher.voucherAmount,
        taxAmount: 0,
        discountAmount: 0,
        paidAmount: returnData.returnVoucher.voucherAmount,
        changeAmount: 0,
        notes: `${this.$t('admin.returnsManagement.returnVoucher')} - ${this.$t('admin.returnsManagement.modal.originalTicket')} ${returnData.originalSalesHeader?.salesNumber || this.$t('admin.returnsManagement.nA')}`,
        createdByUser: {
          fullName: 'System',
          username: 'System'
        },
        cashierSession: null,
        customer: returnData.returnVoucher.customerName ? {
          name: returnData.returnVoucher.customerName
        } : null,
        salesLines: returnLines.map(line => ({
          item: {
            name: line.item ? line.item.name : this.$t('admin.returnsManagement.nA'),
            itemCode: line.item ? line.item.itemCode : null
          },
          quantity: line.quantity,
          unitPrice: line.unitPrice,
          lineTotal: line.lineTotal
        })),
        paymentHeaders: [{
          paymentMethod: {
            name: 'Return Voucher'
          },
          totalAmount: returnData.returnVoucher.voucherAmount,
          paymentReference: returnData.returnVoucher.voucherNumber
        }]
      }

      // Add voucher-specific information
      voucherData.isVoucher = true
      voucherData.voucherInfo = {
        voucherNumber: returnData.returnVoucher.voucherNumber,
        expiryDate: returnData.returnVoucher.expiryDate,
        originalTicket: returnData.originalSalesHeader?.salesNumber || 'N/A',
        returnNumber: returnData.returnNumber
      }

      // Use Vue to create component instance
      const Vue = this.$root.constructor || this.$options._base
      const ReceiptComponent = Vue.extend(ReceiptTemplate)

      // Create component instance
      const instance = new ReceiptComponent({
        parent: this,
        propsData: {
          saleData: voucherData,
          isVoucher: true,
          isDuplicate: true // Show duplicate badge for reprints
        }
      })

      // Mount the component
      instance.$mount()

      // Wait for component to mount and generate barcode
      await this.$nextTick()
      await new Promise(resolve => setTimeout(resolve, 200))

      // Generate barcode in the component if voucher_number exists
      const barcodeValue = returnData.returnVoucher.voucherNumber || null
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
            title: this.$t('admin.returnsManagement.errors.printError'),
            icon: 'XIcon',
            text: this.$t('admin.returnsManagement.errors.allowPopups'),
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
          <title>${this.$t('admin.returnsManagement.returnVoucher')} - ${returnData.returnVoucher.voucherNumber} - DUPLICATE</title>
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
            .voucher-badge {
              background: #007bff;
              color: white;
              font-weight: bold;
              text-align: center;
              padding: 8px;
              margin: 10px 0;
              font-size: 14px;
              border: 2px solid #000;
            }
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

      // Wait for content to load and barcode to generate, then print
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
    },
    getRemainingAmount(voucher) {
      if (!voucher) return 0
      const voucherAmount = voucher.voucherAmount || 0
      const usedAmount = voucher.usedAmount || 0
      return Math.max(0, voucherAmount - usedAmount)
    },
    isVoucherExpired(voucher) {
      if (!voucher || !voucher.expiryDate) return false
      return moment().isAfter(moment(voucher.expiryDate))
    },
    getVoucherStatusVariant(status) {
      switch (status) {
        case 'PENDING':
          return 'success'
        case 'USED':
          return 'info'
        case 'EXPIRED':
          return 'danger'
        default:
          return 'secondary'
      }
    },
    formatTunCurrency(value) {
      const amount = parseFloat(value) || 0
      const formatted = amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
      return `${formatted} TND`
    },
    formatPrice(price) {
      // Keep for backward compatibility, but use formatTunCurrency instead
      return this.formatTunCurrency(price)
    },
    formatDate(dateString) {
      if (!dateString) return ''
      return moment(dateString).format('YYYY-MM-DD HH:mm')
    },
    formatSyncStatus(status) {
      if (!status) return this.$t('admin.returnsManagement.notSynced')
      const statusMap = {
        'NOT_SYNCHED': this.$t('admin.returnsManagement.notSynced'),
        'PARTIALLY_SYNCHED': this.$t('admin.returnsManagement.partiallySynced'),
        'TOTALLY_SYNCHED': this.$t('admin.returnsManagement.totallySynced')
      }
      return statusMap[status] || status
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
      return lines.filter(line => this.isSynched(line.synched)).length
    },
    isSynched(synchedValue) {
      // Handle boolean true, string "true", or number 1
      if (synchedValue === true || synchedValue === 'true' || synchedValue === 1) {
        return true
      }
      // Handle boolean false, string "false", null, undefined, or 0
      return false
    }
  }
}
</script>

<style scoped>
.returns-management-container {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.cursor-pointer {
  cursor: pointer;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
  padding-bottom: 8px;
  border-bottom: 1px solid #eee;
}

.detail-label {
  font-weight: 600;
  color: #666;
}

.detail-value {
  text-align: right;
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
