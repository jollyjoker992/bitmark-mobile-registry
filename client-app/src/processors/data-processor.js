import DeviceInfo from 'react-native-device-info';
import moment from 'moment';
import { merge } from 'lodash';

import {
  EventEmitterService,
  NotificationService,
  TransactionService,
  BitmarkService,
  AccountService,
} from "../services";
import { CommonModel, AccountModel, UserModel, BitmarkSDK, IftttModel, BitmarkModel, NotificationModel } from '../models';
import { FileUtil } from '../utils';
import { config } from '../configs';
import {
  AssetsStore, AssetsActions,
  BottomTabStore, BottomTabActions,
  AssetStore, AssetActions,
  PropertyStore, PropertyActions,
  AccountStore, AccountActions,
  TransactionsStore, TransactionsActions,
} from '../stores';
const helper = require('../utils/helper');

let userInformation = {};
let isLoadingData = false;
// ================================================================================================================================================

const doCheckTransferOffers = async (transferOffers, isLoadingAllUserData) => {
  if (transferOffers) {
    await CommonModel.doSetLocalData(CommonModel.KEYS.USER_DATA_TRANSFER_OFFERS, transferOffers);
    if (!isLoadingAllUserData) {
      await doGenerateTransactionActionRequiredData();
    }
  }
};

const doCheckNewIftttInformation = async (iftttInformation, isLoadingAllUserData) => {
  if (iftttInformation) {

    let oldIftttInformation = await CommonModel.doGetLocalData(CommonModel.KEYS.USER_DATA_IFTTT_INFORMATION);
    if ((!oldIftttInformation || !oldIftttInformation.connectIFTTT) && (iftttInformation && iftttInformation.connectIFTTT)) {
      await CommonModel.doTrackEvent({
        event_name: 'registry_user_connected_ifttt',
        account_number: userInformation ? userInformation.bitmarkAccountNumber : null,
      });
    }

    await CommonModel.doSetLocalData(CommonModel.KEYS.USER_DATA_IFTTT_INFORMATION, iftttInformation);

    let accountStoreState = merge({}, AccountStore.getState().data);
    accountStoreState.iftttInformation = iftttInformation;
    AccountStore.dispatch(AccountActions.init(accountStoreState));

    if (!isLoadingAllUserData) {
      await doGenerateTransactionActionRequiredData();
    }
  }
};

const doCheckNewTrackingBitmarks = async (trackingBitmarks) => {
  if (trackingBitmarks) {
    await CommonModel.doSetLocalData(CommonModel.KEYS.USER_DATA_TRACKING_BITMARKS, trackingBitmarks);

    let assetsStoreState = merge({}, AssetsStore.getState().data);
    assetsStoreState.trackingBitmarks = trackingBitmarks;
    assetsStoreState.totalTrackingBitmarks = trackingBitmarks.length;
    assetsStoreState.existNewTracking = (trackingBitmarks || []).findIndex(bm => !bm.isViewed) >= 0;
    AssetsStore.dispatch(AssetsActions.init(assetsStoreState));

    let bottomTabStoreState = merge({}, BottomTabStore.getState().data);
    bottomTabStoreState.existNewTracking = (trackingBitmarks || []).findIndex(bm => !bm.isViewed) >= 0;
    BottomTabStore.dispatch(BottomTabActions.init(bottomTabStoreState));

    let propertyStoreState = merge({}, PropertyStore.getState().data);
    if (propertyStoreState.bitmark) {
      propertyStoreState.isTracking = !!(await DataProcessor.doGetTrackingBitmarkInformation(propertyStoreState.bitmark.id));
      BottomTabStore.dispatch(BottomTabActions.init(propertyStoreState));
    }
  }
};

const doCheckNewTransactions = async (transactions) => {
  if (transactions) {
    await CommonModel.doSetLocalData(CommonModel.KEYS.USER_DATA_TRANSACTIONS, transactions);
    await doGenerateTransactionHistoryData();
  }
};
const doCheckNewBitmarks = async (localAssets) => {
  if (localAssets) {
    await CommonModel.doSetLocalData(CommonModel.KEYS.USER_DATA_LOCAL_BITMARKS, localAssets);

    let totalBitmarks = 0;
    localAssets.forEach(asset => totalBitmarks += asset.bitmarks.length);

    let assetsStoreState = merge({}, AssetsStore.getState().data);
    assetsStoreState.totalBitmarks = totalBitmarks;
    assetsStoreState.totalAssets = localAssets.length;
    assetsStoreState.existNewAsset = localAssets.findIndex(asset => !asset.isViewed) >= 0;
    assetsStoreState.assets = localAssets.slice(0, Math.min(localAssets.length, Math.max(assetsStoreState.assets.length, 20)));
    AssetsStore.dispatch(AssetsActions.init(assetsStoreState));

    let bottomTabStoreState = merge({}, BottomTabStore.getState().data);
    bottomTabStoreState.existNewAsset = localAssets.findIndex(asset => !asset.isViewed) >= 0;
    BottomTabStore.dispatch(BottomTabActions.init(bottomTabStoreState));

    let assetStoreState = merge({}, AssetStore.getState().data);
    if (assetStoreState.asset && assetStoreState.asset.id) {
      assetStoreState.asset = localAssets.find(asset => asset.id === assetStoreState.asset.id);
      AssetStore.dispatch(AssetActions.init(assetStoreState));
    }

    let propertyStoreState = merge({}, PropertyStore.getState().data);
    if (propertyStoreState.bitmark && propertyStoreState.bitmark.id && propertyStoreState.bitmark.asset_id) {
      let asset = localAssets.find(asset => asset.id === propertyStoreState.asset.asset_id);
      propertyStoreState.asset = asset;
      propertyStoreState.bitmark = asset.find(bitmark => bitmark.id === propertyStoreState.bitmark.id);
      propertyStoreState.isTracking = !!(await DataProcessor.doGetTrackingBitmarkInformation(propertyStoreState.bitmark.id));
      PropertyStore.dispatch(PropertyActions.init(propertyStoreState));
    }
  }
};

const setAppLoadingStatus = () => {
  let assetsStoreState = merge({}, AssetsStore.getState().data);
  assetsStoreState.appLoadingData = isLoadingData;
  AssetsStore.dispatch(AssetsActions.init(assetsStoreState));

  let accountStoreState = merge({}, AccountStore.getState().data);
  accountStoreState.appLoadingData = isLoadingData;
  AccountStore.dispatch(AccountActions.init(accountStoreState));

  let transactionStoreState = merge({}, TransactionsStore.getState().data);
  transactionStoreState.appLoadingData = isLoadingData;
  TransactionsStore.dispatch(TransactionsActions.init(transactionStoreState));
}
// ================================================================================================================================================

const recheckLocalAssets = (localAssets, outgoingTransferOffers) => {
  for (let asset of localAssets) {
    asset.bitmarks = asset.bitmarks.sort((a, b) => b.offset - a.offset);
    for (let bitmark of asset.bitmarks) {
      let transferOffer = (outgoingTransferOffers || []).find(item => (item.status === 'open' && item.bitmark_id === bitmark.id));
      bitmark.transferOfferId = transferOffer ? transferOffer.id : null;
    }
  }
  return localAssets;
};

let queueGetTransferOffer = [];
const runGetTransferOfferInBackground = () => {
  return new Promise((resolve) => {
    queueGetTransferOffer.push(resolve);
    if (queueGetTransferOffer.length > 1) {
      return;
    }
    TransactionService.doGetAllTransferOffers(userInformation.bitmarkAccountNumber).then(transferOffers => {
      console.log('runOnBackground  runGetTransferOfferInBackground success');
      queueGetTransferOffer.forEach(queueResolve => queueResolve(transferOffers));
      queueGetTransferOffer = [];
    }).catch(error => {
      queueGetTransferOffer.forEach(queueResolve => queueResolve());
      queueGetTransferOffer = [];
      console.log('runOnBackground  runGetTransferOfferInBackground error :', error);
    });
  });
};


let queueGetTrackingBitmarks = [];
const runGetTrackingBitmarksInBackground = () => {
  return new Promise((resolve) => {
    queueGetTrackingBitmarks.push(resolve);
    if (queueGetTrackingBitmarks.length > 1) {
      return;
    }
    BitmarkService.doGetTrackingBitmarks(userInformation.bitmarkAccountNumber).then(trackingBitmarks => {
      console.log('runOnBackground  runGetTrackingBitmarksInBackground success');
      queueGetTrackingBitmarks.forEach(queueResolve => queueResolve(trackingBitmarks));
      queueGetTrackingBitmarks = [];
    }).catch(error => {
      queueGetTrackingBitmarks.forEach(queueResolve => queueResolve());
      queueGetTrackingBitmarks = [];
      console.log('runOnBackground  runGetTrackingBitmarksInBackground error :', error);
    });
  });
};

let queueGetIFTTTInformation = [];
const runGetIFTTTInformationInBackground = () => {
  return new Promise((resolve) => {
    queueGetIFTTTInformation.push(resolve);
    if (queueGetIFTTTInformation.length > 1) {
      return;
    }
    IftttModel.doGetIFtttInformation(userInformation.bitmarkAccountNumber).then(iftttInformation => {
      console.log('runOnBackground  runGetIFTTTInformationInBackground success');
      queueGetIFTTTInformation.forEach(queueResolve => queueResolve(iftttInformation));
      queueGetIFTTTInformation = [];
    }).catch(error => {
      queueGetIFTTTInformation.forEach(queueResolve => queueResolve());
      queueGetIFTTTInformation = [];
      console.log('runOnBackground  runGetIFTTTInformationInBackground error :', error);
    });
  });
};
// ================================================================================================================================================
// special process
let queueGetTransactions = [];
const runGetTransactionsInBackground = () => {
  return new Promise((resolve) => {
    queueGetTransactions.push(resolve);
    if (queueGetTransactions.length > 1) {
      return;
    }

    let doGetAllTransactions = async () => {
      let oldTransactions, lastOffset;
      let canContinue = true;
      while (canContinue) {
        let data = await TransactionService.doGet100Transactions(userInformation.bitmarkAccountNumber, oldTransactions, lastOffset);
        canContinue = !!data;
        if (data) {
          oldTransactions = data.transactions;
          lastOffset = data.lastOffset;
          await doCheckNewTransactions(oldTransactions);
        }
      }
      oldTransactions = await CommonModel.doGetLocalData(CommonModel.KEYS.USER_DATA_TRANSACTIONS);
      await doCheckNewTransactions(oldTransactions);
    };

    doGetAllTransactions().then(() => {
      console.log('runOnBackground  runGetTransactionsInBackground success');
      queueGetTransactions.forEach(queueResolve => queueResolve());
      queueGetTransactions = [];
    }).catch(error => {
      queueGetTransactions.forEach(queueResolve => queueResolve());
      queueGetTransactions = [];
      console.log('runOnBackground  runGetTransactionsInBackground error :', error);
    });
  });
};

let queueGetLocalBitmarks = [];
const runGetLocalBitmarksInBackground = (outgoingTransferOffers) => {
  return new Promise((resolve) => {
    queueGetLocalBitmarks.push(resolve);
    if (queueGetLocalBitmarks.length > 1) {
      return;
    }

    let doGetAllBitmarks = async () => {
      if (!outgoingTransferOffers) {
        let transferOffers = (await CommonModel.doGetLocalData(CommonModel.KEYS.USER_DATA_TRANSFER_OFFERS)) || {};
        outgoingTransferOffers = transferOffers.outgoingTransferOffers || [];
      }
      let oldLocalAssets, lastOffset;
      let canContinue = true;
      while (canContinue) {
        let data = await BitmarkService.doGet100Bitmarks(userInformation.bitmarkAccountNumber, oldLocalAssets, lastOffset);
        canContinue = data.hasChanging;
        oldLocalAssets = data.localAssets;
        oldLocalAssets = recheckLocalAssets(oldLocalAssets, outgoingTransferOffers);
        await doCheckNewBitmarks(oldLocalAssets);
        if (data.hasChanging) {
          lastOffset = data.lastOffset;
        }
      }
      let localAsset = await CommonModel.doGetLocalData(CommonModel.KEYS.USER_DATA_LOCAL_BITMARKS);
      localAsset = recheckLocalAssets(localAsset, outgoingTransferOffers);
      await doCheckNewBitmarks(localAsset);
    };

    doGetAllBitmarks().then(() => {
      queueGetLocalBitmarks.forEach(queueResolve => queueResolve());
      queueGetLocalBitmarks = [];
      console.log('runOnBackground  runGetLocalBitmarksInBackground success');
    }).catch(error => {
      console.log('runOnBackground  runGetLocalBitmarksInBackground error :', error);
      queueGetLocalBitmarks.forEach(queueResolve => queueResolve());
      queueGetLocalBitmarks = [];
    });
  });
};

const runOnBackground = async () => {
  let userInfo = await UserModel.doTryGetCurrentUser();
  if (userInformation === null || JSON.stringify(userInfo) !== JSON.stringify(userInformation)) {
    userInformation = userInfo;
    let accountStoreState = merge({}, AccountStore.getState().data);
    accountStoreState.userInformation = userInformation;
    AccountStore.dispatch(AccountActions.init(accountStoreState));
  }
  if (userInformation && userInformation.bitmarkAccountNumber) {
    let runParallel = () => {
      return new Promise((resolve) => {
        Promise.all([
          runGetTrackingBitmarksInBackground(),
          runGetTransferOfferInBackground(),
          runGetIFTTTInformationInBackground(),
        ]).then(resolve);
      });
    };
    let parallelResults = await runParallel();
    await doCheckNewTrackingBitmarks(parallelResults[0]);
    await doCheckTransferOffers(parallelResults[1], true);
    await doCheckNewIftttInformation(parallelResults[2], true);
    await doGenerateTransactionActionRequiredData();

    let doParallel = () => {
      return new Promise((resolve) => {
        Promise.all([
          runGetLocalBitmarksInBackground(parallelResults[1].outgoingTransferOffers),
          runGetTransactionsInBackground()
        ]).then(resolve);
      });
    };
    await doParallel();
  }
  console.log('runOnBackground done ====================================');
};

const doReloadUserData = async () => {
  isLoadingData = true;
  setAppLoadingStatus();

  await runOnBackground();

  isLoadingData = false;
  setAppLoadingStatus();
};
const doReloadTrackingBitmark = async () => {
  let trackingBitmarks = await runGetTrackingBitmarksInBackground();
  await doCheckNewTrackingBitmarks(trackingBitmarks);
  return trackingBitmarks;
};

const doReloadTransferOffers = async () => {
  let transferOffers = await runGetTransferOfferInBackground();
  await doCheckTransferOffers(transferOffers);
  return transferOffers;
};

const doReloadLocalBitmarks = async () => {
  return await runGetLocalBitmarksInBackground();
};

const configNotification = () => {
  const onRegistered = async (registeredNotificationInfo) => {
    let notificationUUID = registeredNotificationInfo ? registeredNotificationInfo.token : null;
    if (!userInformation || !userInformation.bitmarkAccountNumber) {
      userInformation = await UserModel.doGetCurrentUser();
    }
    if (notificationUUID && userInformation.notificationUUID !== notificationUUID) {
      NotificationService.doRegisterNotificationInfo(userInformation.bitmarkAccountNumber, notificationUUID).then(() => {
        userInformation.notificationUUID = notificationUUID;
        return UserModel.doUpdateUserInfo(userInformation);
      }).catch(error => {
        console.log('DataProcessor doRegisterNotificationInfo error:', error);
      });
    }
  };
  const onReceivedNotification = async (notificationData) => {
    if (!notificationData.foreground) {
      if (!userInformation || !userInformation.bitmarkAccountNumber) {
        userInformation = await UserModel.doGetCurrentUser();
      }
      await CommonModel.doTrackEvent({
        event_name: 'registry_user_click_notification',
        account_number: userInformation ? userInformation.bitmarkAccountNumber : null,
      });
      setTimeout(async () => {
        EventEmitterService.emit(EventEmitterService.events.APP_RECEIVED_NOTIFICATION, notificationData.data);
      }, 1000);
    }
  };
  NotificationService.configure(onRegistered, onReceivedNotification);
  NotificationService.removeAllDeliveredNotifications();
};
// ================================================================================================================================================
// ================================================================================================================================================
let dataInterval = null;
const startInterval = () => {
  stopInterval();
  dataInterval = setInterval(runOnBackground, 30 * 1000);
};

const stopInterval = () => {
  if (dataInterval) {
    clearInterval(dataInterval);
  }
  dataInterval = null;
};

// ================================================================================================================================================
// ================================================================================================================================================
const doStartBackgroundProcess = async (justCreatedBitmarkAccount) => {
  await doReloadUserData();
  startInterval();
  if (!justCreatedBitmarkAccount && userInformation && userInformation.bitmarkAccountNumber) {
    let result = await NotificationService.doCheckNotificationPermission();
    await doMarkRequestedNotification(result);
  }
  return userInformation;
};

const doCreateAccount = async (touchFaceIdSession) => {
  let userInformation = await AccountService.doGetCurrentAccount(touchFaceIdSession);
  let signatureData = await CommonModel.doCreateSignatureData(touchFaceIdSession);
  await NotificationModel.doTryRegisterAccount(userInformation.bitmarkAccountNumber, signatureData.timestamp, signatureData.signature);
  return userInformation;
};

const doLogin = async (touchFaceIdSession) => {
  userInformation = await AccountService.doGetCurrentAccount(touchFaceIdSession);
  return userInformation;
};

const doLogout = async () => {
  if (userInformation.notificationUUID) {
    let signatureData = await CommonModel.doTryCreateSignatureData('Please sign to authorize your transactions')
    await NotificationService.doTryDeregisterNotificationInfo(userInformation.bitmarkAccountNumber, userInformation.notificationUUID, signatureData);
  }
  await AccountModel.doLogout();
  await UserModel.doRemoveUserInfo();
  userInformation = {};
  AssetsStore.dispatch(AssetsActions.reset());
  BottomTabStore.dispatch(BottomTabActions.reset());
  AssetStore.dispatch(AssetActions.reset());
  PropertyStore.dispatch(PropertyActions.reset());
  AccountStore.dispatch(AccountActions.reset());
  TransactionsStore.dispatch(TransactionsActions.reset());
};


const doDeactiveApplication = async () => {
  stopInterval();
};

const doGetAppInformation = async () => {
  return await CommonModel.doGetLocalData(CommonModel.KEYS.APP_INFORMATION);
};

const checkAppNeedResetLocalData = async (appInfo) => {
  if (config.needResetLocalData) {
    appInfo = appInfo || (await doGetAppInformation());
    if (!appInfo || appInfo.resetLocalDataAt !== config.needResetLocalData) {
      appInfo = appInfo || {};
      appInfo.resetLocalDataAt = config.needResetLocalData;
      await CommonModel.doSetLocalData(CommonModel.KEYS.APP_INFORMATION, appInfo);
      await UserModel.resetUserLocalData();
    }
  }
};

const doOpenApp = async () => {
  userInformation = await UserModel.doTryGetCurrentUser();
  await CommonModel.doTrackEvent({
    event_name: 'registry_open',
    account_number: userInformation ? userInformation.bitmarkAccountNumber : null,
  });

  let appInfo = await doGetAppInformation();
  appInfo = appInfo || {};

  if (appInfo.trackEvents && appInfo.trackEvents.app_user_allow_notification) {
    let result = await NotificationService.doCheckNotificationPermission();

    if (result && !result.alert && !result.badge && !result.sound &&
      (!appInfo.trackEvents || !appInfo.trackEvents.app_user_turn_off_notification)) {
      appInfo.trackEvents = appInfo.trackEvents || {};
      appInfo.trackEvents.app_user_turn_off_notification = true;
      await CommonModel.doSetLocalData(CommonModel.KEYS.APP_INFORMATION, appInfo);
      await CommonModel.doTrackEvent({
        event_name: 'registry_user_turn_off_notification',
        account_number: userInformation ? userInformation.bitmarkAccountNumber : null,
      });
    }
  }

  if (!appInfo.trackEvents || !appInfo.trackEvents.app_download) {
    let appInfo = await doGetAppInformation();
    appInfo = appInfo || {};
    appInfo.trackEvents = appInfo.trackEvents || {};
    appInfo.trackEvents.app_download = true;
    await CommonModel.doSetLocalData(CommonModel.KEYS.APP_INFORMATION, appInfo);
    await CommonModel.doTrackEvent({
      event_name: 'registry_download',
      account_number: userInformation ? userInformation.bitmarkAccountNumber : null,
    });
  }

  if (userInformation && userInformation.bitmarkAccountNumber) {
    configNotification();
    await checkAppNeedResetLocalData(appInfo);

    let localAssets = (await CommonModel.doGetLocalData(CommonModel.KEYS.USER_DATA_LOCAL_BITMARKS)) || [];
    let trackingBitmarks = (await CommonModel.doGetLocalData(CommonModel.KEYS.USER_DATA_TRACKING_BITMARKS)) || [];

    let totalBitmarks = 0;
    localAssets.forEach(asset => totalBitmarks += asset.bitmarks.length);

    if (!Array.isArray(trackingBitmarks)) {
      await CommonModel.doSetLocalData(CommonModel.KEYS.USER_DATA_TRACKING_BITMARKS, []);
      trackingBitmarks = [];
    }

    let actionRequired = (await CommonModel.doGetLocalData(CommonModel.KEYS.USER_DATA_TRANSACTIONS_ACTION_REQUIRED)) || [];
    let completed = (await CommonModel.doGetLocalData(CommonModel.KEYS.USER_DATA_TRANSACTIONS_HISTORY)) || [];

    let totalTasks = 0;
    actionRequired.forEach(item => totalTasks += (item.number ? item.number : 1));
    // Add "Write Down Your Recovery Phrase" action required which was created when creating account if any
    let testRecoveryPhaseActionRequired = await helper.getTestWriteRecoveryPhaseActionRequired();
    if (testRecoveryPhaseActionRequired) {
      actionRequired.unshift({
        key: actionRequired.length,
        type: ActionTypes.test_write_down_recovery_phase,
        typeTitle: 'SECURITY ALERT',
        timestamp: moment(new Date(testRecoveryPhaseActionRequired.timestamp)),
      });

      totalTasks += 1;
    }
    // ============================
    NotificationService.setApplicationIconBadgeNumber(totalTasks || 0);
    BottomTabStore.dispatch(BottomTabActions.init({
      totalTasks,
      existNewAsset: localAssets.findIndex(asset => !asset.isViewed) >= 0,
      existNewTracking: (trackingBitmarks || []).findIndex(bm => !bm.isViewed) >= 0,
    }));

    AssetsStore.dispatch(AssetsActions.init({
      assets: localAssets.slice(0, 20),
      totalAssets: localAssets.length,
      existNewAsset: localAssets.findIndex(asset => !asset.isViewed) >= 0,
      totalBitmarks,

      totalTrackingBitmarks: trackingBitmarks.length,
      existNewTrackingBitmark: (trackingBitmarks || []).findIndex(bm => !bm.isViewed) >= 0,
      trackingBitmarks: trackingBitmarks.slice(0, 20),
    }));

    TransactionsStore.dispatch(TransactionsActions.init({
      totalActionRequired: actionRequired.length,
      actionRequired: actionRequired.slice(0, 20),
      totalTasks,
      totalCompleted: completed.length,
      completed: completed.slice(0, 20),
    }));

    let assetStoreState = merge({}, AssetStore.getState().data);
    if (assetStoreState.asset && assetStoreState.asset.id) {
      assetStoreState.asset = localAssets.find(asset => asset.id === assetStoreState.asset.id);
      AssetStore.dispatch(AssetActions.init(assetStoreState));
    }

    let propertyStoreState = merge({}, PropertyStore.getState().data);
    if (assetStoreState.bitmark && assetStoreState.bitmark.id && assetStoreState.bitmark.asset_id) {
      let asset = localAssets.find(asset => asset.id === propertyStoreState.bitmark.asset_id);
      propertyStoreState.asset = asset;
      propertyStoreState.bitmark = asset.find(bitmark => bitmark.id === propertyStoreState.bitmark.id);
      propertyStoreState.isTracking = !!(await DataProcessor.doGetTrackingBitmarkInformation(propertyStoreState.bitmark.id));
      PropertyStore.dispatch(PropertyActions.init(propertyStoreState));
    }

    AccountStore.dispatch(AccountActions.init({
      userInformation,
      iftttInformation: await doGetIftttInformation(),
    }));

    // ============================
  }

  setAppLoadingStatus();
  return userInformation;
};

const doDownloadBitmark = async (touchFaceIdSession, bitmark) => {
  let filePath = await BitmarkSDK.downloadBitmark(touchFaceIdSession, bitmark.id);
  filePath = filePath.replace('file://', '');
  return filePath;
};

const doUpdateViewStatus = async (assetId, bitmarkId) => {
  if (assetId && bitmarkId) {
    let localAssets = (await CommonModel.doGetLocalData(CommonModel.KEYS.USER_DATA_LOCAL_BITMARKS)) || [];
    let localAsset = (localAssets || []).find(la => la.id === assetId);
    if (localAsset && !localAsset.isViewed) {
      let assetViewed = true;
      localAsset.bitmarks.forEach(bitmark => {
        if (bitmarkId === bitmark.id) {
          bitmark.isViewed = true;
        }
        if (!bitmark.isViewed && assetViewed) {
          assetViewed = false;
        }
      });
      localAsset.isViewed = assetViewed;
      await CommonModel.doSetLocalData(CommonModel.KEYS.USER_DATA_LOCAL_BITMARKS, localAssets);

      let assetsStoreState = merge({}, AssetsStore.getState().data);
      assetsStoreState.existNewAsset = localAssets.findIndex(asset => !asset.isViewed) >= 0;
      assetsStoreState.assets = localAssets.slice(0, Math.min(localAssets.length, Math.max(assetsStoreState.assets.length, 20)));
      AssetsStore.dispatch(AssetsActions.init(assetsStoreState));

      let bottomTabStoreState = merge({}, BottomTabStore.getState().data);
      bottomTabStoreState.existNewAsset = localAssets.findIndex(asset => !asset.isViewed) >= 0;
      BottomTabStore.dispatch(BottomTabActions.init(bottomTabStoreState));

      let assetStoreState = merge({}, AssetStore.getState().data);
      if (assetStoreState.asset && assetStoreState.asset.id) {
        assetStoreState.asset = localAssets.find(asset => asset.id === assetStoreState.asset.id);
        AssetStore.dispatch(AssetActions.init(assetStoreState));
      }

      let propertyStoreState = merge({}, PropertyStore.getState().data);
      if (assetStoreState.bitmark && assetStoreState.bitmark.id) {
        let asset = localAssets.find(asset => asset.id === propertyStoreState.asset.id);
        propertyStoreState.asset = asset;
        propertyStoreState.bitmark = asset.find(bitmark => bitmark.id === propertyStoreState.bitmark.id);
        propertyStoreState.isTracking = !!(await DataProcessor.doGetTrackingBitmarkInformation(propertyStoreState.bitmark.id));
        AssetStore.dispatch(AssetActions.init(propertyStoreState));
      }
    }
  }
  if (bitmarkId) {
    let trackingBitmarks = (await CommonModel.doGetLocalData(CommonModel.KEYS.USER_DATA_TRACKING_BITMARKS)) || [];
    let trackingBitmark = (trackingBitmarks || []).find(tb => tb.id === bitmarkId);
    if (trackingBitmark) {
      let hasChanging = !trackingBitmark.isViewed;
      trackingBitmark.isViewed = true;
      trackingBitmark.lastHistory = {
        status: trackingBitmark.status,
        head_id: trackingBitmark.head_id,
      };
      await CommonModel.doSetLocalData(CommonModel.KEYS.USER_DATA_TRACKING_BITMARKS, trackingBitmarks);
      if (hasChanging) {

        let assetsStoreState = merge({}, AssetsStore.getState().data);
        assetsStoreState.trackingBitmarks = trackingBitmarks;
        assetsStoreState.totalTrackingBitmarks = trackingBitmarks.length;
        assetsStoreState.existNewTracking = (trackingBitmarks || []).findIndex(bm => !bm.isViewed) >= 0;
        AssetsStore.dispatch(AssetsActions.init(assetsStoreState));

        let bottomTabStoreState = merge({}, BottomTabStore.getState().data);
        bottomTabStoreState.existNewTracking = (trackingBitmarks || []).findIndex(bm => !bm.isViewed) >= 0;
        BottomTabStore.dispatch(BottomTabActions.init(bottomTabStoreState));

        let propertyStoreState = merge({}, PropertyStore.getState().data);
        if (propertyStoreState.bitmark) {
          propertyStoreState.isTracking = !!(await DataProcessor.doGetTrackingBitmarkInformation(propertyStoreState.bitmark.id));
          BottomTabStore.dispatch(BottomTabActions.init(propertyStoreState));
        }
      }
    }
  }
};

const doTrackingBitmark = async (touchFaceIdSession, asset, bitmark) => {
  let signatureData = await CommonModel.doCreateSignatureData(touchFaceIdSession);
  await BitmarkModel.doAddTrackingBitmark(userInformation.bitmarkAccountNumber, signatureData.timestamp, signatureData.signature,
    bitmark.id, bitmark.head_id, bitmark.status);
  let trackingBitmarks = await runGetTrackingBitmarksInBackground();
  await doCheckNewTrackingBitmarks(trackingBitmarks);
  return true;
};
const doStopTrackingBitmark = async (touchFaceIdSession, bitmark) => {
  let signatureData = await CommonModel.doCreateSignatureData(touchFaceIdSession);
  await BitmarkModel.doStopTrackingBitmark(userInformation.bitmarkAccountNumber, signatureData.timestamp, signatureData.signature, bitmark.id);
  let trackingBitmarks = await runGetTrackingBitmarksInBackground();
  await doCheckNewTrackingBitmarks(trackingBitmarks);
  return true;
};

const doReloadIFTTTInformation = async () => {
  let iftttInformation = await runGetIFTTTInformationInBackground();
  await doCheckNewIftttInformation(iftttInformation);
  return iftttInformation;
};

const doRevokeIftttToken = async (touchFaceIdSession) => {
  let signatureData = await CommonModel.doCreateSignatureData(touchFaceIdSession);
  let iftttInformation = await IftttModel.doRevokeIftttToken(userInformation.bitmarkAccountNumber, signatureData.timestamp, signatureData.signature);
  await doCheckNewIftttInformation(iftttInformation);
  return iftttInformation;
};
const doIssueIftttData = async (touchFaceIdSession, iftttBitmarkFile) => {
  let folderPath = FileUtil.CacheDirectory + '/Bitmark-IFTTT';
  await FileUtil.mkdir(folderPath);
  let filename = iftttBitmarkFile.assetInfo.filePath.substring(iftttBitmarkFile.assetInfo.filePath.lastIndexOf("/") + 1, iftttBitmarkFile.assetInfo.filePath.length);
  let filePath = folderPath + '/' + filename;
  let signatureData = await CommonModel.doCreateSignatureData(touchFaceIdSession);
  let downloadResult = await IftttModel.downloadBitmarkFile(userInformation.bitmarkAccountNumber, signatureData.timestamp, signatureData.signature, iftttBitmarkFile.id, filePath);
  if (downloadResult.statusCode >= 400) {
    throw new Error('Download file error!');
  }
  await BitmarkModel.doIssueFile(touchFaceIdSession, filePath, iftttBitmarkFile.assetInfo.propertyName, iftttBitmarkFile.assetInfo.metadata, 1);
  let iftttInformation = await IftttModel.doRemoveBitmarkFile(userInformation.bitmarkAccountNumber, signatureData.timestamp, signatureData.signature, iftttBitmarkFile.id);
  await doCheckNewIftttInformation(iftttInformation);
  return iftttInformation;
};

const doAcceptTransferBitmark = async (touchFaceIdSession, transferOffer) => {
  await TransactionService.doAcceptTransferBitmark(touchFaceIdSession, transferOffer);
  return await doReloadTransferOffers();
};

const doAcceptAllTransfers = async (touchFaceIdSession, transferOffers) => {
  for (let transferOffer of transferOffers) {
    await TransactionService.doAcceptTransferBitmark(touchFaceIdSession, transferOffer);
  }
  return await doReloadTransferOffers();
};

const doCancelTransferBitmark = async (touchFaceIdSession, transferOfferId) => {
  await TransactionService.doCancelTransferBitmark(touchFaceIdSession, transferOfferId);
  let result = await doReloadTransferOffers();
  let oldTransactions = await CommonModel.doGetLocalData(CommonModel.KEYS.USER_DATA_TRANSACTIONS);
  await doCheckNewTransactions(oldTransactions);
  await runGetLocalBitmarksInBackground();
  return result;
};

const doRejectTransferBitmark = async (touchFaceIdSession, transferOffer, ) => {
  await TransactionService.doRejectTransferBitmark(touchFaceIdSession, transferOffer);
  return await doReloadTransferOffers();
};

const doIssueFile = async (touchFaceIdSession, filePath, assetName, metadataList, quantity, isPublicAsset) => {
  let result = await BitmarkService.doIssueFile(touchFaceIdSession, filePath, assetName, metadataList, quantity, isPublicAsset);
  await runGetLocalBitmarksInBackground();
  return result;
};

const doTransferBitmark = async (touchFaceIdSession, bitmarkId, receiver) => {
  let result = await TransactionService.doTransferBitmark(touchFaceIdSession, bitmarkId, receiver);
  await doReloadTransferOffers();
  await runGetLocalBitmarksInBackground();
  return result;
};

const doMigrateWebAccount = async (touchFaceIdSession, token) => {
  let result = await BitmarkService.doConfirmWebAccount(touchFaceIdSession, userInformation.bitmarkAccountNumber, token);
  await runGetLocalBitmarksInBackground();
  return result;
};

const doSignInOnWebApp = async (touchFaceIdSession, token) => {
  return await BitmarkService.doConfirmWebAccount(touchFaceIdSession, userInformation.bitmarkAccountNumber, token);
};


const doGetProvenance = (bitmarkId) => {
  return new Promise((resolve) => {
    CommonModel.doGetLocalData(CommonModel.KEYS.USER_DATA_TRACKING_BITMARKS).then(trackingBitmarks => {
      let trackingBitmark = (trackingBitmarks || []).find(tb => tb.id === bitmarkId);
      if (trackingBitmark) {
        return BitmarkService.doGetProvenance(bitmarkId, trackingBitmark.lastHistory.head_id, trackingBitmark.lastHistory.status)
      } else {
        return BitmarkService.doGetProvenance(bitmarkId);
      }
    }).then(resolve).catch(error => {
      console.log('doGetProvenance error:', error);
      resolve([]);
    });
  });
};

const doAddMoreAssets = async (currentLength) => {
  currentLength = currentLength || 0;
  let allAssets = (await CommonModel.doGetLocalData(CommonModel.KEYS.USER_DATA_LOCAL_BITMARKS)) || [];
  let assetsStoreState = merge({}, AssetsStore.getState().data);
  assetsStoreState.assets = allAssets.slice(0, Math.min(allAssets.length, currentLength + 20));
  AssetsStore.dispatch(AssetsActions.init(assetsStoreState));
};

const getUserInformation = () => {
  return userInformation;
};

const getApplicationVersion = () => {
  return DeviceInfo.getVersion();
};

const getApplicationBuildNumber = () => {
  return DeviceInfo.getBuildNumber();
};

const doGetLocalBitmarkInformation = async (bitmarkId, assetId) => {
  let localAssets = (await CommonModel.doGetLocalData(CommonModel.KEYS.USER_DATA_LOCAL_BITMARKS)) || [];
  let bitmark;
  let asset;
  if (assetId) {
    asset = localAssets.find(localAsset => localAsset.id === assetId);
    if (bitmarkId) {
      bitmark = (asset ? asset.bitmarks : []).find(localBitmark => localBitmark.id === bitmarkId);
    }
  } else if (bitmarkId) {
    asset = localAssets.find(localAsset => {
      bitmark = localAsset.bitmarks.find(localBitmark => localBitmark.id === bitmarkId);
      return !!bitmark;
    });
  }
  return { bitmark, asset };
}

const doGetTrackingBitmarkInformation = async (bitmarkId) => {
  let trackingBitmarks = (await CommonModel.doGetLocalData(CommonModel.KEYS.USER_DATA_TRACKING_BITMARKS)) || [];
  return (trackingBitmarks || []).find(bitmark => bitmark.id === bitmarkId);
}

const doGetIftttInformation = async () => {
  return (await CommonModel.doGetLocalData(CommonModel.KEYS.USER_DATA_IFTTT_INFORMATION)) || {};
};

// ======================================================================================================================================================================================
// ======================================================================================================================================================================================
// ======================================================================================================================================================================================
// ======================================================================================================================================================================================
const ActionTypes = {
  transfer: 'transfer',
  ifttt: 'ifttt',
  test_write_down_recovery_phase: 'test_write_down_recovery_phase',
};
const doGenerateTransactionActionRequiredData = async () => {
  let actionRequired;
  let totalTasks = 0;
  let transferOffers = (await CommonModel.doGetLocalData(CommonModel.KEYS.USER_DATA_TRANSFER_OFFERS)) || {};
  if (transferOffers.incomingTransferOffers) {
    actionRequired = actionRequired || [];
    (transferOffers.incomingTransferOffers || []).forEach((item) => {
      if (item.status === 'open') {
        actionRequired.push({
          key: actionRequired.length,
          transferOffer: item,
          type: ActionTypes.transfer,
          typeTitle: global.i18n.t("DataProcessor_signToReceiveBitmark"),
          timestamp: moment(item.created_at),
        });
        totalTasks++;
      }
    });
  }

  let iftttInformation = await doGetIftttInformation();
  if (iftttInformation && iftttInformation.bitmarkFiles) {
    iftttInformation.bitmarkFiles.forEach(item => {
      item.key = actionRequired.length;
      item.type = ActionTypes.ifttt;
      item.typeTitle = global.i18n.t("DataProcessor_issuanceRequest");
      item.timestamp = item.assetInfo.timestamp;
      actionRequired.push(item);
      totalTasks++;
    });
  }

  actionRequired = actionRequired ? actionRequired.sort((a, b) => {
    if (a.important) { return -1; }
    if (b.important) { return 1; }
    if (!a.timestamp) return -1;
    if (!b.timestamp) return 1;
    return moment(b.timestamp).toDate().getTime() - moment(a.timestamp).toDate().getTime();
  }) : actionRequired;

  await CommonModel.doSetLocalData(CommonModel.KEYS.USER_DATA_TRANSACTIONS_ACTION_REQUIRED, actionRequired);

  // Add "Write Down Your Recovery Phrase" action required which was created when creating account if any
  let testRecoveryPhaseActionRequired = await helper.getTestWriteRecoveryPhaseActionRequired();
  if (testRecoveryPhaseActionRequired) {
    actionRequired.unshift({
      key: actionRequired.length,
      type: ActionTypes.test_write_down_recovery_phase,
      typeTitle: global.i18n.t("DataProcessor_securityAlert"),
      timestamp: moment(new Date(testRecoveryPhaseActionRequired.timestamp)),
    });

    totalTasks += 1;
  }

  let transactionStoreState = merge({}, TransactionsStore.getState().data);
  transactionStoreState.totalTasks = totalTasks;
  transactionStoreState.totalActionRequired = actionRequired.length;
  transactionStoreState.actionRequired = actionRequired.slice(0, Math.min(actionRequired.length, Math.max(transactionStoreState.actionRequired.length, 20)));
  TransactionsStore.dispatch(TransactionsActions.init(transactionStoreState));

  let bottomTabStoreState = merge({}, BottomTabStore.getState().data);
  bottomTabStoreState.totalTasks = totalTasks;
  BottomTabStore.dispatch(BottomTabActions.init(bottomTabStoreState));

  console.log('actionRequired :', actionRequired);
  NotificationService.setApplicationIconBadgeNumber(totalTasks || 0);
};

const doGenerateTransactionHistoryData = async () => {
  let transactions = (await CommonModel.doGetLocalData(CommonModel.KEYS.USER_DATA_TRANSACTIONS)) || [];

  let completed;
  if (transactions) {
    completed = [];
    transactions.forEach((item) => {
      let title = 'ISSUANCE';
      let type = '';
      let to = item.to;
      let status = item.status;
      let mapIssuance = [];

      if (item.to) {
        title = 'SEND';
        type = 'P2P TRANSFER';
      }

      if (title === 'ISSUANCE') {
        if (mapIssuance[item.assetId] && mapIssuance[item.assetId][item.blockNumber]) {
          return;
        }
        if (!mapIssuance[item.assetId]) {
          mapIssuance[item.assetId] = {};
        }
        mapIssuance[item.assetId][item.blockNumber] = true;
      }

      completed.push({
        title,
        type,
        to,
        status,
        assetId: item.assetId,
        blockNumber: item.blockNumber,
        key: completed.length,
        timestamp: item.timestamp,
        txid: item.txid,
        previousId: item.previousId,
        assetName: item.assetName,
        from: item.from,
      });
    });
  }
  completed = completed ? completed.sort((a, b) => {
    if (!a || !a.timestamp) return -1;
    if (!b || !b.timestamp) return 1;
    return moment(b.timestamp).toDate().getTime() - moment(a.timestamp).toDate().getTime();
  }) : completed;
  await CommonModel.doSetLocalData(CommonModel.KEYS.USER_DATA_TRANSACTIONS_HISTORY, completed);

  let transactionStoreState = merge({}, TransactionsStore.getState().data);
  transactionStoreState.totalCompleted = completed.length;
  transactionStoreState.completed = completed.slice(0, Math.min(completed.length, Math.max(transactionStoreState.actionRequired.length, 20)));
  TransactionsStore.dispatch(TransactionsActions.init(transactionStoreState));
  console.log('completed :', completed);
  return { completed };
};

const doAddMoreActionRequired = async (currentLength) => {
  currentLength = currentLength || 0;
  let allActionRequired = (await CommonModel.doGetLocalData(CommonModel.KEYS.USER_DATA_TRANSACTIONS_ACTION_REQUIRED)) || [];
  let transactionStoreState = merge({}, TransactionsStore.getState().data);
  transactionStoreState.actionRequired = allActionRequired.slice(0, Math.min(allActionRequired.length, currentLength + 20));
  TransactionsStore.dispatch(TransactionsActions.init(transactionStoreState));
};

const doGetAllTransfersOffers = async () => {
  let { actionRequired } = (await CommonModel.doGetLocalData(CommonModel.KEYS.USER_DATA_TRANSACTIONS_ACTION_REQUIRED)) || [];
  let transferOffers = [];
  for (let item of actionRequired) {
    if (item.type === ActionTypes.transfer) {
      transferOffers.push(item.transferOffer);
    }
  }
  return transferOffers;
};

const doAddMoreCompleted = async (currentLength) => {
  currentLength = currentLength || 0;
  let allCompleted = (await CommonModel.doGetLocalData(CommonModel.KEYS.USER_DATA_TRANSACTIONS_HISTORY)) || [];
  let transactionStoreState = merge({}, TransactionsStore.getState().data);
  transactionStoreState.completed = allCompleted.slice(0, Math.min(allCompleted.length, currentLength + 20));
  TransactionsStore.dispatch(TransactionsActions.init(transactionStoreState));
};

const doDecentralizedIssuance = async (touchFaceIdSession, token, encryptionKey) => {
  let result = await BitmarkService.doDecentralizedIssuance(touchFaceIdSession, userInformation.bitmarkAccountNumber, token, encryptionKey);
  return result;
};

const doDecentralizedTransfer = async (touchFaceIdSession, token, ) => {
  let result = await BitmarkService.doDecentralizedTransfer(touchFaceIdSession, userInformation.bitmarkAccountNumber, token);
  return result;
};

const doMarkRequestedNotification = async (result) => {
  let appInfo = await doGetAppInformation();
  appInfo = appInfo || {};

  if (result && result.alert && result.badge && result.sound &&
    (!appInfo.trackEvents || !appInfo.trackEvents.app_user_allow_notification)) {
    appInfo.trackEvents = appInfo.trackEvents || {};
    appInfo.trackEvents.app_user_allow_notification = true;
    await CommonModel.doSetLocalData(CommonModel.KEYS.APP_INFORMATION, appInfo);

    userInformation = userInformation || (await UserModel.doTryGetCurrentUser());
    await CommonModel.doTrackEvent({
      event_name: 'registry_user_allow_notification',
      account_number: userInformation ? userInformation.bitmarkAccountNumber : null,
    });
  }
}
const doRemoveTestRecoveryPhaseActionRequiredIfAny = async () => {
  let testWriteRecoveryPhaseActionRequired = helper.getTestWriteRecoveryPhaseActionRequired();
  if (testWriteRecoveryPhaseActionRequired) {
    await helper.removeTestWriteRecoveryPhaseActionRequired();
    await doGenerateTransactionActionRequiredData();
  }
};

const DataProcessor = {
  doOpenApp,
  doCreateAccount,
  doLogin,
  doLogout,
  doStartBackgroundProcess,
  doReloadUserData,
  doReloadLocalBitmarks,
  doReloadTrackingBitmark,

  doDeactiveApplication,
  doDownloadBitmark,
  doUpdateViewStatus,
  doTrackingBitmark,
  doStopTrackingBitmark,
  doGetProvenance,
  doReloadIFTTTInformation,
  doRevokeIftttToken,
  doIssueIftttData,
  doAcceptTransferBitmark,
  doAcceptAllTransfers,
  doCancelTransferBitmark,
  doRejectTransferBitmark,
  doIssueFile,
  doTransferBitmark,
  doMigrateWebAccount,
  doSignInOnWebApp,
  doDecentralizedIssuance,
  doDecentralizedTransfer,

  doGetLocalBitmarkInformation,
  doGetTrackingBitmarkInformation,
  doGetIftttInformation,

  doGetAllTransfersOffers,
  doAddMoreActionRequired,
  doAddMoreCompleted,

  doMarkRequestedNotification,
  doRemoveTestRecoveryPhaseActionRequiredIfAny,

  getApplicationVersion,
  getApplicationBuildNumber,
  getUserInformation,
  isAppLoadingData: () => isLoadingData,
  doAddMoreAssets,
};

export { DataProcessor };
