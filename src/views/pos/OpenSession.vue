<template>
  <div class="open-session-container">
    <b-container>
      <b-row class="justify-content-center">
        <b-col cols="12" md="8" lg="6">
          <b-card class="mt-5">
            <div class="text-center mb-4">
              <feather-icon icon="CreditCardIcon" size="60" class="text-primary" />
              <h2 class="mt-3">{{ $t('pos.openSession.title') }}</h2>
              <p class="text-muted">{{ $t('pos.openSession.description') }}</p>
            </div>

            <b-form @submit.prevent="openSession">
              <b-form-group :label="$t('pos.openSession.openingCashAmount')" label-for="opening-cash">
                <b-input-group prepend="$">
                  <b-form-input
                    id="opening-cash"
                    v-model.number="openingCash"
                    type="number"
                    step="0.01"
                    min="0"
                    :placeholder="$t('pos.openSession.placeholder')"
                    required
                    :state="validationState"
                  />
                </b-input-group>
                <b-form-invalid-feedback v-if="!isValid">
                  {{ $t('pos.openSession.invalidAmount') }}
                </b-form-invalid-feedback>
              </b-form-group>

              <b-form-group>
                <b-form-text>
                  {{ $t('pos.openSession.helpText') }}
                </b-form-text>
              </b-form-group>

              <div class="d-flex flex-column flex-sm-row justify-content-between mt-4 button-group">
                <b-button 
                  variant="outline-secondary" 
                  @click="logout"
                  class="mb-2 mb-sm-0"
                >
                  {{ $t('pos.openSession.cancelLogout') }}
                </b-button>
                <b-button 
                  type="submit" 
                  variant="primary" 
                  size="lg"
                  :disabled="!isValid || loading"
                >
                  <span v-if="loading">{{ $t('pos.openSession.opening') }}</span>
                  <span v-else>{{ $t('pos.openSession.openSession') }}</span>
                </b-button>
              </div>
            </b-form>
          </b-card>
        </b-col>
      </b-row>
    </b-container>
  </div>
</template>

<script>
import useJwt from '@/auth/jwt/useJwt'
import ToastificationContent from '@core/components/toastification/ToastificationContent.vue'

export default {
  name: 'OpenSession',
  data() {
    return {
      openingCash: null,
      loading: false
    }
  },
  computed: {
    isValid() {
      return this.openingCash !== null && 
             this.openingCash >= 0 && 
             !isNaN(this.openingCash)
    },
    validationState() {
      if (this.openingCash === null || this.openingCash === '') return null
      return this.isValid
    }
  },
  async mounted() {
    // Check if there's already an open session for this cashier
    await this.$store.dispatch('pos/checkSession')
    
    // If there's an open session, redirect to items page
    if (this.$store.getters['pos/hasOpenSession']) {
      this.$router.push({ name: 'pos-item-selection' })
    }
  },
  methods: {
    async openSession() {
      if (!this.isValid) return

      this.loading = true

      try {
        const response = await this.$http.post('/cashier-session/open', {
          openingCash: this.openingCash
        })

        if (response.status === 200) {
          // Store session in Vuex
          this.$store.dispatch('pos/setCurrentSession', response.data)
          
          this.$toast({
            component: ToastificationContent,
            props: {
              title: this.$t('common.success'),
              icon: 'CheckCircleIcon',
              text: this.$t('pos.openSession.success'),
              variant: 'success'
            }
          })

          // Redirect to item selection
          this.$router.push({ name: 'pos-item-selection' })
        }
      } catch (error) {
        console.error('Error opening session:', error)
        let errorMessage = this.$t('pos.openSession.error')
        
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
    logout() {
      useJwt.logout()
      this.$router.push({ name: 'login' })
    }
  }
}
</script>

<style scoped>
.open-session-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  background-color: #f8f9fa;
  padding: 20px;
}

.open-session-container .card {
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

@media (max-width: 575.98px) {
  .open-session-container {
    padding: 10px;
    align-items: flex-start;
    padding-top: 20px;
  }

  .open-session-container .card {
    margin-top: 0 !important;
  }

  .open-session-container h2 {
    font-size: 1.25rem;
  }

  .open-session-container .feather-icon {
    width: 40px;
    height: 40px;
  }

  .button-group .btn {
    width: 100%;
  }
}
</style>

