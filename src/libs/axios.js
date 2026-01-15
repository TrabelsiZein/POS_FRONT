import Vue from 'vue'

// axios
import axios from 'axios'

const axiosIns = axios.create({
  // Backend runs on port 444 with context-path /pos/api
  baseURL: 'http://127.0.0.1:444/pos/api/',
  // baseURL: 'http://192.168.100.3:444/pos/api/',
  // baseURL: '/posws/',
})

Vue.prototype.$http = axiosIns

export default axiosIns
