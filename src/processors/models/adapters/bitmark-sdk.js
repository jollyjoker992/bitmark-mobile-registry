// import { NativeModules } from 'react-native'
// let SwiftBitmarkSDK = NativeModules.BitmarkSDK;

// const newError = (reason, defaultMessage) => {
//   let message = (reason && typeof (reason) === 'string') ? reason : defaultMessage;
//   message = message || 'Internal application error!'
//   return new Error(message);
// }

// const BitmarkSDK = {

// TODO 
//   createSessionData: (sessionId, encryptionKey) => {
//     return new Promise((resolve, reject) => {
//       SwiftBitmarkSDK.createSessionData(sessionId, encryptionKey, (ok, result) => {
//         if (ok && result) {
//           resolve(result);
//         } else {
//           reject(newError(result, global.i18n.t("BitmarkSDK_canNotCreateSessionData")));
//         }
//       });
//     });
//   },
// TODO 
//   issueRecord: (sessionId, fingerprint, property_name, metadata, quantity) => {
//     return new Promise((resolve, reject) => {
//       SwiftBitmarkSDK.issueRecord(sessionId, { fingerprint, property_name, metadata, quantity }, (ok, result) => {
//         if (ok && result) {
//           resolve(result);
//         } else {
//           reject(newError(result, global.i18n.t("BitmarkSDK_canNotIssueBitmark")));
//         } 
//       });
//     });
//   },

// };
// export { BitmarkSDK };


import { NativeModules, Platform } from 'react-native'

let NativeBitmarkSDK = Platform.select({
  ios: NativeModules.BitmarkSDKWrapper,
  android: NativeModules.BitmarkSDK,
});

const BitmarkSDK = {

  sdkInit: async (network) => {
    return await NativeBitmarkSDK.sdkInit(network);
  },
  // return session id
  newAccount: async (enableTouchFaceId) => {
    // todo call authenticate before call new account for case enableTouchFaceId
    return await NativeBitmarkSDK.createAccount(enableTouchFaceId);
  },
  newAccountFromPhraseWords: async (phraseWords, enableTouchFaceId) => {
    // todo call authenticate before call login for case enableTouchFaceId
    return await NativeBitmarkSDK.createAccountFromPhrase(phraseWords, enableTouchFaceId);
  },
  requestSession: async (message) => {
    try {
      if (Platform.OS === 'ios') await NativeBitmarkSDK.authenticate(message);
      return true;
    } catch (error) {
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
      recipient,
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
  giveAwayBitmark: async (asset_id, recipient) => {
    let list = await NativeBitmarkSDK.giveAwayBitmark({ asset_id, recipient, });
    return {
      bitmarkId: list[0],
      transferPayload: list[1],
    }
  },
  registerNewAsset: async (filePath, propertyName, metadata) => {
    console.log({
      url: filePath,
      property_name: propertyName,
      metadata,
    });
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