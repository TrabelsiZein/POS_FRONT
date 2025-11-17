import Vue from 'vue'

// axios
import axios from 'axios'

const axiosIns = axios.create({
  // Update this to match your backend URL
  // Backend runs on port 444 with context-path /pos/api
  baseURL: process.env.VUE_APP_API_BASE_URL || 'http://192.168.100.3:444/pos/api/',
})

Vue.prototype.$http = axiosIns

export default axiosIns
