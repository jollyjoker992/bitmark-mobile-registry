
import { NativeModules, Platform } from 'react-native'
import { config } from 'src/configs';
let AuthenticationWrapper = NativeModules.Authentication;
let NativeBitmarkSDK = Platform.select({
  ios: NativeModules.BitmarkSDKWrapper,
  android: NativeModules.BitmarkSDK,
});

const BitmarkSDK = {

  sdkInit: (network) => {
    return new Promise((resolve) => {
      NativeBitmarkSDK.sdkInit(network).then(resolve).catch(() => resolve());
    });
  },
  // return session id
  newAccount: async (enableTouchFaceId) => {
    let result = await NativeBitmarkSDK.createAccount(enableTouchFaceId);
    return result;
  },
  newAccountFromPhraseWords: async (phraseWords, enableTouchFaceId) => {
    let result = await NativeBitmarkSDK.createAccountFromPhrase(phraseWords, enableTouchFaceId);
    return result;
  },
  requestSession: async (message) => {
    try {
      if (config.isIPhone) {
        await NativeBitmarkSDK.authenticate(message);
        return true;
      } else {
        return await AuthenticationWrapper.authenticate(message);
      }
    } catch (error) {
      console.log('requestSession :', error);
      // TODO
      return null;
    }
  },

  // one time
  removeAccount: async () => {
    return await NativeBitmarkSDK.removeAccount();
  },

  accountInfo: async () => {
    let list = await NativeBitmarkSDK.accountInfo();
    return {
      bitmarkAccountNumber: list[0],
      phraseWords: list[1],
      encryptionPublicKey: list[3],
    };
  },
  storeFileSecurely: async (filePath, desFilePath) => {
    return await NativeBitmarkSDK.storeFileSecurely(filePath, desFilePath);
  },
  signMessages: async (messages) => {
    return await NativeBitmarkSDK.sign(messages);
  },
  signHexData: async (messages) => {
    return await NativeBitmarkSDK.signHexData(messages);
  },
  issue: async (filePath, propertyName, metadata, quantity) => {
    let list = await NativeBitmarkSDK.issue({
      url: filePath,
      property_name: propertyName,
      metadata,
      quantity,
    });
    return {
      bitmarkIds: list[0],
      assetId: list[1],
    };
  },
  transfer: async (bitmarkId, address) => {
    return await NativeBitmarkSDK.transfer({
      address, bitmark_id: bitmarkId
    });
  },

  // don use session di
  tryPhrase: async (phraseWords) => {
    return await NativeBitmarkSDK.tryPhrase(phraseWords);
  },

  getAssetInfo: async (filePath) => {
    let list = await NativeBitmarkSDK.getAssetInfo(filePath);
    return { id: list[0], fingerprint: list[1] };
  },
  validateMetadata: async (metadata) => {
    try {
      await NativeBitmarkSDK.validateMetadata(metadata);
      return true;
    } catch (error) {
      return false;
    }
  },
  validateAccountNumber: async (accountNumber) => {
    return await NativeBitmarkSDK.validateAccountNumber(accountNumber);
  },

  response: async (action, bitmark_id, ) => {
    return await NativeBitmarkSDK.response({
      action, bitmark_id,
    });
  },

  encryptFile: async (filePath, recipient, outputFilePath) => {
    return await NativeBitmarkSDK.encryptFile({
      file_path: filePath,
      output_file_path: outputFilePath,
    });
  },
  decryptFile: async (encryptedFilePath, sessionData, sender, outputFilePath) => {
    return await NativeBitmarkSDK.decryptFile({
      encrypted_file_path: encryptedFilePath,
      session_data: sessionData,
      sender: sender,
      output_file_path: outputFilePath,
    });
  },
  encryptSessionData: async (sessionData, receiverPublicEncryptionKey) => {
    return await NativeBitmarkSDK.encryptSessionData({
      session_data: sessionData,
      receiver_pub_key: receiverPublicEncryptionKey,
    });
  },
  giveAwayBitmark: async (asset_id, recipient) => {
    let list = await NativeBitmarkSDK.giveAwayBitmark({ asset_id, recipient, });
    return {
      bitmarkId: list[0],
      transferPayload: list[1],
    }
  },
  registerNewAsset: async (filePath, propertyName, metadata) => {
    let list = await NativeBitmarkSDK.registerNewAsset({
      url: filePath,
      property_name: propertyName,
      metadata,
    });
    return {
      bitmarkId: list[0],
      assetId: list[1],
    };
  },

};
export { BitmarkSDK };