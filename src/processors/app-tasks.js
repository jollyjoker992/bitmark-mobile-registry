import { Platform, AppRegistry } from 'react-native';
import moment from 'moment';

import { AccountModel, FaceTouchId, } from './models';
import { EventEmitterService, } from './services'
import { DataProcessor } from './data-processor';
import { config } from 'src/configs';

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

let submitting = (promise, processingData) => {
  EventEmitterService.emit(EventEmitterService.events.APP_SUBMITTING, processingData || { indicator: true });
  return new Promise((resolve, reject) => {
    commonProcess(promise, (data) => {
      EventEmitterService.emit(EventEmitterService.events.APP_SUBMITTING, null);
      resolve(data);
    }, (error) => {
      EventEmitterService.emit(EventEmitterService.events.APP_SUBMITTING, null);
      reject(error);
    });
  });
};

// ================================================================================================
// ================================================================================================

const doLogin = async ({ phraseWords, enableTouchId }) => {
  if (enableTouchId && Platform.OS === 'ios' && config.isIPhoneX) {
    await FaceTouchId.authenticate();
  }
  await AccountModel.doLogin(phraseWords, enableTouchId);
  return await processing(DataProcessor.doLogin());
};

const doLogout = async () => {
  return await processing(DataProcessor.doLogout());
};

const doIssueFile = async ({ filePath, assetName, metadataList, quantity, processingInfo }) => {
  return await submitting(DataProcessor.doIssueFile(filePath, assetName, metadataList, quantity), processingInfo);
};
const doIssueMusic = async ({ filePath, assetName, metadataList, thumbnailPath, limitedEdition, processingInfo }) => {
  return await submitting(DataProcessor.doIssueMusic(filePath, assetName, metadataList, thumbnailPath, limitedEdition), processingInfo);
};


const doTransferBitmark = async ({ bitmark, receiver, isDeleting }) => {
  return await processing(DataProcessor.doTransferBitmark(bitmark.id, receiver, isDeleting));
};

const doAcceptTransferBitmark = async ({ transferOffer, processingInfo }) => {
  return await submitting(DataProcessor.doAcceptTransferBitmark(transferOffer), processingInfo);
};

const doAcceptAllTransfers = async ({ transferOffers, processingInfo }) => {
  return await submitting(DataProcessor.doAcceptAllTransfers(transferOffers), processingInfo);
};


const doCancelTransferBitmark = async ({ transferOfferId }) => {
  return await processing(DataProcessor.doCancelTransferBitmark(transferOfferId));
};

const doRejectTransferBitmark = async ({ transferOffer, processingInfo }) => {
  return await submitting(DataProcessor.doRejectTransferBitmark(transferOffer), processingInfo);
};

const doDownloadBitmark = async ({ bitmark, processingData }) => {
  return await submitting(DataProcessor.doDownloadBitmark(bitmark), processingData);
};

const doTrackingBitmark = async ({ asset, bitmark }) => {
  return await processing(DataProcessor.doTrackingBitmark(asset, bitmark));
};

const doStopTrackingBitmark = async ({ bitmark }) => {
  return await processing(DataProcessor.doStopTrackingBitmark(bitmark));
}
const doRevokeIftttToken = async () => {
  return await processing(DataProcessor.doRevokeIftttToken());
};
const doIssueIftttData = async ({ iftttBitmarkFile, processingInfo }) => {
  return await submitting(DataProcessor.doIssueIftttData(iftttBitmarkFile), processingInfo);
};

const doMigrateWebAccount = async ({ token }) => {
  return await processing(DataProcessor.doMigrateWebAccount(token));
};

const doSignInOnWebApp = async ({ token }) => {
  return await processing(DataProcessor.doSignInOnWebApp(token));
};

const doDecentralizedIssuance = async ({ token, encryptionKey, expiredTime }) => {
  if (expiredTime < moment().toDate().getTime()) {
    return new Error(global.i18n.t("AppTasksRegister_qrCodeIsExpired"));
  }
  return await processing(DataProcessor.doDecentralizedIssuance(token, encryptionKey));
};

const doDecentralizedTransfer = async ({ token, expiredTime }) => {
  if (expiredTime < moment().toDate().getTime()) {
    return new Error(global.i18n.t("AppTasksRegister_qrCodeIsExpired"));
  }
  return await processing(DataProcessor.doDecentralizedTransfer(token));
};

// ================================================================================================
// ================================================================================================
// ================================================================================================

let AppTasks = {
  doLogin,
  doLogout,
  doIssueFile,
  doIssueMusic,
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
  doMigrateWebAccount,
  doSignInOnWebApp,
  doDecentralizedIssuance,
  doDecentralizedTransfer,
};

let registeredTasks = {};

const registerTasks = () => {
  for (let taskKey in AppTasks) {
    if (taskKey && AppTasks[taskKey] && !registeredTasks[taskKey]) {
      AppRegistry.registerHeadlessTask(taskKey, () => {
        return (taskData) =>
          AppTasks[taskKey](taskData).then(result => {
            EventEmitterService.emit(`${EventEmitterService.events.APP_TASK}${taskData.taskId}`, { ok: true, result });
          }).catch(error => {
            EventEmitterService.emit(`${EventEmitterService.events.APP_TASK}${taskData.taskId}`, { ok: false, error });
          });
      });
    }
  }
}
export {
  registerTasks,
}