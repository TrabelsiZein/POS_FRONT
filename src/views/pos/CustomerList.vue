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
        <!-- Status filter removed - only active customers are shown in POS -->
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
        :tbody-tr-class="getRowClass"
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
          <div class="d-flex justify-content-end align-items-center">
            <feather-icon 
              v-if="isCustomerSelected(row.item)" 
              icon="CheckCircleIcon" 
              size="18" 
              class="text-success mr-2"
            />
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
        <!-- Selected customer indicator (when not in current page) -->
        <b-row v-if="selectedCustomer && !isSelectedCustomerInList" class="mt-2">
          <b-col cols="12">
            <b-alert variant="info" show class="mb-0 py-2">
              <feather-icon icon="CheckCircleIcon" size="16" class="mr-2" />
              <strong>{{ $t('pos.customerManagement.selectedCustomer') }}:</strong> {{ selectedCustomer.name }} ({{ selectedCustomer.customerCode }})
            </b-alert>
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

    <!-- Badge Scan Popup -->
    <BadgeScanPopup
      :show="showBadgeScanPopup"
      :required-permission="'CONSULT_CUSTOMER_LIST'"
      :session-id="currentSessionId"
      @badge-scanned="onBadgeScanned"
      @close="onBadgeScanClose"
    />

    <!-- Customer Change Confirmation Modal -->
    <b-modal v-model="showCustomerChangeConfirm" :title="$t('pos.itemSelection.customerChangeConfirm.title')"
      @ok="confirmCustomerSelection" @cancel="cancelCustomerSelection" :ok-disabled="recalculatingCart"
      :cancel-disabled="recalculatingCart" centered>
      <div v-if="recalculatingCart" class="text-center py-3">
        <b-spinner class="mb-2" />
        <p class="mb-0">{{ $t('pos.itemSelection.customerChangeConfirm.recalculating') }}</p>
      </div>
      <div v-else>
        <p>{{ $t('pos.itemSelection.customerChangeConfirm.message') }}</p>
        <b-alert variant="warning" show>
          <strong>{{ $t('pos.itemSelection.customerChangeConfirm.warning') }}</strong>
          <p class="mb-0 mt-1">{{ $t('pos.itemSelection.customerChangeConfirm.warningText') }}</p>
        </b-alert>
      </div>
      <template #modal-ok>
        {{ $t('pos.itemSelection.customerChangeConfirm.confirm') }}
      </template>
      <template #modal-cancel>
        {{ $t('pos.itemSelection.customerChangeConfirm.cancel') }}
      </template>
    </b-modal>
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
      statusFilter: 'all', // Not used anymore (only active customers), kept for compatibility
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
      showBadgeScanPopup: false,
      badgeScanRequired: false,
      badgeScanned: false,
      showCustomerChangeConfirm: false,
      pendingCustomer: null,
      pricingEnabled: false,
      recalculatingCart: false,
      selectedCustomer: null, // Store selected customer to show in list
      searchTimeout: null
    }
  },
  computed: {
    // Status filter removed - only active customers are shown
    customerFields() {
      return [
        { key: 'customerCode', label: this.$t('pos.customerManagement.tableHeaders.code'), sortable: true },
        { key: 'name', label: this.$t('pos.customerManagement.tableHeaders.name'), sortable: true },
        { key: 'contact', label: this.$t('pos.customerManagement.tableHeaders.contact') },
        { key: 'address', label: this.$t('pos.customerManagement.tableHeaders.address') },
        { key: 'actions', label: this.$t('pos.customerManagement.tableHeaders.actions'), sortable: false, thClass: 'text-right', tdClass: 'text-right' }
      ]
    },
    // Removed client-side filtering - now using server-side pagination
    startIndex() {
      return this.totalRows === 0 ? 0 : (this.currentPage) * this.perPage + 1
    },
    endIndex() {
      return Math.min((this.currentPage + 1) * this.perPage, this.totalRows)
    },
    isSelectedCustomerInList() {
      if (!this.selectedCustomer) return false
      return this.customers.some(c => c.id === this.selectedCustomer.id)
    },
    currentSessionId() {
      const session = this.$store.state.pos?.currentSession
      return session ? session.id : null
    },
    cart() {
      return this.$store.state.pos?.cart || []
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
    perPage() {
      this.currentPage = 0
      this.loadCustomers()
    }
  },
  async mounted() {
    // Load pricing configuration to check if we need to show confirmation
    await this.loadPricingConfig()
    
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
    async selectCustomerForTicket(customer) {
      // Check if we need to show confirmation dialog
      // Only show if pricing is enabled and cart has items
      if (this.pricingEnabled && this.cart && this.cart.length > 0) {
        // Store pending customer and show confirmation
        this.pendingCustomer = customer
        this.showCustomerChangeConfirm = true
        return
      }
      
      // No confirmation needed - select customer directly (no items in cart)
      this.pendingCustomer = customer
      this.confirmCustomerSelection()
    },
    async confirmCustomerSelection() {
      if (!this.pendingCustomer) return

      // If cart has items and pricing is enabled, we'll recalculate on ItemSelection page
      // For now, just select the customer and navigate
      if (this.$store.state.pos) {
        this.$store.dispatch('pos/setSelectedCustomerId', this.pendingCustomer.id)
      }
      
      // Show success message
      // this.$toast({
      //   component: ToastificationContent,
      //   props: {
      //     title: this.$t('pos.customerManagement.success.customerSelected'),
      //     icon: 'CheckCircleIcon',
      //     text: this.$t('pos.customerManagement.success.customerSelectedText', { name: this.pendingCustomer.name }),
      //     variant: 'success'
      //   }
      // })
      
      // Close modal
      this.showCustomerChangeConfirm = false
      this.pendingCustomer = null
      
      // Always navigate to ItemSelection when customer is changed
      // This ensures items are recalculated with new customer pricing
      // User can then proceed to Payment page after seeing updated prices
      this.$router.push({ name: 'pos-item-selection' })
    },
    cancelCustomerSelection() {
      // Don't select customer, just close modal
      this.showCustomerChangeConfirm = false
      this.pendingCustomer = null
    },
    async loadPricingConfig() {
      try {
        const response = await this.$http.get('/item/pricing-config')
        this.pricingEnabled = response.data.priceGroupEnabled || false
      } catch (error) {
        console.error('Error loading pricing config:', error)
        this.pricingEnabled = false
      }
    },
    onPageChange(page) {
      // Page is 1-based from b-pagination, convert to 0-based for backend
      this.currentPage = page - 1
      this.loadCustomers()
    },
    async loadCustomers() {
      this.loading = true
      try {
        // Get selected customer ID from store
        const selectedCustomerId = this.$store.state.pos?.selectedCustomerId
        
        const response = await this.$http.get('/customer/paginated', {
          params: {
            page: this.currentPage,
            size: this.perPage,
            searchTerm: this.searchTerm && this.searchTerm.trim() ? this.searchTerm.trim() : null,
            selectedCustomerId: selectedCustomerId
          }
        })
        
        if (response.data) {
          this.customers = response.data.content || []
          this.totalRows = response.data.totalElements || 0
          this.totalPages = response.data.totalPages || 0
          
          // If selected customer is provided and not in current page, add it to the list
          if (response.data.selectedCustomer) {
            this.selectedCustomer = response.data.selectedCustomer
            // Add selected customer at the beginning of the list if not already present
            const existsInList = this.customers.some(c => c.id === this.selectedCustomer.id)
            if (!existsInList) {
              this.customers.unshift(this.selectedCustomer)
            }
          } else {
            this.selectedCustomer = null
          }
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
    clearSearch() {
      this.searchTerm = ''
    },
    isCustomerSelected(customer) {
      const selectedCustomerId = this.$store.state.pos?.selectedCustomerId
      if (!selectedCustomerId) return false
      
      // Check if this customer is selected (either in list or as selectedCustomer)
      if (customer.id === selectedCustomerId) return true
      if (this.selectedCustomer && customer.id === this.selectedCustomer.id) return true
      
      return false
    },
    getRowClass(item, type) {
      if (!item || type !== 'row') return ''
      if (this.isCustomerSelected(item)) {
        return 'selected-customer-row'
      }
      return ''
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

/* Selected customer row styling */
::v-deep .selected-customer-row {
  background-color: #e8f5e9 !important;
  border-left: 4px solid #4caf50;
}

::v-deep .selected-customer-row:hover {
  background-color: #c8e6c9 !important;
}

::v-deep .selected-customer-row td {
  font-weight: 500;
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

