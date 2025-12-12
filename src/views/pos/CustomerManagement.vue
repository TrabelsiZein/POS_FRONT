<template>
  <div class="customer-management-container">
    <div class="page-header">
      <h2 class="mb-0">Customer Management</h2>
      <div class="d-flex align-items-center">
        <b-button 
          v-if="isPosUser" 
          variant="outline-secondary" 
          @click="goBack" 
          class="mr-2"
        >
          <feather-icon icon="ArrowLeftIcon" size="16" class="mr-1" />
          Back
        </b-button>
        <b-button variant="outline-primary" @click="loadCustomers" class="mr-2">
          <feather-icon icon="RefreshCwIcon" size="16" />
          Refresh
        </b-button>
        <b-button variant="primary" @click="openAddCustomerModal" disabled>
          <feather-icon icon="PlusIcon" size="16" />
          Add Customer
        </b-button>
      </div>
    </div>

    <!-- Filters -->
    <b-card class="mb-3">
      <b-row>
        <b-col cols="12" lg="6">
          <b-form-group label="Search" label-for="search-input" class="mb-lg-0">
            <b-input-group>
              <b-form-input
                id="search-input"
                v-model="searchTerm"
                placeholder="Customer Code, Name, Email, Phone..."
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
          <b-row>
            <b-col cols="12" md="6">
              <b-form-group label="Filter by Status" label-for="status-filter" class="mb-md-0">
                <b-form-select
                  id="status-filter"
                  v-model="statusFilter"
                  :options="statusFilterOptions"
                />
              </b-form-group>
            </b-col>
            <b-col cols="12" md="6">
              <b-form-group label="Filter by Default" label-for="default-filter" class="mb-md-0">
                <b-form-checkbox
                  id="default-filter"
                  v-model="showDefaultOnly"
                  class="mt-2"
                >
                  Show Default Only
                </b-form-checkbox>
              </b-form-group>
            </b-col>
          </b-row>
        </b-col>
      </b-row>
      <b-row class="mt-1">
        <b-col cols="12" class="d-flex align-items-end justify-content-lg-end">
          <small class="text-muted">
            Showing {{ totalRows }} {{ totalRows === 1 ? 'customer' : 'customers' }}
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
            <strong>Loading...</strong>
          </div>
        </template>

        <template #empty>
          <div class="text-center py-4">
            <feather-icon icon="InboxIcon" size="48" class="text-muted mb-2" />
            <p class="text-muted mb-0">No customers found.</p>
          </div>
        </template>

        <template #cell(active)="row">
          <b-badge :variant="row.item.active ? 'success' : 'danger'">
            {{ row.item.active ? 'Active' : 'Inactive' }}
          </b-badge>
        </template>

        <template #cell(isDefault)="row">
          <b-badge :variant="row.item.isDefault ? 'success' : 'secondary'">
            {{ row.item.isDefault ? 'Default' : 'No' }}
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
              :disabled="row.item.isDefault"
            >
              <feather-icon icon="StarIcon" size="14" />
              Set as Default
            </b-button>
          </div>
        </template>
      </b-table>

      <div class="mt-3">
        <b-row align-v="center">
          <b-col cols="12" md="6" class="mb-2 mb-md-0">
            <div class="d-flex align-items-center">
              <label for="customers-per-page" class="mr-2 mb-0">Items per page:</label>
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
                Showing {{ startIndex }} to {{ endIndex }} of {{ totalRows }} customers
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
      :title="editingCustomer ? 'Edit Customer' : 'Add New Customer'"
      size="lg"
      @ok="saveCustomer"
      @cancel="resetCustomerForm"
      :ok-disabled="!canSaveCustomer"
    >
      <b-form>
        <b-row>
          <b-col md="6" v-if="editingCustomer">
            <b-form-group label="Customer Code" label-for="customerCode">
              <b-form-input
                id="customerCode"
                v-model="customerForm.customerCode"
                disabled
                placeholder="Auto-generated"
                readonly
              />
              <small class="form-text text-muted">
                Customer code is auto-generated and cannot be changed
              </small>
            </b-form-group>
          </b-col>
          <b-col md="6" v-else>
            <b-form-group label="Customer Code" label-for="customerCode">
              <b-form-input
                id="customerCode"
                value="Auto-generated on save"
                disabled
                placeholder="Will be auto-generated"
                readonly
              />
              <small class="form-text text-muted">
                Customer code will be auto-generated when you save
              </small>
            </b-form-group>
          </b-col>
          <b-col md="6">
            <b-form-group label="Name" label-for="name">
              <b-form-input
                id="name"
                v-model="customerForm.name"
                required
                placeholder="Customer Name"
                :state="customerForm.name && customerForm.name.trim().length > 0 ? null : false"
              />
              <b-form-invalid-feedback>
                Name is required
              </b-form-invalid-feedback>
            </b-form-group>
          </b-col>
        </b-row>

        <b-row>
          <b-col md="6">
            <b-form-group label="Email" label-for="email">
              <b-form-input
                id="email"
                v-model="customerForm.email"
                type="email"
                placeholder="customer@example.com"
              />
            </b-form-group>
          </b-col>
          <b-col md="6">
            <b-form-group label="Phone" label-for="phone">
              <b-form-input
                id="phone"
                v-model="customerForm.phone"
                required
                placeholder="+216 98 123 456"
                :state="customerForm.phone && customerForm.phone.trim().length > 0 ? null : false"
              />
              <b-form-invalid-feedback>
                Phone is required
              </b-form-invalid-feedback>
            </b-form-group>
          </b-col>
        </b-row>

        <b-form-group label="Address" label-for="address">
          <b-form-input
            id="address"
            v-model="customerForm.address"
            placeholder="Street address"
          />
        </b-form-group>

        <b-row>
          <b-col md="6">
            <b-form-group label="City" label-for="city">
              <b-form-input
                id="city"
                v-model="customerForm.city"
                placeholder="City"
              />
            </b-form-group>
          </b-col>
          <b-col md="6">
            <b-form-group label="Country" label-for="country">
              <b-form-input
                id="country"
                v-model="customerForm.country"
                placeholder="Country"
              />
            </b-form-group>
          </b-col>
        </b-row>

        <b-row>
          <b-col md="6">
            <b-form-group label="Tax ID" label-for="taxId">
              <b-form-input
                id="taxId"
                v-model="customerForm.taxId"
                placeholder="12345678-A"
              />
            </b-form-group>
          </b-col>
          <b-col md="6">
            <b-form-group label="Credit Limit" label-for="creditLimit">
              <b-input-group prepend="$">
                <b-form-input
                  id="creditLimit"
                  v-model.number="customerForm.creditLimit"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                />
              </b-input-group>
            </b-form-group>
          </b-col>
        </b-row>

        <b-form-group label="Notes" label-for="notes">
          <b-form-textarea
            id="notes"
            v-model="customerForm.notes"
            rows="3"
            placeholder="Additional notes..."
          />
        </b-form-group>

        <b-form-group v-if="editingCustomer">
          <b-form-checkbox v-model="customerForm.active">
            Active
          </b-form-checkbox>
        </b-form-group>
      </b-form>
    </b-modal>

    <!-- Delete Confirmation Modal -->
    <b-modal
      v-model="showDeleteModal"
      title="Delete Customer"
      @ok="deleteCustomer"
      ok-variant="danger"
    >
      <p>
        Are you sure you want to delete customer
        <strong>{{ customerToDelete && customerToDelete.name ? customerToDelete.name : '' }}</strong>
        ({{ customerToDelete && customerToDelete.customerCode ? customerToDelete.customerCode : '' }})?
      </p>
      <p class="text-danger">This action cannot be undone.</p>
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
      statusFilterOptions: [
        { value: 'all', text: 'All' },
        { value: 'active', text: 'Active Only' },
        { value: 'inactive', text: 'Inactive Only' }
      ],
      showDefaultOnly: false,
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
      },
      customerFields: [
        { key: 'customerCode', label: 'Code', sortable: true },
        { key: 'name', label: 'Name', sortable: true },
        { key: 'contact', label: 'Contact' },
        { key: 'address', label: 'Address' },
        { key: 'active', label: 'Status', sortable: true },
        { key: 'isDefault', label: 'Default', sortable: true },
        { key: 'actions', label: 'Actions', sortable: false, thClass: 'text-right', tdClass: 'text-right' }
      ]
    }
  },
  computed: {
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

      // Filter by default status
      if (this.showDefaultOnly) {
        filtered = filtered.filter(customer => customer.isDefault === true)
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
    showDefaultOnly() {
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
            title: 'Error',
            icon: 'AlertCircleIcon',
            text: 'Failed to load customers',
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
            title: 'Validation Error',
            icon: 'AlertCircleIcon',
            text: 'Please fill in required fields (Name and Phone)',
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
              title: 'Success',
              icon: 'CheckCircleIcon',
              text: `Customer ${this.editingCustomer ? 'updated' : 'created'} successfully`,
              variant: 'success'
            }
          })
          this.resetCustomerForm()
          this.showAddCustomerModal = false
          await this.loadCustomers()
        }
      } catch (error) {
        console.error('Error saving customer:', error)
        let errorMessage = `Failed to ${this.editingCustomer ? 'update' : 'create'} customer. Please try again.`
        if (error.response && error.response.data) {
          errorMessage = error.response.data || errorMessage
        }
        this.$toast({
          component: ToastificationContent,
          props: {
            title: 'Error',
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
            title: 'Cannot Delete',
            icon: 'AlertCircleIcon',
            text: 'The passenger customer cannot be deleted as it is required by the system.',
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
            title: 'Cannot Delete',
            icon: 'AlertCircleIcon',
            text: 'The passenger customer cannot be deleted as it is required by the system.',
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
              title: 'Success',
              icon: 'CheckCircleIcon',
              text: 'Customer deleted successfully',
              variant: 'success'
            }
          })
          this.showDeleteModal = false
          this.customerToDelete = null
          await this.loadCustomers()
        }
      } catch (error) {
        console.error('Error deleting customer:', error)
        let errorMessage = 'Failed to delete customer. Please try again.'
        if (error.response && error.response.data) {
          errorMessage = error.response.data || errorMessage
        }
        this.$toast({
          component: ToastificationContent,
          props: {
            title: 'Error',
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
          title: 'Set as Default Customer?',
          text: `Are you sure you want to set "${customer.name}" (${customer.customerCode}) as the default customer?`,
          icon: 'question',
          showCancelButton: true,
          confirmButtonText: 'Yes, set as default',
          cancelButtonText: 'Cancel',
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
              title: 'Success',
              icon: 'CheckCircleIcon',
              text: 'Default customer updated successfully',
              variant: 'success'
            }
          })
          await this.loadCustomers()
        }
      } catch (error) {
        console.error('Error setting default customer:', error)
        let errorMessage = 'Failed to set default customer'
        if (error.response && error.response.data) {
          errorMessage = error.response.data || errorMessage
        }
        this.$toast({
          component: ToastificationContent,
          props: {
            title: 'Error',
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

