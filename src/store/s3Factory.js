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
    dirKey = `${dirKey}/`;

    const fileExtSplits = fileKey.split('.');
    if (fileExtSplits.length > 0) {
      fileExt = fileExtSplits[fileExtSplits.length - 1];
    }
  }

  return {
    root,
    directory: dirKey,
    name: fileKey,
    // key,
    isFile,
    fileExt,
    fileUrl: `${baseUrl}${fileKey}`,
  };
}

export function getS3Map(list, baseUrl) {
  // const map = new Map();
  const map = {};
  
  for (let i = 0; i < list.length; i++) {
    const s3 = list[i];

    const keyInfos = extractKeyInfos(s3.Key, baseUrl);

    const mergedInfos = {
      ...keyInfos,
      ...{
        id: `${i}`,
        size: humanFileSize(s3.Size),
        lastModified: s3.LastModified,
        children: [],
      },
    };

    const fileObj = map[keyInfos.directory];
    // if (map.has(keyInfos.directory)) {
    if (fileObj) {
      // const fileObj = map.get(keyInfos.directory);

      mergedInfos.id = `${fileObj.id}${i}`;

      fileObj.children.push(mergedInfos);

      fileObj.childs = fileObj.children.length.toString();

    } else {
      // add an additional initial directory Object
      // and use it the file key for it's first child
      const dirEntry = {
        ...keyInfos,
        ...{
          id: `${i}`,
          lastModified: s3.LastModified,
          children: [mergedInfos],
        },
      };

      mergedInfos.id = `${dirEntry.id}${i}`;

      // use the directoy as "name" so it shows up as a directory
      dirEntry.name = dirEntry.directory;

      // map.set(keyInfos.directory, dirEntry);
      map[keyInfos.directory] = dirEntry;
    }

  }

  return map;
}

export function convertPrefixToMap(prefixList, baseUrl) {
  const map = {};

  for (let i = 0; i < prefixList.length; i++) {
    const prefix = prefixList[i]?.Prefix ? prefixList[i]?.Prefix : prefixList[i];

    const keyInfos = extractKeyInfos(prefix, baseUrl);

    if (!map[keyInfos.directory]) {
      // add an additional initial directory Object
      // and use it the file key for it's first child
      const dirEntry = {
        ...keyInfos,
        ...{
          id: `${i}`,
          children: [],
        },
      };

      // use the directoy as "name" so it shows up as a directory
      // dirEntry.name = dirEntry.directory;

      map[keyInfos.directory] = dirEntry;
    }

  }

  return map;
}

export function mergeMapEntry(existing, newEntry) {
  if (existing.root === newEntry.root) {

    if (newEntry.directory.includes(existing.directory)) {

      let parentDirectory = newEntry.directory;

      if (newEntry.directory.length !== existing.directory.length) {
        parentDirectory = parentDirectory.replace(newEntry.name, '');
      }
      
      if (existing.directory === parentDirectory) {
        existing.children.push(newEntry);
      } else {

        for (let i = 0; i < existing.children.length; i++) {
          const child = existing.children[i];

          if (!child.isFile) {
            mergeMapEntry(child, newEntry);
            break;
          }
        }
      }

    }
    
  } else {
    // throw new Exception(`Tried to merge entries with different root, newEntry: ${newEntry.name} with root: ${newEntry.root} with ${existing.name} with root: ${existing.root}`);
    console.log(`Tried to merge entries with different root, newEntry: ${newEntry.name} with root: ${newEntry.root} with ${existing.name} with root: ${existing.root}`);
  }
}

/**
 * 
 * @param {Object} mainMap 
 * @param {Object} newMap
 */
export function mergeS3Maps(mainMap, newMap, parent) {

    const mainKeys = Object.keys(mainMap);

    const mainEntry = mainMap[parent] || null;

    if (mainEntry) {

      const newMapKeys = Object.keys(newMap);

      newMapKeys.forEach((key) => {
        mergeMapEntry(mainEntry, newMap[key]);
      });

      // newMap.forEach((value, key, map) => {
      //   mainEntry.children.push(value);
      // });
    }

  // newMap.forEach((value, key, map) => {

  //   let parentDirectory = value.directory;

  //   if (!value.isFile && value.directory.length !== value.name.length) {
  //     parentDirectory = value.directory.replace(value.name, '');
  //   }

  //   const mainEntry = mainMap.get(parentDirectory);

  //   if (mainEntry) {
  //     mainEntry.children.push(value);
  //   }
  // });

  return mainMap;
}
