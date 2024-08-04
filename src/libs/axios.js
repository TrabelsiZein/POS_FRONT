import Vue from 'vue'

// axios
import axios from 'axios'

const axiosIns = axios.create({
  baseURL: 'http://localhost:444/business_management/api/',
})

Vue.prototype.$http = axiosIns

export default axiosIns
