import { isToday } from './utils'

export const kFormatter = num => (num > 999 ? `${(num / 1000).toFixed(1)}k` : num)

export const title = (value, replacer = ' ') => {
  if (!value) return ''
  const str = value.toString()

  const arr = str.split(replacer)
  const capitalizedArray = []
  arr.forEach(word => {
    const capitalized = word.charAt(0).toUpperCase() + word.slice(1)
    capitalizedArray.push(capitalized)
  })
  return capitalizedArray.join(' ')
}

export const avatarText = value => {
  if (!value) return ''
  const nameArray = value.split(' ')
  return nameArray.map(word => word.charAt(0).toUpperCase()).join('')
}

/**
 * Format and return date in Humanize format
 * Intl docs: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat/format
 * Intl Constructor: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat/DateTimeFormat
 * @param {String} value date to format
 * @param {Object} formatting Intl object to format with
 */
export const formatDate = (value, formatting = { month: 'short', day: 'numeric', year: 'numeric' }) => {
  if (!value) return value
  return new Intl.DateTimeFormat('en-US', formatting).format(new Date(value))
}

/**
 * Return short human friendly month representation of date
 * Can also convert date to only time if date is of today (Better UX)
 * @param {String} value date to format
 * @param {Boolean} toTimeForCurrentDay Shall convert to time if day is today/current
 */
export const formatDateToMonthShort = (value, toTimeForCurrentDay = true) => {
  const date = new Date(value)
  let formatting = { month: 'short', day: 'numeric' }

  if (toTimeForCurrentDay && isToday(date)) {
    formatting = { hour: 'numeric', minute: 'numeric' }
  }

  return new Intl.DateTimeFormat('en-US', formatting).format(new Date(value))
}

// Strip all the tags from markup and return plain text
export const filterTags = value => value.replace(/<\/?[^>]+(>|$)/g, '')

/**
 * Format currency amount with space as thousand separator and dot as decimal separator
 * Format: 32 011.00 (space for thousands, dot for decimals)
 * @param {Number|String} value - The amount to format
 * @param {Number} decimals - Number of decimal places (default: 2)
 * @returns {String} Formatted amount string
 */
export const formatCurrencyAmount = (value, decimals = 2) => {
  const amount = parseFloat(value) || 0
  
  // Format with fixed decimals
  const fixed = amount.toFixed(decimals)
  
  // Split integer and decimal parts
  const parts = fixed.split('.')
  const integerPart = parts[0]
  const decimalPart = parts[1] || ''
  
  // Add space as thousand separator
  const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
  
  // Combine with decimal part
  return decimalPart ? `${formattedInteger}.${decimalPart}` : formattedInteger
}

/**
 * Format currency with TND suffix
 * Format: "32 011.00 TND"
 * @param {Number|String} value - The amount to format
 * @param {Number} decimals - Number of decimal places (default: 2)
 * @returns {String} Formatted currency string with TND suffix
 */
export const formatCurrency = (value, decimals = 2) => {
  return `${formatCurrencyAmount(value, decimals)} TND`
}