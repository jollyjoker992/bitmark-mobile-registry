import { NativeModules } from 'react-native';

const NativeUtils = NativeModules.NativeUtils;
const Navigation = NativeModules.Navigation;

const NativeAndroidUtils = {
    openSystemSetting: (settingName) => {
        Navigation.openSystemSetting(settingName);
    },

    checkDiskEncrypted: async () => {
        return await NativeUtils.checkDiskEncrypted();
    }
};

export { NativeAndroidUtils };
