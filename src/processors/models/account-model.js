import CookieManager from 'react-native-cookies';
import PushNotification from 'react-native-push-notification';

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
    fetch(`${config.key_account_server_url}/${accountNumber}`, {
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

const doRegisterNotificationInfo = (accountNumber, timestamp, signature, platform, token, client, intercom_user_id) => {
  return new Promise((resolve, reject) => {
    let statusCode;
    let tempURL = `${config.mobile_server_url}/api/push_uuids`;
    let headers = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    };
    if (accountNumber) {
      headers.requester = accountNumber;
      headers.timestamp = timestamp;
      headers.signature = signature;
    }
    fetch(tempURL, {
      method: 'POST',
      headers,
      body: JSON.stringify({ platform, token, client, intercom_user_id }),
    }).then((response) => {
      statusCode = response.status;
      if (statusCode >= 500) {
        return response.text();
      }
      return response.json();
    }).then((data) => {
      if (statusCode >= 400) {
        return reject(new Error('doRegisterNotificationInfo error :' + JSON.stringify(data)));
      }
      resolve(data);
    }).catch(reject);
  });
};

const doDeregisterNotificationInfo = (accountNumber, timestamp, signature, token) => {
  return new Promise((resolve, reject) => {
    let statusCode;
    let tempURL = `${config.mobile_server_url}/api/push_uuids/${token}`;
    fetch(tempURL, {
      method: 'DELETE',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        requester: accountNumber,
        timestamp,
        signature,
      },
    }).then((response) => {
      statusCode = response.status;
      if (statusCode >= 500) {
        return response.text();
      }
      return response.json();
    }).then((data) => {
      if (statusCode >= 400) {
        return reject(new Error('doDeregisterNotificationInfo error :' + JSON.stringify(data)));
      }
      resolve(data);
    }).catch(reject);
  });
};

const doTryRegisterAccount = (accountNumber, timestamp, signature) => {
  return new Promise((resolve) => {
    let statusCode;
    let tempURL = `${config.mobile_server_url}/api/accounts`;
    fetch(tempURL, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        requester: accountNumber,
        timestamp,
        signature,
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
      resolve(data);
    }).catch(() => resolve());
  });
};

const doTryGetAppVersion = () => {
  return new Promise((resolve) => {
    let statusCode;
    let tempURL = `${config.mobile_server_url}/api/app-versions/registry`;
    fetch(tempURL, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    }).then((response) => {
      statusCode = response.status;
      return response.json();
    }).then((data) => {
      if (statusCode >= 400) {
        return resolve();
      }
      resolve(data);
    }).catch(() => resolve());
  });
};

let configureNotifications = (onRegister, onNotification) => {
  PushNotification.configure({
    onRegister: onRegister,
    onNotification: onNotification,
    senderID: 75694256790,
    requestPermissions: !!config.isAndroid,
  });
};

let doRequestNotificationPermissions = async () => {
  return await PushNotification.requestPermissions();
};

let setApplicationIconBadgeNumber = (number) => {
  return PushNotification.setApplicationIconBadgeNumber(number);
};



let AccountModel = {
  doGetCurrentAccount,
  doCheckPhraseWords,
  doCreateAccount,
  doLogin,
  doLogout,
  doTryGetAppVersion,

  doRegisterJWT,
  doGetEncryptionPublicKey,
  doRegisterEncryptionPublicKey,
  doGetIdentities,

  doTryRegisterAccount,
  doRegisterNotificationInfo,
  doDeregisterNotificationInfo,
  configureNotifications,
  doRequestNotificationPermissions,
  setApplicationIconBadgeNumber,
}

export {
  AccountModel,
}