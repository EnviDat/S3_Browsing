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
const xmlParseOptions = {
  explicitArray: false,
  trim: true,
};

function getXmlStringFromFile(fileName) {
  const filePath = resolve(__dirname, `../../public/testdata/${fileName}`);
  // console.log(`testing with file: ${filePath}`);

  return fs.readFileSync(filePath, { encoding: 'utf8' });
}

describe('S3 Factory basic calls starting from root', () => {

  let fileName = 's3_envicloud_root.xml';
  const s3Root = getXmlStringFromFile(fileName);
  let prefixMap = null;

  it('- reading XML file and returing a string', () => {
    expect(typeof s3Root).toBe('string');
  });

  let rootXml = null;
  let prefixList = null;
  let contentList = null;
  let parent = null;
  
  it(`- parsing xml of file ${fileName}`, async () => {
    rootXml = await xml2js.parseStringPromise(s3Root, xmlParseOptions);

    prefixList = rootXml?.ListBucketResult?.CommonPrefixes;
    contentList = rootXml?.ListBucketResult?.Contents;
    parent = rootXml?.ListBucketResult?.Prefix;

    expect(prefixList).not.toBe(undefined);

    expect(contentList).not.toBe(undefined);

    expect(parent).not.toBe(undefined);
  });

  it(`- convertPrefixToMap() and mergeS3Maps() with mixed content of ${fileName}`, () => {

    expect(() => {
      getS3Map('contentList', baseUrl, delimiter);
    }).toThrow(Error);

    expect(() => {
      convertPrefixToMap('prefixList', baseUrl, delimiter);
    }).toThrow(Error);

    prefixList = rootXml?.ListBucketResult?.CommonPrefixes;
    contentList = rootXml?.ListBucketResult?.Contents;
    parent = rootXml?.ListBucketResult?.Prefix;

    let map = {};

    if (contentList) {

      if (!(contentList instanceof Array)) {
        contentList = [contentList];
      }

      map = getS3Map(contentList, baseUrl, delimiter);

      const keys = Object.keys(map);
      expect(keys.length).toBeGreaterThan(0);
    }

    if (prefixList) {

      if (!(prefixList instanceof Array)) {
        prefixList = [prefixList];
      }
    }

    prefixMap = convertPrefixToMap(prefixList, baseUrl, delimiter);
    const prefixKeys = Object.keys(prefixMap);
    expect(prefixKeys.length).toBeGreaterThan(0);

    prefixMap = mergeS3Maps(prefixMap, map, parent);
    const mergedPrefixKeys = Object.keys(prefixMap);
    expect(mergedPrefixKeys.length).toBeGreaterThan(0);
    expect(mergedPrefixKeys.length).toBeGreaterThan(prefixKeys.length);
  }); 

  fileName = 's3_envicloud_chelsa_cmip5_ts_content.xml';
  const s3Content = getXmlStringFromFile(fileName);
  let contentMap = null;
  let contentParent = null;
  
  it(`- getS3Map() with ${fileName}`, async () => {
    expect(typeof s3Content).toBe('string');

    const xml = await xml2js.parseStringPromise(s3Content, xmlParseOptions);

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

    const xml = await xml2js.parseStringPromise(s3PrefixChelsa, xmlParseOptions);

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

    const xml = await xml2js.parseStringPromise(s3PrefixChelsaV1, xmlParseOptions);

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
