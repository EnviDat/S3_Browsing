/**
 * Vuetify plugin definitions.
 *
 * @summary Vuetify plugin definitions.
 * @author Dominik Haas-Artho
 *
 * Created at     : 2019-10-23 16:11:52 
 * Last modified  : 2020-09-01 12:16:11
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import Vue from 'vue';
import Vuetify from 'vuetify/lib';
import config from './vuetifyConfig';

// import 'material-design-icons-iconfont/dist/material-design-icons.css';

Vue.use(Vuetify);

export default new Vuetify(config);
