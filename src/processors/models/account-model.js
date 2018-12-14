import CookieManager from 'react-native-cookies';

import { BitmarkSDK } from './adapters';
import { config } from 'src/configs';

const doCreateAccount = async (authentication) => {
  await CookieManager.clearAll();
  return await BitmarkSDK.newAccount(authentication);
};

const doLogin = async (phraseWords, authentication) => {
  await CookieManager.clearAll();
  return await BitmarkSDK.newAccountFromPhraseWords(phraseWords, authentication);
}

const doGetCurrentAccount = async () => {
  return await BitmarkSDK.accountInfo();
};

const doCheckPhraseWords = async (phraseWords) => {
  return await BitmarkSDK.tryPhrase(phraseWords);
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

const doRegisterEncryptionPublicKey = (accountNumber, encryptionPublicKey, signature) => {
  return new Promise((resolve, reject) => {
    let statusCode;
    fetch(`${config.api_server_url}/v1/encryption_keys/${accountNumber}`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        encryption_pubkey: encryptionPublicKey,
        signature,
      })
    }).then((response) => {
      statusCode = response.status;
      if (statusCode < 400) {
        return response.json();
      }
      return response.text();
    }).then((data) => {
      if (statusCode >= 400) {
        return reject(new Error(`doRegisterEncryptionPublicKey error :` + JSON.stringify(data)));
      }
      resolve(data.claim_requests);
    }).catch(reject);
  });
};

const doGetEncryptionPublicKey = (accountNumber) => {
  return new Promise((resolve) => {
    let statusCode;
    fetch(`${config.key_account_server_url}${accountNumber}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    }).then((response) => {
      statusCode = response.status;
      if (statusCode < 400) {
        return response.json();
      }
      return response.text();
    }).then((data) => {
      if (statusCode >= 400) {
        resolve();
      }
      resolve(data ? data.encryption_pubkey : null);
    }).catch(() => {
      resolve();
    });
  });
};

const doGetIdentities = () => {
  return new Promise((resolve) => {
    let statusCode;
    fetch(`${config.bitmark_profile_server}/s/account/identities`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    }).then((response) => {
      statusCode = response.status;
      if (statusCode < 400) {
        return response.json();
      }
      return response.text();
    }).then((data) => {
      if (statusCode >= 400) {
        resolve();
      }
      resolve(data ? data.identities : null);
    }).catch(() => {
      resolve();
    });
  });
};




let AccountModel = {
  doGetCurrentAccount,
  doCheckPhraseWords,
  doCreateAccount,
  doLogin,
  doLogout,

  doRegisterJWT,
  doGetEncryptionPublicKey,
  doRegisterEncryptionPublicKey,
  doGetIdentities,
}

export {
  AccountModel,
}