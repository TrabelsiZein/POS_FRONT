<template>
  <div class="pos-container">
    <b-row class="pos-content">
      <!-- Items Grid -->
      <b-col cols="12" md="8" lg="9" class="items-column">
        <div class="items-section" :class="{ 'compact-mode': compactMode }">
          <div class="items-header">
            <div class="input-row">
              <!-- Barcode Scanner Input -->
              <div class="input-col barcode-col">
                <b-input-group>
                  <b-input-group-prepend>
                    <span class="input-group-text">
                      <feather-icon icon="HashIcon" size="16" />
                    </span>
                  </b-input-group-prepend>
                  <b-form-input v-model="barcodeInput" placeholder="Scan barcode (or type and press Enter)..."
                    @keyup.enter="handleBarcodeScan" @input="onBarcodeInput" ref="barcodeInput"
                    class="barcode-scanner-input" :disabled="barcodeScanning" autofocus
                    @focus="setActiveInput('barcode')" />
                  <b-input-group-append>
                    <b-button variant="primary" @click="handleBarcodeScan"
                      :disabled="barcodeScanning || !barcodeInput.trim()">
                      <b-spinner v-if="barcodeScanning" small class="mr-1" />
                      <feather-icon v-else icon="SearchIcon" />
                    </b-button>
                  </b-input-group-append>
                </b-input-group>
              </div>

              <!-- Regular Search Input -->
              <div class="input-col search-col">
                <b-input-group>
                  <b-input-group-prepend>
                    <span class="input-group-text">
                      <feather-icon icon="SearchIcon" size="16" />
                    </span>
                  </b-input-group-prepend>
                  <b-form-input v-model="searchQuery" :placeholder="searchPlaceholder" @input="handleSearchInput"
                    @focus="setActiveInput('search')" />
                  <b-input-group-append>
                    <b-button variant="outline-secondary" @click="clearSearch" :disabled="!searchQuery.trim()">
                      <feather-icon icon="XIcon" />
                    </b-button>
                  </b-input-group-append>
                </b-input-group>
              </div>
            </div>

            <div class="hierarchy-controls">
              <div class="hierarchy-group">
                <b-button v-if="canNavigateBack" size="sm" variant="outline-secondary" @click="navigateBack">
                  <feather-icon icon="ArrowLeftIcon" size="14" class="mr-50" />
                  Back
                </b-button>
                <div class="breadcrumb-trail">
                  <span class="breadcrumb-chip" :class="{ active: isFamiliesView }" @click="resetToFamilies">
                    <feather-icon icon="LayersIcon" size="14" class="mr-25" />
                    Families
                  </span>
                  <template v-if="selectedFamily">
                    <span class="breadcrumb-separator">
                      <feather-icon icon="ChevronRightIcon" size="14" />
                    </span>
                    <span class="breadcrumb-chip" :class="{ active: isSubFamiliesView && !selectedSubFamily }"
                      @click="returnToSelectedFamily">
                      <feather-icon icon="GridIcon" size="14" class="mr-25" />
                      {{ selectedFamily.name }}
                    </span>
                  </template>
                  <template v-if="selectedSubFamily">
                    <span class="breadcrumb-separator">
                      <feather-icon icon="ChevronRightIcon" size="14" />
                    </span>
                    <span class="breadcrumb-chip active">
                      <feather-icon icon="PackageIcon" size="14" class="mr-25" />
                      {{ selectedSubFamily.name }}
                    </span>
                  </template>
                </div>
              </div>
              <b-button size="sm" :variant="compactMode ? 'outline-primary' : 'primary'" class="compact-toggle"
                @click="toggleCompactMode">
                <feather-icon :icon="compactMode ? 'MaximizeIcon' : 'MinimizeIcon'" size="14" class="mr-50" />
                {{ compactMode ? 'Comfort view' : 'Compact view' }}
              </b-button>
            </div>
          </div>

          <div class="items-body">
            <div class="items-grid-wrapper">
              <div v-if="gridLoading" class="grid-status">
                <b-spinner class="mb-1" />
                <p class="mb-0">Loading {{ currentLevelLabel.toLowerCase() }}...</p>
              </div>
              <div v-else-if="filteredGridItems.length === 0" class="grid-status empty-state">
                <feather-icon :icon="gridStatusIcon" size="48" class="text-muted mb-1" />
                <p class="mb-0">No {{ currentLevelLabel.toLowerCase() }} found</p>
                <small class="text-muted">Try a different selection or clear the search</small>
              </div>
              <div v-else class="items-grid">
                <div v-for="entry in filteredGridItems" :key="entry.id" class="item-card"
                  :class="{ 'category-card': !isItemsView }" @click="onGridEntryClick(entry)">
                  <template v-if="isItemsView">
                    <div class="item-image">
                      <feather-icon icon="PackageIcon" size="34" />
                    </div>
                    <div class="item-details">
                      <h5>{{ entry.name }}</h5>
                      <p class="item-code">{{ entry.itemCode }}</p>
                      <p class="item-price">{{ formatTunCurrency(getUnitPriceWithVat(entry)) }} TTC</p>
                      <p v-if="entry.stockQuantity !== null" class="item-stock">
                        Stock: {{ entry.stockQuantity }}
                      </p>
                    </div>
                  </template>
                  <template v-else>
                    <div class="category-card-content">
                      <div class="category-icon">
                        <feather-icon :icon="isFamiliesView ? 'LayersIcon' : 'GridIcon'" size="26" />
                      </div>
                      <div class="category-title clamp-2">{{ entry.name }}</div>
                    </div>
                  </template>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="actions-panel inline-panel">
          <div class="actions-grid">
            <b-button variant="primary" block class="action-btn" @click="proceedToPayment"
              :disabled="cart.length === 0">
              <feather-icon icon="CreditCardIcon" size="16" class="mr-50" />
              Payment
            </b-button>
            <b-button variant="outline-primary" block class="action-btn" @click="goToCustomerManagement">
              <feather-icon icon="UsersIcon" size="16" class="mr-50" />
              Customers
            </b-button>
            <b-button variant="outline-success" block class="action-btn" @click="goToReturn">
              <feather-icon icon="RotateCcwIcon" size="16" class="mr-50" />
              Return Products
            </b-button>
            <b-button variant="outline-warning" block class="action-btn" @click="openPendingTicketsModal">
              <feather-icon icon="ClockIcon" size="16" class="mr-50" />
              Pending Tickets
              <b-badge v-if="pendingTicketsCount > 0" variant="warning" class="ml-50">
                {{ pendingTicketsCount }}
              </b-badge>
            </b-button>
            <b-button variant="outline-secondary" block class="action-btn" disabled>
              <feather-icon icon="ListIcon" size="16" class="mr-50" />
              Tickets List (soon)
            </b-button>
            <b-button variant="outline-danger" block class="action-btn" @click="showCloseSessionModal = true">
              <feather-icon icon="PowerIcon" size="16" class="mr-50" />
              Close Session
            </b-button>
          </div>
        </div>
      </b-col>

      <!-- Cart Section -->
      <b-col cols="12" md="4" lg="3" class="cart-section">
        <div class="cart-header">
          <div class="cart-title-wrap">
            <h4 class="cart-title mb-0">Cart</h4>
            <b-badge v-if="cartCount > 0" variant="light" class="cart-count-badge">{{ cartCount }}</b-badge>
          </div>
          <b-button v-if="cart.length > 0" variant="outline-secondary" size="sm" @click="clearCart">
            Clear
          </b-button>
        </div>

        <div class="cart-items" ref="cartList" :class="{ 'cart-items--scrolled': cartScrollShadow }">
          <div v-if="cart.length === 0" class="empty-cart">
            <feather-icon icon="ShoppingBagIcon" size="36" class="mb-1 text-muted" />
            <p class="mb-25">Cart is empty</p>
            <small class="text-muted d-block mb-1">Scan a barcode or tap a product to add it.</small>
            <b-button v-if="pendingTicketsCount > 0" size="sm" variant="outline-primary"
              @click="openPendingTicketsModal">
              View Pending Tickets ({{ pendingTicketsCount }})
            </b-button>
          </div>
          <div v-for="(cartItem, index) in cart" :key="index" class="cart-item"
            :class="{ highlighted: highlightedItemId === cartItem.id }">
            <div class="cart-item-header">
              <div class="cart-item-title">
                <h6>{{ cartItem.name }}</h6>
              </div>
              <div class="cart-item-total">
                <div v-if="cartItem.discountPercentage || cartItem.discountAmount" class="discounted-total">
                  <span class="original-amount">{{ formatTunCurrency(getLineTotalWithVat(cartItem, false)) }}</span>
                  <span class="total-amount">{{ formatTunCurrency(getLineTotalWithVat(cartItem, true)) }}</span>
                </div>
                <span v-else class="total-amount">{{ formatTunCurrency(getLineTotalWithVat(cartItem, true)) }}</span>
              </div>
            </div>
            <div class="cart-item-breakdown">
              <span class="chip chip--ht">{{ formatShortTun(cartItem.unitPrice) }} HT</span>
              <span class="chip chip--vat">{{ formatVatPercentage(cartItem) }}% VAT</span>
              <span class="chip chip--ttc">{{ formatShortTun(getUnitPriceWithVat(cartItem)) }} TTC/unit</span>
              <span v-if="cartItem.discountPercentage || cartItem.discountAmount" class="chip chip--discount">
                <feather-icon icon="PercentIcon" size="12" class="mr-25" />
                {{ cartItem.discountPercentage ? formatDiscountPercentage(cartItem.discountPercentage) + '%' : formatShortTun(cartItem.discountAmount) }}
              </span>
            </div>
            <div class="cart-item-controls">
              <div class="quantity-controls">
                <b-button variant="outline-primary" size="sm" class="qty-btn" @click="decreaseQuantity(index)">
                  -
                </b-button>
                <span class="quantity">{{ cartItem.quantity }}</span>
                <b-button variant="outline-primary" size="sm" class="qty-btn" @click="increaseQuantity(index)">
                  +
                </b-button>
              </div>
              <div class="action-buttons">
                <b-button variant="outline-info" size="sm" class="discount-btn" @click="openLineDiscountModal(index)"
                  :title="cartItem.discountPercentage || cartItem.discountAmount ? 'Edit discount' : 'Add discount'">
                  <feather-icon icon="PercentIcon" size="14" />
                  <span v-if="cartItem.discountPercentage || cartItem.discountAmount" class="discount-badge">
                    {{ cartItem.discountPercentage ? formatDiscountPercentage(cartItem.discountPercentage) + '%' : formatShortTun(cartItem.discountAmount) }}
                  </span>
                </b-button>
                <b-button variant="outline-danger" size="sm" class="remove-btn" @click="removeFromCart(index)">
                  <feather-icon icon="Trash2Icon" size="14" />
                </b-button>
              </div>
            </div>
          </div>
        </div>

        <div class="cart-summary">
          <div class="summary-row total">
            <span>Total:</span>
            <span>{{ formatTunCurrency(totalAmount) }}</span>
          </div>
        </div>

        <div class="keyboard-toggle">
          <b-button :variant="showKeyboard ? 'outline-secondary' : 'primary'" block @click="toggleKeyboard">
            <feather-icon :icon="showKeyboard ? 'ChevronDownIcon' : 'KeyboardIcon'" class="mr-50" size="16" />
            {{ showKeyboard ? 'Hide Keyboard' : 'Show Keyboard' }}
          </b-button>
        </div>

        <transition name="keyboard-fade">
          <div class="virtual-keyboard" v-if="showKeyboard">
            <div class="d-flex justify-content-between align-items-center mb-2">
              <strong>Touch Keyboard</strong>
              <b-button size="sm" variant="outline-secondary" @click="toggleKeyboard">
                <feather-icon icon="XIcon" size="14" />
              </b-button>
            </div>
            <div v-for="(row, index) in keyboardLayout" :key="`keyboard-row-${index}`" class="keyboard-row">
              <b-button v-for="key in row" :key="key" variant="light" class="keyboard-key"
                @click="handleKeyboardPress(key)">
                <template v-if="key === 'BACK'">
                  <feather-icon icon="DeleteIcon" size="16" />
                </template>
                <template v-else-if="key === 'SPACE'">
                  Space
                </template>
                <template v-else-if="key === 'CLEAR'">
                  Clear
                </template>
                <template v-else-if="key === 'ENTER'">
                  Enter
                </template>
                <template v-else>
                  {{ key }}
                </template>
              </b-button>
            </div>
          </div>
        </transition>
      </b-col>
    </b-row>

    <!-- Pending Tickets Modal -->
    <b-modal id="pending-tickets-modal" v-model="showPendingTicketsModal" title="Pending Tickets" size="xl"
      @show="loadPendingTickets" @hide="resetPendingTickets">
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
        <b-card v-for="ticket in pendingTickets" :key="ticket.id" class="mb-3 ticket-card">
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
            <b-button variant="primary" size="sm" class="flex-grow-1" @click="retrievePendingTicket(ticket)">
              <feather-icon icon="ArrowRightIcon" size="14" class="mr-1" />
              Continue
            </b-button>
            <b-button variant="danger" size="sm" @click="confirmDeletePendingTicket(ticket)">
              <feather-icon icon="TrashIcon" size="14" />
            </b-button>
          </div>
        </b-card>
      </div>
    </b-modal>

    <!-- Close Session Modal -->
    <b-modal id="close-session-modal" v-model="showCloseSessionModal" title="Close Cashier Session" size="xl"
      @ok="closeSession" @cancel="resetCloseSessionForm" @hide="resetCloseSessionForm" :ok-disabled="!canCloseSession">
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
          <b-table v-if="closeSessionData.cashCountLines.length > 0" :items="closeSessionData.cashCountLines"
            :fields="cashCountFields" striped bordered small responsive>
            <template #cell(denominationValue)="row">
              <b-input-group prepend="$" size="sm">
                <b-form-input v-model.number="row.item.denominationValue" type="number" step="0.01" min="0"
                  @input="updateCashCountTotals" size="sm" />
              </b-input-group>
            </template>
            <template #cell(quantity)="row">
              <b-form-input v-model.number="row.item.quantity" type="number" min="1" @input="updateCashCountTotals"
                size="sm" />
            </template>
            <template #cell(paymentMethod)="row">
              <b-form-select v-model="row.item.paymentMethodId" :options="paymentMethodOptions" value-field="id"
                text-field="name" size="sm">
                <template #first>
                  <b-form-select-option :value="null">Cash</b-form-select-option>
                </template>
              </b-form-select>
            </template>
            <template #cell(referenceNumber)="row">
              <b-form-input v-model="row.item.referenceNumber" placeholder="Check #, Card last 4..." size="sm" />
            </template>
            <template #cell(lineTotal)="row">
              <strong>${{ formatPrice(row.item.denominationValue * row.item.quantity) }}</strong>
            </template>
            <template #cell(actions)="row">
              <b-button variant="link" size="sm" @click="removeCashCountLine(row.index)" class="text-danger p-0">
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
            <b-form-input id="actual-cash" v-model.number="closeSessionData.actualCash" type="number" step="0.01"
              min="0" placeholder="Leave empty to use calculated total" />
          </b-input-group>
          <small class="form-text text-muted">
            If provided, this value will override the calculated total from cash count lines
          </small>
        </b-form-group>

        <b-form-group label="Notes (optional)" label-for="close-notes" class="mt-3">
          <b-form-textarea id="close-notes" v-model="closeSessionData.notes"
            placeholder="Enter any notes about the cash count..." rows="3" />
        </b-form-group>
      </div>
      <template #modal-ok>
        Close Session
      </template>
    </b-modal>

    <!-- Discount Modal -->
    <b-modal id="discount-modal" v-model="showDiscountModal" title="Apply Discount" size="md"
      @ok="applyLineDiscount" @hide="resetDiscountForm" :ok-disabled="!canApplyDiscount">
      <div v-if="discountModalItemIndex !== null">
        <div class="mb-3" v-if="getDiscountModalItem()">
          <strong>{{ getDiscountModalItem().name }}</strong>
          <div class="text-muted small">Original Line Total: {{ formatTunCurrency(getOriginalLineTotal()) }}</div>
        </div>

        <!-- Discount Type Toggle -->
        <b-form-group label="Discount Type">
          <b-form-radio-group v-model="discountType" :options="[
            { text: 'Percentage (%)', value: 'percentage' },
            { text: 'Amount (TND)', value: 'amount' }
          ]" />
        </b-form-group>

        <!-- Discount Input -->
        <b-form-group :label="discountType === 'percentage' ? 'Discount Percentage' : 'Discount Amount'">
          <b-input-group>
            <b-form-input v-model.number="discountValue" type="number" step="0.01" :min="0"
              :max="discountType === 'percentage' ? 100 : getOriginalLineTotal()"
              :placeholder="discountType === 'percentage' ? '0.00' : '0.00'" />
            <b-input-group-append>
              <span class="input-group-text">{{ discountType === 'percentage' ? '%' : 'TND' }}</span>
            </b-input-group-append>
          </b-input-group>
        </b-form-group>

        <!-- Preview -->
        <b-alert variant="info" show class="mt-3">
          <div class="d-flex justify-content-between mb-1">
            <span>Original Total:</span>
            <strong>{{ formatTunCurrency(getOriginalLineTotal()) }}</strong>
          </div>
          <div class="d-flex justify-content-between mb-1">
            <span>Discount:</span>
            <strong class="text-danger">-{{ formatTunCurrency(getCalculatedDiscount()) }}</strong>
          </div>
          <hr class="my-2" />
          <div class="d-flex justify-content-between">
            <span><strong>New Line Total:</strong></span>
            <strong class="text-success">{{ formatTunCurrency(getNewLineTotal()) }}</strong>
          </div>
        </b-alert>
      </div>
      <template #modal-ok>
        Apply Discount
      </template>
      <template #modal-cancel>
        Cancel
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
      families: [],
      subFamilies: [],
      items: [],
      searchQuery: '',
      barcodeInput: '',
      barcodeScanning: false,
      itemsWithBarcodes: [], // Cache of items with their barcodes
      currentView: 'families',
      selectedFamily: null,
      selectedSubFamily: null,
      gridLoading: false,
      subFamilyCache: {},
      itemCache: {},
      showCloseSessionModal: false,
      showPendingTicketsModal: false,
      showDiscountModal: false,
      discountModalItemIndex: null,
      discountType: 'percentage', // 'percentage' or 'amount'
      discountValue: null,
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
      keyboardLayout: [
        ['7', '8', '9'],
        ['4', '5', '6'],
        ['1', '2', '3'],
        ['0', '00', '.'],
        ['CLEAR', 'BACK', 'ENTER'],
      ],
      activeInput: 'barcode',
      showKeyboard: false,
      loadingSession: false,
      highlightedItemId: null,
      highlightTimer: null,
      cartScrollShadow: false,
      compactMode: false,
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
    isFamiliesView() {
      return this.currentView === 'families'
    },
    isSubFamiliesView() {
      return this.currentView === 'subFamilies'
    },
    isItemsView() {
      return this.currentView === 'items'
    },
    canNavigateBack() {
      return !this.isFamiliesView
    },
    currentGridItems() {
      if (this.isItemsView) {
        return this.items
      }
      if (this.isSubFamiliesView) {
        return this.subFamilies
      }
      return this.families
    },
    filteredGridItems() {
      const collection = this.currentGridItems || []
      if (!this.searchQuery) {
        return collection
      }
      const query = this.searchQuery.toLowerCase()
      if (this.isItemsView) {
        return collection.filter(item => {
          const matchesItem = (item.name && item.name.toLowerCase().includes(query)) ||
            (item.itemCode && item.itemCode.toLowerCase().includes(query)) ||
            (item.barcode && item.barcode.toLowerCase().includes(query))

          const itemWithBarcodes = this.itemsWithBarcodes.find(iwb => iwb.item.id === item.id)
          if (itemWithBarcodes && itemWithBarcodes.barcodes) {
            const matchesBarcode = itemWithBarcodes.barcodes.some(barcode =>
              barcode.barcode && barcode.barcode.toLowerCase().includes(query)
            )
            return matchesItem || matchesBarcode
          }
          return matchesItem
        })
      }
      return collection.filter(entry => {
        return (entry.name && entry.name.toLowerCase().includes(query)) ||
          (entry.code && entry.code.toLowerCase().includes(query)) ||
          (entry.description && entry.description.toLowerCase().includes(query))
      })
    },
    currentLevelLabel() {
      if (this.isItemsView) {
        return 'Products'
      }
      if (this.isSubFamiliesView) {
        return 'Sub families'
      }
      return 'Families'
    },
    searchPlaceholder() {
      if (this.isItemsView) {
        return 'Search products by name or code...'
      }
      if (this.isSubFamiliesView) {
        return 'Search sub families...'
      }
      return 'Search families...'
    },
    gridStatusIcon() {
      if (this.isItemsView) {
        return 'PackageIcon'
      }
      if (this.isSubFamiliesView) {
        return 'GridIcon'
      }
      return 'LayersIcon'
    },
    cart() {
      // Always use store as source of truth
      return this.$store.state.pos.cart || []
    },
    cartCount() {
      return this.cart.reduce((sum, item) => sum + (item.quantity || 0), 0)
    },
    subtotal() {
      // Subtotal is the sum of all line totals excluding VAT, after discount
      return this.cart.reduce((sum, item) => {
        const lineTotal = item.unitPrice * item.quantity
        // If discount is a percentage, calculate discount amount from line total excluding VAT
        let discount = 0
        if (item.discountPercentage) {
          discount = lineTotal * (item.discountPercentage / 100)
        } else if (item.discountAmount) {
          // If discount is an amount, need to calculate what portion applies to excluding VAT
          // The discountAmount stored is for the total including VAT, so we need to convert it
          const vat = this.getVatPercent(item)
          // Calculate the excluding VAT portion of the discount
          discount = item.discountAmount / (1 + (vat / 100))
        }
        return sum + (lineTotal - discount)
      }, 0)
    },
    taxAmount() {
      // Tax is calculated on the discounted amount excluding VAT
      return this.cart.reduce((sum, item) => {
        const lineTotal = item.unitPrice * item.quantity
        let discount = 0
        if (item.discountPercentage) {
          discount = lineTotal * (item.discountPercentage / 100)
        } else if (item.discountAmount) {
          const vat = this.getVatPercent(item)
          discount = item.discountAmount / (1 + (vat / 100))
        }
        const discountedTotal = lineTotal - discount
        const vat = this.getVatPercent(item)
        return sum + (discountedTotal * (vat / 100))
      }, 0)
    },
    totalAmount() {
      // Total amount should be sum of all line totals including VAT, with discounts applied
      return this.cart.reduce((sum, item) => {
        return sum + this.getLineTotalWithVat(item, true)
      }, 0)
    },
    canApplyDiscount() {
      if (this.discountModalItemIndex === null || this.discountValue === null || this.discountValue <= 0) {
        return false
      }
      if (this.discountType === 'percentage' && this.discountValue > 100) {
        return false
      }
      if (this.discountType === 'amount') {
        const originalTotal = this.getOriginalLineTotal()
        return this.discountValue <= originalTotal
      }
      return true
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
    document.body.classList.add('pos-no-scroll')
    this.loadCurrentSession()
    this.loadFamilies()
    // this.loadItemsWithBarcodes()
    // this.loadPaymentMethods()
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

    if (this.$refs.cartList) {
      this.$refs.cartList.addEventListener('scroll', this.handleCartScroll, { passive: true })
      this.$nextTick(() => {
        this.handleCartScroll()
      })
    }
  },
  beforeDestroy() {
    document.body.classList.remove('pos-no-scroll')
    if (this.pendingTicketsInterval) {
      clearInterval(this.pendingTicketsInterval)
    }
    this.$root.$off('open-close-session-modal')
    if (this.$refs.cartList) {
      this.$refs.cartList.removeEventListener('scroll', this.handleCartScroll)
    }
    if (this.highlightTimer) {
      clearTimeout(this.highlightTimer)
    }
  },
  methods: {
    toggleCompactMode() {
      this.compactMode = !this.compactMode
    },
    getVatPercent(item) {
      if (!item) return 0
      const vat = item.defaultVAT
      return parseFloat(vat) || 0
    },
    getUnitVatAmount(item) {
      const price = parseFloat(item.unitPrice) || 0
      const vat = this.getVatPercent(item)
      return price * (vat / 100)
    },
    formatShortTun(value) {
      const amount = parseFloat(value) || 0
      return amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    },
    formatVatPercentage(item) {
      const vat = this.getVatPercent(item)
      if (!vat) return 0
      return Number.isInteger(vat) ? vat : vat.toFixed(2)
    },
    formatDiscountPercentage(value) {
      if (!value && value !== 0) return '0'
      const num = parseFloat(value) || 0
      return num.toFixed(3)
    },
    getUnitPriceWithVat(item) {
      const price = parseFloat(item.unitPrice) || 0
      const vat = this.getVatPercent(item)
      return price * (1 + (vat / 100))
    },
    getLineVatAmount(item) {
      const price = parseFloat(item.unitPrice) || 0
      const vat = this.getVatPercent(item)
      const quantity = item.quantity || 0
      return price * (vat / 100) * quantity
    },
    getLineTotalWithVat(item, applyDiscount = true) {
      const quantity = item.quantity || 0
      const lineTotalWithVat = this.getUnitPriceWithVat(item) * quantity
      
      if (applyDiscount && (item.discountPercentage || item.discountAmount)) {
        let discountAmount = 0
        if (item.discountAmount) {
          discountAmount = item.discountAmount
        } else if (item.discountPercentage) {
          discountAmount = lineTotalWithVat * (item.discountPercentage / 100)
        }
        return Math.max(0, lineTotalWithVat - discountAmount)
      }
      
      return lineTotalWithVat
    },
    async loadFamilies() {
      this.gridLoading = true
      try {
        const response = await this.$http.get('/item-family')
        const payload = Array.isArray(response.data) ? response.data : []
        this.families = payload
          .filter(family => family.active !== false)
          .sort((a, b) => (a.name || '').localeCompare(b.name || '', undefined, { sensitivity: 'base' }))
          .sort((a, b) => {
            const orderA = typeof a.displayOrder === 'number' ? a.displayOrder : Number.MAX_SAFE_INTEGER
            const orderB = typeof b.displayOrder === 'number' ? b.displayOrder : Number.MAX_SAFE_INTEGER
            return orderA - orderB
          })
      } catch (error) {
        console.error('Error loading item families:', error)
        this.$toast({
          title: 'Error',
          text: 'Failed to load item families',
          variant: 'danger'
        })
      } finally {
        this.gridLoading = false
      }
    },
    async loadSubFamilies(family) {
      if (!family) return
      if (this.subFamilyCache[family.id]) {
        this.subFamilies = this.subFamilyCache[family.id]
        return
      }
      this.gridLoading = true
      try {
        const response = await this.$http.get(`/item-sub-family/by-family/${family.id}`)
        const payload = Array.isArray(response.data) ? response.data : []
        const list = payload
          .filter(subFamily => subFamily.active !== false)
          .sort((a, b) => (a.name || '').localeCompare(b.name || '', undefined, { sensitivity: 'base' }))
        this.subFamilyCache[family.id] = list
        this.subFamilies = list
      } catch (error) {
        console.error('Error loading sub families:', error)
        this.$toast({
          title: 'Error',
          text: 'Failed to load sub families',
          variant: 'danger'
        })
      } finally {
        this.gridLoading = false
      }
    },
    async loadItemsBySubFamily(subFamily) {
      if (!subFamily) return
      if (this.itemCache[subFamily.id]) {
        this.items = this.itemCache[subFamily.id]
        return
      }
      this.gridLoading = true
      try {
        const response = await this.$http.get(`/item/by-sub-family/${subFamily.id}`);
        const payload = Array.isArray(response.data) ? response.data : []
        const list = payload.filter(item => item.active !== false)
        this.itemCache[subFamily.id] = list
        this.items = list
      } catch (error) {
        console.error('Error loading items by sub family:', error)
        this.$toast({
          title: 'Error',
          text: 'Failed to load products for this sub family',
          variant: 'danger'
        })
      } finally {
        this.gridLoading = false
      }
    },
    async selectFamily(family) {
      if (!family) return
      this.selectedFamily = family
      this.selectedSubFamily = null
      this.currentView = 'subFamilies'
      this.searchQuery = ''
      await this.loadSubFamilies(family)
    },
    async selectSubFamily(subFamily) {
      if (!subFamily) return
      this.selectedSubFamily = subFamily
      this.currentView = 'items'
      this.searchQuery = ''
      await this.loadItemsBySubFamily(subFamily)
    },
    resetToFamilies() {
      this.currentView = 'families'
      this.selectedFamily = null
      this.selectedSubFamily = null
      this.subFamilies = []
      this.items = []
      this.searchQuery = ''
    },
    async returnToSelectedFamily() {
      if (!this.selectedFamily) return
      this.currentView = 'subFamilies'
      this.selectedSubFamily = null
      this.items = []
      this.searchQuery = ''
      if (this.subFamilyCache[this.selectedFamily.id]) {
        this.subFamilies = this.subFamilyCache[this.selectedFamily.id]
      } else {
        await this.loadSubFamilies(this.selectedFamily)
      }
    },
    async navigateBack() {
      if (this.isItemsView) {
        await this.returnToSelectedFamily()
      } else if (this.isSubFamiliesView) {
        this.resetToFamilies()
      }
    },
    onGridEntryClick(entry) {
      if (this.isItemsView) {
        this.addToCart(entry)
      } else if (this.isSubFamiliesView) {
        this.selectSubFamily(entry)
      } else {
        this.selectFamily(entry)
      }
    },
    handleSearchInput() {
      // Filtering handled reactively via computed property
    },
    async loadItemsWithBarcodes() {
      try {
        // Load items with their barcodes for faster lookup
        const response = await this.$http.get('/item-barcode/items-with-barcodes', {
          params: {
            page: 0,
            size: 5000,
            filterType: 'withBarcodes',
          },
        })
        const payload = response.data
        if (payload && Array.isArray(payload.content)) {
          this.itemsWithBarcodes = payload.content
        } else {
          this.itemsWithBarcodes = payload || []
        }
      } catch (error) {
        console.error('Error loading items with barcodes:', error)
        // Don't show error toast as this is optional optimization
      }
    },
    onBarcodeInput() {
      // Clear search query when barcode input changes to avoid conflicts
      if (this.barcodeInput) {
        this.searchQuery = ''
      }
    },
    setActiveInput(field) {
      this.activeInput = field
    },
    handleKeyboardPress(key) {
      if (!this.activeInput) {
        return
      }
      const targetField = this.activeInput === 'barcode' ? 'barcodeInput' : 'searchQuery'
      const currentValue = this[targetField] || ''

      if (key === 'BACK') {
        this[targetField] = currentValue.slice(0, -1)
      } else if (key === 'CLEAR') {
        this[targetField] = ''
      } else if (key === 'SPACE') {
        this[targetField] = `${currentValue} `
      } else if (key === 'ENTER') {
        if (targetField === 'barcodeInput') {
          this.handleBarcodeScan()
        } else {
          this.handleSearchInput()
        }
        return
      } else {
        this[targetField] = currentValue + key
      }

      if (targetField === 'searchQuery') {
        this.handleSearchInput()
      }
    },
    toggleKeyboard() {
      this.showKeyboard = !this.showKeyboard
    },
    openPendingTicketsModal() {
      this.showPendingTicketsModal = true
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
      this.handleSearchInput()
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
        quantity: line.quantity,
        defaultVAT: line.item.defaultVAT || 0,
        discountPercentage: line.discountPercentage || null,
        discountAmount: line.discountAmount || null
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
      const currentCart = [...this.cart]
      const existingIndex = currentCart.findIndex(cartItem => cartItem.id === item.id)
      if (existingIndex !== -1) {
        const existingItem = currentCart[existingIndex]
        existingItem.quantity += 1
        currentCart.splice(existingIndex, 1)
        currentCart.unshift(existingItem)
      } else {
        currentCart.unshift({
          id: item.id,
          itemCode: item.itemCode,
          name: item.name,
          unitPrice: item.unitPrice || 0,
          defaultVAT: item.defaultVAT || 0,
          quantity: 1,
          discountPercentage: null,
          discountAmount: null,
        })
      }
      this.$store.dispatch('pos/setCart', currentCart)
      this.highlightCartItem(item.id)
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
      const value = parseFloat(price) || 0
      return value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    },
    formatTunCurrency(value) {
      const amount = parseFloat(value) || 0
      const formatted = amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
      return `${formatted} TND`
    },
    highlightCartItem(itemId) {
      this.highlightedItemId = itemId
      if (this.highlightTimer) {
        clearTimeout(this.highlightTimer)
      }
      this.highlightTimer = setTimeout(() => {
        this.highlightedItemId = null
        this.highlightTimer = null
      }, 800)
    },
    handleCartScroll() {
      if (!this.$refs.cartList) return
      this.cartScrollShadow = this.$refs.cartList.scrollTop > 0
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
    openLineDiscountModal(index) {
      if (index < 0 || index >= this.cart.length) return
      
      this.discountModalItemIndex = index
      const item = this.cart[index]
      
      // Initialize with existing discount if any
      if (item.discountPercentage) {
        this.discountType = 'percentage'
        this.discountValue = item.discountPercentage
      } else if (item.discountAmount) {
        this.discountType = 'amount'
        this.discountValue = item.discountAmount
      } else {
        this.discountType = 'percentage'
        this.discountValue = null
      }
      
      this.showDiscountModal = true
    },
    getDiscountModalItem() {
      if (this.discountModalItemIndex === null || this.discountModalItemIndex >= this.cart.length) {
        return null
      }
      return this.cart[this.discountModalItemIndex]
    },
    getOriginalLineTotal() {
      const item = this.getDiscountModalItem()
      if (!item) return 0
      return this.getLineTotalWithVat(item, false)
    },
    getCalculatedDiscount() {
      if (!this.discountValue || this.discountValue <= 0) return 0
      
      const originalTotal = this.getOriginalLineTotal()
      
      if (this.discountType === 'percentage') {
        return originalTotal * (this.discountValue / 100)
      } else {
        return Math.min(this.discountValue, originalTotal)
      }
    },
    getNewLineTotal() {
      const originalTotal = this.getOriginalLineTotal()
      const discount = this.getCalculatedDiscount()
      return Math.max(0, originalTotal - discount)
    },
    applyLineDiscount() {
      if (!this.canApplyDiscount || this.discountModalItemIndex === null) return
      
      const cart = [...this.cart]
      const item = cart[this.discountModalItemIndex]
      const originalTotal = this.getLineTotalWithVat(item, false)
      
      let discountPercentage = null
      let discountAmount = null
      
      if (this.discountType === 'percentage') {
        discountPercentage = this.discountValue
        discountAmount = originalTotal * (this.discountValue / 100)
      } else {
        discountAmount = Math.min(this.discountValue, originalTotal)
        discountPercentage = originalTotal > 0 ? (discountAmount / originalTotal) * 100 : 0
      }
      
      item.discountPercentage = discountPercentage
      item.discountAmount = discountAmount
      
      this.$store.dispatch('pos/setCart', cart)
      this.resetDiscountForm()
    },
    resetDiscountForm() {
      this.showDiscountModal = false
      this.discountModalItemIndex = null
      this.discountType = 'percentage'
      this.discountValue = null
    },
  }
}
</script>

<style scoped>
.pos-container {
  margin: 0;
  padding: 0;
  height: 100vh;
  width: 100%;
  max-width: 100%;
  overflow: hidden;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: #f5f5f5;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
}

.pos-content {
  flex: 1;
  overflow: hidden;
  padding: 0 0 0 10px;
  display: flex;
  gap: 0;
  min-width: 0;
  box-sizing: border-box;
}

.pos-content>[class*='col'] {
  padding: 0;
}

@media (max-width: 767.98px) {
  .pos-content {
    flex-direction: column;
    padding: 0 0 0 10px;
    gap: 0;
  }
}

.items-column {
  display: flex;
  flex-direction: column;
  gap: 0;
  height: 100%;
  min-width: 0;
  box-sizing: border-box;
}

.items-section {
  background: #fff;
  border: none;
  border-radius: 0;
  padding: 10px;
  height: 100%;
  display: flex;
  flex-direction: column;
  min-height: 0;
  box-shadow: none;
  box-sizing: border-box;
  border-right: 2px solid #e0e0e0;
}

.items-section.compact-mode {
  padding: 8px;
}

@media (max-width: 767.98px) {
  .items-section {
    border-radius: 0;
    border-right: none;
    border-bottom: 2px solid #e0e0e0;
    padding: 10px;
    margin-bottom: 0;
  }
}

.items-header {
  margin-bottom: 15px;
  flex-shrink: 0;
}

.input-row {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
}

.input-col {
  flex: 1;
  min-width: 220px;
}

.barcode-col {
  flex: 3;
}

.search-col {
  flex: 2;
}

.hierarchy-controls {
  margin-top: 15px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
}

.hierarchy-group {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.compact-toggle {
  white-space: nowrap;
}

.breadcrumb-trail {
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 500;
  flex-wrap: wrap;
}

.breadcrumb-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 3px 8px;
  border-radius: 12px;
  background: #f4f5f7;
  color: #5e5873;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.82rem;
}

.breadcrumb-chip:hover {
  background: #e7e9fc;
  color: #7367f0;
}

.breadcrumb-chip.active {
  background: #7367f0;
  color: #fff;
  cursor: default;
}

.breadcrumb-separator {
  color: #c0c5d2;
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

  .barcode-col,
  .search-col {
    flex: 1 1 100%;
  }

  .input-row {
    flex-direction: column;
  }
}

.items-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.items-grid-wrapper {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  min-width: 0;
  box-sizing: border-box;
  /* Hide scrollbar but keep touch scrolling */
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE and Edge */
}

.items-grid-wrapper::-webkit-scrollbar {
  display: none; /* Chrome, Safari, Opera */
}

.items-grid {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  padding-bottom: 0;
}

.items-grid-wrapper {
  flex: 1;
  overflow-y: auto;
  padding-right: 6px;
}

.items-section.compact-mode .items-grid {
  gap: 6px;
}

.actions-panel {
  margin-top: 0;
  padding: 12px 15px;
  border: none;
  border-top: 2px solid #e0e0e0;
  border-right: 2px solid #e0e0e0;
  background: #fff;
  border-radius: 0;
  box-shadow: 0 -2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 0;
  flex-shrink: 0;
}

.actions-grid {
  display: flex;
  flex-direction: row;
  gap: 8px;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
}

@media (max-width: 1500px) {
  .actions-grid {
    gap: 8px;
  }
}

@media (max-width: 1150px) {
  .actions-grid {
    gap: 8px;
  }
}

.action-btn {
  flex: 1;
  min-width: 150px;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 45px;
  padding: 8px 15px;
  font-weight: 600;
  font-size: 0.95rem;
  border-width: 2px;
  gap: 6px;
  margin: 0 !important;
  touch-action: manipulation;
}

.action-btn.btn-primary {
  border-color: transparent;
}

.grid-status {
  border: 2px dashed #e0e0e0;
  border-radius: 12px;
  padding: 40px 20px;
  text-align: center;
  color: #6c757d;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.grid-status.empty-state {
  color: #868e96;
}

.items-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 10px;
}

.items-section.compact-mode .items-grid {
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 6px;
}

@media (max-width: 1200px) {
  .items-grid {
    grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
    gap: 8px;
  }
}

.items-grid::-webkit-scrollbar {
  display: none;
}

.items-grid {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

@media (max-width: 991.98px) {
  .items-grid {
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: 8px;
  }
}

@media (max-width: 575.98px) {
  .items-grid {
    grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
    gap: 8px;
  }
}

.item-card {
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  padding: 12px;
  cursor: pointer;
  transition: all 0.25s ease;
  background: #fff;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.02);
}

@media (max-width: 575.98px) {
  .item-card {
    padding: 10px;
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
  box-shadow: 0 10px 24px rgba(40, 167, 69, 0.15);
  transform: translateY(-3px);
}

.category-card {
  padding: 5px;
  justify-content: center;
}

.category-card-content {
  width: 100%;
  min-height: 50px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  text-align: center;
}

.category-icon {
  color: #6c63ff;
}

.category-title {
  width: 95%;
  font-size: clamp(0.64rem, 0.85vw, 0.74rem);
  font-weight: 500;
  text-transform: uppercase;
  line-height: 1.2;
}

.clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-align: center;
  width: 100%;
}

.item-image {
  text-align: center;
  margin-bottom: 8px;
  color: #007bff;
}

.item-details {
  width: 100%;
  margin-top: 5px;
}

.item-details h5 {
  /* margin: 0 0 8px 0; */
  font-size: 0.85rem;
  font-weight: 500;
  color: #2c3e50;
  line-height: 1.1;
  min-height: 2.6em;
  display: -webkit-box;
  -webkit-line-clamp: 4;
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
  font-size: 1rem;
  font-weight: bold;
  color: #28a745;
  margin: 0px;
}

.items-section.compact-mode .item-card {
  padding: 8px;
  border-radius: 10px;
}

.items-section.compact-mode .item-image {
  margin-bottom: 4px;
}

.items-section.compact-mode .item-details h5 {
  font-size: 0.78rem;
  -webkit-line-clamp: 3;
}

.items-section.compact-mode .item-code {
  font-size: 0.72rem;
  margin-bottom: 6px;
}

.items-section.compact-mode .item-price {
  font-size: 0.9rem;
}

.item-vat {
  font-size: 0.78rem;
  color: #6c757d;
  margin-bottom: 4px;
}

.item-stock {
  font-size: 0.85rem;
  color: #666;
  margin: 5px 0 0 0;
}

.cart-section {
  height: 100%;
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
  background: #fff;
  border: none;
  border-radius: 0;
  box-shadow: none;
  padding: 10px;
  min-width: 0;
  box-sizing: border-box;
}

@media (max-width: 767.98px) {
  .cart-section {
    height: auto;
    max-height: none;
    max-width: none;
    border-radius: 0;
    border-top: 2px solid #e0e0e0;
    padding: 10px;
  }
}

.cart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  padding-bottom: 15px;
  border-bottom: 2px solid #e0e0e0;
  flex-shrink: 0;
}

.cart-title-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
}

.cart-count-badge {
  font-weight: 600;
  background: #f4f4ff;
  color: #7367f0;
  border-radius: 999px;
  padding: 3px 10px;
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
  overflow-x: hidden;
  margin-bottom: 15px;
  position: relative;
  padding-bottom: 15px;
  min-width: 0;
  box-sizing: border-box;
  /* Hide scrollbar but keep touch scrolling */
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE and Edge */
}

.cart-items::-webkit-scrollbar {
  display: none; /* Chrome, Safari, Opera */
}

.cart-items::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 14px;
  display: block;
  background: linear-gradient(180deg, rgba(115, 103, 240, 0.18), rgba(255, 255, 255, 0));
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.2s ease;
}

.cart-items--scrolled::before {
  opacity: 1;
}

.empty-cart {
  text-align: center;
  padding: 40px 20px;
  color: #999;
  border: 2px dashed #e6e9ef;
  border-radius: 12px;
  background: #f9fafc;
}

.cart-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px;
  margin-bottom: 10px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  transition: all 0.2s ease;
  background: #f8f9fa;
  box-sizing: border-box;
}

.cart-item.highlighted {
  background: #f0f4ff;
  border-color: #7367f0;
  border-width: 2px;
  box-shadow: 0 4px 12px rgba(115, 103, 240, 0.2);
}

.cart-item-header {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: flex-start;
}

.cart-item-title h6 {
  margin: 0;
  line-height: 1.2;
}

.cart-item-total {
  text-align: right;
  font-weight: bold;
  color: #28a745;
}

.cart-item-total .total-amount {
  font-size: 0.95rem;
  display: block;
}

.cart-item-breakdown {
  display: grid;
  grid-template-columns: 1fr 0.6fr 1fr;
  gap: 4px;
  font-size: 0.7rem;
  color: #6c757d;
}

.cart-item-breakdown .chip {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  border-radius: 999px;
  padding: 2px 6px;
  font-weight: 600;
  white-space: nowrap;
  line-height: 1.1;
}

.chip--ht {
  background: #f4f7ff;
  color: #5d60a6;
}

.chip--vat {
  background: #fff6e7;
  color: #a15c00;
}

.chip--ttc {
  background: #e9fbf2;
  color: #17804e;
}

.chip--discount {
  background: #fff3e0;
  color: #e65100;
}

.cart-item-controls {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  flex-wrap: nowrap;
}

.action-buttons {
  display: flex;
  align-items: center;
  gap: 6px;
}

.discount-btn {
  padding: 4px 8px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  position: relative;
}

.discount-badge {
  font-size: 0.75rem;
  font-weight: 600;
  margin-left: 2px;
}

.discounted-total {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 2px;
}

.original-amount {
  font-size: 0.85rem;
  color: #999;
  text-decoration: line-through;
}

.cart-item-controls .quantity-controls {
  display: flex;
  align-items: center;
  gap: 6px;
}

.qty-btn {
  min-width: 28px;
  padding: 2px 6px;
  line-height: 1;
}

.remove-btn {
  padding: 4px 8px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

@media (max-width: 575.98px) {
  .cart-item {
    padding: 8px 0;
  }

  .cart-item-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .cart-item-total {
    text-align: left;
  }

  .cart-item-controls {
    width: 100%;
    flex-wrap: wrap;
    gap: 6px;
  }

  .cart-item-breakdown {
    grid-template-columns: 1fr 0.65fr 1fr;
    font-size: 0.68rem;
  }
}

.quantity {
  min-width: 30px;
  text-align: center;
  font-weight: bold;
}

.cart-summary {
  border-top: 2px solid #e0e0e0;
  padding-top: 15px;
  margin-bottom: 15px;
  flex-shrink: 0;
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

.virtual-keyboard {
  background: #f3f5f7;
  border-radius: 12px;
  padding: 12px;
  margin-top: 12px;
  flex-shrink: 0;
  box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.05);
}

.keyboard-row {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-bottom: 8px;
  flex-wrap: wrap;
}

.keyboard-row:last-child {
  margin-bottom: 0;
}

.keyboard-key {
  min-width: 48px;
  font-weight: 600;
  border-radius: 6px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.08);
}

.keyboard-key:active {
  transform: translateY(1px);
}
</style>

<style>
body.pos-no-scroll {
  overflow: hidden;
}
</style>
