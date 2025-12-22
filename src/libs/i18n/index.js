import Vue from 'vue'
import VueI18n from 'vue-i18n'

Vue.use(VueI18n)

function loadLocaleMessages() {
  const locales = require.context('./locales', true, /[A-Za-z0-9-_,\s]+\.json$/i)
  const messages = {}
  locales.keys().forEach(key => {
    const matched = key.match(/([A-Za-z0-9-_]+)\./i)
    if (matched && matched.length > 1) {
      const locale = matched[1]
      messages[locale] = locales(key)
    }
  })
  return messages
}

// Get locale from localStorage or default to 'en'
function getSavedLocale() {
  try {
    const saved = localStorage.getItem('app-locale')
    if (saved && ['en', 'fr', 'ar'].includes(saved)) {
      return saved
    }
  } catch (e) {
    console.warn('Failed to read locale from localStorage:', e)
  }
  return 'en'
}

// Get initial locale
const initialLocale = getSavedLocale()

// Create i18n instance
const i18n = new VueI18n({
  locale: initialLocale,
  fallbackLocale: 'en',
  messages: loadLocaleMessages(),
})

// Save initial locale to localStorage if not already saved
try {
  if (!localStorage.getItem('app-locale')) {
    localStorage.setItem('app-locale', initialLocale)
  }
} catch (e) {
  console.warn('Failed to save initial locale to localStorage:', e)
}

// Watch for locale changes and persist to localStorage
i18n.vm.$watch('locale', newLocale => {
  try {
    localStorage.setItem('app-locale', newLocale)
  } catch (e) {
    console.warn('Failed to save locale to localStorage:', e)
  }
})

export default i18n
