import DeviceInfo from 'react-native-device-info';
import base58 from 'bs58';
import { FileUtil } from 'src/utils';
import { iCloudSyncAdapter } from '../models';
import { CacheData } from '../caches';

const setShareLocalStoragePath = async () => {
  let appBundleId = DeviceInfo.getBundleId();
  try {
    if (appBundleId === 'com.bitmark.registry.inhouse') {
      // Dev
      FileUtil.SharedGroupDirectory = await FileUtil.pathForGroup('group.com.bitmark.localstorage.dev');
    } else if (appBundleId === 'com.bitmark.registry.beta') {
      // Beta
      FileUtil.SharedGroupDirectory = await FileUtil.pathForGroup('group.com.bitmark.localstorage.beta');
    } else {
      // Live
      FileUtil.SharedGroupDirectory = await FileUtil.pathForGroup('group.com.bitmark.localstorage');
    }
  } catch {
    FileUtil.SharedGroupDirectory = FileUtil.DocumentDirectory;
  }
  console.log('FileUtil.ShareGroupDirectory :', FileUtil.SharedGroupDirectory);
};

const moveFilesFromLocalStorageToSharedStorage = async (bitmarkAccountNumber) => {
  let localStorageFolderPath = `${FileUtil.DocumentDirectory}/${bitmarkAccountNumber}`;
  let sharedStorageFolderPath = FileUtil.getSharedLocalStorageFolderPath(bitmarkAccountNumber);

  if (await FileUtil.exists(localStorageFolderPath)) {
    await FileUtil.copyDir(localStorageFolderPath, sharedStorageFolderPath, true);
  }
};

const doCheckAndSyncDataWithICloud = async (asset) => {
  // upload to iCloud
  if (!asset) {
    return;
  }
  if (asset && !asset.assetFileSyncedToICloud && asset.filePath && (await FileUtil.exists(asset.filePath))) {
    let assetFilename = asset.filePath.substring(asset.filePath.lastIndexOf('/') + 1, asset.filePath.length);
    iCloudSyncAdapter.uploadFileToCloud(asset.filePath, `${CacheData.userInformation.bitmarkAccountNumber}_assets_${base58.encode(new Buffer(asset.id, 'hex'))}_${assetFilename}`);
    asset.assetFileSyncedToICloud = true;
  }

  if (!asset.thumbnailSyncedToICloud && asset.thumbnailPath && (await FileUtil.exists(asset.thumbnailPath))) {
    let thumbnailFilename = asset.thumbnailPath.substring(asset.thumbnailPath.lastIndexOf('/') + 1, asset.thumbnailPath.length);
    await iCloudSyncAdapter.uploadFileToCloud(asset.thumbnailPath, `${CacheData.userInformation.bitmarkAccountNumber}_thumbnail_${base58.encode(new Buffer(asset.id, 'hex'))}_${thumbnailFilename}`);
    asset.thumbnailSyncedToICloud = true;
  }
};

let LocalFileService = {
  setShareLocalStoragePath,
  moveFilesFromLocalStorageToSharedStorage,
  doCheckAndSyncDataWithICloud,
};
export { LocalFileService };
