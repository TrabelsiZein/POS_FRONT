<template>
  <div class="auth-wrapper auth-v2">
    <b-row class="auth-inner m-0">

      <!-- Brand logo-->
      <b-link class="brand-logo">
        <vuexy-logo />
        <h2 class="brand-text text-primary ml-1">
          POS System
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
        <b-overlay :show="showLoading" rounded="sm">
          <b-col sm="8" md="6" lg="12" class="px-xl-2 mx-auto">
            <b-card-title title-tag="h2" class="font-weight-bold mb-1">
              Welcome to POS! 👋
            </b-card-title>
            <b-card-text class="mb-2">
              Please sign-in to your account
            </b-card-text>

            <!-- form -->
            <b-form class="auth-login-form mt-2" @submit.prevent>
              <!-- username -->
              <b-form-group label="Username" label-for="login-username">
                <b-form-input id="login-username" v-model="username" name="login-username" placeholder="Enter username" />
              </b-form-group>

              <!-- password -->
              <b-form-group>
                <label for="login-password">Password</label>
                <b-input-group class="input-group-merge">
                  <b-form-input id="login-password" v-model="password" class="form-control-merge"
                    :type="passwordFieldType" name="login-password" placeholder="············" />
                  <b-input-group-append is-text>
                    <feather-icon class="cursor-pointer" :icon="passwordToggleIcon" @click="togglePasswordVisibility" />
                  </b-input-group-append>
                </b-input-group>
              </b-form-group>

              <!-- submit buttons -->
              <b-button type="submit" variant="primary" block @click="validationForm">
                Sign in
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
  },
  methods: {
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
              { action: 'read', subject: 'admin-general-setup' },
              { action: 'read', subject: 'admin-returns' },
              { action: 'read', subject: 'admin-erp-jobs' },
              { action: 'read', subject: 'admin-erp-communications' },
              { action: 'write', subject: 'admin-users' },
              { action: 'delete', subject: 'admin-users' },
              { action: 'write', subject: 'admin-customers' },
              { action: 'delete', subject: 'admin-customers' }
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
              title: 'Authentication Failed',
              icon: 'XIcon',
              text: 'Invalid username or password. Please check your credentials.',
              variant: 'danger',
            },
          }, {
            timeout: 5000
          });
        }
      }).catch(error => {
        this.showLoading = false;
        this.$toast.clear();
        let errorMessage = 'Invalid username or password. Please check your credentials.';
        if (error.response && error.response.data) {
          errorMessage = error.response.data.msg || errorMessage;
        }
        this.$toast({
          component: ToastificationContent,
          props: {
            title: 'Authentication Failed',
            icon: 'XIcon',
            text: errorMessage,
            variant: 'danger',
          },
        }, {
          timeout: 5000
        });
      })
    }
  }
}
</script>

<style lang="scss">
@import '@core/scss/vue/pages/page-auth.scss';
</style>
