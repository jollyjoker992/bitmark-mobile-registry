import DeviceInfo from 'react-native-device-info';
import PushNotification from 'react-native-push-notification';
import FCM, { FCMEvent } from "react-native-fcm";
import ReactNative from 'react-native';
const {
  PushNotificationIOS,
  Platform,
} = ReactNative;
import { AccountModel, CommonModel, BitmarkSDK, UserModel } from '../models';
import { config } from 'src/configs';

// ================================================================================================\
const doGetCurrentAccount = async () => {
  let userInfo = await AccountModel.doGetCurrentAccount();
  let userInformation = { bitmarkAccountNumber: userInfo.bitmarkAccountNumber, encryptionPublicKey: userInfo.encryptionPublicKey };
  await UserModel.doUpdateUserInfo(userInformation);
  return userInformation;
}

const doCreateSignatureData = async () => {
  let signatureData = await CommonModel.doCreateSignatureData();
  if (!signatureData) {
    return null;
  }
  let userInfo = await UserModel.doGetCurrentUser();
  signatureData.account_number = userInfo.bitmarkAccountNumber;
  return signatureData;
};

const doValidateBitmarkAccountNumber = async (accountNumber) => {
  let userInfo = await UserModel.doGetCurrentUser();
  if (userInfo.bitmarkAccountNumber === accountNumber) {
    throw new Error('Can not transfer for current user!');
  }
  let result = await BitmarkSDK.validateAccountNumber(accountNumber, config.bitmark_network);
  if (result) {
    let encryptionPublicKey = await AccountModel.doGetEncryptionPublicKey(accountNumber);
    result = !!encryptionPublicKey;
  }
  return result;
}

let configureNotifications = async (onRegister, onNotification) => {
  if (config.isAndroid) {
    await FCM.requestPermissions();
    let token = await FCM.getFCMToken();
    onRegister({ token });
    FCM.on(FCMEvent.Notification, (data) => {
      onNotification({ data });
    });
  } else {
    PushNotification.configure({
      onRegister: onRegister,
      onNotification: onNotification,
      requestPermissions: false,
    });
  }
};

let isRequesting = false;
let requestResult = null;
let waitRequestPermission = () => {
  return new Promise((resolve) => {
    let checkRequestDone = () => {
      if (!isRequesting) {
        resolve(requestResult);
      } else {
        setTimeout(checkRequestDone, 200);
      }
    }
    checkRequestDone();
  });
};
let doRequestNotificationPermissions = async () => {
  if (isRequesting) {
    return await waitRequestPermission();
  }
  isRequesting = true;
  if (config.isAndroid) {
    requestResult = await FCM.requestPermissions()();
  } else {
    requestResult = await PushNotification.requestPermissions();
  }
  isRequesting = false;
  return requestResult;
};

let doCheckNotificationPermission = () => {
  return new Promise((resolve) => {
    doRequestNotificationPermissions().then(resolve).catch(error => {
      console.log('AccountService doCheckNotificationPermission error :', error);
      resolve();
    })
  });
};

let setApplicationIconBadgeNumber = (number) => {
  if (config.isAndroid) {
    return FCM.setBadgeNumber(0);
  }
  return PushNotification.setApplicationIconBadgeNumber(number);
};

let doRegisterNotificationInfo = async (accountNumber, token, intercomUserId) => {
  let signatureData;
  if (accountNumber) {
    signatureData = await CommonModel.doCreateSignatureData();
    if (!signatureData) {
      return;
    }
  } else {
    signatureData = {};
  }
  let client = 'registry';
  client = DeviceInfo.getBundleId() === 'com.bitmark.registry.inhouse' ? 'registryinhouse' :
    (DeviceInfo.getBundleId() === 'com.bitmark.registry.beta' ? 'registrybeta' : client);

  return await AccountModel.doRegisterNotificationInfo(accountNumber, signatureData.timestamp, signatureData.signature, Platform.OS, token, client, intercomUserId);
};

let doTryDeregisterNotificationInfo = (accountNumber, token, signatureData) => {
  return new Promise((resolve) => {
    AccountModel.doDeregisterNotificationInfo(accountNumber, signatureData.timestamp, signatureData.signature, token)
      .then(resolve)
      .catch(error => {
        console.log('doTryDeregisterNotificationInfo error :', error);
        resolve();
      });
  });
};

let removeAllDeliveredNotifications = () => {
  if (config.isAndroid) {
    FCM.removeAllDeliveredNotifications();
  } else {
    PushNotificationIOS.removeAllDeliveredNotifications();
  }
};

// ================================================================================================
// ================================================================================================

let AccountService = {
  doGetCurrentAccount,
  doCreateSignatureData,
  doValidateBitmarkAccountNumber,

  configureNotifications,
  setApplicationIconBadgeNumber,
  removeAllDeliveredNotifications,
  doRequestNotificationPermissions,
  doCheckNotificationPermission,
  doRegisterNotificationInfo,
  doTryDeregisterNotificationInfo,
};

export { AccountService };