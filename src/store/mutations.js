/* eslint-disable no-underscore-dangle */
/**
 * @summary main store mutations
 * @author Dominik Haas-Artho
 *
 * Created at     : 2019-10-23 16:34:51
 * Last modified  : 2020-09-30 14:53:15
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */

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
  USER_BUCKET_URL,
  USER_BUCKET_URL_SUCCESS,
  USER_BUCKET_URL_ERROR,
} from '@/store/mutationsConsts';

import {
  getS3Map,
  getPrefixMap,
  mergeS3Maps,
  sanitaizePrefix,
} from './s3Factory';

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
  },
  [GET_ABOUT](state) {
    state.aboutLoading = true;
    state.about = null;
    state.aboutError = null;
  },
  [GET_ABOUT_SUCCESS](state, payload) {
    state.aboutLoading = false;
    state.about = payload;
  },
  [GET_ABOUT_ERROR](state, reason) {
    state.aboutLoading = false;
    state.aboutError = reason;
  },
  [GET_S3_CONTENT](state) {
    state.content = null;
    // this._vm.$set(state, 'contentMap', null);
    state.contentLoading = true;
    state.contentError = null;
  },
  [GET_S3_CONTENT_SUCCESS](state, payload) {
    const xml = payload.xml;
    state.content = xml;
    const baseUrl = payload.baseUrl || this.getters.downloadDomain;

    let contentList = xml?.ListBucketResult?.Contents;
    if (contentList && !(contentList instanceof Array)) {
      contentList = [contentList];
    }

    let prefixList = xml?.ListBucketResult?.CommonPrefixes;
    if (prefixList && !(prefixList instanceof Array)) {
      prefixList = [prefixList];
    }

    const prefix = xml?.ListBucketResult?.Prefix || '';
    const parentPrefix = sanitaizePrefix(prefix);

    const prefixMap = getPrefixMap(prefixList, baseUrl);
    const contentMap = getS3Map(contentList, baseUrl);

    let map = mergeS3Maps(contentMap, prefixMap, parentPrefix);

    if (state.contentMap) {
      map = mergeS3Maps(state.contentMap, map, parentPrefix);
    }

    state.contentLoading = false;
    this._vm.$set(state, 'contentMap', map);
  },
  [GET_S3_CONTENT_ERROR](state, reason) {
    state.contentLoading = false;
    state.contentError = reason;
    // const notificationObj = getSpecificApiError('Config could not ge loaded!', reason);
    // this.commit(ADD_USER_NOTIFICATION, notificationObj);
  },
  [USER_BUCKET_URL](state) {
    state.userInputBucketLoading = true;
  },
  [USER_BUCKET_URL_SUCCESS](state, newUrl) {
    state.userInputBucketUrl = newUrl;
    state.contentMap = null;
    state.userInputBucketLoading = false;
    state.userInputBucketError = false;
  },
  [USER_BUCKET_URL_ERROR](state) {
    state.userInputBucketLoading = false;
    state.userInputBucketError = true;
  },
};
