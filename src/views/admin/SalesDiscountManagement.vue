<template>
  <div class="sales-discount-management-container">
    <div class="page-header">
      <h2 class="mb-0">{{ $t('admin.salesDiscountManagement.title') }}</h2>
      <b-button variant="outline-primary" @click="loadSalesDiscounts">
        <feather-icon icon="RefreshCwIcon" size="16" />
        {{ $t('admin.salesDiscountManagement.refresh') }}
      </b-button>
    </div>

    <b-card class="mb-3">
      <b-row>
        <b-col cols="12" md="6">
          <b-form-group :label="$t('admin.salesDiscountManagement.search')" label-for="search-input">
            <b-input-group>
              <b-form-input
                id="search-input"
                v-model="searchTerm"
                :placeholder="$t('admin.salesDiscountManagement.searchPlaceholder')"
              />
              <b-input-group-append>
                <b-button variant="outline-secondary" @click="clearSearch" :disabled="!searchTerm">
                  <feather-icon icon="XIcon" size="14" />
                </b-button>
              </b-input-group-append>
            </b-input-group>
          </b-form-group>
        </b-col>
        <b-col cols="12" md="6" class="d-flex align-items-end justify-content-md-end">
          <small class="text-muted">
            {{ $t('admin.salesDiscountManagement.showing') }} {{ salesDiscounts.length }} {{ $t('admin.salesDiscountManagement.of') }} {{ totalRows }} {{ totalRows === 1 ? $t('admin.salesDiscountManagement.record') : $t('admin.salesDiscountManagement.records') }}
          </small>
        </b-col>
      </b-row>
    </b-card>

    <b-card>
      <b-table
        :items="paginatedSalesDiscounts"
        :fields="salesDiscountFields"
        striped
        hover
        responsive
        :busy="loading"
        show-empty
      >
        <template #table-busy>
          <div class="text-center text-danger my-2">
            <b-spinner class="align-middle" />
            <strong>{{ $t('admin.salesDiscountManagement.loading') }}</strong>
          </div>
        </template>

        <template #empty>
          <div class="text-center py-4">
            <feather-icon icon="PercentIcon" size="48" class="text-muted mb-2" />
            <p class="text-muted mb-0">{{ $t('admin.salesDiscountManagement.noRecordsFound') }}</p>
          </div>
        </template>

        <template #cell(code)="row">
          <strong>{{ row.item.code }}</strong>
        </template>

        <template #cell(lineDiscount)="row">
          <span v-if="row.item.lineDiscount">{{ formatDiscount(row.item.lineDiscount) }}</span>
          <span v-else class="text-muted">-</span>
        </template>

        <template #cell(startingDate)="row">
          <span v-if="row.item.startingDate">{{ row.item.startingDate }}</span>
          <span v-else class="text-muted">-</span>
        </template>

        <template #cell(endingDate)="row">
          <span v-if="row.item.endingDate && row.item.endingDate !== '0001-01-01'">{{ row.item.endingDate }}</span>
          <span v-else class="text-muted">-</span>
        </template>
      </b-table>

      <div class="mt-3">
        <b-row align-v="center">
          <b-col cols="12" md="6" class="mb-2 mb-md-0">
            <div class="d-flex align-items-center">
              <label for="per-page-select" class="mr-2 mb-0">{{ $t('admin.salesDiscountManagement.itemsPerPage') }}</label>
              <b-form-select
                id="per-page-select"
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
                {{ $t('admin.salesDiscountManagement.showing') }} {{ startIndex }} {{ $t('admin.salesDiscountManagement.to') }} {{ endIndex }} {{ $t('admin.salesDiscountManagement.of') }} {{ totalRows }} {{ totalRows === 1 ? $t('admin.salesDiscountManagement.record') : $t('admin.salesDiscountManagement.records') }}
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
  </div>
</template>

<script>
import ToastificationContent from '@core/components/toastification/ToastificationContent.vue'

export default {
  name: 'SalesDiscountManagement',
  data() {
    return {
      salesDiscounts: [],
      loading: false,
      searchTerm: '',
      currentPage: 1,
      perPage: 20,
      totalRows: 0,
      perPageOptions: [
        { value: 10, text: '10' },
        { value: 20, text: '20' },
        { value: 50, text: '50' },
        { value: 100, text: '100' }
      ],
    }
  },
  computed: {
    salesDiscountFields() {
      return [
        { key: 'type', label: this.$t('admin.salesDiscountManagement.tableHeaders.type'), sortable: true },
        { key: 'code', label: this.$t('admin.salesDiscountManagement.tableHeaders.code'), sortable: true },
        { key: 'salesType', label: this.$t('admin.salesDiscountManagement.tableHeaders.salesType'), sortable: true },
        { key: 'salesCode', label: this.$t('admin.salesDiscountManagement.tableHeaders.salesCode'), sortable: true },
        { key: 'lineDiscount', label: this.$t('admin.salesDiscountManagement.tableHeaders.lineDiscount'), sortable: true },
        { key: 'startingDate', label: this.$t('admin.salesDiscountManagement.tableHeaders.startingDate'), sortable: true },
        { key: 'endingDate', label: this.$t('admin.salesDiscountManagement.tableHeaders.endingDate'), sortable: true },
        { key: 'modifiedAt', label: this.$t('admin.salesDiscountManagement.tableHeaders.modifiedAt'), sortable: true }
      ]
    },
    paginatedSalesDiscounts() {
      // Backend handles pagination and search, so we display the salesDiscounts directly
      return this.salesDiscounts
    },
    startIndex() {
      if (this.totalRows === 0) return 0
      const count = this.salesDiscounts.length
      if (count === 0) return 0
      return (this.currentPage - 1) * this.perPage + 1
    },
    endIndex() {
      const count = this.salesDiscounts.length
      if (count === 0) return 0
      return (this.currentPage - 1) * this.perPage + count
    }
  },
  watch: {
    searchTerm() {
      // Reset to page 1 when search changes and reload from backend
      this.currentPage = 1
      this.loadSalesDiscounts()
    },
    perPage() {
      this.currentPage = 1
      this.loadSalesDiscounts()
    },
    currentPage() {
      this.loadSalesDiscounts()
    }
  },
  mounted() {
    this.loadSalesDiscounts()
  },
  methods: {
    async loadSalesDiscounts() {
      this.loading = true
      try {
        // Convert from 1-based (frontend) to 0-based (backend) page number
        const page = this.currentPage - 1
        const params = {
          page: page,
          size: this.perPage
        }
        
        // Add search parameter if search term exists
        if (this.searchTerm && this.searchTerm.trim()) {
          params.search = this.searchTerm.trim()
        }
        
        const response = await this.$http.get('/sales-discount/paginated', { params })
        
        // Handle Spring Page response structure
        if (response.data && response.data.content) {
          this.salesDiscounts = Array.isArray(response.data.content) ? response.data.content : []
          this.totalRows = response.data.totalElements || 0
        } else {
          // Fallback for non-page response
          this.salesDiscounts = Array.isArray(response.data) ? response.data : []
          this.totalRows = this.salesDiscounts.length
        }
      } catch (error) {
        console.error('Error loading sales discounts:', error)
        this.$toast({
          component: ToastificationContent,
          props: {
            title: this.$t('common.error'),
            icon: 'AlertCircleIcon',
            text: this.$t('admin.salesDiscountManagement.failedToLoad'),
            variant: 'danger'
          }
        })
      } finally {
        this.loading = false
      }
    },
    clearSearch() {
      this.searchTerm = ''
    },
    formatDiscount(discount) {
      if (discount == null) return '-'
      return `${discount}%`
    }
  }
}
</script>

<style scoped>
.sales-discount-management-container {
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
</style>

