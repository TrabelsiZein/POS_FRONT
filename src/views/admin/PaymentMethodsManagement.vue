<template>
  <div class="payment-methods-management-container">
    <div class="page-header">
      <h2 class="mb-0">Payment Methods</h2>
      <b-button variant="outline-primary" @click="loadPaymentMethods">
        <feather-icon icon="RefreshCwIcon" size="16" />
        Refresh
      </b-button>
    </div>

    <b-card class="mb-3">
      <b-row>
        <b-col cols="12" md="6">
          <b-form-group label="Search" label-for="search-input">
            <b-input-group>
              <b-form-input
                id="search-input"
                v-model="searchTerm"
                placeholder="Search by code, name, type, or description..."
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
            Showing {{ totalRows }} {{ totalRows === 1 ? 'payment method' : 'payment methods' }}
          </small>
        </b-col>
      </b-row>
    </b-card>

    <b-card>
      <b-table
        :items="paginatedPaymentMethods"
        :fields="paymentMethodFields"
        striped
        hover
        responsive
        :busy="loading"
        show-empty
      >
        <template #table-busy>
          <div class="text-center text-danger my-2">
            <b-spinner class="align-middle" />
            <strong> Loading...</strong>
          </div>
        </template>

        <template #empty>
          <div class="text-center py-4">
            <feather-icon icon="CreditCardIcon" size="48" class="text-muted mb-2" />
            <p class="text-muted mb-0">No payment methods found.</p>
          </div>
        </template>

        <template #cell(code)="row">
          <strong>{{ row.item.code }}</strong>
        </template>

        <template #cell(name)="row">
          {{ row.item.name }}
        </template>

        <template #cell(type)="row">
          <b-badge variant="info">
            {{ formatPaymentMethodType(row.item.type) }}
          </b-badge>
        </template>

        <template #cell(description)="row">
          <span class="small" v-if="row.item.description">{{ row.item.description }}</span>
          <span class="text-muted small" v-else>-</span>
        </template>

        <template #cell(displayOrder)="row">
          <strong>{{ row.item.displayOrder || 0 }}</strong>
        </template>

        <template #cell(active)="row">
          <b-badge :variant="row.item.active ? 'success' : 'secondary'">
            {{ row.item.active ? 'Active' : 'Inactive' }}
          </b-badge>
        </template>

        <template #cell(actions)="row">
          <div class="text-right">
            <b-button variant="outline-primary" size="sm" @click="openEditModal(row.item)">
              <feather-icon icon="EditIcon" size="14" />
            </b-button>
          </div>
        </template>
      </b-table>

      <div class="mt-3">
        <b-row align-v="center">
          <b-col cols="12" md="6" class="mb-2 mb-md-0">
            <div class="d-flex align-items-center">
              <label for="per-page-select" class="mr-2 mb-0">Items per page:</label>
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
                Showing {{ startIndex }} to {{ endIndex }} of {{ totalRows }} payment methods
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

    <b-modal v-model="showEditModal" title="Edit Payment Method" @ok="savePaymentMethod" :ok-disabled="!canSavePaymentMethod"
      @hidden="resetEditForm">
      <div v-if="paymentMethodToEdit">
        <b-form-group label="Code" label-for="payment-method-code">
          <b-form-input 
            id="payment-method-code" 
            v-model="editForm.code" 
            required
          />
        </b-form-group>

        <b-form-group label="Name" label-for="payment-method-name">
          <b-form-input 
            id="payment-method-name" 
            v-model="editForm.name" 
            required
          />
        </b-form-group>

        <b-form-group label="Type">
          <b-form-input :value="formatPaymentMethodType(paymentMethodToEdit.type)" disabled />
        </b-form-group>

        <b-form-group label="Description" label-for="payment-method-description">
          <b-form-textarea 
            id="payment-method-description" 
            v-model="editForm.description" 
            rows="3"
            placeholder="Optional description"
          />
        </b-form-group>

        <b-form-group label="Display Order" label-for="payment-method-display-order">
          <b-form-input 
            id="payment-method-display-order" 
            v-model="editForm.displayOrder" 
            type="number"
            min="0"
            required
          />
          <small class="text-muted">Lower numbers appear first in the payment methods list</small>
        </b-form-group>

        <b-form-group>
          <b-form-checkbox 
            id="payment-method-active" 
            v-model="editForm.active"
            switch
          >
            <strong>Active</strong>
            <small class="text-muted d-block">Inactive payment methods will not appear in the POS payment selection</small>
          </b-form-checkbox>
        </b-form-group>
      </div>
      <div v-else>
        <p class="text-muted mb-0">Select a payment method to edit.</p>
      </div>
    </b-modal>
  </div>
</template>

<script>
import ToastificationContent from '@core/components/toastification/ToastificationContent.vue'

export default {
  name: 'PaymentMethodsManagement',
  data() {
    return {
      paymentMethods: [],
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
      paymentMethodFields: [
        { key: 'code', label: 'Code', sortable: true },
        { key: 'name', label: 'Name', sortable: true },
        { key: 'type', label: 'Type', sortable: true },
        { key: 'description', label: 'Description', sortable: false },
        { key: 'displayOrder', label: 'Order', sortable: true },
        { key: 'active', label: 'Status', sortable: true },
        { key: 'actions', label: 'Actions', sortable: false, thClass: 'text-right', tdClass: 'text-right' }
      ],
      showEditModal: false,
      paymentMethodToEdit: null,
      editForm: {
        code: '',
        name: '',
        description: '',
        displayOrder: 0,
        active: true
      }
    }
  },
  computed: {
    filteredPaymentMethods() {
      let methods = this.paymentMethods

      // Filter by search term
      if (this.searchTerm) {
        const term = this.searchTerm.toLowerCase()
        methods = methods.filter(method => {
          return (
            (method.code && method.code.toLowerCase().includes(term)) ||
            (method.name && method.name.toLowerCase().includes(term)) ||
            (method.type && method.type.toLowerCase().includes(term)) ||
            (method.description && method.description.toLowerCase().includes(term))
          )
        })
      }

      // Sort by displayOrder (ascending), then by name
      return methods.sort((a, b) => {
        const orderA = a.displayOrder || 0
        const orderB = b.displayOrder || 0
        if (orderA !== orderB) {
          return orderA - orderB
        }
        return (a.name || '').localeCompare(b.name || '')
      })
    },
    totalRows() {
      return this.filteredPaymentMethods.length
    },
    paginatedPaymentMethods() {
      const start = (this.currentPage - 1) * this.perPage
      return this.filteredPaymentMethods.slice(start, start + this.perPage)
    },
    startIndex() {
      return this.totalRows === 0 ? 0 : (this.currentPage - 1) * this.perPage + 1
    },
    endIndex() {
      return Math.min(this.currentPage * this.perPage, this.totalRows)
    },
    canSavePaymentMethod() {
      return !!this.paymentMethodToEdit && 
             this.editForm.code && 
             this.editForm.name && 
             this.editForm.displayOrder !== null && 
             this.editForm.displayOrder !== undefined
    }
  },
  watch: {
    searchTerm() {
      this.currentPage = 1
    },
    perPage() {
      this.currentPage = 1
    },
    filteredPaymentMethods(newList) {
      const maxPage = Math.max(1, Math.ceil(newList.length / this.perPage))
      if (this.currentPage > maxPage) {
        this.currentPage = maxPage
      }
    }
  },
  mounted() {
    this.loadPaymentMethods()
  },
  methods: {
    async loadPaymentMethods() {
      this.loading = true
      try {
        const response = await this.$http.get('/payment-method')
        this.paymentMethods = Array.isArray(response.data) ? response.data : []
      } catch (error) {
        console.error('Error loading payment methods:', error)
        this.$toast({
          component: ToastificationContent,
          props: {
            title: 'Error',
            icon: 'AlertCircleIcon',
            text: 'Failed to load payment methods',
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
    formatPaymentMethodType(type) {
      if (!type) return '-'
      return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
    },
    openEditModal(method) {
      if (!method) {
        return
      }

      this.paymentMethodToEdit = method
      this.editForm = {
        code: method.code || '',
        name: method.name || '',
        description: method.description || '',
        displayOrder: method.displayOrder || 0,
        active: method.active !== undefined ? method.active : true
      }
      this.showEditModal = true
    },
    async savePaymentMethod() {
      if (!this.paymentMethodToEdit) {
        return
      }

      try {
        const payload = {
          ...this.paymentMethodToEdit,
          code: this.editForm.code.trim(),
          name: this.editForm.name.trim(),
          description: this.editForm.description ? this.editForm.description.trim() : null,
          displayOrder: parseInt(this.editForm.displayOrder) || 0,
          active: this.editForm.active !== undefined ? this.editForm.active : true
        }

        const response = await this.$http.put(`/payment-method/${this.paymentMethodToEdit.id}`, payload)

        if (response.status === 200) {
          this.$toast({
            component: ToastificationContent,
            props: {
              title: 'Success',
              icon: 'CheckCircleIcon',
              text: 'Payment method updated successfully',
              variant: 'success'
            }
          })
          this.showEditModal = false
          this.resetEditForm()
          await this.loadPaymentMethods()
        }
      } catch (error) {
        console.error('Error updating payment method:', error)
        let errorMessage = 'Failed to update payment method'
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
    resetEditForm() {
      this.paymentMethodToEdit = null
      this.editForm = {
        code: '',
        name: '',
        description: '',
        displayOrder: 0,
        active: true
      }
    }
  }
}
</script>

<style scoped>
.payment-methods-management-container {
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

