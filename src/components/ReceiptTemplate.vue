<template>
  <div id="receipt-template" class="receipt-template">
    <div v-if="!saleData" class="text-center p-4">
      <p>No sale data available</p>
    </div>
    <div v-else class="receipt-content">
      <!-- Header -->
      <div class="receipt-header">
        <h2 class="text-center">ZS Retail</h2>
        <div class="text-center receipt-divider">━━━━━━━━━━━━━━━━━━━━</div>
        <h3 v-if="isVoucher" class="text-center voucher-title">BON DE RETOUR</h3>
        <h3 v-else class="text-center">REÇU DE VENTE</h3>
        <div v-if="isDuplicate && !isVoucher" class="duplicate-badge">
          ═══ DUPLICATA ═══
        </div>
        <div v-if="isVoucher && saleData.voucherInfo" class="voucher-badge">
          BON #{{ saleData.voucherInfo.voucherNumber }}
        </div>
        <div class="text-center receipt-divider">━━━━━━━━━━━━━━━━━━━━</div>
      </div>

      <!-- Sale Information -->
      <div v-if="saleData" class="receipt-info">
        <div class="receipt-row">
          <span class="label">{{ isVoucher ? 'Numéro de bon :' : 'Numéro de vente :' }}</span>
          <span class="value">{{ saleData.salesNumber || 'N/D' }}</span>
        </div>
        <div v-if="isVoucher && saleData.voucherInfo && saleData.voucherInfo.originalTicket" class="receipt-row">
          <span class="label">Ticket original :</span>
          <span class="value">{{ saleData.voucherInfo.originalTicket }}</span>
        </div>
        <div class="receipt-row">
          <span class="label">Date :</span>
          <span class="value">{{ formatDate(saleData.salesDate) }}</span>
        </div>
        <div v-if="isVoucher && saleData.voucherInfo && saleData.voucherInfo.expiryDate" class="receipt-row">
          <span class="label">Valide jusqu'au :</span>
          <span class="value">{{ formatDate(saleData.voucherInfo.expiryDate) }}</span>
        </div>
        <div v-if="saleData.createdByUser" class="receipt-row">
          <span class="label">Caissier :</span>
          <span class="value">{{ saleData.createdByUser.fullName || saleData.createdByUser.username }}</span>
        </div>
        <div v-if="saleData.cashierSession" class="receipt-row">
          <span class="label">Session :</span>
          <span class="value">{{ saleData.cashierSession.sessionNumber }}</span>
        </div>
        <div class="text-center receipt-divider">━━━━━━━━━━━━━━━━━━━━</div>
      </div>

      <!-- Items / Returned Items -->
      <div v-if="saleData && saleData.salesLines" class="receipt-items">
        <div class="receipt-row header-row">
          <span class="item-name">{{ isVoucher ? 'Article retourné' : 'Article' }}</span>
          <span class="item-qty">Qté</span>
          <span class="item-total">Total</span>
        </div>
        <div class="text-center receipt-divider">━━━━━━━━━━━━━━━━━━━━</div>

        <div v-for="(line, index) in saleData.salesLines" :key="index" class="receipt-item">
          <div class="receipt-row">
            <span class="item-name">{{ line.item ? line.item.name : 'Article inconnu' }}</span>
            <span class="item-qty">{{ line.quantity }}</span>
            <span class="item-total">{{ formatTunCurrency(getLineTotalForDisplay(line)) }}</span>
          </div>
          <div v-if="getVatPercent(line)" class="receipt-row item-vat">
            <span class="item-name">TVA : {{ getVatPercent(line) }}%</span>
          </div>
        </div>
        <div class="text-center receipt-divider">━━━━━━━━━━━━━━━━━━━━</div>
      </div>

      <!-- Totals -->
      <div v-if="saleData" class="receipt-totals">
        <div class="receipt-row total">
          <span class="label">{{ isVoucher ? 'MONTANT DU BON :' : 'TOTAL :' }}</span>
          <span class="value">{{ formatTunCurrency(saleData.totalAmount) }}</span>
        </div>
      </div>

      <!-- Payments -->
      <div v-if="(saleData.paymentHeaders && saleData.paymentHeaders.length > 0) || (saleData.payments && saleData.payments.length > 0)" class="receipt-payments">
        <div class="text-center receipt-divider">━━━━━━━━━━━━━━━━━━━━</div>
        <div class="receipt-section-header">PAIEMENTS :</div>
        <div class="text-center receipt-divider">━━━━━━━━━━━━━━━━━━━━</div>

        <div v-for="(payment, index) in (saleData.paymentHeaders || saleData.payments || [])" :key="index" class="payment-entry">
          <div class="receipt-row">
            <span class="label">Méthode :</span>
            <span class="value">{{ payment.paymentMethod ? payment.paymentMethod.name : 'N/D' }}</span>
          </div>
          <div class="receipt-row">
            <span class="label">Montant :</span>
            <span class="value">{{ formatTunCurrency(payment.totalAmount) }}</span>
          </div>
          <div v-if="payment.paymentReference" class="receipt-row">
            <span class="label">Référence :</span>
            <span class="value">{{ payment.paymentReference }}</span>
          </div>
          <div class="text-center receipt-divider">━━━━━━━━━━━━━━━━━━━━</div>
        </div>

        <div v-if="saleData.paidAmount" class="receipt-row">
          <span class="label">Total payé :</span>
          <span class="value">{{ formatTunCurrency(saleData.paidAmount) }}</span>
        </div>
        <div v-if="saleData.changeAmount && saleData.changeAmount > 0" class="receipt-row">
          <span class="label">Rendu :</span>
          <span class="value">{{ formatTunCurrency(saleData.changeAmount) }}</span>
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
          <div>Ce bon peut être utilisé pour de futurs achats</div>
          <div v-if="saleData.voucherInfo && saleData.voucherInfo.expiryDate" class="mt-2">
            Valide jusqu'au : {{ formatDate(saleData.voucherInfo.expiryDate) }}
          </div>
        </div>
        <div v-else class="text-center">Merci pour votre achat !</div>
        <div class="text-center receipt-divider">════════════════════════</div>
        <div class="receipt-company-info">
          <div class="receipt-company-row">Site Web : https://comptoir-hammami.com/</div>
          <div class="receipt-company-row">Adresse E-mail : info@groupe-hammami.com</div>
          <div class="receipt-company-row">Téléphone : (+216) 71 100 803 / (+216) 71 100 801</div>
          <div class="receipt-company-row">MF : 0385191JAM000</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import JsBarcode from 'jsbarcode'
import { formatCurrency, formatCurrencyAmount } from '@core/utils/filter'

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
          const svgElement = this.$el ? this.$el.querySelector(`#${this.barcodeId}`) : null
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
      return formatCurrencyAmount(price)
    },
    formatTunCurrency(value) {
      return formatCurrency(value)
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
    },
    getLineTotalForDisplay(line) {
      // For vouchers, always show TTC (including VAT) price
      if (this.isVoucher) {
        // Always prioritize lineTotalIncludingVat for vouchers (TTC)
        if (line.lineTotalIncludingVat !== null && line.lineTotalIncludingVat !== undefined && line.lineTotalIncludingVat > 0) {
          return line.lineTotalIncludingVat
        }
        // If lineTotalIncludingVat is not available, calculate it from HT price and VAT
        if (line.lineTotal !== null && line.lineTotal !== undefined && line.lineTotal > 0) {
          const vatPercent = this.getVatPercent(line)
          if (vatPercent && vatPercent > 0) {
            const calculatedTTC = line.lineTotal * (1 + vatPercent / 100)
            return Math.round(calculatedTTC * 100) / 100 // Round to 2 decimal places
          }
          // If we have unitPriceIncludingVat, use that to calculate
          if (line.unitPriceIncludingVat && line.quantity) {
            return line.unitPriceIncludingVat * line.quantity
          }
        }
        // Fallback: if lineTotal exists, use it (though this shouldn't happen for vouchers)
        return line.lineTotal || 0
      } else {
        // For regular receipts, use lineTotalIncludingVat if available, otherwise lineTotal
        return line.lineTotalIncludingVat || line.lineTotal || 0
      }
    },
    getVatPercent(line) {
      // Try to get VAT percent from various sources
      if (line.vatPercent !== null && line.vatPercent !== undefined && line.vatPercent > 0) {
        return line.vatPercent
      }
      if (line.item && line.item.defaultVAT !== null && line.item.defaultVAT !== undefined && line.item.defaultVAT > 0) {
        return line.item.defaultVAT
      }
      // For vouchers, calculate VAT percent from line totals (most reliable for returns)
      if (this.isVoucher) {
        if (line.lineTotal && line.lineTotalIncludingVat && line.lineTotal > 0 && line.lineTotalIncludingVat > line.lineTotal) {
          const vatAmount = line.lineTotalIncludingVat - line.lineTotal
          const vatPercent = (vatAmount / line.lineTotal) * 100
          return Math.round(vatPercent * 100) / 100
        }
        // Fallback: Calculate from unit prices
        if (line.unitPrice && line.unitPriceIncludingVat && line.unitPrice > 0 && line.unitPriceIncludingVat > line.unitPrice) {
          const vatAmount = line.unitPriceIncludingVat - line.unitPrice
          const vatPercent = (vatAmount / line.unitPrice) * 100
          return Math.round(vatPercent * 100) / 100
        }
      } else {
        // For regular receipts, calculate VAT percent from unitPrice and unitPriceIncludingVat
        if (line.unitPrice && line.unitPriceIncludingVat && line.unitPrice > 0) {
          const vatAmount = line.unitPriceIncludingVat - line.unitPrice
          const vatPercent = (vatAmount / line.unitPrice) * 100
          return Math.round(vatPercent * 100) / 100
        }
      }
      return null
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
    padding: 0 0 10mm 0;
    font-size: 12px;
    line-height: 1.4;
    /* Force pure black for thermal printers */
    color: #000000 !important;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
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
    /* Ensure all text is black and slightly bolder for thermal printers */
    color: #000000 !important;
    font-weight: 500 !important;
  }

  /* Make bold text even bolder */
  .receipt-template b,
  .receipt-template strong,
  .receipt-template .receipt-row .value,
  .receipt-template .receipt-row.total,
  .receipt-template .receipt-row.header-row,
  .receipt-template .receipt-section-header,
  .receipt-template .receipt-header h2,
  .receipt-template .receipt-header h3 {
    font-weight: 700 !important;
    color: #000000 !important;
  }

  /* Fix gray colors to pure black */
  .receipt-template .receipt-divider {
    color: #000000 !important;
  }

  .receipt-template .item-vat {
    color: #000000 !important;
    font-weight: 500 !important;
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
  color: #000000;
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
  font-weight: 400;
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

.item-vat {
  font-size: 10px;
  color: #000000;
  margin-left: 10px;
  margin-bottom: 6px;
  font-weight: 500;
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

.receipt-company-info {
  margin-top: 15px;
  font-size: 10px;
  font-weight: 500;
}

.receipt-company-row {
  margin-bottom: 3px;
  font-size: 10px;
  font-weight: 500;
  white-space: nowrap;
  line-height: 1.4;
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
