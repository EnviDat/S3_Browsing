import Vue from 'vue';
import Vuex from 'vuex';

import actions from './actions';
import mutations from './mutations';

Vue.use(Vuex);

/* eslint-disable no-unused-vars */

export default new Vuex.Store({
  state: {
    config: null,
    configLoading: false,
    configError: null,
    fallbackContentUrl: process.env.VUE_APP_CONTENT_URL,
    content: null,
    contentMap: null,
    contentLoading: false,
    contentError: null,
    fallbackDefaultMaxKeys: process.env.VUE_APP_DEFAULT_MAX_KEYS,
  },
  getters: {
    contentUrl: (state, getters) => {
      const configUrl = state.config?.contentUrl || state.config?.contentURL;

      if (configUrl) {
        return configUrl;
      }

      return state.fallbackContentUrl;
    },
    defaultMaxKeys: (state, getters) => {
      const configMKeys = state.config?.defaultMaxKeys || state.config?.DefaultMaxKeys;

      let fbMaxKeys = null;
      try {
        fbMaxKeys = Number.parseInt(state.fallbackDefaultMaxKeys, 10);
      } catch (e) {
        // eslint-disable-next-line no-console
        console.log(`Error while parsing the fallbackDefaultMaxKeys environment variable: ${e}`);
      }

      return configMKeys || fbMaxKeys || 100000;
    },
    contentBucketName: (state, getters) => (state.content?.ListBucketResult?.Name || 'Nothing loaded'),
    contentMap: (state, getters) => (state.contentMap && Object.keys(state.contentMap).length > 0 ? state.contentMap : null),
    downloadDomain: (state, getters) => (state.config?.downloadDomain || getters.contentUrl),
  },
  mutations,
  actions,
});
