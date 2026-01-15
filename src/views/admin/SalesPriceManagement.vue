<template>
  <div class="sales-price-management-container">
    <div class="page-header">
      <h2 class="mb-0">{{ $t('admin.salesPriceManagement.title') }}</h2>
      <b-button variant="outline-primary" @click="loadSalesPrices">
        <feather-icon icon="RefreshCwIcon" size="16" />
        {{ $t('admin.salesPriceManagement.refresh') }}
      </b-button>
    </div>

    <b-card class="mb-3">
      <b-row>
        <b-col cols="12" md="6">
          <b-form-group :label="$t('admin.salesPriceManagement.search')" label-for="search-input">
            <b-input-group>
              <b-form-input
                id="search-input"
                v-model="searchTerm"
                :placeholder="$t('admin.salesPriceManagement.searchPlaceholder')"
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
            {{ $t('admin.salesPriceManagement.showing') }} {{ totalRows }} {{ totalRows === 1 ? $t('admin.salesPriceManagement.record') : $t('admin.salesPriceManagement.records') }}
          </small>
        </b-col>
      </b-row>
    </b-card>

    <b-card>
      <b-table
        :items="paginatedSalesPrices"
        :fields="salesPriceFields"
        striped
        hover
        responsive
        :busy="loading"
        show-empty
      >
        <template #table-busy>
          <div class="text-center text-danger my-2">
            <b-spinner class="align-middle" />
            <strong>{{ $t('admin.salesPriceManagement.loading') }}</strong>
          </div>
        </template>

        <template #empty>
          <div class="text-center py-4">
            <feather-icon icon="DollarSignIcon" size="48" class="text-muted mb-2" />
            <p class="text-muted mb-0">{{ $t('admin.salesPriceManagement.noRecordsFound') }}</p>
          </div>
        </template>

        <template #cell(itemNo)="row">
          <strong>{{ row.item.itemNo }}</strong>
        </template>

        <template #cell(unitPrice)="row">
          <span v-if="row.item.unitPrice">{{ formatPrice(row.item.unitPrice) }}</span>
          <span v-else class="text-muted">-</span>
        </template>

        <template #cell(startingDate)="row">
          <span v-if="row.item.startingDate && row.item.startingDate !== '0001-01-01'">{{ row.item.startingDate }}</span>
          <span v-else class="text-muted">-</span>
        </template>

        <template #cell(endingDate)="row">
          <span v-if="row.item.endingDate && row.item.endingDate !== '0001-01-01'">{{ row.item.endingDate }}</span>
          <span v-else class="text-muted">-</span>
        </template>

        <template #cell(currencyCode)="row">
          <span v-if="row.item.currencyCode">{{ row.item.currencyCode }}</span>
          <span v-else class="text-muted">-</span>
        </template>

        <template #cell(variantCode)="row">
          <span v-if="row.item.variantCode">{{ row.item.variantCode }}</span>
          <span v-else class="text-muted">-</span>
        </template>

        <template #cell(unitOfMeasureCode)="row">
          <span v-if="row.item.unitOfMeasureCode">{{ row.item.unitOfMeasureCode }}</span>
          <span v-else class="text-muted">-</span>
        </template>

        <template #cell(minimumQuantity)="row">
          <span v-if="row.item.minimumQuantity != null">{{ row.item.minimumQuantity }}</span>
          <span v-else class="text-muted">-</span>
        </template>
      </b-table>

      <div class="mt-3">
        <b-row align-v="center">
          <b-col cols="12" md="6" class="mb-2 mb-md-0">
            <div class="d-flex align-items-center">
              <label for="per-page-select" class="mr-2 mb-0">{{ $t('admin.salesPriceManagement.itemsPerPage') }}</label>
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
                {{ $t('admin.salesPriceManagement.showing') }} {{ startIndex }} {{ $t('admin.salesPriceManagement.to') }} {{ endIndex }} {{ $t('admin.salesPriceManagement.of') }} {{ totalRows }} {{ totalRows === 1 ? $t('admin.salesPriceManagement.record') : $t('admin.salesPriceManagement.records') }}
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
  name: 'SalesPriceManagement',
  data() {
    return {
      salesPrices: [],
      loading: false,
      searchTerm: '',
      currentPage: 1,
      perPage: 10,
      perPageOptions: [
        { value: 10, text: '10' },
        { value: 20, text: '20' },
        { value: 50, text: '50' },
        { value: 100, text: '100' }
      ],
    }
  },
  computed: {
    salesPriceFields() {
      return [
        { key: 'itemNo', label: this.$t('admin.salesPriceManagement.tableHeaders.itemNo'), sortable: true },
        { key: 'salesType', label: this.$t('admin.salesPriceManagement.tableHeaders.salesType'), sortable: true },
        { key: 'salesCode', label: this.$t('admin.salesPriceManagement.tableHeaders.salesCode'), sortable: true },
        { key: 'unitPrice', label: this.$t('admin.salesPriceManagement.tableHeaders.unitPrice'), sortable: true },
        { key: 'responsibilityCenter', label: this.$t('admin.salesPriceManagement.tableHeaders.responsibilityCenter'), sortable: false },
        { key: 'startingDate', label: this.$t('admin.salesPriceManagement.tableHeaders.startingDate'), sortable: true },
        { key: 'endingDate', label: this.$t('admin.salesPriceManagement.tableHeaders.endingDate'), sortable: true },
        { key: 'currencyCode', label: this.$t('admin.salesPriceManagement.tableHeaders.currencyCode'), sortable: true },
        { key: 'variantCode', label: this.$t('admin.salesPriceManagement.tableHeaders.variantCode'), sortable: true },
        { key: 'unitOfMeasureCode', label: this.$t('admin.salesPriceManagement.tableHeaders.unitOfMeasureCode'), sortable: true },
        { key: 'minimumQuantity', label: this.$t('admin.salesPriceManagement.tableHeaders.minimumQuantity'), sortable: true },
        { key: 'modifiedAt', label: this.$t('admin.salesPriceManagement.tableHeaders.modifiedAt'), sortable: true }
      ]
    },
    filteredSalesPrices() {
      let filtered = this.salesPrices

      // Filter by search term
      if (this.searchTerm) {
        const term = this.searchTerm.toLowerCase()
        filtered = filtered.filter(price => {
          return (
            (price.itemNo && price.itemNo.toLowerCase().includes(term)) ||
            (price.salesCode && price.salesCode.toLowerCase().includes(term)) ||
            (price.salesType && price.salesType.toLowerCase().includes(term)) ||
            (price.responsibilityCenter && price.responsibilityCenter.toLowerCase().includes(term)) ||
            (price.startingDate && price.startingDate.toLowerCase().includes(term)) ||
            (price.currencyCode && price.currencyCode.toLowerCase().includes(term)) ||
            (price.variantCode && price.variantCode.toLowerCase().includes(term)) ||
            (price.unitOfMeasureCode && price.unitOfMeasureCode.toLowerCase().includes(term)) ||
            (price.minimumQuantity != null && price.minimumQuantity.toString().includes(term))
          )
        })
      }

      return filtered
    },
    totalRows() {
      return this.filteredSalesPrices.length
    },
    paginatedSalesPrices() {
      const start = (this.currentPage - 1) * this.perPage
      return this.filteredSalesPrices.slice(start, start + this.perPage)
    },
    startIndex() {
      return this.totalRows === 0 ? 0 : (this.currentPage - 1) * this.perPage + 1
    },
    endIndex() {
      return Math.min(this.currentPage * this.perPage, this.totalRows)
    }
  },
  watch: {
    searchTerm() {
      this.currentPage = 1
    },
    perPage() {
      this.currentPage = 1
    },
    filteredSalesPrices(newList) {
      const maxPage = Math.max(1, Math.ceil(newList.length / this.perPage))
      if (this.currentPage > maxPage) {
        this.currentPage = maxPage
      }
    }
  },
  mounted() {
    this.loadSalesPrices()
  },
  methods: {
    async loadSalesPrices() {
      this.loading = true
      try {
        const response = await this.$http.get('/sales-price')
        this.salesPrices = Array.isArray(response.data) ? response.data : []
      } catch (error) {
        console.error('Error loading sales prices:', error)
        this.$toast({
          component: ToastificationContent,
          props: {
            title: this.$t('common.error'),
            icon: 'AlertCircleIcon',
            text: this.$t('admin.salesPriceManagement.failedToLoad'),
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
    formatPrice(price) {
      if (price == null) return '-'
      return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'TND'
      }).format(price)
    }
  }
}
</script>

<style scoped>
.sales-price-management-container {
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

