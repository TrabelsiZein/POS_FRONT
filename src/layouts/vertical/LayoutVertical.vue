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
  },
  watch: {
    shouldHideNavMenu: {
      immediate: true,
      handler(val) {
        store.commit('appConfig/UPDATE_NAV_MENU_HIDDEN', !!val)
      },
    },
    $route() {
      store.commit('appConfig/UPDATE_NAV_MENU_HIDDEN', !!this.shouldHideNavMenu)
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
