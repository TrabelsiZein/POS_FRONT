/**
 * Badge Service - handles badge-related operations in frontend
 */

import i18n from '@/libs/i18n'

const BADGE_PERMISSIONS = {
  CONSULT_CUSTOMER_LIST: 'CONSULT_CUSTOMER_LIST',
  MAKE_RETURN: 'MAKE_RETURN',
  APPLY_LINE_DISCOUNT: 'APPLY_LINE_DISCOUNT',
  APPLY_TOTAL_DISCOUNT: 'APPLY_TOTAL_DISCOUNT'
}

/**
 * Check if current user has valid permission (badge exists, not revoked, not expired, and has permission)
 * @param {string} permission - BadgePermission enum value
 * @returns {Promise<Object>} - { hasValidPermission: boolean, reason: string }
 */
export async function checkCurrentUserPermission(permission, http) {
  try {
    // Get current user from store or API
    const userResponse = await http.get('/user-account/current')
    const user = userResponse.data
    
    // No badge code means no permission
    if (!user || !user.badgeCode) {
      return { hasValidPermission: false, reason: 'NO_BADGE' }
    }

    // Check if badge is revoked (explicitly check for true, as it could be null or false)
    if (user.badgeRevoked === true) {
      return { hasValidPermission: false, reason: 'BADGE_REVOKED' }
    }

    // Check if badge is expired
    if (user.badgeExpirationDate) {
      try {
        const expirationDate = new Date(user.badgeExpirationDate)
        const now = new Date()
        // Check if expiration date is valid and in the past
        if (!isNaN(expirationDate.getTime()) && expirationDate < now) {
          return { hasValidPermission: false, reason: 'BADGE_EXPIRED' }
        }
      } catch (e) {
        // If date parsing fails, treat as expired to be safe
        console.warn('Error parsing badge expiration date:', e)
        return { hasValidPermission: false, reason: 'BADGE_EXPIRED' }
      }
    }

    // Check if badge has permissions
    if (!user.badgePermissions) {
      return { hasValidPermission: false, reason: 'NO_PERMISSIONS' }
    }

    // Check if badge has the required permission
    const permissions = user.badgePermissions.split(',').map(p => p.trim())
    if (!permissions.includes(permission)) {
      return { hasValidPermission: false, reason: 'NO_ACCESS' }
    }

    // All checks passed
    return { hasValidPermission: true, reason: null }
  } catch (error) {
    console.error('Error checking current user permission:', error)
    return { hasValidPermission: false, reason: 'ERROR' }
  }
}

/**
 * Check if always show badge scan is enabled
 * @returns {Promise<boolean>}
 */
export async function getAlwaysShowBadgeScan(http) {
  try {
    const response = await http.get('/general-setup/findByCode?code=ALWAYS_SHOW_BADGE_SCAN_POPUP')
    if (response.data && response.data.valeur) {
      return response.data.valeur.toLowerCase() === 'true'
    }
    return false // Default: false
  } catch (error) {
    console.error('Error getting ALWAYS_SHOW_BADGE_SCAN config:', error)
    return false
  }
}

/**
 * Scan badge and check permission
 * @param {string} badgeCode - Badge code to scan
 * @param {string} permission - Required permission
 * @param {Object} http - HTTP client
 * @param {number} sessionId - Optional session ID
 * @returns {Promise<Object>} - { success, hasPermission, user, failureReason }
 */
export async function scanBadge(badgeCode, permission, http, sessionId = null) {
  try {
    const response = await http.post('/badge/scan', {
      badgeCode: badgeCode.trim(),
      permission: permission,
      sessionId: sessionId
    })

    return {
      success: response.data.success,
      hasPermission: response.data.hasPermission || false,
      user: response.data.user || null,
      failureReason: response.data.failureReason || null
    }
  } catch (error) {
    console.error('Error scanning badge:', error)
    
    // Handle 400 Bad Request - API returns failureReason in response body
    if (error.response && error.response.status === 400 && error.response.data) {
      return {
        success: false,
        hasPermission: false,
        user: error.response.data.user || null,
        failureReason: error.response.data.failureReason || 'BADGE_SCAN_FAILED'
      }
    }
    
    // Handle other errors
    let failureReason = 'UNKNOWN_ERROR'
    if (error.response && error.response.data) {
      // Handle different error response formats
      if (error.response.data.failureReason) {
        failureReason = error.response.data.failureReason
      } else if (error.response.data.error) {
        // If error is an object, try to extract message
        if (typeof error.response.data.error === 'string') {
          failureReason = error.response.data.error
        } else if (error.response.data.error && typeof error.response.data.error === 'object' && error.response.data.error.message) {
          failureReason = error.response.data.error.message
        }
      } else if (error.response.data.message) {
        failureReason = error.response.data.message
      }
    } else if (error.message) {
      failureReason = error.message
    }

    return {
      success: false,
      hasPermission: false,
      user: null,
      failureReason: failureReason
    }
  }
}

/**
 * Check if badge has permission (without logging)
 * @param {string} badgeCode - Badge code
 * @param {string} permission - Required permission
 * @returns {Promise<Object>} - { hasPermission, isExpired, isRevoked, user }
 */
export async function checkBadgePermission(badgeCode, permission, http) {
  try {
    const response = await http.post('/badge/check-permission', {
      badgeCode: badgeCode.trim(),
      permission: permission
    })

    return {
      hasPermission: response.data.hasPermission || false,
      isExpired: response.data.isExpired || false,
      isRevoked: response.data.isRevoked || false,
      user: response.data.user || null
    }
  } catch (error) {
    console.error('Error checking badge permission:', error)
    return {
      hasPermission: false,
      isExpired: false,
      isRevoked: false,
      user: null
    }
  }
}

/**
 * Get failure reason message (translated)
 * @param {string} failureReason - Failure reason code
 * @param {Function} t - Optional translation function (if not provided, uses i18n directly)
 * @returns {string} - Translated message
 */
export function getFailureReasonMessage(failureReason, t = null) {
  if (!failureReason) {
    return 'Unknown error'
  }
  
  // Fallback messages in English
  const fallbackMessages = {
    'BADGE_NOT_EXISTS': 'Badge not found',
    'BADGE_NO_ACCESS': 'Badge does not have access to this feature',
    'BADGE_EXPIRED': 'Badge has expired',
    'BADGE_REVOKED': 'Badge has been revoked',
    'UNKNOWN_ERROR': 'An unexpected error occurred'
  }
  
  try {
    const reasonMap = {
      'BADGE_NOT_EXISTS': 'pos.badge.messages.badgeNotFound',
      'BADGE_NO_ACCESS': 'pos.badge.messages.badgeNoAccess',
      'BADGE_EXPIRED': 'pos.badge.messages.badgeExpired',
      'BADGE_REVOKED': 'pos.badge.messages.badgeRevoked',
      'UNKNOWN_ERROR': 'pos.badge.messages.unknownError'
    }
    const translationKey = reasonMap[failureReason] || 'pos.badge.messages.unknownError'
    
    // Use provided translation function or i18n instance directly
    let translated
    if (t && typeof t === 'function') {
      translated = t(translationKey)
    } else {
      // Use i18n instance directly
      translated = i18n.t(translationKey)
    }
    
    // If translation returns the key itself (translation not found), use fallback
    if (translated === translationKey) {
      return fallbackMessages[failureReason] || 'An unexpected error occurred'
    }
    return translated
  } catch (error) {
    console.error('Error getting failure reason message:', error)
    // Return fallback message on any error
    return fallbackMessages[failureReason] || 'An unexpected error occurred'
  }
}

export { BADGE_PERMISSIONS }

