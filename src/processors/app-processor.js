import { Platform, AppRegistry } from 'react-native';
import moment from 'moment';
import { registerTasks } from './app-tasks';

import { AccountModel, FaceTouchId, NotificationModel } from './models';
import { AccountService, BitmarkService, EventEmitterService, TransactionService } from './services'
import { DataProcessor } from './data-processor';

import { config } from 'src/configs';
import { compareVersion } from 'src/utils';

registerTasks();
// ================================================================================================
// ================================================================================================

let commonProcess = (promise, successCallback, errorCallback) => {
  let startAt = moment().toDate().getTime();
  let check2Seconds = (done) => {
    let endAt = moment().toDate().getTime();
    let space = startAt + 2000 - endAt;
    if (space > 0) {
      setTimeout(done, space);
    } else {
      done();
    }
  };

  promise.then((data) => {
    check2Seconds(() => successCallback(data));
  }).catch(error => {
    check2Seconds(() => errorCallback(error));
  });
};

let processing = (promise) => {
  EventEmitterService.emit(EventEmitterService.events.APP_PROCESSING, true);
  return new Promise((resolve, reject) => {
    commonProcess(promise, (data) => {
      EventEmitterService.emit(EventEmitterService.events.APP_PROCESSING, false);
      resolve(data);
    }, (error) => {
      EventEmitterService.emit(EventEmitterService.events.APP_PROCESSING, false);
      reject(error);
    })
  });
};

const executeTask = (taskKey, data) => {
  let taskId = `${taskKey}_${moment().toDate().getTime()}`;
  data = data || {};
  data.taskId = taskId;
  return new Promise((resolve, reject) => {
    EventEmitterService.on(`${EventEmitterService.events.APP_TASK}${taskId}`, ({ ok, result, error }) => {
      EventEmitterService.remove(`${EventEmitterService.events.APP_TASK}${taskId}`);
      if (ok) {
        resolve(result);
      } else {
        reject(error);
      }
    });
    AppRegistry.startHeadlessTask(taskId, taskKey, data);
  });
}
// ================================================================================================
// ================================================================================================
const doCreateNewAccount = async (enableTouchId) => {
  if (enableTouchId && Platform.OS === 'ios' && config.isIPhoneX) {
    await FaceTouchId.authenticate();
  }
  await AccountModel.doCreateAccount(enableTouchId);
  return await processing(DataProcessor.doCreateAccount());
};

const doGetCurrentAccount = async () => {
  let userInfo = await processing(AccountModel.doGetCurrentAccount());
  return userInfo;
};

const doCheckPhraseWords = async (phraseWords) => {
  return await AccountModel.doCheckPhraseWords(phraseWords);
};

const doGetTransferOfferDetail = async (transferOfferId) => {
  return await processing(TransactionService.doGetTransferOfferDetail(transferOfferId));
};

const doCheckFileToIssue = async (filePath) => {
  return await processing(BitmarkService.doCheckFileToIssue(filePath));
};

const doCreateSignatureData = async () => {
  return await processing(AccountService.doCreateSignatureData());
};

const doReloadUserData = async () => {
  return await DataProcessor.doReloadUserData();
};

const doGetProvenance = async (bitmark) => {
  return await processing(DataProcessor.doGetProvenance(bitmark.id));
};

const doGetAllTransfersOffers = async () => {
  return await processing(DataProcessor.doGetAllTransfersOffers());
};
const doStartBackgroundProcess = async (justCreatedBitmarkAccount) => {
  return DataProcessor.doStartBackgroundProcess(justCreatedBitmarkAccount);
  // return await processing(DataProcessor.doStartBackgroundProcess(justCreatedBitmarkAccount));
};

// ================================================================================================
// ================================================================================================
const doLogin = async (phraseWords, enableTouchId) => {
  return executeTask('doLogin', { phraseWords, enableTouchId });
};

const doLogout = async () => {
  return executeTask('doLogout');
};

const doIssueFile = async (filePath, assetName, metadataList, quantity, processingInfo) => {
  return executeTask('doIssueFile', { filePath, assetName, metadataList, quantity, processingInfo });
};
const doIssueMusic = async (filePath, assetName, metadataList, thumbnailPath, limitedEdition, processingInfo) => {
  return executeTask('doIssueMusic', { filePath, assetName, metadataList, thumbnailPath, limitedEdition, processingInfo });
};

const doTransferBitmark = async (bitmark, receiver, isDeleting = false) => {
  return executeTask('doTransferBitmark', { bitmark, receiver, isDeleting });
};

const doAcceptTransferBitmark = async (transferOffer, processingInfo) => {
  return executeTask('doAcceptTransferBitmark', { transferOffer, processingInfo });
};

const doAcceptAllTransfers = async (transferOffers, processingInfo) => {
  return executeTask('doAcceptAllTransfers', { transferOffers, processingInfo });
};

const doCancelTransferBitmark = async (transferOfferId, faceTouchMessage) => {
  return executeTask('doCancelTransferBitmark', { transferOfferId, faceTouchMessage });
};

const doRejectTransferBitmark = async (transferOffer, processingInfo) => {
  return executeTask('doRejectTransferBitmark', { transferOffer, processingInfo });
};

const doDownloadBitmark = async (bitmark, processingData) => {
  return executeTask('doDownloadBitmark', { bitmark, processingData });
};

const doTrackingBitmark = async (asset, bitmark) => {
  return executeTask('doTrackingBitmark', { asset, bitmark });
};

const doStopTrackingBitmark = async (bitmark) => {
  return executeTask('doStopTrackingBitmark', { bitmark });
};
const doRevokeIftttToken = async () => {
  return executeTask('doRevokeIftttToken');
};
const doIssueIftttData = async (iftttBitmarkFile, processingInfo) => {
  return executeTask('doIssueIftttData', { iftttBitmarkFile, processingInfo });
};

const doMigrateWebAccount = async (token) => {
  return executeTask('doMigrateWebAccount', { token });
};

const doSignInOnWebApp = async (token) => {
  return executeTask('doSignInOnWebApp', { token });
};

const doDecentralizedIssuance = async (token, encryptionKey, expiredTime) => {
  return executeTask('doDecentralizedIssuance', { token, encryptionKey, expiredTime });
};

const doDecentralizedTransfer = async (token, expiredTime) => {
  return executeTask('doDecentralizedTransfer', { token, expiredTime });
};
const doProcessIncomingClaimRequest = (incomingClaimRequest, isAccept) => {
  return executeTask('doProcessIncomingClaimRequest', { incomingClaimRequest, isAccept });
};
const doSendIncomingClaimRequest = async (asset) => {
  return executeTask('doSendIncomingClaimRequest', { asset });
};
const doGetAssetToClaim = async (assetId) => {
  return executeTask('doGetAssetToClaim', { assetId });
};


const doCheckNoLongerSupportVersion = async () => {
  let data = await NotificationModel.doTryGetAppVersion();
  if (data && data.version && data.version.minimum_supported_version) {
    let minimumSupportedVersion = data.version.minimum_supported_version;
    let currentVersion = DataProcessor.getApplicationVersion();
    if (compareVersion(minimumSupportedVersion, currentVersion) > 0) {
      return false;
    }
    return true;
  }
  return true;
};

// ================================================================================================
// ================================================================================================
// ================================================================================================

let AppProcessor = {
  doCreateNewAccount,
  doGetCurrentAccount,
  doCheckPhraseWords,
  doLogin,
  doLogout,
  doCreateSignatureData,
  doCheckFileToIssue,
  doIssueFile,
  doIssueMusic,
  doGetProvenance,
  doGetTransferOfferDetail,
  doTransferBitmark,
  doAcceptTransferBitmark,
  doRejectTransferBitmark,
  doAcceptAllTransfers,
  doCancelTransferBitmark,
  doDownloadBitmark,
  doTrackingBitmark,
  doStopTrackingBitmark,
  doRevokeIftttToken,
  doIssueIftttData,
  doReloadUserData,
  doMigrateWebAccount,
  doSignInOnWebApp,
  doGetAllTransfersOffers,
  doDecentralizedIssuance,
  doDecentralizedTransfer,
  doProcessIncomingClaimRequest,
  doSendIncomingClaimRequest,
  doGetAssetToClaim,

  doStartBackgroundProcess,

  doCheckNoLongerSupportVersion,
}

export {
  AppProcessor,
}