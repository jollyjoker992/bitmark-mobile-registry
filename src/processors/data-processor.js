import DeviceInfo from 'react-native-device-info';
import Intercom from 'react-native-intercom';
import moment from 'moment';
import { merge } from 'lodash';
import { Sentry } from 'react-native-sentry';
import base58 from 'bs58';
import { sha3_256 } from 'js-sha3';
import randomString from 'random-string';

import {
  EventEmitterService, TransactionService,
  BitmarkService, AccountService, LocalFileService,
} from './services';
import {
  CommonModel, AccountModel, UserModel, BitmarkSDK,
  BitmarkModel, iCloudSyncAdapter, IftttModel
} from './models';

import {
  FileUtil, runPromiseWithoutError,
  compareVersion,
  isReleasedAsset,
} from 'src/utils';
import {
  BottomTabStore, BottomTabActions,
  AssetStore, AssetActions, PropertyActionSheetStore, PropertyActionSheetActions,
  AccountStore, AccountActions, TransactionsStore, TransactionsActions, PropertiesStore, PropertiesActions,
} from 'src/views/stores';
import { config } from 'src/configs';
import { CacheData } from './caches';
import { BitmarkProcessor } from './bitmark-processor';
import { TransactionProcessor } from './transaction-processor';
import { CommonProcessor } from './common-processor';

// ================================================================================================================================================
const setAppLoadingStatus = () => {
  PropertiesStore.dispatch(PropertiesActions.updateLoadingStatus({ appLoadingData: CacheData.isLoadingData }));

  let accountStoreState = merge({}, AccountStore.getState().data);
  accountStoreState.appLoadingData = CacheData.isLoadingData;
  AccountStore.dispatch(AccountActions.init(accountStoreState));

  let transactionStoreState = merge({}, TransactionsStore.getState().data);
  transactionStoreState.appLoadingData = CacheData.isLoadingData;
  TransactionsStore.dispatch(TransactionsActions.init(transactionStoreState));
}
// ================================================================================================================================================

// ================================================================================================================================================

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

  if (CacheData.userInformation && CacheData.userInformation.bitmarkAccountNumber && !CacheData.processingDeepLink) {
    if (CacheData.identities[CacheData.userInformation.bitmarkAccountNumber] &&
      CacheData.identities[CacheData.userInformation.bitmarkAccountNumber].is_released_account != CacheData.userInformation.is_released_account) {
      CacheData.userInformation.is_released_account = CacheData.identities[CacheData.userInformation.bitmarkAccountNumber].is_released_account;
      await UserModel.doUpdateUserInfo(CacheData.userInformation);
    }
    await BitmarkProcessor.runGetUserBitmarks();
    await TransactionProcessor.runGetTransactionsInBackground();
    await doRemoveDraftBitmarkOfClaimRequest();
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

const configNotification = () => {
  const onRegistered = async (registeredNotificationInfo) => {
    CacheData.notificationUUID = registeredNotificationInfo ? registeredNotificationInfo.token : null;
    if (!CacheData.userInformation || !CacheData.userInformation.bitmarkAccountNumber) {
      CacheData.userInformation = await UserModel.doGetCurrentUser();
    }

    if (!CacheData.userInformation || !CacheData.userInformation.bitmarkAccountNumber) {
      let appInfo = (await doGetAppInformation()) || {};
      if (appInfo.notificationUUID !== CacheData.notificationUUID) {
        AccountService.doRegisterNotificationInfo(null, CacheData.notificationUUID, appInfo.intercomUserId).then(() => {
          CacheData.userInformation.notificationUUID = CacheData.notificationUUID;
          return UserModel.doUpdateUserInfo(CacheData.userInformation);
        }).catch(error => {
          console.log('DataProcessor doRegisterNotificationInfo error:', error);
        });
      }
    } else {
      if (CacheData.notificationUUID && CacheData.userInformation.notificationUUID !== CacheData.notificationUUID) {
        AccountService.doRegisterNotificationInfo(CacheData.userInformation.bitmarkAccountNumber, CacheData.notificationUUID, CacheData.userInformation.intercomUserId).then(() => {
          CacheData.userInformation.notificationUUID = CacheData.notificationUUID;
          return UserModel.doUpdateUserInfo(CacheData.userInformation);
        }).catch(error => {
          console.log('DataProcessor doRegisterNotificationInfo error:', error);
        });
      }
    }
  };
  const onReceivedNotification = async (notificationData) => {
    if (!notificationData.foreground) {
      if (!CacheData.userInformation || !CacheData.userInformation.bitmarkAccountNumber) {
        CacheData.userInformation = await UserModel.doGetCurrentUser();
      }
      if (notificationData.data.event === 'intercom_reply') {
        setTimeout(() => { Intercom.displayConversationsList(); }, 1000);
      } else {
        setTimeout(() => {
          EventEmitterService.emit(EventEmitterService.events.APP_RECEIVED_NOTIFICATION, notificationData.data);
        }, 1000);
      }
    }
  };
  AccountService.configureNotifications(onRegistered, onReceivedNotification);
  AccountService.removeAllDeliveredNotifications();
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
    let result = await AccountService.doCheckNotificationPermission();
    await CommonProcessor.doMarkRequestedNotification(result);
  }
  return CacheData.userInformation;
};

const doCreateAccount = async () => {
  let userInformation = await AccountService.doGetCurrentAccount();
  let signatureData = await CommonModel.doCreateSignatureData();
  await AccountModel.doTryRegisterAccount(userInformation.bitmarkAccountNumber, signatureData.timestamp, signatureData.signature);
  if (CacheData.notificationUUID) {
    let intercomUserId = `Registry_${config.isAndroid ? 'android' : 'ios'}_${sha3_256(userInformation.bitmarkAccountNumber)}`;
    userInformation.intercomUserId = intercomUserId;
    AccountService.doRegisterNotificationInfo(userInformation.bitmarkAccountNumber, CacheData.notificationUUID, intercomUserId).then(() => {
      userInformation.notificationUUID = CacheData.notificationUUID;
      return UserModel.doUpdateUserInfo(userInformation);
    }).catch(error => {
      console.log('DataProcessor doRegisterNotificationInfo error:', error);
    });
  }
  let signatures = await BitmarkSDK.signHexData([userInformation.encryptionPublicKey]);
  await runPromiseWithoutError(AccountModel.doRegisterEncryptionPublicKey(userInformation.bitmarkAccountNumber, userInformation.encryptionPublicKey, signatures[0]));
  await CommonModel.doTrackEvent({
    event_name: 'registry_create_new_account',
    account_number: userInformation ? userInformation.bitmarkAccountNumber : null,
  });
  return userInformation;
};

const doLogin = async () => {
  let userInformation = await AccountService.doGetCurrentAccount();
  let signatureData = await CommonModel.doCreateSignatureData();
  await AccountModel.doTryRegisterAccount(userInformation.bitmarkAccountNumber, signatureData.timestamp, signatureData.signature);
  let signatures = await BitmarkSDK.signHexData([userInformation.encryptionPublicKey]);
  await runPromiseWithoutError(AccountModel.doRegisterEncryptionPublicKey(userInformation.bitmarkAccountNumber, userInformation.encryptionPublicKey, signatures[0]));
  return userInformation;
};

const doLogout = async () => {
  if (CacheData.userInformation.notificationUUID) {
    let signatureData = await CommonModel.doCreateSignatureData();
    await AccountService.doTryDeregisterNotificationInfo(CacheData.userInformation.bitmarkAccountNumber, CacheData.userInformation.notificationUUID, signatureData);
  }
  await AccountModel.doLogout();
  await UserModel.doRemoveUserInfo();
  await Intercom.logout();
  CacheData.userInformation = {};
  PropertiesStore.dispatch(PropertiesActions.reset());
  BottomTabStore.dispatch(BottomTabActions.reset());
  AssetStore.dispatch(AssetActions.reset());
  PropertyActionSheetStore.dispatch(PropertyActionSheetActions.reset());
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
  console.log('CacheData.userInformation :', CacheData.userInformation, FileUtil.DocumentDirectory);
  if (config.isIPhone) {
    await LocalFileService.setShareLocalStoragePath();
  }
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
    let bitmarkAccountNumber = CacheData.userInformation.bitmarkAccountNumber;
    // set the user context
    if (!__DEV__) {
      Sentry.setUserContext({ userID: bitmarkAccountNumber, });
    }
    configNotification();
    if (!CacheData.userInformation.intercomUserId) {
      let intercomUserId = `Registry_${config.isAndroid ? 'android' : 'ios'}_${sha3_256(bitmarkAccountNumber)}`;
      CacheData.userInformation.intercomUserId = intercomUserId;
      await UserModel.doUpdateUserInfo(CacheData.userInformation);
      Intercom.logout().then(() => {
        return Intercom.registerIdentifiedUser({ userId: intercomUserId })
      }).catch(error => {
        console.log('registerIdentifiedUser error :', error);
      });
    }
    await checkAppNeedResetLocalData(appInfo);
    if (config.isIPhone) {
      await LocalFileService.moveFilesFromLocalStorageToSharedStorage();
    }


    let identities = await runPromiseWithoutError(AccountModel.doGetIdentities());
    if (identities && !identities.error) {
      CacheData.identities = identities;
    }
    if (CacheData.identities[CacheData.userInformation.bitmarkAccountNumber] &&
      CacheData.identities[CacheData.userInformation.bitmarkAccountNumber].is_released_account != CacheData.userInformation.is_released_account) {
      CacheData.userInformation.is_released_account = CacheData.identities[CacheData.userInformation.bitmarkAccountNumber].is_released_account;
      await UserModel.doUpdateUserInfo(CacheData.userInformation);
    }


    if (config.isIPhone) {
      iCloudSyncAdapter.oniCloudFileChanged((mapFiles) => {
        if (this.iCloudFileChangedTimeout) {
          clearTimeout(this.iCloudFileChangedTimeout)
        }

        this.iCloudFileChangedTimeout = setTimeout(
          () => {
            for (let key in mapFiles) {
              let keyList = key.split('_');
              let assetId;
              if (keyList[0] === bitmarkAccountNumber) {
                let keyFilePath;
                if (keyList[1] === 'assets') {
                  assetId = base58.decode(keyList[2]).toString('hex');
                  keyFilePath = key.replace(`${bitmarkAccountNumber}_assets_${keyList[2]}_`, `${bitmarkAccountNumber}/assets/${assetId}/downloaded/`);
                } else if (keyList[1] === 'thumbnail') {
                  assetId = base58.decode(keyList[2]).toString('hex');
                  keyFilePath = key.replace(`${bitmarkAccountNumber}_thumbnail_${keyList[2]}_`, `${bitmarkAccountNumber}/assets/${assetId}/`);
                }
                let doSyncFile = async () => {
                  let filePath = mapFiles[key];
                  let downloadedFile = `${FileUtil.SharedGroupDirectory}/${keyFilePath}`;
                  let existFileICloud = await FileUtil.exists(filePath);
                  let existFileLocal = await FileUtil.exists(downloadedFile);
                  if (existFileICloud && !existFileLocal) {
                    let downloadedFolder = downloadedFile.substring(0, downloadedFile.lastIndexOf('/'));
                    await FileUtil.mkdir(downloadedFolder);
                    await FileUtil.copyFile(filePath, downloadedFile);
                  }
                };
                runPromiseWithoutError(doSyncFile());
              }
            }
            CacheData.userInformation.lastSyncIcloud = moment().toDate().toISOString();
            UserModel.doUpdateUserInfo(CacheData.userInformation);
          },
          1000 * 5 // 5s
        );
      });
      iCloudSyncAdapter.syncCloud();
    }

    let signatureData = await CommonModel.doCreateSignatureData();
    let result = await AccountModel.doRegisterJWT(bitmarkAccountNumber, signatureData.timestamp, signatureData.signature);
    CacheData.jwt = result.jwt_token;

    if (justCreatedBitmarkAccount) {
      appInfo.displayedWhatNewInformation = DeviceInfo.getVersion();
      await CommonModel.doSetLocalData(CommonModel.KEYS.APP_INFORMATION, appInfo);
    } else {
      if (!appInfo.displayedWhatNewInformation || compareVersion(appInfo.displayedWhatNewInformation, DeviceInfo.getVersion(), 2) < 0) {
        CommonProcessor.updateModal(CommonProcessor.ModalDisplayKeyIndex.what_new, true);
      }
    }


    let assetsBitmarks = await BitmarkProcessor.doGetLocalAssetsBitmarks();
    let releasedAssetsBitmarks = await BitmarkProcessor.doGetLocalReleasedAssetsBitmarks();
    let actionRequired = (await CommonModel.doGetLocalData(CommonModel.KEYS.USER_DATA_TRANSACTIONS_ACTION_REQUIRED)) || [];
    let completed = (await CommonModel.doGetLocalData(CommonModel.KEYS.USER_DATA_TRANSACTIONS_HISTORY)) || [];
    let totalTasks = 0;
    actionRequired.forEach(item => totalTasks += (item.number ? item.number : 1));
    // Add "Write Down Your Recovery Phrase" action required which was created when creating account if any
    let testRecoveryPhaseActionRequired = await CommonModel.doGetLocalData(`${CommonModel.KEYS.TEST_RECOVERY_PHASE_ACTION_REQUIRED}-${bitmarkAccountNumber}`);
    if (testRecoveryPhaseActionRequired) {
      actionRequired.unshift({
        key: actionRequired.length,
        type: TransactionProcessor.TransactionActionRequireTypes.test_write_down_recovery_phase,
        typeTitle: global.i18n.t("DataProcessor_securityAlert"),
        timestamp: moment(new Date(testRecoveryPhaseActionRequired.timestamp)),
      });
      totalTasks += 1;
    }
    // ============================
    AccountService.setApplicationIconBadgeNumber(totalTasks || 0);
    BottomTabStore.dispatch(BottomTabActions.init({
      totalTasks,
      totalNewBitmarks: Object.values(assetsBitmarks.bitmarks || {}).filter(bitmark => !bitmark.isViewed).length,
    }));

    PropertiesStore.dispatch(PropertiesActions.updateBitmarks({
      bitmarks: Object.values(assetsBitmarks.bitmarks || {}),
      assets: assetsBitmarks.assets,
    }));
    PropertiesStore.dispatch(PropertiesActions.updateReleasedAssets({
      releasedBitmarks: releasedAssetsBitmarks.bitmarks || {},
      releasedAssets: Object.values(releasedAssetsBitmarks.assets || {}),
    }));

    let propertyActionSheetStoreState = merge({}, PropertyActionSheetStore.getState().data);
    if (propertyActionSheetStoreState.bitmark && propertyActionSheetStoreState.bitmark.id && propertyActionSheetStoreState.bitmark.asset_id) {
      propertyActionSheetStoreState.asset = assetsBitmarks.assets[propertyActionSheetStoreState.bitmark.asset_id];
      propertyActionSheetStoreState.bitmark = assetsBitmarks.bitmarks[propertyActionSheetStoreState.bitmark.id];
      PropertyActionSheetStore.dispatch(PropertyActionSheetActions.init(propertyActionSheetStoreState));
    }

    TransactionsStore.dispatch(TransactionsActions.init({
      totalActionRequired: actionRequired.length,
      actionRequired: actionRequired.slice(0, 20),
      totalTasks,
      totalCompleted: completed.length,
      completed: completed.slice(0, 20),
    }));

    AccountStore.dispatch(AccountActions.init({
      userInformation: CacheData.userInformation,
      iftttInformation: await TransactionProcessor.doGetIftttInformation(),
    }));

    // ============================
  } else if (!CacheData.userInformation || !CacheData.userInformation.bitmarkAccountNumber) {
    let intercomUserId = appInfo.intercomUserId || `Registry_${config.isAndroid ? 'android' : 'ios'}_${sha3_256(moment().toDate().getTime() + randomString({ length: 8 }))}`;
    if (!appInfo.intercomUserId) {
      appInfo.intercomUserId = intercomUserId;
      Intercom.logout().then(() => {
        return Intercom.registerIdentifiedUser({ userId: intercomUserId })
      }).catch(error => {
        console.log('registerIdentifiedUser error :', error);
      });
      CommonModel.doSetLocalData(CommonModel.KEYS.APP_INFORMATION, appInfo);
    } else {
      Intercom.registerIdentifiedUser({ userId: intercomUserId }).catch(error => {
        console.log('registerIdentifiedUser error :', error);
      });
    }
    configNotification();
  }

  setAppLoadingStatus();
  return CacheData.userInformation;
};

const doAcceptTransferBitmark = async (transferOffer) => {
  await TransactionService.doAcceptTransferBitmark(transferOffer);
  await TransactionProcessor.doReloadTransferOffers();
  await BitmarkProcessor.doReloadUserAssetsBitmarks();
  return true;
};

const doAcceptAllTransfers = async (transferOffers) => {
  for (let transferOffer of transferOffers) {
    await TransactionService.doAcceptTransferBitmark(transferOffer);
  }
  await TransactionProcessor.doReloadTransferOffers();
  await BitmarkProcessor.doReloadUserAssetsBitmarks();
  return true;
};

const doCancelTransferBitmark = async (transferOfferId) => {
  await TransactionService.doCancelTransferBitmark(transferOfferId);
  await TransactionProcessor.doReloadTransferOffers();
  await BitmarkProcessor.doReloadUserAssetsBitmarks();
  return true;
};

const doRejectTransferBitmark = async (transferOffer, ) => {
  await TransactionService.doRejectTransferBitmark(transferOffer);
  await TransactionProcessor.doReloadTransferOffers();
  return true;
};

const doTransferBitmark = async (bitmarkId, receiver, isDelete) => {
  let { asset } = await BitmarkProcessor.doGetAssetBitmark(bitmarkId);
  if (!isDelete) {
    if (asset && asset.filePath) {
      let resultCheck = await BitmarkService.doCheckFileExistInCourierServer(asset.id);
      if (resultCheck && resultCheck.data_key_alg && resultCheck.enc_data_key && resultCheck.orig_content_type) {
        let encryptionPublicKey = await AccountModel.doGetEncryptionPublicKey(receiver);
        let receiverSessionData = await BitmarkSDK.encryptSessionData({
          enc_data_key: resultCheck.enc_data_key,
          data_key_alg: resultCheck.data_key_alg
        }, encryptionPublicKey);
        let access = `${receiver}:${receiverSessionData.enc_data_key}`;
        let grantAccessResult = await BitmarkService.doUpdateAccessFileInCourierServer(asset.id, access);
        console.log('grantAccessResult :', grantAccessResult);
      } else {
        let filename = asset.filePath.substring(asset.filePath.lastIndexOf('/') + 1, asset.filePath.length);
        await FileUtil.mkdir(`${FileUtil.getLocalAssetsFolderPath(CacheData.userInformation.bitmarkAccountNumber, config.isAndroid)}/${asset.id}/encrypted`);
        let encryptedFilePath = `${FileUtil.getLocalAssetsFolderPath(CacheData.userInformation.bitmarkAccountNumber, config.isAndroid)}/${asset.id}/encrypted/temp.encrypted`;
        let sessionData = await BitmarkSDK.encryptFile(asset.filePath, encryptedFilePath);

        let encryptionPublicKey = await AccountModel.doGetEncryptionPublicKey(receiver);
        let receiverSessionData = await BitmarkSDK.encryptSessionData(sessionData, encryptionPublicKey);
        let access = `${receiver}:${receiverSessionData.enc_data_key}`;
        let uploadResult = await BitmarkService.doUploadFileToCourierServer(asset.id, encryptedFilePath, sessionData, filename, access);
        console.log('uploadResult :', uploadResult);
      }
    }
  }

  let result = await BitmarkService.doTransferBitmark(bitmarkId, receiver);
  await TransactionProcessor.doReloadTransfers();
  await BitmarkProcessor.doReloadUserAssetsBitmarks();
  if (isReleasedAsset(asset)) {
    await BitmarkProcessor.doReloadUserReleasedAssetsBitmarks();
  }

  // TODO remove file after transfer
  // if (asset) {
  //   let assetsBitmarks = BitmarkProcessor.doGetLocalAssetsBitmarks();
  //   let releasedAssetsBitmarks = BitmarkProcessor.doGetLocalReleasedAssetsBitmarks();
  //   if (!(assetsBitmarks.assets || {})[asset.id] && !(releasedAssetsBitmarks.assets || {})[asset.id]) {
  //     await FileUtil.removeSafe(`${FileUtil.getLocalAssetsFolderPath(CacheData.userInformation.bitmarkAccountNumber, config.isAndroid)}/${asset.id}`);
  //   }
  // }
  return result;
};

const doSignAllIncomingClaimRequest = async (mapAssetClaimRequest) => {
  for (let assetId in mapAssetClaimRequest) {
    let incomingClaimRequestsOfAsset = mapAssetClaimRequest[assetId];
    if (incomingClaimRequestsOfAsset && incomingClaimRequestsOfAsset.length > 0) {
      let asset = incomingClaimRequestsOfAsset[0].asset;
      if (asset && asset.filePath) {
        let resultCheck = await BitmarkService.doCheckFileExistInCourierServer(asset.id);
        if (resultCheck && resultCheck.data_key_alg && resultCheck.enc_data_key && resultCheck.orig_content_type) {
          let sessionData = {
            enc_data_key: resultCheck.enc_data_key,
            data_key_alg: resultCheck.data_key_alg
          };
          let access = '';
          for (let incomingClaimRequest of incomingClaimRequestsOfAsset) {
            if (incomingClaimRequest.bitmark) {
              let encryptionPublicKey = await AccountModel.doGetEncryptionPublicKey(incomingClaimRequest.from);
              console.log('encryptionPublicKey :', encryptionPublicKey);
              let receiverSessionData = await BitmarkSDK.encryptSessionData(sessionData, encryptionPublicKey);
              access += (access ? ':' : '') + `${incomingClaimRequest.from}:${receiverSessionData.enc_data_key}`;
            }
          }
          let grantAccessResult = await BitmarkService.doUpdateAccessFileInCourierServer(asset.id, access);
          console.log('grantAccessResult :', grantAccessResult);
        } else {
          let filename = asset.filePath.substring(asset.filePath.lastIndexOf('/') + 1, asset.filePath.length);
          await FileUtil.mkdir(`${FileUtil.getLocalAssetsFolderPath(CacheData.userInformation.bitmarkAccountNumber, config.isAndroid)}/${asset.id}/encrypted`);
          let encryptedFilePath = `${FileUtil.getLocalAssetsFolderPath(CacheData.userInformation.bitmarkAccountNumber, config.isAndroid)}/${asset.id}/encrypted/temp.encrypted`;
          let sessionData = await BitmarkSDK.encryptFile(asset.filePath, encryptedFilePath);
          let access = '';
          let existAccounts = {};
          for (let incomingClaimRequest of incomingClaimRequestsOfAsset) {
            if (incomingClaimRequest.bitmark && !existAccounts[incomingClaimRequest.from]) {
              existAccounts[incomingClaimRequest.from] = true;
              let encryptionPublicKey = await AccountModel.doGetEncryptionPublicKey(incomingClaimRequest.from);
              let receiverSessionData = await BitmarkSDK.encryptSessionData(sessionData, encryptionPublicKey);
              access += (access ? ':' : '') + `${incomingClaimRequest.from}:${receiverSessionData.enc_data_key}`;
            }
          }
          let uploadResult = await BitmarkService.doUploadFileToCourierServer(asset.id, encryptedFilePath, sessionData, filename, access);
          console.log('uploadResult :', uploadResult);
        }
      }
      let accepted = [];
      let rejected = [];
      for (let incomingClaimRequest of incomingClaimRequestsOfAsset) {
        if (incomingClaimRequest.bitmark) {
          await BitmarkService.doTransferBitmark(incomingClaimRequest.bitmark.id, incomingClaimRequest.from);
          accepted.push({
            id: incomingClaimRequest.id,
            info: { bitmark_id: incomingClaimRequest.bitmark.id },
          });
        } else {
          rejected.push({
            id: incomingClaimRequest.id,
          });
        }
      }
      await BitmarkModel.doSubmitIncomingClaimRequests(CacheData.jwt, { accepted, rejected });
    }
  }
};

const doProcessAllIncomingClaimRequest = async () => {
  let claimRequests = (await CommonModel.doGetLocalData(CommonModel.KEYS.USER_DATA_CLAIM_REQUEST)) || {};
  let incomingClaimRequests = claimRequests.incoming_claim_requests || [];
  let mapAssetClaimRequest = {};
  for (let claimRequest of incomingClaimRequests) {
    mapAssetClaimRequest[claimRequest.asset_id] = mapAssetClaimRequest[claimRequest.asset_id] || [];
    mapAssetClaimRequest[claimRequest.asset_id].push(claimRequest);
  }

  let assetsBitmarks = (await CommonModel.doGetLocalData(CommonModel.KEYS.USER_DATA_ASSETS_BITMARKS)) || {};
  for (let assetId in mapAssetClaimRequest) {
    let bitmarksOfAsset = merge([], Object.values(assetsBitmarks.bitmarks || {}).filter(bm => bm.asset_id === assetId));
    bitmarksOfAsset.sort((a, b) => {
      if (a.editionNumber && b.editionNumber) {
        return a.editionNumber - b.editionNumber;
      }
      if (!a.issue_block_number) { return -1; }
      if (!b.issue_block_number) { return 1; }
      if (a.issue_block_number < b.issue_block_number) {
        return -1
      } else if (a.issue_block_number > b.issue_block_number) {
        return 1
      } else {
        return a.issue_block_offset - b.issue_block_offset;
      }
    });
    let incomingClaimRequestsOfAsset = mapAssetClaimRequest[assetId];
    incomingClaimRequestsOfAsset.sort((a, b) => moment(a.created_at).toDate().getTime() - moment(b.created_at).toDate().getTime());
    let bitmarkIndex = 0;
    if (bitmarksOfAsset.length > 0 && bitmarksOfAsset[bitmarkIndex].editionNumber === 0) {
      bitmarkIndex++;
    }
    for (let index = 0; index < incomingClaimRequestsOfAsset.length; index++) {
      if (bitmarkIndex < bitmarksOfAsset.length) {
        incomingClaimRequestsOfAsset[index].bitmark = bitmarksOfAsset[bitmarkIndex];
        bitmarkIndex++;
      }
    }
    mapAssetClaimRequest[assetId] = incomingClaimRequestsOfAsset;
  }

  await doSignAllIncomingClaimRequest(mapAssetClaimRequest);

  await TransactionProcessor.doReloadTransfers();
  await TransactionProcessor.doReloadClaimRequests();
  await BitmarkProcessor.doReloadUserReleasedAssetsBitmarks();
  await BitmarkProcessor.doReloadUserAssetsBitmarks();
  return true;
};

const doProcessIncomingClaimRequest = async (incomingClaimRequest, isAccept) => {
  if (isAccept) {
    let asset = incomingClaimRequest.asset;
    let assetsBitmarks = (await CommonModel.doGetLocalData(CommonModel.KEYS.USER_DATA_ASSETS_BITMARKS)) || {};
    let bitmark;
    for (let bm of Object.values(assetsBitmarks.bitmarks || {})) {
      if (bm.asset_id === asset.id && bm.editionNumber > 0) {
        bitmark = (!bitmark || (bm.status === 'confirmed' && bitmark.editionNumber > bm.editionNumber)) ? bm : bitmark;
      }
    }
    if (bitmark) {
      if (asset && asset.filePath) {
        let resultCheck = await BitmarkService.doCheckFileExistInCourierServer(asset.id);
        if (resultCheck && resultCheck.data_key_alg && resultCheck.enc_data_key && resultCheck.orig_content_type) {
          let encryptionPublicKey = await AccountModel.doGetEncryptionPublicKey(incomingClaimRequest.from);
          let receiverSessionData = await BitmarkSDK.encryptSessionData({
            enc_data_key: resultCheck.enc_data_key,
            data_key_alg: resultCheck.data_key_alg
          }, encryptionPublicKey);
          let access = `${incomingClaimRequest.from}:${receiverSessionData.enc_data_key}`;
          let grantAccessResult = await BitmarkService.doUpdateAccessFileInCourierServer(asset.id, access);
          console.log('grantAccessResult :', grantAccessResult);
        } else {
          let filename = asset.filePath.substring(asset.filePath.lastIndexOf('/') + 1, asset.filePath.length);
          await FileUtil.mkdir(`${FileUtil.getLocalAssetsFolderPath(CacheData.userInformation.bitmarkAccountNumber, config.isAndroid)}/${asset.id}/encrypted`);
          let encryptedFilePath = `${FileUtil.getLocalAssetsFolderPath(CacheData.userInformation.bitmarkAccountNumber, config.isAndroid)}/${asset.id}/encrypted/temp.encrypted`;
          let sessionData = await BitmarkSDK.encryptFile(asset.filePath, encryptedFilePath);

          let encryptionPublicKey = await AccountModel.doGetEncryptionPublicKey(incomingClaimRequest.from);
          let receiverSessionData = await BitmarkSDK.encryptSessionData(sessionData, encryptionPublicKey);
          let access = `${incomingClaimRequest.from}:${receiverSessionData.enc_data_key}`;

          let uploadResult = await BitmarkService.doUploadFileToCourierServer(asset.id, encryptedFilePath, sessionData, filename, access);
          console.log('uploadResult :', uploadResult);
        }
      }

      await BitmarkService.doTransferBitmark(bitmark.id, incomingClaimRequest.from);
      await BitmarkModel.doSubmitIncomingClaimRequests(CacheData.jwt, { accepted: [{ id: incomingClaimRequest.id, bitmark_id: bitmark.id }] });
      await TransactionProcessor.doReloadTransfers();
      await TransactionProcessor.doReloadClaimRequests();
      if (isReleasedAsset(asset)) {
        await BitmarkProcessor.doReloadUserReleasedAssetsBitmarks();
      }
      await BitmarkProcessor.doReloadUserAssetsBitmarks();
      return { ok: true };
    } else {
      return { ok: false };
    }
  } else {
    await BitmarkModel.doSubmitIncomingClaimRequests(CacheData.jwt, { rejected: [{ id: incomingClaimRequest.id }] });
    await TransactionProcessor.doReloadClaimRequests();
    return { ok: true };
  }
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
  let results = await BitmarkService.doIssueFile(CacheData.userInformation.bitmarkAccountNumber, filePath, iftttBitmarkFile.assetInfo.propertyName, iftttBitmarkFile.assetInfo.metadata, 1);
  let assetsBitmarks = (await CommonModel.doGetLocalData(CommonModel.KEYS.USER_DATA_ASSETS_BITMARKS)) || {};
  for (let item of results) {
    assetsBitmarks.bitmarks = assetsBitmarks.bitmarks || {};
    assetsBitmarks.bitmarks[item.id] = {
      head_id: item.id,
      asset_id: item.assetId,
      id: item.id,
      issued_at: moment().toDate().toISOString(),
      head: `head`,
      status: 'pending',
      owner: CacheData.userInformation.bitmarkAccountNumber,
      issuer: CacheData.userInformation.bitmarkAccountNumber,
    };
    if (!assetsBitmarks.assets || !assetsBitmarks.assets[item.assetId]) {
      assetsBitmarks.assets = assetsBitmarks.assets || {};
      assetsBitmarks.assets[item.assetId] = {
        id: item.assetId,
        name: iftttBitmarkFile.assetInfo.propertyName,
        metadata: item.metadata,
        registrant: CacheData.userInformation.bitmarkAccountNumber,
        status: 'pending',
        created_at: moment().toDate().toISOString(),
        filePath: item.filePath,
      }
    }
  }
  await BitmarkProcessor.doCheckNewAssetsBitmarks(assetsBitmarks);

  let iftttInformation = await IftttModel.doRemoveBitmarkFile(CacheData.userInformation.bitmarkAccountNumber, signatureData.timestamp, signatureData.signature, iftttBitmarkFile.id);
  await TransactionProcessor.doCheckNewIftttInformation(iftttInformation);
  return iftttInformation;
};

const doSendIncomingClaimRequest = async (asset, issuer) => {
  issuer = issuer || asset.registrant;
  let assetsBitmarks = (await CommonModel.doGetLocalData(CommonModel.KEYS.USER_DATA_ASSETS_BITMARKS)) || {};
  let bitmark = Object.values(assetsBitmarks.bitmarks || {}).find(b => b.asset_id === asset.id);
  if (!bitmark) {
    let result = await BitmarkModel.doPostIncomingClaimRequest(CacheData.jwt, asset.id, issuer);
    assetsBitmarks.bitmarks = assetsBitmarks.bitmarks || {};
    let tempBitmarkId = `claim_request_${result.claim_id}`
    let bitmark = {
      head_id: tempBitmarkId,
      asset_id: asset.id,
      id: tempBitmarkId,
      issued_at: moment().toDate().toISOString(),
      head: `head`,
      status: 'pending',
      owner: CacheData.userInformation.bitmarkAccountNumber,
      issuer: issuer,
      isDraft: true,
    };
    assetsBitmarks.bitmarks[tempBitmarkId] = bitmark;
    if (!assetsBitmarks.assets || !assetsBitmarks.assets[asset.id]) {
      assetsBitmarks.assets = assetsBitmarks.assets || {};
      assetsBitmarks.assets[asset.id] = asset;
    }
    await BitmarkProcessor.doCheckNewAssetsBitmarks(assetsBitmarks);
    await TransactionProcessor.doReloadClaimRequests();
  }
  CacheData.processingDeepLink = false;
  return { bitmark, asset };
};

const doRemoveDraftBitmarkOfClaimRequest = async () => {
  let assetsBitmarks = (await CommonModel.doGetLocalData(CommonModel.KEYS.USER_DATA_ASSETS_BITMARKS)) || {};
  let outgoingClaimRequests;
  let changed = false;
  for (let bitmarkId in (assetsBitmarks.bitmarks || {})) {
    if (bitmarkId.indexOf('claim_request_') === 0) {
      let assetId = assetsBitmarks.bitmarks[bitmarkId].asset_id;
      let claimId = bitmarkId.replace('claim_request_', '');
      if (!outgoingClaimRequests) {
        let claimRequests = (await CommonModel.doGetLocalData(CommonModel.KEYS.USER_DATA_CLAIM_REQUEST)) || {};
        outgoingClaimRequests = claimRequests.outgoing_claim_requests || [];
      }
      let claimRequest = outgoingClaimRequests.find(cl => cl.id === claimId);
      if (claimRequest && claimRequest.status !== 'pending') {
        changed = true;

        let existOtherBitmark = Object.values(assetsBitmarks.bitmarks || {}).findIndex(bm => bm && bm.asset_id === assetId) >= 0;
        assetsBitmarks.bitmarks[bitmarkId] = null;
        delete assetsBitmarks.bitmarks[bitmarkId]
        if (!existOtherBitmark) {
          assetsBitmarks.assets[assetId] = null;
          delete assetsBitmarks.assets[assetId];
        }
      }

    }
  }
  if (changed) {
    await BitmarkProcessor.doCheckNewAssetsBitmarks(assetsBitmarks);
  }
};

const doMigrateWebAccount = async (token) => {
  let result = await BitmarkService.doConfirmWebAccount(CacheData.userInformation.bitmarkAccountNumber, token);
  await BitmarkProcessor.doReloadUserAssetsBitmarks();
  return result;
};

const doSignInOnWebApp = async (token) => {
  return await BitmarkService.doConfirmWebAccount(CacheData.userInformation.bitmarkAccountNumber, token);
};

// ======================================================================================================================================================================================
// ======================================================================================================================================================================================
// ======================================================================================================================================================================================
// ======================================================================================================================================================================================

const doDecentralizedIssuance = async (token, encryptionKey) => {
  let result = await BitmarkService.doDecentralizedIssuance(CacheData.userInformation.bitmarkAccountNumber, token, encryptionKey);
  await BitmarkProcessor.doReloadUserAssetsBitmarks();
  return result;
};

const doDecentralizedTransfer = async (token, ) => {
  let signatureData = await CommonModel.doCreateSignatureData();
  let info = await BitmarkModel.doGetInfoInfoOfDecentralizedTransfer(CacheData.userInformation.bitmarkAccountNumber, signatureData.timestamp, signatureData.signature, token);
  let bitmarkId = info.bitmark_id;
  let receiver = info.receiver;
  let result = await BitmarkService.doDecentralizedTransfer(CacheData.userInformation.bitmarkAccountNumber, token, bitmarkId, receiver);
  await BitmarkProcessor.doReloadUserAssetsBitmarks();
  return result;
};

const doMigrateAndroidAccount = async () => {
  await BitmarkSDK.migrate();
};

const DataProcessor = {
  doMigrateAndroidAccount,
  doOpenApp,
  doCreateAccount,
  doLogin,
  doLogout,
  doStartBackgroundProcess,
  doReloadUserData,

  doIssueIftttData,
  doSendIncomingClaimRequest,
  doRemoveDraftBitmarkOfClaimRequest,

  doDeactiveApplication,
  doAcceptTransferBitmark,
  doAcceptAllTransfers,
  doCancelTransferBitmark,
  doRejectTransferBitmark,
  doTransferBitmark,

  doProcessIncomingClaimRequest,
  doProcessAllIncomingClaimRequest,

  doMigrateWebAccount,
  doSignInOnWebApp,
  doDecentralizedIssuance,
  doDecentralizedTransfer,
};

export { DataProcessor };
