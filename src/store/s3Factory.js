/* eslint-disable no-unused-vars */
/* eslint-disable no-console */

// source: https://stackoverflow.com/questions/16023824/how-do-i-format-bytes-to-human-readable-text-in-javascript
function humanFileSize(bytes) {
  // const thresh = si ? 1000 : 1024;
  const thresh = 1024;

  if (bytes < thresh) return `${bytes} B`;

  // const units = si ? ['kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'] : ['KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];

  const units = ['kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  
  let u = -1;

  do {
    bytes /= thresh;
    ++u;
  } while (bytes >= thresh);

  return `${bytes.toFixed(1)} ${units[u]}`;
}

function createDirectoryEntry(keyInfos, baseUrl, delimiter, childs = null) {
  const children = childs || [];
  const childrenLength = childs ? children.length.toString() : '?';

  const splits = keyInfos.directory.split(delimiter);
  splits.reverse();
  const directoryName = `${splits[1]}${delimiter}`;
  const absolutePath = `${baseUrl}${keyInfos.directory}`;

  return {
    root: keyInfos.root,
    directory: keyInfos.directory,
    name: directoryName,
    isFile: false,
    fileUrl: absolutePath,
    id: absolutePath,
    children,
    childs: childrenLength,
  };
}

function createFileEntry(keyInfos, baseUrl, size, lastModified) {

  const absolutePath = `${baseUrl}${keyInfos.directory}${keyInfos.name}`;

  return {
    ...keyInfos,
    ...{
      id: absolutePath,
      size,
      lastModified,
      fileUrl: absolutePath,
      children: [],
      childs: '0',
    },
  };
}

export function extractKeyInfos(key, baseUrl, delimiter = '/') {
  if (!key) { return null; }

  let dirKey = key;
  const isFile = key[key.length - 1] !== delimiter;

  // example: chelsa/chelsa_V1/chelsa_cmip5_ts/CHELSAcmip5ts_pr_ACCESS1-3_historical_1850-1869.nc
  const fileSplits = key.split(delimiter);
  // example: CHELSAcmip5ts_pr_ACCESS1-3_historical_1850-1869.nc
  const root = `${fileSplits[0]}${delimiter}`;
  const splitPos = isFile ? fileSplits.length - 1 : fileSplits.length - 2;
  let fileKey = key;

  if (fileSplits.length > 0 && splitPos > 0) {
    fileKey = fileSplits[splitPos];
    fileKey = isFile ? fileKey : `${fileKey}${delimiter}`;
  }

  let fileExt = '';

  if (isFile) {
    if (fileSplits.length > 0) {
      const dirValues = fileSplits.slice(0, fileSplits.length - 1);
      dirKey = dirValues.join(delimiter);
    }

    // readd the last / because join doesn't
    dirKey = `${dirKey}${delimiter}`;

    const fileExtSplits = fileKey.split('.');
    if (fileExtSplits.length > 0) {
      fileExt = fileExtSplits[fileExtSplits.length - 1];
    }
  }

  return {
    root,
    directory: dirKey,
    name: fileKey,
    isFile,
    fileExt,
  };
}

export function getS3Map(list, baseUrl, delimiter = '/') {
  const map = {};
  
  for (let i = 0; i < list.length; i++) {
    const s3 = list[i];

    const keyInfos = extractKeyInfos(s3.Key, baseUrl);

    const fileEntry = createFileEntry(keyInfos, baseUrl, humanFileSize(s3.Size), s3.LastModified);

    const fileObj = map[keyInfos.directory];

    if (fileObj) {
      fileObj.children.push(fileEntry);
      fileObj.childs = fileObj.children.length.toString();

    } else {
      // add an initial directory Object
      // and use it with the first file key as it's first child

      const children = fileEntry.isFile ? [fileEntry] : null;
      const dirEntry = createDirectoryEntry(keyInfos, baseUrl, delimiter, children);
      map[keyInfos.directory] = dirEntry;
    }

  }

  return map;
}

export function convertPrefixToMap(prefixList, baseUrl, delimiter = '/') {
  const map = {};

  for (let i = 0; i < prefixList.length; i++) {
    const prefix = prefixList[i]?.Prefix ? prefixList[i]?.Prefix : prefixList[i];

    const keyInfos = extractKeyInfos(prefix, baseUrl);

    if (!map[keyInfos.directory]) {
      const dirEntry = createDirectoryEntry(keyInfos, baseUrl, delimiter);
      map[keyInfos.directory] = dirEntry;
    }

  }

  return map;
}

export function mergeMapEntry(existing, newEntry, delimiter = '/') {
  if (existing.root === newEntry.root) {

    if (newEntry.directory === existing.directory
      && newEntry.name === existing.name) {
      
      existing.children = newEntry.children;
      existing.childs = existing.children.length.toString();
      
    } else if (newEntry.directory.includes(existing.directory)) {
      
      let parentDirectory = newEntry.directory;
      const splits = newEntry.directory.split('/');
      splits.reverse();
      const parentPath = splits[2];
      parentDirectory = `${parentPath}${delimiter}`;

      // console.log(`Traverse for ${newEntry.id} checking: ${existing.name}`);

      if (existing.name === parentDirectory) {
        const existingChild = existing.children.findIndex((el) => el.name === newEntry.name);

        if (existingChild > -1) {
          existing.children.splice(existingChild, 1, newEntry);
        } else {
          existing.children.push(newEntry);
        }
        existing.childs = existing.children.length.toString();

        return true;
      } 
      
      for (let i = 0; i < existing.children.length; i++) {
        const child = existing.children[i];

        if (!child.isFile) {
          if (mergeMapEntry(child, newEntry, delimiter)) {
            return true;
          }
        }
      }

    }

    return false;    
  } 

  // throw new Exception(`Tried to merge entries with different root, newEntry: ${newEntry.name} with root: ${newEntry.root} with ${existing.name} with root: ${existing.root}`);
  console.log(`Tried to merge entries with different root, newEntry: ${newEntry.name} with root: ${newEntry.root} with ${existing.name} with root: ${existing.root}`);

  return false;
}

/**
 * 
 * @param {Object} mainMap 
 * @param {Object} newMap
 */
export function mergeS3Maps(mainMap, newMap, parent, delimiter = '/') {

  const directParent = extractKeyInfos(parent);

  const mainEntry = mainMap[directParent.root] || null;

  if (mainEntry) {

    const newMapKeys = Object.keys(newMap);
    const mergedKeys = [];

    newMapKeys.forEach((key) => {
      const merged = mergeMapEntry(mainEntry, newMap[key], delimiter);

      mergedKeys.push(`key: ${key} merged: ${merged}`);
    });

    // console.log({ mergedKeys });
  }

  return mainMap;
}
