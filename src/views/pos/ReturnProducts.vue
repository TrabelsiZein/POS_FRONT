<template>
  <div class="return-products-container">
    <div class="page-header">
      <h2 class="mb-0">{{ $t('pos.returnProducts.title') }}</h2>
      <b-button variant="outline-secondary" @click="goBack" :disabled="loading">
        {{ $t('pos.returnProducts.backToPos') }}
      </b-button>
    </div>

    <!-- Ticket Search -->
    <b-card class="mb-4">
      <h5 class="mb-3">{{ $t('pos.returnProducts.enterTicketNumber') }}</h5>
      <b-row>
        <b-col cols="12" md="6">
          <b-input-group>
            <b-form-input v-model="ticketNumber" :placeholder="$t('pos.returnProducts.ticketNumberPlaceholder')" @keyup.enter="loadTicket"
              :disabled="loading" ref="ticketInput" />
            <b-input-group-append>
              <b-button variant="primary" @click="loadTicket" :disabled="loading || !ticketNumber">
                <b-spinner v-if="loading" small class="mr-1" />
                <feather-icon v-else icon="SearchIcon"/>
                {{ $t('pos.returnProducts.loadTicket') }}
              </b-button>
            </b-input-group-append>
          </b-input-group>
        </b-col>
      </b-row>
    </b-card>

    <!-- Ticket Details -->
    <b-card v-if="ticketData" class="mb-4 ticket-details-card">
      <div class="d-flex align-items-center mb-3">
        <feather-icon icon="FileTextIcon" size="20" class="mr-2 text-primary" />
        <h5 class="mb-0">{{ $t('pos.returnProducts.ticketDetails') }}</h5>
      </div>
      <b-row>
        <b-col cols="12" md="6">
          <div class="detail-item">
            <strong class="detail-label">{{ $t('pos.returnProducts.ticketNumber') }}</strong>
            <span class="detail-value">{{ ticketData.ticket.salesNumber }}</span>
          </div>
          <div class="detail-item">
            <strong class="detail-label">{{ $t('pos.returnProducts.date') }}</strong>
            <span class="detail-value">{{ formatDate(ticketData.ticket.salesDate) }}</span>
          </div>
          <div class="detail-item" v-if="ticketData.ticket.customer">
            <strong class="detail-label">{{ $t('pos.returnProducts.customer') }}</strong>
            <span class="detail-value">{{ ticketData.ticket.customer.name }}</span>
            <small class="text-muted ml-2">({{ ticketData.ticket.customer.customerCode }})</small>
          </div>
          <div class="detail-item" v-if="ticketData.ticket.createdByUser">
            <strong class="detail-label">{{ $t('pos.returnProducts.cashier') }}</strong>
            <span class="detail-value">{{ ticketData.ticket.createdByUser.fullName || ticketData.ticket.createdByUser.username }}</span>
          </div>
        </b-col>
        <b-col cols="12" md="6">
          <div class="ticket-summary">
            <div class="summary-item" v-if="ticketData.ticket.subtotal">
              <span class="summary-label">{{ $t('pos.returnProducts.subtotal') }}</span>
              <span class="summary-value">{{ formatPrice(ticketData.ticket.subtotal) }} TND</span>
            </div>
            <div class="summary-item" v-if="ticketData.ticket.taxAmount">
              <span class="summary-label">{{ $t('pos.returnProducts.taxVat') }}</span>
              <span class="summary-value">{{ formatPrice(ticketData.ticket.taxAmount) }} TND</span>
            </div>
            <div class="summary-item" v-if="ticketData.ticket.discountAmount">
              <span class="summary-label">{{ $t('pos.returnProducts.discount') }}</span>
              <span class="summary-value text-danger">-{{ formatPrice(ticketData.ticket.discountAmount) }} TND</span>
            </div>
            <div class="summary-item total-amount">
              <span class="summary-label"><strong>{{ $t('pos.returnProducts.totalAmountTtc') }}</strong></span>
              <span class="summary-value"><strong>{{ formatPrice(ticketData.ticket.totalAmount) }} TND</strong></span>
            </div>
          </div>
          <div class="detail-item mt-2" v-if="!ticketData.canReturn">
            <b-badge variant="danger">{{ $t('pos.returnProducts.tooOld') }}</b-badge>
          </div>
        </b-col>
      </b-row>
    </b-card>

    <!-- Return Items Selection -->
    <b-card v-if="ticketData && ticketData.canReturn" class="mb-4 return-items-card">
      <div class="d-flex align-items-center mb-3">
        <feather-icon icon="PackageIcon" size="20" class="mr-2 text-primary" />
        <h5 class="mb-0">{{ $t('pos.returnProducts.selectItemsToReturn') }}</h5>
      </div>
      <b-table :items="ticketData.salesLines" :fields="lineFields" striped hover responsive class="return-items-table">
        <template #cell(item)="row">
          <div>
            <strong>{{ row.item.item.name }}</strong>
            <div class="small text-muted">{{ row.item.item.itemCode }}</div>
          </div>
        </template>
        <template #cell(originalQty)="row">
          <span class="badge badge-secondary">{{ row.item.quantity }}</span>
        </template>
        <template #cell(remainingQty)="row">
          <span class="font-weight-bold" :class="getRemainingQtyClass(row.item)">
            {{ row.item.remainingQuantity !== undefined ? row.item.remainingQuantity : row.item.quantity }}
          </span>
          <div v-if="row.item.returnedQuantity > 0" class="small text-muted">
            {{ $t('pos.returnProducts.alreadyReturned', { quantity: row.item.returnedQuantity }) }}
          </div>
        </template>
        <template #cell(unitPrice)="row">
          <div>
            <strong>{{ formatPrice(row.item.unitPriceIncludingVat || row.item.unitPrice) }} TND</strong>
            <div class="small text-muted" v-if="row.item.vatPercent">
              <span class="text-info">{{ $t('pos.returnProducts.vatLabel', { percent: row.item.vatPercent }) }}</span>
            </div>
            <div class="small text-muted" v-if="row.item.unitPriceIncludingVat && row.item.unitPrice">
              <span class="text-muted">{{ $t('pos.returnProducts.htLabel', { amount: formatPrice(row.item.unitPrice) }) }}</span>
            </div>
          </div>
        </template>
        <template #cell(returnQty)="row">
          <b-form-input v-model.number="row.item.returnQuantity" type="number" :min="0"
            @input="onReturnQuantityChange(row.item)" @blur="onReturnQuantityBlur(row.item)"
            @keyup.enter="onReturnQuantityBlur(row.item)" :disabled="loading" style="width: 100px;"
            class="return-qty-input" />
        </template>
        <template #cell(returnAmount)="row">
          <div>
            <strong class="text-success">{{ formatPrice(getReturnAmount(row.item)) }} TND</strong>
            <div class="small text-muted" v-if="row.item.vatAmount && row.item.returnQuantity > 0">
              <span class="text-info">{{ $t('pos.returnProducts.vatAmount', { amount: formatPrice((row.item.vatAmount / row.item.quantity) * row.item.returnQuantity) }) }}</span>
            </div>
          </div>
        </template>
      </b-table>
    </b-card>

    <!-- Return Type Selection -->
    <b-card v-if="ticketData && ticketData.canReturn && hasReturnItems" class="mb-4">
      <h5 class="mb-3">{{ $t('pos.returnProducts.returnType') }}</h5>
      <b-form-group>
        <b-form-radio-group v-model="returnType" :options="returnTypeOptions" @change="onReturnTypeChange" />
      </b-form-group>
      <b-alert v-if="returnType === 'SIMPLE_RETURN' && !ticketData.isSimpleReturnEnabled" variant="warning" show>
        {{ $t('pos.returnProducts.simpleReturnNotEnabled') }}
      </b-alert>
    </b-card>

    <!-- Return Summary -->
    <b-card v-if="ticketData && ticketData.canReturn && hasReturnItems" class="mb-4 return-summary-card">
      <div class="d-flex align-items-center mb-3">
        <feather-icon icon="CalculatorIcon" size="20" class="mr-2 text-primary" />
        <h5 class="mb-0">{{ $t('pos.returnProducts.returnSummary') }}</h5>
      </div>
      <b-row>
        <b-col cols="12" md="6" offset-md="6">
          <div class="return-summary">
            <div class="summary-row">
              <span class="summary-label">{{ $t('pos.returnProducts.totalItems') }}</span>
              <span class="summary-value">{{ formatPrice(totalReturnAmountHT) }} TND</span>
            </div>
            <div class="summary-row" v-if="totalReturnVAT > 0">
              <span class="summary-label">{{ $t('pos.returnProducts.taxVat') }}</span>
              <span class="summary-value text-info">{{ formatPrice(totalReturnVAT) }} TND</span>
            </div>
            <div class="summary-row total-return">
              <span class="summary-label"><strong>{{ $t('pos.returnProducts.totalAmount') }}</strong></span>
              <span class="summary-value"><strong class="text-success">{{ formatPrice(totalReturnAmount) }} TND</strong></span>
            </div>
          </div>
        </b-col>
      </b-row>
    </b-card>

    <!-- Process Return Button -->
    <div v-if="ticketData && ticketData.canReturn && hasReturnItems" class="text-center">
      <b-button variant="success" size="lg" @click="processReturn" :disabled="loading || !canProcessReturn">
        <b-spinner v-if="loading" small class="mr-2" />
        <feather-icon v-else icon="CheckCircleIcon" size="18" class="mr-2" />
        {{ $t('pos.returnProducts.processReturn') }}
      </b-button>
    </div>

    <!-- Badge Scan Popup -->
    <BadgeScanPopup
      :show="showBadgeScanPopup"
      :required-permission="'MAKE_RETURN'"
      :session-id="currentSessionId"
      @badge-scanned="onBadgeScanned"
      @close="onBadgeScanClose"
    />
  </div>
</template>

<script>
import ToastificationContent from '@core/components/toastification/ToastificationContent.vue'
import ReceiptTemplate from '@/components/ReceiptTemplate.vue'
import BadgeScanPopup from '@/components/pos/BadgeScanPopup.vue'
import { checkCurrentUserPermission, getAlwaysShowBadgeScan, BADGE_PERMISSIONS } from '@/services/badgeService'

export default {
  name: 'ReturnProducts',
  components: {
    BadgeScanPopup
  },
  data() {
    return {
      ticketNumber: '',
      ticketData: null,
      returnType: 'RETURN_VOUCHER',
      loading: false,
      showBadgeScanPopup: false,
      badgeScanned: false,
      pendingReturnData: null
    }
  },
  computed: {
    lineFields() {
      return [
        { key: 'item', label: this.$t('pos.returnProducts.tableHeaders.item') },
        { key: 'originalQty', label: this.$t('pos.returnProducts.tableHeaders.purchasedQty'), thClass: 'text-center', tdClass: 'text-center' },
        { key: 'remainingQty', label: this.$t('pos.returnProducts.tableHeaders.remainingQty'), thClass: 'text-center', tdClass: 'text-center' },
        { key: 'unitPrice', label: this.$t('pos.returnProducts.tableHeaders.unitPrice'), thClass: 'text-right', tdClass: 'text-right' },
        { key: 'returnQty', label: this.$t('pos.returnProducts.tableHeaders.returnQty'), thClass: 'text-center', tdClass: 'text-center' },
        { key: 'returnAmount', label: this.$t('pos.returnProducts.tableHeaders.returnAmount'), thClass: 'text-right', tdClass: 'text-right' }
      ]
    },
    returnTypeOptions() {
      const options = []
      if (this.ticketData && this.ticketData.isSimpleReturnEnabled) {
        options.push({ value: 'SIMPLE_RETURN', text: this.$t('pos.returnProducts.simpleReturn') })
      }
      options.push({ value: 'RETURN_VOUCHER', text: this.$t('pos.returnProducts.returnVoucher') })
      return options
    },
    hasReturnItems() {
      if (!this.ticketData || !this.ticketData.salesLines) return false
      const hasItems = this.ticketData.salesLines.some(line => {
        const qty = parseFloat(line.returnQuantity)
        if (isNaN(qty) || qty === null || qty === undefined) {
          return false
        }
        const roundedQty = Math.round(qty)
        return roundedQty > 0 && roundedQty <= line.quantity
      })
      return hasItems
    },
    totalReturnAmount() {
      if (!this.ticketData || !this.ticketData.salesLines) return 0
      return this.ticketData.salesLines.reduce((total, line) => {
        let returnQty = parseFloat(line.returnQuantity) || 0
        // Cap at remaining quantity for calculation
        const maxReturnable = line.remainingQuantity !== undefined ? line.remainingQuantity : line.quantity
        if (returnQty > maxReturnable) {
          returnQty = maxReturnable
        }
        if (returnQty < 0) {
          returnQty = 0
        }
        returnQty = Math.round(returnQty)
        // Use TTC amount (lineTotalIncludingVat / quantity * returnQty)
        const unitPriceTTC = line.unitPriceIncludingVat || line.unitPrice
        return total + (returnQty * unitPriceTTC)
      }, 0)
    },
    totalReturnAmountHT() {
      if (!this.ticketData || !this.ticketData.salesLines) return 0
      return this.ticketData.salesLines.reduce((total, line) => {
        let returnQty = parseFloat(line.returnQuantity) || 0
        const maxReturnable = line.remainingQuantity !== undefined ? line.remainingQuantity : line.quantity
        if (returnQty > maxReturnable) {
          returnQty = maxReturnable
        }
        if (returnQty < 0) {
          returnQty = 0
        }
        returnQty = Math.round(returnQty)
        // Calculate HT: (lineTotal / quantity) * returnQty
        const unitPriceHT = line.unitPrice || 0
        return total + (returnQty * unitPriceHT)
      }, 0)
    },
    totalReturnVAT() {
      return this.totalReturnAmount - this.totalReturnAmountHT
    },
    canProcessReturn() {
      if (!this.hasReturnItems) return false
      if (this.returnType === 'SIMPLE_RETURN' && !this.ticketData.isSimpleReturnEnabled) return false
      return true
    },
    currentSessionId() {
      const session = this.$store.state.pos?.currentSession
      return session ? session.id : null
    }
  },
  mounted() {
    this.$nextTick(() => {
      if (this.$refs.ticketInput) {
        this.$refs.ticketInput.focus()
      }
    })
  },
  methods: {
    async loadTicket() {
      if (!this.ticketNumber.trim()) {
        this.$toast({
          component: ToastificationContent,
          props: {
            title: this.$t('common.error'),
            icon: 'XIcon',
            text: this.$t('pos.returnProducts.errors.enterTicketNumber'),
            variant: 'danger'
          }
        })
        return
      }

      this.loading = true
      try {
        const response = await this.$http.get('/return-header/ticket-details', {
          params: { ticketNumber: this.ticketNumber.trim() }
        })

        if (response.status === 200) {
          this.ticketData = response.data

          // Initialize return quantities using Vue.set to ensure reactivity
          // The backend now returns only items with remainingQuantity > 0
          if (this.ticketData.salesLines) {
            this.ticketData.salesLines.forEach(line => {
              this.$set(line, 'returnQuantity', 0)
              // Ensure remainingQuantity is set (should come from backend)
              if (line.remainingQuantity === undefined) {
                // Fallback: if backend doesn't provide it, use original quantity
                this.$set(line, 'remainingQuantity', line.quantity)
              }
            })
          }

          // Set default return type based on configuration
          if (!this.ticketData.isSimpleReturnEnabled) {
            this.returnType = 'RETURN_VOUCHER'
          }
        }
      } catch (error) {
        console.error('Error loading ticket:', error)
        let errorMessage = this.$t('pos.returnProducts.errors.failedToLoadTicket')
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
        this.ticketData = null
      } finally {
        this.loading = false
      }
    },
    onReturnQuantityChange(line) {
      // Only handle NaN or invalid values, don't limit max value
      let qty = parseFloat(line.returnQuantity)

      // Handle NaN or invalid values
      if (isNaN(qty) || qty === null || qty === undefined) {
        qty = 0
      }

      // Ensure quantity is not negative
      if (qty < 0) {
        qty = 0
      }

      // Round to integer
      qty = Math.round(qty)

      // Use Vue.set to ensure reactivity
      this.$set(line, 'returnQuantity', qty)
    },
    onReturnQuantityBlur(line) {
      // Only handle NaN or invalid values, don't limit max value
      let qty = parseFloat(line.returnQuantity)

      if (isNaN(qty) || qty === null || qty === undefined) {
        qty = 0
      }

      // Ensure quantity is not negative
      if (qty < 0) {
        qty = 0
      }

      // Round to integer
      qty = Math.round(qty)
      this.$set(line, 'returnQuantity', qty)
    },
    getReturnAmount(line) {
      let returnQty = parseFloat(line.returnQuantity) || 0
      // Get the maximum returnable quantity (remaining quantity)
      const maxReturnable = line.remainingQuantity !== undefined ? line.remainingQuantity : line.quantity
      // Cap at remaining returnable quantity
      if (returnQty > maxReturnable) {
        returnQty = maxReturnable
      }
      if (returnQty < 0) {
        returnQty = 0
      }
      returnQty = Math.round(returnQty)
      // Use TTC amount (unitPriceIncludingVat)
      const unitPriceTTC = line.unitPriceIncludingVat || line.unitPrice
      return returnQty * unitPriceTTC
    },
    getRemainingQtyClass(line) {
      const remaining = line.remainingQuantity !== undefined ? line.remainingQuantity : line.quantity
      if (remaining === 0) {
        return 'text-danger' // No items remaining to return
      } else if (remaining < line.quantity) {
        return 'text-warning' // Some items already returned
      }
      return 'text-success' // All items available
    },
    onReturnTypeChange() {
      // Handle return type change if needed
    },
    async processReturn() {
      if (!this.canProcessReturn) return

      // Check if badge scan is required
      const badgeRequired = await this.checkBadgeRequirement()
      if (badgeRequired && !this.badgeScanned) {
        // Store return data for after badge scan
        this.pendingReturnData = {
          returnLines: this.prepareReturnLines(),
          returnType: this.returnType
        }
        this.showBadgeScanPopup = true
        return
      }

      // Proceed with return processing
      await this.executeReturn()
    },
    prepareReturnLines() {
      const returnLines = []
      for (const line of this.ticketData.salesLines) {
        let returnQty = parseFloat(line.returnQuantity) || 0
        returnQty = Math.round(returnQty)
        if (returnQty > 0) {
          returnLines.push({
            salesLineId: line.id,
            quantity: returnQty
          })
        }
      }
      return returnLines
    },
    async checkBadgeRequirement() {
      try {
        const alwaysShow = await getAlwaysShowBadgeScan(this.$http)
        if (alwaysShow) {
          return true
        }
        const permissionCheck = await checkCurrentUserPermission(BADGE_PERMISSIONS.MAKE_RETURN, this.$http)
        // Return true if badge scan is required (user doesn't have valid permission)
        return !permissionCheck.hasValidPermission
      } catch (error) {
        console.error('Error checking badge requirement:', error)
        return true // On error, require badge scan
      }
    },
    onBadgeScanned() {
      this.badgeScanned = true
      this.showBadgeScanPopup = false
      // Execute the pending return
      if (this.pendingReturnData) {
        this.executeReturn()
      }
    },
    onBadgeScanClose() {
      this.showBadgeScanPopup = false
      this.pendingReturnData = null
    },
    async executeReturn() {
      if (!this.canProcessReturn) return

      // Use pending return data if available, otherwise prepare from form
      let returnLines = []
      let returnType = this.returnType

      if (this.pendingReturnData) {
        returnLines = this.pendingReturnData.returnLines
        returnType = this.pendingReturnData.returnType
        this.pendingReturnData = null
      } else {
        // Frontend validation before calling backend API
        const validationErrors = []

        for (const line of this.ticketData.salesLines) {
          let returnQty = parseFloat(line.returnQuantity) || 0

          // Validate return quantity
          if (isNaN(returnQty)) {
            validationErrors.push(this.$t('pos.returnProducts.errors.invalidReturnQuantity', { itemName: line.item.name }))
            continue
          }

          // Round to integer
          returnQty = Math.round(returnQty)

          // Validate range
          if (returnQty < 0) {
            validationErrors.push(this.$t('pos.returnProducts.errors.returnQuantityNegative', { itemName: line.item.name }))
            continue
          }

          // Get the maximum returnable quantity (remaining quantity)
          const maxReturnable = line.remainingQuantity !== undefined ? line.remainingQuantity : line.quantity
          
          if (returnQty > maxReturnable) {
            validationErrors.push(this.$t('pos.returnProducts.errors.returnQuantityExceeded', { itemName: line.item.name, returnQty, maxReturnable }))
            continue
          }

          // Only add to return lines if quantity is greater than 0
          if (returnQty > 0) {
            returnLines.push({
              salesLineId: line.id,
              quantity: returnQty
            })
          }
        }

        // Show validation errors if any
        if (validationErrors.length > 0) {
          this.$toast({
            component: ToastificationContent,
            props: {
              title: this.$t('pos.returnProducts.errors.validationError'),
              icon: 'XIcon',
              text: validationErrors.join('. '),
              variant: 'danger'
            }
          })
          return
        }
      }

      if (returnLines.length === 0) {
        this.$toast({
          component: ToastificationContent,
          props: {
            title: this.$t('common.error'),
            icon: 'XIcon',
            text: this.$t('pos.returnProducts.errors.selectAtLeastOne'),
            variant: 'danger'
          }
        })
        return
      }

      this.loading = true
      try {
        const request = {
          ticketNumber: this.ticketNumber.trim(),
          returnType: returnType,
          returnLines: returnLines,
          notes: ''
        }

        const response = await this.$http.post('/return-header/process-return', request)

        if (response.status === 200) {
          this.$toast({
            component: ToastificationContent,
            props: {
              title: this.$t('common.success'),
              icon: 'CheckCircleIcon',
              text: this.$t('pos.returnProducts.success.returnProcessed', { returnNumber: response.data.returnNumber }),
              variant: 'success'
            }
          })


          // If return voucher was created, show voucher info and print
          if (this.returnType === 'RETURN_VOUCHER' && response.data.returnVoucher) {
            this.$toast({
              component: ToastificationContent,
              props: {
                title: this.$t('pos.returnProducts.success.voucherCreated'),
                icon: 'FileTextIcon',
                text: this.$t('pos.returnProducts.success.voucherInfo', { 
                  voucherNumber: response.data.returnVoucher.voucherNumber, 
                  amount: this.formatPrice(response.data.returnVoucher.voucherAmount) 
                }),
                variant: 'info'
              }
            })

            // Print the voucher as a ticket
            this.printVoucherReceipt(response.data)
          }

          // Reset form
          setTimeout(() => {
            this.ticketNumber = ''
            this.ticketData = null
            this.returnType = 'RETURN_VOUCHER'
            if (this.$refs.ticketInput) {
              this.$refs.ticketInput.focus()
            }
          }, 2000)
        }
      } catch (error) {
        console.error('Error processing return:', error)
        let errorMessage = this.$t('pos.returnProducts.errors.failedToProcess')
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
      } finally {
        this.loading = false
      }
    },
    formatDate(dateStr) {
      if (!dateStr) return '-'
      const date = new Date(dateStr)
      return date.toLocaleString()
    },
    formatPrice(price) {
      if (!price) return '0.00'
      return parseFloat(price).toFixed(2)
    },
    goBack() {
      this.$router.push({ name: 'pos-item-selection' })
    },
    async printVoucherReceipt(returnData) {
      if (!returnData || !returnData.returnVoucher) {
        console.error('No voucher data to print')
        return
      }

      // Prepare voucher data in the same format as sale data for ReceiptTemplate
      // The backend returns returnLines directly in the response, not nested
      const returnLines = returnData.returnLines || []

      const voucherData = {
        salesNumber: returnData.returnVoucher.voucherNumber,
        salesDate: returnData.returnVoucher.voucherDate,
        totalAmount: returnData.returnVoucher.voucherAmount,
        subtotal: returnData.returnVoucher.voucherAmount,
        taxAmount: 0,
        discountAmount: 0,
        paidAmount: returnData.returnVoucher.voucherAmount,
        changeAmount: 0,
        notes: this.$t('pos.returnProducts.print.voucherTitle', { ticketNumber: returnData.originalSalesHeader?.salesNumber || 'N/A' }),
        createdByUser: {
          fullName: 'System',
          username: 'System'
        },
        cashierSession: null,
        customer: returnData.returnVoucher.customerName ? {
          name: returnData.returnVoucher.customerName
        } : null,
        salesLines: returnLines.map(line => ({
          item: {
            name: line.item?.name || this.$t('pos.returnProducts.print.returnItem'),
            itemCode: line.item?.itemCode || 'N/A'
          },
          quantity: line.quantity || 0,
          lineTotal: (line.unitPrice || 0) * (line.quantity || 0),
          unitPrice: line.unitPrice || 0
        })),
        paymentHeaders: [{
          paymentMethod: {
            name: 'Return Voucher'
          },
          totalAmount: returnData.returnVoucher.voucherAmount,
          paymentReference: returnData.returnVoucher.voucherNumber
        }]
      }

      // Add voucher-specific information
      voucherData.isVoucher = true
      voucherData.voucherInfo = {
        voucherNumber: returnData.returnVoucher.voucherNumber,
        expiryDate: returnData.returnVoucher.expiryDate,
        originalTicket: returnData.originalSalesHeader?.salesNumber || 'N/A',
        returnNumber: returnData.returnNumber
      }

      console.log('Printing voucher receipt with data:', voucherData)

      // Use Vue to create component instance
      const Vue = this.$root.constructor || this.$options._base
      const ReceiptComponent = Vue.extend(ReceiptTemplate)

      // Create component instance
      const instance = new ReceiptComponent({
        parent: this,
        propsData: {
          saleData: voucherData,
          isVoucher: true
        }
      })

      // Mount the component
      instance.$mount()

      // Create a new window for printing
      const printWindow = window.open('', '_blank')
      if (!printWindow) {
        this.$toast({
          component: ToastificationContent,
          props: {
            title: this.$t('pos.returnProducts.print.printError'),
            icon: 'XIcon',
            text: this.$t('pos.returnProducts.print.allowPopups'),
            variant: 'warning'
          }
        })
        return
      }

      // Wait for component to mount and generate barcode
      await this.$nextTick()
      await new Promise(resolve => setTimeout(resolve, 200))
      
      // Write receipt HTML to new window
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Return Voucher - ${returnData.returnVoucher.voucherNumber}</title>
          <style>
            @page {
              size: 80mm auto;
              margin: 0;
            }
            body {
              margin: 0;
              padding: 0 0 10mm 0;
              font-family: 'Courier New', monospace;
              font-size: 12px;
              line-height: 1.4;
              background: white;
              color: #000000 !important;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .receipt-template {
              width: 100%;
              max-width: 80mm;
              color: #000000 !important;
            }
            .receipt-template * {
              color: #000000 !important;
              font-weight: 500 !important;
            }
            .receipt-template .receipt-row .value,
            .receipt-template .receipt-row.total,
            .receipt-template .receipt-row.header-row,
            .receipt-template .receipt-section-header,
            .receipt-template .receipt-header h2,
            .receipt-template .receipt-header h3,
            .receipt-template b,
            .receipt-template strong {
              font-weight: 700 !important;
            }
            .receipt-template .receipt-divider,
            .receipt-template .item-vat {
              color: #000000 !important;
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
            .item-vat { font-size: 10px; color: #000000 !important; font-weight: 500 !important; margin-left: 10px; margin-bottom: 6px; }
            .receipt-section-header { font-weight: bold; text-align: center; margin: 8px 0; }
            .receipt-footer { margin-top: 20px; text-align: center; font-size: 11px; }
            .receipt-item { margin-bottom: 8px; }
            .payment-entry { margin-bottom: 8px; }
            .voucher-badge {
              background: #007bff;
              color: white;
              font-weight: bold;
              text-align: center;
              padding: 8px;
              margin: 10px 0;
              font-size: 14px;
              border: 2px solid #000;
            }
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
        }, 1000)
      }, 500)
    }
  }
}
</script>

<style scoped>
.return-products-container {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.detail-item {
  margin-bottom: 12px;
  display: flex;
  align-items: baseline;
}

.detail-label {
  min-width: 120px;
  color: #6c757d;
}

.detail-value {
  color: #212529;
  font-weight: 500;
}

.ticket-summary {
  background: #f8f9fa;
  padding: 15px;
  border-radius: 5px;
  border: 1px solid #dee2e6;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  padding: 6px 0;
  border-bottom: 1px solid #e9ecef;
}

.summary-item:last-child {
  border-bottom: none;
}

.summary-item.total-amount {
  border-top: 2px solid #28a745;
  border-bottom: 2px solid #28a745;
  margin-top: 8px;
  padding-top: 10px;
  padding-bottom: 10px;
  font-size: 1.1rem;
}

.summary-label {
  color: #6c757d;
}

.summary-value {
  font-weight: 600;
  color: #212529;
}

.return-summary {
  background: #f8f9fa;
  padding: 15px;
  border-radius: 5px;
  border: 1px solid #dee2e6;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid #e0e0e0;
}

.summary-row.total-return {
  border-top: 2px solid #28a745;
  border-bottom: 2px solid #28a745;
  margin-top: 10px;
  padding-top: 10px;
  padding-bottom: 10px;
  font-size: 1.1rem;
}

.ticket-details-card,
.return-items-card,
.return-summary-card {
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.return-items-table {
  font-size: 0.95rem;
}

.return-qty-input {
  text-align: center;
}
</style>
