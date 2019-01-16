import moment from 'moment';

import { FaceTouchId, BitmarkSDK } from './adapters'
import { AsyncStorage } from 'react-native';
import { config } from 'src/configs';

const KEYS = {
  APP_INFORMATION: 'app-information',

  USER_INFORMATION: 'bitmark-app',

  //original data
  USER_DATA_LOCAL_BITMARKS: 'user-data:local-bitmarks',
  USER_DATA_IFTTT_INFORMATION: 'user-data:ifttt-information',
  USER_DATA_CLAIM_REQUEST: 'user-data:claim-request',
  USER_DATA_TRANSACTIONS: 'user-data:transactions',
  USER_DATA_TRANSFER_OFFERS: 'user-data:transfer-offers',

  // data can be change
  USER_DATA_TRANSACTIONS_ACTION_REQUIRED: 'user-data:transaction-action-required',
  USER_DATA_TRANSACTIONS_HISTORY: 'user-data:transaction-history',

  TEST_RECOVERY_PHASE_ACTION_REQUIRED: 'test-recovery-phase-action-required'
};

// ================================================================================================
// ================================================================================================
// ================================================================================================
const doSetLocalData = (localDataKey, data) => {
  localDataKey = localDataKey || KEYS.USER_INFORMATION;
  data = data || {};
  return new Promise((resolve, reject) => {
    AsyncStorage.setItem(localDataKey, JSON.stringify(data), (error) => {
      if (error) {
        return reject(error);
      }
      resolve();
    });
  });
};
const doGetLocalData = (localDataKey) => {
  localDataKey = localDataKey || KEYS.USER_INFORMATION;
  return new Promise((resolve, reject) => {
    AsyncStorage.getItem(localDataKey, (error, data) => {
      if (error) {
        return reject(error);
      }
      let localData;
      try {
        localData = JSON.parse(data);
      } catch (error) {
        //
      }
      resolve(localData);
    });
  });
};
const doRemoveLocalData = (localDataKey) => {
  return new Promise((resolve, reject) => {
    AsyncStorage.removeItem(localDataKey, (error) => {
      if (error) {
        return reject(error);
      }
      resolve();
    });
  });
};
// ================================================================================================
const doCheckPasscodeAndFaceTouchId = async () => {
  return await FaceTouchId.isSupported();
};
// ================================================================================================

const doCreateSignatureData = async () => {
  let timestamp = moment().toDate().getTime() + '';
  let signatures = await BitmarkSDK.signMessages([timestamp]);
  return { timestamp, signature: signatures[0] };
};

// ================================================================================================
// ================================================================================================
// ================================================================================================
const doTrackEvent = (tags, fields) => {
  fields = fields || {};
  fields.hit = 1;
  return new Promise((resolve) => {
    let statusCode;
    let bitmarkUrl = config.mobile_server_url + `/api/metrics`;
    fetch(bitmarkUrl, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        metrics: [{
          tags, fields,
        }]
      })
    }).then((response) => {
      statusCode = response.status;
      return response.json();
    }).then((data) => {
      if (statusCode >= 400) {
        console.log('doTrackEvent error :', data);
      }
      resolve(data);
    }).catch((error) => {
      console.log('doTrackEvent error :', error);
    });
  });
};
// ================================================================================================
// ================================================================================================
// ================================================================================================

let CommonModel = {
  KEYS,
  doCheckPasscodeAndFaceTouchId,
  doSetLocalData,
  doGetLocalData,
  doRemoveLocalData,
  doCreateSignatureData,
  doTrackEvent,
}

export {
  CommonModel
}