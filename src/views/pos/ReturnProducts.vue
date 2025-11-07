<template>
  <div class="return-products-container">
    <div class="page-header">
      <h2 class="mb-0">Return Products</h2>
      <b-button variant="outline-secondary" @click="goBack" :disabled="loading">
        Back to POS
      </b-button>
    </div>

    <!-- Ticket Search -->
    <b-card class="mb-4">
      <h5 class="mb-3">Enter Ticket Number</h5>
      <b-row>
        <b-col cols="12" md="6">
          <b-input-group>
            <b-form-input v-model="ticketNumber" placeholder="Enter ticket number..." @keyup.enter="loadTicket"
              :disabled="loading" ref="ticketInput" />
            <b-input-group-append>
              <b-button variant="primary" @click="loadTicket" :disabled="loading || !ticketNumber">
                <b-spinner v-if="loading" small class="mr-1" />
                <feather-icon v-else icon="SearchIcon"/>
                Load Ticket
              </b-button>
            </b-input-group-append>
          </b-input-group>
        </b-col>
      </b-row>
    </b-card>

    <!-- Ticket Details -->
    <b-card v-if="ticketData" class="mb-4">
      <h5 class="mb-3">Ticket Details</h5>
      <b-row>
        <b-col cols="12" md="6">
          <div class="detail-item">
            <strong>Ticket Number:</strong> {{ ticketData.ticket.salesNumber }}
          </div>
          <div class="detail-item">
            <strong>Date:</strong> {{ formatDate(ticketData.ticket.salesDate) }}
          </div>
          <div class="detail-item" v-if="ticketData.ticket.customer">
            <strong>Customer:</strong> {{ ticketData.ticket.customer.name }}
          </div>
        </b-col>
        <b-col cols="12" md="6">
          <div class="detail-item">
            <strong>Total Amount:</strong> ${{ formatPrice(ticketData.ticket.totalAmount) }}
          </div>
          <div class="detail-item" v-if="!ticketData.canReturn">
            <b-badge variant="danger">This ticket is too old to be returned</b-badge>
          </div>
        </b-col>
      </b-row>
    </b-card>

    <!-- Return Items Selection -->
    <b-card v-if="ticketData && ticketData.canReturn" class="mb-4">
      <h5 class="mb-3">Select Items to Return</h5>
      <b-table :items="ticketData.salesLines" :fields="lineFields" striped hover responsive>
        <template #cell(item)="row">
          <div>
            <strong>{{ row.item.item.name }}</strong>
            <div class="small text-muted">{{ row.item.item.itemCode }}</div>
          </div>
        </template>
        <template #cell(originalQty)="row">
          {{ row.item.quantity }}
        </template>
        <template #cell(remainingQty)="row">
          <span class="font-weight-bold" :class="getRemainingQtyClass(row.item)">
            {{ row.item.remainingQuantity !== undefined ? row.item.remainingQuantity : row.item.quantity }}
          </span>
          <div v-if="row.item.returnedQuantity > 0" class="small text-muted">
            ({{ row.item.returnedQuantity }} returned)
          </div>
        </template>
        <template #cell(unitPrice)="row">
          ${{ formatPrice(row.item.unitPrice) }}
        </template>
        <template #cell(returnQty)="row">
          <b-form-input v-model.number="row.item.returnQuantity" type="number" :min="0" :max="row.item.remainingQuantity || row.item.quantity"
            @input="onReturnQuantityChange(row.item)" @blur="onReturnQuantityBlur(row.item)"
            @keyup.enter="onReturnQuantityBlur(row.item)" :disabled="loading" style="width: 100px;"
            :state="getReturnQtyState(row.item)" />
          <b-form-invalid-feedback v-if="row.item.returnQuantity > (row.item.remainingQuantity || row.item.quantity)" :state="false">
            Cannot exceed {{ row.item.remainingQuantity !== undefined ? row.item.remainingQuantity : row.item.quantity }}
          </b-form-invalid-feedback>
        </template>
        <template #cell(returnAmount)="row">
          <strong>${{ formatPrice(getReturnAmount(row.item)) }}</strong>
        </template>
      </b-table>
    </b-card>

    <!-- Return Type Selection -->
    <b-card v-if="ticketData && ticketData.canReturn && hasReturnItems" class="mb-4">
      <h5 class="mb-3">Return Type</h5>
      <b-form-group>
        <b-form-radio-group v-model="returnType" :options="returnTypeOptions" @change="onReturnTypeChange" />
      </b-form-group>
      <b-alert v-if="returnType === 'SIMPLE_RETURN' && !ticketData.isSimpleReturnEnabled" variant="warning" show>
        Simple return is not enabled. Please select Return Voucher.
      </b-alert>
    </b-card>

    <!-- Return Summary -->
    <b-card v-if="ticketData && ticketData.canReturn && hasReturnItems" class="mb-4">
      <h5 class="mb-3">Return Summary</h5>
      <b-row>
        <b-col cols="12" md="6" offset-md="6">
          <div class="summary-row">
            <span>Total Return Amount:</span>
            <span class="font-weight-bold">${{ formatPrice(totalReturnAmount) }}</span>
          </div>
        </b-col>
      </b-row>
    </b-card>

    <!-- Process Return Button -->
    <div v-if="ticketData && ticketData.canReturn && hasReturnItems" class="text-center">
      <b-button variant="success" size="lg" @click="processReturn" :disabled="loading || !canProcessReturn">
        <b-spinner v-if="loading" small class="mr-2" />
        <feather-icon v-else icon="CheckCircleIcon" size="18" class="mr-2" />
        Process Return
      </b-button>
    </div>
  </div>
</template>

<script>
import ToastificationContent from '@core/components/toastification/ToastificationContent.vue'
import ReceiptTemplate from '@/components/ReceiptTemplate.vue'
import JsBarcode from 'jsbarcode'

export default {
  name: 'ReturnProducts',
  data() {
    return {
      ticketNumber: '',
      ticketData: null,
      returnType: 'RETURN_VOUCHER',
      loading: false,
      lineFields: [
        { key: 'item', label: 'Item' },
        { key: 'originalQty', label: 'Purchased Qty' },
        { key: 'remainingQty', label: 'Remaining Qty' },
        { key: 'unitPrice', label: 'Unit Price' },
        { key: 'returnQty', label: 'Return Qty' },
        { key: 'returnAmount', label: 'Return Amount' }
      ]
    }
  },
  computed: {
    returnTypeOptions() {
      const options = []
      if (this.ticketData && this.ticketData.isSimpleReturnEnabled) {
        options.push({ value: 'SIMPLE_RETURN', text: 'Simple Return (Cash Refund)' })
      }
      options.push({ value: 'RETURN_VOUCHER', text: 'Return Voucher' })
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
        // Cap at purchased quantity for calculation
        if (returnQty > line.quantity) {
          returnQty = line.quantity
        }
        if (returnQty < 0) {
          returnQty = 0
        }
        returnQty = Math.round(returnQty)
        return total + (returnQty * line.unitPrice)
      }, 0)
    },
    canProcessReturn() {
      if (!this.hasReturnItems) return false
      if (this.returnType === 'SIMPLE_RETURN' && !this.ticketData.isSimpleReturnEnabled) return false
      return true
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
            title: 'Error',
            icon: 'XIcon',
            text: 'Please enter a ticket number',
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
        let errorMessage = 'Failed to load ticket. Please check the ticket number.'
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
        this.ticketData = null
      } finally {
        this.loading = false
      }
    },
    onReturnQuantityChange(line) {
      // Validate and fix quantity in real-time
      let qty = parseFloat(line.returnQuantity)

      // Handle NaN or invalid values
      if (isNaN(qty) || qty === null || qty === undefined) {
        qty = 0
      }

      // Get the maximum returnable quantity (remaining quantity)
      const maxReturnable = line.remainingQuantity !== undefined ? line.remainingQuantity : line.quantity

      // Ensure quantity doesn't exceed remaining returnable quantity
      if (qty > maxReturnable) {
        qty = maxReturnable
        // Show warning
        this.$nextTick(() => {
          this.$toast({
            component: ToastificationContent,
            props: {
              title: 'Validation',
              icon: 'AlertCircleIcon',
              text: `Return quantity cannot exceed remaining quantity (${maxReturnable})`,
              variant: 'warning'
            }
          })
        })
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
      // Final validation on blur/enter
      let qty = parseFloat(line.returnQuantity)

      if (isNaN(qty) || qty === null || qty === undefined) {
        qty = 0
      }

      // Get the maximum returnable quantity (remaining quantity)
      const maxReturnable = line.remainingQuantity !== undefined ? line.remainingQuantity : line.quantity

      // Cap at remaining returnable quantity
      if (qty > maxReturnable) {
        qty = maxReturnable
      }

      if (qty < 0) {
        qty = 0
      }

      qty = Math.round(qty)
      this.$set(line, 'returnQuantity', qty)
    },
    getReturnQtyState(line) {
      if (line.returnQuantity === null || line.returnQuantity === undefined) {
        return null
      }
      const qty = parseFloat(line.returnQuantity)
      if (isNaN(qty)) {
        return false
      }
      // Get the maximum returnable quantity (remaining quantity)
      const maxReturnable = line.remainingQuantity !== undefined ? line.remainingQuantity : line.quantity
      if (qty < 0 || qty > maxReturnable) {
        return false
      }
      return null
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
      return returnQty * line.unitPrice
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

      // Frontend validation before calling backend API
      const validationErrors = []
      const returnLines = []

      for (const line of this.ticketData.salesLines) {
        let returnQty = parseFloat(line.returnQuantity) || 0

        // Validate return quantity
        if (isNaN(returnQty)) {
          validationErrors.push(`Invalid return quantity for ${line.item.name}`)
          continue
        }

        // Round to integer
        returnQty = Math.round(returnQty)

        // Validate range
        if (returnQty < 0) {
          validationErrors.push(`Return quantity for ${line.item.name} cannot be negative`)
          continue
        }

        // Get the maximum returnable quantity (remaining quantity)
        const maxReturnable = line.remainingQuantity !== undefined ? line.remainingQuantity : line.quantity
        
        if (returnQty > maxReturnable) {
          validationErrors.push(`Return quantity for ${line.item.name} (${returnQty}) cannot exceed remaining quantity (${maxReturnable})`)
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
            title: 'Validation Error',
            icon: 'XIcon',
            text: validationErrors.join('. '),
            variant: 'danger'
          }
        })
        return
      }

      if (returnLines.length === 0) {
        this.$toast({
          component: ToastificationContent,
          props: {
            title: 'Error',
            icon: 'XIcon',
            text: 'Please select at least one item to return',
            variant: 'danger'
          }
        })
        return
      }

      this.loading = true
      try {
        const request = {
          ticketNumber: this.ticketNumber.trim(),
          returnType: this.returnType,
          returnLines: returnLines,
          notes: ''
        }

        const response = await this.$http.post('/return-header/process-return', request)

        if (response.status === 200) {
          this.$toast({
            component: ToastificationContent,
            props: {
              title: 'Success',
              icon: 'CheckCircleIcon',
              text: `Return ${response.data.returnNumber} processed successfully!`,
              variant: 'success'
            }
          })


          // If return voucher was created, show voucher info and print
          if (this.returnType === 'RETURN_VOUCHER' && response.data.returnVoucher) {
            this.$toast({
              component: ToastificationContent,
              props: {
                title: 'Return Voucher Created',
                icon: 'FileTextIcon',
                text: `Voucher Number: ${response.data.returnVoucher.voucherNumber}, Amount: $${this.formatPrice(response.data.returnVoucher.voucherAmount)}`,
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
        let errorMessage = 'Failed to process return. Please try again.'
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
        notes: `Return Voucher - Original Ticket: ${returnData.originalSalesHeader?.salesNumber || 'N/A'}`,
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
            name: line.item?.name || 'Return Item',
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
            title: 'Print Error',
            icon: 'XIcon',
            text: 'Please allow popups to print vouchers',
            variant: 'warning'
          }
        })
        return
      }

      // Wait for component to mount and generate barcode
      await this.$nextTick()
      await new Promise(resolve => setTimeout(resolve, 200))
      
      // Generate barcode in the component if voucher_number exists
      const barcodeValue = returnData.returnVoucher.voucherNumber || null
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
          <title>Return Voucher - ${returnData.returnVoucher.voucherNumber}</title>
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
  margin-bottom: 10px;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid #e0e0e0;
}

.summary-row.total {
  border-top: 2px solid #28a745;
  border-bottom: 2px solid #28a745;
  margin-top: 10px;
  padding-top: 10px;
  font-size: 1.1rem;
}
</style>
