/* eslint-disable no-underscore-dangle */
/**
 * @summary main store mutations
 * @author Dominik Haas-Artho
 *
 * Created at     : 2019-10-23 16:34:51 
 * Last modified  : 2020-09-02 09:47:26
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */

import {
  GET_CONFIG,
  GET_CONFIG_SUCCESS,
  GET_CONFIG_ERROR,
  GET_TREE_CONTENT,
  GET_TREE_CONTENT_SUCCESS,
  GET_TREE_CONTENT_ERROR,
} from '@/store/mutationsConsts';

import { getS3Map } from './s3Factory';

export default {
  [GET_CONFIG](state) {
    state.configLoading = true;
    state.config = null;
    state.configError = null;
  },
  [GET_CONFIG_SUCCESS](state, payload) {
    state.configLoading = false;
    state.config = payload;
  },
  [GET_CONFIG_ERROR](state, reason) {
    state.configLoading = false;
    state.configError = reason;
    // const notificationObj = getSpecificApiError('Config could not ge loaded!', reason);
    // this.commit(ADD_USER_NOTIFICATION, notificationObj);
  },
  [GET_TREE_CONTENT](state) {
    state.content = null;
    this._vm.$set(state, 'contentMap', null);
    state.contentLoading = true;
    state.contentError = null;
  },
  [GET_TREE_CONTENT_SUCCESS](state, payload) {
    state.content = payload;

    const map = getS3Map(this.getters.contentList, this.getters.contentUrl);

    state.contentLoading = false;
    this._vm.$set(state, 'contentMap', map);
  },
  [GET_TREE_CONTENT_ERROR](state, reason) {
    state.contentLoading = false;
    state.contentError = reason;
    // const notificationObj = getSpecificApiError('Config could not ge loaded!', reason);
    // this.commit(ADD_USER_NOTIFICATION, notificationObj);
  },
};
