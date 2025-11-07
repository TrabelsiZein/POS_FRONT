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
    <b-card class="mb-4">
      <b-row>
        <b-col cols="12" md="6">
          <b-form-group label="Search Items" label-for="search-input">
            <b-input-group>
              <b-form-input
                id="search-input"
                v-model="filters.search"
                placeholder="Search by item code, name, or barcode..."
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
          <b-form-group label="Filter" label-for="filter-type">
            <b-form-select
              id="filter-type"
              v-model="filters.filterType"
              :options="filterOptions"
              @input="onFilterChange"
            />
          </b-form-group>
        </b-col>
        <b-col cols="12" md="3" class="text-right">
          <b-button variant="secondary" @click="resetFilters" size="sm" class="mt-4">
            Reset Filters
          </b-button>
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
    <div v-else-if="filteredItems.length > 0">
      <b-card
        v-for="itemData in filteredItems"
        :key="itemData.item.id"
        class="mb-3 item-card"
      >
        <div class="item-header">
          <div class="item-info">
            <h5 class="mb-1">{{ itemData.item.name }}</h5>
            <div class="item-meta">
              <span class="item-code"><strong>Code:</strong> {{ itemData.item.itemCode }}</span>
              <span class="item-price"><strong>Price:</strong> ${{ formatPrice(itemData.item.unitPrice) }}</span>
              <span class="item-stock" v-if="itemData.item.stockQuantity !== null">
                <strong>Stock:</strong> {{ itemData.item.stockQuantity }}
              </span>
            </div>
          </div>
        </div>

        <div class="barcodes-section">
          <h6 class="mb-3">
            <feather-icon icon="HashIcon" size="18" class="mr-2" />
            Barcodes ({{ itemData.barcodes.length }})
          </h6>
          
          <div v-if="itemData.barcodes.length > 0">
            <b-table
              :items="itemData.barcodes"
              :fields="barcodeFields"
              small
              striped
              hover
              responsive
            >
              <template #cell(isPrimary)="row">
                <b-badge v-if="row.item.isPrimary" variant="success">Primary</b-badge>
                <span v-else class="text-muted">-</span>
              </template>
              <template #cell(description)="row">
                {{ row.item.description || '-' }}
              </template>
            </b-table>
          </div>
          <div v-else class="text-center py-3 text-muted">
            <feather-icon icon="HashIcon" size="24" class="mb-2" />
            <p class="mb-0">No barcodes assigned</p>
          </div>
        </div>
      </b-card>
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
      itemsWithBarcodes: [],
      loading: false,
      filters: {
        search: '',
        filterType: 'all'
      },
      filterOptions: [
        { value: 'all', text: 'All Items' },
        { value: 'withBarcodes', text: 'With Barcodes Only' },
        { value: 'withoutBarcodes', text: 'Without Barcodes Only' }
      ],
      barcodeFields: [
        { key: 'barcode', label: 'Barcode', sortable: true },
        { key: 'isPrimary', label: 'Primary', sortable: true },
        { key: 'description', label: 'Description', sortable: true }
      ]
    }
  },
  computed: {
    filteredItems() {
      let filtered = this.itemsWithBarcodes

      // Search filter
      if (this.filters.search) {
        const search = this.filters.search.toLowerCase()
        filtered = filtered.filter(itemData => {
          const item = itemData.item
          const itemMatch = 
            (item.itemCode && item.itemCode.toLowerCase().includes(search)) ||
            (item.name && item.name.toLowerCase().includes(search))
          
          // Check barcodes
          const barcodeMatch = itemData.barcodes.some(b => 
            b.barcode && b.barcode.toLowerCase().includes(search)
          )
          
          return itemMatch || barcodeMatch
        })
      }

      // Filter type
      if (this.filters.filterType === 'withBarcodes') {
        filtered = filtered.filter(itemData => itemData.barcodes.length > 0)
      } else if (this.filters.filterType === 'withoutBarcodes') {
        filtered = filtered.filter(itemData => itemData.barcodes.length === 0)
      }

      return filtered
    }
  },
  mounted() {
    this.loadData()
  },
  methods: {
    async loadData() {
      this.loading = true
      try {
        const response = await this.$http.get('/item-barcode/items-with-barcodes')
        this.itemsWithBarcodes = response.data
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
    onFilterChange() {
      // Filtering happens in computed property
    },
    clearSearch() {
      this.filters.search = ''
    },
    resetFilters() {
      this.filters = {
        search: '',
        filterType: 'all'
      }
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
  border: 1px solid #e0e0e0;
  transition: all 0.3s ease;
}

.item-card:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.item-header {
  padding-bottom: 15px;
  border-bottom: 1px solid #f0f0f0;
  margin-bottom: 15px;
}

.item-info h5 {
  color: #2c3e50;
  font-weight: 600;
}

.item-meta {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
  margin-top: 8px;
  font-size: 0.9rem;
}

.item-code,
.item-price,
.item-stock {
  color: #6c757d;
}

.barcodes-section {
  margin-top: 15px;
}

.barcodes-section h6 {
  color: #2c3e50;
  font-weight: 600;
  display: flex;
  align-items: center;
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

