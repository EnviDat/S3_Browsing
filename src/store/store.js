import Vue from 'vue';
import Vuex from 'vuex';

import actions from './actions';
import mutations from './mutations';

Vue.use(Vuex);

const fallbackShowProtocols = !!(process.env.VUE_APP_SHOW_PROTOCOLS && process.env.VUE_APP_SHOW_PROTOCOLS === 'true');
const fallbackFileSelectionEnabled = !!(process.env.VUE_APP_FILE_SELECTION_ENABLED && process.env.VUE_APP_FILE_SELECTION_ENABLED === 'true');

// load all the png for the protocol images / icons
// an image can be access like via mappedState of the imagesPng
// and then use ex. this.imagesPng('./dav-100-2.png')
const imagesPng = require.context('../assets/', false, /\.png$/);

export default new Vuex.Store({
  state: {
    config: null,
    configLoading: false,
    configError: null,
    about: null,
    aboutLoading: false,
    aboutError: null,
    content: null,
    contentMap: null,
    contentMapFlat: null,
    contentLoading: false,
    contentError: null,
    imagesPng,
    fallbackContentUrl: process.env.VUE_APP_CONTENT_URL,
    fallbackDownloadDomain: process.env.VUE_APP_DOWNLOAD_DOMAIN,
    fallbackDefaultMaxKeys: process.env.VUE_APP_DEFAULT_MAX_KEYS,
    fallbackShowProtocols,
    fallbackFileSelectionEnabled,
    fallbackVendorUrl: process.env.VUE_APP_VENDOR_URL,
    fallbackCyberduckHost: process.env.VUE_APP_CYBERDUCK_HOST_NAME,
    fallbackCyberduckProfile: process.env.VUE_APP_CYBERDUCK_PROFILE_NAME,
    fallbackWebDAVDomainHttp: process.env.VUE_APP_WEBDAV_DOMAIN_HTTP,
    fallbackWebDAVDomainHttps: process.env.VUE_APP_WEBDAV_DOMAIN_HTTPS,
    fallbackWgetDomain: process.env.VUE_APP_WGET_DOMAIN,
    fallbackFtpDomain: process.env.VUE_APP_FTP_DOMAIN,
  },
  getters: {
    contentBucketName: (state) => (state.content?.ListBucketResult?.Name || 'Nothing loaded'),
    contentMap: (state) => (state.contentMap && Object.keys(state.contentMap).length > 0 ? state.contentMap : null),
    contentUrl: (state) => state.config?.contentUrl || state.fallbackContentUrl,
    downloadDomain: (state, getters) => (state.config?.downloadDomain || state.fallbackDownloadDomain || getters.contentUrl),
    defaultMaxKeys: (state) => {
      const configMKeys = state.config?.defaultMaxKeys || state.config?.DefaultMaxKeys;

      let fbMaxKeys = null;
      if (state.fallbackDefaultMaxKeys) {
        try {
          fbMaxKeys = Number.parseInt(state.fallbackDefaultMaxKeys, 10);
        } catch (e) {
          // eslint-disable-next-line no-console
          console.log(`Error while parsing the fallbackDefaultMaxKeys environment variable: ${e}`);
        }
      }

      return configMKeys || fbMaxKeys || 100000;
    },
    showProtocols: (state) => {
      const showProtocols = state.config?.showProtocols;
      
      if (showProtocols !== undefined && showProtocols !== null) {
        return showProtocols;
      }

      return state.fallbackShowProtocols;
    },
    fileSelectionEnabled: (state) => {
      const fileSelectionEnabled = state.config?.fileSelectionEnabled;

      if (fileSelectionEnabled !== undefined && fileSelectionEnabled !== null) {
        return fileSelectionEnabled;
      }

      return state.fallbackFileSelectionEnabled;
    },
    vendorUrl: (state) => state.config?.vendorUrl || state.fallbackVendorUrl,
    cyberduckHostName: (state) => state.config?.cyberduckHostName || state.fallbackCyberduckHost,
    cyberduckProfileName: (state) => state.config?.cyberduckProfileName || state.fallbackCyberduckProfile,
    WebDAVDomainHttp: (state) => state.config?.webDAVDomainHttp || state.fallbackWebDAVDomainHttp,
    WebDAVDomainHttps: (state) => state.config?.webDAVDomainHttps || state.fallbackWebDAVDomainHttps,
    wgetDomain: (state) => state.config?.wgetDomain || state.fallbackWgetDomain,
    ftpDomain: (state) => state.config?.ftpDomain || state.fallbackFtpDomain,
  },
  mutations,
  actions,
});
