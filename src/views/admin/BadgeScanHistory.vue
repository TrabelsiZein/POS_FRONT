<template>
  <div class="badge-scan-history-container">
    <div class="page-header">
      <h2 class="mb-0">{{ $t('admin.badgeScanHistory.title') }}</h2>
      <div>
        <b-button variant="outline-primary" @click="loadScanHistory" class="mr-2">
          <feather-icon icon="RefreshCwIcon" size="16" />
          {{ $t('admin.badgeScanHistory.refresh') }}
        </b-button>
        <b-button variant="success" @click="exportToCSV" :disabled="loading || scanLogs.length === 0">
          <feather-icon icon="DownloadIcon" size="16" />
          {{ $t('admin.badgeScanHistory.export') }}
        </b-button>
      </div>
    </div>

    <!-- Statistics Dashboard -->
    <b-row class="mb-3">
      <b-col cols="12" md="3">
        <b-card class="stat-card">
          <div class="d-flex align-items-center">
            <div class="stat-icon bg-primary">
              <feather-icon icon="ActivityIcon" size="24" />
            </div>
            <div class="ml-3">
              <h6 class="mb-0 text-muted">{{ $t('admin.badgeScanHistory.stats.totalScans') }}</h6>
              <h3 class="mb-0">{{ statistics.totalScans || 0 }}</h3>
            </div>
          </div>
        </b-card>
      </b-col>
      <b-col cols="12" md="3">
        <b-card class="stat-card">
          <div class="d-flex align-items-center">
            <div class="stat-icon bg-success">
              <feather-icon icon="CheckCircleIcon" size="24" />
            </div>
            <div class="ml-3">
              <h6 class="mb-0 text-muted">{{ $t('admin.badgeScanHistory.stats.successfulScans') }}</h6>
              <h3 class="mb-0">{{ statistics.successfulScans || 0 }}</h3>
            </div>
          </div>
        </b-card>
      </b-col>
      <b-col cols="12" md="3">
        <b-card class="stat-card">
          <div class="d-flex align-items-center">
            <div class="stat-icon bg-danger">
              <feather-icon icon="XCircleIcon" size="24" />
            </div>
            <div class="ml-3">
              <h6 class="mb-0 text-muted">{{ $t('admin.badgeScanHistory.stats.failedScans') }}</h6>
              <h3 class="mb-0">{{ statistics.failedScans || 0 }}</h3>
            </div>
          </div>
        </b-card>
      </b-col>
      <b-col cols="12" md="3">
        <b-card class="stat-card">
          <div class="d-flex align-items-center">
            <div class="stat-icon bg-info">
              <feather-icon icon="TrendingUpIcon" size="24" />
            </div>
            <div class="ml-3">
              <h6 class="mb-0 text-muted">{{ $t('admin.badgeScanHistory.stats.successRate') }}</h6>
              <h3 class="mb-0">{{ successRate }}%</h3>
            </div>
          </div>
        </b-card>
      </b-col>
    </b-row>

    <!-- Filters -->
    <b-card class="mb-2">
      <div @click="toggleFilters" role="button" tabindex="0" @keyup.enter="toggleFilters">
        <div class="d-flex align-items-center justify-content-between">
          <div class="d-flex align-items-center">
            <feather-icon icon="FilterIcon" size="18" class="mr-2 text-primary" />
            <h6 class="mb-0 text-primary font-weight-bold">
              {{ $t('admin.badgeScanHistory.filters') }}
              <span class="text-muted font-weight-normal ml-2">({{ totalRows }} {{ $t('admin.badgeScanHistory.records') }})</span>
            </h6>
          </div>
          <feather-icon :icon="filtersExpanded ? 'ChevronUpIcon' : 'ChevronDownIcon'" size="20" class="text-primary" />
        </div>
      </div>
      <b-collapse v-model="filtersExpanded" id="filters-collapse">
        <div class="pt-2">
          <b-row>
            <b-col cols="12" sm="6" md="3" class="mb-2">
              <b-form-group :label="$t('admin.badgeScanHistory.badgeCode')" label-for="badge-code-filter" class="mb-0">
                <b-form-input id="badge-code-filter" v-model="filters.badgeCode"
                  :placeholder="$t('admin.badgeScanHistory.badgeCodePlaceholder')" @input="onFilterChange" />
              </b-form-group>
            </b-col>
            <b-col cols="12" sm="6" md="3" class="mb-2">
              <b-form-group :label="$t('admin.badgeScanHistory.user')" label-for="user-filter" class="mb-0">
                <b-form-input id="user-filter" v-model="filters.user"
                  :placeholder="$t('admin.badgeScanHistory.userPlaceholder')" @input="onFilterChange" />
              </b-form-group>
            </b-col>
            <b-col cols="12" sm="6" md="3" class="mb-2">
              <b-form-group :label="$t('admin.badgeScanHistory.permission')" label-for="permission-filter" class="mb-0">
                <b-form-select id="permission-filter" v-model="filters.permission" :options="permissionOptions"
                  @input="onFilterChange">
                  <template #first>
                    <b-form-select-option :value="null">{{ $t('admin.badgeScanHistory.allPermissions') }}</b-form-select-option>
                  </template>
                </b-form-select>
              </b-form-group>
            </b-col>
            <b-col cols="12" sm="6" md="3" class="mb-2">
              <b-form-group :label="$t('admin.badgeScanHistory.success')" label-for="success-filter" class="mb-0">
                <b-form-select id="success-filter" v-model="filters.success" :options="successOptions"
                  @input="onFilterChange">
                  <template #first>
                    <b-form-select-option :value="null">{{ $t('admin.badgeScanHistory.all') }}</b-form-select-option>
                  </template>
                </b-form-select>
              </b-form-group>
            </b-col>
          </b-row>
          <b-row>
            <b-col cols="12" sm="6" md="3" class="mb-2">
              <b-form-group :label="$t('admin.badgeScanHistory.dateFrom')" label-for="date-from" class="mb-0">
                <b-form-datepicker id="date-from" v-model="filters.dateFrom" :placeholder="$t('admin.badgeScanHistory.selectDate')"
                  locale="en" @input="onFilterChange" />
              </b-form-group>
            </b-col>
            <b-col cols="12" sm="6" md="3" class="mb-2">
              <b-form-group :label="$t('admin.badgeScanHistory.dateTo')" label-for="date-to" class="mb-0">
                <b-form-datepicker id="date-to" v-model="filters.dateTo" :placeholder="$t('admin.badgeScanHistory.selectDate')"
                  locale="en" @input="onFilterChange" />
              </b-form-group>
            </b-col>
            <b-col cols="12" sm="6" md="3" class="mb-2 d-flex align-items-end">
              <b-button variant="outline-secondary" @click="clearFilters" block>
                <feather-icon icon="XIcon" size="14" class="mr-1" />
                {{ $t('admin.badgeScanHistory.clearFilters') }}
              </b-button>
            </b-col>
          </b-row>
        </div>
      </b-collapse>
    </b-card>

    <!-- Scan Logs Table -->
    <b-card>
      <b-table :items="paginatedScanLogs" :fields="scanLogFields" striped hover responsive :busy="loading"
        :sort-by="sortBy" :sort-desc="sortDesc" show-empty>
        <template #table-busy>
          <div class="text-center my-2">
            <b-spinner class="align-middle"></b-spinner>
            <strong>{{ $t('admin.badgeScanHistory.loading') }}</strong>
          </div>
        </template>

        <template #empty>
          <div class="text-center text-muted py-4">
            <p>{{ $t('admin.badgeScanHistory.noRecords') }}</p>
            <p class="small">{{ $t('admin.badgeScanHistory.tryAdjustingFilters') }}</p>
          </div>
        </template>

        <template #cell(timestamp)="row">
          {{ formatDateTime(row.item.timestamp) }}
        </template>

        <template #cell(scannedBy)="row">
          {{ row.item.scannedByFullName || row.item.scannedByUsername || '-' }}
        </template>

        <template #cell(scannedBadgeCode)="row">
          <code class="badge-code">{{ row.item.scannedBadgeCode }}</code>
        </template>

        <template #cell(scannedUser)="row">
          {{ row.item.scannedUserFullName || row.item.scannedUserUsername || '-' }}
        </template>

        <template #cell(functionality)="row">
          <b-badge variant="info">{{ getPermissionLabel(row.item.functionality) }}</b-badge>
        </template>

        <template #cell(success)="row">
          <b-badge :variant="row.item.success ? 'success' : 'danger'">
            {{ row.item.success ? $t('admin.badgeScanHistory.success') : $t('admin.badgeScanHistory.failure') }}
          </b-badge>
        </template>

        <template #cell(failureReason)="row">
          <span v-if="row.item.failureReason" class="text-danger small">
            {{ row.item.failureReason }}
          </span>
          <span v-else class="text-muted">-</span>
        </template>

      </b-table>

      <!-- Pagination -->
      <div class="d-flex justify-content-between align-items-center mt-3">
        <div>
          <span class="text-muted">
            {{ $t('admin.badgeScanHistory.showing') }} {{ (currentPage - 1) * perPage + 1 }} - {{ Math.min(currentPage * perPage, totalRows) }} {{ $t('admin.badgeScanHistory.of') }} {{ totalRows }}
          </span>
        </div>
        <b-pagination v-model="currentPage" :total-rows="totalRows" :per-page="perPage" @change="onPageChange" />
      </div>
    </b-card>
  </div>
</template>

<script>
import ToastificationContent from '@core/components/toastification/ToastificationContent.vue'
import { BADGE_PERMISSIONS } from '@/services/badgeService'

export default {
  name: 'BadgeScanHistory',
  data() {
    // Get today's date for default filter
    const today = new Date()
    const todayStr = today.toISOString().split('T')[0]
    
    return {
      scanLogs: [],
      loading: false,
      filtersExpanded: false,
      filters: {
        badgeCode: '',
        user: '',
        permission: null,
        success: null,
        dateFrom: todayStr,
        dateTo: todayStr,
      },
      sortBy: 'timestamp',
      sortDesc: true,
      currentPage: 1,
      perPage: 20,
      totalRows: 0,
      statistics: {
        totalScans: 0,
        successfulScans: 0,
        failedScans: 0
      }
    }
  },
  computed: {
    scanLogFields() {
      return [
        { key: 'timestamp', label: this.$t('admin.badgeScanHistory.tableHeaders.timestamp'), sortable: true },
        { key: 'scannedBy', label: this.$t('admin.badgeScanHistory.tableHeaders.scannedBy'), sortable: true },
        { key: 'scannedBadgeCode', label: this.$t('admin.badgeScanHistory.tableHeaders.badgeCode'), sortable: true },
        { key: 'scannedUser', label: this.$t('admin.badgeScanHistory.tableHeaders.badgeOwner'), sortable: true },
        { key: 'functionality', label: this.$t('admin.badgeScanHistory.tableHeaders.permission'), sortable: true },
        { key: 'success', label: this.$t('admin.badgeScanHistory.tableHeaders.success'), sortable: true },
        { key: 'failureReason', label: this.$t('admin.badgeScanHistory.tableHeaders.failureReason'), sortable: false },
      ]
    },
    permissionOptions() {
      return Object.values(BADGE_PERMISSIONS).map(perm => ({
        value: perm,
        text: this.$t(`admin.userManagement.badge.permissions.${perm.toLowerCase()}`)
      }))
    },
    successOptions() {
      return [
        { value: true, text: this.$t('admin.badgeScanHistory.success') },
        { value: false, text: this.$t('admin.badgeScanHistory.failure') }
      ]
    },
    paginatedScanLogs() {
      return this.scanLogs
    },
    successRate() {
      if (this.statistics.totalScans === 0) return 0
      return Math.round((this.statistics.successfulScans / this.statistics.totalScans) * 100)
    }
  },
  mounted() {
    this.loadScanHistory()
    this.loadStatistics()
  },
  methods: {
    toggleFilters() {
      this.filtersExpanded = !this.filtersExpanded
    },
    onFilterChange() {
      this.currentPage = 1
      this.loadScanHistory()
    },
    clearFilters() {
      // Get today's date for default filter
      const today = new Date()
      const todayStr = today.toISOString().split('T')[0]
      
      this.filters = {
        badgeCode: '',
        user: '',
        permission: null,
        success: null,
        dateFrom: todayStr,
        dateTo: todayStr,
      }
      this.onFilterChange()
    },
    onPageChange(page) {
      this.currentPage = page
      this.loadScanHistory()
    },
    async loadScanHistory() {
      this.loading = true
      try {
        const params = {
          page: this.currentPage - 1,
          size: this.perPage
        }

        if (this.filters.badgeCode) {
          params.badgeCode = this.filters.badgeCode
        }
        if (this.filters.user) {
          // Search by username or full name - backend should handle this
          params.userId = this.filters.user // This might need adjustment based on backend API
        }
        if (this.filters.permission) {
          params.permission = this.filters.permission
        }
        if (this.filters.success !== null) {
          params.success = this.filters.success
        }
        if (this.filters.dateFrom) {
          params.fromDate = new Date(this.filters.dateFrom).toISOString()
        }
        if (this.filters.dateTo) {
          // Set to end of day
          const date = new Date(this.filters.dateTo)
          date.setHours(23, 59, 59, 999)
          params.toDate = date.toISOString()
        }
        const response = await this.$http.get('/badge/scan-history', { params })

        if (response.data && response.data.content) {
          // Spring Data Page response
          this.scanLogs = response.data.content
          this.totalRows = response.data.totalElements
        } else {
          // Direct array response
          this.scanLogs = response.data || []
          this.totalRows = this.scanLogs.length
        }
      } catch (error) {
        console.error('Error loading scan history:', error)
        this.$toast({
          component: ToastificationContent,
          props: {
            title: this.$t('common.error'),
            icon: 'AlertCircleIcon',
            text: this.$t('admin.badgeScanHistory.errors.failedToLoad'),
            variant: 'danger'
          }
        })
      } finally {
        this.loading = false
      }
    },
    async loadStatistics() {
      try {
        const params = {}
        if (this.filters.dateFrom) {
          params.fromDate = new Date(this.filters.dateFrom).toISOString()
        }
        if (this.filters.dateTo) {
          const date = new Date(this.filters.dateTo)
          date.setHours(23, 59, 59, 999)
          params.toDate = date.toISOString()
        }

        const response = await this.$http.get('/badge/scan-statistics', { params })
        if (response.data) {
          const totalScans = response.data.totalScans || 0
          const successfulScans = response.data.successfulScans || 0
          // Calculate failed scans correctly: total - successful
          const failedScans = totalScans - successfulScans
          
          this.statistics = {
            totalScans: totalScans,
            successfulScans: successfulScans,
            failedScans: failedScans
          }
        }
      } catch (error) {
        console.error('Error loading statistics:', error)
      }
    },
    getPermissionLabel(permission) {
      return this.$t(`admin.userManagement.badge.permissions.${permission.toLowerCase()}`)
    },
    formatDateTime(dateString) {
      if (!dateString) return '-'
      const date = new Date(dateString)
      return date.toLocaleString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      })
    },
    exportToCSV() {
      try {
        // Prepare CSV headers
        const headers = [
          this.$t('admin.badgeScanHistory.tableHeaders.timestamp'),
          this.$t('admin.badgeScanHistory.tableHeaders.scannedBy'),
          this.$t('admin.badgeScanHistory.tableHeaders.badgeCode'),
          this.$t('admin.badgeScanHistory.tableHeaders.badgeOwner'),
          this.$t('admin.badgeScanHistory.tableHeaders.permission'),
          this.$t('admin.badgeScanHistory.tableHeaders.success'),
          this.$t('admin.badgeScanHistory.tableHeaders.failureReason')
        ]

        // Prepare CSV rows
        const rows = this.scanLogs.map(log => [
          this.formatDateTime(log.timestamp),
          log.scannedByFullName || log.scannedByUsername || '',
          log.scannedBadgeCode,
          log.scannedUserFullName || log.scannedUserUsername || '',
          this.getPermissionLabel(log.functionality),
          log.success ? this.$t('admin.badgeScanHistory.success') : this.$t('admin.badgeScanHistory.failure'),
          log.failureReason || '',
        ])

        // Combine headers and rows
        const csvContent = [headers, ...rows]
          .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
          .join('\n')

        // Create blob and download
        const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' })
        const link = document.createElement('a')
        const url = URL.createObjectURL(blob)
        link.setAttribute('href', url)
        link.setAttribute('download', `badge-scan-history-${new Date().toISOString().split('T')[0]}.csv`)
        link.style.visibility = 'hidden'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)

        this.$toast({
          component: ToastificationContent,
          props: {
            title: this.$t('common.success'),
            icon: 'CheckCircleIcon',
            text: this.$t('admin.badgeScanHistory.exportSuccess'),
            variant: 'success'
          }
        })
      } catch (error) {
        console.error('Error exporting CSV:', error)
        this.$toast({
          component: ToastificationContent,
          props: {
            title: this.$t('common.error'),
            icon: 'XIcon',
            text: this.$t('admin.badgeScanHistory.errors.exportFailed'),
            variant: 'danger'
          }
        })
      }
    }
  }
}
</script>

<style scoped>
.badge-scan-history-container {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.stat-card {
  border: none;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.badge-code {
  background-color: #f8f9fa;
  padding: 2px 6px;
  border-radius: 4px;
  font-family: monospace;
  font-size: 0.9em;
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

