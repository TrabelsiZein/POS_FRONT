<template>
  <div class="erp-jobs-container">
    <div class="page-header">
      <h2 class="mb-0">ERP Sync Jobs</h2>
      <b-button variant="outline-primary" @click="loadJobs" :disabled="loading">
        <feather-icon icon="RefreshCwIcon" size="16" class="mr-50" />
        Refresh
      </b-button>
    </div>

    <b-card class="mb-3">
      <b-row>
        <b-col cols="12" lg="6">
          <b-form-group label="Search" label-for="job-search-input" class="mb-lg-0">
            <b-input-group>
              <b-form-input id="job-search-input" v-model="searchTerm"
                placeholder="Search by job type, description, cron, or checkpoint code..." />
              <b-input-group-append>
                <b-button variant="outline-secondary" @click="clearSearch" :disabled="!searchTerm">
                  <feather-icon icon="XIcon" size="14" />
                </b-button>
              </b-input-group-append>
            </b-input-group>
          </b-form-group>
        </b-col>
        <b-col cols="12" lg="6">
          <b-row>
            <b-col cols="12" md="6">
              <b-form-group label="Status" label-for="job-status-filter" class="mb-md-0">
                <b-form-select id="job-status-filter" v-model="statusFilter" :options="statusOptions" />
              </b-form-group>
            </b-col>
            <b-col cols="12" md="6">
              <b-form-group label="Enabled" label-for="job-enabled-filter" class="mb-0">
                <b-form-select id="job-enabled-filter" v-model="enabledFilter" :options="enabledOptions" />
              </b-form-group>
            </b-col>
          </b-row>
        </b-col>
      </b-row>
      <b-row class="mt-1">
        <b-col cols="12" class="d-flex align-items-end justify-content-lg-end">
          <small class="text-muted">
            Showing {{ totalRows }} {{ totalRows === 1 ? 'job' : 'jobs' }}
          </small>
        </b-col>
      </b-row>
    </b-card>

    <b-card>
      <b-progress v-if="isAnyJobRunning" :max="100" height="6px" class="mb-2" animated striped>
        <b-progress-bar :value="runProgress" variant="info" />
      </b-progress>

      <b-table :items="paginatedJobs" :fields="jobFields" striped hover responsive show-empty :busy="loading"
        @row-clicked="openDetails" class="jobs-table">
        <template #table-busy>
          <div class="text-center my-2">
            <b-spinner class="align-middle" />
            <strong class="ml-1">Loading jobs...</strong>
          </div>
        </template>

        <template #empty>
          <div class="text-center py-4">
            <feather-icon icon="RefreshCwIcon" size="48" class="text-muted mb-2" />
            <p class="text-muted mb-0">No jobs found.</p>
          </div>
        </template>

        <template #cell(jobType)="row">
          {{ formatJobType(row.item.jobType) }}
        </template>

        <template #cell(description)="row">
          <span v-if="row.item.description">{{ row.item.description }}</span>
          <span v-else class="text-muted">—</span>
        </template>

        <template #cell(cronExpression)="row">
          <code v-if="row.item.cronExpression">{{ row.item.cronExpression }}</code>
          <span v-else class="text-muted">—</span>
        </template>

        <template #cell(enabled)="row">
          <b-badge :variant="row.item.enabled ? 'success' : 'secondary'">
            {{ row.item.enabled ? 'Enabled' : 'Disabled' }}
          </b-badge>
        </template>

        <template #cell(lastRunAt)="row">
          {{ formatDateTime(row.item.lastRunAt) }}
        </template>

        <template #cell(nextRunAt)="row">
          {{ formatDateTime(row.item.nextRunAt) }}
        </template>
      </b-table>

      <div class="mt-3">
        <b-row align-v="center">
          <b-col cols="12" md="6" class="mb-2 mb-md-0">
            <div class="d-flex align-items-center">
              <label for="jobs-per-page" class="mr-2 mb-0">Items per page:</label>
              <b-form-select id="jobs-per-page" v-model="perPage" :options="perPageOptions" size="sm"
                style="width: auto;" />
            </div>
          </b-col>
          <b-col cols="12" md="6">
            <div class="text-center text-md-right">
              <small class="text-muted">
                Showing {{ startIndex }} to {{ endIndex }} of {{ totalRows }} jobs
              </small>
            </div>
          </b-col>
        </b-row>
        <div class="d-flex justify-content-center mt-2">
          <b-pagination v-model="currentPage" :total-rows="totalRows" :per-page="perPage" align="center" />
        </div>
      </div>

      <b-modal v-model="showDetailsModal" title="Job Details" size="lg" @hide="selectedJob = null">
        <div v-if="selectedJob">
          <b-row>
            <b-col cols="12" md="6">
              <p><strong>Job:</strong> {{ formatJobType(selectedJob.jobType) }}</p>
              <p><strong>Description:</strong> {{ selectedJob.description || '—' }}</p>
              <p>
                <strong>Last Status:</strong>
                <b-badge :variant="statusVariant(selectedJob.lastStatus)">
                  {{ formatStatusText(selectedJob.lastStatus) }}
                </b-badge>
              </p>
              <p><strong>Enabled:</strong> {{ selectedJob.enabled ? 'Yes' : 'No' }}</p>
            </b-col>
            <b-col cols="12" md="6">
              <p><strong>Cron:</strong> {{ selectedJob.cronExpression || '—' }}</p>
              <p><strong>Last Run:</strong> {{ formatDateTime(selectedJob.lastRunAt) || '—' }}</p>
              <p><strong>Next Run:</strong> {{ formatDateTime(selectedJob.nextRunAt) || '—' }}</p>
              <p><strong>Checkpoint:</strong> {{ selectedJob.checkpointValue || '—' }}</p>
              <p><strong>Last Checkpoint:</strong> {{ formatDateTime(selectedJob.lastCheckpointAt) || '—' }}</p>
            </b-col>
          </b-row>
        </div>

        <template #modal-footer>
          <b-button variant="secondary" @click="showDetailsModal = false">Close</b-button>
          <b-button variant="primary" @click="handleRunClick" :disabled="isAnyJobRunning || !selectedJob">
            <template v-if="selectedJob && isRunning(selectedJob.id)">
              <b-spinner small class="mr-50" />
            </template>
            <template v-else>
              <feather-icon icon="PlayCircleIcon" size="16" class="mr-50" />
            </template>
            Run Now
          </b-button>
        </template>
      </b-modal>
    </b-card>
  </div>
</template>

<script>
import moment from 'moment'
import ToastificationContent from '@core/components/toastification/ToastificationContent.vue'

export default {
  name: 'ErpJobs',
  data() {
    return {
      jobs: [],
      loading: false,
      searchTerm: '',
      statusFilter: 'ALL',
      enabledFilter: 'ALL',
      currentPage: 1,
      perPage: 10,
      perPageOptions: [
        { value: 10, text: '10' },
        { value: 20, text: '20' },
        { value: 50, text: '50' },
        { value: 100, text: '100' },
      ],
      enabledOptions: [
        { value: 'ALL', text: 'All states' },
        { value: 'ENABLED', text: 'Enabled' },
        { value: 'DISABLED', text: 'Disabled' },
      ],
      runningJobId: null,
      runProgress: 0,
      progressTimer: null,
      jobFields: [
        { key: 'jobType', label: 'Job', sortable: true },
        { key: 'description', label: 'Description', sortable: true },
        { key: 'cronExpression', label: 'Cron', sortable: false },
        { key: 'enabled', label: 'Enabled', sortable: true },
        { key: 'lastRunAt', label: 'Last Run', sortable: true },
        { key: 'nextRunAt', label: 'Next Run', sortable: true },
      ],
      showDetailsModal: false,
      selectedJob: null,
    }
  },
  computed: {
    statusOptions() {
      const statuses = new Set()
      this.jobs.forEach(job => {
        if (job.lastStatus) {
          statuses.add((job.lastStatus || '').toUpperCase())
        }
      })
      const sorted = Array.from(statuses).sort()
      return [
        { value: 'ALL', text: 'All statuses' },
        ...sorted.map(status => ({
          value: status,
          text: this.formatStatusText(status),
        })),
      ]
    },
    filteredJobs() {
      const term = this.searchTerm.trim().toLowerCase()
      return this.jobs
        .filter(job => {
          if (this.statusFilter !== 'ALL') {
            const status = (job.lastStatus || '').toUpperCase()
            if (status !== this.statusFilter) {
              return false
            }
          }

          if (this.enabledFilter !== 'ALL') {
            const shouldBeEnabled = this.enabledFilter === 'ENABLED'
            if (Boolean(job.enabled) !== shouldBeEnabled) {
              return false
            }
          }

          if (!term) {
            return true
          }

          const jobType = this.formatJobType(job.jobType || '')
          return (
            jobType.toLowerCase().includes(term) ||
            (job.description && job.description.toLowerCase().includes(term)) ||
            (job.cronExpression && job.cronExpression.toLowerCase().includes(term)) ||
            (job.checkpointValue && job.checkpointValue.toLowerCase().includes(term))
          )
        })
    },
    totalRows() {
      return this.filteredJobs.length
    },
    paginatedJobs() {
      const start = (this.currentPage - 1) * this.perPage
      return this.filteredJobs.slice(start, start + this.perPage)
    },
    startIndex() {
      return this.totalRows === 0 ? 0 : (this.currentPage - 1) * this.perPage + 1
    },
    endIndex() {
      return Math.min(this.currentPage * this.perPage, this.totalRows)
    },
    isAnyJobRunning() {
      return this.runningJobId !== null
    },
  },
  watch: {
    searchTerm() {
      this.currentPage = 1
    },
    statusFilter() {
      this.currentPage = 1
    },
    enabledFilter() {
      this.currentPage = 1
    },
    perPage() {
      this.currentPage = 1
    },
    filteredJobs(newList) {
      const maxPage = Math.max(1, Math.ceil(newList.length / this.perPage))
      if (this.currentPage > maxPage) {
        this.currentPage = maxPage
      }
    },
  },
  beforeDestroy() {
    this.clearProgressTimer()
  },
  mounted() {
    this.loadJobs()
  },
  methods: {
    async loadJobs() {
      this.loading = true
      try {
        const response = await this.$http.get('/admin/erp/jobs')
        const jobs = Array.isArray(response.data) ? response.data : []
        this.jobs = jobs
        if (this.selectedJob) {
          const refreshed = jobs.find(job => job.id === this.selectedJob.id)
          if (refreshed) {
            this.selectedJob = refreshed
          }
        }
      } catch (error) {
        console.error('Error loading ERP jobs:', error)
        this.$toast({
          component: ToastificationContent,
          props: {
            title: 'Error',
            icon: 'AlertCircleIcon',
            text: 'Failed to load ERP jobs',
            variant: 'danger',
          },
        })
      } finally {
        this.loading = false
      }
    },
    clearSearch() {
      this.searchTerm = ''
    },
    openDetails(job) {
      if (!job) {
        return
      }
      this.selectedJob = job
      this.showDetailsModal = true
    },
    handleRunClick() {
      if (!this.selectedJob || this.isAnyJobRunning) {
        return
      }
      const job = this.selectedJob
      this.showDetailsModal = false
      this.$nextTick(() => {
        this.runJob(job)
      })
    },
    isRunning(jobId) {
      return this.runningJobId === jobId
    },
    startProgressTimer() {
      this.clearProgressTimer()
      this.runProgress = 0
      this.progressTimer = setInterval(() => {
        if (this.runProgress < 90) {
          this.runProgress += 5
        }
      }, 300)
    },
    finishProgress(success = true) {
      this.runProgress = success ? 100 : 0
      setTimeout(() => {
        this.clearProgressTimer()
        this.runningJobId = null
        this.runProgress = 0
      }, success ? 300 : 0)
    },
    clearProgressTimer() {
      if (this.progressTimer) {
        clearInterval(this.progressTimer)
        this.progressTimer = null
      }
    },
    async runJob(job) {
      if (!job || this.runningJobId) {
        return
      }

      this.runningJobId = job.id
      this.startProgressTimer()

      try {
        const response = await this.$http.post(`/admin/erp/jobs/${job.id}/run`)
        const updatedJob = response && response.data ? response.data : null

        this.$toast({
          component: ToastificationContent,
          props: {
            title: 'Job executed',
            icon: 'CheckCircleIcon',
            text: `${this.formatJobType(job.jobType)} started successfully`,
            variant: 'success',
          },
        })

        if (updatedJob) {
          const existingIndex = this.jobs.findIndex(item => item.id === job.id)
          if (existingIndex !== -1) {
            this.$set(this.jobs, existingIndex, updatedJob)
          }
          if (this.selectedJob && this.selectedJob.id === updatedJob.id) {
            this.selectedJob = updatedJob
          }
        } else {
          this.loadJobs()
        }
        this.finishProgress(true)
      } catch (error) {
        console.error('Error running ERP job:', error)
        let errorMessage = 'Failed to run job'
        if (error.response && error.response.data && error.response.data.error) {
          errorMessage = error.response.data.error
        }
        this.$toast({
          component: ToastificationContent,
          props: {
            title: 'Error',
            icon: 'XIcon',
            text: errorMessage,
            variant: 'danger',
          },
        })
        if (this.selectedJob && this.selectedJob.id === job.id) {
          this.showDetailsModal = true
        }
        this.finishProgress(false)
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
    formatStatusText(status) {
      if (!status) return 'N/A'
      return status
        .toString()
        .toLowerCase()
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
    },
    formatDateTime(value) {
      if (!value) return '—'
      return moment(value).format('YYYY-MM-DD HH:mm')
    },
    statusVariant(status) {
      const normalized = (status || '').toUpperCase()
      if (normalized === 'SUCCESS') return 'success'
      if (normalized === 'FAILED' || normalized === 'ERROR') return 'danger'
      if (normalized === 'RUNNING' || normalized === 'IN_PROGRESS') return 'warning'
      return 'secondary'
    },
  },
}
</script>

<style scoped>
.erp-jobs-container {
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

.jobs-table tbody tr {
  cursor: pointer;
}
</style>
