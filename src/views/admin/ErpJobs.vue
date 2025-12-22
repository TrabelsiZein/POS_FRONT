<template>
  <div class="erp-jobs-container">
    <div class="page-header">
      <h2 class="mb-0">{{ safeT('admin.erpJobs.title', 'ERP Sync Jobs') }}</h2>
      <b-button variant="outline-primary" @click="loadJobs" :disabled="loading">
        <feather-icon icon="RefreshCwIcon" size="16" class="mr-50" />
        {{ safeT('admin.erpJobs.refresh', 'Refresh') }}
      </b-button>
    </div>

    <b-card class="mb-3">
      <b-row>
        <b-col cols="12" lg="6">
          <b-form-group :label="safeT('admin.erpJobs.search', 'Search')" label-for="job-search-input" class="mb-lg-0">
            <b-input-group>
              <b-form-input id="job-search-input" v-model="searchTerm"
                :placeholder="safeT('admin.erpJobs.searchPlaceholder', 'Search by job type, description, cron, or checkpoint code...')" />
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
              <b-form-group :label="safeT('admin.erpJobs.status', 'Status')" label-for="job-status-filter" class="mb-md-0">
                <b-form-select id="job-status-filter" v-model="statusFilter" :options="statusOptions" />
              </b-form-group>
            </b-col>
            <b-col cols="12" md="6">
              <b-form-group :label="safeT('admin.erpJobs.enabled', 'Enabled')" label-for="job-enabled-filter" class="mb-0">
                <b-form-select id="job-enabled-filter" v-model="enabledFilter" :options="enabledOptions" />
              </b-form-group>
            </b-col>
          </b-row>
        </b-col>
      </b-row>
      <b-row class="mt-1">
        <b-col cols="12" class="d-flex align-items-end justify-content-lg-end">
          <small class="text-muted">
            {{ safeT('admin.erpJobs.showing', 'Showing') }} {{ totalRows }} {{ totalRows === 1 ? safeT('admin.erpJobs.job', 'job') : safeT('admin.erpJobs.jobs', 'jobs') }}
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
            <strong class="ml-1">{{ safeT('admin.erpJobs.loading', 'Loading jobs...') }}</strong>
          </div>
        </template>

        <template #empty>
          <div class="text-center py-4">
            <feather-icon icon="RefreshCwIcon" size="48" class="text-muted mb-2" />
            <p class="text-muted mb-0">{{ safeT('admin.erpJobs.noJobsFound', 'No jobs found.') }}</p>
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
          <div v-if="row.item.cronDescription" class="text-primary">
            {{ row.item.cronDescription }}
          </div>
          <span v-else class="text-muted">—</span>
        </template>

        <template #cell(enabled)="row">
          <b-badge :variant="row.item.enabled ? 'success' : 'secondary'">
            {{ row.item.enabled ? safeT('admin.erpJobs.enabled', 'Enabled') : safeT('admin.erpJobs.disabled', 'Disabled') }}
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
              <label for="jobs-per-page" class="mr-2 mb-0">{{ safeT('admin.erpJobs.itemsPerPage', 'Items per page:') }}</label>
              <b-form-select id="jobs-per-page" v-model="perPage" :options="perPageOptions" size="sm"
                style="width: auto;" />
            </div>
          </b-col>
          <b-col cols="12" md="6">
            <div class="text-center text-md-right">
              <small class="text-muted">
                {{ safeT('admin.erpJobs.showing', 'Showing') }} {{ startIndex }} {{ safeT('admin.erpJobs.to', 'to') }} {{ endIndex }} {{ safeT('admin.erpJobs.of', 'of') }} {{ totalRows }} {{ totalRows === 1 ? safeT('admin.erpJobs.job', 'job') : safeT('admin.erpJobs.jobs', 'jobs') }}
              </small>
            </div>
          </b-col>
        </b-row>
        <div class="d-flex justify-content-center mt-2">
          <b-pagination v-model="currentPage" :total-rows="totalRows" :per-page="perPage" align="center" />
        </div>
      </div>

      <b-modal v-model="showDetailsModal" :title="isEditMode ? safeT('admin.erpJobs.editJob', 'Edit Job') : safeT('admin.erpJobs.jobDetails', 'Job Details')" size="lg"
        @hide="handleModalHide">
        <div v-if="selectedJob">
          <!-- View Mode -->
          <div v-if="!isEditMode">
            <b-row>
              <b-col cols="12" md="6">
                <p><strong>{{ safeT('admin.erpJobs.jobLabel', 'Job') }}:</strong> {{ formatJobType(selectedJob.jobType) }}</p>
                <p><strong>{{ safeT('admin.erpJobs.description', 'Description') }}:</strong> {{ selectedJob.description || '—' }}</p>
                <p>
                  <strong>{{ safeT('admin.erpJobs.lastStatus', 'Last Status') }}: </strong>
                  <b-badge :variant="statusVariant(selectedJob.lastStatus)">
                    {{ formatStatusText(selectedJob.lastStatus) }}
                  </b-badge>
                </p>
                <p>
                  <strong>{{ safeT('admin.erpJobs.enabled', 'Enabled') }}: </strong>
                  <b-badge :variant="selectedJob.enabled ? 'success' : 'secondary'" class="mr-2">
                    {{ selectedJob.enabled ? safeT('admin.erpJobs.enabled', 'Enabled') : safeT('admin.erpJobs.disabled', 'Disabled') }}
                  </b-badge>
                  <b-button variant="link" size="sm" @click="toggleEnabled(selectedJob)" class="p-0">
                    {{ selectedJob.enabled ? safeT('admin.erpJobs.disable', 'Disable') : safeT('admin.erpJobs.enable', 'Enable') }}
                  </b-button>
                </p>
              </b-col>
              <b-col cols="12" md="6">
                <p v-if="selectedJob.cronDescription">
                  <strong>{{ safeT('admin.erpJobs.schedule', 'Schedule') }}:</strong> {{ selectedJob.cronDescription }}
                </p>
                <p><strong>{{ safeT('admin.erpJobs.lastRun', 'Last Run') }}:</strong> {{ formatDateTime(selectedJob.lastRunAt) || '—' }}</p>
                <p><strong>{{ safeT('admin.erpJobs.nextRun', 'Next Run') }}:</strong> {{ formatDateTime(selectedJob.nextRunAt) || '—' }}</p>
                <p>
                  <strong>{{ safeT('admin.erpJobs.checkpoint', 'Checkpoint') }}:</strong> 
                  <span v-if="selectedJob.checkpointValue">{{ selectedJob.checkpointValue }}</span>
                  <span v-else class="text-muted">—</span>
                </p>
                <p>
                  <strong>{{ safeT('admin.erpJobs.lastCheckpoint', 'Last Checkpoint') }}:</strong> 
                  {{ formatDateTime(selectedJob.lastCheckpointAt) || '—' }}
                </p>
              </b-col>
            </b-row>
          </div>

          <!-- Edit Mode -->
          <div v-else>
            <b-form-group :label="safeT('admin.erpJobs.description', 'Description')" label-for="job-description">
              <b-form-input id="job-description" v-model="editedJob.description" />
            </b-form-group>

            <b-form-group :label="safeT('admin.erpJobs.enabled', 'Enabled')" label-for="job-enabled-toggle">
              <b-form-checkbox id="job-enabled-toggle" v-model="editedJob.enabled" switch>
                {{ editedJob.enabled ? safeT('admin.erpJobs.enabled', 'Enabled') : safeT('admin.erpJobs.disabled', 'Disabled') }}
              </b-form-checkbox>
            </b-form-group>

            <CronBuilder v-model="editedJob.cronExpression" />
          </div>
        </div>

        <template #modal-footer>
          <div class="w-100 d-flex justify-content-between">
            <div>
              <b-button v-if="!isEditMode && selectedJob" variant="link" size="sm"
                @click="goToStatistics">
                <feather-icon icon="BarChartIcon" size="16" class="mr-50" />
                {{ safeT('admin.erpJobs.viewStatistics', 'View Statistics') }}
              </b-button>
            </div>
            <div class="d-flex align-items-center">
              <b-button v-if="isEditMode" variant="secondary" @click="cancelEdit" :disabled="saving" class="mr-2">
                {{ safeT('admin.erpJobs.cancel', 'Cancel') }}
              </b-button>
              <b-button v-if="!isEditMode" variant="secondary" @click="showDetailsModal = false" class="mr-2">
                {{ safeT('admin.erpJobs.close', 'Close') }}
              </b-button>
              <b-button v-if="isEditMode" variant="primary" @click="saveJob" :disabled="saving">
                <b-spinner v-if="saving" small class="mr-50" />
                {{ safeT('admin.erpJobs.save', 'Save') }}
              </b-button>
              <b-button v-if="!isEditMode && selectedJob" variant="outline-primary" @click="startEdit"
                class="mr-2">
                <feather-icon icon="EditIcon" size="16" class="mr-50" />
                {{ safeT('admin.erpJobs.edit', 'Edit') }}
              </b-button>
              <b-button v-if="!isEditMode && selectedJob" variant="primary" @click="handleRunClick"
                :disabled="isAnyJobRunning">
                <template v-if="selectedJob && isRunning(selectedJob.id)">
                  <b-spinner small class="mr-50" />
                </template>
                <template v-else>
                  <feather-icon icon="PlayCircleIcon" size="16" class="mr-50" />
                </template>
                {{ safeT('admin.erpJobs.runNow', 'Run Now') }}
              </b-button>
            </div>
          </div>
        </template>
      </b-modal>
    </b-card>
  </div>
</template>

<script>
import moment from 'moment'
import ToastificationContent from '@core/components/toastification/ToastificationContent.vue'
import CronBuilder from '@/components/CronBuilder.vue'

export default {
  name: 'ErpJobs',
  components: {
    CronBuilder,
  },
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
      runningJobId: null,
      runProgress: 0,
      progressTimer: null,
      showDetailsModal: false,
      selectedJob: null,
      isEditMode: false,
      editedJob: {
        description: '',
        cronExpression: '',
        enabled: false,
      },
      saving: false,
    }
  },
  computed: {
    jobFields() {
      if (!this.$t || typeof this.$t !== 'function') {
        return [
          { key: 'jobType', label: 'Job', sortable: true },
          { key: 'description', label: 'Description', sortable: true },
          { key: 'cronExpression', label: 'Schedule', sortable: false },
          { key: 'enabled', label: 'Enabled', sortable: true },
          { key: 'lastRunAt', label: 'Last Run', sortable: true },
          { key: 'nextRunAt', label: 'Next Run', sortable: true },
        ]
      }
      return [
        { key: 'jobType', label: this.safeT('admin.erpJobs.jobLabel', 'Job'), sortable: true },
        { key: 'description', label: this.safeT('admin.erpJobs.description', 'Description'), sortable: true },
        { key: 'cronExpression', label: this.safeT('admin.erpJobs.schedule', 'Schedule'), sortable: false },
        { key: 'enabled', label: this.safeT('admin.erpJobs.enabled', 'Enabled'), sortable: true },
        { key: 'lastRunAt', label: this.safeT('admin.erpJobs.lastRun', 'Last Run'), sortable: true },
        { key: 'nextRunAt', label: this.safeT('admin.erpJobs.nextRun', 'Next Run'), sortable: true },
      ]
    },
    enabledOptions() {
      return [
        { value: 'ALL', text: this.safeT('admin.erpJobs.allStates', 'All states') },
        { value: 'ENABLED', text: this.safeT('admin.erpJobs.enabledState', 'Enabled') },
        { value: 'DISABLED', text: this.safeT('admin.erpJobs.disabledState', 'Disabled') },
      ]
    },
    statusOptions() {
      const statuses = new Set()
      this.jobs.forEach(job => {
        if (job.lastStatus) {
          statuses.add((job.lastStatus || '').toUpperCase())
        }
      })
      const sorted = Array.from(statuses).sort()
      return [
        { value: 'ALL', text: this.safeT('admin.erpJobs.allStatuses', 'All statuses') },
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
    safeT(key, fallback = '') {
      try {
        if (!this.$t || typeof this.$t !== 'function') {
          return fallback
        }
        const result = this.$t(key)
        // VueI18n with fallbackLocale should always return a valid translation
        // Only use fallback if result is null/undefined or not a string
        if (result == null) {
          return fallback
        }
        // Return the translation result (VueI18n handles fallback automatically)
        return String(result)
      } catch (e) {
        // If error occurs, return fallback
        return fallback
      }
    },
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
            title: this.$t('common.error'),
            icon: 'AlertCircleIcon',
            text: this.$t('admin.erpJobs.failedToLoad'),
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
            title: this.$t('admin.erpJobs.jobExecuted'),
            icon: 'CheckCircleIcon',
            text: `${this.formatJobType(job.jobType)} ${this.$t('admin.erpJobs.startedSuccessfully')}`,
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
        let errorMessage = this.$t('admin.erpJobs.failedToRun')
        if (error.response && error.response.data && error.response.data.error) {
          errorMessage = error.response.data.error
        }
        this.$toast({
          component: ToastificationContent,
          props: {
            title: this.$t('common.error'),
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
      if (!jobType) return this.$t('admin.erpJobs.unknown')
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
      return moment(value).format('YYYY-MM-DD HH:mm:ss')
    },
    statusVariant(status) {
      const normalized = (status || '').toUpperCase()
      if (normalized === 'SUCCESS') return 'success'
      if (normalized === 'FAILED' || normalized === 'ERROR') return 'danger'
      if (normalized === 'RUNNING' || normalized === 'IN_PROGRESS') return 'warning'
      return 'secondary'
    },
    startEdit() {
      if (!this.selectedJob) return
      this.editedJob = {
        description: this.selectedJob.description || '',
        cronExpression: this.selectedJob.cronExpression || '',
        enabled: Boolean(this.selectedJob.enabled),
      }
      this.isEditMode = true
    },
    cancelEdit() {
      this.isEditMode = false
      this.editedJob = {
        description: '',
        cronExpression: '',
        enabled: false,
      }
    },
    handleModalHide() {
      this.isEditMode = false
      this.selectedJob = null
      this.editedJob = {
        description: '',
        cronExpression: '',
        enabled: false,
      }
    },
    async saveJob() {
      if (!this.selectedJob) return

      this.saving = true
      try {
        const response = await this.$http.put(`/admin/erp/jobs/${this.selectedJob.id}`, {
          description: this.editedJob.description,
          cronExpression: this.editedJob.cronExpression,
          enabled: this.editedJob.enabled,
        })

        const updatedJob = response && response.data ? response.data : null

        this.$toast({
          component: ToastificationContent,
          props: {
            title: this.$t('common.success'),
            icon: 'CheckCircleIcon',
            text: this.$t('admin.erpJobs.updatedSuccessfully'),
            variant: 'success',
          },
        })

        if (updatedJob) {
          const existingIndex = this.jobs.findIndex(item => item.id === this.selectedJob.id)
          if (existingIndex !== -1) {
            this.$set(this.jobs, existingIndex, updatedJob)
          }
          this.selectedJob = updatedJob
        } else {
          await this.loadJobs()
        }

        this.isEditMode = false
      } catch (error) {
        console.error('Error updating job:', error)
        let errorMessage = this.$t('admin.erpJobs.failedToUpdate')
        if (error.response && error.response.data) {
          if (error.response.data.error) {
            errorMessage = error.response.data.error
          } else if (error.response.data.message) {
            errorMessage = error.response.data.message
          }
        }
        this.$toast({
          component: ToastificationContent,
          props: {
            title: this.$t('common.error'),
            icon: 'XIcon',
            text: errorMessage,
            variant: 'danger',
          },
        })
      } finally {
        this.saving = false
      }
    },
    async toggleEnabled(job) {
      if (!job) return

      try {
        const response = await this.$http.patch(`/admin/erp/jobs/${job.id}`, {
          enabled: !job.enabled,
        })

        const updatedJob = response && response.data ? response.data : null

        this.$toast({
          component: ToastificationContent,
          props: {
            title: this.$t('common.success'),
            icon: 'CheckCircleIcon',
            text: `${this.$t('admin.erpJobs.jobLabel')} ${updatedJob && updatedJob.enabled ? this.$t('admin.erpJobs.enabledSuccessfully') : this.$t('admin.erpJobs.disabledSuccessfully')}`,
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
          await this.loadJobs()
        }
      } catch (error) {
        console.error('Error toggling job enabled status:', error)
        this.$toast({
          component: ToastificationContent,
          props: {
            title: this.$t('common.error'),
            icon: 'XIcon',
            text: this.$t('admin.erpJobs.failedToUpdateStatus'),
            variant: 'danger',
          },
        })
      }
    },
    goToStatistics() {
      if (!this.selectedJob) return
      this.$router.push({
        name: 'erp-job-statistics',
        params: { jobId: this.selectedJob.id },
      })
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
