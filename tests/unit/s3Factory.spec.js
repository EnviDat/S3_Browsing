/* eslint-disable no-unused-vars */
import xml2js from 'xml2js';
import { resolve } from 'path';
import fs from 'fs';

import {
  convertPrefixToMap,
  getS3Map,
  mergeS3Maps,
} from '../../src/store/s3Factory';

import config from '../../public/testdata/config.json';

const baseUrl = config.contentUrl || config.contentURL || '';
const delimiter = config.delimiter || '/';

function getXmlStringFromFile(fileName) {
  const filePath = resolve(__dirname, `../../public/testdata/${fileName}`);
  // console.log(`testing with file: ${filePath}`);

  return fs.readFileSync(filePath, { encoding: 'utf8' });
}

describe('S3 Factory basic calls starting from root', () => {

  let fileName = 's3_envicloud_root.xml';
  const s3Root = getXmlStringFromFile(fileName);
  let prefixMap = null;

  it(`- convertPrefixToMap() with ${fileName}`, async () => {
    expect(typeof s3Root).toBe('string');

    let prefixList = null;

    const xml = await xml2js.parseStringPromise(s3Root, { explicitArray: false, trim: true });

    prefixList = xml?.ListBucketResult?.CommonPrefixes;
    expect(prefixList).not.toBe(undefined);
    expect(prefixList).toBeInstanceOf(Array);

    prefixMap = convertPrefixToMap(prefixList, baseUrl, delimiter);
  }); 

  fileName = 's3_envicloud_chelsa_cmip5_ts_content.xml';
  const s3Content = getXmlStringFromFile(fileName);
  let contentMap = null;
  let parent = null;
  let contentParent = null;
  
  it(`- getS3Map() with ${fileName}`, async () => {
    expect(typeof s3Content).toBe('string');

    let contentList = null;

    const xml = await xml2js.parseStringPromise(s3Content, { explicitArray: false, trim: true });

    contentList = xml?.ListBucketResult?.Contents;
    parent = xml?.ListBucketResult?.Prefix;
    contentParent = parent;

    expect(contentList).not.toBe(undefined);
    expect(contentList).toBeInstanceOf(Array);

    contentMap = getS3Map(contentList, baseUrl, delimiter);
  });

  fileName = 's3_envicloud_chelsa_prefix.xml';
  const s3PrefixChelsa = getXmlStringFromFile(fileName);
  let mergedMap = null;

  it(`- mergeS3Maps() ${fileName} prefix files `, async () => {
    expect(typeof s3PrefixChelsa).toBe('string');

    let prefixList = null;

    const xml = await xml2js.parseStringPromise(s3PrefixChelsa, { explicitArray: false, trim: true });

    prefixList = xml?.ListBucketResult?.CommonPrefixes;
    parent = xml?.ListBucketResult?.Prefix;

    expect(prefixList).not.toBe(undefined);
    expect(prefixList).toBeInstanceOf(Array);

    const prefixChelsaMap = convertPrefixToMap(prefixList, baseUrl, delimiter);
    mergedMap = mergeS3Maps(prefixMap, prefixChelsaMap, parent);

    const mergedValues = Object.values(mergedMap);
    const firstDir = mergedValues[0];

    expect(firstDir).not.toBe(undefined);
    expect(firstDir.children.length).toBeGreaterThan(0);

    const firstSubDir = firstDir.children[0];
    expect(firstSubDir).not.toBe(undefined);
    expect(firstSubDir.children.length).toBe(0);
  });

  fileName = 's3_envicloud_chelsaV1_prefix.xml';
  const s3PrefixChelsaV1 = getXmlStringFromFile(fileName);

  it(`- mergeS3Maps() ${fileName} prefix files `, async () => {
    expect(typeof s3PrefixChelsaV1).toBe('string');

    let prefixList = null;

    const xml = await xml2js.parseStringPromise(s3PrefixChelsaV1, { explicitArray: false, trim: true });

    prefixList = xml?.ListBucketResult?.CommonPrefixes;
    parent = xml?.ListBucketResult?.Prefix;

    expect(prefixList).not.toBe(undefined);
    expect(prefixList).toBeInstanceOf(Array);

    const prefixChelsaMap = convertPrefixToMap(prefixList, baseUrl, delimiter);
    mergedMap = mergeS3Maps(mergedMap, prefixChelsaMap, parent);

    const mergedValues = Object.values(mergedMap);
    const chelsaDir = mergedValues[0];

    expect(chelsaDir).not.toBe(undefined);
    expect(chelsaDir.children.length).toBeGreaterThan(0);

    const chelsaV1Dir = chelsaDir.children[0];
    expect(chelsaV1Dir).not.toBe(undefined);
    expect(chelsaV1Dir.children.length).toBeGreaterThan(0);

    const chelsaV1Cmip5Dir = chelsaV1Dir.children[0];
    expect(chelsaV1Cmip5Dir).not.toBe(undefined);
    expect(chelsaV1Cmip5Dir.children.length).not.toBeGreaterThan(0);
  });

  it('- mergeS3Maps() contentMap', async () => {

    const contentKeys = Object.keys(contentMap);
    expect(contentKeys.length).toBeGreaterThan(0);

    const prefixKeys = Object.keys(mergedMap);
    expect(prefixKeys.length).toBeGreaterThan(0);

    mergedMap = mergeS3Maps(mergedMap, contentMap, contentParent);

    const mergedValues = Object.values(mergedMap);
    const chelsaDir = mergedValues[0];

    expect(chelsaDir).not.toBe(undefined);
    expect(chelsaDir.children.length).toBeGreaterThan(0);

    const chelsaV1Dir = chelsaDir.children[0];
    expect(chelsaV1Dir).not.toBe(undefined);
    expect(chelsaV1Dir.children.length).toBeGreaterThan(0);

    const chelsaV1Cmip5Dir = chelsaV1Dir.children[0];
    expect(chelsaV1Cmip5Dir).not.toBe(undefined);
    expect(chelsaV1Cmip5Dir.children.length).toBeGreaterThan(0);
  });

});

describe('S3 Factory starting directly on a prefix', () => {

  let fileName = 's3_envicloud_chelsa_cmip5_ts_content.xml';
  const s3Content = getXmlStringFromFile(fileName);
  let parent = null;

  fileName = 's3_envicloud_chelsa_prefix.xml';
  const s3PrefixChelsa = getXmlStringFromFile(fileName);
  let mergedMap = null;

  it(`- convertPrefixToMap() ${fileName} prefix files `, async () => {
    expect(typeof s3PrefixChelsa).toBe('string');

    let prefixList = null;

    const xml = await xml2js.parseStringPromise(s3PrefixChelsa, { explicitArray: false, trim: true });

    prefixList = xml?.ListBucketResult?.CommonPrefixes;
    parent = xml?.ListBucketResult?.Prefix;

    expect(prefixList).not.toBe(undefined);
    expect(prefixList).toBeInstanceOf(Array);

    mergedMap = convertPrefixToMap(prefixList, baseUrl, delimiter);

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

    const xml = await xml2js.parseStringPromise(s3PrefixChelsaV1, { explicitArray: false, trim: true });

    prefixList = xml?.ListBucketResult?.CommonPrefixes;
    parent = xml?.ListBucketResult?.Prefix;

    expect(prefixList).not.toBe(undefined);
    expect(prefixList).toBeInstanceOf(Array);

    const prefixChelsaMap = convertPrefixToMap(prefixList, baseUrl, delimiter);
    mergedMap = mergeS3Maps(mergedMap, prefixChelsaMap, parent);

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

    const xml = await xml2js.parseStringPromise(s3Content, { explicitArray: false, trim: true });

    contentList = xml?.ListBucketResult?.Contents;
    parent = xml?.ListBucketResult?.Prefix;

    expect(contentList).not.toBe(undefined);
    expect(contentList).toBeInstanceOf(Array);

    contentMap = getS3Map(contentList, baseUrl, delimiter);

    const contentKeys = Object.keys(contentMap);
    expect(contentKeys.length).toBeGreaterThan(0);

    mergedMap = mergeS3Maps(mergedMap, contentMap, parent);

    const mergedValues = Object.values(mergedMap);
    const chelsaDir = mergedValues[0];

    expect(chelsaDir).not.toBe(undefined);
    expect(chelsaDir.children.length).toBeGreaterThan(0);

    const chelsaV1Cmip5Dir = chelsaDir.children[0];
    expect(chelsaV1Cmip5Dir).not.toBe(undefined);
    expect(chelsaV1Cmip5Dir.children.length).toBeGreaterThan(0);
  });

});
