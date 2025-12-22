<template>
  <b-modal
    v-model="showModal"
    :title="$t('pos.badge.scanBadge')"
    size="md"
    centered
    no-close-on-backdrop
    hide-header-close
    @hide="handleClose"
    @shown="onModalShown"
    content-class="badge-scan-modal"
  >
    <div class="badge-scan-popup">
      <!-- Permission Info Card -->
      <b-card class="permission-info-card mb-3" no-body>
        <b-card-body class="p-3">
          <div class="d-flex align-items-center">
            <div class="permission-icon-wrapper mr-3">
              <feather-icon icon="ShieldIcon" size="24" class="text-primary" />
            </div>
            <div class="flex-grow-1">
              <div class="text-muted small mb-1">{{ $t('pos.badge.requiredPermission') }}</div>
              <div class="font-weight-bold">{{ getPermissionLabel() }}</div>
            </div>
          </div>
        </b-card-body>
      </b-card>

      <!-- Badge Input -->
      <b-form-group :label="$t('pos.badge.badgeCode')" label-for="badgeInput">
        <b-input-group class="badge-input-group">
          <b-input-group-prepend>
            <span class="input-group-text badge-input-prepend">
              <feather-icon icon="CreditCardIcon"/>
            </span>
          </b-input-group-prepend>
          <b-form-input
            id="badgeInput"
            ref="badgeInput"
            v-model="badgeCode"
            :placeholder="$t('pos.badge.scanBadgePlaceholder')"
            @keyup.enter="handleScan"
            @input="onBadgeInput"
            :disabled="scanning"
            autofocus
            autocomplete="off"
            data-lpignore="true"
            data-1p-ignore="true"
            data-form-type="other"
            spellcheck="false"
            type="text"
            class="badge-scanner-input"
            :class="{ 'is-invalid': errorMessage, 'is-valid': success && scannedUser }"
          />
        </b-input-group>
      </b-form-group>

      <!-- Success Message -->
      <b-alert 
        v-if="scannedUser && success" 
        variant="success" 
        show 
        class="mt-3 success-alert"
        dismissible
        @dismissed="success = false"
      >
        <div class="d-flex align-items-start">
          <feather-icon icon="CheckCircleIcon" size="22" class="mr-2 mt-1" />
          <div class="flex-grow-1">
            <strong class="d-block mb-2">{{ $t('pos.badge.badgeScannedSuccessfully') }}</strong>
            <div class="user-info">
              <div class="font-weight-semibold">{{ scannedUser.fullName || scannedUser.username }}</div>
              <small class="text-muted">{{ maskBadgeCode(scannedUser.badgeCode) }}</small>
            </div>
          </div>
        </div>
      </b-alert>

      <!-- Error Message -->
      <b-alert 
        v-if="errorMessage" 
        variant="danger" 
        show 
        class="mt-3 error-alert"
        dismissible
        @dismissed="errorMessage = ''"
      >
        <div class="d-flex align-items-start">
          <feather-icon icon="XCircleIcon" size="22" class="mr-2 mt-1" />
          <div class="flex-grow-1">
            <strong class="d-block mb-1">{{ $t('pos.badge.scanFailed') }}</strong>
            <div class="error-message">{{ errorMessage }}</div>
          </div>
        </div>
      </b-alert>

      <!-- Instructions -->
      <div class="instructions-box mt-3">
        <div class="d-flex align-items-start">
          <feather-icon icon="InfoIcon" size="16" class="mr-2 mt-1 text-info" />
          <div class="small text-muted">{{ $t('pos.badge.scanInstructions') }}</div>
        </div>
      </div>
    </div>

    <template #modal-footer>
      <b-button variant="secondary" @click="handleClose" class="px-4" :disabled="scanning">
        {{ $t('common.cancel') }}
      </b-button>
      <b-button 
        variant="primary" 
        @click="handleScan" 
        :disabled="scanning || !badgeCode.trim()"
        class="px-4"
      >
        <b-spinner v-if="scanning" small class="mr-2" />
        <feather-icon v-else icon="SearchIcon" size="14" class="mr-2" />
        {{ $t('pos.badge.scan') }}
      </b-button>
    </template>
  </b-modal>
</template>

<script>
import { scanBadge, getFailureReasonMessage } from '@/services/badgeService'

export default {
  name: 'BadgeScanPopup',
  props: {
    show: {
      type: Boolean,
      default: false
    },
    requiredPermission: {
      type: String,
      required: true
    },
    sessionId: {
      type: Number,
      default: null
    }
  },
  data() {
    return {
      showModal: false,
      badgeCode: '', // Actual badge code value (masked in input due to type="password")
      scanning: false,
      scannedUser: null,
      success: false,
      errorMessage: ''
    }
  },
  watch: {
    show(newVal) {
      this.showModal = newVal
      if (newVal) {
        this.resetForm()
      }
    },
    showModal(newVal) {
      if (!newVal) {
        this.$emit('close')
      }
    }
  },
  methods: {
    maskBadgeCode(badgeCode) {
      if (!badgeCode) return ''
      // Show first 2 and last 2 characters, mask the rest with asterisks
      if (badgeCode.length <= 4) {
        return '*'.repeat(badgeCode.length)
      }
      const start = badgeCode.substring(0, 2)
      const end = badgeCode.substring(badgeCode.length - 2)
      const masked = '*'.repeat(badgeCode.length - 4)
      return `${start}${masked}${end}`
    },
    getPermissionLabel() {
      const permissionLabels = {
        'CONSULT_CUSTOMER_LIST': this.$t('pos.badge.permissions.consult_customer_list'),
        'MAKE_RETURN': this.$t('pos.badge.permissions.make_return'),
        'APPLY_LINE_DISCOUNT': this.$t('pos.badge.permissions.apply_line_discount'),
        'APPLY_TOTAL_DISCOUNT': this.$t('pos.badge.permissions.apply_total_discount')
      }
      return permissionLabels[this.requiredPermission] || this.requiredPermission
    },
    onModalShown() {
      // Reset form and focus on input when modal is shown
      this.resetForm()
      this.$nextTick(() => {
        if (this.$refs.badgeInput) {
          this.$refs.badgeInput.value = ''
          this.$refs.badgeInput.focus()
        }
      })
    },
    onBadgeInput() {
      // Clear previous error and success when user types
      // v-model already handles the value binding automatically
      // This handler is just for clearing error/success states
      if (this.errorMessage) {
        this.errorMessage = ''
      }
      if (this.success) {
        this.success = false
        this.scannedUser = null
      }
    },
    async handleScan() {
      if (!this.badgeCode || !this.badgeCode.trim()) {
        return
      }

      this.scanning = true
      this.errorMessage = ''
      this.success = false
      this.scannedUser = null

      try {
        const result = await scanBadge(
          this.badgeCode.trim(),
          this.requiredPermission,
          this.$http,
          this.sessionId
        )

        if (result && result.success && result.hasPermission) {
          this.success = true
          this.scannedUser = result.user

          // Emit success event after short delay
          setTimeout(() => {
            this.$emit('badge-scanned', {
              user: result.user,
              badgeCode: this.badgeCode.trim(),
              permission: this.requiredPermission
            })
            this.handleClose()
          }, 1000)
        } else {
          // Show error - ensure we have a valid failure reason
          const failureReason = result?.failureReason || 'UNKNOWN_ERROR'
          this.errorMessage = getFailureReasonMessage(failureReason, this.$t)
          
          // Clear input for retry
          this.$nextTick(() => {
            if (this.$refs.badgeInput) {
              this.badgeCode = ''
              this.$refs.badgeInput.focus()
            }
          })
        }
      } catch (error) {
        console.error('Error scanning badge:', error)
        // Extract error message properly
        let errorMsg = this.$t('pos.badge.messages.unknownError')
        if (error && error.message) {
          errorMsg = error.message
        } else if (error && typeof error === 'string') {
          errorMsg = error
        }
        this.errorMessage = errorMsg
      } finally {
        this.scanning = false
      }
    },
    handleClose() {
      this.showModal = false
      this.resetForm()
      this.$emit('close')
    },
    resetForm() {
      this.badgeCode = ''
      this.scanning = false
      this.scannedUser = null
      this.success = false
      this.errorMessage = ''
      // Clear input field value
      this.$nextTick(() => {
        if (this.$refs.badgeInput) {
          this.$refs.badgeInput.value = ''
        }
      })
    }
  }
}
</script>

<style scoped>
.badge-scan-popup {
  padding: 5px 0;
}

/* Permission Info Card */
.permission-info-card {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border: 1px solid #dee2e6;
  border-radius: 8px;
}

.permission-icon-wrapper {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: rgba(115, 103, 240, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Badge Input Styling */
.badge-input-group {
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  border-radius: 6px;
  overflow: hidden;
}

.badge-input-prepend {
  background-color: #f8f9fa;
  border-right: none;
  padding: 0.75rem 1rem;
}

.badge-scanner-input {
  font-size: 1.1rem;
  font-weight: 500;
  text-align: center;
  letter-spacing: 2px;
  padding: 0.75rem 1rem;
  border-right: 1px solid #ced4da;
  text-transform: uppercase;
}

.badge-scanner-input:focus {
  border-color: #7367f0;
  box-shadow: none;
  background-color: #fff;
}

.badge-scanner-input.is-valid {
  border-color: #28a745;
  background-color: #f0fff4;
}

.badge-scanner-input.is-invalid {
  border-color: #dc3545;
  background-color: #fff5f5;
}

/* Alert Styling */
.success-alert {
  border-left: 4px solid #28a745;
  border-radius: 6px;
  background-color: #f0fff4;
}

.success-alert .user-info {
  margin-top: 0.5rem;
  padding-top: 0.5rem;
  border-top: 1px solid rgba(40, 167, 69, 0.2);
}

.error-alert {
  border-left: 4px solid #dc3545;
  border-radius: 6px;
  background-color: #fff5f5;
}

.error-message {
  color: #721c24;
  font-size: 0.95rem;
  line-height: 1.5;
}

/* Instructions Box */
.instructions-box {
  padding: 0.75rem 1rem;
  background-color: #f8f9fa;
  border-radius: 6px;
  border-left: 3px solid #17a2b8;
}

/* Modal Content */
::v-deep .badge-scan-modal {
  border-radius: 12px;
  overflow: hidden;
}

::v-deep .badge-scan-modal .modal-header {
  background: linear-gradient(135deg, #7367f0 0%, #5e50e5 100%);
  color: white;
  border-bottom: none;
  padding: 1.25rem 1.5rem;
}

::v-deep .badge-scan-modal .modal-header .modal-title {
  font-weight: 600;
  font-size: 1.25rem;
}

::v-deep .badge-scan-modal .modal-body {
  padding: 1.5rem;
}

::v-deep .badge-scan-modal .modal-footer {
  border-top: 1px solid #dee2e6;
  padding: 1rem 1.5rem;
  background-color: #f8f9fa;
}

</style>

