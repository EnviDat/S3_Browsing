/* eslint-disable no-unused-vars */
import xml2js from 'xml2js';
import { resolve } from 'path';
import fs from 'fs';

import {
  getPrefixMap,
  getS3Map,
  mergeS3Maps,
  getParentPath,
} from '../../src/store/s3Factory';

import config from '../../public/testdata/config.json';

const baseUrl = config.contentUrl || config.contentURL || '';
const delimiter = config.delimiter || '/';
const xmlParseOptions = {
  explicitArray: false,
  trim: true,
};
const mergedTime = [];
let before = null;

function getXmlStringFromFile(fileName) {
  const filePath = resolve(__dirname, `../../public/testdata/${fileName}`);
  // console.log(`testing with file: ${filePath}`);

  return fs.readFileSync(filePath, { encoding: 'utf8' });
}

describe('S3 Factory starting directly on a prefix', () => {

  let fileName = 's3_envicloud_chelsa_cmip5_ts_content.xml';
  const s3Content = getXmlStringFromFile(fileName);
  let parent = null;

  fileName = 's3_envicloud_chelsa_prefix.xml';
  const s3PrefixChelsa = getXmlStringFromFile(fileName);
  let mergedMap = null;

  it(`- getPrefixMap() ${fileName} prefix files `, async () => {
    expect(typeof s3PrefixChelsa).toBe('string');

    let prefixList = null;

    const xml = await xml2js.parseStringPromise(s3PrefixChelsa, xmlParseOptions);

    prefixList = xml?.ListBucketResult?.CommonPrefixes;
    parent = xml?.ListBucketResult?.Prefix;

    expect(prefixList).not.toBe(undefined);
    expect(prefixList).toBeInstanceOf(Array);

    mergedMap = getPrefixMap(prefixList, baseUrl, delimiter);

    const mergedValues = Object.values(mergedMap);
    const firstDir = mergedValues[0];

    expect(firstDir).not.toBe(undefined);
    expect(firstDir.children.length).toBe(0);
  });

  fileName = 's3_envicloud_chelsaV1_prefix.xml';
  const s3PrefixChelsaV1 = getXmlStringFromFile(fileName);

  it(`- mergeS3Maps() ${fileName} prefix files `, async () => {
    expect(typeof s3PrefixChelsaV1).toBe('string');

    let prefixList = null;

    const xml = await xml2js.parseStringPromise(s3PrefixChelsaV1, xmlParseOptions);

    prefixList = xml?.ListBucketResult?.CommonPrefixes;
    parent = xml?.ListBucketResult?.Prefix;

    expect(prefixList).not.toBe(undefined);
    expect(prefixList).toBeInstanceOf(Array);

    const prefixChelsaMap = getPrefixMap(prefixList, baseUrl, delimiter);

    before = performance.now();
    mergedMap = mergeS3Maps(mergedMap, prefixChelsaMap, parent);
    mergedTime.push((performance.now() - before));

    const mergedValues = Object.values(mergedMap);
    const chelsaDir = mergedValues[0];

    expect(chelsaDir).not.toBe(undefined);
    expect(chelsaDir.children.length).toBeGreaterThan(0);

    const chelsaV1Dir = chelsaDir.children[0];
    expect(chelsaV1Dir).not.toBe(undefined);
    expect(chelsaV1Dir.children.length).toBe(0);
  });

  let contentMap = null;
  it(`- mergeS3Maps() with contentMap from ${fileName}`, async () => {
    expect(typeof s3Content).toBe('string');

    let contentList = null;

    const xml = await xml2js.parseStringPromise(s3Content, xmlParseOptions);

    contentList = xml?.ListBucketResult?.Contents;
    parent = xml?.ListBucketResult?.Prefix;

    expect(contentList).not.toBe(undefined);
    expect(contentList).toBeInstanceOf(Array);

    contentMap = getS3Map(contentList, baseUrl, delimiter);

    const contentKeys = Object.keys(contentMap);
    expect(contentKeys.length).toBeGreaterThan(0);

    before = performance.now();
    mergedMap = mergeS3Maps(mergedMap, contentMap, parent);
    mergedTime.push((performance.now() - before));

    const mergedValues = Object.values(mergedMap);
    const chelsaDir = mergedValues[0];

    expect(chelsaDir).not.toBe(undefined);
    expect(chelsaDir.children.length).toBeGreaterThan(0);

    const chelsaV1Cmip5Dir = chelsaDir.children[0];
    expect(chelsaV1Cmip5Dir).not.toBe(undefined);
    expect(chelsaV1Cmip5Dir.children.length).toBeGreaterThan(0);
  });

});

describe('S3 Factory testing subfunctions with prefixes', () => {

  let fileName = 's3_envicloud_chelsaV1_prefix.xml';
  const s3PrefixChelsaV1 = getXmlStringFromFile(fileName);

  fileName = 's3_envicloud_chelsa_cruts_prefix.xml';
  const s3PrefixCruts = getXmlStringFromFile(fileName);

  fileName = 's3_envicloud_chelsa_cruts_tmin_content.xml';
  const s3ContentTmin = getXmlStringFromFile(fileName);

  fileName = 's3_envicloud_chelsa_cruts_prec_content.xml';
  const s3ContentPrec = getXmlStringFromFile(fileName);

  it('- multi call of mergeS3Maps() with the use of getParentDirectory', async () => {

    let xml = await xml2js.parseStringPromise(s3PrefixChelsaV1, xmlParseOptions);
    let prefixList = xml?.ListBucketResult?.CommonPrefixes;
    let contentList = xml?.ListBucketResult?.Contents;
    let parent = xml?.ListBucketResult?.Prefix;
    let mainMap = {};

    const prefixMapV1 = getPrefixMap(prefixList, baseUrl, delimiter);
    const contentMapV1 = getS3Map(contentList, baseUrl, delimiter);

    before = performance.now();
    mainMap = mergeS3Maps(prefixMapV1, contentMapV1, parent, delimiter);
    mergedTime.push((performance.now() - before));

    xml = await xml2js.parseStringPromise(s3PrefixCruts, xmlParseOptions);
    prefixList = xml?.ListBucketResult?.CommonPrefixes;
    contentList = xml?.ListBucketResult?.Contents;
    parent = xml?.ListBucketResult?.Prefix;

    const prefixMapCruts = getPrefixMap(prefixList, baseUrl, delimiter);
    const contentMapCruts = getS3Map(contentList, baseUrl, delimiter);

    before = performance.now();
    const mergedMapCruts = mergeS3Maps(prefixMapCruts, contentMapCruts, parent, delimiter);
    mergedTime.push((performance.now() - before));

    before = performance.now();
    mainMap = mergeS3Maps(mainMap, mergedMapCruts, parent, delimiter);
    mergedTime.push((performance.now() - before));

    xml = await xml2js.parseStringPromise(s3ContentTmin, xmlParseOptions);
    prefixList = xml?.ListBucketResult?.CommonPrefixes;
    contentList = xml?.ListBucketResult?.Contents;
    parent = xml?.ListBucketResult?.Prefix;

    const prefixMapTmin = getPrefixMap(prefixList, baseUrl, delimiter);
    const contentMapTmin = getS3Map(contentList, baseUrl, delimiter);
    const mergedMapTmin = mergeS3Maps(prefixMapTmin, contentMapTmin, parent, delimiter);

    before = performance.now();
    mainMap = mergeS3Maps(mainMap, mergedMapTmin, parent, delimiter);
    mergedTime.push((performance.now() - before));

    xml = await xml2js.parseStringPromise(s3ContentPrec, xmlParseOptions);
    prefixList = xml?.ListBucketResult?.CommonPrefixes;
    contentList = xml?.ListBucketResult?.Contents;
    parent = xml?.ListBucketResult?.Prefix;

    const prefixMapPrec = getPrefixMap(prefixList, baseUrl, delimiter);
    const contentMapPrec = getS3Map(contentList, baseUrl, delimiter);
    const mergedMapPrec = mergeS3Maps(prefixMapPrec, contentMapPrec, parent, delimiter);

    before = performance.now();
    mainMap = mergeS3Maps(mainMap, mergedMapPrec, parent, delimiter);
    mergedTime.push((performance.now() - before));

  });

  it('- getParentPath() ', async () => {
    const xml = await xml2js.parseStringPromise(s3PrefixChelsaV1, xmlParseOptions);
    const prefixList = xml?.ListBucketResult?.CommonPrefixes || [];
    const prefix = xml?.ListBucketResult?.Prefix;
    // let contentList = xml?.ListBucketResult?.Contents;

    let parentPath = getParentPath('chelsa/', delimiter);
    expect(parentPath).toBe(null);

    parentPath = getParentPath('index.html', delimiter);
    expect(parentPath).toBe('/');

    parentPath = getParentPath('chelsa/chelsa_V1/chelsa_cruts/prec/CHELSAcruts_prec_10_1901_V.1.0.tif', delimiter);
    expect(parentPath).toBe('chelsa_cruts/');

    parentPath = getParentPath('chelsa/chelsa_V1/chelsa_cruts/tmin/CHELSAcruts_tmin_10_1903_V.1.0.tif', delimiter);
    expect(parentPath).toBe('chelsa_cruts/');   

    parentPath = getParentPath(prefixList[0].Prefix, delimiter);
    expect(parentPath).not.toBe(null);
    expect(parentPath).not.toBe(prefix);
    expect(parentPath).toBe('chelsa_V1/');    

    parentPath = getParentPath(prefixList[1].Prefix, delimiter);
    expect(parentPath).not.toBe(null);
    expect(parentPath).not.toBe(prefix);
    expect(parentPath).toBe('chelsa_V1/');    

    parentPath = getParentPath('chelsa/chelsa_V1/climatologies/', delimiter);
    expect(parentPath).not.toBe(null);
    expect(parentPath).not.toBe(prefix);
    expect(parentPath).toBe('chelsa_V1/');    
    
  });

  fileName = 's3_envicloud_root.xml';
  const rootContent = getXmlStringFromFile(fileName);

  fileName = 's3_envicloud_slf_prefix.xml';
  const slfPrefix = getXmlStringFromFile(fileName);

  fileName = 's3_envicloud_slf_snow_and_permaforst_prefix.xml';
  const slfSandPPrefix = getXmlStringFromFile(fileName);

  // fileName = 's3_envicloud_slf_GCOS_content.xml';
  // const slfGCOSContent = getXmlStringFromFile(fileName);

  it('- multi call of mergeS3Maps() with slf prefixes from root', async () => {

    let xml = await xml2js.parseStringPromise(rootContent, xmlParseOptions);
    let prefixList = xml?.ListBucketResult?.CommonPrefixes;
    let contentList = xml?.ListBucketResult?.Contents;
    let parent = xml?.ListBucketResult?.Prefix;
    let mainMap = {};

    if (!(contentList instanceof Array)) {
      contentList = [contentList];
    }

    if (!(prefixList instanceof Array)) {
      prefixList = [prefixList];
    }

    const prefixRoot = getPrefixMap(prefixList, baseUrl, delimiter);
    const contentRoot = getS3Map(contentList, baseUrl, delimiter);

    before = performance.now();
    mainMap = mergeS3Maps(prefixRoot, contentRoot, parent, delimiter);
    mergedTime.push((performance.now() - before));

    xml = await xml2js.parseStringPromise(slfPrefix, xmlParseOptions);
    prefixList = xml?.ListBucketResult?.CommonPrefixes;
    contentList = xml?.ListBucketResult?.Contents;
    parent = xml?.ListBucketResult?.Prefix;

    if (!(contentList instanceof Array)) {
      contentList = [contentList];
    }

    const prefixSlf = getPrefixMap(prefixList, baseUrl, delimiter);
    const contentSlf = getS3Map(contentList, baseUrl, delimiter);

    before = performance.now();
    const mergedMapSlf = mergeS3Maps(prefixSlf, contentSlf, parent, delimiter);
    mergedTime.push((performance.now() - before));

    before = performance.now();
    mainMap = mergeS3Maps(mainMap, mergedMapSlf, parent, delimiter);
    mergedTime.push((performance.now() - before));

    xml = await xml2js.parseStringPromise(slfSandPPrefix, xmlParseOptions);
    prefixList = xml?.ListBucketResult?.CommonPrefixes;
    contentList = xml?.ListBucketResult?.Contents;
    parent = xml?.ListBucketResult?.Prefix;

    if (!(contentList instanceof Array)) {
      contentList = [contentList];
    }

    const prefixSandP = getPrefixMap(prefixList, baseUrl, delimiter);
    const contentSandP = getS3Map(contentList, baseUrl, delimiter);

    before = performance.now();
    const mergedMapSandP = mergeS3Maps(prefixSandP, contentSandP, parent, delimiter);
    mergedTime.push((performance.now() - before));

    before = performance.now();
    mainMap = mergeS3Maps(mainMap, mergedMapSandP, parent, delimiter);
    mergedTime.push((performance.now() - before));

    // xml = await xml2js.parseStringPromise(s3ContentPrec, xmlParseOptions);
    // prefixList = xml?.ListBucketResult?.CommonPrefixes;
    // contentList = xml?.ListBucketResult?.Contents;
    // parent = xml?.ListBucketResult?.Prefix;

    // const prefixMapPrec = getPrefixMap(prefixList, baseUrl, delimiter);
    // const contentMapPrec = getS3Map(contentList, baseUrl, delimiter);
    // const mergedMapPrec = mergeS3Maps(prefixMapPrec, contentMapPrec, parent, delimiter);

    // mainMap = mergeS3Maps(mainMap, mergedMapPrec, parent, delimiter);

  });

  it('- multi call of mergeS3Maps() with slf prefixes', async () => {

    let xml = await xml2js.parseStringPromise(slfPrefix, xmlParseOptions);
    let prefixList = xml?.ListBucketResult?.CommonPrefixes;
    let contentList = xml?.ListBucketResult?.Contents;
    let parent = xml?.ListBucketResult?.Prefix;
    let mainMap = {};

    if (!(contentList instanceof Array)) {
      contentList = [contentList];
    }

    if (!(prefixList instanceof Array)) {
      prefixList = [prefixList];
    }

    const prefixSlf = getPrefixMap(prefixList, baseUrl, delimiter);
    const prefixSlfKeys = Object.keys(prefixSlf);
    expect(prefixSlfKeys.length).toBeGreaterThan(0);

    const contentSlf = getS3Map(contentList, baseUrl, delimiter);
    const contentSlfKeys = Object.keys(contentSlf);
    expect(contentSlfKeys.length).toBeGreaterThan(0);

    before = performance.now();
    const mergedMapSlf = mergeS3Maps(contentSlf, prefixSlf, parent, delimiter);
    mergedTime.push((performance.now() - before));

    const mergedMapSlfKeys = Object.keys(mergedMapSlf);
    expect(mergedMapSlfKeys.length).toBe(contentSlfKeys.length);

    before = performance.now();
    mainMap = mergeS3Maps(mainMap, mergedMapSlf, parent, delimiter);
    mergedTime.push((performance.now() - before));

    xml = await xml2js.parseStringPromise(slfSandPPrefix, xmlParseOptions);
    prefixList = xml?.ListBucketResult?.CommonPrefixes;
    contentList = xml?.ListBucketResult?.Contents;
    parent = xml?.ListBucketResult?.Prefix;

    if (!(contentList instanceof Array)) {
      contentList = [contentList];
    }

    const prefixSandP = getPrefixMap(prefixList, baseUrl, delimiter);
    const contentSandP = getS3Map(contentList, baseUrl, delimiter);

    before = performance.now();
    const mergedMapSandP = mergeS3Maps(prefixSandP, contentSandP, parent, delimiter);
    mergedTime.push((performance.now() - before));

    before = performance.now();
    mainMap = mergeS3Maps(mainMap, mergedMapSandP, parent, delimiter);
    mergedTime.push((performance.now() - before));

    // xml = await xml2js.parseStringPromise(s3ContentPrec, xmlParseOptions);
    // prefixList = xml?.ListBucketResult?.CommonPrefixes;
    // contentList = xml?.ListBucketResult?.Contents;
    // parent = xml?.ListBucketResult?.Prefix;

    // const prefixMapPrec = getPrefixMap(prefixList, baseUrl, delimiter);
    // const contentMapPrec = getS3Map(contentList, baseUrl, delimiter);
    // const mergedMapPrec = mergeS3Maps(prefixMapPrec, contentMapPrec, parent, delimiter);

    // mainMap = mergeS3Maps(mainMap, mergedMapPrec, parent, delimiter);

  });

  it('- log the mergedTime performance', () => {

    if (mergedTime.length > 0) {
      const entries = mergedTime.length;

      const sum = mergedTime.reduce((x, y) => x + y);
      const average = sum / entries;
      console.log(`merged ${entries} entries in ${average} averaged`);
    }
  });

});
