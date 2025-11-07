import useJwt from '@/auth/jwt/useJwt'

/**
 * Return if user is logged in
 * This is completely up to you and how you want to store the token in your frontend application
 * e.g. If you are using cookies to store the application please update this function
 */
// eslint-disable-next-line arrow-body-style
export const isUserLoggedIn = () => {
  return localStorage.getItem('userData') && localStorage.getItem(useJwt.jwtConfig.storageTokenKeyName)
}

export const getUserData = () => JSON.parse(localStorage.getItem('userData'))

/**
 * Get home route based on user role
 * @param {String} userRole Role of user (POS_USER, ADMIN, RESPONSIBLE)
 */
export const getHomeRouteForLoggedInUser = userRole => {
  if (userRole === 'POS_USER') {
    // Check if user has open session - if not, redirect to open session page
    // This check will be done in router guard, so we just return the item selection route
    return { name: 'pos-item-selection' }
  }
  if (userRole === 'RESPONSIBLE') return { name: 'responsible-sessions' }
  if (userRole === 'ADMIN') return { name: 'admin-sessions' }
  return { name: 'login' }
}

/**
 * Check if user has POS role
 */
export const isPosUser = () => {
  const userData = getUserData()
  return userData && userData.role === 'POS_USER'
}
