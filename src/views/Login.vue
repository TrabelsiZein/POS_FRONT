<template>
  <div class="auth-wrapper auth-v2">
    <b-row class="auth-inner m-0">

      <!-- Brand logo-->
      <b-link class="brand-logo">
        <vuexy-logo />
        <h2 class="brand-text text-primary ml-1">
          Vuexy
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
              Welcome to Vuexy! 👋
            </b-card-title>
            <b-card-text class="mb-2">
              Please sign-in to your account and start the adventure
            </b-card-text>

            <!-- form -->
            <b-form class="auth-login-form mt-2" @submit.prevent>
              <!-- email -->
              <b-form-group label="Email" label-for="login-email">
                <b-form-input id="login-email" v-model="username" name="login-email" placeholder="john@example.com" />
              </b-form-group>

              <!-- forgot password -->
              <b-form-group>
                <div class="d-flex justify-content-between">
                  <label for="login-password">Password</label>
                  <b-link :to="{ name: 'auth-forgot-password-v2' }">
                    <small>Forgot Password?</small>
                  </b-link>
                </div>
                <b-input-group class="input-group-merge">
                  <b-form-input id="login-password" v-model="password" class="form-control-merge"
                    :type="passwordFieldType" name="login-password" placeholder="············" />
                  <b-input-group-append is-text>
                    <feather-icon class="cursor-pointer" :icon="passwordToggleIcon" @click="togglePasswordVisibility" />
                  </b-input-group-append>
                </b-input-group>
              </b-form-group>

              <!-- checkbox -->
              <b-form-group>
                <b-form-checkbox id="remember-me" v-model="status" name="checkbox-1">
                  Remember Me
                </b-form-checkbox>
              </b-form-group>

              <!-- submit buttons -->
              <b-button type="submit" variant="primary" block @click="validationForm">
                Sign in
              </b-button>
            </b-form>

            <b-card-text class="text-center mt-2">
              <span>New on our platform? </span>
              <b-link :to="{ name: 'page-auth-register-v2' }">
                <span>&nbsp;Create an account</span>
              </b-link>
            </b-card-text>

            <!-- divider -->
            <div class="divider my-2">
              <div class="divider-text">
                or
              </div>
            </div>

            <!-- social buttons -->
            <div class="auth-footer-btn d-flex justify-content-center">
              <b-button variant="facebook" href="javascript:void(0)">
                <feather-icon icon="FacebookIcon" />
              </b-button>
              <b-button variant="twitter" href="javascript:void(0)">
                <feather-icon icon="TwitterIcon" />
              </b-button>
              <b-button variant="google" href="javascript:void(0)">
                <feather-icon icon="MailIcon" />
              </b-button>
              <b-button variant="github" href="javascript:void(0)">
                <feather-icon icon="GithubIcon" />
              </b-button>
            </div>
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
import { required, email } from '@validations'
import { togglePasswordVisibility } from '@core/mixins/ui/forms'
import store from '@/store/index'
import ToastificationContent from '@core/components/toastification/ToastificationContent.vue'
import useJwt from "@/auth/jwt/useJwt"

export default {
  components: {
    VuexyLogo,
  },
  mixins: [togglePasswordVisibility],
  data() {
    return {
      showLoading: false,
      status: '',
      password: '',
      username: '',
      sideImg: require('@/assets/images/pages/login-v2.svg'),
      required,
      email,
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
          useJwt.setToken(response.data.token);
          useJwt.setUserData({ abilities: response.data.abilities });
          this.$ability.update(response.data.abilities);
          this.$router.push({ name: 'home' });
        } else {
          this.$toast({
            component: ToastificationContent,
            props: {
              title: 'Authentification invalide',
              icon: 'XIcon',
              text: 'nom d\'utilisateur ou mot de passe incorrect. Veuillez vérifier vos informations.',
              variant: 'danger',
            },
          }, {
            timeout: 10000
          });
        }
      }).catch(() => {
        this.showLoading = false;
        this.$toast.clear();
        this.$toast({
          component: ToastificationContent,
          props: {
            title: 'Authentification invalide',
            icon: 'XIcon',
            text: 'nom d\'utilisateur ou mot de passe incorrect. Veuillez vérifier vos informations.',
            variant: 'danger',
          },
        }, {
          timeout: 10000
        });
      })
    }
  }
}
</script>

<style lang="scss">
@import '@core/scss/vue/pages/page-auth.scss';
</style>
