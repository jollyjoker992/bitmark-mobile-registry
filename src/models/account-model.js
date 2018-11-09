import CookieManager from 'react-native-cookies';

import { BitmarkSDK } from './adapters';
import { config } from '../configs';

const doCreateAccount = async (authentication) => {
  await CookieManager.clearAll();
  return await BitmarkSDK.newAccount(config.bitmark_network, authentication);
};

const doLogin = async (phraseWords, authentication) => {
  await CookieManager.clearAll();
  return await BitmarkSDK.newAccountFromPhraseWords(phraseWords, config.bitmark_network, authentication);
}

const doGetCurrentAccount = async (touchFaceIdSession) => {
  return await BitmarkSDK.accountInfo(touchFaceIdSession);
};

const doCheckPhraseWords = async (phraseWords) => {
  return await BitmarkSDK.tryPhraseWords(phraseWords, config.bitmark_network);
};

const doLogout = async () => {
  await CookieManager.clearAll();
  return await BitmarkSDK.removeAccount();
};

const doCheckMigration = (jwt) => {
  return new Promise((resolve) => {
    let statusCode;
    let tempURL = `${config.mobile_server_url}/api/accounts/metadata`;
    fetch(tempURL, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + jwt,
      },
    }).then((response) => {
      statusCode = response.status;
      if (statusCode >= 500) {
        return response.text();
      }
      return response.json();
    }).then((data) => {
      if (statusCode >= 400) {
        return resolve();
      }
      resolve(data.metadata.bitmarks_migrated);
    }).catch(() => resolve());
  });
};

const doMarkMigration = (jwt, status) => {
  return new Promise((resolve, reject) => {
    let statusCode;
    let tempURL = `${config.mobile_server_url}/api/accounts/metadata`;
    fetch(tempURL, {
      method: 'PUT',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + jwt,
      },
      body: JSON.stringify({
        metadata: { bitmarks_migrated: status === undefined ? true : status },
      })
    }).then((response) => {
      statusCode = response.status;
      if (statusCode >= 500) {
        return response.text();
      }
      return response.json();
    }).then((data) => {
      if (statusCode >= 400) {
        return resolve();
      }
      resolve(data);
    }).catch(reject);
  });
};


let AccountModel = {
  doGetCurrentAccount,
  doCheckPhraseWords,
  doCreateAccount,
  doLogin,
  doLogout,

  doCheckMigration,
  doMarkMigration,
}

export {
  AccountModel,
}