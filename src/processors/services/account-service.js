import { AccountModel, CommonModel, BitmarkSDK, UserModel } from '../models';
import { config } from 'src/configs';

// ================================================================================================\
const doGetCurrentAccount = async () => {
  let userInfo = await AccountModel.doGetCurrentAccount();
  let userInformation = { bitmarkAccountNumber: userInfo.bitmarkAccountNumber };
  await UserModel.doUpdateUserInfo(userInformation);
  return userInformation;
}

const doCreateSignatureData = async () => {
  let signatureData = await CommonModel.doCreateSignatureData();
  if (!signatureData) {
    return null;
  }
  let userInfo = await UserModel.doGetCurrentUser();
  signatureData.account_number = userInfo.bitmarkAccountNumber;
  return signatureData;
};

const doValidateBitmarkAccountNumber = async (accountNumber) => {
  let userInfo = await UserModel.doGetCurrentUser();
  if (userInfo.bitmarkAccountNumber === accountNumber) {
    throw new Error('Can not transfer for current user!');
  }
  return await BitmarkSDK.validateAccountNumber(accountNumber, config.bitmark_network);
}

// ================================================================================================
// ================================================================================================

let AccountService = {
  doGetCurrentAccount,
  doCreateSignatureData,
  doValidateBitmarkAccountNumber,
};

export { AccountService };