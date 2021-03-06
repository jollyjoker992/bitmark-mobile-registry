import moment from 'moment';

import { CommonModel, UserModel, BitmarkSDK } from "./models";
import { CacheData } from "./caches";
import { config } from 'src/configs';
import { Actions } from 'react-native-router-flux';
import { runPromiseWithoutError } from 'src/utils';

let mapModalDisplayData = {};
const ModalDisplayKeyIndex = {
  what_new: 1,
  claim_asset: 2,
};

let isDisplayingModal = (keyIndex) => {
  return CacheData.keyIndexModalDisplaying === keyIndex && !!mapModalDisplayData[keyIndex];
};

let checkDisplayModal = () => {
  if (CacheData.keyIndexModalDisplaying > 0 && !mapModalDisplayData[CacheData.keyIndexModalDisplaying]) {
    CacheData.keyIndexModalDisplaying = 0;
  }
  let keyIndexArray = Object.keys(mapModalDisplayData).sort();
  for (let index = 0; index < keyIndexArray.length; index++) {
    let keyIndex = parseInt(keyIndexArray[index]);
    let data = mapModalDisplayData[keyIndex];
    if (data && (CacheData.keyIndexModalDisplaying <= 0 || CacheData.keyIndexModalDisplaying > keyIndex)) {
      if (keyIndex === ModalDisplayKeyIndex.what_new && CacheData.mountedRouter) {
        Actions.whatNew();
        CacheData.keyIndexModalDisplaying = keyIndex;
        break;
      } else if (keyIndex === ModalDisplayKeyIndex.claim_asset && CacheData.mountedRouter && CacheData.passTouchFaceId &&
        CacheData.userInformation && CacheData.userInformation.bitmarkAccountNumber && data.asset) {
        Actions.propertyDetail({ asset: data.asset, claimToAccount: data.issuer || data.asset.registrant });
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

const doGetAppInformation = async () => {
  return await CommonModel.doGetLocalData(CommonModel.KEYS.APP_INFORMATION);
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

let doCheckHaveCodePushUpdate = () => {
  return new Promise((resolve) => {
    if (config.bundleId === 'com.bitmark.registry.beta') {
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
const setMountedRouter = (status = true) => {
  CacheData.mountedRouter = status;
  checkDisplayModal();
};
let doMarkDisplayedWhatNewInformation = async () => {
  let appInfo = await doGetAppInformation();
  appInfo = appInfo || {};
  appInfo.displayedWhatNewInformation = config.version;
  updateModal(ModalDisplayKeyIndex.what_new);
  await CommonModel.doSetLocalData(CommonModel.KEYS.APP_INFORMATION, appInfo);
};
const doDisplayedWhatNewInformation = async () => {
  updateModal(ModalDisplayKeyIndex.what_new, true);
};

const doMarkDoneSendClaimRequest = async () => {
  updateModal(ModalDisplayKeyIndex.claim_asset);
};

const doViewSendIncomingClaimRequest = async (asset, issuer) => {
  updateModal(ModalDisplayKeyIndex.claim_asset, { asset, issuer });
};

const getDisplayedAccount = (accountNumber, fullAccountNumber) => {
  if (!accountNumber) {
    return '';
  }
  if (CacheData.identities && CacheData.identities[accountNumber]) {
    return CacheData.identities[accountNumber].name;
  } else if (accountNumber === CacheData.userInformation.bitmarkAccountNumber) {
    return global.i18n.t("PropertiesComponent_you");
  } else if (!fullAccountNumber) {
    return `[${accountNumber.substring(0, 4)}...${accountNumber.substring(accountNumber.length - 4, accountNumber.length)}]`;
  } else {
    return accountNumber;
  }
};

let queueCheckPassTouchFaceId = [];
const doCheckPassTouchFaceId = () => {
  return new Promise((resolve) => {
    if (CacheData.passTouchFaceId) {
      return resolve(CacheData.passTouchFaceId);
    }
    queueCheckPassTouchFaceId.push(resolve);
    if (queueCheckPassTouchFaceId.length > 1) {
      return;
    }
    runPromiseWithoutError(BitmarkSDK.requestSession(i18n.t('FaceTouchId_doOpenApp'))).then(result => {
      CacheData.passTouchFaceId = result && !result.error;
      let tempQueue = queueCheckPassTouchFaceId;
      queueCheckPassTouchFaceId = [];
      for (let resolveItem of tempQueue) {
        resolveItem(CacheData.passTouchFaceId);
      }
    });
  });
};

let CommonProcessor = {
  doGetAppInformation,
  doMarkRequestedNotification,
  doMetricOnScreen,
  doCheckHaveCodePushUpdate,

  ModalDisplayKeyIndex,
  isDisplayingModal,
  checkDisplayModal,
  updateModal,
  setMountedRouter,
  doMarkDisplayedWhatNewInformation,
  doDisplayedWhatNewInformation,
  doMarkDoneSendClaimRequest,
  doViewSendIncomingClaimRequest,

  doCheckPassTouchFaceId,

  getDisplayedAccount,
};
export { CommonProcessor };