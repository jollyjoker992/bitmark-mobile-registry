
import { NativeModules } from 'react-native'
let SwiftBitmarkSDK = NativeModules.BitmarkSDKWrapper;

const BitmarkSDK = {

  sdkInit: async (network) => {
    return await SwiftBitmarkSDK.sdkInit(network);
  },
  // return session id
  newAccount: async (enableTouchFaceId) => {
    return await SwiftBitmarkSDK.createAccount(enableTouchFaceId);
  },
  newAccountFromPhraseWords: async (phraseWords, enableTouchFaceId) => {
    return await SwiftBitmarkSDK.createAccountFromPhrase(phraseWords, enableTouchFaceId);
  },
  requestSession: async (message) => {
    try {
      await SwiftBitmarkSDK.authenticate(message);
      return true;
    } catch (error) {
      return null;
    }
  },

  // one time
  removeAccount: async () => {
    return await SwiftBitmarkSDK.removeAccount();
  },

  accountInfo: async () => {
    let list = await SwiftBitmarkSDK.accountInfo();
    return {
      bitmarkAccountNumber: list[0],
      phraseWords: list[1],
      encryptionPublicKey: list[3],
    };
  },
  storeFileSecurely: async (filePath, desFilePath) => {
    return await SwiftBitmarkSDK.storeFileSecurely(filePath, desFilePath);
  },
  signMessages: async (messages) => {
    return await SwiftBitmarkSDK.sign(messages);
  },
  signHexData: async (messages) => {
    return await SwiftBitmarkSDK.signHexData(messages);
  },
  issue: async (filePath, propertyName, metadata, quantity) => {
    let list = await SwiftBitmarkSDK.issue({
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
    return await SwiftBitmarkSDK.transfer({
      address, bitmark_id: bitmarkId
    });
  },

  // don use session di
  tryPhrase: async (phraseWords) => {
    return await SwiftBitmarkSDK.tryPhrase(phraseWords);
  },

  getAssetInfo: async (filePath) => {
    let list = await SwiftBitmarkSDK.getAssetInfo(filePath);
    return { id: list[0], fingerprint: list[1] };
  },
  validateMetadata: async (metadata) => {
    try {
      await SwiftBitmarkSDK.validateMetadata(metadata);
      return true;
    } catch (error) {
      return false;
    }
  },
  validateAccountNumber: async (accountNumber) => {
    return await SwiftBitmarkSDK.validateAccountNumber(accountNumber);
  },

  response: async (action, bitmark_id, ) => {
    return await SwiftBitmarkSDK.response({
      action, bitmark_id,
    });
  },

  encryptFile: async (filePath, outputFilePath) => {
    return await SwiftBitmarkSDK.encryptFile({
      file_path: filePath,
      output_file_path: outputFilePath,
    });
  },
  decryptFile: async (encryptedFilePath, sessionData, sender, outputFilePath) => {
    return await SwiftBitmarkSDK.decryptFile({
      encrypted_file_path: encryptedFilePath,
      session_data: sessionData,
      sender: sender,
      output_file_path: outputFilePath,
    });
  },
  encryptSessionData: async (sessionData, receiverPublicEncryptionKey) => {
    return await SwiftBitmarkSDK.encryptSessionData({
      session_data: sessionData,
      receiver_pub_key: receiverPublicEncryptionKey,
    });
  },
  giveAwayBitmark: async (asset_id, recipient) => {
    let list = await SwiftBitmarkSDK.giveAwayBitmark({ asset_id, recipient, });
    return {
      bitmarkId: list[0],
      transferPayload: list[1],
    }
  },
  registerNewAsset: async (filePath, propertyName, metadata) => {
    let list = await SwiftBitmarkSDK.registerNewAsset({
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