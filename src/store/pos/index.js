export default {
  namespaced: true,
  state: {
    cart: [],
    orderSummary: null,
    currentSession: null,
    sessionChecked: false, // Flag to track if we've checked session at least once
    pendingTicketId: null, // ID of pending ticket being worked on
    selectedCustomerId: null // Selected customer ID for current transaction
  },
  mutations: {
    SET_CART(state, cart) {
      state.cart = cart
    },
    SET_ORDER_SUMMARY(state, summary) {
      state.orderSummary = summary
    },
    CLEAR_CART(state) {
      state.cart = []
    },
    CLEAR_ORDER_SUMMARY(state) {
      state.orderSummary = null
    },
    SET_CURRENT_SESSION(state, session) {
      state.currentSession = session
      state.sessionChecked = true
    },
    CLEAR_CURRENT_SESSION(state) {
      state.currentSession = null
      state.sessionChecked = true
    },
    SET_SESSION_CHECKED(state, checked) {
      state.sessionChecked = checked
    },
    SET_PENDING_TICKET_ID(state, ticketId) {
      state.pendingTicketId = ticketId
    },
    CLEAR_PENDING_TICKET_ID(state) {
      state.pendingTicketId = null
    },
    SET_SELECTED_CUSTOMER_ID(state, customerId) {
      state.selectedCustomerId = customerId
    },
    CLEAR_SELECTED_CUSTOMER_ID(state) {
      state.selectedCustomerId = null
    }
  },
  actions: {
    setCart({ commit }, cart) {
      commit('SET_CART', cart)
    },
    setOrderSummary({ commit }, summary) {
      commit('SET_ORDER_SUMMARY', summary)
    },
    updateOrderSummary({ commit, state }, updates) {
      const currentSummary = state.orderSummary || {}
      commit('SET_ORDER_SUMMARY', { ...currentSummary, ...updates })
    },
    clearCart({ commit }) {
      commit('CLEAR_CART')
    },
    clearOrderSummary({ commit }) {
      commit('CLEAR_ORDER_SUMMARY')
    },
    async checkSession({ commit, state }) {
      // Only check if we haven't checked yet or session was cleared
      if (state.sessionChecked && state.currentSession) {
        return state.currentSession
      }

      try {
        const axios = (await import('@axios')).default
        const response = await axios.get('/cashier-session/current')
        
        if (response.data) {
          commit('SET_CURRENT_SESSION', response.data)
          return response.data
        } else {
          commit('CLEAR_CURRENT_SESSION')
          return null
        }
      } catch (error) {
        console.error('Error checking session:', error)
        commit('CLEAR_CURRENT_SESSION')
        return null
      }
    },
    setCurrentSession({ commit }, session) {
      commit('SET_CURRENT_SESSION', session)
    },
    clearCurrentSession({ commit }) {
      commit('CLEAR_CURRENT_SESSION')
    },
    resetSessionCheck({ commit }) {
      commit('SET_SESSION_CHECKED', false)
    },
    setPendingTicketId({ commit }, ticketId) {
      commit('SET_PENDING_TICKET_ID', ticketId)
    },
    clearPendingTicketId({ commit }) {
      commit('CLEAR_PENDING_TICKET_ID')
    },
    setSelectedCustomerId({ commit }, customerId) {
      commit('SET_SELECTED_CUSTOMER_ID', customerId)
    },
    clearSelectedCustomerId({ commit }) {
      commit('CLEAR_SELECTED_CUSTOMER_ID')
    }
  },
  getters: {
    hasOpenSession: state => state.currentSession !== null,
    isSessionChecked: state => state.sessionChecked
  }
}

