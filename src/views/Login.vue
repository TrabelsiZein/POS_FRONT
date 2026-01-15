<template>
  <div class="auth-wrapper auth-v2">
    <b-row class="auth-inner m-0">

      <!-- Brand logo-->
      <b-link class="brand-logo">
        <vuexy-logo />
        <h2 class="brand-text text-primary ml-1">
          {{ $t('auth.login.brandName') }}
        </h2>
      </b-link>
      <!-- /Brand logo-->

      <!-- Left Text-->
      <b-col lg="8" class="d-none d-lg-flex align-items-center p-5">
        <div class="w-100 d-lg-flex align-items-center justify-content-center px-5">
          <b-img fluid :src="imgUrl" alt="Login V2" />
        </div>
      </b-col>
      <!-- /Left Text-->

      <!-- Login-->
      <b-col lg="4" class="d-flex align-items-center auth-bg px-2 p-lg-5">
        <!-- Language Switcher -->
        <div class="language-switcher">
          <b-dropdown
            variant="link"
            toggle-class="language-dropdown-toggle"
            right
          >
            <template #button-content>
              <b-img
                :src="currentLocale.img"
                height="20px"
                width="28px"
                :alt="currentLocale.locale"
                class="flag-icon"
              />
              <span class="ml-1 language-name">{{ currentLocale.name }}</span>
            </template>
            <b-dropdown-item
              v-for="localeObj in locales"
              :key="localeObj.locale"
              @click="setLocale(localeObj.locale)"
              :class="{ 'active': localeObj.locale === currentLocale.locale }"
            >
              <b-img
                :src="localeObj.img"
                height="16px"
                width="22px"
                :alt="localeObj.locale"
                class="mr-2"
              />
              <span>{{ localeObj.name }}</span>
            </b-dropdown-item>
          </b-dropdown>
        </div>
        
        <b-overlay :show="showLoading" rounded="sm">
          <b-col sm="8" md="6" lg="12" class="px-xl-2 mx-auto">
            <div class="welcome-card mb-3">
              <h2 class="welcome-title">
                {{ $t('auth.login.welcome') }}
              </h2>
              <p class="welcome-subtitle">
                {{ $t('auth.login.signIn') }}
              </p>
            </div>

            <!-- form -->
            <b-form class="auth-login-form mt-2" @submit.prevent="validationForm">
              <!-- username -->
              <b-form-group :label="$t('auth.login.username')" label-for="login-username" class="form-group-enhanced">
                <b-form-input 
                  id="login-username" 
                  v-model="username" 
                  name="login-username" 
                  :placeholder="$t('auth.login.usernamePlaceholder')"
                  class="form-input-enhanced"
                  autocomplete="username"
                  @keyup.enter="validationForm"
                />
              </b-form-group>

              <!-- password -->
              <b-form-group class="form-group-enhanced">
                <label for="login-password">{{ $t('auth.login.password') }}</label>
                <b-input-group class="input-group-merge">
                  <b-form-input 
                    id="login-password" 
                    v-model="password" 
                    class="form-control-merge form-input-enhanced"
                    :type="passwordFieldType" 
                    name="login-password" 
                    :placeholder="$t('auth.login.passwordPlaceholder')"
                    autocomplete="current-password"
                    @keyup.enter="validationForm"
                  />
                  <b-input-group-append is-text>
                    <feather-icon class="cursor-pointer password-toggle" :icon="passwordToggleIcon" @click="togglePasswordVisibility" />
                  </b-input-group-append>
                </b-input-group>
              </b-form-group>

              <!-- submit buttons -->
              <b-button 
                type="submit" 
                variant="primary" 
                block 
                class="login-button"
                :disabled="showLoading"
                @click="validationForm"
              >
                <span v-if="!showLoading">{{ $t('auth.login.signInButton') }}</span>
                <span v-else>
                  <b-spinner small class="mr-1" />
                  {{ $t('common.loading') }}...
                </span>
              </b-button>
            </b-form>
          </b-col>
        </b-overlay>
      </b-col>
      <!-- /Login-->
    </b-row>
  </div>
</template>

<script>
/* eslint-disable global-require */
import VuexyLogo from '@core/layouts/components/Logo.vue'
import { togglePasswordVisibility } from '@core/mixins/ui/forms'
import store from '@/store/index'
import ToastificationContent from '@core/components/toastification/ToastificationContent.vue'
import useJwt from "@/auth/jwt/useJwt"
import { getHomeRouteForLoggedInUser } from '@/auth/utils'
import ability from '@/libs/acl/ability'

export default {
  components: {
    VuexyLogo,
  },
  mixins: [togglePasswordVisibility],
  data() {
    return {
      showLoading: false,
      password: '',
      username: '',
      sideImg: require('@/assets/images/pages/login-v2.svg'),
      locales: [
        {
          locale: 'en',
          img: require('@/assets/images/flags/en.png'),
          name: 'English',
        },
        {
          locale: 'fr',
          img: require('@/assets/images/flags/fr.png'),
          name: 'French',
        },
        {
          locale: 'ar',
          img: require('@/assets/images/flags/ar.png'),
          name: 'Arabic',
        },
      ],
    }
  },
  computed: {
    passwordToggleIcon() {
      return this.passwordFieldType === 'password' ? 'EyeIcon' : 'EyeOffIcon'
    },
    imgUrl() {
      if (store.state.appConfig.layout.skin === 'dark') {
        // eslint-disable-next-line vue/no-side-effects-in-computed-properties
        this.sideImg = require('@/assets/images/pages/login-v2-dark.svg')
        return this.sideImg
      }
      return this.sideImg
    },
    currentLocale() {
      return this.locales.find(l => l.locale === this.$i18n.locale) || this.locales[0]
    },
  },
  methods: {
    setLocale(locale) {
      this.$i18n.locale = locale
      // Save to localStorage
      try {
        localStorage.setItem('app-locale', locale)
      } catch (e) {
        console.warn('Failed to save locale to localStorage:', e)
      }
      // Update document direction for RTL support
      if (locale === 'ar') {
        document.documentElement.setAttribute('dir', 'rtl')
        document.body.classList.add('rtl')
      } else {
        document.documentElement.setAttribute('dir', 'ltr')
        document.body.classList.remove('rtl')
      }
    },
    validationForm() {
      this.showLoading = true;
      useJwt.login({
        username: this.username,
        password: this.password,
      }).then(response => {
        this.showLoading = false;
        this.$toast.clear();
        if (response.status == 200 && response.data.status == 200) {
          // Store token
          useJwt.setToken(response.data.token);
          
          // Build abilities based on role
          const abilities = [
            {
              action: 'read',
              subject: 'Auth',
            }
          ]
          
          // Add role-specific abilities
          if (response.data.role === 'ADMIN') {
            abilities.push(
              { action: 'read', subject: 'admin-users' },
              { action: 'read', subject: 'admin-sessions' },
              { action: 'read', subject: 'admin-sessions-history' },
              { action: 'read', subject: 'tickets-history' },
              { action: 'read', subject: 'admin-item-barcodes' },
              { action: 'read', subject: 'admin-item-families' },
              { action: 'read', subject: 'admin-item-subfamilies' },
              { action: 'read', subject: 'admin-customers' },
              { action: 'read', subject: 'admin-locations' },
              { action: 'read', subject: 'admin-sales-prices' },
              { action: 'read', subject: 'admin-sales-discounts' },
              { action: 'read', subject: 'admin-payment-methods' },
              { action: 'read', subject: 'admin-general-setup' },
              { action: 'read', subject: 'admin-returns' },
              { action: 'read', subject: 'admin-erp-jobs' },
              { action: 'read', subject: 'admin-erp-communications' },
              { action: 'read', subject: 'admin-badge-scan-history' },
              { action: 'write', subject: 'admin-users' },
              { action: 'delete', subject: 'admin-users' },
              { action: 'write', subject: 'admin-customers' },
              { action: 'delete', subject: 'admin-customers' },
              { action: 'write', subject: 'admin-payment-methods' }
            )
            // ADMIN uses admin-sessions route, not responsible-sessions
            // This prevents duplicate menu items
          }
          if (response.data.role === 'RESPONSIBLE') {
            abilities.push(
              { action: 'read', subject: 'responsible-sessions' },
              { action: 'read', subject: 'admin-sessions-history' },
              { action: 'read', subject: 'tickets-history' },
              { action: 'read', subject: 'admin-item-barcodes' },
              { action: 'read', subject: 'admin-customers' },
              { action: 'read', subject: 'admin-returns' },
              { action: 'read', subject: 'admin-badge-scan-history' },
              { action: 'write', subject: 'responsible-sessions' },
              { action: 'write', subject: 'admin-customers' },
              { action: 'delete', subject: 'admin-customers' }
            )
          }
          
          // Store user data with role and abilities
          useJwt.setUserData({ 
            role: response.data.role,
            fullName: response.data.fullName,
            username: this.username,
            abilities: abilities
          });
          
          // Update ability in the ACL system
          ability.update(abilities)
          
          // Reset session check for new login (POS users need to check session)
          if (response.data.role === 'POS_USER') {
            this.$store.dispatch('pos/resetSessionCheck');
          }
          
          // Redirect based on role
          const homeRoute = getHomeRouteForLoggedInUser(response.data.role);
          this.$router.push(homeRoute);
        } else {
          this.$toast({
            component: ToastificationContent,
            props: {
              title: this.$t('auth.login.authenticationFailed'),
              icon: 'XIcon',
              text: this.$t('auth.login.invalidCredentials'),
              variant: 'danger',
            },
          }, {
            timeout: 5000
          });
        }
      }).catch(error => {
        this.showLoading = false;
        this.$toast.clear();
        let errorMessage = this.$t('auth.login.invalidCredentials');
        if (error.response && error.response.data) {
          errorMessage = error.response.data.msg || errorMessage;
        }
        this.$toast({
          component: ToastificationContent,
          props: {
            title: this.$t('auth.login.authenticationFailed'),
            icon: 'XIcon',
            text: errorMessage,
            variant: 'danger',
          },
        }, {
          timeout: 5000
        });
      })
    }
  },
  mounted() {
    // Set initial direction based on current locale
    if (this.$i18n.locale === 'ar') {
      document.documentElement.setAttribute('dir', 'rtl')
      document.body.classList.add('rtl')
    } else {
      document.documentElement.setAttribute('dir', 'ltr')
      document.body.classList.remove('rtl')
    }
  }
}
</script>

<style lang="scss">
@import '@core/scss/vue/pages/page-auth.scss';

// Enhanced UI Styles
.auth-wrapper {
  .auth-inner {
    .brand-logo {
      transition: transform 0.3s ease;
      
      &:hover {
        transform: scale(1.05);
      }
      
      .brand-text {
        font-weight: 600;
        letter-spacing: 0.5px;
        transition: color 0.3s ease;
      }
    }
    
    .auth-bg {
      background-color: #fff !important;
      position: relative;
      
      // Language Switcher Styles
      .language-switcher {
        position: absolute;
        top: 1.5rem;
        right: 1.5rem;
        z-index: 10;
        
        .language-dropdown-toggle {
          display: flex;
          align-items: center;
          padding: 0.5rem 0.75rem;
          background-color: #f8f8f8;
          border: 1px solid #e0e0e0;
          border-radius: 0.428rem;
          color: #5e5873;
          text-decoration: none;
          transition: all 0.3s ease;
          font-size: 0.875rem;
          font-weight: 500;
          
          &:hover,
          &:focus {
            background-color: #fff;
            border-color: #667eea;
            color: #667eea;
            box-shadow: 0 2px 8px rgba(102, 126, 234, 0.2);
            text-decoration: none;
          }
          
          &::after {
            margin-left: 0.5rem;
          }
          
          .flag-icon {
            border-radius: 2px;
            object-fit: cover;
          }
          
          .language-name {
            font-weight: 500;
          }
        }
        
        ::v-deep .dropdown-menu {
          min-width: 150px;
          border: 1px solid #e0e0e0;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          border-radius: 0.428rem;
          padding: 0.5rem;
          
          .dropdown-item {
            display: flex;
            align-items: center;
            padding: 0.625rem 0.75rem;
            border-radius: 0.357rem;
            font-size: 0.875rem;
            transition: all 0.2s ease;
            
            &:hover {
              background-color: #f8f8f8;
              color: #667eea;
            }
            
            &.active {
              background-color: #667eea;
              color: #fff;
              
              &:hover {
                background-color: #5568d3;
              }
            }
            
            img {
              border-radius: 2px;
              object-fit: cover;
            }
          }
        }
      }
      
      .welcome-card {
        padding: 1.5rem 0;
        margin-bottom: 1.5rem;
        
        .welcome-title {
          font-size: 1.75rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
          line-height: 1.3;
          animation: fadeInDown 0.6s ease;
          display: block;
          position: relative;
          
          /* Gradient text effect - using a more reliable approach */
          background-image: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          background-size: 100%;
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          
          /* Fallback for browsers that don't support gradient text */
          color: #667eea;
          
          @supports (-webkit-background-clip: text) {
            color: transparent;
          }
        }
        
        .welcome-subtitle {
          color: #6e6b7b;
          font-size: 0.95rem;
          margin-bottom: 0;
          animation: fadeInUp 0.6s ease 0.2s both;
          line-height: 1.5;
        }
      }
      
      .auth-login-form {
        animation: fadeInUp 0.6s ease 0.4s both;
        
        .form-group-enhanced {
          margin-bottom: 1.5rem;
          
          label {
            font-weight: 500;
            color: #5e5873;
            margin-bottom: 0.5rem;
            font-size: 0.9rem;
          }
          
          .form-input-enhanced {
            height: 2.75rem;
            border-radius: 0.428rem;
            border: 1px solid #d8d6de;
            transition: all 0.3s ease;
            font-size: 0.95rem;
            padding: 0.6rem 1rem;
            
            &:focus {
              border-color: #667eea;
              box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.25);
              transform: translateY(-1px);
            }
            
            &::placeholder {
              color: #b4b7bd;
            }
          }
        }
        
        .input-group-merge {
          .form-control-merge {
            height: 2.75rem;
            border-radius: 0.428rem 0 0 0.428rem;
            border: 1px solid #d8d6de;
            transition: all 0.3s ease;
            
            &:focus {
              border-color: #667eea;
              box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.25);
            }
          }
          
          .input-group-append {
            border-radius: 0 0.428rem 0.428rem 0;
            border: 1px solid #d8d6de;
            border-left: none;
            background-color: #fff;
            transition: all 0.3s ease;
            
            .password-toggle {
              color: #6e6b7b;
              transition: color 0.3s ease;
              
              &:hover {
                color: #667eea;
              }
            }
          }
        }
        
        .login-button {
          height: 2.75rem;
          border-radius: 0.428rem;
          font-weight: 600;
          font-size: 1rem;
          margin-top: 0.5rem;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border: none;
          transition: all 0.3s ease;
          box-shadow: 0 4px 15px 0 rgba(102, 126, 234, 0.35);
          
          &:hover:not(:disabled) {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px 0 rgba(102, 126, 234, 0.45);
          }
          
          &:active:not(:disabled) {
            transform: translateY(0);
          }
          
          &:disabled {
            opacity: 0.7;
            cursor: not-allowed;
          }
        }
      }
    }
  }
}

// Dark mode support
[data-theme="dark"] {
  .auth-wrapper {
    .auth-inner {
      .auth-bg {
        background-color: #283046 !important;
        
        .language-switcher {
          .language-dropdown-toggle {
            background-color: #3b4253;
            border-color: #404656;
            color: #b4b7bd;
            
            &:hover,
            &:focus {
              background-color: #404656;
              border-color: #667eea;
              color: #667eea;
            }
          }
          
          ::v-deep .dropdown-menu {
            background-color: #283046;
            border-color: #404656;
            
            .dropdown-item {
              color: #b4b7bd;
              
              &:hover {
                background-color: #3b4253;
                color: #667eea;
              }
              
              &.active {
                background-color: #667eea;
                color: #fff;
              }
            }
          }
        }
        
        .welcome-card {
          .welcome-title {
            /* Keep gradient in dark mode but ensure visibility */
            background-image: linear-gradient(135deg, #7c8ef1 0%, #9a6bd4 100%);
            color: #7c8ef1;
            
            @supports (-webkit-background-clip: text) {
              color: transparent;
            }
          }
          
          .welcome-subtitle {
            color: #b4b7bd;
          }
        }
        
        .auth-login-form {
          .form-group-enhanced {
            label {
              color: #b4b7bd;
            }
            
            .form-input-enhanced {
              background-color: #283046;
              border-color: #404656;
              color: #b4b7bd;
              
              &:focus {
                background-color: #283046;
                border-color: #667eea;
                color: #b4b7bd;
              }
            }
          }
          
          .input-group-merge {
            .input-group-append {
              background-color: #283046;
              border-color: #404656;
            }
          }
        }
      }
    }
  }
}

// RTL Support
[dir="rtl"] {
  .auth-wrapper {
    .auth-inner {
      .auth-bg {
        .language-switcher {
          right: auto;
          left: 1.5rem;
          
          .language-dropdown-toggle {
            &::after {
              margin-right: 0.5rem;
              margin-left: 0;
            }
          }
        }
        
        .auth-login-form {
          .input-group-merge {
            .form-control-merge {
              border-radius: 0 0.428rem 0.428rem 0;
            }
            
            .input-group-append {
              border-radius: 0.428rem 0 0 0.428rem;
              border-left: 1px solid #d8d6de;
              border-right: none;
            }
          }
        }
      }
    }
  }
}

// Animations
@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

// Responsive adjustments
@media (max-width: 991.98px) {
  .auth-wrapper {
    .auth-inner {
      .auth-bg {
        .welcome-card {
          padding: 1.25rem 0;
          
          .welcome-title {
            font-size: 1.5rem;
          }
          
          .welcome-subtitle {
            font-size: 0.9rem;
          }
        }
      }
    }
  }
}

@media (max-width: 575.98px) {
  .auth-wrapper {
    .auth-inner {
      .auth-bg {
        padding: 1.5rem !important;
        
        .language-switcher {
          top: 1rem;
          right: 1rem;
          
          .language-dropdown-toggle {
            padding: 0.4rem 0.6rem;
            font-size: 0.8rem;
            
            .flag-icon {
              height: 18px;
              width: 24px;
            }
            
            .language-name {
              display: none;
            }
          }
        }
        
        .welcome-card {
          padding: 1rem 0;
          margin-bottom: 1.25rem;
          
          .welcome-title {
            font-size: 1.35rem;
          }
          
          .welcome-subtitle {
            font-size: 0.85rem;
          }
        }
        
        .auth-login-form {
          .form-group-enhanced {
            .form-input-enhanced {
              height: 2.5rem;
            }
          }
          
          .login-button {
            height: 2.5rem;
            font-size: 0.95rem;
          }
        }
      }
    }
  }
}
</style>
