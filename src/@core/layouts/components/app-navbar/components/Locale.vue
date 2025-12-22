<template>
  <b-nav-item-dropdown
    id="dropdown-grouped"
    variant="link"
    class="dropdown-language"
    right
  >
    <template #button-content>
      <b-img
        :src="currentLocale.img"
        height="14px"
        width="22px"
        :alt="currentLocale.locale"
      />
      <span class="ml-50 text-body">{{ currentLocale.name }}</span>
    </template>
    <b-dropdown-item
      v-for="localeObj in locales"
      :key="localeObj.locale"
      @click="setLocale(localeObj.locale)"
    >
      <b-img
        :src="localeObj.img"
        height="14px"
        width="22px"
        :alt="localeObj.locale"
      />
      <span class="ml-50">{{ localeObj.name }}</span>
    </b-dropdown-item>
  </b-nav-item-dropdown>
</template>

<script>
import { BNavItemDropdown, BDropdownItem, BImg } from 'bootstrap-vue'

export default {
  components: {
    BNavItemDropdown,
    BDropdownItem,
    BImg,
  },
  // ! Need to move this computed property to comp function once we get to Vue 3
  computed: {
    currentLocale() {
      return this.locales.find(l => l.locale === this.$i18n.locale)
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
  },
  setup() {
    /* eslint-disable global-require */
    const locales = [
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
    ]
    /* eslint-disable global-require */

    return {
      locales,
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
  },
}
</script>

<style>

</style>
