<template>
  <div class="item-barcodes-container">
    <div class="page-header">
      <h2 class="mb-0">Item Barcodes</h2>
      <b-button variant="outline-primary" @click="loadData">
        <feather-icon icon="RefreshCwIcon" size="16" />
        Refresh
      </b-button>
    </div>

    <!-- Search and Filter -->
    <b-card class="mb-3">
      <b-row>
        <b-col cols="12" lg="6">
          <b-form-group label="Search" label-for="search-input" class="mb-lg-0">
            <b-input-group>
              <b-form-input
                id="search-input"
                v-model="searchTerm"
                placeholder="Search by item code, name, or barcode..."
                @input="scheduleSearch"
              />
              <b-input-group-append>
                <b-button variant="outline-secondary" @click="clearSearch" :disabled="!searchTerm">
                  <feather-icon icon="XIcon" size="16" />
                </b-button>
              </b-input-group-append>
            </b-input-group>
          </b-form-group>
        </b-col>
        <b-col cols="12" lg="3">
          <b-form-group label="Has Barcode" label-for="filter-type" class="mb-lg-0">
            <b-form-select
              id="filter-type"
              v-model="filterType"
              :options="filterOptions"
            />
          </b-form-group>
        </b-col>
        <b-col cols="12" lg="3" class="d-flex align-items-end justify-content-lg-end">
          <div class="d-flex align-items-center">
            <label for="items-per-page" class="mr-2 mb-0">Per page:</label>
            <b-form-select
              id="items-per-page"
              v-model="perPage"
              :options="perPageOptions"
              size="sm"
              style="width: auto;"
            />
          </div>
          <b-button variant="secondary" @click="resetFilters" size="sm" class="ml-2">
            Reset
          </b-button>
        </b-col>
      </b-row>
      <b-row class="mt-1">
        <b-col cols="12" class="d-flex align-items-end justify-content-lg-end">
          <small class="text-muted">
            Showing {{ startIndex }} to {{ endIndex }} of {{ totalElements }} items
          </small>
        </b-col>
      </b-row>
    </b-card>

    <!-- Loading State -->
    <b-card v-if="loading" class="text-center py-5">
      <div class="text-center my-2">
        <b-spinner class="align-middle"></b-spinner>
        <strong class="d-block mt-2">Loading...</strong>
      </div>
    </b-card>

    <!-- Items with Barcodes -->
    <div v-else-if="items.length > 0">
      <b-table
        :items="tableItems"
        :fields="itemFields"
        hover
        responsive
        show-empty
        small
      >
        <template #cell(unitPrice)="row">
          ${{ formatPrice(row.item.unitPrice) }}
        </template>

        <template #cell(stockQuantity)="row">
          <span v-if="row.item.stockQuantity !== null">{{ row.item.stockQuantity }}</span>
          <span v-else class="text-muted">-</span>
        </template>

        <template #cell(barcodeCount)="row">
          {{ row.item.barcodeCount }}
        </template>

        <template #cell(actions)="row">
          <b-button size="sm" variant="outline-primary" @click="row.toggleDetails">
            <feather-icon :icon="row.detailsShowing ? 'ChevronUpIcon' : 'ChevronDownIcon'" size="16" class="mr-50" />
            Details
          </b-button>
        </template>

        <template #row-details="row">
          <b-card class="mb-2">
            <h6 class="mb-2 d-flex align-items-center">
              <feather-icon icon="HashIcon" size="18" class="mr-1" />
              Barcodes ({{ row.item.barcodes.length }})
            </h6>
            <b-table
              v-if="row.item.barcodes.length > 0"
              :items="row.item.barcodes"
              :fields="barcodeFields"
              small
              responsive
              striped
              hover
            >
              <template #cell(isPrimary)="barcodeRow">
                <b-badge v-if="barcodeRow.item.isPrimary" variant="success">Primary</b-badge>
                <span v-else class="text-muted">-</span>
              </template>
              <template #cell(description)="barcodeRow">
                {{ barcodeRow.item.description || '-' }}
              </template>
            </b-table>
            <div v-else class="text-muted">No barcodes assigned for this item.</div>
          </b-card>
        </template>
      </b-table>

      <div class="d-flex justify-content-center mt-3">
        <b-pagination
          v-model="page"
          :per-page="perPage"
          :total-rows="totalElements"
          align="center"
        />
      </div>
    </div>

    <!-- Empty State -->
    <b-card v-else class="text-center py-5">
      <feather-icon icon="InboxIcon" size="48" class="text-muted mb-3" />
      <h5 class="text-muted">No Items Found</h5>
      <p class="text-muted mb-0">No items match your search criteria.</p>
    </b-card>
  </div>
</template>

<script>
import ToastificationContent from '@core/components/toastification/ToastificationContent.vue'

export default {
  name: 'ItemBarcodes',
  data() {
    return {
      items: [],
      loading: false,
      searchTerm: '',
      filterType: 'all',
      page: 1,
      perPage: 20,
      totalElements: 0,
      totalPages: 0,
      perPageOptions: [
        { value: 10, text: '10' },
        { value: 20, text: '20' },
        { value: 50, text: '50' },
        { value: 100, text: '100' },
      ],
      debounceTimer: null,
      barcodeFields: [
        { key: 'barcode', label: 'Barcode', sortable: true },
        { key: 'isPrimary', label: 'Primary', sortable: true },
        { key: 'description', label: 'Description', sortable: true }
      ],
      itemFields: [
        { key: 'itemCode', label: 'Code', sortable: true },
        { key: 'name', label: 'Name', sortable: true },
        { key: 'unitPrice', label: 'Price', sortable: true },
        { key: 'stockQuantity', label: 'Stock', sortable: true },
        { key: 'barcodeCount', label: 'Barcodes', sortable: true },
        { key: 'actions', label: '', sortable: false, class: 'text-right' }
      ]
    }
  },
  computed: {
    startIndex() {
      if (this.totalElements === 0) {
        return 0
      }
      return (this.page - 1) * this.perPage + 1
    },
    endIndex() {
      if (this.totalElements === 0) {
        return 0
      }
      return Math.min(this.page * this.perPage, this.totalElements)
    },
    tableItems() {
      return this.items.map(({ item, barcodes }) => ({
        id: item.id,
        itemCode: item.itemCode,
        name: item.name,
        unitPrice: item.unitPrice,
        stockQuantity: item.stockQuantity,
        barcodeCount: barcodes.length,
        barcodes,
      }))
    }
  },
  watch: {
    page(newValue, oldValue) {
      if (newValue !== oldValue) {
        this.loadData()
      }
    },
    perPage(newValue, oldValue) {
      if (newValue !== oldValue) {
        if (this.page === 1) {
          this.loadData()
        } else {
          this.page = 1
        }
      }
    },
    filterType(newValue, oldValue) {
      if (newValue !== oldValue) {
        this.page = 1
        this.loadData()
      }
    }
  },
  mounted() {
    this.loadData()
  },
  beforeDestroy() {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer)
    }
  },
  methods: {
    async loadData() {
      this.loading = true
      try {
        const params = {
          page: Math.max(this.page - 1, 0),
          size: this.perPage,
          filterType: this.filterType,
        }
        if (this.searchTerm) {
          params.search = this.searchTerm
        }

        const response = await this.$http.get('/item-barcode/items-with-barcodes', { params })
        const data = response.data || {}
        this.items = Array.isArray(data.content) ? data.content : []
        this.totalElements = data.totalElements || 0
        this.totalPages = data.totalPages || 0

        if (this.totalPages > 0 && this.page > this.totalPages) {
          this.page = this.totalPages
        } else if (this.totalPages === 0) {
          this.page = 1
        }
      } catch (error) {
        console.error('Error loading items with barcodes:', error)
        this.$toast({
          component: ToastificationContent,
          props: {
            title: 'Error',
            icon: 'AlertCircleIcon',
            text: 'Failed to load items and barcodes',
            variant: 'danger'
          }
        })
      } finally {
        this.loading = false
      }
    },
    scheduleSearch() {
      if (this.debounceTimer) {
        clearTimeout(this.debounceTimer)
      }
      this.debounceTimer = setTimeout(() => {
        this.page = 1
        this.loadData()
      }, 400)
    },
    clearSearch() {
      if (!this.searchTerm) {
        return
      }
      this.searchTerm = ''
      this.scheduleSearch()
    },
    resetFilters() {
      this.searchTerm = ''
      this.filterType = 'all'
      this.page = 1
      this.loadData()
    },
    formatPrice(price) {
      if (!price && price !== 0) return '0.00'
      return parseFloat(price).toFixed(2)
    }
  }
}
</script>

<style scoped>
.item-barcodes-container {
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

.item-card {
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

  .item-meta {
    flex-direction: column;
    gap: 8px;
  }
}
</style>

