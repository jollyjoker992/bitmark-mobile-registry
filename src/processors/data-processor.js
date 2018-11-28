import DeviceInfo from 'react-native-device-info';
import moment from 'moment';
import { merge } from 'lodash';
import { Actions } from 'react-native-router-flux';

import {
  EventEmitterService,
  NotificationService,
  TransactionService,
  BitmarkService,
  AccountService,
} from "../services";
import { CommonModel, AccountModel, UserModel, BitmarkSDK, IftttModel, BitmarkModel, NotificationModel } from '../models';
import { FileUtil, runPromiseWithoutError, compareVersion } from '../utils';
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
let jwt;

let mapModalDisplayData = {};
let keyIndexModalDisplaying = 0;
const mapModalDisplayKeyIndex = {
  local_storage_migration: 1,
  what_new: 2,
};
let codePushUpdated = null;
let mountedRouter;


let isDisplayingModal = (keyIndex) => {
  return keyIndexModalDisplaying === keyIndex && !!mapModalDisplayData[keyIndex];
}

let checkDisplayModal = () => {
  if (keyIndexModalDisplaying > 0 && !mapModalDisplayData[keyIndexModalDisplaying]) {
    keyIndexModalDisplaying = 0;
  }
  let keyIndexArray = Object.keys(mapModalDisplayData).sort();
  for (let index = 0; index < keyIndexArray.length; index++) {
    let keyIndex = parseInt(keyIndexArray[index]);
    if (mapModalDisplayData[keyIndex] && (keyIndexModalDisplaying <= 0 || keyIndexModalDisplaying > keyIndex)) {
      console.log('run 1');
      if (keyIndex === mapModalDisplayKeyIndex.local_storage_migration && mountedRouter) {
        console.log('run 2');
        EventEmitterService.emit(EventEmitterService.events.APP_MIGRATION_FILE_LOCAL_STORAGE);
        keyIndexModalDisplaying = keyIndex;
        break;
      } else if (keyIndex === mapModalDisplayKeyIndex.what_new && mountedRouter) {
        Actions.whatNew();
        keyIndexModalDisplaying = keyIndex;
        break;
      }
    }
  }
};

let updateModal = (keyIndex, data) => {
  mapModalDisplayData[keyIndex] = data;
  checkDisplayModal();
};

// ================================================================================================================================================
const detectLocalAssetFilePath = async (assetId) => {
  let assetFolderPath = `${FileUtil.DocumentDirectory}/${userInformation.bitmarkAccountNumber}/assets/${assetId}`;
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
      PropertyStore.dispatch(PropertyActions.init(propertyStoreState));
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
    for (let asset of localAssets) {
      asset.filePath = await detectLocalAssetFilePath(asset.id);
    }

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
      let asset = localAssets.find(asset => asset.id === propertyStoreState.bitmark.asset_id);
      propertyStoreState.asset = asset;
      propertyStoreState.bitmark = asset ? asset.bitmarks.find(bitmark => bitmark.id === propertyStoreState.bitmark.id) : null;
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
      let localAssets = await CommonModel.doGetLocalData(CommonModel.KEYS.USER_DATA_LOCAL_BITMARKS);
      localAssets = recheckLocalAssets(localAssets, outgoingTransferOffers);
      await doCheckNewBitmarks(localAssets);
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

  let appInfo = await doGetAppInformation();
  appInfo = appInfo || {};
  appInfo.onScreenAt = appInfo.onScreenAt || moment().toDate().getTime();
  appInfo.offScreenAt = moment().toDate().getTime();
  await CommonModel.doSetLocalData(CommonModel.KEYS.APP_INFORMATION, appInfo);

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

  await CommonModel.doTrackEvent({
    event_name: 'registry_create_new_account',
    account_number: userInformation ? userInformation.bitmarkAccountNumber : null,
  });

  return userInformation;
};

const doLogin = async (touchFaceIdSession) => {
  userInformation = await AccountService.doGetCurrentAccount(touchFaceIdSession);
  let signatureData = await CommonModel.doCreateSignatureData(touchFaceIdSession);
  await NotificationModel.doTryRegisterAccount(userInformation.bitmarkAccountNumber, signatureData.timestamp, signatureData.signature);
  return userInformation;
};

const doLogout = async () => {
  if (userInformation.notificationUUID) {
    let signatureData = await CommonModel.doTryCreateSignatureData(global.i18n.t("DataProcessor_pleaseSignToAuthorizeYourTransactions"));
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

const doOpenApp = async (justCreatedBitmarkAccount) => {
  userInformation = await UserModel.doTryGetCurrentUser();

  let appInfo = await doGetAppInformation();
  appInfo = appInfo || {};

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

    let signatureData = await CommonModel.doCreateSignatureData(CommonModel.getFaceTouchSessionId());
    let result = await AccountModel.doRegisterJWT(userInformation.bitmarkAccountNumber, signatureData.timestamp, signatureData.signature);
    jwt = result.jwt_token;

    if (justCreatedBitmarkAccount) {
      await AccountModel.doMarkMigration(jwt);
      appInfo.didMigrationFileToLocalStorage = true;
      appInfo.displayedWhatNewInformation = DeviceInfo.getVersion();
      await CommonModel.doSetLocalData(CommonModel.KEYS.APP_INFORMATION, appInfo);
    } else if (!appInfo.didMigrationFileToLocalStorage) {
      let didMigrationFileToLocalStorage = await AccountModel.doCheckMigration(jwt);
      if (!didMigrationFileToLocalStorage && !isDisplayingModal(mapModalDisplayKeyIndex.local_storage_migration)) {
        updateModal(mapModalDisplayKeyIndex.local_storage_migration, true);
      }
      if (!appInfo.displayedWhatNewInformation || compareVersion(appInfo.displayedWhatNewInformation, DeviceInfo.getVersion(), 2) < 0) {
        updateModal(mapModalDisplayKeyIndex.what_new, true);
      }
    }

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
        typeTitle: global.i18n.t("DataProcessor_securityAlert"),
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
      propertyStoreState.bitmark = asset ? asset.bitmarks.find(bitmark => bitmark.id === propertyStoreState.bitmark.id) : null;
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
  let localAssets = (await CommonModel.doGetLocalData(CommonModel.KEYS.USER_DATA_LOCAL_BITMARKS)) || [];
  let asset = localAssets.find(asset => asset.id === bitmark.asset_id);

  // let assetFolderPath = `${FileUtil.DocumentDirectory}/${userInformation.bitmarkAccountNumber}/assets/${bitmark.asset_id}`;
  // await FileUtil.mkdir(assetFolderPath);
  // let downloadingFolderPath = `${assetFolderPath}/downloading`;
  // await FileUtil.mkdir(downloadingFolderPath);

  // await BitmarkSDK.downloadBitmark(touchFaceIdSession, bitmark.id, downloadingFolderPath);
  // let listDownloadFile = await FileUtil.readDir(downloadingFolderPath);
  // let filePathAfterDownloading = `${downloadingFolderPath}/${listDownloadFile[0]}`;

  // let downloadedFolderPath = `${assetFolderPath}/downloaded`;
  // await FileUtil.mkdir(downloadedFolderPath);
  // let downloadedFilePath = `${downloadedFolderPath}${filePathAfterDownloading.substring(filePathAfterDownloading.lastIndexOf('/'), filePathAfterDownloading.length)}`;
  // await FileUtil.moveFileSafe(filePathAfterDownloading, downloadedFilePath);
  // await FileUtil.removeSafe(downloadingFolderPath);
  // asset.filePath = `${downloadedFilePath}`;

  let assetFolderPath = `${FileUtil.DocumentDirectory}/${userInformation.bitmarkAccountNumber}/assets/${bitmark.asset_id}`;
  await FileUtil.mkdir(assetFolderPath);
  let downloadingFolderPath = `${assetFolderPath}/downloading`;
  await FileUtil.mkdir(downloadingFolderPath);
  let downloadingFilePath = `${assetFolderPath}/downloading/temp.encrypt`;

  let downloadResult = await BitmarkService.downloadFileToCourierServer(touchFaceIdSession, userInformation.bitmarkAccountNumber, asset.id, downloadingFilePath);
  console.log('downloadResult :', downloadResult);
  let decryptedFilePath = `${assetFolderPath}/downloading/${downloadResult.filename}`;
  await BitmarkSDK.decryptFile(touchFaceIdSession, downloadingFilePath, downloadResult, downloadResult.sender, decryptedFilePath);

  let downloadedFolderPath = `${assetFolderPath}/downloaded`;
  await FileUtil.mkdir(downloadedFolderPath);
  let downloadedFilePath = `${downloadedFolderPath}/${downloadResult.filename}`;
  await FileUtil.moveFileSafe(decryptedFilePath, downloadedFilePath);
  // await FileUtil.moveFileSafe(downloadingFilePath, downloadedFilePath);

  await FileUtil.removeSafe(downloadingFolderPath);
  asset.filePath = `${downloadedFilePath}`;
  await doCheckNewBitmarks(localAssets);
  return asset.filePath;
};

const doUpdateViewStatus = async (assetId, bitmarkId) => {
  if (assetId && bitmarkId) {
    let localAssets = (await CommonModel.doGetLocalData(CommonModel.KEYS.USER_DATA_LOCAL_BITMARKS)) || [];
    let asset = (localAssets || []).find(la => la.id === assetId);
    if (asset && !asset.isViewed) {
      let assetViewed = true;
      asset.bitmarks.forEach(bitmark => {
        if (bitmarkId === bitmark.id) {
          bitmark.isViewed = true;
        }
        if (!bitmark.isViewed && assetViewed) {
          assetViewed = false;
        }
      });
      asset.isViewed = assetViewed;
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
      if (propertyStoreState.bitmark && propertyStoreState.bitmark.id && propertyStoreState.bitmark.asset_id === assetId) {
        propertyStoreState.asset = asset;
        propertyStoreState.bitmark = asset ? asset.bitmarks.find(bitmark => bitmark.id === propertyStoreState.bitmark.id) : null;
        propertyStoreState.isTracking = !!(await DataProcessor.doGetTrackingBitmarkInformation(propertyStoreState.bitmark.id));
        PropertyStore.dispatch(PropertyActions.init(propertyStoreState));
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
          PropertyStore.dispatch(PropertyActions.init(propertyStoreState));
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
  await BitmarkService.doIssueFile(touchFaceIdSession, userInformation.bitmarkAccountNumber, filePath, iftttBitmarkFile.assetInfo.propertyName, iftttBitmarkFile.assetInfo.metadata, 1);

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
  let result = await BitmarkService.doIssueFile(touchFaceIdSession, userInformation.bitmarkAccountNumber, filePath, assetName, metadataList, quantity, isPublicAsset);

  let appInfo = await doGetAppInformation();
  appInfo = appInfo || {};
  if (appInfo && (!appInfo.lastTimeIssued ||
    (appInfo.lastTimeIssued && (appInfo.lastTimeIssued - moment().toDate().getTime()) > 7 * 24 * 60 * 60 * 1000))) {
    await CommonModel.doTrackEvent({
      event_name: 'registry_weekly_active_user',
      account_number: userInformation ? userInformation.bitmarkAccountNumber : null,
    });
    appInfo.lastTimeIssued = moment().toDate().getTime();
    await CommonModel.doSetLocalData(CommonModel.KEYS.APP_INFORMATION, appInfo);
  }

  await runGetLocalBitmarksInBackground();
  return result;
};

const doTransferBitmark = async (touchFaceIdSession, bitmarkId, receiver) => {
  let { asset } = await doGetLocalBitmarkInformation(bitmarkId);
  console.log('asset :', asset.filePath);
  if (asset && asset.filePath) {
    let filename = asset.filePath.substring(asset.filePath.lastIndexOf('/') + 1, asset.filePath.length);
    await FileUtil.mkdir(`${FileUtil.DocumentDirectory}/${userInformation.bitmarkAccountNumber}/assets/${asset.id}/encrypted`);
    let encryptedFilePath = `${FileUtil.DocumentDirectory}/${userInformation.bitmarkAccountNumber}/assets/${asset.id}/encrypted/${filename}`;
    let sessionData = await BitmarkSDK.encryptFile(touchFaceIdSession, asset.filePath, receiver, encryptedFilePath);
    let uploadResult = await BitmarkService.uploadFileToCourierServer(touchFaceIdSession, userInformation.bitmarkAccountNumber, asset.id, receiver, encryptedFilePath, sessionData);

    // let uploadResult = await BitmarkService.uploadFileToCourierServer(touchFaceIdSession, userInformation.bitmarkAccountNumber, asset.id, receiver, asset.filePath, {
    //   data_key_alg: 'test',
    //   enc_data_key: 'test',
    // });
    console.log('uploadResult :', uploadResult);
  }

  let result = await BitmarkService.doTransferBitmark(touchFaceIdSession, bitmarkId, receiver);
  await doReloadTransferOffers();
  await runGetLocalBitmarksInBackground();

  let localAssets = await CommonModel.doGetLocalData(CommonModel.KEYS.USER_DATA_LOCAL_BITMARKS);
  let currentAsset = localAssets.find(la => la.id === asset.id);
  console.log('currentAsset :', currentAsset);
  if (!currentAsset) {
    await FileUtil.removeSafe(`${FileUtil.DocumentDirectory}/${userInformation.bitmarkAccountNumber}/assets/${asset.id}`);
  }
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
    asset = localAssets.find(la => la.id === assetId);
    if (bitmarkId) {
      bitmark = (asset ? asset.bitmarks : []).find(localBitmark => localBitmark.id === bitmarkId);
    }
  } else if (bitmarkId) {
    asset = localAssets.find(la => {
      bitmark = la.bitmarks.find(localBitmark => localBitmark.id === bitmarkId);
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
  let signatureData = await CommonModel.doCreateSignatureData(touchFaceIdSession);
  let info = await BitmarkModel.doGetInfoInfoOfDecentralizedTransfer(userInformation.bitmarkAccountNumber, signatureData.timestamp, signatureData.signature, token);
  let bitmarkId = info.bitmark_id;
  let receiver = info.receiver;

  let { asset } = await doGetLocalBitmarkInformation(bitmarkId);
  let result = await BitmarkService.doDecentralizedTransfer(touchFaceIdSession, userInformation.bitmarkAccountNumber, token, bitmarkId, receiver);

  let localAssets = await CommonModel.doGetLocalData(CommonModel.KEYS.USER_DATA_LOCAL_BITMARKS);
  let currentAsset = localAssets.find(la => la.id === asset.id);
  if (!currentAsset) {
    // TODO
    await FileUtil.removeSafe(`${FileUtil.DocumentDirectory}/${userInformation.bitmarkAccountNumber}/assets/${asset.id}`);
  }
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
  }
}
const doRemoveTestRecoveryPhaseActionRequiredIfAny = async () => {
  let testWriteRecoveryPhaseActionRequired = helper.getTestWriteRecoveryPhaseActionRequired();
  if (testWriteRecoveryPhaseActionRequired) {
    await helper.removeTestWriteRecoveryPhaseActionRequired();
    await doGenerateTransactionActionRequiredData();
  }
};

const doMetricOnScreen = async (isActive) => {
  let appInfo = await doGetAppInformation();
  appInfo = appInfo || {};
  let onScreenAt = appInfo.onScreenAt;
  let offScreenAt = appInfo.offScreenAt;
  if (isActive && onScreenAt && offScreenAt) {
    if (offScreenAt && offScreenAt > onScreenAt) {
      let userInfo = userInformation || await UserModel.doTryGetCurrentUser() || {};

      let totalOnScreenAtPreTime = Math.floor((offScreenAt - onScreenAt) / (1000 * 60));
      await CommonModel.doTrackEvent({
        event_name: 'registry_screen_time',
        account_number: userInfo ? userInfo.bitmarkAccountNumber : null,
      }, {
          hit: totalOnScreenAtPreTime
        });
    }
    appInfo.onScreenAt = moment().toDate().getTime();
  } else {
    appInfo.offScreenAt = moment().toDate().getTime();
  }
  await CommonModel.doSetLocalData(CommonModel.KEYS.APP_INFORMATION, appInfo);
};

let markDoneLocalStorageMigration = () => {
  updateModal(mapModalDisplayKeyIndex.local_storage_migration);
};

const setMountedRouter = () => {
  mountedRouter = true;
  checkDisplayModal();
};

let setCodePushUpdated = (updated) => {
  codePushUpdated = !!updated;
};

let doCheckHaveCodePushUpdate = () => {
  return new Promise((resolve) => {
    let checkHaveCodePushUpdate = () => {
      if (codePushUpdated === true || codePushUpdated === false) {
        return resolve(codePushUpdated);
      }
      setTimeout(checkHaveCodePushUpdate, 1000);
    };
    checkHaveCodePushUpdate();
  });
};

const doMigrateFilesToLocalStorage = async () => {
  let touchFaceIdSession = CommonModel.getFaceTouchSessionId();
  await runGetLocalBitmarksInBackground();

  let localAssets = (await CommonModel.doGetLocalData(CommonModel.KEYS.USER_DATA_LOCAL_BITMARKS)) || [];
  let total = 0;
  for (let asset of localAssets) {
    let assetFolderPath = `${FileUtil.DocumentDirectory}/${userInformation.bitmarkAccountNumber}/assets/${asset.id}`;
    let existAssetFolder = await runPromiseWithoutError(FileUtil.exists(assetFolderPath));
    let needDownload = false;
    if (!existAssetFolder || existAssetFolder.error) {
      needDownload = true;
    } else {
      let list = await FileUtil.readDir(assetFolderPath);
      if (list.length === 0) {
        needDownload = true;
      } else {
        needDownload =
          (list.findIndex(filename => filename.startsWith('downloading')) >= 0) ||
          (list.findIndex(filename => filename.startsWith('downloaded')) < 0);
      }
    }

    if (needDownload) {
      await FileUtil.mkdir(assetFolderPath);
      let downloadingFolderPath = `${assetFolderPath}/downloading`;
      await FileUtil.mkdir(downloadingFolderPath);
      let bitmark = asset.bitmarks.find(bitmark => bitmark.status === 'confirmed');
      if (bitmark) {
        await BitmarkSDK.downloadBitmark(touchFaceIdSession, bitmark.id, downloadingFolderPath);
        let listDownloadFile = await FileUtil.readDir(downloadingFolderPath);
        let filePathAfterDownloading = `${downloadingFolderPath}/${listDownloadFile[0]}`;

        let downloadedFolderPath = `${assetFolderPath}/downloaded`;
        await FileUtil.mkdir(downloadedFolderPath);
        let downloadedFilePath = `${downloadedFolderPath}${filePathAfterDownloading.substring(filePathAfterDownloading.lastIndexOf('/'), filePathAfterDownloading.length)}`;
        await FileUtil.moveFileSafe(filePathAfterDownloading, downloadedFilePath);
        await FileUtil.removeSafe(downloadingFolderPath);

        asset.filePath = `${downloadedFilePath}`;
      }
    } else {
      let list = await FileUtil.readDir(`${assetFolderPath}/downloaded`);
      asset.filePath = `${assetFolderPath}/downloaded/${list[0]}`;
    }
    EventEmitterService.emit(EventEmitterService.events.APP_MIGRATION_FILE_LOCAL_STORAGE_PERCENT, Math.floor(total * 100 / localAssets.length));
    total++;
  }
  await doCheckNewBitmarks(localAssets);
  EventEmitterService.emit(EventEmitterService.events.APP_MIGRATION_FILE_LOCAL_STORAGE_PERCENT, 100);

  await AccountModel.doMarkMigration(jwt);
  let appInfo = await doGetAppInformation();
  appInfo.didMigrationFileToLocalStorage = true;
  await CommonModel.doSetLocalData(CommonModel.KEYS.APP_INFORMATION, appInfo);
};

let doMarkDisplayedWhatNewInformation = async () => {
  let appInfo = await doGetAppInformation();
  appInfo = appInfo || {};
  appInfo.displayedWhatNewInformation = DeviceInfo.getVersion();
  updateModal(mapModalDisplayKeyIndex.what_new);
  keyIndexModalDisplaying = 0;
  await CommonModel.doSetLocalData(CommonModel.KEYS.APP_INFORMATION, appInfo);
};
const doDisplayedWhatNewInformation = async () => {
  updateModal(mapModalDisplayKeyIndex.what_new, true);
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
  doMetricOnScreen,

  doMigrateFilesToLocalStorage,
  markDoneLocalStorageMigration,
  setMountedRouter,
  setCodePushUpdated,
  doCheckHaveCodePushUpdate,
  doMarkDisplayedWhatNewInformation,
  doDisplayedWhatNewInformation
};

export { DataProcessor };
