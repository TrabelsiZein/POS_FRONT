<template>
  <div class="payment-container">
    <!-- Loading Overlay -->
    <b-overlay :show="loading" rounded="sm" opacity="0.85" no-wrap class="loading-overlay">
      <template #overlay>
        <div class="text-center">
          <b-spinner type="grow" variant="primary" class="mb-3"></b-spinner>
          <p class="h4">Processing Payment...</p>
          <p>Creating ticket and printing receipt</p>
        </div>
      </template>
      <div></div>
    </b-overlay>

    <div class="payment-header">
      <h2>Payment</h2>
      <b-button variant="outline-secondary" @click="goBack" :disabled="loading">
        Back to Items
      </b-button>
    </div>

    <b-row class="payment-content">
      <!-- Order Summary -->
      <b-col cols="12" md="6" lg="6" class="order-col">
        <b-card>
          <h4 class="mb-3">Order Summary</h4>
          <div class="order-items">
            <div v-if="cart.length === 0" class="text-center text-muted py-4">
              <p>No items in cart</p>
            </div>
            <div v-else v-for="(item, index) in cart" :key="index" class="order-item">
              <div>
                <h6>{{ item.name }}</h6>
                <p class="text-muted">{{ item.itemCode }} - Qty: {{ item.quantity }}</p>
              </div>
              <div class="order-item-price">
                ${{ formatPrice(item.unitPrice * item.quantity) }}
              </div>
            </div>
          </div>
          <hr>
          <div class="order-summary">
            <div class="summary-row">
              <span>Subtotal:</span>
              <span>${{ formatPrice(orderSummary.subtotal) }}</span>
            </div>
            <div class="summary-row">
              <span>Tax:</span>
              <span>${{ formatPrice(orderSummary.taxAmount) }}</span>
            </div>
            <div class="summary-row total">
              <span>Total:</span>
              <span>${{ formatPrice(orderSummary.totalAmount) }}</span>
            </div>
          </div>
        </b-card>
      </b-col>

      <!-- Payment Method Selection -->
      <b-col cols="12" md="6" lg="6" class="payment-col">
        <!-- Customer Selection -->
        <b-card class="mb-3">
          <h5 class="mb-3">Customer</h5>
          <b-form-group label="Search Customer (Default: Passenger Customer)">
            <div class="position-relative">
              <b-input-group>
                <b-form-input
                  v-model="customerSearchTerm"
                  placeholder="Search by name, code, phone, or email..."
                  @input="searchCustomers"
                  @focus="showCustomerDropdown = true"
                  autocomplete="off"
                />
                <b-input-group-append>
                  <b-button variant="outline-primary" @click="goToCustomerManagement" title="Customer Management">
                    <feather-icon icon="UsersIcon" size="14" />
                  </b-button>
                </b-input-group-append>
              </b-input-group>
              
              <!-- Customer Search Results Dropdown -->
              <div v-if="showCustomerDropdown && customerSearchResults.length > 0" class="customer-search-results">
              <b-list-group>
                <b-list-group-item
                  v-for="customer in customerSearchResults"
                  :key="customer.id"
                  button
                  @click="selectCustomer(customer)"
                  class="customer-search-item"
                >
                  <div>
                    <strong>{{ customer.name }}</strong>
                    <small class="text-muted d-block">{{ customer.customerCode }}</small>
                    <small class="text-muted" v-if="customer.phone">{{ customer.phone }}</small>
                  </div>
                </b-list-group-item>
              </b-list-group>
            </div>
            
              <div v-if="showCustomerDropdown && customerSearchTerm && customerSearchResults.length === 0 && !searchingCustomers" class="customer-search-results">
                <b-list-group>
                  <b-list-group-item class="text-muted text-center">
                    No customers found
                  </b-list-group-item>
                </b-list-group>
              </div>
            </div>
            
            <small class="form-text text-muted mt-2">
              <feather-icon icon="InfoIcon" size="12" />
              Default: Passenger Customer (search to select different customer)
            </small>
          </b-form-group>
          
          <!-- Selected Customer Info -->
          <div v-if="selectedCustomer && selectedCustomer.customerCode !== 'PASSENGER'" class="customer-info mt-2 p-2 bg-light rounded">
            <div class="d-flex justify-content-between align-items-center">
              <div>
                <strong>{{ selectedCustomer.name }}</strong>
                <small class="text-muted d-block">{{ selectedCustomer.customerCode }}</small>
                <small class="text-muted" v-if="selectedCustomer.phone">{{ selectedCustomer.phone }}</small>
              </div>
              <b-button variant="link" size="sm" @click="clearCustomerSelection" class="text-danger p-0">
                <feather-icon icon="XIcon" size="16" />
              </b-button>
            </div>
          </div>
          
          <!-- Passenger Customer Info (Default) -->
          <div v-else-if="passengerCustomer" class="customer-info mt-2 p-2 bg-light rounded border-primary">
            <div class="d-flex justify-content-between align-items-center">
              <div>
                <strong>{{ passengerCustomer.name }}</strong> <b-badge variant="info" class="ml-2">Default</b-badge>
                <small class="text-muted d-block">{{ passengerCustomer.customerCode }}</small>
              </div>
            </div>
          </div>
        </b-card>

        <b-card>
          <div class="d-flex justify-content-between align-items-center mb-3">
            <h4 class="mb-0">Payments</h4>
            <b-button variant="primary" size="sm" @click="addPaymentEntry" :disabled="loading || isFullyPaid">
              <feather-icon icon="PlusIcon" size="14" />
              Add Payment
            </b-button>
          </div>

          <!-- Payment Entries -->
          <div v-if="paymentEntries.length === 0" class="text-center text-muted py-4">
            <p>No payments added yet</p>
            <p class="small">Click "Add Payment" to add a payment method</p>
          </div>

          <div v-else class="payment-entries">
            <div v-for="(entry, index) in paymentEntries" :key="index" class="payment-entry mb-3">
              <b-card class="bg-light">
                <div class="d-flex justify-content-between align-items-start mb-2">
                  <strong class="text-primary">Payment {{ index + 1 }}</strong>
                  <b-button variant="link" size="sm" @click="removePaymentEntry(index)" class="text-danger p-0" :disabled="loading">
                    <feather-icon icon="XIcon" size="16" />
                  </b-button>
                </div>

                <b-form-group label="Payment Method">
                  <b-form-select v-model="entry.paymentMethodId" :options="paymentMethodOptions" value-field="id"
                    text-field="name" @change="onPaymentMethodChange(entry)">
                  </b-form-select>
                </b-form-group>

                <!-- Return Voucher Number Input (shown when RETURN_VOUCHER is selected) -->
                <b-form-group v-if="isReturnVoucherPayment(entry)" label="Return Voucher Number *">
                  <b-input-group>
                    <b-form-input
                      v-model="entry.voucherNumber"
                      placeholder="Enter voucher number..."
                      @keyup.enter="validateVoucher(entry)"
                      :disabled="loading"
                    />
                    <b-input-group-append>
                      <b-button variant="outline-primary" @click="validateVoucher(entry)" :disabled="loading || !entry.voucherNumber">
                        <feather-icon icon="SearchIcon" size="14" />
                      </b-button>
                    </b-input-group-append>
                  </b-input-group>
                  <small class="text-muted" v-if="entry.voucherRemainingAmount !== undefined">
                    Remaining amount: ${{ formatPrice(entry.voucherRemainingAmount) }}
                  </small>
                </b-form-group>

                <b-form-group label="Amount">
                  <b-input-group prepend="$">
                    <b-form-input
                      v-model.number="entry.amount"
                      type="number"
                      step="0.01"
                      min="0.01"
                      placeholder="0.00"
                      @input="updatePaymentTotal"
                      :disabled="isReturnVoucherPayment(entry)"
                      :readonly="isReturnVoucherPayment(entry)"
                    />
                  </b-input-group>
                  <small v-if="isReturnVoucherPayment(entry)" class="text-muted">
                    Amount is automatically set from voucher
                  </small>
                </b-form-group>

                <b-form-group v-if="!isReturnVoucherPayment(entry)" label="Reference (Optional)">
                  <b-form-input v-model="entry.reference" placeholder="Check #, Card last 4, etc." />
                </b-form-group>

                <b-form-group label="Notes (Optional)">
                  <b-form-input v-model="entry.notes" placeholder="Additional notes" />
                </b-form-group>
              </b-card>
            </div>
          </div>

          <!-- Payment Summary -->
          <div v-if="paymentEntries.length > 0" class="payment-summary mt-3">
            <hr>
            <div class="summary-row">
              <span>Total Amount:</span>
              <span class="font-weight-bold">${{ formatPrice(orderSummary.totalAmount) }}</span>
            </div>
            <div class="summary-row">
              <span>Total Paid:</span>
              <span class="font-weight-bold text-success">${{ formatPrice(totalPaid) }}</span>
            </div>
            <div class="summary-row">
              <span>Remaining:</span>
              <span :class="remainingBalance > 0 ? 'text-danger' : 'text-success'" class="font-weight-bold">
                ${{ formatPrice(Math.abs(remainingBalance)) }}
              </span>
            </div>
            <div v-if="remainingBalance < 0" class="summary-row total text-success">
              <span>Change:</span>
              <span class="font-weight-bold">${{ formatPrice(Math.abs(remainingBalance)) }}</span>
            </div>
          </div>

          <b-button variant="warning" size="lg" block :disabled="cart.length === 0 || loading"
            @click="saveAsPending" class="mb-2 mt-3">
            <feather-icon icon="SaveIcon" size="18" class="mr-1" />
            <span v-if="loading">Saving...</span>
            <span v-else>Save as Pending</span>
          </b-button>

          <b-button variant="success" size="lg" block :disabled="!canCompletePayment || loading"
            @click="completePayment" class="mb-2">
            <span v-if="loading">Processing...</span>
            <span v-else>Complete Payment</span>
          </b-button>

          <b-button variant="outline-secondary" size="lg" block :disabled="loading" @click="goBack">
            Cancel
          </b-button>
        </b-card>
      </b-col>
    </b-row>

    <!-- Close Session Modal -->
    <b-modal
      id="close-session-modal"
      v-model="showCloseSessionModal"
      title="Close Cashier Session"
      size="xl"
      @ok="closeSession"
      @cancel="resetCloseSessionForm"
      @hide="resetCloseSessionForm"
      :ok-disabled="!canCloseSession"
    >
      <div class="cash-count-section">
        <div class="d-flex justify-content-between align-items-center mb-3">
          <h5>Cash Count Details</h5>
          <b-button variant="primary" size="sm" @click="addCashCountLine">
            <feather-icon icon="PlusIcon" size="14" />
            Add Line
          </b-button>
        </div>

        <!-- Cash Count Lines Table -->
        <div class="cash-count-table-container">
          <b-table
            v-if="closeSessionData.cashCountLines.length > 0"
            :items="closeSessionData.cashCountLines"
            :fields="cashCountFields"
            striped
            bordered
            small
            responsive
          >
            <template #cell(denominationValue)="row">
              <b-input-group prepend="$" size="sm">
                <b-form-input
                  v-model.number="row.item.denominationValue"
                  type="number"
                  step="0.01"
                  min="0"
                  @input="updateCashCountTotals"
                  size="sm"
                />
              </b-input-group>
            </template>
            <template #cell(quantity)="row">
              <b-form-input
                v-model.number="row.item.quantity"
                type="number"
                min="1"
                @input="updateCashCountTotals"
                size="sm"
              />
            </template>
            <template #cell(paymentMethod)="row">
              <b-form-select
                v-model="row.item.paymentMethodId"
                :options="paymentMethodOptions"
                value-field="id"
                text-field="name"
                size="sm"
              >
                <template #first>
                  <b-form-select-option :value="null">Cash</b-form-select-option>
                </template>
              </b-form-select>
            </template>
            <template #cell(referenceNumber)="row">
              <b-form-input
                v-model="row.item.referenceNumber"
                placeholder="Check #, Card last 4..."
                size="sm"
              />
            </template>
            <template #cell(lineTotal)="row">
              <strong>${{ formatPrice(row.item.denominationValue * row.item.quantity) }}</strong>
            </template>
            <template #cell(actions)="row">
              <b-button
                variant="link"
                size="sm"
                @click="removeCashCountLine(row.index)"
                class="text-danger p-0"
              >
                <feather-icon icon="XIcon" size="16" />
              </b-button>
            </template>
          </b-table>
          
          <div v-else class="text-center text-muted py-4">
            <p>No cash count lines added yet</p>
            <p class="small">Click "Add Line" to start counting cash</p>
          </div>
        </div>

        <!-- Total Summary -->
        <div v-if="closeSessionData.cashCountLines.length > 0" class="cash-count-total mt-3">
          <b-card class="bg-light">
            <div class="d-flex justify-content-between align-items-center">
              <strong>Total Counted:</strong>
              <strong class="text-success" style="font-size: 1.2rem;">
                ${{ formatPrice(calculatedTotalCash) }}
              </strong>
            </div>
          </b-card>
        </div>

        <!-- Manual Override -->
        <b-form-group label="Actual Cash (Manual Override - optional)" label-for="actual-cash" class="mt-3">
          <b-input-group prepend="$">
            <b-form-input
              id="actual-cash"
              v-model.number="closeSessionData.actualCash"
              type="number"
              step="0.01"
              min="0"
              placeholder="Leave empty to use calculated total"
            />
          </b-input-group>
          <small class="form-text text-muted">
            If provided, this value will override the calculated total from cash count lines
          </small>
        </b-form-group>

        <b-form-group label="Notes (optional)" label-for="close-notes" class="mt-3">
          <b-form-textarea
            id="close-notes"
            v-model="closeSessionData.notes"
            placeholder="Enter any notes about the cash count..."
            rows="3"
          />
        </b-form-group>
      </div>
      <template #modal-ok>
        Close Session
      </template>
    </b-modal>
  </div>
</template>

<script>
import ReceiptTemplate from '@/components/ReceiptTemplate.vue'
import ToastificationContent from '@core/components/toastification/ToastificationContent.vue'
import useJwt from '@/auth/jwt/useJwt'
import JsBarcode from 'jsbarcode'

export default {
  name: 'Payment',
  data() {
    return {
      cart: [],
      orderSummary: {},
      paymentMethods: [],
      paymentEntries: [],
      loading: false,
      customers: [],
      selectedCustomerId: null,
      customerSearchTerm: '',
      customerSearchResults: [],
      showCustomerDropdown: false,
      searchingCustomers: false,
      passengerCustomer: null,
      selectedCustomerObj: null, // Store the selected customer object
      searchTimeout: null,
      showCloseSessionModal: false,
      closeSessionData: {
        actualCash: null,
        notes: '',
        cashCountLines: []
      },
      pendingTicketsCount: 0,
      cashCountFields: [
        { key: 'denominationValue', label: 'Value', sortable: false },
        { key: 'quantity', label: 'Qty', sortable: false },
        { key: 'paymentMethod', label: 'Payment Method', sortable: false },
        { key: 'referenceNumber', label: 'Reference', sortable: false },
        { key: 'lineTotal', label: 'Total', sortable: false },
        { key: 'actions', label: '', sortable: false }
      ]
    }
  },
  computed: {
    pendingTicketId() {
      // Get pending ticket ID from store
      return this.$store.state.pos.pendingTicketId
    },
    selectedCustomer() {
      if (!this.selectedCustomerId) return this.passengerCustomer
      // Check if it's passenger customer
      if (this.passengerCustomer && this.selectedCustomerId === this.passengerCustomer.id) {
        return this.passengerCustomer
      }
      // Check in search results or loaded customer
      return this.customerSearchResults.find(c => c.id === this.selectedCustomerId) || 
             (this.selectedCustomerObj || null)
    },
    paymentMethodOptions() {
      return [{ id: null, name: 'Select payment method...' }, ...this.paymentMethods]
    },
    totalPaid() {
      return this.paymentEntries.reduce((sum, entry) => {
        const amount = parseFloat(entry.amount) || 0
        return sum + amount
      }, 0)
    },
    remainingBalance() {
      const total = this.orderSummary?.totalAmount || 0
      return total - this.totalPaid
    },
    isFullyPaid() {
      return this.remainingBalance <= 0
    },
    canCompletePayment() {
      if (this.paymentEntries.length === 0) return false
      
      // Check all entries have payment method and amount
      const allValid = this.paymentEntries.every(entry => {
        if (!entry.paymentMethodId || !entry.amount || parseFloat(entry.amount) <= 0) {
          return false
        }
        
        // For return voucher, voucher number must be provided
        if (this.isReturnVoucherPayment(entry)) {
          if (!entry.voucherNumber || !entry.voucherNumber.trim()) {
            return false
          }
        }
        
        return true
      })
      
      return allValid && this.remainingBalance <= 0
    },
    calculatedTotalCash() {
      return this.closeSessionData.cashCountLines.reduce((total, line) => {
        const value = parseFloat(line.denominationValue) || 0
        const qty = parseInt(line.quantity) || 0
        return total + (value * qty)
      }, 0)
    },
    canCloseSession() {
      // Can close if manual actualCash is provided OR cash count lines are provided
      if (this.closeSessionData.actualCash && this.closeSessionData.actualCash > 0) {
        return true
      }
      if (this.closeSessionData.cashCountLines.length > 0) {
        // All lines must have valid denomination and quantity
        return this.closeSessionData.cashCountLines.every(line => {
          return line.denominationValue && line.denominationValue > 0 &&
                 line.quantity && line.quantity > 0
        })
      }
      return false
    }
  },
  async mounted() {
    this.loadCartData()
    this.loadPaymentMethods()
    await this.loadPassengerCustomer()
    this.loadPendingTicketsCount()
    
    // Reset customer to passenger when opening payment page
    // (unless there's a pending ticket with a customer - handled in resetCustomerToPassenger)
    // Always reset for fresh sales
    this.resetCustomerToPassenger()
    
    // Listen for close session modal event from navbar
    this.$root.$on('open-close-session-modal', () => {
      this.showCloseSessionModal = true
    })
    
    // Close customer dropdown when clicking outside
    document.addEventListener('click', this.handleClickOutside)
  },
  beforeDestroy() {
    this.$root.$off('open-close-session-modal')
    document.removeEventListener('click', this.handleClickOutside)
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout)
    }
  },
  methods: {
    loadCartData() {
      // Ensure we have the pos store module
      if (!this.$store.state.pos) {
        console.error('POS store module not found')
        this.$router.push({ name: 'pos-item-selection' })
        return
      }

      this.cart = this.$store.state.pos.cart || []
      
      // Handle null orderSummary from store
      const storeSummary = this.$store.state.pos.orderSummary
      this.orderSummary = storeSummary || {
        subtotal: 0,
        taxAmount: 0,
        totalAmount: 0
      }

      // Ensure orderSummary has valid values (handle null/undefined)
      if (this.orderSummary.subtotal === null || this.orderSummary.subtotal === undefined) {
        this.orderSummary.subtotal = 0
      }
      if (this.orderSummary.taxAmount === null || this.orderSummary.taxAmount === undefined) {
        this.orderSummary.taxAmount = 0
      }
      if (this.orderSummary.totalAmount === null || this.orderSummary.totalAmount === undefined) {
        this.orderSummary.totalAmount = 0
      }

      console.log('Payment page - Cart:', this.cart)
      console.log('Payment page - Order Summary:', this.orderSummary)

      if (this.cart.length === 0) {
        this.$toast({
          title: 'No Items',
          text: 'Cart is empty. Redirecting to item selection...',
          variant: 'warning'
        })
        setTimeout(() => {
          this.$router.push({ name: 'pos-item-selection' })
        }, 1500)
      }
    },
    async loadPassengerCustomer() {
      try {
        const response = await this.$http.get('/customer/passenger')
        if (response.status === 200 && response.data) {
          this.passengerCustomer = response.data
        }
      } catch (error) {
        console.error('Error loading passenger customer:', error)
      }
    },
    resetCustomerToPassenger() {
      // Check if there's a pending ticket - if so, keep its customer
      if (this.pendingTicketId) {
        // Don't reset if we're completing a pending ticket
        // The customer from the pending ticket should be preserved
        return
      }
      
      // Reset to passenger customer
      if (this.passengerCustomer) {
        this.selectedCustomerId = this.passengerCustomer.id
        this.selectedCustomerObj = null
        this.customerSearchTerm = ''
        this.customerSearchResults = []
        this.showCustomerDropdown = false
        this.$store.dispatch('pos/setSelectedCustomerId', this.passengerCustomer.id)
      }
    },
    async loadSelectedCustomerDetails() {
      if (!this.selectedCustomerId) return
      try {
        const response = await this.$http.get(`/customer/${this.selectedCustomerId}`)
        if (response.status === 200 && response.data) {
          this.selectedCustomerObj = response.data
          // Set search term to show selected customer
          this.customerSearchTerm = `${response.data.customerCode} - ${response.data.name}`
        }
      } catch (error) {
        console.error('Error loading selected customer:', error)
      }
    },
    searchCustomers() {
      // Clear previous timeout
      if (this.searchTimeout) {
        clearTimeout(this.searchTimeout)
      }
      
      const searchTerm = this.customerSearchTerm.trim()
      
      // If empty, clear results
      if (!searchTerm) {
        this.customerSearchResults = []
        this.showCustomerDropdown = false
        return
      }
      
      // Show dropdown
      this.showCustomerDropdown = true
      
      // Debounce search (wait 300ms after user stops typing)
      this.searchTimeout = setTimeout(async () => {
        this.searchingCustomers = true
        try {
          const response = await this.$http.get('/customer/search', {
            params: { q: searchTerm }
          })
          if (response.status === 200) {
            this.customerSearchResults = response.data || []
          }
        } catch (error) {
          console.error('Error searching customers:', error)
          this.customerSearchResults = []
        } finally {
          this.searchingCustomers = false
        }
      }, 300)
    },
    selectCustomer(customer) {
      this.selectedCustomerId = customer.id
      this.selectedCustomerObj = customer
      this.customerSearchTerm = `${customer.customerCode} - ${customer.name}`
      this.showCustomerDropdown = false
      this.onCustomerChange()
    },
    clearCustomerSelection() {
      this.selectedCustomerId = this.passengerCustomer ? this.passengerCustomer.id : null
      this.selectedCustomerObj = null
      this.customerSearchTerm = ''
      this.showCustomerDropdown = false
      this.customerSearchResults = []
      this.onCustomerChange()
    },
    handleClickOutside(event) {
      // Close dropdown if clicking outside the customer search area
      if (!this.$el.contains(event.target)) {
        this.showCustomerDropdown = false
      }
    },
    onCustomerChange() {
      // Store selected customer in Vuex for persistence
      if (this.$store.state.pos) {
        this.$store.dispatch('pos/setSelectedCustomerId', this.selectedCustomerId)
      }
    },
    goToCustomerManagement() {
      // Navigate to customer management page with return route
      this.$router.push({ 
        name: 'pos-customers',
        query: { returnTo: 'pos-payment' }
      })
    },
    loadPaymentMethods() {
      this.$http.get('/payment-method')
        .then(response => {
          this.paymentMethods = response.data.filter(pm => pm.active !== false)
        })
        .catch(error => {
          console.error('Error loading payment methods:', error)
          // Set default payment methods if API fails
          this.paymentMethods = [
            { id: 1, name: 'Cash' },
            { id: 2, name: 'Card' }
          ]
        })
    },
    formatPrice(price) {
      if (!price) return '0.00'
      return parseFloat(price).toFixed(2)
    },
    goBack() {
      this.$router.push({ name: 'pos-item-selection' })
    },
    addPaymentEntry() {
      this.paymentEntries.push({
        paymentMethodId: null,
        amount: null,
        reference: '',
        notes: '',
        voucherNumber: '',
        voucherRemainingAmount: undefined
      })
      this.updatePaymentTotal()
    },
    isReturnVoucherPayment(entry) {
      if (!entry || !entry.paymentMethodId) return false
      const paymentMethod = this.paymentMethods.find(pm => pm.id === entry.paymentMethodId)
      return paymentMethod && paymentMethod.type === 'RETURN_VOUCHER'
    },
    onPaymentMethodChange(entry) {
      // Reset voucher-related fields when payment method changes
      if (!this.isReturnVoucherPayment(entry)) {
        entry.voucherNumber = ''
        entry.voucherRemainingAmount = undefined
        entry.reference = ''
        // Reset amount if it was set by voucher
        if (entry.amount && entry.amount > 0) {
          entry.amount = 0
        }
      }
      this.updatePaymentTotal()
    },
    async validateVoucher(entry) {
      if (!entry.voucherNumber || !entry.voucherNumber.trim()) {
        return
      }

      this.loading = true
      try {
        const response = await this.$http.get('/return-voucher/validate', {
          params: { voucherNumber: entry.voucherNumber.trim() }
        })

        if (response.status === 200) {
          const voucherData = response.data
          
          if (!voucherData.isValid) {
            this.$toast({
              component: ToastificationContent,
              props: {
                title: 'Invalid Voucher',
                icon: 'XIcon',
                text: 'This voucher is expired or fully used',
                variant: 'danger'
              }
            })
            entry.voucherRemainingAmount = 0
            entry.amount = 0
            entry.reference = ''
            return
          }

          // Set voucher remaining amount
          entry.voucherRemainingAmount = voucherData.remainingAmount
          
          // Auto-set amount to remaining amount (or order total if less)
          const remainingBalance = this.remainingBalance
          entry.amount = Math.min(voucherData.remainingAmount, remainingBalance)
          
          // Set reference to voucher number
          entry.reference = entry.voucherNumber.trim()
          
          this.updatePaymentTotal()
          
          this.$toast({
            component: ToastificationContent,
            props: {
              title: 'Voucher Validated',
              icon: 'CheckCircleIcon',
              text: `Voucher validated. Remaining amount: $${this.formatPrice(voucherData.remainingAmount)}`,
              variant: 'success'
            }
          })
        }
      } catch (error) {
        console.error('Error validating voucher:', error)
        let errorMessage = 'Failed to validate voucher. Please check the voucher number.'
        if (error.response && error.response.data) {
          errorMessage = error.response.data.message || error.response.data || errorMessage
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
        
        entry.voucherRemainingAmount = undefined
        entry.amount = 0
        entry.reference = ''
        this.updatePaymentTotal()
      } finally {
        this.loading = false
      }
    },
    removePaymentEntry(index) {
      this.paymentEntries.splice(index, 1)
      this.updatePaymentTotal()
    },
    updatePaymentTotal() {
      // This method is called when payment entries change
      // Force reactivity update
      this.$forceUpdate()
    },
    async printReceipt(saleData) {
      console.log('Printing receipt with data:', saleData)
      
      // Use Vue to create component instance
      const Vue = this.$root.constructor || this.$options._base
      const ReceiptComponent = Vue.extend(ReceiptTemplate)
      
      // Create component instance
      const instance = new ReceiptComponent({
        parent: this,
        propsData: { saleData }
      })
      
      // Mount the component
      instance.$mount()
      
      // Create a new window for printing
      const printWindow = window.open('', '_blank')
      if (!printWindow) {
        this.$toast({
          title: 'Print Error',
          text: 'Please allow popups to print receipts',
          variant: 'warning'
        })
        return
      }
      
      // Wait for component to mount and generate barcode
      await this.$nextTick()
      await new Promise(resolve => setTimeout(resolve, 200))
      
      // Generate barcode in the component if sales_number exists
      const barcodeValue = saleData.salesNumber || null
      if (barcodeValue && instance.$el) {
        try {
          const svgElement = instance.$el.querySelector('.barcode-svg')
          if (svgElement) {
            JsBarcode(svgElement, barcodeValue, {
              format: 'CODE128',
              width: 1.5,
              height: 40,
              displayValue: false,
              margin: 5,
              background: '#ffffff',
              lineColor: '#000000'
            })
          }
        } catch (error) {
          console.error('Error generating barcode:', error)
        }
      }
      
      // Write receipt HTML to new window
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Receipt - ${saleData.salesNumber}</title>
          <style>
            @page {
              size: 80mm auto;
              margin: 0;
            }
            body {
              margin: 0;
              padding: 10mm;
              font-family: 'Courier New', monospace;
              font-size: 12px;
              line-height: 1.4;
              background: white;
              color: black;
            }
            .receipt-template {
              width: 100%;
              max-width: 80mm;
            }
            .receipt-header { margin-bottom: 15px; }
            .receipt-header h2 { font-size: 16px; margin: 5px 0; font-weight: bold; text-align: center; }
            .receipt-header h3 { font-size: 14px; margin: 5px 0; font-weight: bold; text-align: center; }
            .receipt-divider { margin: 8px 0; text-align: center; }
            .receipt-info, .receipt-items, .receipt-totals, .receipt-payments { margin-bottom: 10px; }
            .receipt-row { display: flex; justify-content: space-between; margin-bottom: 4px; font-size: 12px; }
            .receipt-row.total { font-weight: bold; font-size: 14px; margin-top: 8px; }
            .receipt-row .label { text-align: left; }
            .receipt-row .value { text-align: right; font-weight: bold; }
            .item-name { flex: 2; text-align: left; }
            .item-qty { flex: 0.5; text-align: center; }
            .item-total { flex: 1; text-align: right; }
            .item-code { font-size: 10px; color: #666; margin-left: 10px; margin-bottom: 6px; }
            .receipt-section-header { font-weight: bold; text-align: center; margin: 8px 0; }
            .receipt-footer { margin-top: 20px; text-align: center; font-size: 11px; }
            .receipt-item { margin-bottom: 8px; }
            .payment-entry { margin-bottom: 8px; }
            .receipt-barcode { margin: 15px 0; text-align: center; }
            .barcode-container { display: flex; justify-content: center; align-items: center; margin: 10px 0; }
            .barcode-svg { max-width: 100%; height: auto; }
            .barcode-text { font-size: 11px; font-weight: bold; margin-top: 5px; letter-spacing: 1px; text-align: center; }
          </style>
        </head>
        <body>
          ${instance.$el.outerHTML}
        </body>
        </html>
      `)
      
      printWindow.document.close()
      
      // Wait for content to load and barcode to generate, then print
      setTimeout(() => {
        printWindow.focus()
        printWindow.print()
        
        // Close window after printing
        setTimeout(() => {
          printWindow.close()
          if (instance && instance.$el) {
            instance.$destroy()
          }
        }, 500)
      }, 500)
    },
    async completePayment() {
      if (!this.canCompletePayment) return

      this.loading = true

      try {
        // Prepare payments array
        const payments = this.paymentEntries
          .filter(entry => entry.paymentMethodId && entry.amount)
          .map(entry => {
            // For return voucher, use voucher number as reference
            const reference = this.isReturnVoucherPayment(entry) 
              ? (entry.voucherNumber || entry.reference || '')
              : (entry.reference || null)
            
            return {
              paymentMethodId: entry.paymentMethodId,
              amount: parseFloat(entry.amount),
              reference: reference,
              notes: entry.notes || null
            }
          })

        // Prepare complete sale request
        const saleRequest = {
          subtotal: this.orderSummary.subtotal,
          taxAmount: this.orderSummary.taxAmount,
          discountAmount: 0,
          totalAmount: this.orderSummary.totalAmount,
          paidAmount: this.totalPaid,
          changeAmount: this.remainingBalance < 0 ? Math.abs(this.remainingBalance) : 0,
          customerId: this.selectedCustomerId || null,
          notes: `Payment via ${payments.length} method(s)`,
          lines: this.cart.map(item => ({
            itemId: item.id,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            lineTotal: item.unitPrice * item.quantity
          })),
          payments: payments
        }

        // If completing a pending ticket, use complete-pending endpoint (updates existing ticket)
        // Otherwise, create a new sale (creates new ticket)
        const isPendingTicket = !!this.pendingTicketId
        
        console.log('=== Payment Processing ===')
        console.log('Pending Ticket ID:', this.pendingTicketId)
        console.log('Is Pending Ticket:', isPendingTicket)
        console.log('Cart items:', this.cart.length)
        
        let response
        if (isPendingTicket) {
          console.log(`✓ Completing pending ticket ${this.pendingTicketId} - will UPDATE existing ticket`)
          console.log(`✓ Ticket will keep same sales number`)
          response = await this.$http.post(`/sales-header/complete-pending/${this.pendingTicketId}`, saleRequest)
        } else {
          console.log('✗ Creating NEW sale - will CREATE new ticket with new number')
          response = await this.$http.post('/sales-header/process-sale', saleRequest)
        }
        
        console.log('✓ Payment Response - Sales Number:', response.data?.salesNumber)
        console.log('✓ Payment Response - Status:', response.data?.status)
        console.log('✓ Payment Response - ID:', response.data?.id)

        if (response.status === 200) {
          // Clear cart, order summary, and pending ticket ID
          this.$store.dispatch('pos/clearCart')
          this.$store.dispatch('pos/clearOrderSummary')
          this.$store.dispatch('pos/clearPendingTicketId')
          
          // Reset customer to passenger for next sale
          this.resetCustomerToPassenger()

          this.$toast({
            component: ToastificationContent,
            props: {
              title: 'Success',
              icon: 'CheckCircleIcon',
              text: `Sale ${response.data.salesNumber} completed!`,
              variant: 'success'
            }
          })

          // Print receipt
          this.printReceipt(response.data)

          // Return to item selection
          setTimeout(() => {
            this.$router.push({ name: 'pos-item-selection' })
          }, 2000)
        }

      } catch (error) {
        console.error('Error completing payment:', error)
        let errorMessage = 'Failed to complete payment. Please try again.'

        if (error.response && error.response.data) {
          errorMessage = error.response.data || errorMessage
        }

        this.$toast({
          title: 'Error',
          text: errorMessage,
          variant: 'danger'
        })
      } finally {
        this.loading = false
      }
    },
    async saveAsPending() {
      if (this.cart.length === 0) return

      this.loading = true

      try {
        // Prepare sale request (without payments for pending)
        const saleRequest = {
          subtotal: this.orderSummary.subtotal,
          taxAmount: this.orderSummary.taxAmount,
          discountAmount: 0,
          totalAmount: this.orderSummary.totalAmount,
          paidAmount: 0,
          changeAmount: 0,
          customerId: this.selectedCustomerId || null,
          notes: 'Pending sale - customer will return',
          lines: this.cart.map(item => ({
            itemId: item.id,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            lineTotal: item.unitPrice * item.quantity
          })),
          payments: [] // No payments for pending sales
        }

        // Save as pending sale
        const response = await this.$http.post('/sales-header/save-pending', saleRequest)

        if (response.status === 200) {
          // Clear cart and show success
          this.$store.dispatch('pos/clearCart')
          this.$store.dispatch('pos/clearOrderSummary')
          
          // Reset customer to passenger for next sale
          this.resetCustomerToPassenger()

        this.$toast({
          component: ToastificationContent,
          props: {
            title: 'Success',
            icon: 'CheckCircleIcon',
            text: `Pending ticket ${response.data.salesNumber} saved!`,
            variant: 'success'
          }
        })

          // Return to item selection
          setTimeout(() => {
            this.$router.push({ name: 'pos-item-selection' })
          }, 1500)
        }

      } catch (error) {
        console.error('Error saving pending sale:', error)
        let errorMessage = 'Failed to save pending sale. Please try again.'

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
    addCashCountLine() {
      this.closeSessionData.cashCountLines.push({
        denominationValue: null,
        quantity: null,
        paymentMethodId: null,
        referenceNumber: '',
        notes: ''
      })
    },
    removeCashCountLine(index) {
      this.closeSessionData.cashCountLines.splice(index, 1)
      this.updateCashCountTotals()
    },
    updateCashCountTotals() {
      // Trigger reactivity update
      this.$forceUpdate()
    },
    async closeSession() {
      // Check for pending tickets first
      if (this.pendingTicketsCount > 0) {
        this.$toast({
          component: ToastificationContent,
          props: {
            title: 'Cannot Close Session',
            icon: 'AlertCircleIcon',
            text: `You have ${this.pendingTicketsCount} pending ticket(s). Please complete or cancel all pending tickets before closing the session.`,
            variant: 'warning'
          }
        })
        this.showCloseSessionModal = false
        return
      }

      if (!this.canCloseSession) {
        this.$toast({
          component: ToastificationContent,
          props: {
            title: 'Error',
            icon: 'XIcon',
            text: 'Please add cash count lines or enter actual cash amount',
            variant: 'danger'
          }
        })
        return
      }

      try {
        // Prepare request with cash count lines
        const requestData = {
          notes: this.closeSessionData.notes
        }

        // Add actualCash if manually provided
        if (this.closeSessionData.actualCash && this.closeSessionData.actualCash > 0) {
          requestData.actualCash = this.closeSessionData.actualCash
        }

        // Add cash count lines if any
        if (this.closeSessionData.cashCountLines.length > 0) {
          requestData.cashCountLines = this.closeSessionData.cashCountLines.map(line => ({
            denominationValue: parseFloat(line.denominationValue) || 0,
            quantity: parseInt(line.quantity) || 0,
            paymentMethodId: line.paymentMethodId || null,
            referenceNumber: line.referenceNumber || null,
            notes: line.notes || null
          }))
        }

        const response = await this.$http.post('/cashier-session/close', requestData)

        if (response.status === 200) {
          this.$toast({
            component: ToastificationContent,
            props: {
              title: 'Success',
              icon: 'CheckCircleIcon',
              text: 'Session closed successfully!',
              variant: 'success'
            }
          })

          // Clear session from store
          this.$store.dispatch('pos/clearCurrentSession')
          
          this.resetCloseSessionForm()
          this.showCloseSessionModal = false

          // Redirect to login or open new session
          setTimeout(() => {
            useJwt.logout()
            this.$router.push({ name: 'login' })
          }, 1500)
        }
      } catch (error) {
        console.error('Error closing session:', error)
        let errorMessage = 'Failed to close session. Please try again.'
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
    resetCloseSessionForm() {
      this.closeSessionData = {
        actualCash: null,
        notes: '',
        cashCountLines: []
      }
    },
  }
}
</script>

<style scoped>
.payment-container {
  padding: 20px;
  min-height: 100vh;
  position: relative;
}

.payment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 15px;
  margin-bottom: 20px;
}

.payment-header h2 {
  margin: 0;
  font-size: 1.5rem;
}

@media (max-width: 575.98px) {
  .payment-container {
    padding: 15px;
  }

  .payment-header {
    flex-direction: column;
    align-items: stretch;
  }

  .payment-header h2 {
    font-size: 1.25rem;
  }

  .payment-header .btn {
    width: 100%;
  }
}

.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 9999;
  pointer-events: none;
}

.loading-overlay .b-overlay {
  pointer-events: auto;
}

.payment-content {
  margin-top: 20px;
}

@media (max-width: 767.98px) {
  .order-col {
    margin-bottom: 20px;
  }

  .payment-col {
    margin-bottom: 20px;
  }
}

.order-items {
  max-height: 400px;
  overflow-y: auto;
  margin-bottom: 20px;
}

@media (max-width: 767.98px) {
  .order-items {
    max-height: 300px;
  }
}

.order-item {
  display: flex;
  justify-content: space-between;
  padding: 15px;
  border-bottom: 1px solid #e0e0e0;
}

@media (max-width: 575.98px) {
  .order-item {
    flex-direction: column;
    gap: 10px;
  }

  .order-item-price {
    text-align: left;
  }
}

.order-item-price {
  font-weight: bold;
  color: #28a745;
}

.order-summary {
  margin-top: 20px;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
}

.summary-row.total {
  font-size: 1.2rem;
  font-weight: bold;
  border-top: 1px solid #e0e0e0;
  padding-top: 10px;
}

.payment-amount-section {
  margin-top: 20px;
  padding: 15px;
  background-color: #f8f9fa;
  border-radius: 5px;
}

.change-amount {
  margin-top: 15px;
  padding: 10px;
  background-color: #d4edda;
  border-radius: 5px;
  color: #155724;
}

@media (max-width: 575.98px) {
  .payment-amount-section {
    margin-top: 15px;
    padding: 10px;
  }

  .order-summary {
    font-size: 0.9rem;
  }

  .summary-row.total {
    font-size: 1.1rem;
  }
}

.payment-entries {
  max-height: 500px;
  overflow-y: auto;
}

.payment-entry {
  animation: fadeIn 0.3s ease-in;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.payment-entry .card {
  border-left: 3px solid #007bff;
}

.payment-summary {
  background-color: #f8f9fa;
  padding: 15px;
  border-radius: 5px;
}

.payment-summary .summary-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 1rem;
}

.payment-summary .summary-row.total {
  font-size: 1.2rem;
  font-weight: bold;
  border-top: 2px solid #28a745;
  padding-top: 10px;
  margin-top: 10px;
}

@media (max-width: 575.98px) {
  .payment-entries {
    max-height: 400px;
  }
  
  .payment-entry .card {
    padding: 10px;
  }
}

.customer-info {
  margin-top: 10px;
}

.customer-search-results {
  position: absolute;
  z-index: 1000;
  width: 100%;
  max-height: 300px;
  overflow-y: auto;
  background: white;
  border: 1px solid #dee2e6;
  border-radius: 0.25rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-top: 2px;
}

.customer-search-item {
  cursor: pointer;
  transition: background-color 0.2s;
}

.customer-search-item:hover {
  background-color: #f8f9fa;
}

.customer-search-item small {
  font-size: 0.875rem;
}
</style>
