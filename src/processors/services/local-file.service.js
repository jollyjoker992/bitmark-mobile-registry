import DeviceInfo from 'react-native-device-info';
import base58 from 'bs58';
import { FileUtil, runPromiseWithoutError } from 'src/utils';
import { iCloudSyncAdapter } from '../models';
import { CacheData } from '../caches';
import { config } from 'src/configs';

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
  let sharedStorageFolderPath = FileUtil.getSharedLocalStorageFolderPath(bitmarkAccountNumber, config.isAndroid);

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

const detectLocalAssetFilePath = async (assetId) => {
  let assetFolderPath = `${FileUtil.getLocalAssetsFolderPath(CacheData.userInformation.bitmarkAccountNumber, config.isAndroid)}/${assetId}`;
  let existAssetFolder = await runPromiseWithoutError(FileUtil.exists(assetFolderPath));
  if (!existAssetFolder || existAssetFolder.error) {
    return null;
  }
  let downloadedFolder = `${assetFolderPath}/downloaded`;
  let existDownloadedFolder = await runPromiseWithoutError(FileUtil.exists(downloadedFolder));
  if (!existDownloadedFolder || existDownloadedFolder.error) {
    return null;
  }
  let list = await FileUtil.readDir(`${assetFolderPath}/downloaded`);
  return (list && list.length > 0) ? `${assetFolderPath}/downloaded/${list[0]}` : null;
};

const detectMusicThumbnailPath = async (assetId) => {
  let assetFolderPath = `${FileUtil.getLocalAssetsFolderPath(CacheData.userInformation.bitmarkAccountNumber, config.isAndroid)}/${assetId}`;
  let thumbnailPath = `${assetFolderPath}/thumbnail.png`;
  let existAssetFolder = await runPromiseWithoutError(FileUtil.exists(assetFolderPath));
  if (!existAssetFolder || existAssetFolder.error) {
    thumbnailPath = null;
  }
  let existFile = await runPromiseWithoutError(FileUtil.exists(thumbnailPath));
  if (!existFile || existFile.error) {
    thumbnailPath = null;
  }
  if (!thumbnailPath) {
    thumbnailPath = `${assetFolderPath}/thumbnail.png`;
    await FileUtil.mkdir(assetFolderPath);
    await FileUtil.downloadFile({
      fromUrl: config.bitmark_profile_server + `/s/asset/thumbnail?asset_id=${assetId}`,
      toFile: thumbnailPath,
    });
    let existFile = await runPromiseWithoutError(FileUtil.exists(thumbnailPath));
    if (!existFile || existFile.error) {
      thumbnailPath = null;
    }
  }
  return thumbnailPath;
};

let LocalFileService = {
  setShareLocalStoragePath,
  moveFilesFromLocalStorageToSharedStorage,
  doCheckAndSyncDataWithICloud,
  detectLocalAssetFilePath,
  detectMusicThumbnailPath,
};
export { LocalFileService };
