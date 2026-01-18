<template>
  <div class="pos-container">
    <b-row class="pos-content">
      <!-- Items Grid -->
      <b-col cols="12" md="8" lg="8" class="items-column">
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
                  <b-form-input v-model="barcodeInput" :placeholder="$t('pos.itemSelection.barcodePlaceholder')"
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
                  {{ $t('pos.itemSelection.back') }}
                </b-button>
                <div class="breadcrumb-trail">
                  <span class="breadcrumb-chip" :class="{ active: isFamiliesView }" @click="resetToFamilies">
                    <feather-icon icon="LayersIcon" size="14" class="mr-25" />
                    {{ $t('pos.itemSelection.families') }}
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
                {{ compactMode ? $t('pos.itemSelection.comfortView') : $t('pos.itemSelection.compactView') }}
              </b-button>
            </div>
          </div>

          <div class="items-body">
            <div class="items-grid-wrapper">
              <div v-if="gridLoading" class="grid-status">
                <b-spinner class="mb-1" />
                <p class="mb-0">{{ $t('pos.itemSelection.loading', { level: currentLevelLabel.toLowerCase() }) }}</p>
              </div>
              <div v-else-if="filteredGridItems.length === 0" class="grid-status empty-state">
                <feather-icon :icon="gridStatusIcon" size="48" class="text-muted mb-1" />
                <p class="mb-0">{{ $t('pos.itemSelection.noItemsFound', { level: currentLevelLabel.toLowerCase() }) }}
                </p>
                <small class="text-muted">{{ $t('pos.itemSelection.tryDifferentSelection') }}</small>
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
                      <p v-if="entry.stockQuantity !== null" class="item-stock"
                        :class="getStockClass(entry.stockQuantity)">
                        <feather-icon :icon="getStockIcon(entry.stockQuantity)" size="12" class="mr-25" />
                        {{ $t('pos.itemSelection.stock') }}: {{ entry.stockQuantity }}
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
              {{ $t('pos.itemSelection.payment') }}
            </b-button>
            <b-button variant="outline-primary" block class="action-btn" @click="goToCustomerManagement">
              <feather-icon icon="UsersIcon" size="16" class="mr-50" />
              {{ $t('pos.itemSelection.customers') }}
            </b-button>
            <b-button variant="outline-success" block class="action-btn" @click="goToReturn">
              <feather-icon icon="RotateCcwIcon" size="16" class="mr-50" />
              {{ $t('pos.itemSelection.returnProducts') }}
            </b-button>
            <b-button variant="outline-warning" block class="action-btn" @click="openPendingTicketsModal">
              <feather-icon icon="ClockIcon" size="16" class="mr-50" />
              {{ $t('pos.itemSelection.pendingTickets') }}
              <b-badge v-if="pendingTicketsCount > 0" variant="warning" class="ml-50">
                {{ pendingTicketsCount }}
              </b-badge>
            </b-button>
            <b-button variant="outline-secondary" block class="action-btn" disabled>
              <feather-icon icon="ListIcon" size="16" class="mr-50" />
              {{ $t('pos.itemSelection.ticketsList') }}
            </b-button>
            <b-button variant="outline-danger" block class="action-btn" @click="handleCloseSessionClick">
              <feather-icon icon="PowerIcon" size="16" class="mr-50" />
              {{ $t('pos.itemSelection.closeSession') }}
            </b-button>
          </div>
        </div>
      </b-col>

      <!-- Cart Section -->
      <b-col cols="12" md="4" lg="4" class="cart-section">
        <div class="cart-items" ref="cartList" :class="{ 'cart-items--scrolled': cartScrollShadow }">
          <div v-if="cart.length === 0" class="empty-cart">
            <feather-icon icon="ShoppingBagIcon" size="36" class="mb-1 text-muted" />
            <p class="mb-25">{{ $t('pos.itemSelection.cartEmpty') }}</p>
            <small class="text-muted d-block mb-1">{{ $t('pos.itemSelection.scanOrTap') }}</small>
            <b-button v-if="pendingTicketsCount > 0" size="sm" variant="outline-primary"
              @click="openPendingTicketsModal">
              {{ $t('pos.itemSelection.viewPendingTickets', { count: pendingTicketsCount }) }}
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
              <div class="breakdown-row">
                <span class="breakdown-label">{{ $t('pos.itemSelection.unitPrice') }}</span>
                <span class="breakdown-value">{{ formatShortTun(cartItem.unitPrice) }} {{ $t('pos.itemSelection.ht')
                }}</span>
                <span class="breakdown-value secondary">{{ formatVatPercentage(cartItem) }}% {{
                  $t('pos.itemSelection.vat')
                }}</span>
                <span class="breakdown-value primary">{{ formatShortTun(getUnitPriceWithVat(cartItem)) }} {{
                  $t('pos.itemSelection.ttc') }}</span>
              </div>
              <div v-if="cartItem.discountPercentage || cartItem.discountAmount" class="breakdown-row discount-row">
                <feather-icon icon="PercentIcon" size="14" class="breakdown-icon" />
                <span class="breakdown-label">{{ $t('pos.itemSelection.discount') }}:</span>
                <span class="breakdown-value discount">
                  {{ cartItem.discountPercentage ? formatDiscountPercentage(cartItem.discountPercentage) + '%' :
                    formatShortTun(cartItem.discountAmount) }}
                </span>
              </div>
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
                  :title="cartItem.discountPercentage || cartItem.discountAmount ? $t('pos.itemSelection.editDiscount') : $t('pos.itemSelection.addDiscount')">
                  <feather-icon icon="PercentIcon" size="14" />
                  <span v-if="cartItem.discountPercentage || cartItem.discountAmount" class="discount-badge">
                    {{ cartItem.discountPercentage ? formatDiscountPercentage(cartItem.discountPercentage) + '%' :
                      formatShortTun(cartItem.discountAmount) }}
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
          <div class="cart-summary-header">
            <span class="cart-summary-title">{{ $t('pos.itemSelection.cart.title') }} {{ cartCount > 0 ?
              `(${cartCount})` : ''
            }}</span>
            <b-button v-if="cart.length > 0" variant="outline-secondary" size="sm" @click="clearCart"
              class="cart-clear-btn">
              {{ $t('pos.itemSelection.cart.clear') }}
            </b-button>
          </div>
          <div class="summary-row">
            <span>{{ $t('pos.itemSelection.cart.items') }}</span>
            <span>{{ cart.length }} ({{ cartCount }} {{ $t('pos.itemSelection.cart.units') }})</span>
          </div>
          <div class="summary-row">
            <span>{{ $t('pos.itemSelection.cart.subtotal') }}</span>
            <span>{{ formatTunCurrency(subtotal) }}</span>
          </div>
          <div class="summary-row">
            <span>{{ $t('pos.itemSelection.cart.tax') }}</span>
            <span>{{ formatTunCurrency(taxAmount) }}</span>
          </div>
          <div v-if="headerDiscountAmount > 0" class="summary-row discount-row">
            <span>{{ $t('pos.itemSelection.cart.discount') }}</span>
            <span class="text-danger">-{{ formatTunCurrency(headerDiscountAmount) }}</span>
          </div>
          <div class="summary-row total">
            <span>{{ $t('pos.itemSelection.cart.total') }}</span>
            <span>{{ formatTunCurrency(totalAmount) }}</span>
          </div>
        </div>

        <div class="keyboard-toggle">
          <b-button variant="outline-secondary" block @click="toggleKeyboard" class="keyboard-toggle-btn"
            :class="{ 'keyboard-active': showKeyboard }">
            <feather-icon :icon="showKeyboard ? 'ChevronDownIcon' : 'ChevronUpIcon'" class="mr-50" size="16" />
            {{ showKeyboard ? $t('pos.itemSelection.keyboard.hide') : $t('pos.itemSelection.keyboard.show') }}
          </b-button>
        </div>

        <transition name="keyboard-fade">
          <div class="virtual-keyboard" v-if="showKeyboard">
            <div class="keyboard-header">
              <strong>{{ $t('pos.itemSelection.keyboard.title') }}</strong>
              <b-button size="sm" variant="outline-secondary" @click="toggleKeyboard" class="keyboard-close-btn">
                <feather-icon icon="XIcon" size="14" />
              </b-button>
            </div>
            <div class="keyboard-grid">
              <button v-for="num in [1, 2, 3, 4, 5, 6, 7, 8, 9, '.', 0, '⌫']" :key="num" class="keyboard-key"
                :class="{ 'key-decimal': num === '.', 'key-backspace': num === '⌫' }" @click="handleKeyboardPress(num)"
                type="button">
                {{ num }}
              </button>
            </div>
            <div class="keyboard-actions">
              <button class="keyboard-action-btn" @click="handleKeyboardPress('CLEAR')" type="button">
                {{ $t('pos.itemSelection.keyboard.clear') }}
              </button>
              <button class="keyboard-action-btn" @click="handleKeyboardPress('BACK')" type="button">
                <feather-icon icon="DeleteIcon" size="16" />
                {{ $t('pos.itemSelection.keyboard.back') }}
              </button>
              <button class="keyboard-action-btn keyboard-action-enter" @click="handleKeyboardPress('ENTER')"
                type="button">
                <feather-icon icon="CheckIcon" size="16" />
                {{ $t('pos.itemSelection.keyboard.enter') }}
              </button>
            </div>
          </div>
        </transition>
      </b-col>
    </b-row>

    <!-- Pending Tickets Modal -->
    <b-modal id="pending-tickets-modal" v-model="showPendingTicketsModal"
      :title="$t('pos.itemSelection.pendingTicketsModal.title')" size="xl" @show="loadPendingTickets"
      @hide="resetPendingTickets">
      <div v-if="loadingPendingTickets" class="text-center py-4">
        <b-spinner class="align-middle"></b-spinner>
        <p class="mt-2">{{ $t('pos.itemSelection.pendingTicketsModal.loading') }}</p>
      </div>

      <div v-else-if="pendingTickets.length === 0" class="text-center py-4">
        <feather-icon icon="CheckCircleIcon" size="48" class="text-success mb-3" />
        <h5>{{ $t('pos.itemSelection.pendingTicketsModal.noPending') }}</h5>
        <p class="text-muted">{{ $t('pos.itemSelection.pendingTicketsModal.allCompleted') }}</p>
      </div>

      <div v-else class="pending-tickets-list">
        <b-card v-for="ticket in pendingTickets" :key="ticket.id" class="mb-3 ticket-card">
          <div class="d-flex justify-content-between align-items-start mb-2">
            <div>
              <h6 class="mb-1">{{ $t('pos.itemSelection.pendingTicketsModal.ticket') }} {{ ticket.salesNumber }}</h6>
              <small class="text-muted">
                {{ $t('pos.itemSelection.pendingTicketsModal.created') }} {{ formatDateTime(ticket.salesDate) }}
              </small>
            </div>
            <b-badge variant="warning">{{ $t('pos.itemSelection.pendingTicketsModal.pending') }}</b-badge>
          </div>

          <div class="ticket-items mb-2">
            <h6 class="small font-weight-bold mb-1">{{ $t('pos.itemSelection.pendingTicketsModal.items') }}</h6>
            <div v-for="(line, idx) in ticket.salesLines" :key="idx" class="ticket-item-line">
              <span>{{ line.item.name }}</span>
              <span class="float-right">
                {{ line.quantity }} x TND {{ formatPrice(line.unitPrice) }} = TND {{ formatPrice(line.lineTotal) }}
              </span>
            </div>
          </div>

          <div class="ticket-summary">
            <div class="d-flex justify-content-between">
              <span>{{ $t('pos.itemSelection.pendingTicketsModal.subtotal') }}</span>
              <span>TND {{ formatPrice(ticket.subtotal) }}</span>
            </div>
            <div class="d-flex justify-content-between">
              <span>{{ $t('pos.itemSelection.pendingTicketsModal.tax') }}</span>
              <span>TND {{ formatPrice(ticket.taxAmount) }}</span>
            </div>
            <div class="d-flex justify-content-between font-weight-bold">
              <span>{{ $t('pos.itemSelection.pendingTicketsModal.total') }}</span>
              <span>TND {{ formatPrice(ticket.totalAmount) }}</span>
            </div>
          </div>

          <div class="mt-3 d-flex gap-2">
            <b-button variant="primary" size="sm" class="flex-grow-1" @click="retrievePendingTicket(ticket)">
              <feather-icon icon="ArrowRightIcon" size="14" class="mr-1" />
              {{ $t('pos.itemSelection.pendingTicketsModal.continue') }}
            </b-button>
            <b-button variant="danger" size="sm" @click="confirmDeletePendingTicket(ticket)">
              <feather-icon icon="TrashIcon" size="14" />
            </b-button>
          </div>
        </b-card>
      </div>
    </b-modal>

    <!-- Close Session Modal -->
    <b-modal id="close-session-modal" v-model="showCloseSessionModal"
      :title="$t('pos.itemSelection.closeSessionModal.title')" size="xl" @ok="closeSession"
      @cancel="resetCloseSessionForm" @hide="resetCloseSessionForm" @shown="onCloseSessionModalShown"
      :ok-disabled="!canCloseSession" ok-variant="danger">
      <div class="cash-count-section">
        <div class="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h5 class="mb-1">{{ $t('pos.itemSelection.closeSessionModal.paymentCountDetails') }}</h5>
            <p class="text-muted small mb-0">{{ $t('pos.itemSelection.closeSessionModal.paymentCountDescription') }}</p>
          </div>
          <b-button variant="primary" size="sm" @click="addCashCountLine" class="shadow-sm">
            <feather-icon icon="PlusIcon" size="14" class="mr-50" />
            {{ $t('pos.itemSelection.closeSessionModal.addLine') }}
          </b-button>
        </div>

        <!-- Payment Count Lines Table -->
        <div class="cash-count-table-container">
          <b-table v-if="closeSessionData.cashCountLines.length > 0" :items="closeSessionData.cashCountLines"
            :fields="cashCountFieldsComputed" striped bordered small responsive class="mb-0">
            <template #cell(denominationValue)="row">
              <b-input-group prepend="TND" size="sm">
                <b-form-input v-model.number="row.item.denominationValue" type="number" step="0.01" min="0"
                  @input="updateCashCountTotals" size="sm" placeholder="0.00" />
              </b-input-group>
            </template>
            <template #cell(quantity)="row">
              <b-form-input v-model.number="row.item.quantity" type="number" min="1" @input="updateCashCountTotals"
                size="sm" placeholder="0" />
            </template>
            <template #cell(paymentMethod)="row">
              <b-form-select v-model="row.item.paymentMethodId" :options="paymentMethodOptionsWithCash" value-field="id"
                text-field="name" size="sm" @change="updateCashCountTotals">
              </b-form-select>
            </template>
            <template #cell(lineTotal)="row">
              <strong class="text-primary">TND {{ formatPrice(row.item.denominationValue * row.item.quantity)
              }}</strong>
            </template>
            <template #cell(actions)="row">
              <b-button variant="link" size="sm" @click="removeCashCountLine(row.index)" class="text-danger p-0"
                v-b-tooltip.hover :title="$t('pos.itemSelection.closeSessionModal.removeLine')">
                <feather-icon icon="XIcon" size="16" />
              </b-button>
            </template>
          </b-table>

          <div v-else class="text-center text-muted py-5">
            <feather-icon icon="FileTextIcon" size="48" class="mb-2 text-muted" />
            <p class="mb-1">{{ $t('pos.itemSelection.closeSessionModal.noLines') }}</p>
            <p class="small mb-0">{{ $t('pos.itemSelection.closeSessionModal.noLinesDescription') }}</p>
          </div>
        </div>

        <!-- Total Summary -->
        <div v-if="closeSessionData.cashCountLines.length > 0" class="cash-count-total mt-4">
          <b-card class="border-primary">
            <div class="d-flex justify-content-between align-items-center">
              <div>
                <strong class="text-muted d-block mb-1" style="font-size: 0.9rem;">{{
                  $t('pos.itemSelection.closeSessionModal.totalCounted') }}</strong>
                <strong class="text-primary" style="font-size: 1.5rem;">
                   {{ formatPrice(calculatedTotalCash) }}
                </strong>
              </div>
              <b-badge>TND</b-badge>
            </div>
          </b-card>
        </div>

        <b-form-group :label="$t('pos.itemSelection.closeSessionModal.notes')" label-for="close-notes" class="mt-4">
          <b-form-textarea id="close-notes" v-model="closeSessionData.notes"
            :placeholder="$t('pos.itemSelection.closeSessionModal.notesPlaceholder')" rows="3" />
        </b-form-group>
      </div>
      <template #modal-ok>
        <feather-icon icon="PowerIcon" size="16" class="mr-50" />
        {{ $t('pos.itemSelection.closeSessionModal.close') }}
      </template>
    </b-modal>

    <!-- Discount Modal -->
    <b-modal id="discount-modal" v-model="showDiscountModal" :title="$t('pos.itemSelection.discountModal.title')"
      size="md" @ok="applyLineDiscount" @hide="resetDiscountForm" :ok-disabled="!canApplyDiscount">
      <div v-if="discountModalItemIndex !== null">
        <div class="mb-3" v-if="getDiscountModalItem()">
          <strong>{{ getDiscountModalItem().name }}</strong>
          <div class="text-muted small">Original Line Total: {{ formatTunCurrency(getOriginalLineTotal()) }}</div>
        </div>

        <!-- Discount Type Toggle -->
        <b-form-group :label="$t('pos.itemSelection.discountModal.discountType')">
          <b-form-radio-group v-model="discountType" :options="[
            { text: $t('pos.itemSelection.discountModal.percentageLabel'), value: 'percentage' },
            { text: $t('pos.itemSelection.discountModal.amountLabel'), value: 'amount' }
          ]" />
        </b-form-group>

        <!-- Discount Input -->
        <b-form-group
          :label="discountType === 'percentage' ? $t('pos.itemSelection.discountModal.discountPercentage') : $t('pos.itemSelection.discountModal.discountAmount')">
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
            <span>{{ $t('pos.itemSelection.discountModal.originalTotal') }}</span>
            <strong>{{ formatTunCurrency(getOriginalLineTotal()) }}</strong>
          </div>
          <div class="d-flex justify-content-between mb-1">
            <span>{{ $t('pos.itemSelection.discountModal.discount') }}</span>
            <strong class="text-danger">-{{ formatTunCurrency(getCalculatedDiscount()) }}</strong>
          </div>
          <hr class="my-2" />
          <div class="d-flex justify-content-between">
            <span><strong>{{ $t('pos.itemSelection.discountModal.newLineTotal') }}</strong></span>
            <strong class="text-success">{{ formatTunCurrency(getNewLineTotal()) }}</strong>
          </div>
        </b-alert>
      </div>
      <template #modal-ok>
        {{ $t('pos.itemSelection.discountModal.apply') }}
      </template>
      <template #modal-cancel>
        {{ $t('pos.itemSelection.discountModal.cancel') }}
      </template>
    </b-modal>

    <!-- Badge Scan Popup for Customer Management -->
    <BadgeScanPopup :show="showBadgeScanPopupForCustomer" :required-permission="'CONSULT_CUSTOMER_LIST'"
      :session-id="currentSessionId" @badge-scanned="onBadgeScannedForCustomer" @close="onBadgeScanCloseForCustomer" />

    <!-- Badge Scan Popup for Return Products -->
    <BadgeScanPopup :show="showBadgeScanPopupForReturn" :required-permission="'MAKE_RETURN'"
      :session-id="currentSessionId" @badge-scanned="onBadgeScannedForReturn" @close="onBadgeScanCloseForReturn" />

    <!-- Badge Scan Popup for Line Discount -->
    <BadgeScanPopup :show="showBadgeScanPopupForLineDiscount" :required-permission="'APPLY_LINE_DISCOUNT'"
      :session-id="currentSessionId" @badge-scanned="onBadgeScannedForLineDiscount"
      @close="onBadgeScanCloseForLineDiscount" />

  </div>
</template>

<script>
import useJwt from '@/auth/jwt/useJwt'
import ToastificationContent from '@core/components/toastification/ToastificationContent.vue'
import BadgeScanPopup from '@/components/pos/BadgeScanPopup.vue'
import { checkCurrentUserPermission, getAlwaysShowBadgeScan, BADGE_PERMISSIONS } from '@/services/badgeService'
import { formatCurrency, formatCurrencyAmount } from '@core/utils/filter'

export default {
  name: 'ItemSelection',
  components: {
    BadgeScanPopup
  },
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
        notes: '',
        cashCountLines: []
      },
      pricingEnabled: false, // Pricing feature flag - checked once on mount
      showBadgeScanPopupForCustomer: false,
      badgeScannedForCustomer: false,
      previousCustomerId: null, // Track previous customer for auto-recalculation
      showBadgeScanPopupForReturn: false,
      badgeScannedForReturn: false,
      showBadgeScanPopupForLineDiscount: false,
      badgeScannedForLineDiscount: false,
      pendingLineDiscountIndex: null,
      selectedCustomerObj: null,
      passengerCustomer: null, // Default customer (PASSENGER)
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
      cashCountFields: []
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
        return this.$t('pos.itemSelection.levels.products')
      }
      if (this.isSubFamiliesView) {
        return this.$t('pos.itemSelection.levels.subFamilies')
      }
      return this.$t('pos.itemSelection.levels.families')
    },
    searchPlaceholder() {
      if (this.isItemsView) {
        return this.$t('pos.itemSelection.searchPlaceholders.products')
      }
      if (this.isSubFamiliesView) {
        return this.$t('pos.itemSelection.searchPlaceholders.subFamilies')
      }
      return this.$t('pos.itemSelection.searchPlaceholders.families')
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
    headerDiscountAmount() {
      const orderSummary = this.$store.state.pos?.orderSummary
      if (!orderSummary) return 0
      const total = this.totalAmount

      if (orderSummary.discountPercent && orderSummary.discountPercent > 0) {
        return total * (orderSummary.discountPercent / 100)
      } else if (orderSummary.discountAmount && orderSummary.discountAmount > 0) {
        return orderSummary.discountAmount
      }
      return 0
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
    currentSessionId() {
      const session = this.$store.state.pos?.currentSession
      return session ? session.id : null
    },
    selectedCustomer() {
      // Get selected customer from store
      const selectedCustomerId = this.$store.state.pos?.selectedCustomerId
      if (!selectedCustomerId || !this.selectedCustomerObj) {
        return null
      }
      return this.selectedCustomerObj
    },
    paymentMethodOptions() {
      return this.paymentMethods.filter(pm => pm.active !== false)
    },
    paymentMethodOptionsWithCash() {
      // Add Cash as first option (null value), then all active payment methods
      const cashOption = { id: null, name: this.$t('common.cash') }
      return [cashOption, ...this.paymentMethodOptions]
    },
    cashCountFieldsComputed() {
      return [
        { key: 'denominationValue', label: this.$t('pos.itemSelection.closeSessionModal.value'), sortable: false, thClass: 'text-nowrap' },
        { key: 'quantity', label: this.$t('pos.itemSelection.closeSessionModal.quantity'), sortable: false, thClass: 'text-nowrap' },
        { key: 'paymentMethod', label: this.$t('pos.itemSelection.closeSessionModal.paymentMethod'), sortable: false, thClass: 'text-nowrap' },
        { key: 'lineTotal', label: this.$t('pos.itemSelection.closeSessionModal.lineTotal'), sortable: false, thClass: 'text-nowrap text-right', tdClass: 'text-right' },
        { key: 'actions', label: '', sortable: false, thClass: 'text-center', tdClass: 'text-center' }
      ]
    },
    calculatedTotalCash() {
      return this.closeSessionData.cashCountLines.reduce((total, line) => {
        const value = parseFloat(line.denominationValue) || 0
        const qty = parseInt(line.quantity) || 0
        return total + (value * qty)
      }, 0)
    },
    canCloseSession() {
      // Can close if cash count lines are provided and all are valid
      if (this.closeSessionData.cashCountLines.length > 0) {
        // All lines must have valid denomination and quantity
        // paymentMethodId can be null (Cash) or any valid payment method ID
        return this.closeSessionData.cashCountLines.every(line => {
          return line.denominationValue && line.denominationValue > 0 &&
            line.quantity && line.quantity > 0
        })
      }
      return false
    }
  },
  watch: {
    '$store.state.pos.selectedCustomerId': {
      handler(newCustomerId) {
        // Update previous customer ID in sessionStorage when customer changes
        // (Auto-recalculation happens on mount when returning from customer page)
        this.previousCustomerId = newCustomerId
        if (newCustomerId !== null && newCustomerId !== undefined) {
          sessionStorage.setItem('pos_previous_customer_id', newCustomerId.toString())
        } else {
          sessionStorage.removeItem('pos_previous_customer_id')
        }
      },
      immediate: false
    }
  },
  async mounted() {
    document.body.classList.add('pos-no-scroll')
    this.loadCurrentSession()
    this.loadFamilies()
    // this.loadItemsWithBarcodes()
    // this.loadPaymentMethods()
    this.loadPendingTicketsCount()
    // Load pricing configuration first (needed for customer change check)
    await this.loadPricingConfig()
    
    // Load default/passenger customer first
    await this.loadPassengerCustomer()
    
    // Load selected customer from store if exists, otherwise set to default customer
    const selectedCustomerId = this.$store.state.pos?.selectedCustomerId
    if (!selectedCustomerId && this.passengerCustomer) {
      // No customer selected - set default customer to avoid false "change" detection
      this.$store.dispatch('pos/setSelectedCustomerId', this.passengerCustomer.id)
      await this.loadSelectedCustomer()
    } else {
      await this.loadSelectedCustomer()
    }
    
    // Get stored previous customer ID (from sessionStorage to persist across navigation)
    const storedPreviousCustomerId = sessionStorage.getItem('pos_previous_customer_id')
    // Handle both null string and actual null
    const storedPreviousCustomerIdNum = storedPreviousCustomerId && storedPreviousCustomerId !== 'null' 
      ? parseInt(storedPreviousCustomerId, 10) 
      : null
    
    // Get current customer ID from store (should now always have a value - default or selected)
    const currentCustomerId = this.$store.state.pos?.selectedCustomerId
    
    // Debug logging
    console.log('Customer Change Check:', {
      pricingEnabled: this.pricingEnabled,
      cartLength: this.cart.length,
      storedPreviousCustomerId: storedPreviousCustomerIdNum,
      currentCustomerId: currentCustomerId,
      cart: this.cart
    })
    
    // Check if customer changed while we were away (e.g., from customer management page)
    // Use $nextTick to ensure cart is loaded from store
    this.$nextTick(() => {
      const cartLength = this.cart ? this.cart.length : 0
      const hasCartItems = cartLength > 0
      const hasPricingEnabled = this.pricingEnabled === true
      const hasCurrentCustomer = currentCustomerId !== undefined && currentCustomerId !== null
      const hasPreviousCustomer = storedPreviousCustomerIdNum !== null
      
      // Customer changed if previous customer exists and is different from current
      // Note: We no longer need to check for "first time selection" because default customer
      // is now set in ItemSelection, so customer should never be null
      const customerChanged = hasPreviousCustomer && storedPreviousCustomerIdNum !== currentCustomerId
      
      console.log('Customer Change Check Details:', {
        hasPricingEnabled,
        hasCartItems,
        cartLength,
        hasCurrentCustomer,
        currentCustomerId,
        hasPreviousCustomer,
        storedPreviousCustomerIdNum,
        customerChanged,
        scenario: hasPreviousCustomer && storedPreviousCustomerIdNum !== currentCustomerId ? 'Customer changed' : 
                 'No change',
        shouldShowDialog: hasPricingEnabled && hasCartItems && hasCurrentCustomer && customerChanged
      })
      
      if (hasPricingEnabled && hasCartItems && hasCurrentCustomer && customerChanged) {
        console.log('✅ Customer changed - automatically recalculating cart')
        // Customer changed - automatically recalculate (confirmation was already shown in CustomerList)
        this.recalculateCartWithNewCustomer(currentCustomerId).then(() => {
          // Show success message after recalculation
          this.$toast({
            component: ToastificationContent,
            props: {
              title: this.$t('pos.itemSelection.customerChangeConfirm.successTitle'),
              icon: 'CheckCircleIcon',
              text: this.$t('pos.itemSelection.customerChangeConfirm.successText'),
              variant: 'success'
            }
          })
        }).catch(error => {
          console.error('Error recalculating cart:', error)
          this.$toast({
            component: ToastificationContent,
            props: {
              title: this.$t('pos.itemSelection.customerChangeConfirm.errorTitle'),
              icon: 'AlertCircleIcon',
              text: this.$t('pos.itemSelection.customerChangeConfirm.errorText'),
              variant: 'danger'
            }
          })
        })
      } else {
        console.log('❌ Conditions not met for customer change recalculation')
        if (!hasPricingEnabled) console.log('  - Pricing not enabled')
        if (!hasCartItems) console.log('  - No cart items')
        if (!hasCurrentCustomer) console.log('  - No current customer')
        if (!customerChanged) console.log('  - Customer did not change')
      }
    })
    
    // Store current customer ID for next time (in both component and sessionStorage)
    // Note: currentCustomerId should now always have a value (default customer is set if none selected)
    this.previousCustomerId = currentCustomerId
    if (currentCustomerId !== null && currentCustomerId !== undefined) {
      sessionStorage.setItem('pos_previous_customer_id', currentCustomerId.toString())
    } else {
      // Fallback: if somehow still null, use default customer
      if (this.passengerCustomer) {
        sessionStorage.setItem('pos_previous_customer_id', this.passengerCustomer.id.toString())
        this.previousCustomerId = this.passengerCustomer.id
      } else {
        sessionStorage.removeItem('pos_previous_customer_id')
      }
    }

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
    // this.pendingTicketsInterval = setInterval(() => {
    //   this.loadPendingTicketsCount()
    // }, 10000) // Check every 10 seconds

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
    getStockClass(stock) {
      if (stock === null || stock === undefined) return 'stock-unknown'
      if (stock === 0) return 'stock-out'
      if (stock < 10) return 'stock-low'
      return 'stock-ok'
    },
    getStockIcon(stock) {
      if (stock === null || stock === undefined) return 'HelpCircleIcon'
      if (stock === 0) return 'XCircleIcon'
      if (stock < 10) return 'AlertTriangleIcon'
      return 'CheckCircleIcon'
    },
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
      return formatCurrencyAmount(value)
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
          component: ToastificationContent,
          props: {
            title: this.$t('pos.itemSelection.messages.error'),
            icon: 'XIcon',
            text: this.$t('pos.itemSelection.messages.failedToLoadFamilies'),
            variant: 'danger'
          }
        })
      } finally {
        this.gridLoading = false
      }
    },
    async loadPricingConfig() {
      try {
        const response = await this.$http.get('/item/pricing-config')
        if (response.data) {
          this.pricingEnabled = response.data.priceGroupEnabled || false
        }
      } catch (error) {
        console.error('Error loading pricing config:', error)
        // Default to false if config cannot be loaded (safe fallback)
        this.pricingEnabled = false
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
          component: ToastificationContent,
          props: {
            title: this.$t('pos.itemSelection.messages.error'),
            icon: 'XIcon',
            text: this.$t('pos.itemSelection.messages.failedToLoadSubFamilies'),
            variant: 'danger'
          }
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
          component: ToastificationContent,
          props: {
            title: this.$t('pos.itemSelection.messages.error'),
            icon: 'XIcon',
            text: this.$t('pos.itemSelection.messages.failedToLoadItems'),
            variant: 'danger'
          }
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

      if (key === 'BACK' || key === '⌫') {
        // Backspace - remove last character
        this[targetField] = currentValue.slice(0, -1)
      } else if (key === 'CLEAR') {
        // Clear - empty the field
        this[targetField] = ''
      } else if (key === 'SPACE') {
        // Space - add space
        this[targetField] = `${currentValue} `
      } else if (key === 'ENTER') {
        // Enter - submit
        if (targetField === 'barcodeInput') {
          this.handleBarcodeScan()
        } else {
          this.handleSearchInput()
        }
        return
      } else if (key === '.') {
        // Decimal point - add if not present
        if (!currentValue.includes('.')) {
          this[targetField] = currentValue + '.'
        }
      } else if (key >= '0' && key <= '9') {
        // Number - append
        this[targetField] = currentValue + key
      } else {
        // Other characters (like '00')
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
              // Price calculation will be done in addToCart
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
              title: this.$t('pos.itemSelection.messages.barcodeNotFound'),
              icon: 'AlertCircleIcon',
              text: this.$t('pos.itemSelection.messages.barcodeNotFoundText', { barcode }),
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
            title: this.$t('pos.itemSelection.messages.error'),
            icon: 'XIcon',
            text: this.$t('pos.itemSelection.messages.failedToScanBarcode'),
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
            title: this.$t('pos.itemSelection.messages.error'),
            icon: 'XIcon',
            text: this.$t('pos.itemSelection.messages.failedToLoadTickets'),
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
        maximumAuthorizedDiscount: line.item.maximumAuthorizedDiscount || null,
        discountPercentage: line.discountPercentage || null,
        discountAmount: line.discountAmount || null
      }))

      // Set cart and order summary
      this.$store.dispatch('pos/setCart', cartItems)
      this.$store.dispatch('pos/setOrderSummary', {
        subtotal: ticket.subtotal,
        taxAmount: ticket.taxAmount,
        discountAmount: ticket.discountAmount || 0,
        discountPercent: ticket.discountPercentage || 0,
        totalAmount: ticket.totalAmount
      })

      // Store pending ticket ID in store for later use
      this.$store.dispatch('pos/setPendingTicketId', ticket.id)

      // Close modal and stay on item selection page (so user can add more items)
      this.showPendingTicketsModal = false

      this.$toast({
        component: ToastificationContent,
        props: {
          title: this.$t('pos.itemSelection.messages.ticketRetrieved'),
          icon: 'CheckCircleIcon',
          text: this.$t('pos.itemSelection.messages.ticketRetrievedText', { ticketNumber: ticket.salesNumber }),
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
        this.$t('pos.itemSelection.pendingTicketsModal.deleteConfirm', { ticketNumber: ticket.salesNumber }),
        {
          title: this.$t('pos.itemSelection.pendingTicketsModal.deleteTitle'),
          size: 'sm',
          buttonSize: 'sm',
          okVariant: 'danger',
          okTitle: this.$t('pos.itemSelection.pendingTicketsModal.delete'),
          cancelTitle: this.$t('pos.itemSelection.pendingTicketsModal.cancel'),
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
              title: this.$t('common.success'),
              icon: 'CheckCircleIcon',
              text: this.$t('pos.itemSelection.messages.pendingTicketDeleted'),
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
        let errorMessage = this.$t('pos.itemSelection.messages.failedToDeleteTicket')

        if (error.response && error.response.data) {
          errorMessage = error.response.data.message || error.response.data || errorMessage
        }

        this.$toast({
          component: ToastificationContent,
          props: {
            title: this.$t('pos.itemSelection.messages.error'),
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
    async addToCart(item) {
      // Calculate price if customer is selected and pricing is enabled
      const selectedCustomerId = this.$store.state.pos?.selectedCustomerId
      let calculatedPrice = item.unitPrice || 0
      let calculatedDiscountPercentage = null

      // Only call pricing API if pricing is enabled
      if (this.pricingEnabled && item.id) {
        try {
          const response = await this.$http.get(`/item/${item.id}/calculate-price`, {
            params: {
              customerId: selectedCustomerId,
              quantity: 1
            }
          })
          
          if (response.data) {
            calculatedPrice = response.data.unitPrice || item.unitPrice || 0
            calculatedDiscountPercentage = response.data.discountPercentage
            // Update item with calculated price for display
            item.unitPrice = calculatedPrice
          }
        } catch (error) {
          console.error('Error calculating price:', error)
          // Fallback to item.unitPrice if calculation fails
        }
      }

      const currentCart = [...this.cart]
      const existingIndex = currentCart.findIndex(cartItem => cartItem.id === item.id)
      if (existingIndex !== -1) {
        const existingItem = currentCart[existingIndex]
        existingItem.quantity += 1
        // Recalculate price for updated quantity if pricing is enabled
        if (this.pricingEnabled && selectedCustomerId && item.id) {
          try {
            const response = await this.$http.get(`/item/${item.id}/calculate-price`, {
              params: {
                customerId: selectedCustomerId,
                quantity: existingItem.quantity + 1
              }
            })
            if (response.data) {
              existingItem.unitPrice = response.data.unitPrice || existingItem.unitPrice
              if (response.data.discountPercentage !== null && response.data.discountPercentage !== undefined) {
                existingItem.discountPercentage = response.data.discountPercentage
              }
            }
          } catch (error) {
            console.error('Error recalculating price:', error)
          }
        }
        currentCart.splice(existingIndex, 1)
        currentCart.unshift(existingItem)
      } else {
        currentCart.unshift({
          id: item.id,
          itemCode: item.itemCode,
          name: item.name,
          unitPrice: calculatedPrice,
          defaultVAT: item.defaultVAT || 0,
          maximumAuthorizedDiscount: item.maximumAuthorizedDiscount || null,
          quantity: 1,
          discountPercentage: calculatedDiscountPercentage,
          discountAmount: null,
        })
      }
      this.$store.dispatch('pos/setCart', currentCart)
      this.highlightCartItem(item.id)

      // Add visual feedback - scroll to top of cart and highlight
      this.$nextTick(() => {
        if (this.$refs.cartList) {
          this.$refs.cartList.scrollTop = 0
        }
      })

      // // Show toast notification
      // this.$toast({
      //   component: ToastificationContent,
      //   props: {
      //     title: this.$t('pos.itemSelection.messages.addedToCart'),
      //     icon: 'CheckIcon',
      //     text: this.$t('pos.itemSelection.messages.addedToCartText', { itemName: item.name }),
      //     variant: 'success'
      //   },
      // }, {
      //   position: 'top-left', // ⬅️ here
      // })
    },
    async increaseQuantity(index) {
      const currentCart = [...this.cart]
        const cartItem = currentCart[index]
        cartItem.quantity += 1

        // Recalculate price if pricing is enabled and customer is selected
        const selectedCustomerId = this.$store.state.pos?.selectedCustomerId
        if (this.pricingEnabled && selectedCustomerId && cartItem.id) {
          try {
            const response = await this.$http.get(`/item/${cartItem.id}/calculate-price`, {
              params: {
                customerId: selectedCustomerId,
                quantity: cartItem.quantity
              }
            })
            if (response.data) {
              cartItem.unitPrice = response.data.unitPrice || cartItem.unitPrice
              if (response.data.discountPercentage !== null && response.data.discountPercentage !== undefined) {
                cartItem.discountPercentage = response.data.discountPercentage
              }
            }
          } catch (error) {
            console.error('Error recalculating price:', error)
          }
        }

      this.$store.dispatch('pos/setCart', currentCart)
    },
    async decreaseQuantity(index) {
      const currentCart = [...this.cart]
      if (currentCart[index].quantity > 1) {
        const cartItem = currentCart[index]
        cartItem.quantity -= 1

        // Recalculate price if pricing is enabled and customer is selected
        const selectedCustomerId = this.$store.state.pos?.selectedCustomerId
        if (this.pricingEnabled && selectedCustomerId && cartItem.id) {
          try {
            const response = await this.$http.get(`/item/${cartItem.id}/calculate-price`, {
              params: {
                customerId: selectedCustomerId,
                quantity: cartItem.quantity
              }
            })
            if (response.data) {
              cartItem.unitPrice = response.data.unitPrice || cartItem.unitPrice
              if (response.data.discountPercentage !== null && response.data.discountPercentage !== undefined) {
                cartItem.discountPercentage = response.data.discountPercentage
              }
            }
          } catch (error) {
            console.error('Error recalculating price:', error)
          }
        }

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
      return formatCurrencyAmount(price)
    },
    formatTunCurrency(value) {
      return formatCurrency(value)
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
    async goToCustomerManagement() {
      // Store current customer ID before navigating (so we can detect changes when returning)
      const currentCustomerId = this.$store.state.pos?.selectedCustomerId
      if (currentCustomerId !== null && currentCustomerId !== undefined) {
        sessionStorage.setItem('pos_previous_customer_id', currentCustomerId.toString())
        this.previousCustomerId = currentCustomerId
        console.log('Stored customer before navigation:', currentCustomerId)
      } else {
        // Fallback: if somehow null, store default customer ID if available
        if (this.passengerCustomer) {
          sessionStorage.setItem('pos_previous_customer_id', this.passengerCustomer.id.toString())
          this.previousCustomerId = this.passengerCustomer.id
          console.log('No customer selected, storing default customer:', this.passengerCustomer.id)
        } else {
          sessionStorage.setItem('pos_previous_customer_id', 'null')
          this.previousCustomerId = null
          console.log('No customer selected and no default customer available')
        }
      }
      
      // Check if badge scan is required before navigating
      const badgeRequired = await this.checkBadgeRequirementForCustomer()
      if (badgeRequired && !this.badgeScannedForCustomer) {
        // Show badge scan popup
        this.showBadgeScanPopupForCustomer = true
        return
      }
      // Navigate to customer management page with return route
      this.$router.push({
        name: 'pos-customers',
        query: { returnTo: 'pos-item-selection' }
      })
    },
    async checkBadgeRequirementForCustomer() {
      try {
        const alwaysShow = await getAlwaysShowBadgeScan(this.$http)
        if (alwaysShow) {
          return true
        }
        const permissionCheck = await checkCurrentUserPermission(BADGE_PERMISSIONS.CONSULT_CUSTOMER_LIST, this.$http)
        // Return true if badge scan is required (user doesn't have valid permission)
        return !permissionCheck.hasValidPermission
      } catch (error) {
        console.error('Error checking badge requirement for customer:', error)
        return true // On error, require badge scan
      }
    },
    onBadgeScannedForCustomer() {
      // Store current customer ID before navigating (so we can detect changes when returning)
      const currentCustomerId = this.$store.state.pos?.selectedCustomerId
      if (currentCustomerId !== null && currentCustomerId !== undefined) {
        sessionStorage.setItem('pos_previous_customer_id', currentCustomerId.toString())
        this.previousCustomerId = currentCustomerId
        console.log('Stored customer before navigation (after badge scan):', currentCustomerId)
      } else {
        // Fallback: if somehow null, store default customer ID if available
        if (this.passengerCustomer) {
          sessionStorage.setItem('pos_previous_customer_id', this.passengerCustomer.id.toString())
          this.previousCustomerId = this.passengerCustomer.id
          console.log('No customer selected, storing default customer (after badge scan):', this.passengerCustomer.id)
        } else {
          sessionStorage.setItem('pos_previous_customer_id', 'null')
          this.previousCustomerId = null
          console.log('No customer selected and no default customer available (after badge scan)')
        }
      }
      
      this.badgeScannedForCustomer = true
      this.showBadgeScanPopupForCustomer = false
      // Navigate to customer management page after successful badge scan
      this.$router.push({
        name: 'pos-customers',
        query: { returnTo: 'pos-item-selection' }
      })
    },
    onBadgeScanCloseForCustomer() {
      this.showBadgeScanPopupForCustomer = false
      // Don't navigate if user closed without scanning
    },
    async goToReturn() {
      // Check if badge scan is required before navigating
      const badgeRequired = await this.checkBadgeRequirementForReturn()
      if (badgeRequired && !this.badgeScannedForReturn) {
        // Show badge scan popup
        this.showBadgeScanPopupForReturn = true
        return
      }
      // Navigate to return products page
      this.$router.push({ name: 'pos-return' })
    },
    async checkBadgeRequirementForReturn() {
      try {
        const alwaysShow = await getAlwaysShowBadgeScan(this.$http)
        if (alwaysShow) {
          return true
        }
        const permissionCheck = await checkCurrentUserPermission(BADGE_PERMISSIONS.MAKE_RETURN, this.$http)
        // Return true if badge scan is required (user doesn't have valid permission)
        return !permissionCheck.hasValidPermission
      } catch (error) {
        console.error('Error checking badge requirement for return:', error)
        return true // On error, require badge scan
      }
    },
    onBadgeScannedForReturn() {
      this.badgeScannedForReturn = true
      this.showBadgeScanPopupForReturn = false
      // Navigate to return products page after successful badge scan
      this.$router.push({ name: 'pos-return' })
    },
    onBadgeScanCloseForReturn() {
      this.showBadgeScanPopupForReturn = false
      // Don't navigate if user closed without scanning
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
    async loadSelectedCustomer() {
      const selectedCustomerId = this.$store.state.pos?.selectedCustomerId
      if (selectedCustomerId) {
        try {
          const response = await this.$http.get(`/customer/${selectedCustomerId}`)
          this.selectedCustomerObj = response.data
        } catch (error) {
          console.error('Error loading selected customer:', error)
          // Clear invalid customer ID from store
          this.$store.dispatch('pos/clearSelectedCustomerId')
        }
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
    clearSelectedCustomer() {
      this.selectedCustomerObj = null
      // When clearing customer, set to default customer instead of null
      if (this.passengerCustomer) {
        this.$store.dispatch('pos/setSelectedCustomerId', this.passengerCustomer.id)
        this.loadSelectedCustomer()
        this.$toast({
          component: ToastificationContent,
          props: {
            title: this.$t('pos.itemSelection.customerCleared'),
            icon: 'CheckCircleIcon',
            text: this.$t('pos.itemSelection.customerClearedText'),
            variant: 'success'
          }
        })
      } else {
        // Fallback if passenger customer not loaded
        this.$store.dispatch('pos/clearSelectedCustomerId')
        this.$toast({
          component: ToastificationContent,
          props: {
            title: this.$t('pos.itemSelection.customerCleared'),
            icon: 'CheckCircleIcon',
            text: this.$t('pos.itemSelection.customerClearedText'),
            variant: 'success'
          }
        })
      }
    },
    async recalculateCartWithNewCustomer(customerId) {
      const currentCart = [...this.cart]
      
      // Recalculate price for each cart item
      const recalculationPromises = currentCart.map(async cartItem => {
        if (cartItem.id) {
          try {
            const response = await this.$http.get(`/item/${cartItem.id}/calculate-price`, {
              params: {
                customerId: customerId,
                quantity: cartItem.quantity
              }
            })            
            if (response.data) {
              cartItem.unitPrice = response.data.unitPrice || cartItem.unitPrice
              if (response.data.discountPercentage !== null && response.data.discountPercentage !== undefined) {
                cartItem.discountPercentage = response.data.discountPercentage
              } else {
                // Clear discount if not provided
                cartItem.discountPercentage = null
              }
            }
          } catch (error) {
            console.error(`Error recalculating price for item ${cartItem.id}:`, error)
            // Keep existing price on error
          }
        }
        return cartItem
      })

      // Wait for all recalculations to complete
      const updatedCart = await Promise.all(recalculationPromises)
      
      // Update cart in store
      this.$store.dispatch('pos/setCart', updatedCart)
      
      // Update previous customer ID in sessionStorage for next time
      this.previousCustomerId = customerId
      if (customerId !== null && customerId !== undefined) {
        sessionStorage.setItem('pos_previous_customer_id', customerId.toString())
      } else {
        sessionStorage.removeItem('pos_previous_customer_id')
      }
    },
    addCashCountLine() {
      this.closeSessionData.cashCountLines.push({
        denominationValue: null,
        quantity: null,
        paymentMethodId: null, // null = cash (default)
        notes: ''
      })
    },
    onCloseSessionModalShown() {
      // Load payment methods when modal opens
      if (this.paymentMethods.length === 0) {
        this.loadPaymentMethods()
      }
    },
    removeCashCountLine(index) {
      this.closeSessionData.cashCountLines.splice(index, 1)
      this.updateCashCountTotals()
    },
    updateCashCountTotals() {
      // Trigger reactivity update
      this.$forceUpdate()
    },
    handleCloseSessionClick() {
      // Show close session modal directly (no badge check needed)
      this.showCloseSessionModal = true
    },
    async closeSession() {
      // Check for pending tickets first
      if (this.pendingTicketsCount > 0) {
        this.$toast({
          component: require('@core/components/toastification/ToastificationContent.vue').default,
          props: {
            title: this.$t('pos.itemSelection.closeSessionModal.cannotClose'),
            icon: 'AlertCircleIcon',
            text: this.$t('pos.itemSelection.closeSessionModal.pendingTicketsWarning', { count: this.pendingTicketsCount }),
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
            title: this.$t('pos.itemSelection.closeSessionModal.error'),
            icon: 'XIcon',
            text: this.$t('pos.itemSelection.closeSessionModal.addCashCountError'),
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

        // Add cash count lines if any
        if (this.closeSessionData.cashCountLines.length > 0) {
          requestData.cashCountLines = this.closeSessionData.cashCountLines.map(line => ({
            denominationValue: parseFloat(line.denominationValue) || 0,
            quantity: parseInt(line.quantity) || 0,
            paymentMethodId: line.paymentMethodId !== null ? line.paymentMethodId : null,
            notes: line.notes || null
          }))
        }

        const response = await this.$http.post('/cashier-session/close', requestData)

        if (response.status === 200) {
          this.$toast({
            component: ToastificationContent,
            props: {
              title: this.$t('common.success'),
              icon: 'CheckCircleIcon',
              text: this.$t('pos.itemSelection.closeSessionModal.sessionClosed'),
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
        let errorMessage = this.$t('pos.itemSelection.closeSessionModal.failedToClose')
        if (error.response && error.response.data) {
          errorMessage = error.response.data || errorMessage
        }
        this.$toast({
          component: ToastificationContent,
          props: {
            title: this.$t('pos.itemSelection.closeSessionModal.error'),
            icon: 'XIcon',
            text: errorMessage,
            variant: 'danger'
          }
        })
      }
    },
    resetCloseSessionForm() {
      this.closeSessionData = {
        notes: '',
        cashCountLines: []
      }
    },
    async openLineDiscountModal(index) {
      if (index < 0 || index >= this.cart.length) return

      // Check if badge scan is required before opening discount modal
      const badgeRequired = await this.checkBadgeRequirementForLineDiscount()
      if (badgeRequired && !this.badgeScannedForLineDiscount) {
        // Store the index for after badge scan
        this.pendingLineDiscountIndex = index
        this.showBadgeScanPopupForLineDiscount = true
        return
      }

      // Open discount modal
      this.openLineDiscountModalInternal(index)
    },
    openLineDiscountModalInternal(index) {
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
    async checkBadgeRequirementForLineDiscount() {
      try {
        const alwaysShow = await getAlwaysShowBadgeScan(this.$http)
        if (alwaysShow) {
          return true
        }
        const permissionCheck = await checkCurrentUserPermission(BADGE_PERMISSIONS.APPLY_LINE_DISCOUNT, this.$http)
        // Return true if badge scan is required (user doesn't have valid permission)
        return !permissionCheck.hasValidPermission
      } catch (error) {
        console.error('Error checking badge requirement for line discount:', error)
        return true // On error, require badge scan
      }
    },
    onBadgeScannedForLineDiscount() {
      this.badgeScannedForLineDiscount = true
      this.showBadgeScanPopupForLineDiscount = false
      // Open discount modal after successful badge scan
      if (this.pendingLineDiscountIndex !== null) {
        this.openLineDiscountModalInternal(this.pendingLineDiscountIndex)
        this.pendingLineDiscountIndex = null
      }
    },
    onBadgeScanCloseForLineDiscount() {
      this.showBadgeScanPopupForLineDiscount = false
      this.pendingLineDiscountIndex = null
      // Don't open discount modal if user closed without scanning
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

      // Check maximum authorized discount
      const maximumAuthorizedDiscount = item.maximumAuthorizedDiscount !== null && item.maximumAuthorizedDiscount !== undefined 
        ? item.maximumAuthorizedDiscount 
        : null
      
      if (maximumAuthorizedDiscount !== null && discountPercentage > maximumAuthorizedDiscount) {
        this.$toast({
          component: ToastificationContent,
          props: {
            title: this.$t('pos.itemSelection.discountModal.errorTitle') || 'Discount Error',
            icon: 'AlertCircleIcon',
            text: this.$t('pos.itemSelection.discountModal.maximumDiscountExceeded', { 
              max: maximumAuthorizedDiscount,
              attempted: discountPercentage.toFixed(2)
            }) || `Maximum authorized discount is ${maximumAuthorizedDiscount}%. Attempted discount: ${discountPercentage.toFixed(2)}%`,
            variant: 'danger'
          }
        })
        return // Don't apply the discount
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
  padding: 0 0px;
  display: flex;
  gap: 0;
  min-width: 0;
  box-sizing: border-box;
  margin-left: 0;
  margin-right: 0;
}

.pos-content>[class*='col'] {
  padding: 0;
}

@media (max-width: 767.98px) {
  .pos-content {
    flex-direction: column;
    padding: 0 10px;
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
  scrollbar-width: none;
  /* Firefox */
  -ms-overflow-style: none;
  /* IE and Edge */
}

.items-grid-wrapper::-webkit-scrollbar {
  display: none;
  /* Chrome, Safari, Opera */
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
  gap: 6px;
}

.items-section.compact-mode .items-grid {
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 4px;
}

@media (max-width: 1200px) {
  .items-grid {
    grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
    gap: 5px;
  }
}

.items-grid::-webkit-scrollbar {
  display: none;
}

.items-grid {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

@media (min-width: 1600px) {
  .items-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 6px;
  }
}

@media (max-width: 1200px) {
  .items-grid {
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: 4px;
  }
}

@media (max-width: 991.98px) {
  .items-grid {
    grid-template-columns: repeat(auto-fill, minmax(110px, 1fr));
    gap: 4px;
  }
}

@media (max-width: 768px) {
  .items-grid {
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
    gap: 4px;
  }
}

@media (max-width: 575.98px) {
  .items-grid {
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: 4px;
  }
}

.item-card {
  border: 2px solid #e0e0e0;
  border-radius: 6px;
  padding: 6px;
  cursor: pointer;
  transition: all 0.25s ease;
  background: #fff;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.02);
}

@media (max-width: 575.98px) {
  .item-card {
    padding: 6px;
  }

  .item-details h5 {
    font-size: 0.65rem;
  }

  .item-price {
    font-size: 0.85rem;
  }
}

.item-card:hover {
  border-color: #28a745;
  box-shadow: 0 10px 24px rgba(40, 167, 69, 0.15);
  transform: translateY(3px);
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
  margin-bottom: 2px;
  color: #007bff;
}

.item-image svg {
  width: 26px;
  height: 26px;
}

.item-details {
  width: 100%;
  margin-top: 1px;
}

.item-details h5 {
  font-size: 0.68rem;
  font-weight: 500;
  color: #2c3e50;
  line-height: 1.2;
  min-height: 2em;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.item-code {
  font-size: 0.62rem;
  color: #6c757d;
  margin: 1px 0 3px 0;
  font-weight: 500;
}

.item-price {
  font-size: 0.8rem;
  font-weight: bold;
  color: #28a745;
  margin: 0px;
}

.items-section.compact-mode .item-card {
  padding: 5px;
  border-radius: 5px;
}

.items-section.compact-mode .item-image {
  margin-bottom: 1px;
}

.items-section.compact-mode .item-image svg {
  width: 24px;
  height: 24px;
}

.items-section.compact-mode .item-details h5 {
  font-size: 0.65rem;
  -webkit-line-clamp: 2;
  min-height: 1.8em;
}

.items-section.compact-mode .item-code {
  font-size: 0.6rem;
  margin-bottom: 3px;
}

.items-section.compact-mode .item-price {
  font-size: 0.75rem;
}

.item-vat {
  font-size: 0.78rem;
  color: #6c757d;
  margin-bottom: 4px;
}

.item-stock {
  font-size: 0.7rem;
  margin: 3px 0 0 0;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 2px 6px;
  border-radius: 4px;
}

.stock-ok {
  color: #155724;
  background: #d4edda;
}

.stock-low {
  color: #856404;
  background: #fff3cd;
}

.stock-out {
  color: #721c24;
  background: #f8d7da;
}

.stock-unknown {
  color: #6c757d;
  background: #e9ecef;
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
  padding: 6px !important;
  min-width: 0;
  max-width: 100%;
  box-sizing: border-box;
  margin-right: 0;
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


.cart-items {
  flex: 1;
  min-height: 0;
  /* Allow shrinking but maintain usability */
  overflow-y: auto;
  overflow-x: hidden;
  margin-bottom: 8px;
  position: relative;
  padding-bottom: 8px;
  min-width: 0;
  box-sizing: border-box;
  /* Hide scrollbar but keep touch scrolling */
  scrollbar-width: none;
  /* Firefox */
  -ms-overflow-style: none;
  /* IE and Edge */
}

.cart-items::-webkit-scrollbar {
  display: none;
  /* Chrome, Safari, Opera */
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
  gap: 3px;
  padding: 8px;
  margin-bottom: 4px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  transition: all 0.2s ease;
  background: #f8f9fa;
  box-sizing: border-box;
}

.cart-item.highlighted {
  background: #e8f5e9;
  border-color: #28a745;
  border-width: 2px;
  box-shadow: 0 0 0 3px rgba(40, 167, 69, 0.2);
  transition: background-color 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease;
}

.cart-item-header {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  align-items: flex-start;
  margin-bottom: 0;
}

.cart-item-title h6 {
  margin: 0;
  line-height: 1.3;
  font-size: 0.9rem;
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
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 6px;
  background: #f8f9fa;
  border-radius: 5px;
  margin: 2px 0;
  font-size: 0.75rem;
}

.breakdown-row {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.breakdown-label {
  color: #6c757d;
  font-weight: 500;
  min-width: 70px;
}

.breakdown-value {
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 4px;
  background: #e9ecef;
  color: #495057;
}

.breakdown-value.primary {
  background: #d4edda;
  color: #155724;
}

.breakdown-value.secondary {
  background: #fff3cd;
  color: #856404;
}

.breakdown-value.discount {
  background: #fff3e0;
  color: #e65100;
}

.breakdown-row.discount-row {
  margin-top: 2px;
  padding-top: 2px;
  border-top: 1px solid #e0e0e0;
}

.breakdown-icon {
  color: #e65100;
}

.cart-item-controls {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
  flex-wrap: nowrap;
  margin-top: 0;
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
  gap: 8px;
  flex: 1;
}

.qty-btn {
  min-width: 36px;
  width: 36px;
  height: 36px;
  padding: 0;
  line-height: 1;
  font-size: 1.1rem;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  touch-action: manipulation;
  transition: all 0.2s ease;
}

.qty-btn:hover {
  transform: scale(1.1);
}

.qty-btn:active {
  transform: scale(0.95);
}

.quantity {
  min-width: 40px;
  text-align: center;
  font-weight: bold;
  font-size: 1rem;
  padding: 4px 8px;
  background: #f8f9fa;
  border-radius: 6px;
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
    font-size: 0.7rem;
    padding: 6px;
    gap: 4px;
  }
}

.quantity {
  min-width: 30px;
  text-align: center;
  font-weight: bold;
}

.cart-summary {
  border-top: 3px solid #e0e0e0;
  padding-top: 10px;
  /* margin-top: 10px; */
  margin-bottom: 10px;
  flex-shrink: 0;
}

.cart-summary-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  padding-bottom: 8px;
  border-bottom: 1px solid #e0e0e0;
}

.cart-summary-title {
  font-size: 0.95rem;
  font-weight: 600;
  color: #2c3e50;
}

.cart-clear-btn {
  padding: 2px 8px;
  font-size: 0.75rem;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 4px;
  font-size: 0.85rem;
  padding: 1px 0;
}

.summary-row.discount-row {
  color: #dc3545;
}

.summary-row.total {
  font-size: 1.15rem;
  font-weight: bold;
  border-top: 2px solid #e0e0e0;
  padding-top: 6px;
  margin-top: 4px;
  margin-bottom: 0;
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
  max-height: 450px;
  overflow-y: auto;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 15px;
  background-color: #fafafa;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.cash-count-table-container::-webkit-scrollbar {
  width: 8px;
}

.cash-count-table-container::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.cash-count-table-container::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;
}

.cash-count-table-container::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

@media (max-width: 575.98px) {
  .cash-count-table-container {
    max-height: 300px;
    padding: 10px;
  }
}

.cash-count-total {
  padding-top: 10px;
}

.cash-count-total .card {
  box-shadow: 0 2px 8px rgba(0, 123, 255, 0.15);
  transition: box-shadow 0.3s ease;
}

.cash-count-total .card:hover {
  box-shadow: 0 4px 12px rgba(0, 123, 255, 0.25);
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
  background: #fff;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  padding: 10px 15px;
  margin-bottom: 10px;
  flex-shrink: 0;
  box-sizing: border-box;
}

.keyboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  padding-bottom: 8px;
  border-bottom: 1px solid #e0e0e0;
}

.keyboard-header strong {
  font-size: 0.9rem;
  color: #2c3e50;
}

.keyboard-close-btn {
  padding: 4px 8px;
}

.keyboard-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
  width: 100%;
  box-sizing: border-box;
  margin-bottom: 10px;
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

.keyboard-actions {
  display: flex;
  gap: 10px;
  justify-content: space-between;
}

.keyboard-action-btn {
  flex: 1;
  min-height: 45px;
  font-weight: 600;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  background: #fff;
  color: #2c3e50;
  cursor: pointer;
  transition: all 0.15s ease;
  touch-action: manipulation;
  user-select: none;
  padding: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.keyboard-action-btn:hover:not(:disabled) {
  background: #f0f0f0;
  border-color: #7367f0;
  transform: scale(0.98);
}

.keyboard-action-btn:active:not(:disabled) {
  transform: scale(0.95);
  background: #e0e0e0;
}

.keyboard-action-enter {
  background: #28a745;
  color: #fff;
  border-color: #28a745;
}

.keyboard-action-enter:hover:not(:disabled) {
  background: #218838;
  border-color: #218838;
}

.keyboard-toggle {
  flex-shrink: 0;
  /* margin-bottom: 10px; */
}

.keyboard-toggle-btn {
  height: 40px;
  font-weight: 600;
  transition: all 0.2s ease;
  background-color: rgba(255, 255, 255, 0.7);
  border-color: rgba(0, 0, 0, 0.1);
  color: #6c757d;
  backdrop-filter: blur(4px);
}

.keyboard-toggle-btn:hover:not(.keyboard-active) {
  background-color: rgba(255, 255, 255, 0.85);
  border-color: rgba(0, 0, 0, 0.15);
  color: #5a6268;
}

.keyboard-toggle-btn.keyboard-active {
  background-color: rgba(233, 236, 239, 0.8);
  border-color: rgba(0, 0, 0, 0.12);
  color: #495057;
  backdrop-filter: blur(4px);
}

.keyboard-toggle-btn.keyboard-active:hover {
  background-color: rgba(222, 226, 230, 0.9);
  border-color: rgba(0, 0, 0, 0.15);
  color: #343a40;
}

/* Responsive: On smaller screens, reduce keyboard size or adjust layout */
@media (max-width: 768px) {
  .cart-section {
    /* When keyboard is shown, ensure cart items still have minimum space */
    min-height: 0;
  }

  .cart-items {
    /* Minimum height to ensure some items are visible even when keyboard is shown */
    min-height: 150px;
  }

  .virtual-keyboard {
    /* Smaller keyboard on mobile */
    padding: 8px 10px;
  }

  .keyboard-grid {
    gap: 6px;
  }

  .keyboard-key {
    min-height: 45px;
    height: 45px;
    font-size: 1.1rem;
  }

  .keyboard-action-btn {
    min-height: 40px;
    font-size: 0.9rem;
  }

  .cart-item-breakdown {
    font-size: 0.7rem;
    padding: 6px;
  }

  .breakdown-label {
    min-width: 60px;
    font-size: 0.7rem;
  }

  .breakdown-value {
    font-size: 0.7rem;
    padding: 2px 6px;
  }
}
</style>

<style>
body.pos-no-scroll {
  overflow: hidden;
}

/* Make Close Session Modal full screen */
#close-session-modal___BV_modal_outer_ .modal-dialog {
  max-width: 95vw;
  width: 95vw;
  margin: 1rem auto;
  height: calc(100vh - 2rem);
  max-height: calc(100vh - 2rem);
}

#close-session-modal___BV_modal_outer_ .modal-content {
  height: 100%;
  display: flex;
  flex-direction: column;
}

#close-session-modal___BV_modal_outer_ .modal-body {
  flex: 1;
  overflow-y: auto;
}

/* Make Pending Tickets Modal full screen */
#pending-tickets-modal___BV_modal_outer_ .modal-dialog {
  max-width: 95vw;
  width: 95vw;
  margin: 1rem auto;
  height: calc(100vh - 2rem);
  max-height: calc(100vh - 2rem);
}

#pending-tickets-modal___BV_modal_outer_ .modal-content {
  height: 100%;
  display: flex;
  flex-direction: column;
}

#pending-tickets-modal___BV_modal_outer_ .modal-body {
  flex: 1;
  overflow-y: auto;
}
</style>
