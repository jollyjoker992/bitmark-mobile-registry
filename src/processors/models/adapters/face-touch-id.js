import { NativeModules } from 'react-native'
import { config } from 'src/configs';
let SwiftFaceTouchId = NativeModules.TouchID;

const FaceTouchId = {
  isSupported: () => {
    return new Promise((resolve) => {
      // TODO
      if (config.isAndroid) {
        return resolve(true);
      }
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