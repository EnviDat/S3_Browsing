import Vue from 'vue';
import App from './App';
import vuetify from './plugins/vuetify';
import store from './store/store';
import router from './router';

Vue.config.productionTip = false;

// eslint-disable-next-line no-new
new Vue({
  el: '#app',
  vuetify,
  components: { App },
  store,
  router,
  template: '<App/>',
});
