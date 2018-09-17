import CookieManager from 'react-native-cookies';

import { BitmarkSDK } from './adapters';
import { config } from '../configs';

const doCreateAccount = async (authentication) => {
  await CookieManager.clearAll();
  return await BitmarkSDK.newAccount(config.bitmark_network, authentication);
};

const doLogin = async (phrase24Words, authentication) => {
  await CookieManager.clearAll();
  return await BitmarkSDK.newAccountFrom24Words(phrase24Words, config.bitmark_network, authentication);
}

const doGetCurrentAccount = async (touchFaceIdSession) => {
  return await BitmarkSDK.accountInfo(touchFaceIdSession);
};

const doCheck24Words = async (phrase24Words) => {
  return await BitmarkSDK.try24Words(phrase24Words, config.bitmark_network);
};

const doLogout = async () => {
  await CookieManager.clearAll();
  return await BitmarkSDK.removeAccount();
};

let AccountModel = {
  doGetCurrentAccount,
  doCheck24Words,
  doCreateAccount,
  doLogin,
  doLogout,
}

export {
  AccountModel,
}