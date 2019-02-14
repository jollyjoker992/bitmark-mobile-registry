import { NativeModules } from 'react-native'
import { config } from 'src/configs';
let SwiftFaceTouchId = NativeModules.TouchID;
let AuthenticationWrapper = NativeModules.Authentication;

const FaceTouchId = {
  isSupported: () => {
    if (config.isAndroid) {
      return AuthenticationWrapper.isSupported();
    }
    return new Promise((resolve) => {
      SwiftFaceTouchId.isSupported((ok) => {
        resolve(ok);
      });
    });
  },
  authenticate: () => {
    return new Promise((resolve, reject) => {
      SwiftFaceTouchId.authenticate(global.i18n.t("FaceTouchId_pleaseSignToAuthorizeYourTransactions"), (ok) => {
        if (ok) {
          resolve();
        } else {
          reject(new Error('authenticate error'));
        }
      });
    });
  }
};
export { FaceTouchId };