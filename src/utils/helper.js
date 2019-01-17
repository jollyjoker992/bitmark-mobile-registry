import { Dimensions } from 'react-native';
import { constant } from 'src/configs';
let currentSize = Dimensions.get('window');
let widthDesign = 375;

const convertWidth = (width) => {
  return width * currentSize.width / widthDesign;
};

const calculateAdditionalHeight = (minHeight, additionalValue, forceApply) => {
  let result = 0;
  if (currentSize.height > minHeight) {
    if (currentSize.height - minHeight >= additionalValue) {
      result = additionalValue;
    } else if (forceApply) {
      result = currentSize.height - minHeight;
    }
  }
  return result;
};

const runPromiseWithoutError = (promise) => {
  return new Promise((resolve) => {
    promise.then(resolve).catch(error => resolve({ error }));
  });
};

const compareVersion = (version1, version2) => {
  if (version1 === null) {
    return -1;
  }
  if (version2 === null) {
    return 1;
  }
  let versionParts1 = version1.split('.');
  let versionParts2 = version2.split('.');
  for (let index in versionParts1) {
    let versionPart1 = +versionParts1[index];
    let versionPart2 = +versionParts2[index];
    if (versionPart1 !== versionPart2) {
      return versionPart1 < versionPart2 ? -1 : 1;
    }
  }
  return 0;
};

const isImageFile = (filePath) => {
  if (!filePath) {
    return false;
  }
  const imageExtensions = ['PNG', 'JPG', 'JPEG', 'HEIC', 'TIFF', 'BMP', 'HEIF', 'IMG'];
  let fileExtension = filePath.substring(filePath.lastIndexOf('.') + 1);

  return imageExtensions.includes(fileExtension.toUpperCase());
};

const isMusicAsset = (asset) => {
  return (asset && asset.metadata && asset.metadata[constant.asset.metadata.labels.type] === constant.asset.metadata.values.music);
};

const isReleasedAsset = (asset) => {
  return isMusicAsset(asset);
};

const sortAssetsBitmarks = (bitmarks) => {
  bitmarks = bitmarks || [];
  bitmarks.sort((a, b) => {
    if (a.status === 'pending') {
      return -1;
    } else if (b.status === 'pending') {
      return 1;
    }
    return b.offset - a.offset;
  });
  return bitmarks;
};


export {
  convertWidth, calculateAdditionalHeight, runPromiseWithoutError, compareVersion,
  isImageFile,
  isMusicAsset,
  isReleasedAsset,
  sortAssetsBitmarks,
};