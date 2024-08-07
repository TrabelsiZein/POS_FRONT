import Vue from 'vue'

// axios
import axios from 'axios'

const axiosIns = axios.create({
  baseURL: 'http://localhost:444/business_management/api/',
  // baseURL: 'http://155.133.27.175/business_management/',
  // baseURL: '/business_management/',
})

Vue.prototype.$http = axiosIns

export default axiosIns
