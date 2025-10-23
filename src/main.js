import Vue from 'vue';
import { ToastPlugin, ModalPlugin } from 'bootstrap-vue';
import VueCompositionAPI from '@vue/composition-api';
import { BootstrapVue } from 'bootstrap-vue';

import router from './router';
import store from './store';
import App from './App.vue';

// Global Components
import './global-components';

// 3rd party plugins
import '@/libs/portal-vue';
import '@/libs/toastification';
import '@/libs/acl';
import '@/libs/sweet-alerts';
import EntityLookup from '@/views/components/lookup/EntityLookup.vue'

Vue.use(BootstrapVue);
Vue.use(ToastPlugin);
Vue.use(ModalPlugin);
Vue.use(VueCompositionAPI);
Vue.component('EntityLookup', EntityLookup)

// import core styles
require('@core/scss/core.scss');
require('@/assets/scss/style.scss');

Vue.config.productionTip = false;

export const eventBus = new Vue();

(async () => {
  // Wait for external entities config to load
  await new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = '/config/entities-config.js';
    script.onload = resolve;
    script.onerror = () => {
      console.error('❌ Failed to load entities-config.js');
      reject();
    };
    document.head.appendChild(script);
  });

  // Mount the Vue app after the config is loaded
  new Vue({
    router,
    store,
    render: h => h(App),
  }).$mount('#app');
})();
