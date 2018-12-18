import DeviceInfo from 'react-native-device-info';
import moment from 'moment';
import { merge } from 'lodash';
import { Actions } from 'react-native-router-flux';
import { Sentry } from 'react-native-sentry';

import {
  EventEmitterService,
  NotificationService,
  TransactionService,
  BitmarkService,
  AccountService,
  LocalFileService,
} from './services';
import {
  CommonModel, AccountModel, UserModel, BitmarkSDK,
  IftttModel, BitmarkModel, NotificationModel
} from './models';

import {
  FileUtil, runPromiseWithoutError,
  compareVersion,
} from 'src/utils';
import {
  AssetsStore, AssetsActions,
  BottomTabStore, BottomTabActions,
  AssetStore, AssetActions,
  PropertyStore, PropertyActions,
  AccountStore, AccountActions,
  TransactionsStore, TransactionsActions,
} from 'src/views/stores';
import { config, constant } from 'src/configs';
import { CacheData } from './caches';

let mapModalDisplayData = {};
const mapModalDisplayKeyIndex = {
  what_new: 1,
  claim_asset: 2,
};

// let isDisplayingModal = (keyIndex) => {
//   return CacheData.keyIndexModalDisplaying === keyIndex && !!mapModalDisplayData[keyIndex];
// };

let checkDisplayModal = () => {
  if (CacheData.keyIndexModalDisplaying > 0 && !mapModalDisplayData[CacheData.keyIndexModalDisplaying]) {
    CacheData.keyIndexModalDisplaying = 0;
  }
  let keyIndexArray = Object.keys(mapModalDisplayData).sort();
  for (let index = 0; index < keyIndexArray.length; index++) {
    let keyIndex = parseInt(keyIndexArray[index]);
    if (mapModalDisplayData[keyIndex] && (CacheData.keyIndexModalDisplaying <= 0 || CacheData.keyIndexModalDisplaying > keyIndex)) {
      if (keyIndex === mapModalDisplayKeyIndex.what_new && CacheData.mountedRouter) {
        Actions.whatNew();
        CacheData.keyIndexModalDisplaying = keyIndex;
        break;
      } else if (keyIndex === mapModalDisplayKeyIndex.claim_asset && CacheData.mountedRouter) {
        Actions.musicSentClaimRequest(mapModalDisplayData[keyIndex]);
        CacheData.keyIndexModalDisplaying = keyIndex;
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
  let assetFolderPath = `${FileUtil.getLocalAssetsFolderPath(CacheData.userInformation.bitmarkAccountNumber)}/${assetId}`;
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
  let assetFolderPath = `${FileUtil.getLocalAssetsFolderPath(CacheData.userInformation.bitmarkAccountNumber)}/${assetId}`;
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

const doCheckClaimRequests = async (claimRequests, isLoadingAllUserData) => {
  if (claimRequests) {
    let localAssets = (await CommonModel.doGetLocalData(CommonModel.KEYS.USER_DATA_LOCAL_BITMARKS)) || [];
    for (let claimRequest of claimRequests) {
      claimRequest.asset = localAssets.find(asset => asset.id === claimRequest.asset_id);
    }
    await CommonModel.doSetLocalData(CommonModel.KEYS.USER_DATA_CLAIM_REQUEST, claimRequests);
    if (!isLoadingAllUserData) {
      await doGenerateTransactionActionRequiredData(claimRequests);
    }
  }
}

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
  console.log('doCheckNewBitmarks :', localAssets);
  if (localAssets) {
    for (let asset of localAssets) {
      asset.filePath = await detectLocalAssetFilePath(asset.id);
      if (asset.metadata && asset.metadata.type === constant.asset.type.music) {
        asset.thumbnailPath = await detectMusicThumbnailPath(asset.id);
        console.log('detectMusicThumbnailPath :', asset.thumbnailPath);
        let resultGetLimitedEdition = await BitmarkModel.doGetLimitedEdition(CacheData.userInformation.bitmarkAccountNumber, asset.id);
        console.log('doGetLimitedEdition :', resultGetLimitedEdition);
        if (resultGetLimitedEdition) {
          asset.limitedEdition = resultGetLimitedEdition.limited;
        }
        let bitmarks = asset.bitmarks;
        let totalIssuedBitmarks = await BitmarkModel.doGetTotalBitmarksOfAssetOfIssuer(CacheData.userInformation.bitmarkAccountNumber, asset.id);
        console.log('doGetTotalBitmarksOfAssetOfIssuer :', totalIssuedBitmarks);
        let bitmarkIds = await BitmarkModel.doGetAwaitTransfers(CacheData.jwt, asset.id);
        console.log('doGetAwaitTransfers :', bitmarkIds);

        for (let bid of bitmarkIds) {
          let index = bitmarks.findIndex(bitmark => bitmark.id === bid);
          if (index >= 0) {
            bitmarks.splice(index, 1);
          }
        }
        let issuedBitmarks = [];
        for (let ib of totalIssuedBitmarks) {
          if (ib.owner === CacheData.userInformation.bitmarkAccountNumber) {
            let index = bitmarkIds.findIndex(bid => bid === ib.id);
            if (index >= 0) {
              issuedBitmarks.push(ib);
            }
          } else {
            issuedBitmarks.push(ib);
          }
        }
        asset.bitmarks = bitmarks;
        asset.issuedBitmarks = issuedBitmarks;
      }
      asset.registrantName = CacheData.identities[asset.registrant];
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
  assetsStoreState.appLoadingData = CacheData.isLoadingData;
  AssetsStore.dispatch(AssetsActions.init(assetsStoreState));

  let accountStoreState = merge({}, AccountStore.getState().data);
  accountStoreState.appLoadingData = CacheData.isLoadingData;
  AccountStore.dispatch(AccountActions.init(accountStoreState));

  let transactionStoreState = merge({}, TransactionsStore.getState().data);
  transactionStoreState.appLoadingData = CacheData.isLoadingData;
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
    TransactionService.doGetAllTransferOffers(CacheData.userInformation.bitmarkAccountNumber).then(transferOffers => {
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


let queueGetClaimRequests = [];
const runGetClaimRequestInBackground = () => {
  return new Promise((resolve) => {
    queueGetClaimRequests.push(resolve);
    if (queueGetClaimRequests.length > 1) {
      return;
    }
    BitmarkModel.doGetClaimRequest(CacheData.jwt).then(claimRequests => {
      console.log('runOnBackground  runGetClaimRequestInBackground success');
      queueGetClaimRequests.forEach(queueResolve => queueResolve(claimRequests));
      queueGetClaimRequests = [];
    }).catch(error => {
      queueGetClaimRequests.forEach(queueResolve => queueResolve());
      queueGetClaimRequests = [];
      console.log('runOnBackground  runGetClaimRequestInBackground error :', error);
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
    BitmarkService.doGetTrackingBitmarks(CacheData.userInformation.bitmarkAccountNumber).then(trackingBitmarks => {
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
    IftttModel.doGetIFtttInformation(CacheData.userInformation.bitmarkAccountNumber).then(iftttInformation => {
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
        let data = await TransactionService.doGet100Transactions(CacheData.userInformation.bitmarkAccountNumber, oldTransactions, lastOffset);
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
        let data = await BitmarkService.doGet100Bitmarks(CacheData.userInformation.bitmarkAccountNumber, oldLocalAssets, lastOffset);
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
  let identities = await runPromiseWithoutError(AccountModel.doGetIdentities());
  if (identities && !identities.error) {
    CacheData.identities = identities;
  }
  if (CacheData.userInformation === null || JSON.stringify(userInfo) !== JSON.stringify(CacheData.userInformation)) {
    CacheData.userInformation = userInfo;
    let accountStoreState = merge({}, AccountStore.getState().data);
    accountStoreState.userInformation = CacheData.userInformation;
    AccountStore.dispatch(AccountActions.init(accountStoreState));
  }

  let appInfo = await doGetAppInformation();
  appInfo = appInfo || {};
  appInfo.onScreenAt = appInfo.onScreenAt || moment().toDate().getTime();
  appInfo.offScreenAt = moment().toDate().getTime();
  await CommonModel.doSetLocalData(CommonModel.KEYS.APP_INFORMATION, appInfo);

  if (CacheData.userInformation && CacheData.userInformation.bitmarkAccountNumber) {
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

    let doParallel = () => {
      return new Promise((resolve) => {
        Promise.all([
          runGetLocalBitmarksInBackground(parallelResults[1].outgoingTransferOffers),
          runGetTransactionsInBackground()
        ]).then(resolve);
      });
    };
    await doParallel();

    let claimRequests = await runGetClaimRequestInBackground();
    await doCheckClaimRequests(claimRequests, true);
    await doGenerateTransactionActionRequiredData();
  }
  console.log('runOnBackground done ====================================');
};

const doReloadUserData = async () => {
  CacheData.isLoadingData = true;
  setAppLoadingStatus();

  await runOnBackground();

  CacheData.isLoadingData = false;
  setAppLoadingStatus();
};
const doReloadTrackingBitmark = async () => {
  let trackingBitmarks = await runGetTrackingBitmarksInBackground();
  await doCheckNewTrackingBitmarks(trackingBitmarks);
  return trackingBitmarks;
};

const doReloadClaimAssetRequest = async () => {
  let claimRequests = await runGetClaimRequestInBackground();
  await doCheckClaimRequests(claimRequests);
  return claimRequests;
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
    if (!CacheData.userInformation || !CacheData.userInformation.bitmarkAccountNumber) {
      CacheData.userInformation = await UserModel.doGetCurrentUser();
    }
    if (notificationUUID && CacheData.userInformation.notificationUUID !== notificationUUID) {
      NotificationService.doRegisterNotificationInfo(CacheData.userInformation.bitmarkAccountNumber, notificationUUID).then(() => {
        CacheData.userInformation.notificationUUID = notificationUUID;
        return UserModel.doUpdateUserInfo(CacheData.userInformation);
      }).catch(error => {
        console.log('DataProcessor doRegisterNotificationInfo error:', error);
      });
    }
  };
  const onReceivedNotification = async (notificationData) => {
    if (!notificationData.foreground) {
      if (!CacheData.userInformation || !CacheData.userInformation.bitmarkAccountNumber) {
        CacheData.userInformation = await UserModel.doGetCurrentUser();
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
  if (!justCreatedBitmarkAccount && CacheData.userInformation && CacheData.userInformation.bitmarkAccountNumber) {
    let result = await NotificationService.doCheckNotificationPermission();
    await doMarkRequestedNotification(result);
  }
  return CacheData.userInformation;
};

const doCreateAccount = async () => {
  let userInformation = await AccountService.doGetCurrentAccount();
  let signatureData = await CommonModel.doCreateSignatureData();
  await NotificationModel.doTryRegisterAccount(userInformation.bitmarkAccountNumber, signatureData.timestamp, signatureData.signature);
  let signatures = await BitmarkSDK.signHexData([userInformation.encryptionPublicKey]);
  await AccountModel.doRegisterEncryptionPublicKey(userInformation.bitmarkAccountNumber, userInformation.encryptionPublicKey, signatures[0]);
  await CommonModel.doTrackEvent({
    event_name: 'registry_create_new_account',
    account_number: userInformation ? userInformation.bitmarkAccountNumber : null,
  });

  return userInformation;
};

const doLogin = async () => {
  let userInformation = await AccountService.doGetCurrentAccount();
  let signatureData = await CommonModel.doCreateSignatureData();
  await NotificationModel.doTryRegisterAccount(userInformation.bitmarkAccountNumber, signatureData.timestamp, signatureData.signature);
  let signatures = await BitmarkSDK.signHexData([userInformation.encryptionPublicKey]);
  await AccountModel.doRegisterEncryptionPublicKey(userInformation.bitmarkAccountNumber, userInformation.encryptionPublicKey, signatures[0]);
  return userInformation;
};

const doLogout = async () => {
  if (CacheData.userInformation.notificationUUID) {
    let signatureData = await CommonModel.doCreateSignatureData();
    await NotificationService.doTryDeregisterNotificationInfo(CacheData.userInformation.bitmarkAccountNumber, CacheData.userInformation.notificationUUID, signatureData);
  }
  await AccountModel.doLogout();
  await UserModel.doRemoveUserInfo();
  CacheData.userInformation = {};
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
  CacheData.userInformation = await UserModel.doTryGetCurrentUser();
  console.log('CacheData.userInformation :', CacheData.userInformation);
  await LocalFileService.setShareLocalStoragePath();

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
      account_number: CacheData.userInformation ? CacheData.userInformation.bitmarkAccountNumber : null,
    });
  }

  if (CacheData.userInformation && CacheData.userInformation.bitmarkAccountNumber) {
    // set the user context
    if (!__DEV__) {
      Sentry.setUserContext({ accountNumber: CacheData.userInformation.bitmarkAccountNumber, });
    }
    configNotification();
    await checkAppNeedResetLocalData(appInfo);
    await LocalFileService.moveFilesFromLocalStorageToSharedStorage();

    let signatureData = await CommonModel.doCreateSignatureData();
    let result = await AccountModel.doRegisterJWT(CacheData.userInformation.bitmarkAccountNumber, signatureData.timestamp, signatureData.signature);
    CacheData.jwt = result.jwt_token;

    if (justCreatedBitmarkAccount) {
      appInfo.displayedWhatNewInformation = DeviceInfo.getVersion();
      await CommonModel.doSetLocalData(CommonModel.KEYS.APP_INFORMATION, appInfo);
    } else {
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
    let testRecoveryPhaseActionRequired = await CommonModel.doGetLocalData(`${CommonModel.KEYS.TEST_RECOVERY_PHASE_ACTION_REQUIRED}-${CacheData.userInformation.bitmarkAccountNumber}`);
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
      userInformation: CacheData.userInformation,
      iftttInformation: await doGetIftttInformation(),
    }));

    // ============================
  }

  setAppLoadingStatus();
  return CacheData.userInformation;
};

const doDownloadBitmark = async (bitmark) => {
  let localAssets = (await CommonModel.doGetLocalData(CommonModel.KEYS.USER_DATA_LOCAL_BITMARKS)) || [];
  let asset = localAssets.find(asset => asset.id === bitmark.asset_id);

  let assetFolderPath = `${FileUtil.getLocalAssetsFolderPath(CacheData.userInformation.bitmarkAccountNumber)}/${bitmark.asset_id}`;
  await FileUtil.mkdir(assetFolderPath);
  let downloadingFolderPath = `${assetFolderPath}/downloading`;
  await FileUtil.mkdir(downloadingFolderPath);
  let downloadingFilePath = `${assetFolderPath}/downloading/temp.encrypt`;

  let downloadResult = await BitmarkService.downloadFileToCourierServer(CacheData.userInformation.bitmarkAccountNumber, asset.id, downloadingFilePath);
  console.log('downloadResult :', downloadResult);
  let decryptedFilePath = `${assetFolderPath}/downloading/${downloadResult.filename}`;
  let encryptionPublicKey = await AccountModel.doGetEncryptionPublicKey(downloadResult.sender);
  await BitmarkSDK.decryptFile(downloadingFilePath, downloadResult, encryptionPublicKey, decryptedFilePath);

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

const doTrackingBitmark = async (asset, bitmark) => {
  let signatureData = await CommonModel.doCreateSignatureData();
  await BitmarkModel.doAddTrackingBitmark(CacheData.userInformation.bitmarkAccountNumber, signatureData.timestamp, signatureData.signature,
    bitmark.id, bitmark.head_id, bitmark.status);
  let trackingBitmarks = await runGetTrackingBitmarksInBackground();
  await doCheckNewTrackingBitmarks(trackingBitmarks);
  return true;
};
const doStopTrackingBitmark = async (bitmark) => {
  let signatureData = await CommonModel.doCreateSignatureData();
  await BitmarkModel.doStopTrackingBitmark(CacheData.userInformation.bitmarkAccountNumber, signatureData.timestamp, signatureData.signature, bitmark.id);
  let trackingBitmarks = await runGetTrackingBitmarksInBackground();
  await doCheckNewTrackingBitmarks(trackingBitmarks);
  return true;
};

const doReloadIFTTTInformation = async () => {
  let iftttInformation = await runGetIFTTTInformationInBackground();
  await doCheckNewIftttInformation(iftttInformation);
  return iftttInformation;
};

const doRevokeIftttToken = async () => {
  let signatureData = await CommonModel.doCreateSignatureData();
  let iftttInformation = await IftttModel.doRevokeIftttToken(CacheData.userInformation.bitmarkAccountNumber, signatureData.timestamp, signatureData.signature);
  await doCheckNewIftttInformation(iftttInformation);
  return iftttInformation;
};
const doIssueIftttData = async (iftttBitmarkFile) => {
  let folderPath = FileUtil.CacheDirectory + '/Bitmark-IFTTT';
  await FileUtil.mkdir(folderPath);
  let filename = iftttBitmarkFile.assetInfo.filePath.substring(iftttBitmarkFile.assetInfo.filePath.lastIndexOf("/") + 1, iftttBitmarkFile.assetInfo.filePath.length);
  let filePath = folderPath + '/' + filename;
  let signatureData = await CommonModel.doCreateSignatureData();
  let downloadResult = await IftttModel.downloadBitmarkFile(CacheData.userInformation.bitmarkAccountNumber, signatureData.timestamp, signatureData.signature, iftttBitmarkFile.id, filePath);
  if (downloadResult.statusCode >= 400) {
    throw new Error('Download file error!');
  }
  await BitmarkService.doIssueFile(CacheData.userInformation.bitmarkAccountNumber, filePath, iftttBitmarkFile.assetInfo.propertyName, iftttBitmarkFile.assetInfo.metadata, 1);

  let iftttInformation = await IftttModel.doRemoveBitmarkFile(CacheData.userInformation.bitmarkAccountNumber, signatureData.timestamp, signatureData.signature, iftttBitmarkFile.id);
  await doCheckNewIftttInformation(iftttInformation);
  return iftttInformation;
};

const doAcceptTransferBitmark = async (transferOffer) => {
  await TransactionService.doAcceptTransferBitmark(transferOffer);
  return await doReloadTransferOffers();
};

const doAcceptAllTransfers = async (transferOffers) => {
  for (let transferOffer of transferOffers) {
    await TransactionService.doAcceptTransferBitmark(transferOffer);
  }
  return await doReloadTransferOffers();
};

const doCancelTransferBitmark = async (transferOfferId) => {
  await TransactionService.doCancelTransferBitmark(transferOfferId);
  let result = await doReloadTransferOffers();
  let oldTransactions = await CommonModel.doGetLocalData(CommonModel.KEYS.USER_DATA_TRANSACTIONS);
  await doCheckNewTransactions(oldTransactions);
  await runGetLocalBitmarksInBackground();
  return result;
};

const doRejectTransferBitmark = async (transferOffer, ) => {
  await TransactionService.doRejectTransferBitmark(transferOffer);
  return await doReloadTransferOffers();
};

const doIssueFile = async (filePath, assetName, metadataList, quantity) => {
  let result = await BitmarkService.doIssueFile(CacheData.userInformation.bitmarkAccountNumber, filePath, assetName, metadataList, quantity);

  let appInfo = await doGetAppInformation();
  appInfo = appInfo || {};
  if (appInfo && (!appInfo.lastTimeIssued ||
    (appInfo.lastTimeIssued && (appInfo.lastTimeIssued - moment().toDate().getTime()) > 7 * 24 * 60 * 60 * 1000))) {
    await CommonModel.doTrackEvent({
      event_name: 'registry_weekly_active_user',
      account_number: CacheData.userInformation ? CacheData.userInformation.bitmarkAccountNumber : null,
    });
    appInfo.lastTimeIssued = moment().toDate().getTime();
    await CommonModel.doSetLocalData(CommonModel.KEYS.APP_INFORMATION, appInfo);
  }

  await runGetLocalBitmarksInBackground();
  return result;
};

const doIssueMusic = async (filePath, assetName, metadataList, thumbnailPath, limitedEdition) => {
  console.log('run1');
  let result = await BitmarkService.doIssueMusic(CacheData.userInformation.bitmarkAccountNumber, filePath, assetName, metadataList, thumbnailPath, limitedEdition);
  console.log('run2');

  let appInfo = await doGetAppInformation();
  appInfo = appInfo || {};
  if (appInfo && (!appInfo.lastTimeIssued ||
    (appInfo.lastTimeIssued && (appInfo.lastTimeIssued - moment().toDate().getTime()) > 7 * 24 * 60 * 60 * 1000))) {
    await CommonModel.doTrackEvent({
      event_name: 'registry_weekly_active_user',
      account_number: CacheData.userInformation ? CacheData.userInformation.bitmarkAccountNumber : null,
    });
    appInfo.lastTimeIssued = moment().toDate().getTime();
    await CommonModel.doSetLocalData(CommonModel.KEYS.APP_INFORMATION, appInfo);
  }
  console.log('run3');

  await runGetLocalBitmarksInBackground();
  return result;
};


const doTransferBitmark = async (bitmarkId, receiver, isDeleting) => {
  console.log('doTransferBitmark :', bitmarkId, receiver, isDeleting);
  let { asset } = await doGetLocalBitmarkInformation(bitmarkId);
  if (asset && asset.filePath) {
    let filename = asset.filePath.substring(asset.filePath.lastIndexOf('/') + 1, asset.filePath.length);
    await FileUtil.mkdir(`${FileUtil.getLocalAssetsFolderPath(CacheData.userInformation.bitmarkAccountNumber)}/${asset.id}/encrypted`);
    let encryptedFilePath = `${FileUtil.getLocalAssetsFolderPath(CacheData.userInformation.bitmarkAccountNumber)}/${asset.id}/encrypted/${filename}`;
    let encryptionPublicKey = await AccountModel.doGetEncryptionPublicKey(receiver);
    let sessionData = await BitmarkSDK.encryptFile(asset.filePath, encryptionPublicKey, encryptedFilePath);
    let uploadResult = await BitmarkService.uploadFileToCourierServer(CacheData.userInformation.bitmarkAccountNumber, asset.id, receiver, encryptedFilePath, sessionData);
    console.log('uploadResult :', uploadResult);
  }

  let result = await BitmarkService.doTransferBitmark(bitmarkId, receiver);
  await doReloadTransferOffers();
  await runGetLocalBitmarksInBackground();

  let localAssets = await CommonModel.doGetLocalData(CommonModel.KEYS.USER_DATA_LOCAL_BITMARKS);
  let currentAsset = localAssets.find(la => la.id === asset.id);
  if (!currentAsset) {
    await FileUtil.removeSafe(`${FileUtil.getLocalAssetsFolderPath(CacheData.userInformation.bitmarkAccountNumber)}/${asset.id}`);
  }
  return result;
};

const doMigrateWebAccount = async (token) => {
  let result = await BitmarkService.doConfirmWebAccount(CacheData.userInformation.bitmarkAccountNumber, token);
  await runGetLocalBitmarksInBackground();
  return result;
};

const doSignInOnWebApp = async (token) => {
  return await BitmarkService.doConfirmWebAccount(CacheData.userInformation.bitmarkAccountNumber, token);
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
  claim_request: 'claim_request',
  ifttt: 'ifttt',
  test_write_down_recovery_phase: 'test_write_down_recovery_phase',
};
const doGenerateTransactionActionRequiredData = async (claimRequests) => {
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

  claimRequests = claimRequests || (await CommonModel.doGetLocalData(CommonModel.KEYS.USER_DATA_CLAIM_REQUEST)) || [];
  claimRequests = claimRequests.sort((a, b) => moment(a.created_at).toDate().getTime() - moment(b.created_at).toDate().getTime());
  console.log('claimRequests :', claimRequests);
  if (claimRequests && claimRequests.length > 0) {
    (claimRequests || []).forEach((claimRequest, index) => {
      claimRequest.index = (claimRequest.issuedBitmarks ? claimRequest.issuedBitmarks.length : 0) + index + 1,
        actionRequired.push({
          key: actionRequired.length,
          claimRequest: claimRequest,
          type: ActionTypes.claim_request,
          typeTitle: global.i18n.t("DataProcessor_signToTransferBitmark"),
          // typeTitle: 'SIGN TO TRANSFER BITMARK', //TODO
          timestamp: moment(claimRequest.created_at),
        });
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
  let testRecoveryPhaseActionRequired = await CommonModel.doGetLocalData(`${CommonModel.KEYS.TEST_RECOVERY_PHASE_ACTION_REQUIRED}-${CacheData.userInformation.bitmarkAccountNumber}`);
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

const doDecentralizedIssuance = async (token, encryptionKey) => {
  let result = await BitmarkService.doDecentralizedIssuance(CacheData.userInformation.bitmarkAccountNumber, token, encryptionKey);
  return result;
};

const doDecentralizedTransfer = async (token, ) => {
  let signatureData = await CommonModel.doCreateSignatureData();
  let info = await BitmarkModel.doGetInfoInfoOfDecentralizedTransfer(CacheData.userInformation.bitmarkAccountNumber, signatureData.timestamp, signatureData.signature, token);
  let bitmarkId = info.bitmark_id;
  let receiver = info.receiver;

  let { asset } = await doGetLocalBitmarkInformation(bitmarkId);
  let result = await BitmarkService.doDecentralizedTransfer(CacheData.userInformation.bitmarkAccountNumber, token, bitmarkId, receiver);

  let localAssets = await CommonModel.doGetLocalData(CommonModel.KEYS.USER_DATA_LOCAL_BITMARKS);
  let currentAsset = localAssets.find(la => la.id === asset.id);
  if (!currentAsset) {
    // TODO
    await FileUtil.removeSafe(`${FileUtil.getLocalAssetsFolderPath(CacheData.userInformation.bitmarkAccountNumber)}/${asset.id}`);
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

    CacheData.userInformation = CacheData.userInformation || (await UserModel.doTryGetCurrentUser());
  }
}
const doRemoveTestRecoveryPhaseActionRequiredIfAny = async () => {
  let testWriteRecoveryPhaseActionRequired = await CommonModel.doGetLocalData(`${CommonModel.KEYS.TEST_RECOVERY_PHASE_ACTION_REQUIRED}-${CacheData.userInformation.bitmarkAccountNumber}`);
  if (testWriteRecoveryPhaseActionRequired) {
    await CommonModel.doRemoveLocalData(`${CommonModel.KEYS.TEST_RECOVERY_PHASE_ACTION_REQUIRED}-${CacheData.userInformation.bitmarkAccountNumber}`);
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
      let userInfo = CacheData.userInformation || await UserModel.doTryGetCurrentUser() || {};

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

const setMountedRouter = (status = true) => {
  CacheData.mountedRouter = status;
  checkDisplayModal();
};

let setCodePushUpdated = (updated) => {
  CacheData.codePushUpdated = !!updated;
};

let doCheckHaveCodePushUpdate = () => {
  return new Promise((resolve) => {
    if (DeviceInfo.getBundleId() === 'com.bitmark.registry.beta') {
      resolve(true);
      return;
    }
    let checkHaveCodePushUpdate = () => {
      if (CacheData.codePushUpdated === true || CacheData.codePushUpdated === false) {
        return resolve(CacheData.codePushUpdated);
      }
      setTimeout(checkHaveCodePushUpdate, 1000);
    };
    checkHaveCodePushUpdate();
  });
};

let doMarkDisplayedWhatNewInformation = async () => {
  let appInfo = await doGetAppInformation();
  appInfo = appInfo || {};
  appInfo.displayedWhatNewInformation = DeviceInfo.getVersion();
  updateModal(mapModalDisplayKeyIndex.what_new);
  await CommonModel.doSetLocalData(CommonModel.KEYS.APP_INFORMATION, appInfo);
};
const doDisplayedWhatNewInformation = async () => {
  updateModal(mapModalDisplayKeyIndex.what_new, true);
};

const doProcessClaimRequest = async (claimRequest, isAccept) => {
  console.log('doProcessClaimRequest :', claimRequest, isAccept);
  if (isAccept) {
    let asset = claimRequest.asset;
    if (asset && asset.filePath) {
      let filename = asset.filePath.substring(asset.filePath.lastIndexOf('/') + 1, asset.filePath.length);
      await FileUtil.mkdir(`${FileUtil.getLocalAssetsFolderPath(CacheData.userInformation.bitmarkAccountNumber)}/${asset.id}/encrypted`);
      let encryptedFilePath = `${FileUtil.getLocalAssetsFolderPath(CacheData.userInformation.bitmarkAccountNumber)}/${asset.id}/encrypted/${filename}`;
      let encryptionPublicKey = await AccountModel.doGetEncryptionPublicKey(claimRequest.from);
      let sessionData = await BitmarkSDK.encryptFile(asset.filePath, encryptionPublicKey, encryptedFilePath);
      let uploadResult = await BitmarkService.uploadFileToCourierServer(CacheData.userInformation.bitmarkAccountNumber, asset.id, claimRequest.from, encryptedFilePath, sessionData);
      console.log('uploadResult:', uploadResult);
    }
    let result = await BitmarkSDK.giveAwayBitmark(claimRequest.asset.id, claimRequest.from);
    console.log('giveAwayBitmark:', result);
    let resultPost = await BitmarkModel.doPostAwaitTransfer(CacheData.jwt, result.bitmarkId, result.transferPayload);
    console.log('doPostAwaitTransfer result:', resultPost);
  }
  await BitmarkModel.doDeleteClaimRequests(CacheData.jwt, claimRequest.id);
  let claimRequests = await runGetClaimRequestInBackground();
  await doCheckClaimRequests(claimRequests);
  return true;
};

const doSendClaimRequest = async (asset) => {
  let result = await BitmarkModel.doPostClaimRequest(CacheData.jwt, asset.id, asset.registrant);
  updateModal(mapModalDisplayKeyIndex.claim_asset);
  return result;
};

const doViewSendClaimRequest = async (asset) => {
  updateModal(mapModalDisplayKeyIndex.claim_asset, { asset });
};

const doGetAssetToClaim = async (assetId) => {
  let asset = await BitmarkModel.doGetAssetInformation(assetId);
  let totalIssuedBitmarks = await BitmarkModel.doGetTotalBitmarksOfAssetOfIssuer(asset.registrant, asset.id);
  asset.totalBitmarks = totalIssuedBitmarks.length;
  let resultGetLimitedEdition = await BitmarkModel.doGetLimitedEdition(asset.registrant, asset.id);
  if (resultGetLimitedEdition) {
    asset.limitedEdition = resultGetLimitedEdition.limited;
  }
  console.log('CacheData :', CacheData);
  asset.registrantName = CacheData.identities[asset.registrant];
  return asset;
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
  doIssueMusic,
  doTransferBitmark,
  doMigrateWebAccount,
  doSignInOnWebApp,
  doDecentralizedIssuance,
  doDecentralizedTransfer,

  doGetLocalBitmarkInformation,
  doGetTrackingBitmarkInformation,
  doGetIftttInformation,

  doProcessClaimRequest,
  doSendClaimRequest,
  doViewSendClaimRequest,
  doReloadClaimAssetRequest,
  doGetAssetToClaim,

  doGetAllTransfersOffers,
  doAddMoreActionRequired,
  doAddMoreCompleted,

  doMarkRequestedNotification,
  doRemoveTestRecoveryPhaseActionRequiredIfAny,

  getApplicationVersion,
  getApplicationBuildNumber,
  doAddMoreAssets,
  doMetricOnScreen,

  setMountedRouter,
  setCodePushUpdated,
  doCheckHaveCodePushUpdate,
  doMarkDisplayedWhatNewInformation,
  doDisplayedWhatNewInformation
};

export { DataProcessor };
