import DeviceInfo from 'react-native-device-info';
import { FileUtil } from '../utils';

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

  console.log('FileUtil.ShareGroupDirectory :', FileUtil.SharedGroupDirectory );
};

const moveFilesFromLocalStorageToSharedStorage = async (bitmarkAccountNumber) => {
  let localStorageFolderPath = `${FileUtil.DocumentDirectory}/${bitmarkAccountNumber}`;
  let sharedStorageFolderPath = FileUtil.getSharedLocalStorageFolderPath(bitmarkAccountNumber);

  if (await FileUtil.exists(localStorageFolderPath)) {
    await FileUtil.copyDir(localStorageFolderPath, sharedStorageFolderPath, true);
  }
};

let LocalFileService = {
  setShareLocalStoragePath,
  moveFilesFromLocalStorageToSharedStorage,
};
export { LocalFileService };
