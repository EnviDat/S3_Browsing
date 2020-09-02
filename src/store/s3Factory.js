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

export function getS3Map(list, baseUrl) {
  const s3Map = new Map();

  for (let i = 0; i < list.length; i++) {
    const s3 = list[i];
    
    const fileSplits = s3.Key.split('/');
    const fileKey = fileSplits[fileSplits.length - 1];
    const fileExtSplits = fileKey.split('.');
    const fileExt = fileExtSplits[fileExtSplits.length - 1];

    let dirKey = fileKey;
    if (fileSplits.length > 0) {
      const dirValues = fileSplits.slice(0, fileSplits.length - 1);
      dirKey = dirValues.join('/');
    }

    let fileObj = {
      id: i,
      name: dirKey,
      children: [],
    };

    const url = dirKey === fileKey ? dirKey : `${dirKey}/${fileKey}`;

    if (s3Map.has(dirKey)) {
      fileObj = s3Map.get(dirKey);
    }
    
    fileObj.children.push({
      id: `${fileObj.id}${i}`,
      name: fileKey,
      file: fileExt,
      size: humanFileSize(s3.Size),
      url: `${baseUrl}${url}`,
    });

    fileObj.childs = fileObj.children.length.toString();

    // console.log(`${dirKey} with key ${fileKey} with value ${fileObj.children.length}`);
    s3Map.set(dirKey, fileObj);
  }

  return s3Map;
}
