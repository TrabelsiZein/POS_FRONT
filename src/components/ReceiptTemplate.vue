<template>
  <div id="receipt-template" class="receipt-template">
    <div v-if="!saleData" class="text-center p-4">
      <p>No sale data available</p>
    </div>
    <div v-else class="receipt-content">
      <!-- Header -->
      <div class="receipt-header">
        <h2 class="text-center">POS SYSTEM</h2>
        <div class="text-center receipt-divider">━━━━━━━━━━━━━━━━━━━━</div>
        <h3 v-if="isVoucher" class="text-center voucher-title">RETURN VOUCHER</h3>
        <h3 v-else class="text-center">SALES RECEIPT</h3>
        <div v-if="isDuplicate && !isVoucher" class="duplicate-badge">
          ═══ DUPLICATE ═══
        </div>
        <div v-if="isVoucher && saleData.voucherInfo" class="voucher-badge">
          VOUCHER #{{ saleData.voucherInfo.voucherNumber }}
        </div>
        <div class="text-center receipt-divider">━━━━━━━━━━━━━━━━━━━━</div>
      </div>

      <!-- Sale Information -->
      <div v-if="saleData" class="receipt-info">
        <div class="receipt-row">
          <span class="label">{{ isVoucher ? 'Voucher Number:' : 'Sale Number:' }}</span>
          <span class="value">{{ saleData.salesNumber || 'N/A' }}</span>
        </div>
        <div v-if="isVoucher && saleData.voucherInfo && saleData.voucherInfo.originalTicket" class="receipt-row">
          <span class="label">Original Ticket:</span>
          <span class="value">{{ saleData.voucherInfo.originalTicket }}</span>
        </div>
        <div class="receipt-row">
          <span class="label">Date:</span>
          <span class="value">{{ formatDate(saleData.salesDate) }}</span>
        </div>
        <div v-if="isVoucher && saleData.voucherInfo && saleData.voucherInfo.expiryDate" class="receipt-row">
          <span class="label">Valid Until:</span>
          <span class="value">{{ formatDate(saleData.voucherInfo.expiryDate) }}</span>
        </div>
        <div v-if="saleData.createdByUser" class="receipt-row">
          <span class="label">Cashier:</span>
          <span class="value">{{ saleData.createdByUser.fullName || saleData.createdByUser.username }}</span>
        </div>
        <div v-if="saleData.cashierSession" class="receipt-row">
          <span class="label">Session:</span>
          <span class="value">{{ saleData.cashierSession.sessionNumber }}</span>
        </div>
        <div class="text-center receipt-divider">━━━━━━━━━━━━━━━━━━━━</div>
      </div>

      <!-- Items / Returned Items -->
      <div v-if="saleData && saleData.salesLines" class="receipt-items">
        <div class="receipt-row header-row">
          <span class="item-name">{{ isVoucher ? 'Returned Item' : 'Item' }}</span>
          <span class="item-qty">Qty</span>
          <span class="item-total">Total</span>
        </div>
        <div class="text-center receipt-divider">━━━━━━━━━━━━━━━━━━━━</div>
        
        <div v-for="(line, index) in saleData.salesLines" :key="index" class="receipt-item">
          <div class="receipt-row">
            <span class="item-name">{{ line.item ? line.item.name : 'Unknown Item' }}</span>
            <span class="item-qty">{{ line.quantity }}</span>
            <span class="item-total">${{ formatPrice(line.lineTotal) }}</span>
          </div>
          <div v-if="line.item && line.item.itemCode" class="receipt-row item-code">
            <span class="item-name">Code: {{ line.item.itemCode }}</span>
          </div>
        </div>
        
        <div class="text-center receipt-divider">━━━━━━━━━━━━━━━━━━━━</div>
      </div>

      <!-- Totals -->
      <div v-if="saleData" class="receipt-totals">
        <div v-if="!isVoucher" class="receipt-row">
          <span class="label">Subtotal:</span>
          <span class="value">${{ formatPrice(saleData.subtotal) }}</span>
        </div>
        <div v-if="!isVoucher && saleData.discountAmount && saleData.discountAmount > 0" class="receipt-row">
          <span class="label">Discount:</span>
          <span class="value">${{ formatPrice(saleData.discountAmount) }}</span>
        </div>
        <div v-if="!isVoucher && saleData.taxAmount && saleData.taxAmount > 0" class="receipt-row">
          <span class="label">Tax:</span>
          <span class="value">${{ formatPrice(saleData.taxAmount) }}</span>
        </div>
        <div class="text-center receipt-divider">━━━━━━━━━━━━━━━━━━━━</div>
        <div class="receipt-row total">
          <span class="label">{{ isVoucher ? 'VOUCHER AMOUNT:' : 'TOTAL:' }}</span>
          <span class="value">${{ formatPrice(saleData.totalAmount) }}</span>
        </div>
        <div class="text-center receipt-divider">━━━━━━━━━━━━━━━━━━━━</div>
      </div>

      <!-- Payments -->
      <div v-if="saleData.paymentHeaders && saleData.paymentHeaders.length > 0" class="receipt-payments">
        <div class="text-center receipt-divider">━━━━━━━━━━━━━━━━━━━━</div>
        <div class="receipt-section-header">PAYMENTS:</div>
        <div class="text-center receipt-divider">━━━━━━━━━━━━━━━━━━━━</div>
        
        <div v-for="(payment, index) in saleData.paymentHeaders" :key="index" class="payment-entry">
          <div class="receipt-row">
            <span class="label">Method:</span>
            <span class="value">{{ payment.paymentMethod ? payment.paymentMethod.name : 'N/A' }}</span>
          </div>
          <div class="receipt-row">
            <span class="label">Amount:</span>
            <span class="value">${{ formatPrice(payment.totalAmount) }}</span>
          </div>
          <div v-if="payment.paymentReference" class="receipt-row">
            <span class="label">Reference:</span>
            <span class="value">{{ payment.paymentReference }}</span>
          </div>
          <div class="text-center receipt-divider">━━━━━━━━━━━━━━━━━━━━</div>
        </div>
        
        <div v-if="saleData.paidAmount" class="receipt-row">
          <span class="label">Total Paid:</span>
          <span class="value">${{ formatPrice(saleData.paidAmount) }}</span>
        </div>
        <div v-if="saleData.changeAmount && saleData.changeAmount > 0" class="receipt-row">
          <span class="label">Change:</span>
          <span class="value">${{ formatPrice(saleData.changeAmount) }}</span>
        </div>
        <div class="text-center receipt-divider">━━━━━━━━━━━━━━━━━━━━</div>
      </div>

      <!-- Barcode -->
      <div v-if="barcodeValue" class="receipt-barcode">
        <div class="text-center receipt-divider">━━━━━━━━━━━━━━━━━━━━</div>
        <div class="barcode-container">
          <svg :id="barcodeId" class="barcode-svg"></svg>
        </div>
        <div class="barcode-text text-center">
          {{ barcodeValue }}
        </div>
        <div class="text-center receipt-divider">━━━━━━━━━━━━━━━━━━━━</div>
      </div>

      <!-- Footer -->
      <div class="receipt-footer">
        <div v-if="isVoucher" class="text-center">
          <div>This voucher can be used for future purchases</div>
          <div v-if="saleData.voucherInfo && saleData.voucherInfo.expiryDate" class="mt-2">
            Valid until: {{ formatDate(saleData.voucherInfo.expiryDate) }}
          </div>
        </div>
        <div v-else class="text-center">Thank you for your purchase!</div>
        <div class="text-center receipt-divider">════════════════════════</div>
      </div>
    </div>
  </div>
</template>

<script>
import JsBarcode from 'jsbarcode'

export default {
  name: 'ReceiptTemplate',
  props: {
    saleData: {
      type: Object,
      required: false,
      default: null
    },
    isDuplicate: {
      type: Boolean,
      default: false
    },
    isVoucher: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      barcodeValue: null,
      barcodeId: null
    }
  },
  mounted() {
    console.log('ReceiptTemplate mounted with data:', this.saleData)
    this.generateBarcode()
  },
  watch: {
    saleData: {
      handler() {
        this.$nextTick(() => {
          this.generateBarcode()
        })
      },
      deep: true
    }
  },
  methods: {
    generateBarcode() {
      if (!this.saleData) return
      
      // Determine barcode value: voucher_number for vouchers, sales_number for regular receipts
      let barcodeText = null
      if (this.isVoucher && this.saleData.voucherInfo && this.saleData.voucherInfo.voucherNumber) {
        barcodeText = this.saleData.voucherInfo.voucherNumber
      } else if (!this.isVoucher && this.saleData.salesNumber) {
        barcodeText = this.saleData.salesNumber
      }
      
      if (!barcodeText) return
      
      this.barcodeValue = barcodeText
      this.barcodeId = `barcode-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      
      // Generate barcode after DOM is updated
      this.$nextTick(() => {
        try {
          const svgElement = document.getElementById(this.barcodeId)
          if (svgElement) {
            JsBarcode(svgElement, barcodeText, {
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
      })
    },
    formatPrice(price) {
      if (!price && price !== 0) return '0.00'
      return parseFloat(price).toFixed(2)
    },
    formatDate(dateString) {
      if (!dateString) return ''
      const date = new Date(dateString)
      // If it's a date-only string (no time), format as date only
      if (dateString.includes('T') || dateString.includes(' ')) {
        return date.toLocaleString('en-US', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        })
      } else {
        // Date only (for expiry date)
        return date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit'
        })
      }
    }
  }
}
</script>

<style scoped>
/* Print-specific styles */
@media print {
  @page {
    size: 80mm auto;
    margin: 0;
  }

  body {
    margin: 0;
    padding: 0;
  }

  .receipt-template {
    width: 80mm;
    max-width: 80mm;
    margin: 0;
    padding: 10mm;
    font-size: 12px;
    line-height: 1.4;
  }

  .receipt-content {
    width: 100%;
  }

  /* Hide all other elements when printing */
  body * {
    visibility: hidden;
  }

  .receipt-template,
  .receipt-template * {
    visibility: visible;
  }

  .receipt-template {
    position: absolute;
    left: 0;
    top: 0;
  }
}

/* Screen preview styles */
.receipt-template {
  width: 80mm;
  max-width: 80mm;
  margin: 0 auto;
  padding: 20px;
  font-family: 'Courier New', monospace;
  font-size: 12px;
  line-height: 1.4;
  background: white;
  color: black;
}

.receipt-header {
  margin-bottom: 15px;
}

.receipt-header h2 {
  font-size: 16px;
  margin: 5px 0;
  font-weight: bold;
}

.receipt-header h3 {
  font-size: 14px;
  margin: 5px 0;
  font-weight: bold;
}

.voucher-title {
  color: #007bff;
}

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

.duplicate-badge {
  background: #ff0000;
  color: white;
  font-weight: bold;
  text-align: center;
  padding: 10px;
  margin: 10px 0;
  font-size: 18px;
  border: 3px solid #000;
  letter-spacing: 2px;
}

.receipt-divider {
  margin: 8px 0;
  font-size: 10px;
  color: #333;
}

.receipt-info,
.receipt-items,
.receipt-totals,
.receipt-payments {
  margin-bottom: 10px;
}

.receipt-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 4px;
  font-size: 12px;
}

.receipt-row.header-row {
  font-weight: bold;
  margin-bottom: 6px;
}

.receipt-row.total {
  font-weight: bold;
  font-size: 14px;
  margin-top: 8px;
}

.receipt-row .label {
  text-align: left;
}

.receipt-row .value {
  text-align: right;
  font-weight: bold;
}

.item-name {
  flex: 2;
  text-align: left;
}

.item-qty {
  flex: 0.5;
  text-align: center;
}

.item-total {
  flex: 1;
  text-align: right;
}

.item-code {
  font-size: 10px;
  color: #666;
  margin-left: 10px;
  margin-bottom: 6px;
}

.receipt-section-header {
  font-weight: bold;
  text-align: center;
  margin: 8px 0;
}

.payment-entry {
  margin-bottom: 8px;
}

.receipt-footer {
  margin-top: 20px;
  text-align: center;
  font-size: 11px;
}

.receipt-barcode {
  margin: 15px 0;
  text-align: center;
}

.barcode-container {
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 10px 0;
}

.barcode-svg {
  max-width: 100%;
  height: auto;
}

.barcode-text {
  font-size: 11px;
  font-weight: bold;
  margin-top: 5px;
  letter-spacing: 1px;
}
</style>

