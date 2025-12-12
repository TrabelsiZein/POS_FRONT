import Vue from 'vue'

// axios
import axios from 'axios'

const axiosIns = axios.create({
  // Backend runs on port 444 with context-path /pos/api
  // baseURL: process.env.VUE_APP_API_BASE_URL  'http://127.0.0.1:444/pos/api/',
  baseURL: '/pos/api/',
})

Vue.prototype.$http = axiosIns

export default axiosIns
