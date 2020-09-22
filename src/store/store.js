import Vue from 'vue';
import Vuex from 'vuex';

import actions from './actions';
import mutations from './mutations';

Vue.use(Vuex);

const state = {
  config: null,
  configLoading: false,
  configError: null,
  fallbackContentUrl: process.env.VUE_APP_CONTENT_URL,
  content: null,
  contentMap: null,
  contentLoading: false,
  contentError: null,
};

export default new Vuex.Store({
  state,
  getters: {
    contentUrl() {
      const configUrl = state.config?.contentUrl || state.config?.contentURL;

      if (configUrl) {
        return configUrl;
      }

      return state.fallbackContentUrl;
    },
    contentBucketName() {
      return state.content?.ListBucketResult?.Name || 'Nothing loaded';
    },
    contentMap() {
      // return state.contentMap?.size > 0 ? state.contentMap : null;
      return state.contentMap && Object.keys(state.contentMap).length > 0 ? state.contentMap : null;
    },
  },
  mutations,
  actions,
});
