import { Dimensions } from 'react-native';
import { constant } from 'src/configs';
let currentSize = Dimensions.get('window');
let widthDesign = 375;

// ==============================================================================================================
const isFileRecord = (asset) => {
  return asset && asset.metadata && asset.metadata.Source === 'Medical Records' && asset.metadata['Saved Time'] &&
    (asset.name.startsWith('HR') || asset.name.startsWith('HA'));
};
const isCaptureDataRecord = (asset) => {
  return asset && asset.metadata && asset.metadata.Source === 'Health Records' && asset.metadata['Saved Time'] &&
    (asset.name.startsWith('HR') || asset.name.startsWith('HA'));
};
const isHealthDataRecord = (asset) => {
  return asset && asset.metadata && asset.metadata.Source === 'HealthKit' && (asset.name.startsWith('HD') || asset.name.startsWith('HK'));
};
const isDailyHealthDataRecord = (asset) => {
  return asset && asset.metadata && asset.metadata.Source === 'HealthKit' && asset.name.startsWith('HD');
};

// ==============================================================================================================
// ==============================================================================================================
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
  const imageExtensions = ['PNG', 'JPG', 'JPEG', 'HEIC', 'TIFF', 'BMP', 'HEIF', 'IMG', 'GIF', 'RAW', 'SVG'];
  let fileExtension = filePath.substring(filePath.lastIndexOf('.') + 1);
  return imageExtensions.includes(fileExtension.toUpperCase());
};

const isDocFile = (filePath) => {
  if (!filePath) {
    return false;
  }
  const pdfExtensions = ['TXT', 'EPUB', 'RTF', 'LOG', 'PDF', 'XLS', 'XLSX', 'DOC', 'DOCX', 'PPT', 'PPTX'];
  let fileExtension = filePath.substring(filePath.lastIndexOf('.') + 1);

  return pdfExtensions.includes(fileExtension.toUpperCase());
};

const isZipFile = (filePath) => {
  if (!filePath) {
    return false;
  }
  const pdfExtensions = ['ZIP'];
  let fileExtension = filePath.substring(filePath.lastIndexOf('.') + 1);

  return pdfExtensions.includes(fileExtension.toUpperCase());
};

const isVideoFile = (filePath) => {
  if (!filePath) {
    return false;
  }
  const imageExtensions = ['AVI', 'FLV', 'WMV', 'MOV', 'MP4',];
  let fileExtension = filePath.substring(filePath.lastIndexOf('.') + 1);
  return imageExtensions.includes(fileExtension.toUpperCase());
};

const isMedicalRecord = (asset) => {
  return isCaptureDataRecord(asset) || isFileRecord(asset);
};
const isHealthRecord = (asset) => {
  return isHealthDataRecord(asset) || isDailyHealthDataRecord(asset);
};

const isMusicAsset = (asset) => {
  return (asset && asset.metadata && asset.metadata[constant.asset.metadata.labels.type] === constant.asset.metadata.values.music);
};

const isReleasedAsset = (asset) => {
  return isMusicAsset(asset);
};

const getMetadataLabel = (label, needCheckUpperCase?) => {
  if (!needCheckUpperCase) {
    return global.i18n.t(`MetadataLabels_${label.toLowerCase()}`, { defaultValue: label }).toUpperCase();
  } else {
    let text = global.i18n.t(`MetadataLabels_${label.toLowerCase()}`, { defaultValue: label });
    if (text === label) {
      return text;
    } else {
      return text.toUpperCase();
    }
  }
};

const getMetadataValue = (value) => {
  return global.i18n.t(`MetadataValues_${value.toLowerCase()}`, { defaultValue: value }).toUpperCase();
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
  isImageFile, isVideoFile, isDocFile, isZipFile,
  isMedicalRecord, isHealthRecord, isMusicAsset,
  isReleasedAsset,
  sortAssetsBitmarks,
  getMetadataLabel,
  getMetadataValue,
};