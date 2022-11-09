/**
 * @summary config of vue cli services and it's webpack
 * @author Dominik Haas-Artho
 *
 * Created at     : 2020-09-01 11:27:52
 * Last modified  : 2020-09-02 17:15:40
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
/* eslint-disable no-console */

const fs = require('fs');
const dotenv = require('dotenv');

dotenv.config();
process.env.VUE_APP_VERSION = require('./package.json').version;

const version = process.env.VUE_APP_VERSION;
const useTestData = !!(
  process.env.VUE_APP_USE_TESTDATA &&
  process.env.VUE_APP_USE_TESTDATA === 'true'
);
const isProd = process.env.NODE_ENV === 'production';

if (isProd) {
  const fileName = `version_${version}.txt`;
  const filePath = `${__dirname}/public/${fileName}`;

  fs.writeFile(filePath, version, (err) => {
    if (err) {
      return console.log(`Tried to created file ${fileName}. Error: ${err}`);
    }

    return console.log(
      `Created version file ${fileName} for easy build version highlight.`,
    );
  });
}

console.log(
  `starting ${version} with use of testdata '${useTestData}' on ${process.env.NODE_ENV}`,
);

module.exports = {
  transpileDependencies: ['vuetify'],
  publicPath: './',
  assetsDir: './static',
  runtimeCompiler: true,
  css: {
    sourceMap: true,
  },
  configureWebpack: {
    devtool: 'source-map',
    optimization: {
      splitChunks: {
        minSize: 10000,
        maxSize: 250000,
      },
    },
  },
};
