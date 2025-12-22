<template>
  <div class="customer-list-container">
    <div class="page-header">
      <h2 class="mb-0">{{ $t('pos.customerManagement.title') }}</h2>
      <div class="d-flex align-items-center">
        <b-button 
          variant="outline-secondary" 
          @click="goBack" 
          class="mr-2"
        >
          <feather-icon icon="ArrowLeftIcon" size="16" class="mr-1" />
          {{ $t('pos.customerManagement.back') }}
        </b-button>
        <b-button variant="outline-primary" @click="loadCustomers" class="mr-2">
          <feather-icon icon="RefreshCwIcon" size="16" />
          {{ $t('pos.customerManagement.refresh') }}
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
        :items="paginatedCustomers"
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
              variant="primary" 
              size="sm" 
              @click="selectCustomerForTicket(row.item)"
            >
              <feather-icon icon="CheckIcon" size="14" />
              {{ $t('pos.customerManagement.select') }}
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
            v-model="currentPage"
            :total-rows="totalRows"
            :per-page="perPage"
            align="center"
          />
        </div>
      </div>
    </b-card>

    <!-- Badge Scan Popup -->
    <BadgeScanPopup
      :show="showBadgeScanPopup"
      :required-permission="'CONSULT_CUSTOMER_LIST'"
      :session-id="currentSessionId"
      @badge-scanned="onBadgeScanned"
      @close="onBadgeScanClose"
    />
  </div>
</template>

<script>
import ToastificationContent from '@core/components/toastification/ToastificationContent.vue'
import BadgeScanPopup from '@/components/pos/BadgeScanPopup.vue'
import { checkCurrentUserPermission, getAlwaysShowBadgeScan, BADGE_PERMISSIONS } from '@/services/badgeService'

export default {
  name: 'CustomerList',
  components: {
    BadgeScanPopup
  },
  data() {
    return {
      customers: [],
      loading: false,
      searchTerm: '',
      statusFilter: 'all',
      currentPage: 1,
      perPage: 10,
      perPageOptions: [
        { value: 10, text: '10' },
        { value: 20, text: '20' },
        { value: 50, text: '50' },
        { value: 100, text: '100' }
      ],
      showBadgeScanPopup: false,
      badgeScanRequired: false,
      badgeScanned: false
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
        { key: 'actions', label: this.$t('pos.customerManagement.tableHeaders.actions'), sortable: false, thClass: 'text-right', tdClass: 'text-right' }
      ]
    },
    filteredCustomers() {
      let filtered = this.customers

      // Filter by status
      if (this.statusFilter === 'active') {
        filtered = filtered.filter(customer => customer.active === true)
      } else if (this.statusFilter === 'inactive') {
        filtered = filtered.filter(customer => customer.active === false)
      }

      // Filter by search term
      const term = this.searchTerm.trim().toLowerCase()
      if (term) {
        filtered = filtered.filter(customer => {
          return [
            customer.customerCode,
            customer.name,
            customer.email,
            customer.phone,
            customer.city,
            customer.country,
            customer.taxId
          ].some(field => field && field.toString().toLowerCase().includes(term))
        })
      }

      return filtered
    },
    totalRows() {
      return this.filteredCustomers.length
    },
    paginatedCustomers() {
      const start = (this.currentPage - 1) * this.perPage
      return this.filteredCustomers.slice(start, start + this.perPage)
    },
    startIndex() {
      return this.totalRows === 0 ? 0 : (this.currentPage - 1) * this.perPage + 1
    },
    endIndex() {
      return Math.min(this.currentPage * this.perPage, this.totalRows)
    },
    currentSessionId() {
      const session = this.$store.state.pos?.currentSession
      return session ? session.id : null
    }
  },
  watch: {
    searchTerm() {
      this.currentPage = 1
    },
    statusFilter() {
      this.currentPage = 1
    },
    perPage() {
      this.currentPage = 1
    },
    filteredCustomers(newList) {
      const maxPage = Math.max(1, Math.ceil(newList.length / this.perPage))
      if (this.currentPage > maxPage) {
        this.currentPage = maxPage
      }
    }
  },
  async mounted() {
    // Check if badge scan is required for customer list
    // If navigating from ItemSelection (has returnTo query), badge was already checked before navigation
    const hasReturnTo = this.$route.query.returnTo
    if (hasReturnTo) {
      // Coming from ItemSelection - badge was already checked, just load customers
      this.badgeScanned = true
    } else {
      // Direct access - check badge requirement
      await this.checkBadgeRequirement()
    }
    
    if (this.badgeScanned) {
      this.loadCustomers()
    }
  },
  methods: {
    async checkBadgeRequirement() {
      try {
        const alwaysShow = await getAlwaysShowBadgeScan(this.$http)
        
        if (alwaysShow) {
          // Always show badge scan popup
          this.badgeScanRequired = true
          this.showBadgeScanPopup = true
          return
        }

        // Check if current user has valid permission (badge exists, not revoked, not expired, and has permission)
        const permissionCheck = await checkCurrentUserPermission(BADGE_PERMISSIONS.CONSULT_CUSTOMER_LIST, this.$http)
        
        if (permissionCheck.hasValidPermission) {
          // User has valid permission, allow access
          this.badgeScanned = true
        } else {
          // User doesn't have valid permission (no badge, revoked, expired, or no access), show badge scan popup
          this.badgeScanRequired = true
          this.showBadgeScanPopup = true
        }
      } catch (error) {
        console.error('Error checking badge requirement:', error)
        // On error, show badge scan popup to be safe
        this.badgeScanRequired = true
        this.showBadgeScanPopup = true
      }
    },
    onBadgeScanned() {
      this.badgeScanned = true
      this.showBadgeScanPopup = false
      this.loadCustomers()
    },
    onBadgeScanClose() {
      // If badge scan was required and user closed without scanning, go back
      if (this.badgeScanRequired && !this.badgeScanned) {
        this.goBack()
      }
    },
    selectCustomerForTicket(customer) {
      // Store selected customer in POS store
      if (this.$store.state.pos) {
        this.$store.dispatch('pos/setSelectedCustomerId', customer.id)
      }
      
      // Show success message
      this.$toast({
        component: ToastificationContent,
        props: {
          title: this.$t('pos.customerManagement.success.customerSelected'),
          icon: 'CheckCircleIcon',
          text: this.$t('pos.customerManagement.success.customerSelectedText', { name: customer.name }),
          variant: 'success'
        }
      })
      
      // Navigate back to ItemSelection
      const returnTo = this.$route.query.returnTo || 'pos-item-selection'
      this.$router.push({ name: returnTo })
    },
    async loadCustomers() {
      this.loading = true
      try {
        const response = await this.$http.get('/customer')
        this.customers = response.data
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
    clearSearch() {
      this.searchTerm = ''
    },
    goBack() {
      // Check if there's a return route in query params
      const returnTo = this.$route.query.returnTo
      
      if (returnTo) {
        // Navigate to the specified return route
        this.$router.push({ name: returnTo })
      } else {
        // Try to go back in history, fallback to item selection
        if (window.history.length > 1) {
          this.$router.go(-1)
        } else {
          this.$router.push({ name: 'pos-item-selection' })
        }
      }
    }
  }
}
</script>

<style scoped>
.customer-list-container {
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

