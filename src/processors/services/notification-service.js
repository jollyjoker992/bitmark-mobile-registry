import DeviceInfo from 'react-native-device-info';
import PushNotification from 'react-native-push-notification';
import ReactNative from 'react-native';
const {
  PushNotificationIOS,
  Platform,
} = ReactNative;
import { AccountModel, CommonModel } from '../models';

let configureNotifications = (onRegister, onNotification) => {
  return AccountModel.configureNotifications(onRegister, onNotification);
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
  requestResult = await AccountModel.doRequestNotificationPermissions();
  isRequesting = false;
  return requestResult;
};

let doCheckNotificationPermission = () => {
  return new Promise((resolve) => {
    doRequestNotificationPermissions().then(resolve).catch(error => {
      console.log('NotificationService doCheckNotificationPermission error :', error);
      resolve();
    })
  });
};

let setApplicationIconBadgeNumber = (number) => {
  return AccountModel.setApplicationIconBadgeNumber(number);
};

let doRegisterNotificationInfo = async (accountNumber, token) => {
  let signatureData = await CommonModel.doCreateSignatureData();
  if (!signatureData) {
    return;
  }
  let client = 'registry';
  client = DeviceInfo.getBundleId() === 'com.bitmark.registry.inhouse' ? 'registryinhouse' :
    (DeviceInfo.getBundleId() === 'com.bitmark.registry.beta' ? 'registrybeta' : client);

  return await AccountModel.doRegisterNotificationInfo(accountNumber, signatureData.timestamp, signatureData.signature, Platform.OS, token, client);
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
  if (Platform.OS === 'android') {
    // TODO should check if have schedule for local notification
    PushNotification.cancelAllLocalNotifications();
  } else {
    PushNotificationIOS.removeAllDeliveredNotifications();
  }
};

let NotificationService = {
  configureNotifications,
  setApplicationIconBadgeNumber,
  removeAllDeliveredNotifications,

  doRequestNotificationPermissions,
  doCheckNotificationPermission,
  doRegisterNotificationInfo,
  doTryDeregisterNotificationInfo,
};

export { NotificationService };