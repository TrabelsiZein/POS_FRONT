<template>
  <div class="navbar-container d-flex content align-items-center">

    <!-- Nav Menu Toggler -->
    <ul class="nav navbar-nav d-xl-none">
      <li class="nav-item">
        <b-link class="nav-link" @click="toggleVerticalMenuActive">
          <feather-icon icon="MenuIcon" size="21" />
        </b-link>
      </li>
    </ul>

    <!-- Left Col -->
    <div class="bookmark-wrapper align-items-center flex-grow-1 d-none d-lg-flex">
      <dark-Toggler class="d-none d-lg-block" />
      
      <!-- Session Info for POS Users -->
      <div v-if="isCashierUser && currentSession" class="session-info-navbar ml-4">
        <span class="session-badge-navbar">
          <!-- <feather-icon icon="CheckCircleIcon" size="14" /> -->
          <span class="session-number">{{ currentSession.sessionNumber }}</span>
        </span>
        <span class="session-cash-navbar">
          Opening: ${{ formatPrice(currentSession.openingCash) }}
        </span>
        <b-button 
          variant="outline-warning" 
          size="sm" 
          @click="triggerCloseSessionModal"
          class="ml-2"
        >
          <feather-icon icon="LockIcon" size="14" class="mr-1" />
          Close Session
        </b-button>
      </div>
    </div>


    <b-navbar-nav class="nav align-items-center ml-auto">
      <search-bar v-if="!isCashierUser" />
      <b-nav-item-dropdown right toggle-class="d-flex align-items-center dropdown-user-link" class="dropdown-user">
        <template #button-content>
          <div class="d-sm-flex d-none flex-column user-nav">
            <p class="user-name font-weight-bolder mb-0">
              {{ userFullName }}
            </p>
            <span class="user-status">{{ userRole }}</span>
          </div>
          <b-avatar size="40" variant="light-primary" class="ml-2">
            <feather-icon icon="UserIcon" size="20" />
          </b-avatar>
        </template>

        <b-dropdown-item link-class="d-flex align-items-center" @click="logout">
          <feather-icon size="16" icon="LogOutIcon" class="mr-50" />
          <span>Logout</span>
        </b-dropdown-item>
      </b-nav-item-dropdown>
    </b-navbar-nav>

  </div>
</template>

<script>

import DarkToggler from '@core/layouts/components/app-navbar/components/DarkToggler.vue'
import SearchBar from './SearchBar.vue'
import { initialAbility } from '@/libs/acl/config'
import useJwt from '@/auth/jwt/useJwt'
import { getUserData } from '@/auth/utils'

export default {
  components: {
    // Navbar Components
    DarkToggler,
    SearchBar
  },
  props: {
    toggleVerticalMenuActive: {
      type: Function,
      default: () => { },
    },
  },
  data() {
    return {
      userFullName: '',
      userRole: '',
      showCloseSessionModal: false
    }
  },
  computed: {
    isCashierUser() {
      const userData = getUserData()
      return userData && userData.role === 'POS_USER'
    },
    currentSession() {
      return this.$store.state.pos.currentSession
    }
  },
  mounted() {
    this.loadUserInfo()
  },
  watch: {
    // Watch for session changes from store
    '$store.state.pos.currentSession': {
      handler() {
        // Trigger reactivity update
        this.$forceUpdate()
      },
      deep: true
    }
  },
  methods: {
    loadUserInfo() {
      const userData = getUserData()
      if (userData) {
        this.userFullName = userData.fullName || userData.username || 'User'
        // Format role name for display
        const roleMap = {
          'ADMIN': 'Administrator',
          'RESPONSIBLE': 'Responsible',
          'POS_USER': 'POS User'
        }
        this.userRole = roleMap[userData.role] || userData.role || ''
      }
    },
    async logout() {
      localStorage.removeItem(useJwt.jwtConfig.storageTokenKeyName)
      localStorage.removeItem(useJwt.jwtConfig.storageRefreshTokenKeyName)
      localStorage.removeItem('userData');
      localStorage.removeItem('sessionId');
      localStorage.removeItem('company');
      this.$ability.update(initialAbility)
      this.$router.push({ name: 'login' })
      this.$forceUpdate()
    },
    formatPrice(price) {
      if (!price && price !== 0) return '0.00'
      return parseFloat(price).toFixed(2)
    },
    triggerCloseSessionModal() {
      // Emit event to open close session modal in ItemSelection component
      this.$root.$emit('open-close-session-modal')
    }
  }
}
</script>
