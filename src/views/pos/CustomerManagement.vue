<template>
  <div class="customer-management-container">
    <div class="page-header">
      <h2 class="mb-0">{{ $t('pos.customerManagement.title') }}</h2>
      <div class="d-flex align-items-center">
        <b-button 
          v-if="isPosUser" 
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

        <template #cell(isDefault)="row" v-if="!isPosUser">
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

        <template #cell(actions)="row" v-if="!isPosUser">
          <div class="d-flex justify-content-end">
            <b-button 
              variant="outline-primary" 
              size="sm" 
              @click="setAsDefaultCustomer(row.item)"
              :disabled="row.item.isDefault"
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
            v-model="currentPage"
            :total-rows="totalRows"
            :per-page="perPage"
            align="center"
          />
        </div>
      </div>
    </b-card>

    <!-- Add/Edit Customer Modal -->
    <b-modal
      v-model="showAddCustomerModal"
      :title="editingCustomer ? $t('pos.customerManagement.editCustomer') : $t('pos.customerManagement.addNewCustomer')"
      size="lg"
      @ok="saveCustomer"
      @cancel="resetCustomerForm"
      :ok-disabled="!canSaveCustomer"
    >
      <b-form>
        <b-row>
          <b-col md="6" v-if="editingCustomer">
            <b-form-group :label="$t('pos.customerManagement.customerCode')" label-for="customerCode">
              <b-form-input
                id="customerCode"
                v-model="customerForm.customerCode"
                disabled
                :placeholder="$t('pos.customerManagement.autoGenerated')"
                readonly
              />
              <small class="form-text text-muted">
                {{ $t('pos.customerManagement.autoGenerated') }}
              </small>
            </b-form-group>
          </b-col>
          <b-col md="6" v-else>
            <b-form-group :label="$t('pos.customerManagement.customerCode')" label-for="customerCode">
              <b-form-input
                id="customerCode"
                :value="$t('pos.customerManagement.autoGeneratedOnSave')"
                disabled
                :placeholder="$t('pos.customerManagement.willBeAutoGenerated')"
                readonly
              />
              <small class="form-text text-muted">
                {{ $t('pos.customerManagement.willBeAutoGenerated') }}
              </small>
            </b-form-group>
          </b-col>
          <b-col md="6">
            <b-form-group :label="$t('pos.customerManagement.customerName')" label-for="name">
              <b-form-input
                id="name"
                v-model="customerForm.name"
                required
                :placeholder="$t('pos.customerManagement.customerNamePlaceholder')"
                :state="customerForm.name && customerForm.name.trim().length > 0 ? null : false"
              />
              <b-form-invalid-feedback>
                {{ $t('common.name') }} {{ $t('common.required') }}
              </b-form-invalid-feedback>
            </b-form-group>
          </b-col>
        </b-row>

        <b-row>
          <b-col md="6">
            <b-form-group :label="$t('common.email')" label-for="email">
              <b-form-input
                id="email"
                v-model="customerForm.email"
                type="email"
                :placeholder="$t('pos.customerManagement.emailPlaceholder')"
              />
            </b-form-group>
          </b-col>
          <b-col md="6">
            <b-form-group :label="$t('pos.customerManagement.phone')" label-for="phone">
              <b-form-input
                id="phone"
                v-model="customerForm.phone"
                required
                :placeholder="$t('pos.customerManagement.phonePlaceholder')"
                :state="customerForm.phone && customerForm.phone.trim().length > 0 ? null : false"
              />
              <b-form-invalid-feedback>
                {{ $t('pos.customerManagement.phone') }} {{ $t('common.required') }}
              </b-form-invalid-feedback>
            </b-form-group>
          </b-col>
        </b-row>

        <b-form-group :label="$t('pos.customerManagement.address')" label-for="address">
          <b-form-input
            id="address"
            v-model="customerForm.address"
            :placeholder="$t('pos.customerManagement.streetAddress')"
          />
        </b-form-group>

        <b-row>
          <b-col md="6">
            <b-form-group :label="$t('pos.customerManagement.city')" label-for="city">
              <b-form-input
                id="city"
                v-model="customerForm.city"
                :placeholder="$t('pos.customerManagement.cityPlaceholder')"
              />
            </b-form-group>
          </b-col>
          <b-col md="6">
            <b-form-group :label="$t('pos.customerManagement.country')" label-for="country">
              <b-form-input
                id="country"
                v-model="customerForm.country"
                :placeholder="$t('pos.customerManagement.countryPlaceholder')"
              />
            </b-form-group>
          </b-col>
        </b-row>

        <b-row>
          <b-col md="6">
            <b-form-group :label="$t('pos.customerManagement.taxId')" label-for="taxId">
              <b-form-input
                id="taxId"
                v-model="customerForm.taxId"
                :placeholder="$t('pos.customerManagement.taxIdPlaceholder')"
              />
            </b-form-group>
          </b-col>
          <b-col md="6">
            <b-form-group :label="$t('pos.customerManagement.creditLimit')" label-for="creditLimit">
              <b-input-group prepend="$">
                <b-form-input
                  id="creditLimit"
                  v-model.number="customerForm.creditLimit"
                  type="number"
                  step="0.01"
                  min="0"
                  :placeholder="$t('pos.customerManagement.creditLimitPlaceholder')"
                />
              </b-input-group>
            </b-form-group>
          </b-col>
        </b-row>

        <b-form-group :label="$t('common.notes')" label-for="notes">
          <b-form-textarea
            id="notes"
            v-model="customerForm.notes"
            rows="3"
            :placeholder="$t('pos.customerManagement.notesPlaceholder')"
          />
        </b-form-group>

        <b-form-group v-if="editingCustomer">
          <b-form-checkbox v-model="customerForm.active">
            {{ $t('pos.customerManagement.active') }}
          </b-form-checkbox>
        </b-form-group>
      </b-form>
    </b-modal>

    <!-- Delete Confirmation Modal -->
    <b-modal
      v-model="showDeleteModal"
      :title="$t('pos.customerManagement.deleteCustomer')"
      @ok="deleteCustomer"
      ok-variant="danger"
    >
      <p>
        {{ $t('pos.customerManagement.confirmDelete') }}
        <strong>{{ customerToDelete && customerToDelete.name ? customerToDelete.name : '' }}</strong>
        ({{ customerToDelete && customerToDelete.customerCode ? customerToDelete.customerCode : '' }})?
      </p>
      <p class="text-danger">{{ $t('pos.customerManagement.deleteWarning') }}</p>
    </b-modal>

  </div>
</template>

<script>
import ToastificationContent from '@core/components/toastification/ToastificationContent.vue'
import { getUserData } from '@/auth/utils'

export default {
  name: 'CustomerManagement',
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
      showAddCustomerModal: false,
      showDeleteModal: false,
      editingCustomer: null,
      customerToDelete: null,
      paymentMethods: [],
      pendingTicketsCount: 0,
      customerForm: {
        name: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        country: '',
        taxId: '',
        creditLimit: null,
        notes: '',
        active: true
      }
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
      const fields = [
        { key: 'customerCode', label: this.$t('pos.customerManagement.tableHeaders.code'), sortable: true },
        { key: 'name', label: this.$t('pos.customerManagement.tableHeaders.name'), sortable: true },
        { key: 'contact', label: this.$t('pos.customerManagement.tableHeaders.contact') },
        { key: 'address', label: this.$t('pos.customerManagement.tableHeaders.address') },
        { key: 'active', label: this.$t('pos.customerManagement.tableHeaders.status'), sortable: true }
      ]
      // Add Default and Actions columns only for admin users (not POS users)
      if (!this.isPosUser) {
        fields.push({ key: 'isDefault', label: this.$t('pos.customerManagement.default'), sortable: true })
        fields.push({ key: 'actions', label: this.$t('pos.customerManagement.tableHeaders.actions'), sortable: false, thClass: 'text-right', tdClass: 'text-right' })
      }
      return fields
    },
    isPosUser() {
      const userData = getUserData()
      return userData && userData.role === 'POS_USER'
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
    canSaveCustomer() {
      return this.customerForm.name && 
             this.customerForm.name.trim().length > 0 &&
             this.customerForm.phone && 
             this.customerForm.phone.trim().length > 0
    },
    paymentMethodOptions() {
      return this.paymentMethods.filter(pm => pm.active !== false)
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
  mounted() {
    this.loadCustomers()
    
    // Only load payment methods for POS users
    if (this.isPosUser) {
      this.loadPaymentMethods()
      this.loadPendingTicketsCount()
    }
  },
  methods: {
    async loadCustomers() {
      this.loading = true
      try {
        const response = await this.$http.get('/customer')
        this.customers = response.data
        this.totalRows = response.data.length
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
      this.resetCustomerForm()
      this.showAddCustomerModal = true
    },
    editCustomer(customer) {
      this.editingCustomer = customer
      this.customerForm = {
        customerCode: customer.customerCode || '',
        name: customer.name || '',
        email: customer.email || '',
        phone: customer.phone || '',
        address: customer.address || '',
        city: customer.city || '',
        country: customer.country || '',
        taxId: customer.taxId || '',
        creditLimit: customer.creditLimit || null,
        notes: customer.notes || '',
        active: customer.active !== false
      }
      this.showAddCustomerModal = true
    },
    async saveCustomer() {
      if (!this.canSaveCustomer) {
        this.$toast({
          component: ToastificationContent,
          props: {
            title: this.$t('pos.customerManagement.errors.validationError'),
            icon: 'AlertCircleIcon',
            text: this.$t('pos.customerManagement.errors.fillRequiredFields'),
            variant: 'warning'
          }
        })
        return
      }

      try {
        // Prepare customer data - don't send customerCode for new customers (it will be auto-generated)
        const customerData = { ...this.customerForm }
        if (!this.editingCustomer) {
          // Remove customerCode for new customers - backend will generate it
          delete customerData.customerCode
        }

        let response
        if (this.editingCustomer) {
          // Update existing customer
          response = await this.$http.put(`/customer/${this.editingCustomer.id}`, customerData)
        } else {
          // Create new customer - customerCode will be auto-generated by backend
          response = await this.$http.post('/customer', customerData)
        }

        if (response.status === 200 || response.status === 201) {
          this.$toast({
            component: ToastificationContent,
            props: {
              title: this.$t('common.success'),
              icon: 'CheckCircleIcon',
              text: this.editingCustomer 
                ? this.$t('pos.customerManagement.success.customerUpdated')
                : this.$t('pos.customerManagement.success.customerCreated'),
              variant: 'success'
            }
          })
          this.resetCustomerForm()
          this.showAddCustomerModal = false
          await this.loadCustomers()
        }
      } catch (error) {
        console.error('Error saving customer:', error)
        let errorMessage = this.editingCustomer 
          ? this.$t('pos.customerManagement.errors.failedToUpdate')
          : this.$t('pos.customerManagement.errors.failedToCreate')
        if (error.response && error.response.data) {
          errorMessage = error.response.data || errorMessage
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
      }
    },
    isPassengerCustomer(customer) {
      return customer && customer.customerCode === 'PASSENGER'
    },
    confirmDeleteCustomer(customer) {
      // Prevent deletion of passenger customer
      if (this.isPassengerCustomer(customer)) {
        this.$toast({
          component: ToastificationContent,
          props: {
            title: this.$t('pos.customerManagement.errors.cannotDelete'),
            icon: 'AlertCircleIcon',
            text: this.$t('pos.customerManagement.errors.passengerCannotDelete'),
            variant: 'warning'
          }
        })
        return
      }
      
      this.customerToDelete = customer
      this.showDeleteModal = true
    },
    async deleteCustomer() {
      if (!this.customerToDelete) return

      // Double check - prevent deletion of passenger customer
      if (this.isPassengerCustomer(this.customerToDelete)) {
        this.$toast({
          component: ToastificationContent,
          props: {
            title: this.$t('pos.customerManagement.errors.cannotDelete'),
            icon: 'AlertCircleIcon',
            text: this.$t('pos.customerManagement.errors.passengerCannotDelete'),
            variant: 'warning'
          }
        })
        this.showDeleteModal = false
        this.customerToDelete = null
        return
      }

      try {
        const response = await this.$http.delete(`/customer/${this.customerToDelete.id}`)
        if (response.status === 204 || response.status === 200) {
          this.$toast({
            component: ToastificationContent,
            props: {
              title: this.$t('common.success'),
              icon: 'CheckCircleIcon',
              text: this.$t('pos.customerManagement.success.customerDeleted'),
              variant: 'success'
            }
          })
          this.showDeleteModal = false
          this.customerToDelete = null
          await this.loadCustomers()
        }
      } catch (error) {
        console.error('Error deleting customer:', error)
        let errorMessage = this.$t('pos.customerManagement.errors.failedToDelete')
        if (error.response && error.response.data) {
          errorMessage = error.response.data || errorMessage
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
      }
    },
    resetCustomerForm() {
      this.editingCustomer = null
      this.customerForm = {
        name: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        country: '',
        taxId: '',
        creditLimit: null,
        notes: '',
        active: true
      }
    },
    clearSearch() {
      this.searchTerm = ''
    },
    resetFilters() {
      this.searchTerm = ''
      this.statusFilter = 'all'
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
    },
    async loadPendingTicketsCount() {
      try {
        const response = await this.$http.get('/sales-header/pending-sales')
        if (response.data) {
          this.pendingTicketsCount = response.data.length || 0
        }
      } catch (error) {
        console.error('Error loading pending tickets count:', error)
        this.pendingTicketsCount = 0
      }
    },
    loadPaymentMethods() {
      this.$http.get('/payment-method')
        .then(response => {
          this.paymentMethods = response.data.filter(pm => pm.active !== false)
        })
        .catch(error => {
          console.error('Error loading payment methods:', error)
          this.paymentMethods = [
            { id: 1, name: 'Client Espèce', type: 'CLIENT_ESPECES', active: true },
            { id: 2, name: 'Return Voucher', type: 'RETURN_VOUCHER', active: true }
          ]
        })
    },
    formatPrice(price) {
      if (!price && price !== 0) return '0.00'
      return parseFloat(price).toFixed(2)
    },
    async setAsDefaultCustomer(customer) {
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
          errorMessage = error.response.data || errorMessage
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

