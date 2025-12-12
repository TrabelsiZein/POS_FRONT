<template>
  <div class="item-barcodes-container">

    <div class="page-header">
      <h2 class="mb-0">Items/ Barcodes</h2>
      <b-button variant="outline-primary" @click="loadData">
        <feather-icon icon="RefreshCwIcon" size="16" />
        Refresh
      </b-button>
    </div>

    <!-- Filters (collapsible like tickets page) -->
    <b-card class="mb-2 filter-card">
      <div @click="toggleFilters" role="button" tabindex="0" @keyup.enter="toggleFilters">
        <div class="d-flex align-items-center justify-content-between">
          <div class="d-flex align-items-center">
            <feather-icon icon="FilterIcon" size="18" class="mr-2 text-primary" />
            <h6 class="mb-0 text-primary font-weight-bold d-flex align-items-center">
              Filters
              <span class="filters-count text-muted ml-1">({{ displayTotal }} items)</span>
            </h6>
          </div>
          <feather-icon :icon="filtersExpanded ? 'ChevronUpIcon' : 'ChevronDownIcon'" size="20" class="text-primary" />
        </div>
      </div>
      <b-collapse v-model="filtersExpanded" id="filters-collapse">
        <div class="pt-2">
          <b-row>
            <b-col cols="12" lg="6">
              <b-form-group label="Search" label-for="search-input" class="mb-lg-0">
                <b-input-group>
                  <b-form-input id="search-input" v-model="searchTerm"
                    placeholder="Search by item code, name, or barcode..." @input="scheduleSearch" />
                  <b-input-group-append>
                    <b-button variant="outline-secondary" @click="clearSearch" :disabled="!searchTerm">
                      <feather-icon icon="XIcon" />
                    </b-button>
                  </b-input-group-append>
                </b-input-group>
              </b-form-group>
            </b-col>
            <b-col cols="12" lg="3">
              <b-form-group label="Family" label-for="family-filter" class="mb-lg-0">
                <b-form-select id="family-filter" v-model="familyId" :options="familyOptions" @input="onFamilyChange" />
              </b-form-group>
            </b-col>
            <b-col cols="12" lg="3">
              <b-form-group label="Subfamily" label-for="subfamily-filter" class="mb-lg-0">
                <b-form-select id="subfamily-filter" v-model="subFamilyId" :options="subFamilyOptions"
                  :disabled="familyId === 'all'" @input="onSubFamilyChange" />
              </b-form-group>
            </b-col>
            <b-col cols="6" lg="2">
              <b-form-group label="Price min" label-for="price-min" class="mb-lg-0">
                <b-form-input id="price-min" v-model.number="priceMin" type="number" min="0" step="0.01"
                  placeholder="Min" />
              </b-form-group>
            </b-col>
            <b-col cols="6" lg="2">
              <b-form-group label="Price max" label-for="price-max" class="mb-lg-0">
                <b-form-input id="price-max" v-model.number="priceMax" type="number" min="0" step="0.01"
                  placeholder="Max" />
              </b-form-group>
            </b-col>
          </b-row>
          <b-row class="mt-1">
            <b-col cols="12" class="d-flex align-items-end justify-content-lg-end">
              <div class="filter-chips">
                <b-badge v-if="searchTerm" variant="light-primary" class="mr-50">
                  Search: "{{ searchTerm }}"
                </b-badge>
                <b-badge v-if="familyId !== 'all'" variant="light-info" class="mr-50">
                  Family: {{ selectedFamilyName }}
                </b-badge>
                <b-badge v-if="subFamilyId !== 'all'" variant="light-warning" class="mr-50">
                  Subfamily: {{ selectedSubFamilyName }}
                </b-badge>
                <b-badge v-if="priceMin !== null" variant="light-success" class="mr-50">
                  Min: {{ formatPrice(priceMin) }}
                </b-badge>
                <b-badge v-if="priceMax !== null" variant="light-success" class="mr-50">
                  Max: {{ formatPrice(priceMax) }}
                </b-badge>
              </div>
            </b-col>
          </b-row>
        </div>
      </b-collapse>
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
      <b-card class="table-card mb-0">
        <b-table :items="tableItems" :fields="itemFields" hover responsive show-empty small>
          <template #cell(unitPrice)="row">
            {{ formatPrice(row.item.unitPrice) }}
          </template>

          <template #cell(familyName)="row">
            <span v-if="row.item.familyName">{{ row.item.familyName }}</span>
            <span v-else class="text-muted">-</span>
          </template>

          <template #cell(subFamilyName)="row">
            <span v-if="row.item.subFamilyName">{{ row.item.subFamilyName }}</span>
            <span v-else class="text-muted">-</span>
          </template>

          <template #cell(actions)="row">
            <div class="d-flex align-items-center justify-content-end">
              <span class="mr-2">{{ row.item.barcodeCount }}</span>
              <b-button size="sm" variant="outline-primary" @click="row.toggleDetails">
                <feather-icon :icon="row.detailsShowing ? 'ChevronUpIcon' : 'ChevronDownIcon'" size="16" class="mr-50" />
                Details
              </b-button>
            </div>
          </template>

          <template #row-details="row">
            <b-card class="mb-2">
              <h6 class="mb-2 d-flex align-items-center">
                <feather-icon icon="HashIcon" size="18" class="mr-1" />
                Barcodes ({{ row.item.barcodes.length }})
              </h6>
              <b-table v-if="row.item.barcodes.length > 0" :items="row.item.barcodes" :fields="barcodeFields" small
                responsive striped hover>
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

        <div class="mt-3">
          <b-row align-v="center">
            <b-col cols="12" md="6" class="mb-2 mb-md-0">
              <div class="d-flex align-items-center">
                <label for="items-per-page" class="mr-2 mb-0">Items per page:</label>
                <b-form-select id="items-per-page" v-model="perPage" :options="perPageOptions" size="sm"
                  style="width: auto;" />
              </div>
            </b-col>
            <b-col cols="12" md="6">
              <div class="text-center text-md-right">
                <small class="text-muted">
                  Showing {{ startIndex }} to {{ endIndex }} of {{ totalElements }} items
                </small>
              </div>
            </b-col>
          </b-row>
          <div class="d-flex justify-content-center mt-2">
            <b-pagination v-model="page" :per-page="perPage" :total-rows="totalElements" align="center" />
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
      items: [],
      loading: false,
      searchTerm: '',
      filtersExpanded: false,
      familyId: 'all',
      subFamilyId: 'all',
      priceMin: null,
      priceMax: null,
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
        { key: 'familyName', label: 'Family', sortable: true },
        { key: 'subFamilyName', label: 'Subfamily', sortable: true },
        { key: 'unitPrice', label: 'Price', sortable: true },
        { key: 'actions', label: 'Barcodes', sortable: false, class: 'text-right' }
      ],
      families: [],
      subFamilies: []
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
      const term = (this.searchTerm || '').toLowerCase().trim()
      const hasFamily = this.familyId !== 'all'
      const hasSubFamily = this.subFamilyId !== 'all'

      const filtered = this.items.filter(({ item, barcodes }) => {
        // Local family/subfamily filter
        const familyMatch = !hasFamily || (item.itemFamily && item.itemFamily.id === this.familyId)
        const subFamilyMatch = !hasSubFamily || (item.itemSubFamily && item.itemSubFamily.id === this.subFamilyId)
        if (!familyMatch || !subFamilyMatch) return false

        // Search across item + barcodes
        if (!term) return true
        const inItem =
          (item.itemCode && item.itemCode.toLowerCase().includes(term)) ||
          (item.name && item.name.toLowerCase().includes(term)) ||
          (item.itemFamily && item.itemFamily.name && item.itemFamily.name.toLowerCase().includes(term)) ||
          (item.itemSubFamily && item.itemSubFamily.name && item.itemSubFamily.name.toLowerCase().includes(term))
        const hasBarcodes = Array.isArray(barcodes) && barcodes.length > 0
        const inBarcodes = hasBarcodes && barcodes.some(b => b.barcode && b.barcode.toLowerCase().includes(term))
        return inItem || inBarcodes
      })

      return filtered.map(({ item, barcodes }) => ({
        id: item.id,
        itemCode: item.itemCode,
        name: item.name,
        familyName: item.itemFamily ? item.itemFamily.name : null,
        subFamilyName: item.itemSubFamily ? item.itemSubFamily.name : null,
        unitPrice: item.unitPrice,
        barcodeCount: barcodes.length,
        barcodes,
      }))
    },
    familyOptions() {
      return [
        { value: 'all', text: 'All families' },
        ...this.families.map(f => ({ value: f.id, text: f.name }))
      ]
    },
    subFamilyOptions() {
      const scopedSubs = this.subFamilies.filter(sf => this.familyId === 'all' || (sf.itemFamily && sf.itemFamily.id === this.familyId))
      return [
        { value: 'all', text: this.familyId === 'all' ? 'Select a family first' : 'All subfamilies' },
        ...scopedSubs.map(sf => ({ value: sf.id, text: sf.name }))
      ]
    },
    selectedFamilyName() {
      if (this.familyId === 'all') return ''
      const fam = this.families.find(f => f.id === this.familyId)
      return fam ? fam.name : ''
    },
    selectedSubFamilyName() {
      if (this.subFamilyId === 'all') return ''
      const sf = this.subFamilies.find(s => s.id === this.subFamilyId)
      return sf ? sf.name : ''
    },
    displayTotal() {
      // backend total reflects current filter; fall back to local count if not present
      return this.totalElements ?? this.tableItems.length
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
    priceMin() {
      this.page = 1
      this.scheduleSearch()
    },
    priceMax() {
      this.page = 1
      this.scheduleSearch()
    }
  },
  mounted() {
    this.loadFamilies()
    this.loadSubFamilies()
    this.loadData()
  },
  beforeDestroy() {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer)
    }
  },
  methods: {
    async loadFamilies() {
      try {
        const res = await this.$http.get('/item-family')
        this.families = Array.isArray(res.data) ? res.data : []
      } catch (error) {
        console.error('Error loading families', error)
      }
    },
    async loadSubFamilies() {
      try {
        const res = await this.$http.get('/item-sub-family')
        this.subFamilies = Array.isArray(res.data) ? res.data : []
      } catch (error) {
        console.error('Error loading subfamilies', error)
      }
    },
    async loadData() {
      this.loading = true
      try {
        const params = {
          page: Math.max(this.page - 1, 0),
          size: this.perPage
        }
        if (this.searchTerm) {
          params.search = this.searchTerm
        }
        if (this.familyId !== 'all') {
          params.familyId = this.familyId
        }
        if (this.subFamilyId !== 'all') {
          params.subFamilyId = this.subFamilyId
        }
        if (this.priceMin != null && this.priceMin !== '' && !isNaN(this.priceMin)) {
          params.priceMin = parseFloat(this.priceMin)
        }
        if (this.priceMax != null && this.priceMax !== '' && !isNaN(this.priceMax)) {
          params.priceMax = parseFloat(this.priceMax)
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
    toggleFilters() {
      this.filtersExpanded = !this.filtersExpanded
    },
    clearSearch() {
      if (!this.searchTerm) {
        return
      }
      this.searchTerm = ''
      this.scheduleSearch()
    },
    onFamilyChange() {
      this.subFamilyId = 'all'
      this.page = 1
      this.loadData()
    },
    onSubFamilyChange() {
      this.page = 1
      this.loadData()
    },
    resetFilters() {
      this.searchTerm = ''
      this.familyId = 'all'
      this.subFamilyId = 'all'
      this.priceMin = null
      this.priceMax = null
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
  align-items: flex-start;
  margin-bottom: 12px;
  gap: 12px;
}

.page-header h2 {
  margin: 0;
}

.eyebrow {
  font-size: 12px;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.stats-row .stat-card {
  background: #fff;
  border: 1px solid #e9ecf2;
  border-radius: 10px;
  padding: 14px 16px;
  height: 100%;
}

.stat-label {
  font-size: 12px;
  color: #8a8f9c;
  margin-bottom: 4px;
}

.stat-value {
  margin: 0;
  color: #283046;
  font-weight: 600;
}

.filter-card {
  border: 1px solid #eef0f5;
  box-shadow: none;
}

.table-card {
  border: 1px solid #eef0f5;
  box-shadow: none;
}

.filter-chips .badge {
  padding: 6px 10px;
  border-radius: 8px;
}

@media (max-width: 991.98px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .header-actions {
    width: 100%;
    justify-content: flex-start;
  }
}

@media (max-width: 575.98px) {
  .page-header {
    align-items: stretch;
  }

  .header-actions {
    flex-direction: column;
    align-items: stretch;
  }

  .header-actions .btn {
    width: 100%;
  }
}
</style>
