/**
 * @summary main store actions
 * @author Dominik Haas-Artho
 *
 * Created at     : 2019-10-23 16:34:51
 * Last modified  : 2020-09-23 13:14:55
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */

import axios from 'axios';
import xmls2js from 'xml2js';

import {
  GET_CONFIG,
  GET_CONFIG_SUCCESS,
  GET_CONFIG_ERROR,
  GET_ABOUT,
  GET_ABOUT_SUCCESS,
  GET_ABOUT_ERROR,
  GET_S3_CONTENT,
  GET_S3_CONTENT_SUCCESS,
  GET_S3_CONTENT_ERROR,
} from '@/store/mutationsConsts';

const useTestData = !!(
  process.env.VUE_APP_USE_TESTDATA &&
  process.env.VUE_APP_USE_TESTDATA === 'true'
);

function buildParameterString(params) {
  const keys = Object.keys(params);

  if (keys.length > 0) {
    let urlParams = '?';

    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      urlParams += `${key}=${params[key]}&`;
    }

    urlParams = urlParams.substr(0, urlParams.length - 1);

    return urlParams;
  }

  return '';
}

export default {
  [GET_CONFIG]({ commit }, configURL) {
    if (configURL && configURL !== 'NULL') {
      commit(GET_CONFIG);

      const url = `${configURL}?nocache=${new Date().getTime()}`;

      axios
        .get(url)
        .then((response) => {
          let config = null;

          if (typeof response.data === 'string') {
            config = JSON.parse(response.data);
          } else {
            config = response.data;
          }

          commit(GET_CONFIG_SUCCESS, config);
        })
        .catch((reason) => {
          if (reason?.response?.status === 404) {
            commit(GET_CONFIG_SUCCESS, null);
          } else {
            commit(GET_CONFIG_ERROR, reason);
          }
        });
    }
  },
  [GET_ABOUT]({ commit }, aboutURL) {
    if (aboutURL && aboutURL !== 'NULL') {
      commit(GET_ABOUT);

      const url = `${aboutURL}?nocache=${new Date().getTime()}`;

      axios
        .get(url)
        .then((response) => {
          commit(GET_ABOUT_SUCCESS, response.data);
        })
        .catch((reason) => {
          if (reason?.response?.status === 404) {
            commit(GET_ABOUT_SUCCESS, null);
          } else {
            commit(GET_ABOUT_ERROR, reason);
          }
        });
    }
  },
  async [GET_S3_CONTENT]({ commit }, contentParams) {
    commit(GET_S3_CONTENT);

    const baseUrl = contentParams.url;
    let getParams = '';

    // remove url so it won't be part of the url parameters
    const testdataUrl = contentParams.url;
    delete contentParams.url;

    if (!contentParams.delimiter) {
      contentParams.delimiter = '/';
    }

    getParams = buildParameterString(contentParams);

    let requestUrl = `${baseUrl}${getParams}`;

    if (useTestData) {
      const splits = baseUrl.split('.');
      const testUrl = splits[1];
      let testParams = contentParams.prefix;

      if (testParams) {
        testParams = testParams.replaceAll('_', '-');
        testParams = testParams.replaceAll('/', '_');
        testParams += `.${splits[splits.length - 1]}`;

        requestUrl = `.${testUrl}_${testParams}`;
      } else {
        requestUrl = testdataUrl;
      }
    }

    await axios
      .get(requestUrl)
      .then((response) => {
        if (typeof response.data === 'string') {
          xmls2js
            .parseStringPromise(response.data, {
              explicitArray: false,
              trim: true,
            })
            .then((xml) => {
              commit(GET_S3_CONTENT_SUCCESS, {
                xml,
                baseUrl,
              });
            })
            .catch((reason) => {
              commit(GET_S3_CONTENT_ERROR, reason);
            });
        } else {
          commit(
            GET_S3_CONTENT_ERROR,
            `Got content respose in unexpected type ${typeof response.data}`,
          );
        }
      })
      .catch((reason) => {
        commit(GET_S3_CONTENT_ERROR, reason);
      });
  },
};
