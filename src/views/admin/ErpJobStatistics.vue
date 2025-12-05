<template>
  <div class="erp-job-statistics-container">
    <div class="page-header">
      <h2 class="mb-0">ERP Job Statistics</h2>
      <b-button variant="outline-primary" @click="loadStatistics" :disabled="loading">
        <feather-icon icon="RefreshCwIcon" size="16" class="mr-50" />
        Refresh
      </b-button>
    </div>

    <b-card class="mb-3">
      <b-row>
        <b-col cols="12" md="6">
          <b-form-group label="Job" label-for="job-selector">
            <b-form-select id="job-selector" v-model="selectedJobId" :options="jobOptions" @change="loadStatistics" />
          </b-form-group>
        </b-col>
        <b-col cols="12" md="3">
          <b-form-group label="Time Period" label-for="time-period">
            <b-form-select id="time-period" v-model="timePeriod" :options="timePeriodOptions" @change="onTimePeriodChange" />
          </b-form-group>
        </b-col>
        <b-col cols="12" md="3">
          <b-form-group label="Custom From" label-for="custom-from" v-if="timePeriod === 'CUSTOM'">
            <b-form-input id="custom-from" type="datetime-local" v-model="customFromDate" />
          </b-form-group>
          <b-form-group label="Custom To" label-for="custom-to" v-if="timePeriod === 'CUSTOM'">
            <b-form-input id="custom-to" type="datetime-local" v-model="customToDate" />
          </b-form-group>
        </b-col>
      </b-row>
    </b-card>

    <!-- Summary Cards -->
    <b-row v-if="statistics" class="mb-3">
      <b-col cols="12" md="3">
        <b-card class="text-center">
          <h3 class="mb-1">{{ statistics.totalExecutions || 0 }}</h3>
          <p class="mb-0 text-muted">Total Executions</p>
        </b-card>
      </b-col>
      <b-col cols="12" md="3">
        <b-card class="text-center">
          <h3 class="mb-1 text-success">
            {{ statistics.successRate != null ? statistics.successRate.toFixed(1) : '—' }}%
          </h3>
          <p class="mb-0 text-muted">Success Rate</p>
        </b-card>
      </b-col>
      <b-col cols="12" md="3">
        <b-card class="text-center">
          <h3 class="mb-1">
            {{ statistics.averageDurationMs != null ? formatDuration(statistics.averageDurationMs) : '—' }}
          </h3>
          <p class="mb-0 text-muted">Avg Duration</p>
        </b-card>
      </b-col>
      <b-col cols="12" md="3">
        <b-card class="text-center">
          <h3 class="mb-1 text-info">
            {{ statistics.successfulExecutions || 0 }} / {{ statistics.failedExecutions || 0 }}
          </h3>
          <p class="mb-0 text-muted">Success / Fail</p>
        </b-card>
      </b-col>
    </b-row>

    <!-- Period Statistics -->
    <b-row v-if="statistics" class="mb-3">
      <b-col cols="12">
        <b-card>
          <h5 class="mb-3">{{ getPeriodTitle() }}</h5>
          <b-row>
            <b-col cols="12" md="6">
              <p class="mb-1"><strong>Total:</strong> {{ statistics.totalExecutions || 0 }}</p>
              <p class="mb-1"><strong>Success Rate:</strong> 
                {{ statistics.successRate != null ? statistics.successRate.toFixed(1) : '—' }}%
              </p>
            </b-col>
            <b-col cols="12" md="6">
              <p class="mb-1"><strong>Avg Duration:</strong> 
                {{ statistics.averageDurationMs != null ? formatDuration(statistics.averageDurationMs) : '—' }}
              </p>
              <p class="mb-1"><strong>Failed:</strong> {{ statistics.failedExecutions || 0 }}</p>
            </b-col>
          </b-row>
        </b-card>
      </b-col>
    </b-row>

    <!-- Execution History -->
    <b-card>
      <h5 class="mb-3">Recent Execution History (Last 10 executions)</h5>
      <b-table :items="executionHistory" :fields="historyFields" striped hover responsive show-empty :busy="loading">
        <template #table-busy>
          <div class="text-center my-2">
            <b-spinner class="align-middle" />
            <strong class="ml-1">Loading...</strong>
          </div>
        </template>

        <template #empty>
          <div class="text-center py-4">
            <feather-icon icon="InboxIcon" size="48" class="text-muted mb-2" />
            <p class="text-muted mb-0">No execution history found.</p>
          </div>
        </template>

        <template #cell(startedAt)="row">
          {{ formatDateTime(row.item.startedAt) }}
        </template>

        <template #cell(durationMs)="row">
          <span v-if="row.item.durationMs != null">
            {{ formatDuration(row.item.durationMs) }}
          </span>
          <span v-else class="text-muted">—</span>
        </template>

        <template #cell(status)="row">
          <b-badge :variant="statusVariant(row.item.status)">
            {{ row.item.status }}
          </b-badge>
        </template>

        <template #cell(errorMessage)="row">
          <span v-if="row.item.errorMessage" class="text-danger small">
            {{ truncateText(row.item.errorMessage, 50) }}
          </span>
          <span v-else class="text-muted">—</span>
        </template>
      </b-table>
    </b-card>
  </div>
</template>

<script>
import moment from 'moment'
import ToastificationContent from '@core/components/toastification/ToastificationContent.vue'

export default {
  name: 'ErpJobStatistics',
  data() {
    return {
      loading: false,
      jobs: [],
      selectedJobId: null,
      statistics: null,
      timePeriod: '7_DAYS',
      timePeriodOptions: [
        { value: '7_DAYS', text: 'Last 7 days' },
        { value: '30_DAYS', text: 'Last 30 days' },
        { value: 'CUSTOM', text: 'Custom range' },
      ],
      customFromDate: null,
      customToDate: null,
      customDateTimeout: null,
      historyFields: [
        { key: 'startedAt', label: 'Started At', sortable: true },
        { key: 'durationMs', label: 'Duration', sortable: false },
        { key: 'status', label: 'Status', sortable: false },
        { key: 'errorMessage', label: 'Error', sortable: false },
      ],
    }
  },
  computed: {
    jobOptions() {
      const options = [{ value: null, text: 'All Jobs' }]
      this.jobs.forEach(job => {
        options.push({
          value: job.id,
          text: this.formatJobType(job.jobType),
        })
      })
      return options
    },
    executionHistory() {
      return (this.statistics && this.statistics.recentExecutions) || []
    },
  },
  mounted() {
    this.loadJobs().then(() => {
      if (this.$route.params.jobId) {
        this.selectedJobId = parseInt(this.$route.params.jobId, 10)
      }
      // Load statistics after jobs are loaded and job is selected
      if (this.selectedJobId) {
        this.loadStatistics()
      }
    })
  },
  methods: {
    async loadJobs() {
      try {
        const response = await this.$http.get('/admin/erp/jobs')
        this.jobs = Array.isArray(response.data) ? response.data : []
        if (this.selectedJobId && !this.jobs.find(j => j.id === this.selectedJobId)) {
          this.selectedJobId = null
        }
        return Promise.resolve()
      } catch (error) {
        console.error('Error loading jobs:', error)
        return Promise.resolve()
      }
    },
    async loadStatistics() {
      if (!this.selectedJobId) {
        this.statistics = null
        return
      }

      this.loading = true
      try {
        let url = `/admin/erp/jobs/${this.selectedJobId}/statistics`
        const params = []

        if (this.timePeriod === '7_DAYS') {
          const fromDate = moment().subtract(7, 'days').startOf('day').toISOString()
          params.push(`fromDate=${encodeURIComponent(fromDate)}`)
        } else if (this.timePeriod === '30_DAYS') {
          const fromDate = moment().subtract(30, 'days').startOf('day').toISOString()
          params.push(`fromDate=${encodeURIComponent(fromDate)}`)
        } else if (this.timePeriod === 'CUSTOM') {
          if (!this.customFromDate || !this.customToDate) {
            // Don't load if both dates are not set
            this.loading = false
            return
          }
          const fromDate = moment(this.customFromDate).toISOString()
          const toDate = moment(this.customToDate).toISOString()
          params.push(`fromDate=${encodeURIComponent(fromDate)}`)
          params.push(`toDate=${encodeURIComponent(toDate)}`)
        }

        if (params.length > 0) {
          url += '?' + params.join('&')
        }

        const response = await this.$http.get(url)
        this.statistics = response.data || null
      } catch (error) {
        console.error('Error loading statistics:', error)
        this.$toast({
          component: ToastificationContent,
          props: {
            title: 'Error',
            icon: 'AlertCircleIcon',
            text: 'Failed to load statistics',
            variant: 'danger',
          },
        })
      } finally {
        this.loading = false
      }
    },
    onTimePeriodChange() {
      if (this.timePeriod !== 'CUSTOM') {
        this.customFromDate = null
        this.customToDate = null
      }
      this.loadStatistics()
    },
    getPeriodTitle() {
      switch (this.timePeriod) {
        case '7_DAYS':
          return 'Last 7 Days Statistics'
        case '30_DAYS':
          return 'Last 30 Days Statistics'
        case 'CUSTOM':
          if (this.customFromDate && this.customToDate) {
            const from = moment(this.customFromDate).format('YYYY-MM-DD')
            const to = moment(this.customToDate).format('YYYY-MM-DD')
            return `Custom Range Statistics (${from} to ${to})`
          }
          return 'Custom Range Statistics'
        default:
          return 'Statistics'
      }
    },
    formatJobType(jobType) {
      if (!jobType) return 'Unknown'
      return jobType
        .toString()
        .toLowerCase()
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
    },
    formatDateTime(value) {
      if (!value) return '—'
      return moment(value).format('YYYY-MM-DD HH:mm:ss')
    },
    formatDuration(ms) {
      if (ms == null) return '—'
      if (ms < 1000) {
        return `${ms}ms`
      }
      const seconds = (ms / 1000).toFixed(2)
      if (parseFloat(seconds) < 60) {
        return `${seconds}s`
      }
      const minutes = Math.floor(ms / 60000)
      const remainingSeconds = ((ms % 60000) / 1000).toFixed(0)
      return `${minutes}m ${remainingSeconds}s`
    },
    statusVariant(status) {
      if (!status) return 'secondary'
      const normalized = status.toUpperCase()
      if (normalized === 'SUCCESS') return 'success'
      if (normalized === 'ERROR' || normalized === 'FAILED') return 'danger'
      if (normalized === 'WARNING') return 'warning'
      return 'secondary'
    },
    truncateText(text, maxLength) {
      if (!text || text.length <= maxLength) return text
      return text.substring(0, maxLength) + '...'
    },
  },
  beforeDestroy() {
    if (this.customDateTimeout) {
      clearTimeout(this.customDateTimeout)
    }
  },
  watch: {
    selectedJobId() {
      this.loadStatistics()
    },
    '$route.params.jobId'(newJobId) {
      if (newJobId) {
        this.selectedJobId = parseInt(newJobId, 10)
      }
    },
    customFromDate(newVal, oldVal) {
      if (this.timePeriod === 'CUSTOM' && newVal && this.customToDate && newVal !== oldVal) {
        // Debounce to avoid multiple calls
        clearTimeout(this.customDateTimeout)
        this.customDateTimeout = setTimeout(() => {
          this.loadStatistics()
        }, 500)
      }
    },
    customToDate(newVal, oldVal) {
      if (this.timePeriod === 'CUSTOM' && this.customFromDate && newVal && newVal !== oldVal) {
        // Debounce to avoid multiple calls
        clearTimeout(this.customDateTimeout)
        this.customDateTimeout = setTimeout(() => {
          this.loadStatistics()
        }, 500)
      }
    },
  },
}
</script>

<style scoped>
.erp-job-statistics-container {
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
</style>

