<template>
  <div class="customer-management-container">
    <div class="page-header">
      <h2 class="mb-0">{{ $t('pos.customerManagement.title') }}</h2>
      <div class="d-flex align-items-center">
        <b-button variant="outline-primary" @click="loadCustomers" class="mr-2">
          <feather-icon icon="RefreshCwIcon" size="16" />
          {{ $t('pos.customerManagement.refresh') }}
        </b-button>
        <b-button variant="primary" @click="openAddCustomerModal" disabled>
          <feather-icon icon="PlusIcon" size="16" />
          {{ $t('pos.customerManagement.addCustomer') }}
        </b-button>
      </div>
    </div>

    <!-- Filters -->
    <b-card class="mb-3">
      <b-row>
        <b-col cols="12" lg="6">
          <b-form-group :label="$t('pos.customerManagement.search')" label-for="search-input" class="mb-lg-0">
            <b-input-group>
              <b-input-group-prepend>
                <b-input-group-text class="bg-white">
                  <feather-icon icon="SearchIcon" size="16" />
                </b-input-group-text>
              </b-input-group-prepend>
              <b-form-input
                id="search-input"
                v-model="searchTerm"
                :placeholder="$t('pos.customerManagement.searchPlaceholder')"
              />
              <b-input-group-append>
                <b-button variant="outline-secondary" @click="clearSearch" :disabled="!searchTerm">
                  <feather-icon icon="XIcon" size="14" />
                </b-button>
              </b-input-group-append>
            </b-input-group>
          </b-form-group>
        </b-col>
        <b-col cols="12" lg="6">
          <b-form-group :label="$t('pos.customerManagement.filterByStatus')" label-for="status-filter" class="mb-md-0">
            <b-form-select
              id="status-filter"
              v-model="statusFilter"
              :options="statusFilterOptions"
            />
          </b-form-group>
        </b-col>
      </b-row>
      <b-row class="mt-1">
        <b-col cols="12" class="d-flex align-items-end justify-content-lg-end">
          <small class="text-muted">
            {{ $t('pos.customerManagement.showing') }} {{ totalRows }} {{ totalRows === 1 ? $t('pos.customerManagement.customer') : $t('pos.customerManagement.customers') }}
          </small>
        </b-col>
      </b-row>
    </b-card>

    <!-- Customers Table -->
    <b-card>
      <b-table
        :items="customers"
        :fields="customerFields"
        striped
        hover
        responsive
        :busy="loading"
        show-empty
      >
        <template #table-busy>
          <div class="text-center my-2">
            <b-spinner class="align-middle"></b-spinner>
            <strong>{{ $t('pos.customerManagement.loading') }}</strong>
          </div>
        </template>

        <template #empty>
          <div class="text-center py-4">
            <feather-icon icon="InboxIcon" size="48" class="text-muted mb-2" />
            <p class="text-muted mb-0">{{ $t('pos.customerManagement.noCustomersFound') }}</p>
          </div>
        </template>

        <template #cell(active)="row">
          <b-badge :variant="row.item.active ? 'success' : 'danger'">
            {{ row.item.active ? $t('pos.customerManagement.active') : $t('pos.customerManagement.inactive') }}
          </b-badge>
        </template>

        <template #cell(isDefault)="row">
          <b-badge :variant="row.item.isDefault ? 'success' : 'secondary'">
            {{ row.item.isDefault ? $t('pos.customerManagement.default') : $t('pos.customerManagement.no') }}
          </b-badge>
        </template>

        <template #cell(customerCode)="row">
          <strong>{{ row.item.customerCode }}</strong>
        </template>

        <template #cell(contact)="row">
          <div v-if="row.item.phone || row.item.email">
            <div v-if="row.item.phone" class="small">
              <feather-icon icon="PhoneIcon" size="12" class="mr-1" />
              {{ row.item.phone }}
            </div>
            <div v-if="row.item.email" class="small">
              <feather-icon icon="MailIcon" size="12" class="mr-1" />
              {{ row.item.email }}
            </div>
          </div>
          <span v-else class="text-muted small">-</span>
        </template>
 
        <template #cell(address)="row">
          <div class="small" v-if="row.item.address || row.item.city || row.item.country">
            <div v-if="row.item.address">{{ row.item.address }}</div>
            <div v-if="row.item.city || row.item.country">
              {{ [row.item.city, row.item.country].filter(Boolean).join(', ') }}
            </div>
          </div>
          <span v-else class="text-muted small">-</span>
        </template>

        <template #cell(actions)="row">
          <div class="d-flex justify-content-end">
            <b-button 
              variant="outline-primary" 
              size="sm" 
              @click="setAsDefaultCustomer(row.item)"
              :disabled="row.item.isDefault || !row.item.active"
              :title="!row.item.active ? $t('pos.customerManagement.cannotSetInactiveAsDefault') : ''"
            >
              <feather-icon icon="StarIcon" size="14" />
              {{ $t('pos.customerManagement.setAsDefault') }}
            </b-button>
          </div>
        </template>
      </b-table>

      <div class="mt-3">
        <b-row align-v="center">
          <b-col cols="12" md="6" class="mb-2 mb-md-0">
            <div class="d-flex align-items-center">
              <label for="customers-per-page" class="mr-2 mb-0">{{ $t('pos.customerManagement.itemsPerPage') }}</label>
              <b-form-select
                id="customers-per-page"
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
                {{ $t('pos.customerManagement.showing') }} {{ startIndex }} {{ $t('pos.customerManagement.to') }} {{ endIndex }} {{ $t('pos.customerManagement.of') }} {{ totalRows }} {{ totalRows === 1 ? $t('pos.customerManagement.customer') : $t('pos.customerManagement.customers') }}
              </small>
            </div>
          </b-col>
        </b-row>
        <div class="d-flex justify-content-center mt-2">
          <b-pagination
            :value="currentPage + 1"
            :total-rows="totalRows"
            :per-page="perPage"
            align="center"
            @change="onPageChange"
          />
        </div>
      </div>
    </b-card>
  </div>
</template>

<script>
import ToastificationContent from '@core/components/toastification/ToastificationContent.vue'

export default {
  name: 'CustomerManagement',
  data() {
    return {
      customers: [],
      loading: false,
      searchTerm: '',
      statusFilter: 'all',
      currentPage: 0, // Changed to 0-based for backend pagination
      perPage: 20,
      perPageOptions: [
        { value: 10, text: '10' },
        { value: 20, text: '20' },
        { value: 50, text: '50' },
        { value: 100, text: '100' }
      ],
      totalRows: 0,
      totalPages: 0,
      searchTimeout: null
    }
  },
  computed: {
    statusFilterOptions() {
      return [
        { value: 'all', text: this.$t('pos.customerManagement.statusFilterOptions.all') },
        { value: 'active', text: this.$t('pos.customerManagement.statusFilterOptions.active') },
        { value: 'inactive', text: this.$t('pos.customerManagement.statusFilterOptions.inactive') }
      ]
    },
    customerFields() {
      return [
        { key: 'customerCode', label: this.$t('pos.customerManagement.tableHeaders.code'), sortable: true },
        { key: 'name', label: this.$t('pos.customerManagement.tableHeaders.name'), sortable: true },
        { key: 'contact', label: this.$t('pos.customerManagement.tableHeaders.contact') },
        { key: 'address', label: this.$t('pos.customerManagement.tableHeaders.address') },
        { key: 'active', label: this.$t('pos.customerManagement.tableHeaders.status'), sortable: true },
        { key: 'isDefault', label: this.$t('pos.customerManagement.default'), sortable: true },
        { key: 'actions', label: this.$t('pos.customerManagement.tableHeaders.actions'), sortable: false, thClass: 'text-right', tdClass: 'text-right' }
      ]
    },
    // Removed client-side filtering - now using server-side pagination
    startIndex() {
      return this.totalRows === 0 ? 0 : (this.currentPage) * this.perPage + 1
    },
    endIndex() {
      return Math.min((this.currentPage + 1) * this.perPage, this.totalRows)
    }
  },
  watch: {
    searchTerm() {
      // Reset to first page when search changes
      this.currentPage = 0
      // Debounce search to avoid too many API calls
      if (this.searchTimeout) {
        clearTimeout(this.searchTimeout)
      }
      this.searchTimeout = setTimeout(() => {
        this.loadCustomers()
      }, 500) // Wait 500ms after user stops typing
    },
    statusFilter() {
      this.currentPage = 0
      this.loadCustomers()
    },
    perPage() {
      this.currentPage = 0
      this.loadCustomers()
    }
  },
  mounted() {
    this.loadCustomers()
  },
  methods: {
    onPageChange(page) {
      // Page is 1-based from b-pagination, convert to 0-based for backend
      this.currentPage = page - 1
      this.loadCustomers()
    },
    async loadCustomers() {
      this.loading = true
      try {
        const response = await this.$http.get('/customer/admin/paginated', {
          params: {
            page: this.currentPage,
            size: this.perPage,
            searchTerm: this.searchTerm && this.searchTerm.trim() ? this.searchTerm.trim() : null,
            statusFilter: this.statusFilter
          }
        })
        
        if (response.data) {
          this.customers = response.data.content || []
          this.totalRows = response.data.totalElements || 0
          this.totalPages = response.data.totalPages || 0
        }
      } catch (error) {
        console.error('Error loading customers:', error)
        this.$toast({
          component: ToastificationContent,
          props: {
            title: this.$t('common.error'),
            icon: 'AlertCircleIcon',
            text: this.$t('pos.customerManagement.errors.failedToLoad'),
            variant: 'danger'
          }
        })
      } finally {
        this.loading = false
      }
    },
    openAddCustomerModal() {
      // Disabled - no action
    },
    clearSearch() {
      this.searchTerm = ''
    },
    async setAsDefaultCustomer(customer) {
      // Prevent setting inactive customer as default
      if (!customer.active) {
        this.$toast({
          component: ToastificationContent,
          props: {
            title: this.$t('common.error'),
            icon: 'AlertCircleIcon',
            text: this.$t('pos.customerManagement.cannotSetInactiveAsDefault'),
            variant: 'danger'
          }
        })
        return
      }

      try {
        const { value: confirmed } = await this.$swal({
          title: this.$t('pos.customerManagement.setAsDefaultModal.title'),
          text: this.$t('pos.customerManagement.setAsDefaultModal.message', {
            name: customer.name,
            code: customer.customerCode
          }),
          icon: 'question',
          showCancelButton: true,
          confirmButtonText: this.$t('pos.customerManagement.setAsDefaultModal.confirm'),
          cancelButtonText: this.$t('pos.customerManagement.setAsDefaultModal.cancel'),
          customClass: {
            confirmButton: 'btn btn-primary',
            cancelButton: 'btn btn-outline-secondary ml-1',
          },
          buttonsStyling: false,
        })

        if (!confirmed) {
          return
        }

        this.loading = true
        const response = await this.$http.put(`/customer/${customer.id}/set-default`, {})

        if (response.status === 200) {
          this.$toast({
            component: ToastificationContent,
            props: {
              title: this.$t('common.success'),
              icon: 'CheckCircleIcon',
              text: this.$t('pos.customerManagement.defaultCustomerUpdated'),
              variant: 'success'
            }
          })
          await this.loadCustomers()
        }
      } catch (error) {
        console.error('Error setting default customer:', error)
        let errorMessage = this.$t('pos.customerManagement.failedToSetDefault')
        if (error.response && error.response.data) {
          // Try to extract error message from response
          if (typeof error.response.data === 'string') {
            errorMessage = error.response.data
          } else if (error.response.data.message) {
            errorMessage = error.response.data.message
          } else if (error.response.data.error) {
            errorMessage = error.response.data.error
          }
        }
        this.$toast({
          component: ToastificationContent,
          props: {
            title: this.$t('common.error'),
            icon: 'XIcon',
            text: errorMessage,
            variant: 'danger'
          }
        })
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style scoped>
.customer-management-container {
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

