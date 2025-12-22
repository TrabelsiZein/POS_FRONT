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
    </div>


    <b-navbar-nav class="nav align-items-center ml-auto">
      <locale />
      <search-bar v-if="false" />
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
import Locale from '@core/layouts/components/app-navbar/components/Locale.vue'
import SearchBar from './SearchBar.vue'
import { initialAbility } from '@/libs/acl/config'
import useJwt from '@/auth/jwt/useJwt'
import { getUserData } from '@/auth/utils'

export default {
  components: {
    // Navbar Components
    DarkToggler,
    Locale,
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
      userRole: ''
    }
  },
  computed: {},
  mounted() {
    this.loadUserInfo()
  },
  watch: {},
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
    }
  }
}
</script>
