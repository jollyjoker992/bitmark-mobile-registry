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


import { NativeModules } from 'react-native'
let SwiftBitmarkSDK = NativeModules.BitmarkSDKWrapper;

const BitmarkSDK = {

  sdkInit: async (network) => {
    return await SwiftBitmarkSDK.sdkInit(network);
  },
  // return session id
  newAccount: async (enableTouchFaceId) => {
    // todo call authenticate before call new account for case enableTouchFaceId
    return await SwiftBitmarkSDK.createAccount(enableTouchFaceId);
  },
  newAccountFromPhraseWords: async (phraseWords, enableTouchFaceId) => {
    // todo call authenticate before call login for case enableTouchFaceId
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
  issueFile: async (filePath, propertyName, metadata, quantity) => {
    let list = await SwiftBitmarkSDK.issueFile({
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
  transferOneSignature: async (bitmarkId, address) => {
    return await SwiftBitmarkSDK.transferOneSignature({
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

  signForTransferOfferAndSubmit: async (action, bitmark_id, ) => {
    return await SwiftBitmarkSDK.signForTransferOfferAndSubmit({
      action, bitmark_id,
    });
  },

  encryptFile: async (filePath, recipient, outputFilePath) => {
    return await SwiftBitmarkSDK.encryptFile({
      file_path: filePath,
      recipient,
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
  giveAwayBitmark: async (asset_id, recipient) => {
    let list = await SwiftBitmarkSDK.giveAwayBitmark({ asset_id, recipient, });
    return {
      bitmarkId: list[0],
      transferPayload: list[1],
    }
  }

};
export { BitmarkSDK };