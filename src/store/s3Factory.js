/* eslint-disable no-console */
export function getS3Map(list) {
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

    const children = [];

    let fileObj = {
      id: i,
      name: dirKey,
      children,
    };

    if (s3Map.has(dirKey)) {
      fileObj = s3Map.get(dirKey);
    }

    fileObj.children.push({
      id: `${fileObj.id}${i}`,
      name: fileKey,
      file: fileExt,
    });

    // console.log(`${dirKey} with key ${fileKey} with value ${fileObj.children.length}`);
    s3Map.set(dirKey, fileObj);
  }

  return s3Map;
}
