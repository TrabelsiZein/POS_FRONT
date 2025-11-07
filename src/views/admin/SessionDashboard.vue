<template>
  <div class="session-dashboard-container">
    <div class="page-header">
      <h2 class="mb-0">Session Dashboard</h2>
      <b-button variant="outline-primary" @click="loadSessions">
        <feather-icon icon="RefreshCwIcon" size="16" />
        Refresh
      </b-button>
    </div>

    <!-- Sessions Cards -->
    <div v-if="!loading && filteredSessions.length > 0" class="sessions-grid">
      <b-card
        v-for="session in filteredSessions"
        :key="session.id"
        class="session-card mb-3"
        @click="viewSessionDetails(session)"
      >
        <div class="session-card-header">
          <div class="session-number">
            <feather-icon icon="ClockIcon" size="18" class="mr-2" />
            <strong>{{ session.sessionNumber }}</strong>
          </div>
          <b-badge :variant="getStatusBadgeVariant(session.status)" class="status-badge">
            {{ session.status }}
          </b-badge>
        </div>

        <div class="session-card-body">
          <div class="session-info-row">
            <div class="info-item">
              <feather-icon icon="UserIcon" size="16" />
              <span class="label">Cashier:</span>
              <span class="value">{{ session.cashierFullName || session.cashierUsername }}</span>
            </div>
          </div>

          <div class="session-info-row">
            <div class="info-item">
              <feather-icon icon="CalendarIcon" size="16" />
              <span class="label">Opened:</span>
              <span class="value">{{ formatDateTime(session.openedAt) }}</span>
            </div>
            <div class="info-item" v-if="session.closedAt">
              <feather-icon icon="CalendarIcon" size="16" />
              <span class="label">Closed:</span>
              <span class="value">{{ formatDateTime(session.closedAt) }}</span>
            </div>
          </div>

          <div class="session-stats">
            <div class="stat-item">
              <div class="stat-label">Sales</div>
              <div class="stat-value">{{ session.salesCount || 0 }}</div>
            </div>
            <div class="stat-item">
              <div class="stat-label">Total Sales</div>
              <div class="stat-value text-primary">${{ formatPrice(session.totalSalesAmount || 0) }}</div>
            </div>
            <div class="stat-item" v-if="session.returnsCount > 0">
              <div class="stat-label">Returns</div>
              <div class="stat-value text-danger">{{ session.returnsCount || 0 }}</div>
            </div>
          </div>
          
          <!-- Returns Information -->
          <div v-if="session.returnsCount > 0" class="returns-summary">
            <div class="returns-header">
              <feather-icon icon="RotateCcwIcon" size="16" class="mr-2" />
              <strong>Returns Information</strong>
            </div>
            <div class="returns-row">
              <span class="returns-label">Total Returns:</span>
              <span class="returns-value text-danger">${{ formatPrice(session.totalReturnsAmount || 0) }}</span>
            </div>
            <div class="returns-row" v-if="session.simpleReturnsAmount > 0">
              <span class="returns-label">Simple Returns (Cash):</span>
              <span class="returns-value text-danger">${{ formatPrice(session.simpleReturnsAmount || 0) }}</span>
            </div>
            <div class="returns-row" v-if="session.voucherReturnsAmount > 0">
              <span class="returns-label">Voucher Returns:</span>
              <span class="returns-value text-info">${{ formatPrice(session.voucherReturnsAmount || 0) }}</span>
            </div>
          </div>

          <div class="cash-summary">
            <div class="cash-row">
              <span class="cash-label">Real Cash:</span>
              <span class="cash-value">${{ formatPrice(session.realCash || 0) }}</span>
            </div>
            <div class="cash-row" v-if="session.posUserClosureCash">
              <span class="cash-label">POS Closure:</span>
              <span class="cash-value">${{ formatPrice(session.posUserClosureCash) }}</span>
            </div>
            <div class="cash-row" v-if="session.responsibleClosureCash">
              <span class="cash-label">Resp Closure:</span>
              <span class="cash-value">${{ formatPrice(session.responsibleClosureCash) }}</span>
            </div>
            <div class="cash-row" v-if="session.cashDifference !== null && session.cashDifference !== undefined">
              <span class="cash-label">Difference:</span>
              <span class="cash-value" :class="getDifferenceClass(session.cashDifference)">
                ${{ formatPrice(session.cashDifference) }}
              </span>
            </div>
          </div>
        </div>

        <div class="session-card-footer">
          <b-button variant="primary" size="sm" @click.stop="viewSessionDetails(session)">
            View Details
          </b-button>
        </div>
      </b-card>
    </div>

    <!-- Loading State -->
    <b-card v-else-if="loading" class="text-center py-5">
      <div class="text-center my-2">
        <b-spinner class="align-middle"></b-spinner>
        <strong class="d-block mt-2">Loading...</strong>
      </div>
    </b-card>

    <!-- Empty State -->
    <b-card v-else class="text-center py-5">
      <feather-icon icon="InboxIcon" size="48" class="text-muted mb-3" />
      <h5 class="text-muted">No Active Sessions</h5>
      <p class="text-muted mb-0">There are no open or closed sessions at the moment.</p>
    </b-card>

    <!-- Session Details Modal -->
    <b-modal
      v-model="showDetailsModal"
      title="Session Details"
      size="xl"
      @hide="resetDetailsForm"
    >
      <div v-if="sessionDetails" class="session-details">
        <!-- Session Info -->
        <b-card class="mb-3">
          <h5>Session Information</h5>
          <b-row>
            <b-col cols="12" md="6">
              <p><strong>Session Number:</strong> {{ sessionDetails.session.sessionNumber }}</p>
              <p><strong>Cashier:</strong> {{ sessionDetails.session.cashierName }}</p>
              <p><strong>Opened At:</strong> {{ formatDateTime(sessionDetails.session.openedAt) }}</p>
              <p><strong>Closed At:</strong> {{ formatDateTime(sessionDetails.session.closedAt) || '-' }}</p>
            </b-col>
            <b-col cols="12" md="6">
              <p><strong>Status:</strong> 
                <b-badge :variant="getStatusBadgeVariant(sessionDetails.session.status)">
                  {{ sessionDetails.session.status }}
                </b-badge>
              </p>
              <p><strong>Opening Cash:</strong> ${{ formatPrice(sessionDetails.session.openingCash) }}</p>
              <p><strong>Real Cash:</strong> ${{ formatPrice(sessionDetails.session.realCash) }}</p>
              <p><strong>POS User Closure Cash:</strong> ${{ formatPrice(sessionDetails.session.posUserClosureCash) }}</p>
              <p v-if="sessionDetails.session.responsibleClosureCash">
                <strong>Responsible Closure Cash:</strong> ${{ formatPrice(sessionDetails.session.responsibleClosureCash) }}
              </p>
              <p><strong>Sales Count:</strong> {{ sessionDetails.salesCount }}</p>
              <p><strong>Total Sales:</strong> ${{ formatPrice(sessionDetails.totalSalesAmount) }}</p>
              <p v-if="sessionDetails.returnsCount > 0">
                <strong>Returns Count:</strong> {{ sessionDetails.returnsCount }}
              </p>
              <p v-if="sessionDetails.totalReturnsAmount > 0">
                <strong>Total Returns:</strong> <span class="text-danger">${{ formatPrice(sessionDetails.totalReturnsAmount) }}</span>
              </p>
              <p v-if="sessionDetails.simpleReturnsAmount > 0">
                <strong>Simple Returns (Cash Refunds):</strong> <span class="text-danger">${{ formatPrice(sessionDetails.simpleReturnsAmount) }}</span>
              </p>
              <p v-if="sessionDetails.voucherReturnsAmount > 0">
                <strong>Voucher Returns:</strong> <span class="text-info">${{ formatPrice(sessionDetails.voucherReturnsAmount) }}</span>
              </p>
            </b-col>
          </b-row>
        </b-card>

        <!-- Cash Count Lines (POS User) -->
        <b-card class="mb-3" v-if="posUserCashCounts.length > 0">
          <h5>Cash Count - POS User</h5>
          <b-table
            :items="posUserCashCounts"
            :fields="cashCountFields"
            small
            striped
          >
            <template #cell(paymentMethod)="row">
              {{ row.item.paymentMethod ? row.item.paymentMethod.name : 'Cash' }}
            </template>
            <template #cell(lineTotal)="row">
              ${{ formatPrice(row.item.lineTotal) }}
            </template>
            <template #cell(counterType)="row">
              <b-badge variant="info">{{ row.item.counterType }}</b-badge>
            </template>
          </b-table>
          <div class="mt-2">
            <strong>Total: ${{ formatPrice(posUserCashCountsTotal) }}</strong>
          </div>
        </b-card>

        <!-- Cash Count Lines (Responsible) -->
        <b-card class="mb-3" v-if="responsibleCashCounts.length > 0">
          <h5>Cash Count - Responsible</h5>
          <b-table
            :items="responsibleCashCounts"
            :fields="cashCountFields"
            small
            striped
          >
            <template #cell(paymentMethod)="row">
              {{ row.item.paymentMethod ? row.item.paymentMethod.name : 'Cash' }}
            </template>
            <template #cell(lineTotal)="row">
              ${{ formatPrice(row.item.lineTotal) }}
            </template>
            <template #cell(counterType)="row">
              <b-badge variant="warning">{{ row.item.counterType }}</b-badge>
            </template>
          </b-table>
          <div class="mt-2">
            <strong>Total: ${{ formatPrice(responsibleCashCountsTotal) }}</strong>
          </div>
        </b-card>

        <!-- Verification Section (for CLOSED sessions) -->
        <b-card v-if="sessionDetails.session.status === 'CLOSED' && !sessionDetails.session.responsibleClosureCash">
          <h5>Verify Session</h5>
          <b-form>
            <b-form-group label="Responsible Closure Cash" label-for="responsible-closure-cash">
              <b-input-group prepend="$">
                <b-form-input
                  id="responsible-closure-cash"
                  v-model.number="verificationForm.responsibleClosureCash"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="Enter counted cash"
                />
              </b-input-group>
            </b-form-group>
            <b-form-group label="Verification Notes" label-for="verification-notes">
              <b-form-textarea
                id="verification-notes"
                v-model="verificationForm.verificationNotes"
                rows="3"
                placeholder="Enter any notes about the verification..."
              />
            </b-form-group>
          </b-form>
          <template #footer>
            <b-button variant="success" @click="verifySession" :disabled="!canVerify">
              Verify Session
            </b-button>
          </template>
        </b-card>

        <!-- Add Responsible Cash Count (if session is CLOSED and not yet verified) -->
        <b-card v-if="sessionDetails.session.status === 'CLOSED' && !sessionDetails.session.responsibleClosureCash" class="mb-3">
          <div class="d-flex justify-content-between align-items-center mb-3">
            <h5 class="mb-0">Add Responsible Cash Count</h5>
            <b-button variant="primary" size="sm" @click="addResponsibleCashCountLine">
              <feather-icon icon="PlusIcon" size="14" />
              Add Line
            </b-button>
          </div>

          <b-table
            v-if="responsibleCashCountForm.length > 0"
            :items="responsibleCashCountForm"
            :fields="cashCountFieldsForm"
            small
            striped
          >
            <template #cell(denominationValue)="row">
              <b-input-group prepend="$" size="sm">
                <b-form-input
                  v-model.number="row.item.denominationValue"
                  type="number"
                  step="0.01"
                  min="0"
                  size="sm"
                />
              </b-input-group>
            </template>
            <template #cell(quantity)="row">
              <b-form-input
                v-model.number="row.item.quantity"
                type="number"
                min="1"
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
              <strong>${{ formatPrice((row.item.denominationValue || 0) * (row.item.quantity || 0)) }}</strong>
            </template>
            <template #cell(actions)="row">
              <b-button
                variant="link"
                size="sm"
                @click="removeResponsibleCashCountLine(row.index)"
                class="text-danger p-0"
              >
                <feather-icon icon="XIcon" size="16" />
              </b-button>
            </template>
          </b-table>

          <div v-if="responsibleCashCountForm.length > 0" class="mt-3">
            <strong>Total: ${{ formatPrice(calculatedResponsibleTotal) }}</strong>
          </div>
        </b-card>
      </div>
    </b-modal>
  </div>
</template>

<script>
import moment from 'moment'
import ToastificationContent from '@core/components/toastification/ToastificationContent.vue'

export default {
  name: 'SessionDashboard',
  data() {
    return {
      sessions: [],
      loading: false,
      showDetailsModal: false,
      sessionDetails: null,
      paymentMethods: [],
      verificationForm: {
        responsibleClosureCash: null,
        verificationNotes: ''
      },
      responsibleCashCountForm: [],
      cashCountFields: [
        { key: 'denominationValue', label: 'Value' },
        { key: 'quantity', label: 'Qty' },
        { key: 'paymentMethod', label: 'Payment Method' },
        { key: 'referenceNumber', label: 'Reference' },
        { key: 'lineTotal', label: 'Total' },
        { key: 'counterType', label: 'Counter' }
      ],
      cashCountFieldsForm: [
        { key: 'denominationValue', label: 'Value' },
        { key: 'quantity', label: 'Qty' },
        { key: 'paymentMethod', label: 'Payment Method' },
        { key: 'referenceNumber', label: 'Reference' },
        { key: 'lineTotal', label: 'Total' },
        { key: 'actions', label: '' }
      ]
    }
  },
  computed: {
    filteredSessions() {
      // Filter out TERMINATED sessions, only show OPENED and CLOSED
      return this.sessions.filter(session => 
        session.status === 'OPENED' || session.status === 'CLOSED'
      )
    },
    posUserCashCounts() {
      if (!this.sessionDetails || !this.sessionDetails.cashCountLines) return []
      return this.sessionDetails.cashCountLines.filter(line => line.counterType === 'POS_USER')
    },
    responsibleCashCounts() {
      if (!this.sessionDetails || !this.sessionDetails.cashCountLines) return []
      return this.sessionDetails.cashCountLines.filter(line => line.counterType === 'RESPONSIBLE')
    },
    posUserCashCountsTotal() {
      return this.posUserCashCounts.reduce((sum, line) => sum + (line.lineTotal || 0), 0)
    },
    responsibleCashCountsTotal() {
      return this.responsibleCashCounts.reduce((sum, line) => sum + (line.lineTotal || 0), 0)
    },
    paymentMethodOptions() {
      return this.paymentMethods.filter(pm => pm.active !== false)
    },
    calculatedResponsibleTotal() {
      return this.responsibleCashCountForm.reduce((total, line) => {
        const value = parseFloat(line.denominationValue) || 0
        const qty = parseInt(line.quantity) || 0
        return total + (value * qty)
      }, 0)
    },
    canVerify() {
      // Can verify if manual cash is provided OR cash count lines are provided
      if (this.verificationForm.responsibleClosureCash && this.verificationForm.responsibleClosureCash > 0) {
        return true
      }
      if (this.responsibleCashCountForm.length > 0) {
        return this.responsibleCashCountForm.every(line => {
          return line.denominationValue && line.denominationValue > 0 &&
                 line.quantity && line.quantity > 0
        })
      }
      return false
    }
  },
  mounted() {
    this.loadSessions()
    this.loadPaymentMethods()
  },
  methods: {
    async loadSessions() {
      this.loading = true
      try {
        const response = await this.$http.get('/cashier-session/dashboard')
        this.sessions = response.data
      } catch (error) {
        console.error('Error loading sessions:', error)
        this.$toast({
          component: ToastificationContent,
          props: {
            title: 'Error',
            icon: 'AlertCircleIcon',
            text: 'Failed to load sessions',
            variant: 'danger'
          }
        })
      } finally {
        this.loading = false
      }
    },
    async loadPaymentMethods() {
      try {
        const response = await this.$http.get('/payment-method')
        this.paymentMethods = response.data.filter(pm => pm.active !== false)
      } catch (error) {
        console.error('Error loading payment methods:', error)
      }
    },
    async viewSessionDetails(row) {
      try {
        const response = await this.$http.get(`/cashier-session/${row.id}/details`)
        this.sessionDetails = response.data
        this.verificationForm = {
          responsibleClosureCash: row.responsibleClosureCash || null,
          verificationNotes: ''
        }
        this.responsibleCashCountForm = []
        this.showDetailsModal = true
      } catch (error) {
        console.error('Error loading session details:', error)
        this.$toast({
          component: ToastificationContent,
          props: {
            title: 'Error',
            icon: 'AlertCircleIcon',
            text: 'Failed to load session details',
            variant: 'danger'
          }
        })
      }
    },
    addResponsibleCashCountLine() {
      this.responsibleCashCountForm.push({
        denominationValue: null,
        quantity: null,
        paymentMethodId: null,
        referenceNumber: '',
        notes: ''
      })
    },
    removeResponsibleCashCountLine(index) {
      this.responsibleCashCountForm.splice(index, 1)
    },
    async verifySession() {
      if (!this.canVerify) {
        this.$toast({
          component: ToastificationContent,
          props: {
            title: 'Error',
            icon: 'AlertCircleIcon',
            text: 'Please add cash count lines or enter responsible closure cash',
            variant: 'danger'
          }
        })
        return
      }

      try {
        const requestData = {
          sessionId: this.sessionDetails.session.id,
          verificationNotes: this.verificationForm.verificationNotes
        }

        // Calculate from cash count lines if provided
        if (this.responsibleCashCountForm.length > 0) {
          const calculated = this.responsibleCashCountForm.reduce((sum, line) => {
            return sum + ((line.denominationValue || 0) * (line.quantity || 0))
          }, 0)
          requestData.responsibleClosureCash = calculated
          
          // TODO: Save cash count lines for responsible user
          // For now, we just send the total
        } else if (this.verificationForm.responsibleClosureCash) {
          requestData.responsibleClosureCash = this.verificationForm.responsibleClosureCash
        }

        await this.$http.post('/cashier-session/verify', requestData)
        
        this.$toast({
          component: ToastificationContent,
          props: {
            title: 'Success',
            icon: 'CheckCircleIcon',
            text: 'Session verified successfully',
            variant: 'success'
          }
        })

        this.showDetailsModal = false
        this.resetDetailsForm()
        this.loadSessions()
      } catch (error) {
        console.error('Error verifying session:', error)
        let errorMessage = 'Failed to verify session'
        if (error.response && error.response.data && error.response.data.error) {
          errorMessage = error.response.data.error
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
    resetDetailsForm() {
      this.sessionDetails = null
      this.verificationForm = {
        responsibleClosureCash: null,
        verificationNotes: ''
      }
      this.responsibleCashCountForm = []
    },
    formatPrice(price) {
      if (!price && price !== 0) return '0.00'
      return parseFloat(price).toFixed(2)
    },
    formatDateTime(dateString) {
      if (!dateString) return null
      return moment(dateString).format('YYYY-MM-DD HH:mm:ss')
    },
    getStatusBadgeVariant(status) {
      switch (status) {
        case 'OPENED':
          return 'success'
        case 'CLOSED':
          return 'warning'
        case 'TERMINATED':
          return 'secondary'
        default:
          return 'secondary'
      }
    },
    getDifferenceClass(difference) {
      if (!difference && difference !== 0) return ''
      return difference >= 0 ? 'text-success' : 'text-danger'
    }
  }
}
</script>

<style scoped>
.session-dashboard-container {
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

.sessions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
}

.session-card {
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid #e0e0e0;
}

.session-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.session-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 15px;
  border-bottom: 1px solid #f0f0f0;
  margin-bottom: 15px;
}

.session-number {
  display: flex;
  align-items: center;
  font-size: 1.1rem;
}

.status-badge {
  font-size: 0.85rem;
  padding: 6px 12px;
}

.session-card-body {
  margin-bottom: 15px;
}

.session-info-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
  flex-wrap: wrap;
  gap: 15px;
}

.info-item {
  display: flex;
  align-items: center;
  flex: 1;
  min-width: 150px;
}

.info-item svg {
  margin-right: 8px;
  color: #6c757d;
}

.info-item .label {
  font-weight: 500;
  margin-right: 5px;
  color: #6c757d;
}

.info-item .value {
  color: #2c3e50;
}

.session-stats {
  display: flex;
  gap: 20px;
  margin: 20px 0;
  padding: 15px;
  background-color: #f8f9fa;
  border-radius: 6px;
}

.stat-item {
  flex: 1;
  text-align: center;
}

.stat-label {
  font-size: 0.85rem;
  color: #6c757d;
  margin-bottom: 5px;
}

.stat-value {
  font-size: 1.3rem;
  font-weight: 600;
  color: #2c3e50;
}

.cash-summary {
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid #f0f0f0;
}

.cash-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.cash-label {
  font-weight: 500;
  color: #6c757d;
}

.cash-value {
  font-weight: 600;
  color: #2c3e50;
}

.returns-summary {
  margin-top: 15px;
  padding: 12px;
  background-color: #fff3cd;
  border-radius: 6px;
  border-left: 4px solid #ffc107;
}

.returns-header {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
  font-size: 0.95rem;
  color: #856404;
}

.returns-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 6px;
  font-size: 0.9rem;
}

.returns-label {
  font-weight: 500;
  color: #856404;
}

.returns-value {
  font-weight: 600;
}

.session-card-footer {
  display: flex;
  justify-content: flex-end;
  padding-top: 15px;
  border-top: 1px solid #f0f0f0;
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

  .sessions-grid {
    grid-template-columns: 1fr;
  }

  .session-info-row {
    flex-direction: column;
    gap: 10px;
  }

  .session-stats {
    flex-direction: column;
    gap: 15px;
  }
}
</style>

