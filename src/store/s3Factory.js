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

export function extractKeyInfos(key, baseUrl) {
  if (!key) { return null; }

  const isFile = key[key.length - 1] !== '/';

  // example: chelsa/chelsa_V1/chelsa_cmip5_ts/CHELSAcmip5ts_pr_ACCESS1-3_historical_1850-1869.nc
  const fileSplits = key.split('/');
  // example: CHELSAcmip5ts_pr_ACCESS1-3_historical_1850-1869.nc
  const fileKey = fileSplits.length > 0 ? fileSplits[fileSplits.length - 1] : key;
  let dirKey = isFile ? `${fileKey}/` : key;

  let fileExt = '';

  if (isFile) {
    if (fileSplits.length > 0) {
      const dirValues = fileSplits.slice(0, fileSplits.length - 1);
      dirKey = dirValues.join('/');
    }
    // readd the last / because join doesn't
    dirKey = `${dirKey}/`;

    const fileExtSplits = fileKey.split('.');
    if (fileExtSplits.length > 0) {
      fileExt = fileExtSplits[fileExtSplits.length - 1];
    }
  }

  const url = dirKey === fileKey ? dirKey : `${dirKey}${fileKey}`;

  return {
    directory: dirKey,
    name: fileKey,
    fileExt,
    fileUrl: baseUrl ? `${baseUrl}${url}` : url,
  };
}

export function getS3Map(list, baseUrl) {
  const map = new Map();
  
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

    if (map.has(keyInfos.directory)) {
      const fileObj = map.get(keyInfos.directory);

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

      map.set(keyInfos.directory, dirEntry);
    }

  }

  return map;
}

export function getS3Submap(list, baseUrl) {
  const s3Map = new Map();

  for (let i = 0; i < list.length; i++) {
    const s3 = list[i];
    
    const fileSplits = s3.Key.split('/');
    const fileKey = fileSplits[fileSplits.length - 1];
    const fileExtSplits = fileKey.split('.');
    const fileExt = fileExtSplits[fileExtSplits.length - 1];

    let dirKey = `${fileKey}/`;
    if (fileSplits.length > 0) {
      const dirValues = fileSplits.slice(0, fileSplits.length - 1);
      dirKey = dirValues.join('/');
      // readd the last / because join doesn't
      dirKey = `${dirKey}/`;
    }

    let fileObj = {
      id: i,
      name: dirKey,
      children: [],
      lastModified: s3.LastModified,
    };

    // const url = dirKey === fileKey ? dirKey : `${dirKey}/${fileKey}`;

    if (s3Map.has(dirKey)) {
      fileObj = s3Map.get(dirKey);
    }
    
    // fileObj.children.push({
    //   id: `${fileObj.id}${i}`,
    //   name: fileKey,
    //   file: fileExt,
    //   size: humanFileSize(s3.Size),
    //   url: `${baseUrl}${url}`,
    //   lastModified: s3.LastModified,
    // });

    // fileObj.childs = fileObj.children.length.toString();

    // console.log(`${dirKey} with key ${fileKey} with value ${fileObj.children.length}`);
    s3Map.set(dirKey, fileObj);
  }

  return s3Map;
}
