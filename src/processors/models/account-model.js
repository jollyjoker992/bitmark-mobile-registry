import CookieManager from 'react-native-cookies';

import { BitmarkSDK } from './adapters';
import { config } from 'src/configs';

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

let doRegisterJWT = (accountNumber, timestamp, signature) => {
  return new Promise((resolve, reject) => {
    let statusCode;
    //TODO API
    let tempURL = `${config.mobile_server_url}/api/auth`;
    fetch(tempURL, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        requester: accountNumber,
        timestamp,
        signature,
      })
    }).then((response) => {
      statusCode = response.status;
      if (statusCode >= 500) {
        return response.text();
      }
      return response.json();
    }).then((data) => {
      if (statusCode >= 400) {
        return reject(new Error('Request failed!' + statusCode + ' - ' + JSON.stringify(data)));
      }
      resolve(data);
    }).catch(reject);
  });
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
      resolve(data.metadata.registry_bitmarks_migrated);
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
        metadata: { registry_bitmarks_migrated: status === undefined ? true : status },
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

  doRegisterJWT,
  doCheckMigration,
  doMarkMigration,
}

export {
  AccountModel,
}