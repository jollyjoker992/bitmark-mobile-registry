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

let AccountModel = {
  doGetCurrentAccount,
  doCheckPhraseWords,
  doCreateAccount,
  doLogin,
  doLogout,
}

export {
  AccountModel,
}