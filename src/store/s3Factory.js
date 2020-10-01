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

  // skip the root "/" directory to avoid having double // in the url
  const dir = keyInfos.directory === '/' ? '' : keyInfos.directory;

  const absolutePath = `${baseUrl}${dir}`;
  let ftpUrl = absolutePath;
  ftpUrl = ftpUrl.replace('https', 'sftp');
  ftpUrl = ftpUrl.replace('http', 'ftp');

  return {
    root: keyInfos.root,
    directory: keyInfos.directory,
    name: directoryName,
    isFile: false,
    fileUrl: absolutePath,
    ftpUrl,
    id: absolutePath,
    children,
    childs: childrenLength,
    fileExt: '',
  };
}

function createFileEntry(keyInfos, baseUrl, size, lastModified) {

  // skip the root "/" directory to avoid having double // in the url
  const dir = keyInfos.directory === '/' ? '' : keyInfos.directory;
  const absolutePath = `${baseUrl}${dir}${keyInfos.name}`;

  return {
    ...keyInfos,
    ...{
      id: absolutePath,
      size,
      lastModified,
      fileUrl: absolutePath,
      // children: [],
      // childs: '0',
    },
  };
}

export function extractKeyInfos(key, delimiter = '/') {
  if (!key) { return null; }

  let dirKey = key;
  const isFile = key[key.length - 1] !== delimiter;

  // example: chelsa/chelsa_V1/chelsa_cmip5_ts/CHELSAcmip5ts_pr_ACCESS1-3_historical_1850-1869.nc
  const fileSplits = key.split(delimiter);
  // example: CHELSAcmip5ts_pr_ACCESS1-3_historical_1850-1869.nc
  let root = `${delimiter}`;
  if (fileSplits.length > 1) {
    root = `${fileSplits[0]}${delimiter}`;
  }
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
      fileExt = fileExt.toLowerCase();
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

export function getS3Map(contentList, baseUrl, delimiter = '/') {
  const map = {};

  if (!contentList) {
    return map;
  }

  if (!(contentList instanceof Array)) {
    throw new Error('contentList has to be an Array (instanceof Array) !');
  }
  
  for (let i = 0; i < contentList.length; i++) {
    const s3 = contentList[i];

    const keyInfos = extractKeyInfos(s3.Key, delimiter);

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

export function getPrefixMap(prefixList, baseUrl, delimiter = '/') {
  const map = {};

  if (!prefixList) {
    return map;
  }

  if (!(prefixList instanceof Array)) {
    throw new Error('prefixList has to be an Array (instanceof Array) !');
  }

  for (let i = 0; i < prefixList.length; i++) {
    const prefix = prefixList[i]?.Prefix ? prefixList[i]?.Prefix : prefixList[i];

    const keyInfos = extractKeyInfos(prefix, delimiter);

    if (!map[keyInfos.directory]) {
      const dirEntry = createDirectoryEntry(keyInfos, baseUrl, delimiter);
      map[keyInfos.directory] = dirEntry;
    }

  }

  return map;
}

export function getParentPath(entry, delimiter = '/') {
  if (typeof entry === 'string') {
    // it's only a key
    entry = extractKeyInfos(entry, delimiter);
  }

  const splits = entry.directory.split(delimiter);

  if (splits.length > 2) {
    splits.reverse();
    const parentPath = splits[2];
    return `${parentPath}${delimiter}`;
  }

  if (entry.isFile) {
    return entry.directory;
  }

  return null;
}

let tempLastMergedSubEntry = null;
let tempLastMergedEntry = null;

function mergeMapEntry(existing, newEntry, delimiter = '/') {
  if (existing.root === newEntry.root) {

    if (newEntry.directory === existing.directory
      && newEntry.name === existing.name) {
      
      existing.children = [...existing.children, ...newEntry.children];
      existing.childs = existing.children.length.toString();
      
      tempLastMergedEntry = existing;

      return true;
    }
    
    if (newEntry.directory.includes(existing.directory)) {
      
      const parentDirectory = getParentPath(newEntry, delimiter);

      if (tempLastMergedEntry?.name === parentDirectory) {
        if (mergeMapEntry(tempLastMergedEntry, newEntry, delimiter)) {
          return true;
        }
      }

      // console.log(`Traverse for ${newEntry.id} checking: ${existing.name}`);

      if (existing.name === parentDirectory) {
        const existingChild = existing.children.findIndex((el) => el.name === newEntry.name);

        if (existingChild > -1) {   
          // merged the subchilds to avoid losing them
          const exitingSubChilds = existing.children[existingChild].children;
          newEntry.children = [...newEntry.children, ...exitingSubChilds];
          newEntry.childs = newEntry.children.length.toString();

          existing.children.splice(existingChild, 1, newEntry);
        } else {
          existing.children.push(newEntry);
        }

        existing.childs = existing.children.length.toString();

        return true;
      } 
      
      if (tempLastMergedSubEntry) {
        if (mergeMapEntry(tempLastMergedSubEntry, newEntry, delimiter)) {
          return true;
        }
      }

      for (let i = 0; i < existing.children.length; i++) {
        const child = existing.children[i];

        if (!child.isFile) {
          if (mergeMapEntry(child, newEntry, delimiter)) {
            tempLastMergedSubEntry = child;
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
 * @param {Object} map
 * @param {Object} searchDirectory
 */
export function getParentEntry(map, searchDirectory) {
  const keys = Object.keys(map);

  for (let i = 0; i < keys.length; i++) {
    // const entry = map[keys[i]];
    const key = keys[i];

    if (searchDirectory.directory.includes(key)) {
      return map[key];
    }
  }

  return null;
}

/**
 * 
 * @param {Object} mainMap 
 * @param {Object} newMap 
 * @param {string} parent 
 * @param {string} delimiter 
 */
export function mergeS3Maps(mainMap, newMap, parent, delimiter = '/') {
  if (!mainMap || Object.keys(mainMap).length <= 0) {
    return newMap;
  }

  if (!newMap || Object.keys(newMap).length <= 0) {
    return mainMap;
  }

  const directParent = extractKeyInfos(parent);

  let mainEntry = directParent ? mainMap[directParent.root] || mainMap[directParent.directory] : null;

  if (!mainEntry && directParent) {
    mainEntry = getParentEntry(mainMap, directParent);
  }

  // const mergedKeys = [];
  const mergedTime = [];
  const newMapKeys = Object.keys(newMap);
  tempLastMergedEntry = null;
  tempLastMergedSubEntry = null;

  if (mainEntry) {
    newMapKeys.forEach((key) => {
      const merged = mergeMapEntry(mainEntry, newMap[key], delimiter);
      tempLastMergedSubEntry = null;
      // mergedKeys.push(`key: "${key}"" merged: ${merged}`);
    });

  } else {

    newMapKeys.forEach((key) => {
      const existingEntry = mainMap[key];
      let merged = false;
      if (existingEntry) {
        merged = mergeMapEntry(existingEntry, newMap[key], delimiter);
        tempLastMergedSubEntry = null;
      } else {
        mainMap[key] = newMap[key];
        merged = true;
      }

      // mergedKeys.push(`key: "${key}" merged: ${merged}`);
    });
  }

  // console.log({ mergedKeys });

  tempLastMergedEntry = null;
  tempLastMergedSubEntry = null;
  return mainMap;
}

export function sanitaizePrefix(prefix, delimiter = '/') {
  if (prefix.length <= 0) {
    return ''; // maybe root '/' is needed?
  }

  let sainPrefix = prefix;

  if (prefix.substr(0, 1) === delimiter) {
    sainPrefix = prefix.substr(1);
  }

  if (prefix.substr(prefix.length - 1, 1) !== delimiter) {
    sainPrefix = `${prefix}${delimiter}`;
  }

  return sainPrefix;
}
