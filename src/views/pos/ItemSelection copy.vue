<template>
  <div class="pos-container">
    <b-row class="pos-content">
      <!-- Items Grid -->
      <b-col cols="12" md="8" lg="9" class="items-section">
        <div class="items-header">
          <!-- Barcode Scanner Input -->
          <b-input-group class="mb-3">
            <b-input-group-prepend>
              <span class="input-group-text">
                <feather-icon icon="HashIcon" size="18" />
              </span>
            </b-input-group-prepend>
            <b-form-input
              v-model="barcodeInput"
              placeholder="Scan barcode (or type and press Enter)..."
              @keyup.enter="handleBarcodeScan"
              @input="onBarcodeInput"
              ref="barcodeInput"
              class="barcode-scanner-input"
              :disabled="barcodeScanning"
              autofocus
            />
            <b-input-group-append>
              <b-button variant="primary" @click="handleBarcodeScan" :disabled="barcodeScanning">
                <b-spinner v-if="barcodeScanning" small class="mr-1" />
                <feather-icon v-else icon="SearchIcon" size="16" />
              </b-button>
            </b-input-group-append>
          </b-input-group>

          <!-- Regular Search Input -->
          <b-input-group>
            <b-input-group-prepend>
              <span class="input-group-text">
                <feather-icon icon="SearchIcon" size="16" />
              </span>
            </b-input-group-prepend>
            <b-form-input v-model="searchQuery" placeholder="Search by name or code..." @input="filterItems" />
            <b-input-group-append>
              <b-button variant="outline-secondary" @click="clearSearch">
                <feather-icon icon="XIcon" size="16" />
              </b-button>
            </b-input-group-append>
          </b-input-group>
        </div>

        <div class="items-grid">
          <div v-for="item in filteredItems" :key="item.id" class="item-card" @click="addToCart(item)">
            <div class="item-image">
              <feather-icon icon="PackageIcon" size="40" />
            </div>
            <div class="item-details">
              <h5>{{ item.name }}</h5>
              <p class="item-code">{{ item.itemCode }}</p>
              <p class="item-price">${{ formatPrice(item.unitPrice) }}</p>
              <p v-if="item.stockQuantity !== null" class="item-stock">
                Stock: {{ item.stockQuantity }}
              </p>
            </div>
          </div>
        </div>
      </b-col>

      <!-- Cart Section -->
      <b-col cols="12" md="4" lg="3" class="cart-section">
        <div v-if="currentSession" class="session-info-card mb-3">
          <div class="d-flex justify-content-between align-items-start">
            <div>
              <div class="session-number">Session {{ currentSession.sessionNumber }}</div>
              <div class="session-status">
                <b-badge :variant="currentSession.status === 'OPENED' ? 'success' : 'secondary'">
                  {{ currentSession.status || 'UNKNOWN' }}
                </b-badge>
              </div>
              <div class="session-meta">
                <div v-if="currentSession.openedAt">Opened: {{ formatDateTime(currentSession.openedAt) }}</div>
                <div>Opening Cash: ${{ formatPrice(currentSession.openingCash || 0) }}</div>
                <div>Real Cash: ${{ formatPrice(currentSession.realCash || 0) }}</div>
              </div>
            </div>
            <b-button variant="outline-warning" size="sm" @click="showCloseSessionModal = true">
              Close
            </b-button>
          </div>
        </div>

        <div class="cart-header">
          <h4 class="cart-title">Cart</h4>
          <b-button v-if="cart.length > 0" variant="outline-secondary" size="sm" @click="clearCart">
            Clear
          </b-button>
        </div>

        <div class="cart-items">
          <div v-if="cart.length === 0" class="empty-cart">
            <p>Cart is empty</p>
          </div>
          <div v-for="(cartItem, index) in cart" :key="index" class="cart-item">
            <div class="cart-item-info">
              <h6>{{ cartItem.name }}</h6>
              <p class="cart-item-code">{{ cartItem.itemCode }}</p>
              <div class="cart-item-controls">
                <b-button variant="outline-primary" size="sm" @click="decreaseQuantity(index)">
                  -
                </b-button>
                <span class="quantity">{{ cartItem.quantity }}</span>
                <b-button variant="outline-primary" size="sm" @click="increaseQuantity(index)">
                  +
                </b-button>
                <b-button variant="outline-danger" size="sm" @click="removeFromCart(index)">
                  Remove
                </b-button>
              </div>
            </div>
            <div class="cart-item-total">
              ${{ formatPrice(cartItem.unitPrice * cartItem.quantity) }}
            </div>
          </div>
        </div>

        <div class="cart-summary">
          <div class="summary-row">
            <span>Subtotal:</span>
            <span>${{ formatPrice(subtotal) }}</span>
          </div>
          <div class="summary-row">
            <span>Tax:</span>
            <span>${{ formatPrice(taxAmount) }}</span>
          </div>
          <div class="summary-row total">
            <span>Total:</span>
            <span>${{ formatPrice(totalAmount) }}</span>
          </div>
        </div>

        <b-button variant="success" size="lg" block :disabled="cart.length === 0" @click="proceedToPayment">
          Proceed to Payment
        </b-button>
        
          <b-button 
            variant="outline-info" 
            size="md" 
            block 
            @click="goToCustomerManagement"
            class="mt-3"
          >
            <feather-icon icon="UsersIcon" size="16" class="mr-1" />
            Customer Management
          </b-button>

          <b-button 
            variant="outline-warning" 
            size="md" 
            block 
            @click="showPendingTicketsModal = true"
            class="mt-2"
          >
            <feather-icon icon="ClockIcon" size="16" class="mr-1" />
            Pending Tickets 
            <b-badge v-if="pendingTicketsCount > 0" variant="warning" class="ml-2">
              {{ pendingTicketsCount }}
            </b-badge>
          </b-button>

          <b-button 
            variant="outline-info" 
            size="md" 
            block 
            @click="goToReturn"
            class="mt-2"
          >
            <feather-icon icon="RotateCcwIcon" size="16" class="mr-1" />
            Return Products
          </b-button>
      </b-col>
    </b-row>

    <!-- Pending Tickets Modal -->
    <b-modal
      id="pending-tickets-modal"
      v-model="showPendingTicketsModal"
      title="Pending Tickets"
      size="xl"
      @show="loadPendingTickets"
      @hide="resetPendingTickets"
    >
      <div v-if="loadingPendingTickets" class="text-center py-4">
        <b-spinner class="align-middle"></b-spinner>
        <p class="mt-2">Loading pending tickets...</p>
      </div>

      <div v-else-if="pendingTickets.length === 0" class="text-center py-4">
        <feather-icon icon="CheckCircleIcon" size="48" class="text-success mb-3" />
        <h5>No Pending Tickets</h5>
        <p class="text-muted">All tickets are completed</p>
      </div>

      <div v-else class="pending-tickets-list">
        <b-card
          v-for="ticket in pendingTickets"
          :key="ticket.id"
          class="mb-3 ticket-card"
        >
          <div class="d-flex justify-content-between align-items-start mb-2">
            <div>
              <h6 class="mb-1">Ticket: {{ ticket.salesNumber }}</h6>
              <small class="text-muted">
                Created: {{ formatDateTime(ticket.salesDate) }}
              </small>
            </div>
            <b-badge variant="warning">PENDING</b-badge>
          </div>

          <div class="ticket-items mb-2">
            <h6 class="small font-weight-bold mb-1">Items:</h6>
            <div v-for="(line, idx) in ticket.salesLines" :key="idx" class="ticket-item-line">
              <span>{{ line.item.name }}</span>
              <span class="float-right">
                {{ line.quantity }} x ${{ formatPrice(line.unitPrice) }} = ${{ formatPrice(line.lineTotal) }}
              </span>
            </div>
          </div>

          <div class="ticket-summary">
            <div class="d-flex justify-content-between">
              <span>Subtotal:</span>
              <span>${{ formatPrice(ticket.subtotal) }}</span>
            </div>
            <div class="d-flex justify-content-between">
              <span>Tax:</span>
              <span>${{ formatPrice(ticket.taxAmount) }}</span>
            </div>
            <div class="d-flex justify-content-between font-weight-bold">
              <span>Total:</span>
              <span>${{ formatPrice(ticket.totalAmount) }}</span>
            </div>
          </div>

          <div class="mt-3 d-flex gap-2">
            <b-button 
              variant="primary" 
              size="sm" 
              class="flex-grow-1"
              @click="retrievePendingTicket(ticket)"
            >
              <feather-icon icon="ArrowRightIcon" size="14" class="mr-1" />
              Continue
            </b-button>
            <b-button 
              variant="danger" 
              size="sm"
              @click="confirmDeletePendingTicket(ticket)"
            >
              <feather-icon icon="TrashIcon" size="14" />
            </b-button>
          </div>
        </b-card>
      </div>
    </b-modal>

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
import useJwt from '@/auth/jwt/useJwt'
import ToastificationContent from '@core/components/toastification/ToastificationContent.vue'

export default {
  name: 'ItemSelection',
  data() {
    return {
      items: [],
      filteredItems: [],
      searchQuery: '',
      barcodeInput: '',
      barcodeScanning: false,
      itemsWithBarcodes: [], // Cache of items with their barcodes
      showCloseSessionModal: false,
      showPendingTicketsModal: false,
      pendingTickets: [],
      loadingPendingTickets: false,
      pendingTicketsCount: 0,
      pendingTicketsInterval: null,
      ticketToDelete: null,
      closeSessionData: {
        actualCash: null,
        notes: '',
        cashCountLines: []
      },
      loadingSession: false,
      paymentMethods: [],
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
    cart() {
      // Always use store as source of truth
      return this.$store.state.pos.cart || []
    },
    subtotal() {
      return this.cart.reduce((sum, item) => {
        return sum + (item.unitPrice * item.quantity)
      }, 0)
    },
    taxAmount() {
      // If we have orderSummary from store, calculate tax from subtotal
      // Simple 10% tax calculation (can be improved later)
      return this.subtotal * 0.1
    },
    totalAmount() {
      return this.subtotal + this.taxAmount
    },
    pendingTicketId() {
      return this.$store.state.pos.pendingTicketId
    },
    currentSession() {
      return this.$store.state.pos.currentSession
    },
    paymentMethodOptions() {
      return this.paymentMethods.filter(pm => pm.active !== false)
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
  mounted() {
    this.loadCurrentSession()
    this.loadItems()
    this.loadItemsWithBarcodes()
    this.loadPaymentMethods()
    this.loadPendingTicketsCount()
    
    // Cart is now always loaded from store via computed property
    // Focus on barcode input when component mounts
    this.$nextTick(() => {
      if (this.$refs.barcodeInput) {
        this.$refs.barcodeInput.focus()
      }
    })
    
    // Listen for close session modal event from navbar
    this.$root.$on('open-close-session-modal', () => {
      this.showCloseSessionModal = true
    })
    
    // Refresh pending count periodically
    this.pendingTicketsInterval = setInterval(() => {
      this.loadPendingTicketsCount()
    }, 10000) // Check every 10 seconds
  },
  beforeDestroy() {
    if (this.pendingTicketsInterval) {
      clearInterval(this.pendingTicketsInterval)
    }
    this.$root.$off('open-close-session-modal')
  },
  methods: {
    loadItems() {
      this.$http.get('/item')
        .then(response => {
          this.items = response.data
          this.filteredItems = this.items
        })
        .catch(error => {
          console.error('Error loading items:', error)
          this.$toast({
            title: 'Error',
            text: 'Failed to load items',
            variant: 'danger'
          })
        })
    },
    async loadItemsWithBarcodes() {
      try {
        // Load items with their barcodes for faster lookup
        const response = await this.$http.get('/item-barcode/items-with-barcodes')
        this.itemsWithBarcodes = response.data
      } catch (error) {
        console.error('Error loading items with barcodes:', error)
        // Don't show error toast as this is optional optimization
      }
    },
    filterItems() {
      if (!this.searchQuery) {
        this.filteredItems = this.items
        return
      }
      const query = this.searchQuery.toLowerCase()
      this.filteredItems = this.items.filter(item => {
        // Check item name and code
        const matchesItem = item.name.toLowerCase().includes(query) ||
          item.itemCode.toLowerCase().includes(query) ||
          (item.barcode && item.barcode.toLowerCase().includes(query))
        
        // Check item barcodes from ItemBarcode entity
        const itemWithBarcodes = this.itemsWithBarcodes.find(iwb => iwb.item.id === item.id)
        if (itemWithBarcodes && itemWithBarcodes.barcodes) {
          const matchesBarcode = itemWithBarcodes.barcodes.some(barcode =>
            barcode.barcode && barcode.barcode.toLowerCase().includes(query)
          )
          return matchesItem || matchesBarcode
        }
        
        return matchesItem
      })
    },
    onBarcodeInput() {
      // Clear search query when barcode input changes to avoid conflicts
      if (this.barcodeInput) {
        this.searchQuery = ''
      }
    },
    async handleBarcodeScan() {
      if (!this.barcodeInput || this.barcodeInput.trim() === '') {
        return
      }

      const barcode = this.barcodeInput.trim()
      this.barcodeScanning = true

      try {
        // First try to find item by barcode in the cached itemsWithBarcodes
        let foundItem = null

        for (const itemData of this.itemsWithBarcodes) {
          const barcodeMatch = itemData.barcodes.find(b => 
            b.barcode && b.barcode.toLowerCase() === barcode.toLowerCase()
          )
          if (barcodeMatch && itemData.item.active !== false) {
            foundItem = itemData.item
            break
          }
        }

        // If not found in cache, try the Item.barcode field (legacy support)
        if (!foundItem) {
          foundItem = this.items.find(item => 
            item.barcode && item.barcode.toLowerCase() === barcode.toLowerCase() && 
            item.active !== false
          )
        }

        // If still not found, try API call to find item by barcode
        if (!foundItem) {
          try {
            const response = await this.$http.get(`/item-barcode/barcode/${encodeURIComponent(barcode)}`)
            if (response.data) {
              foundItem = response.data
            }
          } catch (apiError) {
            // API endpoint might not exist or item not found
            if (apiError.response && apiError.response.status === 404) {
              // Item not found - this is expected, will show message below
            } else {
              console.error('Error finding item by barcode:', apiError)
            }
          }
        }

        if (foundItem) {
          // Add item to cart
          this.addToCart(foundItem)
          
          // Clear barcode input and refocus
          this.barcodeInput = ''
          this.$nextTick(() => {
            if (this.$refs.barcodeInput) {
              this.$refs.barcodeInput.focus()
            }
          })

          // Show success feedback (silent - no toast to avoid interruption during fast scanning)
          // Toast can be annoying when scanning multiple items quickly
        } else {
          // Barcode not found
          this.$toast({
            component: ToastificationContent,
            props: {
              title: 'Barcode Not Found',
              icon: 'AlertCircleIcon',
              text: `No item found with barcode: ${barcode}`,
              variant: 'warning'
            }
          })

          // Keep barcode in input so user can correct it
          this.$nextTick(() => {
            if (this.$refs.barcodeInput) {
              this.$refs.barcodeInput.select()
              this.$refs.barcodeInput.focus()
            }
          })
        }
      } catch (error) {
        console.error('Error scanning barcode:', error)
        this.$toast({
          component: ToastificationContent,
          props: {
            title: 'Error',
            icon: 'XIcon',
            text: 'Failed to scan barcode. Please try again.',
            variant: 'danger'
          }
        })
      } finally {
        this.barcodeScanning = false
      }
    },
    clearSearch() {
      this.searchQuery = ''
      this.filteredItems = this.items
    },
    async loadPendingTicketsCount() {
      try {
        const response = await this.$http.get('/sales-header/pending-sales')
        this.pendingTicketsCount = response.data.length
        // Update navbar if needed
        this.$forceUpdate()
      } catch (error) {
        console.error('Error loading pending tickets count:', error)
      }
    },
    async loadPendingTickets() {
      this.loadingPendingTickets = true
      try {
        const response = await this.$http.get('/sales-header/pending-sales')
        this.pendingTickets = response.data
        this.pendingTicketsCount = response.data.length
      } catch (error) {
        console.error('Error loading pending tickets:', error)
        this.$toast({
          component: require('@core/components/toastification/ToastificationContent.vue').default,
          props: {
            title: 'Error',
            icon: 'XIcon',
            text: 'Failed to load pending tickets',
            variant: 'danger'
          }
        })
      } finally {
        this.loadingPendingTickets = false
      }
    },
    retrievePendingTicket(ticket) {
      // Convert pending ticket sales lines to cart items
      const cartItems = ticket.salesLines.map(line => ({
        id: line.item.id,
        itemCode: line.item.itemCode,
        name: line.item.name,
        unitPrice: line.unitPrice,
        quantity: line.quantity
      }))

      // Set cart and order summary
      this.$store.dispatch('pos/setCart', cartItems)
      this.$store.dispatch('pos/setOrderSummary', {
        subtotal: ticket.subtotal,
        taxAmount: ticket.taxAmount,
        discountAmount: ticket.discountAmount || 0,
        totalAmount: ticket.totalAmount
      })

      // Store pending ticket ID in store for later use
      this.$store.dispatch('pos/setPendingTicketId', ticket.id)

      // Close modal and stay on item selection page (so user can add more items)
      this.showPendingTicketsModal = false
      
      this.$toast({
        component: ToastificationContent,
        props: {
          title: 'Ticket Retrieved',
          icon: 'CheckCircleIcon',
          text: `Pending ticket ${ticket.salesNumber} loaded. You can add more items or proceed to payment.`,
          variant: 'success'
        }
      })
      
      // Focus on barcode input
      this.$nextTick(() => {
        if (this.$refs.barcodeInput) {
          this.$refs.barcodeInput.focus()
        }
      })
    },
    resetPendingTickets() {
      // Refresh count when modal closes
      this.loadPendingTicketsCount()
      this.ticketToDelete = null
    },
    confirmDeletePendingTicket(ticket) {
      this.ticketToDelete = ticket
      this.$bvModal.msgBoxConfirm(
        `Are you sure you want to delete pending ticket "${ticket.salesNumber}"? This action cannot be undone.`,
        {
          title: 'Delete Pending Ticket',
          size: 'sm',
          buttonSize: 'sm',
          okVariant: 'danger',
          okTitle: 'Delete',
          cancelTitle: 'Cancel',
          footerClass: 'p-2',
          hideHeaderClose: false,
          centered: true
        }
      )
        .then(value => {
          if (value) {
            this.deletePendingTicket(ticket.id)
          }
          this.ticketToDelete = null
        })
    },
    async deletePendingTicket(ticketId) {
      try {
        const response = await this.$http.post(`/sales-header/cancel-pending/${ticketId}`)
        
        if (response.status === 200) {
          this.$toast({
            component: ToastificationContent,
            props: {
              title: 'Success',
              icon: 'CheckCircleIcon',
              text: 'Pending ticket deleted successfully',
              variant: 'success'
            }
          })
          
          // Reload pending tickets
          await this.loadPendingTickets()
          this.loadPendingTicketsCount()
          
          // If the deleted ticket was the one we were working on, clear it
          if (this.pendingTicketId === ticketId) {
            this.$store.dispatch('pos/clearPendingTicketId')
          }
        }
      } catch (error) {
        console.error('Error deleting pending ticket:', error)
        let errorMessage = 'Failed to delete pending ticket. Please try again.'
        
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
      }
    },
    formatDateTime(dateString) {
      if (!dateString) return ''
      const date = new Date(dateString)
      return date.toLocaleString()
    },
    addToCart(item) {
      const currentCart = [...this.cart] // Create copy since computed property is readonly
      const existingItem = currentCart.find(cartItem => cartItem.id === item.id)
      if (existingItem) {
        existingItem.quantity += 1
      } else {
        // Add new item to the beginning of the cart (first row)
        currentCart.unshift({
          id: item.id,
          itemCode: item.itemCode,
          name: item.name,
          unitPrice: item.unitPrice || 0,
          quantity: 1
        })
      }
      // Update store
      this.$store.dispatch('pos/setCart', currentCart)
    },
    increaseQuantity(index) {
      const currentCart = [...this.cart]
      currentCart[index].quantity += 1
      this.$store.dispatch('pos/setCart', currentCart)
    },
    decreaseQuantity(index) {
      const currentCart = [...this.cart]
      if (currentCart[index].quantity > 1) {
        currentCart[index].quantity -= 1
        this.$store.dispatch('pos/setCart', currentCart)
      } else {
        this.removeFromCart(index)
      }
    },
    removeFromCart(index) {
      const currentCart = [...this.cart]
      currentCart.splice(index, 1)
      this.$store.dispatch('pos/setCart', currentCart)
    },
    clearCart() {
      this.$store.dispatch('pos/clearCart')
      // Also clear pending ticket if any
      if (this.pendingTicketId) {
        this.$store.dispatch('pos/clearPendingTicketId')
      }
    },
    formatPrice(price) {
      if (!price) return '0.00'
      return parseFloat(price).toFixed(2)
    },
    proceedToPayment() {
      // Update order summary with current values (may have changed if items were added/removed)
      // Cart is already in store, just update summary
      this.$store.dispatch('pos/setOrderSummary', {
        subtotal: this.subtotal,
        taxAmount: this.taxAmount,
        totalAmount: this.totalAmount
      })
      this.$router.push({ name: 'pos-payment' })
    },
    goToCustomerManagement() {
      // Navigate to customer management page with return route
      this.$router.push({ 
        name: 'pos-customers',
        query: { returnTo: 'pos-item-selection' }
      })
    },
    goToReturn() {
      // Navigate to return products page
      this.$router.push({ name: 'pos-return' })
    },
    clearPendingTicket() {
      // Clear pending ticket ID and reset to normal flow
      this.$store.dispatch('pos/clearPendingTicketId')
      this.$toast({
        component: ToastificationContent,
        props: {
          title: 'Cleared',
          icon: 'InfoIcon',
          text: 'Pending ticket cleared. Starting new sale.',
          variant: 'info'
        }
      })
    },
    async loadCurrentSession() {
      this.loadingSession = true
      
      // Use store to get session (checks API only if not cached)
      const session = await this.$store.dispatch('pos/checkSession')
      
      if (!session) {
        // No open session, redirect to open session page
        this.$router.push({ name: 'pos-open-session' })
      }
      
      this.loadingSession = false
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
    addCashCountLine() {
      this.closeSessionData.cashCountLines.push({
        denominationValue: null,
        quantity: null,
        paymentMethodId: null, // null = cash
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
          component: require('@core/components/toastification/ToastificationContent.vue').default,
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
          component: require('@core/components/toastification/ToastificationContent.vue').default,
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
            title: 'Success',
            text: 'Session closed successfully!',
            variant: 'success'
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
          title: 'Error',
          text: errorMessage,
          variant: 'danger'
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
.pos-container {
  padding: 20px;
  min-height: calc(100vh - 60px);
  display: flex;
  flex-direction: column;
}

@media (max-width: 575.98px) {
  .pos-container {
    padding: 15px;
  }
}

.pos-content {
  flex: 1;
  overflow: hidden;
}

@media (max-width: 767.98px) {
  .pos-content {
    overflow: visible;
  }
}

.items-section {
  border-right: 1px solid #e0e0e0;
  padding-right: 20px;
  height: 100%;
  display: flex;
  flex-direction: column;
}

@media (max-width: 767.98px) {
  .items-section {
    border-right: none;
    border-bottom: 1px solid #e0e0e0;
    padding-right: 0;
    padding-bottom: 20px;
    margin-bottom: 20px;
    max-height: none;
  }
}

.items-header {
  margin-bottom: 20px;
}

.barcode-scanner-input {
  font-size: 1.1rem;
  font-weight: 500;
  text-align: center;
  letter-spacing: 1px;
}

.barcode-scanner-input:focus {
  border-color: #28a745;
  box-shadow: 0 0 0 0.2rem rgba(40, 167, 69, 0.25);
}

@media (max-width: 575.98px) {
  .items-header h4,
  .cart-header h4 {
    font-size: 1rem;
  }
}

.items-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 18px;
  overflow-y: auto;
  flex: 1;
  padding-right: 10px;
}

@media (max-width: 991.98px) {
  .items-grid {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 15px;
  }
}

@media (max-width: 575.98px) {
  .items-grid {
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 12px;
  }
}

.item-card {
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  padding: 18px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: #fff;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

@media (max-width: 575.98px) {
  .item-card {
    padding: 12px;
  }

  .item-details h5 {
    font-size: 0.9rem;
  }

  .item-price {
    font-size: 1rem;
  }
}

.item-card:hover {
  border-color: #28a745;
  box-shadow: 0 4px 12px rgba(40, 167, 69, 0.25);
  transform: translateY(-2px);
}

.item-image {
  text-align: center;
  margin-bottom: 10px;
  color: #007bff;
}

.item-details {
  width: 100%;
  margin-top: 12px;
}

.item-details h5 {
  margin: 0 0 8px 0;
  font-size: 1rem;
  font-weight: 600;
  color: #2c3e50;
  line-height: 1.3;
  min-height: 2.6em;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.item-code {
  font-size: 0.8rem;
  color: #6c757d;
  margin: 0 0 10px 0;
  font-weight: 500;
}

.item-price {
  font-size: 1.25rem;
  font-weight: bold;
  color: #28a745;
  margin: 10px 0 5px 0;
}

.item-stock {
  font-size: 0.85rem;
  color: #666;
  margin: 5px 0 0 0;
}

.cart-section {
  padding-left: 20px;
  height: 100%;
  display: flex;
  flex-direction: column;
}

@media (max-width: 767.98px) {
  .cart-section {
    padding-left: 0;
    max-height: none;
  }
}

.session-info-card {
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  padding: 16px;
  background: #fff;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.session-number {
  font-weight: 600;
  font-size: 1rem;
  margin-bottom: 4px;
  color: #34495e;
}

.session-status {
  margin-bottom: 8px;
}

.session-meta {
  font-size: 0.85rem;
  color: #6c757d;
  line-height: 1.4;
}

.cart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 2px solid #e0e0e0;
}

.cart-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #2c3e50;
  margin: 0;
}

.cart-items {
  flex: 1;
  overflow-y: auto;
  margin-bottom: 20px;
}

.empty-cart {
  text-align: center;
  padding: 40px;
  color: #999;
}

.cart-item {
  display: flex;
  justify-content: space-between;
  padding: 15px;
  border-bottom: 1px solid #e0e0e0;
}

.cart-item-info {
  flex: 1;
}

.cart-item-info h6 {
  margin: 0 0 5px 0;
}

.cart-item-code {
  font-size: 0.85rem;
  color: #666;
  margin: 0 0 10px 0;
}

.cart-item-controls {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

@media (max-width: 575.98px) {
  .cart-item {
    flex-direction: column;
    gap: 10px;
    align-items: flex-start;
  }

  .cart-item-total {
    align-self: flex-end;
  }

  .cart-item-controls {
    width: 100%;
    justify-content: space-between;
  }
}

.quantity {
  min-width: 30px;
  text-align: center;
  font-weight: bold;
}

.cart-item-total {
  font-weight: bold;
  font-size: 1.1rem;
  color: #28a745;
}

.cart-summary {
  border-top: 2px solid #e0e0e0;
  padding-top: 15px;
  margin-bottom: 20px;
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

@media (max-width: 575.98px) {
  .cart-summary {
    font-size: 0.9rem;
  }

  .summary-row.total {
    font-size: 1.1rem;
  }

  .cart-section .btn {
    font-size: 0.9rem;
  }
}

/* Cash Count Modal Styles */
.cash-count-section {
  padding: 10px 0;
}

.cash-count-table-container {
  max-height: 400px;
  overflow-y: auto;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  padding: 10px;
}

@media (max-width: 575.98px) {
  .cash-count-table-container {
    max-height: 300px;
  }
}

.cash-count-total {
  border-top: 2px solid #28a745;
  padding-top: 15px;
}

/* Fix for table responsive on mobile */
@media (max-width: 575.98px) {
  .table-responsive {
    font-size: 0.85rem;
  }
}

/* Pending Tickets Modal Styles */
.pending-tickets-list {
  max-height: 500px;
  overflow-y: auto;
}

.ticket-card {
  border-left: 4px solid #ffc107;
  transition: all 0.2s;
}

.ticket-card:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.ticket-item-line {
  padding: 4px 0;
  border-bottom: 1px solid #f0f0f0;
  font-size: 0.9rem;
}

.ticket-item-line:last-child {
  border-bottom: none;
}

.ticket-summary {
  padding-top: 10px;
  border-top: 1px dashed #dee2e6;
  margin-top: 10px;
  font-size: 0.95rem;
}

.gap-2 {
  gap: 0.5rem;
}
</style>
