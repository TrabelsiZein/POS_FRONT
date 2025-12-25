<template>
  <div class="payment-container">
    <!-- Loading Overlay -->
    <b-overlay :show="loading" rounded="sm" opacity="0.85" no-wrap class="loading-overlay">
      <template #overlay>
        <div class="text-center">
          <b-spinner type="grow" variant="primary" class="mb-3"></b-spinner>
          <p class="h4">{{ $t('pos.payment.processingPayment') }}</p>
          <p>{{ $t('pos.payment.creatingTicket') }}</p>
        </div>
      </template>
      <div></div>
    </b-overlay>

    <!-- Panel 1: Summary Panel (Top) -->
    <div class="panel-summary">
      <div class="summary-left">
        <b-button variant="outline-secondary" @click="goBack" :disabled="loading" class="back-btn">
          <feather-icon icon="ArrowLeftIcon" size="18" class="mr-50" />
          {{ $t('pos.payment.back') }}
        </b-button>
        <div class="summary-customer">
          <div class="customer-info-display">
            <strong v-if="selectedCustomer">{{ selectedCustomer.name }}</strong>
            <strong v-else-if="passengerCustomer">{{ passengerCustomer.name }}</strong>
            <b-badge v-if="passengerCustomer && (!selectedCustomer || selectedCustomer.customerCode === 'PASSENGER')"
              variant="info" class="ml-2">{{ $t('pos.payment.default') }}</b-badge>
            <small class="text-muted d-block" v-if="selectedCustomer">{{ selectedCustomer.customerCode }}</small>
            <small class="text-muted d-block" v-else-if="passengerCustomer">{{ passengerCustomer.customerCode }}</small>
          </div>
        </div>
      </div>
      <div class="summary-totals">
        <div class="summary-item">
          <span class="summary-label">{{ $t('pos.payment.ticketTotal') }}</span>
          <span class="summary-value">{{ formatTunCurrency(orderSummary.totalAmount) }}</span>
        </div>
        <div class="summary-item" v-if="headerDiscountAmount > 0">
          <span class="summary-label">{{ $t('pos.payment.discount') }}</span>
          <span class="summary-value text-danger">
            <template v-if="orderSummary && (orderSummary.discountPercent > 0 || orderSummary.discountAmount > 0)">
              <span v-if="orderSummary.discountPercent > 0">
                {{ orderSummary.discountPercent.toFixed(3) }}%
              </span>
              <span v-if="orderSummary.discountPercent > 0 && orderSummary.discountAmount > 0"> / </span>
              <span v-if="orderSummary.discountAmount > 0">
                {{ formatTunCurrency(orderSummary.discountAmount) }}
              </span>
            </template>
          </span>
        </div>
        <div class="summary-item">
          <span class="summary-label">{{ $t('pos.payment.totalAfterDiscount') }}</span>
          <span class="summary-value">{{ formatTunCurrency(totalAfterDiscount) }}</span>
        </div>
        <div class="summary-item">
          <span class="summary-label">{{ $t('pos.payment.totalPaid') }}</span>
          <span class="summary-value text-success">{{ formatTunCurrency(totalPaid) }}</span>
        </div>
        <div class="summary-item">
          <span class="summary-label">{{ $t('pos.payment.remaining') }}</span>
          <span class="summary-value" :class="remainingBalance > 0 ? 'text-danger' : 'text-success'">
            {{ formatTunCurrency(Math.abs(remainingBalance)) }}
          </span>
        </div>
      </div>
    </div>

    <!-- Main Content Area -->
    <div class="payment-main-content">
      <!-- Panel 2: Payment Classes (Left) -->
      <div class="panel-payment-classes">
        <div class="payment-classes-header">
          <h5>{{ $t('pos.payment.paymentMethods') }}</h5>
        </div>
        <div class="payment-classes-list">
          <div v-for="method in paymentMethods" :key="method.id" class="payment-class-item"
            :class="{ active: selectedPaymentMethodId === method.id }" @click="selectPaymentMethod(method.id)">
            <span class="payment-class-name">{{ method.name }}</span>
            <span class="payment-class-total">{{ formatTunCurrency(getTotalPaidByMethod(method.id)) }}</span>
          </div>
        </div>
      </div>

      <!-- Right Side Content -->
      <div class="payment-right-content">
        <!-- Panel 4: Payment Cards (Right-Top, Scrollable) -->
        <div class="panel-payment-cards">
          <div class="payment-cards-header">
            <h5>{{ $t('pos.payment.paymentDetails') }}</h5>
          </div>
          <div class="payment-cards-container">
            <div v-if="paymentCards.length === 0" class="empty-cards">
              <feather-icon icon="CreditCardIcon" size="48" class="mb-2 text-muted" />
              <p class="mb-0 text-muted">{{ $t('pos.payment.selectPaymentMethod') }}</p>
            </div>
            <div v-else class="payment-cards-list">
              <div v-for="(card, index) in paymentCards" :key="card.id || index" class="payment-card"
                :class="{ selected: selectedCardIndex === index }" @click="selectCard(index)">
                <div class="payment-card-header">
                  <div class="payment-card-title">
                    <strong>{{ getPaymentMethodName(card.paymentMethodId) || $t('pos.payment.unknownMethod') }}</strong>
                  </div>
                  <b-button variant="link" size="sm" @click.stop="removeCard(index)" class="card-delete-btn"
                    :disabled="loading">
                    <feather-icon icon="XIcon" size="16" />
                  </b-button>
                </div>
                <div class="payment-card-body">
                  <!-- Return Voucher Number -->
                  <b-form-group v-if="isReturnVoucherPayment(card)" :label="$t('pos.payment.voucherNumber')" class="mb-2">
                    <b-input-group>
                      <b-form-input v-model="card.voucherNumber" :placeholder="$t('pos.payment.voucherNumberPlaceholder')"
                        @keyup.enter="validateVoucher(card)" @click.stop :disabled="loading" size="sm" />
                      <b-input-group-append>
                        <b-button variant="outline-primary" @click="validateVoucher(card)"
                          :disabled="loading || !card.voucherNumber" size="sm">
                          <feather-icon icon="SearchIcon" size="12" />
                        </b-button>
                      </b-input-group-append>
                    </b-input-group>
                    <small class="text-muted" v-if="card.voucherRemainingAmount !== undefined">
                      {{ $t('pos.payment.remaining') }} {{ formatTunCurrency(card.voucherRemainingAmount) }}
                    </small>
                  </b-form-group>

                  <!-- Amount Input -->
                  <b-form-group :label="$t('pos.payment.amount')" class="mb-2">
                    <b-input-group>
                      <b-form-input 
                        v-if="!isReturnVoucherPayment(card)"
                        v-model.number="card.amount" 
                        type="number" 
                        step="0.01" 
                        min="0.01" 
                        :placeholder="$t('pos.payment.amountPlaceholder')"
                        @input="updatePaymentTotal" 
                        @click.stop 
                        :disabled="loading" 
                        size="" 
                        :ref="`amount-input-${index}`" 
                      />
                      <b-form-input 
                        v-else
                        :value="formatTunCurrencyWithoutSuffix(card.amount || 0)"
                        type="text"
                        readonly
                        @click.stop 
                        :disabled="loading" 
                        size="" 
                        class="text-left"
                      />
                      <b-input-group-append>
                        <span class="input-group-text">TND</span>
                      </b-input-group-append>
                    </b-input-group>
                    <small v-if="isReturnVoucherPayment(card)" class="text-muted">
                      {{ $t('pos.payment.amountAutoSet') }}
                    </small>
                  </b-form-group>

                  <!-- Dynamic Required Fields -->
                  <b-form-group v-if="requiresTitleNumber(card)" :label="$t('pos.payment.titleNumber')" class="mb-2">
                    <b-form-input 
                      v-model="card.titleNumber" 
                      :placeholder="$t('pos.payment.titleNumberPlaceholder')" 
                      @click.stop 
                      size="sm" 
                    />
                  </b-form-group>

                  <b-form-group v-if="requiresDueDate(card)" :label="$t('pos.payment.dueDate')" class="mb-2">
                    <b-form-input v-model="card.dueDate" type="date" @click.stop size="sm" />
                  </b-form-group>

                  <b-form-group v-if="requiresDrawerName(card)" :label="$t('pos.payment.drawerName')" class="mb-2">
                    <b-form-input v-model="card.drawerName" :placeholder="$t('pos.payment.drawerNamePlaceholder')" @click.stop size="sm" />
                  </b-form-group>

                  <b-form-group v-if="requiresIssuingBank(card)" :label="$t('pos.payment.issuingBank')" class="mb-2">
                    <b-form-input v-model="card.issuingBank" :placeholder="$t('pos.payment.issuingBankPlaceholder')" @click.stop size="sm" />
                  </b-form-group>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Panel 5: Numeric Keyboard (Bottom-Right) -->
        <div class="panel-keyboard">
          <div class="keyboard-grid">
            <button v-for="num in [1, 2, 3, 4, 5, 6, 7, 8, 9, '.', 0, '⌫']" :key="num" class="keyboard-key"
              :class="{ 'key-decimal': num === '.', 'key-backspace': num === '⌫' }" @click="handleKeyboardKey(num)"
              :disabled="loading">
              {{ num }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Panel 3: Actions Panel (Bottom) -->
    <div class="panel-actions">
      <b-button variant="warning" size="lg" @click="saveAsPending" :disabled="cart.length === 0 || loading"
        class="action-btn">
        <feather-icon icon="SaveIcon" size="18" class="mr-50" />
        <span v-if="loading">{{ $t('pos.payment.buttons.saving') }}</span>
        <span v-else>{{ $t('pos.payment.buttons.saveAsPending') }}</span>
      </b-button>

      <b-button variant="info" size="lg" @click="openDiscountDialog" :disabled="loading" class="action-btn">
        <feather-icon icon="PercentIcon" size="18" class="mr-50" />
        {{ $t('pos.payment.buttons.discount') }}
      </b-button>

      <b-button variant="info" size="lg" @click="openCustomerDialog" :disabled="loading" class="action-btn">
        <feather-icon icon="UsersIcon" size="18" class="mr-50" />
        {{ $t('pos.payment.buttons.customer') }}
      </b-button>

      <b-button variant="success" size="lg" @click="completePayment" :disabled="!canCompletePayment || loading"
        class="action-btn">
        <feather-icon icon="CheckCircleIcon" size="18" class="mr-50" />
        <span v-if="loading">{{ $t('pos.payment.buttons.processing') }}</span>
        <span v-else>{{ $t('pos.payment.processPayment') }}</span>
      </b-button>
    </div>

    <!-- Discount Dialog -->
    <b-modal
      v-model="showDiscountDialog"
      :title="$t('pos.payment.headerDiscount.title')"
      hide-footer
      centered
      size="md"
      no-close-on-backdrop
      @hide="showDiscountDialog = false"
    >
      <div class="discount-dialog">
        <!-- Discount Type Selection -->
        <b-form-group :label="$t('pos.payment.headerDiscount.discountType')" class="mb-3">
          <b-form-radio-group
            v-model="discountType"
            :options="[
              { text: $t('pos.payment.headerDiscount.percentage') + ' (%)', value: 'percentage' },
              { text: $t('pos.payment.headerDiscount.amount') + ' (TND)', value: 'amount' }
            ]"
            class="discount-type-radio"
          ></b-form-radio-group>
        </b-form-group>

        <!-- Discount Value Input -->
        <b-form-group :label="discountType === 'percentage' ? $t('pos.payment.headerDiscount.discountPercentage') : $t('pos.payment.headerDiscount.discountAmount')" class="mb-3">
          <b-input-group>
            <b-form-input
              v-model.number="discountValue"
              type="number"
              :step="discountType === 'percentage' ? 0.01 : 0.01"
              :min="0"
              :max="discountType === 'percentage' ? 100 : orderSummary.totalAmount"
              :placeholder="discountType === 'percentage' ? $t('pos.payment.headerDiscount.placeholderPercentage') : $t('pos.payment.headerDiscount.placeholderAmount')"
              @input="updateDiscountPreview"
            />
            <b-input-group-append v-if="discountType === 'percentage'">
              <span class="input-group-text">%</span>
            </b-input-group-append>
            <b-input-group-append v-else>
              <span class="input-group-text">TND</span>
            </b-input-group-append>
          </b-input-group>
        </b-form-group>

        <!-- Discount Preview -->
        <div v-if="discountValue" class="discount-preview mb-3 p-3" style="background: #f8f9fa; border-radius: 8px;">
          <div class="d-flex justify-content-between mb-2">
            <span>{{ $t('pos.payment.headerDiscount.ticketTotal') }}</span>
            <strong>{{ formatTunCurrency(orderSummary.totalAmount) }}</strong>
          </div>
          <div class="d-flex justify-content-between mb-2">
            <span>{{ $t('pos.payment.headerDiscount.discountLabel') }}</span>
            <strong class="text-danger">
              {{ formatTunCurrency(calculatePreviewDiscount()) }}
              <span v-if="discountType === 'percentage'">({{ discountValue }}%)</span>
            </strong>
          </div>
          <hr />
          <div class="d-flex justify-content-between">
            <span><strong>{{ $t('pos.payment.headerDiscount.totalAfterDiscountLabel') }}</strong></span>
            <strong class="text-success">{{ formatTunCurrency(calculatePreviewTotal()) }}</strong>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="d-flex justify-content-end">
          <b-button variant="secondary" @click="showDiscountDialog = false" class="mr-2">
            {{ $t('pos.payment.headerDiscount.cancel') }}
          </b-button>
          <b-button variant="danger" @click="clearHeaderDiscount" v-if="orderSummary.discountAmount > 0 || orderSummary.discountPercent > 0" class="mr-2">
            {{ $t('pos.payment.headerDiscount.clearDiscount') }}
          </b-button>
          <b-button variant="primary" @click="applyHeaderDiscount" :disabled="!discountValue || discountValue <= 0">
            {{ $t('pos.payment.headerDiscount.applyDiscount') }}
          </b-button>
        </div>
      </div>
    </b-modal>

    <!-- Badge Scan Popup for Total Discount -->
    <BadgeScanPopup
      :show="showBadgeScanPopupForTotalDiscount"
      :required-permission="'APPLY_TOTAL_DISCOUNT'"
      :session-id="currentSessionId"
      @badge-scanned="onBadgeScannedForTotalDiscount"
      @close="onBadgeScanCloseForTotalDiscount"
    />
  </div>
</template>

<script>
import ReceiptTemplate from '@/components/ReceiptTemplate.vue'
import ToastificationContent from '@core/components/toastification/ToastificationContent.vue'
import BadgeScanPopup from '@/components/pos/BadgeScanPopup.vue'
import { checkCurrentUserPermission, getAlwaysShowBadgeScan, BADGE_PERMISSIONS } from '@/services/badgeService'
import JsBarcode from 'jsbarcode'

export default {
  name: 'Payment',
  components: {
    BadgeScanPopup
  },
  data() {
    return {
      cart: [],
      orderSummary: {},
      paymentMethods: [],
      paymentCards: [], // Replaces paymentEntries
      loading: false,
      customers: [],
      selectedCustomerId: null,
      customerSearchTerm: '',
      customerSearchResults: [],
      showCustomerDropdown: false,
      searchingCustomers: false,
      passengerCustomer: null,
      selectedCustomerObj: null,
      searchTimeout: null,
      pendingTicketsCount: 0,
      selectedPaymentMethodId: null, // Currently selected payment method
      selectedCardIndex: null, // Currently selected card index
      cardIdCounter: 0, // For generating unique card IDs
      showDiscountDialog: false,
      discountType: 'percentage', // 'percentage' or 'amount'
      discountValue: null,
      showBadgeScanPopupForTotalDiscount: false,
      badgeScannedForTotalDiscount: false
    }
  },
  computed: {
    pendingTicketId() {
      return this.$store.state.pos.pendingTicketId
    },
    selectedCustomer() {
      if (!this.selectedCustomerId) return this.passengerCustomer
      if (this.passengerCustomer && this.selectedCustomerId === this.passengerCustomer.id) {
        return this.passengerCustomer
      }
      return this.customerSearchResults.find(c => c.id === this.selectedCustomerId) ||
        (this.selectedCustomerObj || null)
    },
    totalPaid() {
      return this.paymentCards.reduce((sum, card) => {
        const amount = parseFloat(card.amount) || 0
        return sum + amount
      }, 0)
    },
    headerDiscountAmount() {
      // Read from store first, then fallback to local orderSummary
      const summary = this.$store.state.pos?.orderSummary || this.orderSummary
      if (!summary || !summary.totalAmount) return 0
      const total = summary.totalAmount
      
      // Prefer discountAmount if available (more accurate)
      if (summary.discountAmount && summary.discountAmount > 0) {
        return summary.discountAmount
      } else if (summary.discountPercent && summary.discountPercent > 0) {
        return total * (summary.discountPercent / 100)
      }
      return 0
    },
    totalAfterDiscount() {
      const summary = this.$store.state.pos?.orderSummary || this.orderSummary
      const total = summary?.totalAmount || 0
      const discount = this.headerDiscountAmount
      return Math.max(0, total - discount)
    },
    remainingBalance() {
      return this.totalAfterDiscount - this.totalPaid
    },
    isFullyPaid() {
      // Fully paid when remaining balance is 0 or negative (overpaid)
      // Use a small tolerance for floating point comparison
      return this.remainingBalance <= 0.01
    },
    canCompletePayment() {
      if (this.paymentCards.length === 0) return false

      const allValid = this.paymentCards.every(card => {
        if (!card.paymentMethodId) return false

        const paymentMethod = this.getPaymentMethodById(card.paymentMethodId)
        if (!paymentMethod) return false

        const amount = parseFloat(card.amount)
        if (!this.isReturnVoucherPayment(card) && (!amount || amount <= 0)) {
          return false
        }

        if (this.isReturnVoucherPayment(card)) {
          if (!card.voucherNumber || !card.voucherNumber.trim()) {
            return false
          }
          if (!amount || amount <= 0) {
            return false
          }
        }

        if (paymentMethod.requireTitleNumber && (!card.titleNumber || !card.titleNumber.trim())) {
          return false
        }
        if (paymentMethod.requireDueDate && (!card.dueDate || card.dueDate === '')) {
          return false
        }
        if (paymentMethod.requireDrawerName && (!card.drawerName || !card.drawerName.trim())) {
          return false
        }
        if (paymentMethod.requireIssuingBank && (!card.issuingBank || !card.issuingBank.trim())) {
          return false
        }

        return true
      })

      // Enable when fully paid (0) or overpaid (negative), with tolerance for floating point
      // Use <= 0.01 instead of <= 0 to handle floating point precision issues
      return allValid && this.remainingBalance <= 0.01
    },
    currentSessionId() {
      const session = this.$store.state.pos?.currentSession
      return session ? session.id : null
    }
  },
  watch: {
    '$store.state.pos.orderSummary': {
      handler(newSummary) {
        if (newSummary) {
          this.orderSummary = { ...newSummary }
        }
      },
      deep: true,
      immediate: true
    }
  },
  async mounted() {
    this.loadCartData()
    await this.loadPaymentMethods()
    await this.loadPassengerCustomer()
    this.loadPendingTicketsCount()

    // Load selected customer from store if exists, otherwise reset to passenger
    const selectedCustomerId = this.$store.state.pos?.selectedCustomerId
    if (selectedCustomerId) {
      await this.loadSelectedCustomerFromStore()
    } else {
      this.resetCustomerToPassenger()
    }

    // Initialize with CLIENT_ESPECES selected
    this.initializeDefaultPayment()

    // Listen for keyboard input
    document.addEventListener('keydown', this.handleKeyboardInput)
  },
  beforeDestroy() {
    document.removeEventListener('keydown', this.handleKeyboardInput)
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout)
    }
  },
  methods: {
    loadCartData() {
      if (!this.$store.state.pos) {
        console.error('POS store module not found')
        this.$router.push({ name: 'pos-item-selection' })
        return
      }

      this.cart = this.$store.state.pos.cart || []

      const storeSummary = this.$store.state.pos.orderSummary
      this.orderSummary = storeSummary || {
        subtotal: 0,
        taxAmount: 0,
        totalAmount: 0,
        discountAmount: 0,
        discountPercent: 0
      }

      if (this.orderSummary.subtotal === null || this.orderSummary.subtotal === undefined) {
        this.orderSummary.subtotal = 0
      }
      if (this.orderSummary.taxAmount === null || this.orderSummary.taxAmount === undefined) {
        this.orderSummary.taxAmount = 0
      }
      if (this.orderSummary.totalAmount === null || this.orderSummary.totalAmount === undefined) {
        this.orderSummary.totalAmount = 0
      }
      if (this.orderSummary.discountAmount === null || this.orderSummary.discountAmount === undefined) {
        this.orderSummary.discountAmount = 0
      }
      if (this.orderSummary.discountPercent === null || this.orderSummary.discountPercent === undefined) {
        this.orderSummary.discountPercent = 0
      }

      console.log('Payment page - Cart:', this.cart)
      console.log('Payment page - Order Summary:', this.orderSummary)

      if (this.cart.length === 0) {
        this.$toast({
          component: ToastificationContent,
          props: {
            title: this.$t('pos.payment.errors.noItems'),
            icon: 'AlertCircleIcon',
            text: this.$t('pos.payment.errors.cartEmpty'),
            variant: 'warning'
          }
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
      if (this.pendingTicketId) {
        return
      }

      if (this.passengerCustomer) {
        this.selectedCustomerId = this.passengerCustomer.id
        this.selectedCustomerObj = null
        this.customerSearchTerm = ''
        this.customerSearchResults = []
        this.showCustomerDropdown = false
        this.$store.dispatch('pos/setSelectedCustomerId', this.passengerCustomer.id)
      }
    },
    async loadSelectedCustomerFromStore() {
      const selectedCustomerId = this.$store.state.pos?.selectedCustomerId
      if (selectedCustomerId) {
        try {
          const response = await this.$http.get(`/customer/${selectedCustomerId}`)
          this.selectedCustomerObj = response.data
          this.selectedCustomerId = response.data.id
          this.customerSearchTerm = `${response.data.customerCode} - ${response.data.name}`
          this.showCustomerDropdown = false
          this.onCustomerChange()
        } catch (error) {
          console.error('Error loading selected customer from store:', error)
          // Fallback to passenger customer
          this.resetCustomerToPassenger()
        }
      }
    },
    async loadSelectedCustomerDetails() {
      if (!this.selectedCustomerId) return
      try {
        const response = await this.$http.get(`/customer/${this.selectedCustomerId}`)
        if (response.status === 200 && response.data) {
          this.selectedCustomerObj = response.data
          this.customerSearchTerm = `${response.data.customerCode} - ${response.data.name}`
        }
      } catch (error) {
        console.error('Error loading selected customer:', error)
      }
    },
    searchCustomers() {
      if (this.searchTimeout) {
        clearTimeout(this.searchTimeout)
      }

      const searchTerm = this.customerSearchTerm.trim()

      if (!searchTerm) {
        this.customerSearchResults = []
        this.showCustomerDropdown = false
        return
      }

      this.showCustomerDropdown = true

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
    onCustomerChange() {
      if (this.$store.state.pos) {
        this.$store.dispatch('pos/setSelectedCustomerId', this.selectedCustomerId)
      }
    },
    async openCustomerDialog() {
      // Navigate to customer management page with return route
      this.$router.push({
        name: 'pos-customers',
        query: { returnTo: 'pos-payment' }
      })
    },
    async openDiscountDialog() {
      // Check if badge scan is required before opening discount dialog
      const badgeRequired = await this.checkBadgeRequirementForTotalDiscount()
      if (badgeRequired && !this.badgeScannedForTotalDiscount) {
        // Show badge scan popup
        this.showBadgeScanPopupForTotalDiscount = true
        return
      }
      // Open discount dialog
      this.openDiscountDialogInternal()
    },
    openDiscountDialogInternal() {
      // Initialize dialog with existing discount values
      if (this.orderSummary && this.orderSummary.discountPercent && this.orderSummary.discountPercent > 0) {
        this.discountType = 'percentage'
        this.discountValue = this.orderSummary.discountPercent
      } else if (this.orderSummary && this.orderSummary.discountAmount && this.orderSummary.discountAmount > 0) {
        this.discountType = 'amount'
        this.discountValue = this.orderSummary.discountAmount
      } else {
        this.discountType = 'percentage'
        this.discountValue = null
      }
      this.showDiscountDialog = true
    },
    async checkBadgeRequirementForTotalDiscount() {
      try {
        const alwaysShow = await getAlwaysShowBadgeScan(this.$http)
        if (alwaysShow) {
          return true
        }
        const permissionCheck = await checkCurrentUserPermission(BADGE_PERMISSIONS.APPLY_TOTAL_DISCOUNT, this.$http)
        // Return true if badge scan is required (user doesn't have valid permission)
        return !permissionCheck.hasValidPermission
      } catch (error) {
        console.error('Error checking badge requirement for total discount:', error)
        return true // On error, require badge scan
      }
    },
    onBadgeScannedForTotalDiscount() {
      this.badgeScannedForTotalDiscount = true
      this.showBadgeScanPopupForTotalDiscount = false
      // Open discount dialog after successful badge scan
      this.openDiscountDialogInternal()
    },
    onBadgeScanCloseForTotalDiscount() {
      this.showBadgeScanPopupForTotalDiscount = false
      // Don't open discount dialog if user closed without scanning
    },
    applyHeaderDiscount() {
      const summary = this.$store.state.pos?.orderSummary || this.orderSummary
      const total = summary?.totalAmount || 0
      if (!total || !this.discountValue || this.discountValue <= 0) {
        this.clearHeaderDiscount()
        return
      }
      
      let discountPercentage = null
      let discountAmount = null
      
      if (this.discountType === 'percentage') {
        const percentage = Math.min(100, Math.max(0, parseFloat(this.discountValue) || 0))
        discountPercentage = percentage
        discountAmount = total * (percentage / 100)
      } else {
        const amount = Math.min(parseFloat(this.discountValue) || 0, total)
        discountAmount = amount
        discountPercentage = total > 0 ? (discountAmount / total) * 100 : 0
      }
      
      // Update order summary in store - watcher will sync to local orderSummary
      if (this.$store.state.pos) {
        this.$store.dispatch('pos/updateOrderSummary', {
          discountAmount: discountAmount,
          discountPercent: discountPercentage
        })
      } else {
        // Fallback: update local object directly
        this.$set(this.orderSummary, 'discountAmount', discountAmount)
        this.$set(this.orderSummary, 'discountPercent', discountPercentage)
      }
      
      this.showDiscountDialog = false
      this.discountValue = null
    },
    clearHeaderDiscount() {
      if (this.$store.state.pos) {
        this.$store.dispatch('pos/updateOrderSummary', {
          discountAmount: 0,
          discountPercent: 0
        })
      } else {
        // Fallback: update local object directly
        this.$set(this.orderSummary, 'discountAmount', 0)
        this.$set(this.orderSummary, 'discountPercent', 0)
      }
      
      this.showDiscountDialog = false
      this.discountValue = null
    },
    calculatePreviewDiscount() {
      if (!this.discountValue || !this.orderSummary?.totalAmount) return 0
      const total = this.orderSummary.totalAmount
      
      if (this.discountType === 'percentage') {
        const percentage = Math.min(100, Math.max(0, parseFloat(this.discountValue) || 0))
        return total * (percentage / 100)
      } else {
        const amount = Math.min(parseFloat(this.discountValue) || 0, total)
        return amount
      }
    },
    calculatePreviewTotal() {
      const total = this.orderSummary?.totalAmount || 0
      const discount = this.calculatePreviewDiscount()
      return Math.max(0, total - discount)
    },
    updateDiscountPreview() {
      // Force reactivity update
      this.$forceUpdate()
    },
    async loadPaymentMethods() {
      try {
        const response = await this.$http.get('/payment-method')
        this.paymentMethods = response.data
          .filter(pm => pm.active !== false)
          .sort((a, b) => {
            // Sort by displayOrder, if displayOrder is null or undefined, put it at the end
            const orderA = a.displayOrder != null ? a.displayOrder : 999
            const orderB = b.displayOrder != null ? b.displayOrder : 999
            return orderA - orderB
          })
      } catch (error) {
        console.error('Error loading payment methods:', error)
        this.paymentMethods = [
          { id: 1, name: 'Client Espèce', type: 'CLIENT_ESPECES', active: true, displayOrder: 1 },
          { id: 2, name: 'Return Voucher', type: 'RETURN_VOUCHER', active: true, displayOrder: 8 }
        ]
      }
    },
    getClientEspecesPaymentMethod() {
      return this.paymentMethods.find(pm => pm.type === 'CLIENT_ESPECES') || null
    },
    initializeDefaultPayment() {
      const clientEspeces = this.getClientEspecesPaymentMethod()
      if (clientEspeces) {
        this.selectedPaymentMethodId = clientEspeces.id
        this.addOrUpdatePaymentCard(clientEspeces.id)
      }
    },
    selectPaymentMethod(methodId) {
      this.selectedPaymentMethodId = methodId
      this.addOrUpdatePaymentCard(methodId)
    },
    addOrUpdatePaymentCard(methodId) {
      const paymentMethod = this.getPaymentMethodById(methodId)
      if (!paymentMethod) return

      // Check if CLIENT_ESPECES - only one card allowed
      if (paymentMethod.type === 'CLIENT_ESPECES') {
        const existingCard = this.paymentCards.find(card => {
          const cardMethod = this.getPaymentMethodById(card.paymentMethodId)
          return cardMethod && cardMethod.type === 'CLIENT_ESPECES'
        })

        if (existingCard) {
          // Update existing card and select it
          const index = this.paymentCards.indexOf(existingCard)
          this.selectCard(index)
          return
        }
      }

      // Create new card
      const newCard = {
        id: `card-${++this.cardIdCounter}`,
        paymentMethodId: methodId,
        amount: null,
        voucherNumber: '',
        voucherRemainingAmount: undefined,
        titleNumber: '',
        dueDate: '',
        drawerName: '',
        issuingBank: ''
      }

      this.paymentCards.unshift(newCard)
      this.selectedCardIndex = 0
      this.updatePaymentTotal()

      // Focus amount input
      this.$nextTick(() => {
        this.focusAmountInput(0)
      })
    },
    selectCard(index) {
      if (index < 0 || index >= this.paymentCards.length) return

      // Move card to top
      const card = this.paymentCards[index]
      this.paymentCards.splice(index, 1)
      this.paymentCards.unshift(card)

      // Select the card (now at index 0)
      this.selectedCardIndex = 0
      this.updatePaymentTotal()

      // Don't auto-focus - let user click on the field they want
    },
    removeCard(index) {
      if (index < 0 || index >= this.paymentCards.length) return

      this.paymentCards.splice(index, 1)

      // Adjust selected index
      if (this.selectedCardIndex === index) {
        if (this.paymentCards.length > 0) {
          this.selectedCardIndex = 0
        } else {
          this.selectedCardIndex = null
        }
      } else if (this.selectedCardIndex > index) {
        this.selectedCardIndex--
      }

      // If no cards left and CLIENT_ESPECES is selected, create default card
      if (this.paymentCards.length === 0 && this.selectedPaymentMethodId) {
        const method = this.getPaymentMethodById(this.selectedPaymentMethodId)
        if (method && method.type === 'CLIENT_ESPECES') {
          this.addOrUpdatePaymentCard(this.selectedPaymentMethodId)
        }
      }

      this.updatePaymentTotal()
    },
    getTotalPaidByMethod(methodId) {
      return this.paymentCards
        .filter(card => card.paymentMethodId === methodId)
        .reduce((sum, card) => {
          const amount = parseFloat(card.amount) || 0
          return sum + amount
        }, 0)
    },
    getPaymentMethodName(paymentMethodId) {
      if (!paymentMethodId) return null
      const method = this.paymentMethods.find(pm => pm.id === paymentMethodId)
      return method ? method.name : null
    },
    getPaymentMethodById(id) {
      if (!id) return null
      return this.paymentMethods.find(pm => pm.id === id) || null
    },
    isReturnVoucherPayment(card) {
      const paymentMethod = this.getPaymentMethodById(card ? card.paymentMethodId : null)
      return paymentMethod && paymentMethod.type === 'RETURN_VOUCHER'
    },
    requiresTitleNumber(card) {
      const paymentMethod = this.getPaymentMethodById(card ? card.paymentMethodId : null)
      return paymentMethod && paymentMethod.requireTitleNumber
    },
    requiresDueDate(card) {
      const paymentMethod = this.getPaymentMethodById(card ? card.paymentMethodId : null)
      return paymentMethod && paymentMethod.requireDueDate
    },
    requiresDrawerName(card) {
      const paymentMethod = this.getPaymentMethodById(card ? card.paymentMethodId : null)
      return paymentMethod && paymentMethod.requireDrawerName
    },
    requiresIssuingBank(card) {
      const paymentMethod = this.getPaymentMethodById(card ? card.paymentMethodId : null)
      return paymentMethod && paymentMethod.requireIssuingBank
    },
    onPaymentMethodChange(card) {
      if (!this.isReturnVoucherPayment(card)) {
        card.voucherNumber = ''
        card.voucherRemainingAmount = undefined
        if (card.amount && card.amount > 0) {
          card.amount = 0
        }
      }
      card.titleNumber = ''
      card.dueDate = ''
      card.drawerName = ''
      card.issuingBank = ''
      this.updatePaymentTotal()
    },
    async validateVoucher(card) {
      if (!card.voucherNumber || !card.voucherNumber.trim()) {
        return
      }

      this.loading = true
      try {
        const response = await this.$http.get('/return-voucher/validate', {
          params: { voucherNumber: card.voucherNumber.trim() }
        })

        if (response.status === 200) {
          const voucherData = response.data

          if (!voucherData.isValid) {
            this.$toast({
              component: ToastificationContent,
              props: {
                title: this.$t('pos.payment.errors.invalidVoucher'),
                icon: 'XIcon',
                text: this.$t('pos.payment.errors.voucherExpired'),
                variant: 'danger'
              }
            })
            card.voucherRemainingAmount = 0
            card.amount = 0
            return
          }

          card.voucherRemainingAmount = voucherData.remainingAmount

          const remainingBalance = this.remainingBalance
          card.amount = Math.min(voucherData.remainingAmount, remainingBalance)

          this.updatePaymentTotal()

          this.$toast({
            component: ToastificationContent,
            props: {
              title: this.$t('pos.payment.success.voucherValidated'),
              icon: 'CheckCircleIcon',
              text: this.$t('pos.payment.success.voucherValidatedText', { amount: this.formatTunCurrency(voucherData.remainingAmount) }),
              variant: 'success'
            }
          })
        }
      } catch (error) {
        console.error('Error validating voucher:', error)
        let errorMessage = this.$t('pos.payment.errors.failedToValidateVoucher')
        if (error.response && error.response.data) {
          errorMessage = error.response.data.message || error.response.data || errorMessage
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

        card.voucherRemainingAmount = undefined
        card.amount = 0
        this.updatePaymentTotal()
      } finally {
        this.loading = false
      }
    },
    focusAmountInput(index) {
      const inputRef = this.$refs[`amount-input-${index}`]
      if (inputRef && inputRef.length > 0) {
        inputRef[0].focus()
      } else if (inputRef) {
        inputRef.focus()
      }
    },
    handleKeyboardInput(event) {
      // Only handle numeric keys when not typing in an input field
      if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA' || event.target.tagName === 'SELECT') {
        return
      }

      // Handle numeric keys (0-9) and decimal point
      if ((event.key >= '0' && event.key <= '9') || event.key === '.') {
        event.preventDefault()
        this.handleKeyboardKey(event.key)
      }

      // Handle Backspace
      if (event.key === 'Backspace') {
        event.preventDefault()
        this.handleKeyboardKey('⌫')
      }

      // Handle Enter key to complete payment if fully paid
      if (event.key === 'Enter' && this.canCompletePayment) {
        this.completePayment()
      }
    },
    handleKeyboardKey(key) {
      if (this.selectedCardIndex === null || this.selectedCardIndex >= this.paymentCards.length) {
        // If no card selected, select CLIENT_ESPECES or create one
        const clientEspeces = this.getClientEspecesPaymentMethod()
        if (clientEspeces) {
          this.selectedPaymentMethodId = clientEspeces.id
          this.addOrUpdatePaymentCard(clientEspeces.id)
        } else {
          return
        }
      }

      const card = this.paymentCards[this.selectedCardIndex]
      if (!card || this.isReturnVoucherPayment(card)) {
        return
      }

      if (key === '⌫') {
        // Backspace - remove last character
        const currentAmount = card.amount ? String(card.amount) : ''
        if (currentAmount.length > 0) {
          const newAmount = currentAmount.slice(0, -1)
          card.amount = newAmount ? parseFloat(newAmount) : null
          this.updatePaymentTotal()
        }
      } else if (key === '.') {
        // Decimal point - add if not present
        const currentAmount = card.amount ? String(card.amount) : '0'
        if (!currentAmount.includes('.')) {
          card.amount = parseFloat(currentAmount + '.') || 0
          this.updatePaymentTotal()
        }
      } else if (key >= '0' && key <= '9') {
        // Number - append to current amount
        const currentAmount = card.amount ? String(card.amount) : '0'
        const newAmount = currentAmount === '0' ? key : currentAmount + key
        card.amount = parseFloat(newAmount) || 0
        this.updatePaymentTotal()
      }
    },
    updatePaymentTotal() {
      this.$forceUpdate()
    },
    formatTunCurrency(value) {
      const amount = parseFloat(value) || 0
      const formatted = amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
      return `${formatted} TND`
    },
    formatTunCurrencyWithoutSuffix(value) {
      const amount = parseFloat(value) || 0
      return amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    },
    goBack() {
      this.$router.push({ name: 'pos-item-selection' })
    },
    async printReceipt(saleData) {
      console.log('Printing receipt with data:', saleData)

      const Vue = this.$root.constructor || this.$options._base
      const ReceiptComponent = Vue.extend(ReceiptTemplate)

      const instance = new ReceiptComponent({
        parent: this,
        propsData: { saleData }
      })

      instance.$mount()

      const printWindow = window.open('', '_blank')
      if (!printWindow) {
        this.$toast({
          component: ToastificationContent,
          props: {
            title: this.$t('pos.payment.errors.printError'),
            icon: 'XIcon',
            text: this.$t('pos.payment.errors.allowPopups'),
            variant: 'warning'
          }
        })
        return
      }

      await this.$nextTick()
      await new Promise(resolve => setTimeout(resolve, 200))

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

      setTimeout(() => {
        printWindow.focus()
        printWindow.print()

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
        const payments = this.paymentCards
          .filter(card => card.paymentMethodId)
          .map(card => {
            // For return voucher, use voucher number as reference
            const reference = this.isReturnVoucherPayment(card)
              ? (card.voucherNumber || null)
              : null

            return {
              paymentMethodId: card.paymentMethodId,
              amount: parseFloat(card.amount),
              reference: reference,
              notes: null,
              titleNumber: card.titleNumber ? card.titleNumber.trim() : null,
              dueDate: card.dueDate || null,
              drawerName: card.drawerName ? card.drawerName.trim() : null,
              issuingBank: card.issuingBank ? card.issuingBank.trim() : null
            }
          })

        const saleRequest = {
          subtotal: this.orderSummary.subtotal,
          taxAmount: this.orderSummary.taxAmount,
          discountAmount: this.orderSummary.discountAmount || 0,
          discountPercentage: this.orderSummary.discountPercent || null,
          totalAmount: this.totalAfterDiscount,
          paidAmount: this.totalPaid,
          changeAmount: this.remainingBalance < 0 ? Math.abs(this.remainingBalance) : 0,
          customerId: this.selectedCustomerId || null,
          notes: `Payment via ${payments.length} method(s)`,
          lines: this.cart.map(item => {
            const lineTotal = item.unitPrice * item.quantity
            const vatPercent = item.defaultVAT || 0
            const originalLineTotalIncludingVat = lineTotal * (1 + (vatPercent / 100))
            
            // Calculate discount - discount is applied to total including VAT
            let discountAmount = 0
            if (item.discountPercentage) {
              discountAmount = originalLineTotalIncludingVat * (item.discountPercentage / 100)
            } else if (item.discountAmount) {
              discountAmount = item.discountAmount
            }
            
            // Calculate totals after discount
            const lineTotalIncludingVat = Math.max(0, originalLineTotalIncludingVat - discountAmount)
            
            // Calculate excluding VAT total from including VAT total
            const discountedLineTotal = lineTotalIncludingVat / (1 + (vatPercent / 100))
            const vatAmount = lineTotalIncludingVat - discountedLineTotal
            
            const unitPriceIncludingVat = item.unitPrice * (1 + (vatPercent / 100))
            
            return {
              itemId: item.id,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              lineTotal: discountedLineTotal,
              discountPercentage: item.discountPercentage || null,
              discountAmount: discountAmount || null,
              vatAmount: vatAmount,
              vatPercent: vatPercent,
              unitPriceIncludingVat: unitPriceIncludingVat,
              lineTotalIncludingVat: lineTotalIncludingVat
            }
          }),
          payments: payments
        }

        const isPendingTicket = !!this.pendingTicketId

        console.log('=== Payment Processing ===')
        console.log('Pending Ticket ID:', this.pendingTicketId)
        console.log('Is Pending Ticket:', isPendingTicket)

        let response
        if (isPendingTicket) {
          console.log(`✓ Completing pending ticket ${this.pendingTicketId}`)
          response = await this.$http.post(`/sales-header/complete-pending/${this.pendingTicketId}`, saleRequest)
        } else {
          console.log('✗ Creating NEW sale')
          response = await this.$http.post('/sales-header/process-sale', saleRequest)
        }

        console.log('✓ Payment Response - Sales Number:', response.data?.salesNumber)

        if (response.status === 200) {
          this.$store.dispatch('pos/clearCart')
          this.$store.dispatch('pos/clearOrderSummary')
          this.$store.dispatch('pos/clearPendingTicketId')

          this.resetCustomerToPassenger()

          this.$toast({
            component: ToastificationContent,
            props: {
              title: this.$t('pos.payment.success.saleCompleted'),
              icon: 'CheckCircleIcon',
              text: this.$t('pos.payment.success.saleCompletedText', { number: response.data.salesNumber }),
              variant: 'success'
            }
          })

          this.printReceipt(response.data)

          setTimeout(() => {
            this.$router.push({ name: 'pos-item-selection' })
          }, 2000)
        }

      } catch (error) {
        console.error('Error completing payment:', error)
        let errorMessage = this.$t('pos.payment.errors.failedToComplete')

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
    },
    async saveAsPending() {
      if (this.cart.length === 0) return

      this.loading = true

      try {
        const saleRequest = {
          subtotal: this.orderSummary.subtotal,
          taxAmount: this.orderSummary.taxAmount,
          discountAmount: this.orderSummary.discountAmount || 0,
          discountPercentage: this.orderSummary.discountPercent || null,
          totalAmount: this.totalAfterDiscount,
          paidAmount: 0,
          changeAmount: 0,
          customerId: this.selectedCustomerId || null,
          notes: 'Pending sale - customer will return',
          lines: this.cart.map(item => {
            const lineTotal = item.unitPrice * item.quantity
            const vatPercent = item.defaultVAT || 0
            const originalLineTotalIncludingVat = lineTotal * (1 + (vatPercent / 100))
            
            // Calculate discount - discount is applied to total including VAT
            let discountAmount = 0
            if (item.discountPercentage) {
              discountAmount = originalLineTotalIncludingVat * (item.discountPercentage / 100)
            } else if (item.discountAmount) {
              discountAmount = item.discountAmount
            }
            
            // Calculate totals after discount
            const lineTotalIncludingVat = Math.max(0, originalLineTotalIncludingVat - discountAmount)
            
            // Calculate excluding VAT total from including VAT total
            const discountedLineTotal = lineTotalIncludingVat / (1 + (vatPercent / 100))
            const vatAmount = lineTotalIncludingVat - discountedLineTotal
            
            const unitPriceIncludingVat = item.unitPrice * (1 + (vatPercent / 100))
            
            return {
              itemId: item.id,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              lineTotal: discountedLineTotal,
              discountPercentage: item.discountPercentage || null,
              discountAmount: discountAmount || null,
              vatAmount: vatAmount,
              vatPercent: vatPercent,
              unitPriceIncludingVat: unitPriceIncludingVat,
              lineTotalIncludingVat: lineTotalIncludingVat
            }
          }),
          payments: []
        }

        const response = await this.$http.post('/sales-header/save-pending', saleRequest)

        if (response.status === 200) {
          this.$store.dispatch('pos/clearCart')
          this.$store.dispatch('pos/clearOrderSummary')

          this.resetCustomerToPassenger()

          this.$toast({
            component: ToastificationContent,
            props: {
              title: this.$t('pos.payment.success.pendingTicketSaved'),
              icon: 'CheckCircleIcon',
              text: this.$t('pos.payment.success.pendingTicketSavedText', { number: response.data.salesNumber }),
              variant: 'success'
            }
          })

          setTimeout(() => {
            this.$router.push({ name: 'pos-item-selection' })
          }, 1500)
        }

      } catch (error) {
        console.error('Error saving pending sale:', error)
        let errorMessage = this.$t('pos.payment.errors.failedToSavePending')

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
    }
  }
}
</script>

<style scoped>
.payment-container {
  margin: 0;
  padding: 0;
  height: 100vh;
  width: 100%;
  max-width: 100%;
  overflow: hidden;
  display: grid;
  grid-template-rows: auto 1fr auto;
  grid-template-areas:
    "summary"
    "main"
    "actions";
  background: #f5f5f5;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  box-sizing: border-box;
}

/* Panel 1: Summary Panel (Top) */
.panel-summary {
  grid-area: summary;
  background: #fff;
  border-bottom: 2px solid #e0e0e0;
  padding: 12px 15px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 15px;
  height: auto;
  max-height: 120px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  z-index: 10;
  width: 100%;
  box-sizing: border-box;
  overflow: hidden;
  flex-shrink: 0;
}

.summary-left {
  display: flex;
  align-items: center;
  gap: 15px;
  flex: 0 0 auto;
}

.back-btn {
  min-width: 100px;
  height: 40px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  touch-action: manipulation;
}

.summary-customer {
  flex: 0 0 auto;
}

.customer-info-display {
  display: flex;
  align-items: center;
  gap: 8px;
}

.customer-info-display strong {
  font-size: 1.1rem;
  color: #2c3e50;
}

.customer-info-display small {
  font-size: 0.9rem;
  color: #6c757d;
}

.summary-totals {
  flex: 1;
  display: flex;
  gap: 30px;
  flex-wrap: wrap;
  justify-content: flex-end;
  min-width: 0;
  box-sizing: border-box;
}

.summary-item {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
}

.summary-label {
  font-size: 0.85rem;
  color: #6c757d;
  font-weight: 500;
}

.summary-value {
  font-size: 1.1rem;
  font-weight: bold;
  color: #2c3e50;
}

/* Main Content Area */
.payment-main-content {
  grid-area: main;
  display: grid;
  grid-template-columns: 280px 1fr;
  grid-template-areas: "classes content";
  overflow: hidden;
  gap: 0;
  min-width: 0;
  width: 100%;
  box-sizing: border-box;
}

/* Panel 2: Payment Classes (Left) */
.panel-payment-classes {
  grid-area: classes;
  background: #fff;
  border-right: 2px solid #e0e0e0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  width: 100%;
  min-width: 0;
  box-sizing: border-box;
}

.payment-classes-header {
  padding: 15px;
  border-bottom: 2px solid #e0e0e0;
  background: #f8f9fa;
}

.payment-classes-header h5 {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: #2c3e50;
}

.payment-classes-list {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 10px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
  box-sizing: border-box;
  /* Hide scrollbar but keep touch scrolling */
  scrollbar-width: none;
  /* Firefox */
  -ms-overflow-style: none;
  /* IE and Edge */
}

.payment-classes-list::-webkit-scrollbar {
  display: none;
  /* Chrome, Safari, Opera */
}

.payment-class-item {
  padding: 12px 10px;
  background: #f8f9fa;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  justify-content: space-between;
  align-items: center;
  min-height: 50px;
  touch-action: manipulation;
  width: 100%;
  box-sizing: border-box;
  min-width: 0;
  flex-shrink: 0;
}

.payment-class-item:hover {
  background: #e9ecef;
  border-color: #7367f0;
  transform: translateX(2px);
}

.payment-class-item.active {
  background: #f0f4ff;
  border-color: #7367f0;
  border-width: 3px;
  box-shadow: 0 4px 12px rgba(115, 103, 240, 0.2);
}

.payment-class-name {
  font-weight: 600;
  color: #2c3e50;
  font-size: 0.95rem;
  flex: 1;
  text-align: left;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.payment-class-total {
  font-weight: bold;
  color: #28a745;
  font-size: 0.9rem;
  margin-left: 10px;
  flex-shrink: 0;
  white-space: nowrap;
}

/* Right Side Content */
.payment-right-content {
  grid-area: content;
  display: grid;
  grid-template-rows: 1fr auto;
  grid-template-areas:
    "cards"
    "keyboard";
  overflow: hidden;
  min-width: 0;
  width: 100%;
  box-sizing: border-box;
}

/* Panel 4: Payment Cards (Right-Top, Scrollable) */
.panel-payment-cards {
  grid-area: cards;
  background: #fff;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  width: 100%;
  min-width: 0;
  box-sizing: border-box;
}

.payment-cards-header {
  padding: 15px;
  border-bottom: 2px solid #e0e0e0;
  background: #f8f9fa;
  flex-shrink: 0;
}

.payment-cards-header h5 {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: #2c3e50;
}

.payment-cards-container {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 10px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-width: 0;
  box-sizing: border-box;
  /* Hide scrollbar but keep touch scrolling */
  scrollbar-width: none;
  /* Firefox */
  -ms-overflow-style: none;
  /* IE and Edge */
}

.payment-cards-container::-webkit-scrollbar {
  display: none;
  /* Chrome, Safari, Opera */
}

.empty-cards {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: #999;
  text-align: center;
}

.payment-cards-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.payment-card {
  background: #f8f9fa;
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  padding: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  touch-action: manipulation;
  width: 100%;
  box-sizing: border-box;
  min-width: 0;
  flex-shrink: 0;
}

.payment-card:hover {
  border-color: #7367f0;
  box-shadow: 0 2px 8px rgba(115, 103, 240, 0.15);
}

.payment-card.selected {
  background: #f0f4ff;
  border-color: #7367f0;
  border-width: 3px;
  box-shadow: 0 4px 12px rgba(115, 103, 240, 0.25);
}

.payment-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding-bottom: 10px;
  border-bottom: 1px solid #e0e0e0;
}

.payment-card-title {
  flex: 1;
}

.payment-card-title strong {
  font-size: 1rem;
  color: #2c3e50;
}

.card-delete-btn {
  color: #dc3545;
  padding: 4px 8px;
}

.card-delete-btn:hover {
  color: #c82333;
}

.payment-card-body {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
}

.payment-card-body .form-group {
  margin-bottom: 0;
  min-width: 0;
}

.payment-card-body input,
.payment-card-body select,
.payment-card-body .input-group {
  max-width: 100%;
  box-sizing: border-box;
}

/* Panel 5: Numeric Keyboard (Bottom-Right) */
.panel-keyboard {
  grid-area: keyboard;
  background: #fff;
  border-top: 2px solid #e0e0e0;
  padding: 10px 15px;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  min-width: 0;
  box-sizing: border-box;
  overflow: hidden;
  flex-shrink: 0;
  min-height: 180px;
  max-height: 220px;
}

.keyboard-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
  max-width: 400px;
  width: 100%;
  box-sizing: border-box;
}

.keyboard-key {
  min-height: 50px;
  height: 50px;
  font-size: 1.3rem;
  font-weight: 600;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  background: #fff;
  color: #2c3e50;
  cursor: pointer;
  transition: all 0.15s ease;
  touch-action: manipulation;
  user-select: none;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.keyboard-key:hover:not(:disabled) {
  background: #f0f0f0;
  border-color: #7367f0;
  transform: scale(0.98);
}

.keyboard-key:active:not(:disabled) {
  transform: scale(0.95);
  background: #e0e0e0;
}

.keyboard-key:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.key-decimal {
  font-size: 1.2rem;
}

.key-backspace {
  background: #ffc107;
  color: #000;
  font-weight: bold;
}

.key-backspace:hover:not(:disabled) {
  background: #ffb300;
}

/* Panel 3: Actions Panel (Bottom) */
.panel-actions {
  grid-area: actions;
  background: #fff;
  border-top: 2px solid #e0e0e0;
  padding: 12px 15px;
  display: flex;
  gap: 12px;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
  box-shadow: 0 -2px 4px rgba(0, 0, 0, 0.1);
  z-index: 10;
  width: 100%;
  box-sizing: border-box;
  overflow: hidden;
  flex-shrink: 0;
  height: auto;
  max-height: 90px;
}

.action-btn {
  min-width: 150px;
  height: 45px;
  font-weight: 600;
  font-size: 0.95rem;
  touch-action: manipulation;
  padding: 8px 15px;
}

.action-btn:disabled {
  opacity: 0.6;
}

/* Loading Overlay */
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

/* Scrollbars are hidden but scrolling still works via touch/drag */

/* Responsive adjustments for smaller screens */
@media (max-width: 1200px) {
  .payment-main-content {
    grid-template-columns: 250px 1fr;
  }

  .summary-totals {
    gap: 20px;
  }
}

@media (max-width: 768px) {
  .payment-main-content {
    grid-template-columns: 1fr;
    grid-template-areas: "content";
  }

  .panel-payment-classes {
    display: none;
    /* Hide on mobile, can be shown via toggle later */
  }

  .summary-totals {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .summary-item {
    align-items: flex-start;
  }

  .panel-actions {
    flex-direction: column;
  }

  .action-btn {
    width: 100%;
  }
}
</style>
