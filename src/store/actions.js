/**
 * @summary main store actions
 * @author Dominik Haas-Artho
 *
 * Created at     : 2019-10-23 16:34:51 
 * Last modified  : 2020-09-02 16:43:04
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
  GET_TREE_CONTENT,
  GET_TREE_CONTENT_SUCCESS,
  GET_TREE_CONTENT_ERROR,
} from '@/store/mutationsConsts';

export default {
  [GET_CONFIG]({ commit }, configURL) {
    if (configURL && configURL !== 'NULL') {

      commit(GET_CONFIG);

      const url = `${configURL}?nocache=${new Date().getTime()}`;

      axios.get(url)
        .then((response) => {
          let config = null;

          if (typeof (response.data) === 'string') {
            config = JSON.parse(response.data);
          } else {
            config = response.data;
          }

          commit(GET_CONFIG_SUCCESS, config);
        })
        .catch((reason) => {
          commit(GET_CONFIG_ERROR, reason);
        });
    }
  },
  [GET_TREE_CONTENT]({ commit }) {
    
    commit(GET_TREE_CONTENT);
    
    const contentURL = this.getters.contentURL;

    axios.get(contentURL)
      .then((response) => {

        if (typeof (response.data) === 'string') {

          xmls2js.parseStringPromise(response.data, {
            explicitArray: false,
            trim: true,
          })
            .then((xml) => {
              commit(GET_TREE_CONTENT_SUCCESS, xml);
            })
            .catch((reason) => {
              commit(GET_TREE_CONTENT_ERROR, reason);
            });
        } else {
          commit(GET_TREE_CONTENT_ERROR, `Got content respose in unexpected type ${typeof (response.data)}`);
        }
        
      })
      .catch((reason) => {
        commit(GET_TREE_CONTENT_ERROR, reason);
      });
  },
};
