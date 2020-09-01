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
    contentURL() {
      const configUrl = state.config?.contentUrl || state.config?.contenturl;

      if (configUrl) {
        return configUrl;
      }

      return state.fallbackContentUrl;
    },
    contentList() {
      return state.content?.ListBucketResult?.Contents;
    },
    contentMap() {
      return state.contentMap;
    },
  },
  mutations,
  actions,
});
