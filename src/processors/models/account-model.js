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


let AccountModel = {
  doGetCurrentAccount,
  doCheckPhraseWords,
  doCreateAccount,
  doLogin,
  doLogout,

  doRegisterJWT,
}

export {
  AccountModel,
}