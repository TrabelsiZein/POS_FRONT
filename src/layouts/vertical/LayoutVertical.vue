<template>
  <layout-vertical>

    <router-view />

    <template #navbar="{ toggleVerticalMenuActive }">
      <navbar :toggle-vertical-menu-active="toggleVerticalMenuActive" />
    </template>

    <!-- <app-customizer
      v-if="showCustomizer"
      slot="customizer"
    /> -->
  </layout-vertical>
</template>

<script>
import LayoutVertical from '@core/layouts/layout-vertical/LayoutVertical.vue'
// import AppCustomizer from '@core/layouts/components/app-customizer/AppCustomizer.vue'
// import { $themeConfig } from '@themeConfig'
import Navbar from '../components/Navbar.vue'
import { eventBus } from '@/main';
import store from '@/store'
import { getUserData } from '@/auth/utils'

export default {
  components: {
    // AppCustomizer,
    LayoutVertical,
    Navbar,
  },
  data() {
    return {
      // showCustomizer: $themeConfig.layout.customizer,
    }
  },
  computed: {
    shouldHideNavMenu() {
      const userData = getUserData()
      const isCashier = userData && userData.role === 'POS_USER'
      return isCashier && this.$route && this.$route.meta && this.$route.meta.hideNavMenu
    },
    isPosUser() {
      const userData = getUserData()
      return userData && userData.role === 'POS_USER'
    },
  },
  watch: {
    shouldHideNavMenu: {
      immediate: true,
      handler(val) {
        store.commit('appConfig/UPDATE_NAV_MENU_HIDDEN', !!val)
      },
    },
    isPosUser: {
      immediate: true,
      handler(isPos) {
        // Hide navbar for POS users, use default (sticky) for others
        store.commit('appConfig/UPDATE_NAVBAR_CONFIG', { type: isPos ? 'hidden' : 'sticky' })
      },
    },
    $route() {
      store.commit('appConfig/UPDATE_NAV_MENU_HIDDEN', !!this.shouldHideNavMenu)
      // Update navbar based on user role
      store.commit('appConfig/UPDATE_NAVBAR_CONFIG', { type: this.isPosUser ? 'hidden' : 'sticky' })
    },
  },
  created() {
    eventBus.$on('show-sweetalert-error', error => {
      // Handle the error here (e.g., display an error message)
      console.error('Custom Event Error:', error);
      this.showErrorMessage(error)
    });
  },
  beforeDestroy() {
    store.commit('appConfig/UPDATE_NAV_MENU_HIDDEN', false)
    store.commit('appConfig/UPDATE_NAVBAR_CONFIG', { type: 'sticky' })
  },
  methods: {
    showErrorMessage(error) {

      if (error.data.message) {
        this.$swal({
          title: "Une erreur inattendue s'est manifestée.",
          text: error.data.message,
          icon: 'error',
          customClass: {
            confirmButton: 'btn btn-primary',
          },
          buttonsStyling: false,
        })
      }
      else if (error.data.error) {
        this.$swal({
          title: "Une erreur inattendue s'est manifestée.",
          text: error.data.error,
          icon: 'error',
          customClass: {
            confirmButton: 'btn btn-primary',
          },
          buttonsStyling: false,
        })
      } else {
        this.$swal({
          title: "Une erreur inattendue s'est manifestée.",
          text: error.data,
          icon: 'error',
          customClass: {
            confirmButton: 'btn btn-primary',
          },
          buttonsStyling: false,
        })
      }
    },
  }
}
</script>
