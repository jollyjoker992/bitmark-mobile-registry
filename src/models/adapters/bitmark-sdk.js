import { NativeModules } from 'react-native'
let SwiftBitmarkSDK = NativeModules.BitmarkSDK;

const newError = (reason, defaultMessage) => {
  let message = (reason && typeof (reason) === 'string') ? reason : defaultMessage;
  message = message || 'Internal application error!'
  return new Error(message);
}

const BitmarkSDK = {
  // return session id
  newAccount: (network, authentication, version = 'v2') => {
    return new Promise((resolve, reject) => {
      SwiftBitmarkSDK.newAccount(network, version, authentication, (ok, result) => {
        if (ok) {
          resolve(result);
        } else {
          reject(newError(result, global.i18n.t("BitmarkSDK_canNotCreateNewAccount")));
        }
      });
    });
  },
  newAccountFromPhraseWords: (phraseWords, network, authentication) => {
    return new Promise((resolve, reject) => {
      SwiftBitmarkSDK.newAccountFromPhraseWords(phraseWords, network, authentication, (ok, result) => {
        if (ok) {
          resolve(result);
        } else {
          reject(newError(result, global.i18n.t("BitmarkSDK_canNotRecoveryAccountFrom24Words")));
        }
      });
    });
  },
  requestSession: (network, message) => {
    return new Promise((resolve, reject) => {
      SwiftBitmarkSDK.requestSession(network, message, (ok, result) => {
        if (ok) {
          resolve(result);
        } else {
          reject(newError(result, global.i18n.t("BitmarkSDK_canNotRequestSession")));
        }
      });
    });
  },

  // one time
  removeAccount: () => {
    return new Promise((resolve, reject) => {
      SwiftBitmarkSDK.removeAccount((ok, result) => {
        if (ok) {
          resolve();
        } else {
          reject(newError(result, global.i18n.t("BitmarkSDK_canNotRemoveAccount")));
        }
      });
    });
  },

  // use session id
  disposeSession: (sessionId) => {
    return new Promise((resolve, reject) => {
      SwiftBitmarkSDK.disposeSession(sessionId, (ok, result) => {
        if (ok && sessionId) {
          resolve(sessionId);
        } else {
          reject(newError(result, global.i18n.t("BitmarkSDK_canNotDisposeSession")));
        }
      });
    });
  },
  accountInfo: (sessionId) => {
    return new Promise((resolve, reject) => {
      SwiftBitmarkSDK.accountInfo(sessionId, (ok, result, phraseWords) => {
        if (ok) {
          resolve({ bitmarkAccountNumber: result, phraseWords });
        } else {
          reject(newError(result, global.i18n.t("BitmarkSDK_canNotGetCurrentAccount")));
        }
      });
    });
  },
  signMessage: (message, sessionId) => {
    return new Promise((resolve, reject) => {
      SwiftBitmarkSDK.sign(sessionId, message, (ok, result) => {
        if (ok) {
          resolve(result);
        } else {
          reject(newError(result, global.i18n.t("BitmarkSDK_canNotSignMessage")));
        }
      });
    });
  },
  rickySignMessage: (messages, sessionId) => {
    return new Promise((resolve, reject) => {
      SwiftBitmarkSDK.rickySign(sessionId, messages, (ok, results) => {
        if (ok && results && results.length === messages.length) {
          resolve(results);
        } else {
          reject(new Error(results || global.i18n.t("BitmarkSDK_canNotSignMessage")));
        }
      });
    });
  },
  registerAccessPublicKey: (sessionId) => {
    return new Promise((resolve, reject) => {
      SwiftBitmarkSDK.registerAccessPublicKey(sessionId, (ok, result) => {
        if (ok && result) {
          resolve(result);
        } else {
          reject(newError(result, global.i18n.t("BitmarkSDK_canNotRegisterAccessPublicKey!")));
        }
      });
    });
  },

  createSessionData: (sessionId, encryptionKey) => {
    return new Promise((resolve, reject) => {
      SwiftBitmarkSDK.createSessionData(sessionId, encryptionKey, (ok, result) => {
        if (ok && result) {
          resolve(result);
        } else {
          reject(newError(result, global.i18n.t("BitmarkSDK_canNotCreateSessionData")));
        }
      });
    });
  },

  issueRecord: (sessionId, fingerprint, property_name, metadata, quantity) => {
    return new Promise((resolve, reject) => {
      SwiftBitmarkSDK.issueRecord(sessionId, { fingerprint, property_name, metadata, quantity }, (ok, result) => {
        if (ok && result) {
          resolve(result);
        } else {
          reject(newError(result, global.i18n.t("BitmarkSDK_canNotIssueBitmark")));
        }
      });
    });
  },

  issueFile: (sessionId, localFolderPath, filePath, propertyName, metadata, quantity, isPublicAsset) => {
    return new Promise((resolve, reject) => {
      SwiftBitmarkSDK.issueFile(sessionId, {
        url: filePath,
        property_name: propertyName,
        metadata,
        quantity,
        is_public_asset: !!isPublicAsset
      }, localFolderPath,
        (ok, bitmarkIds, assetId, sessionData, encryptedFilePath) => {
          console.log('issueFile :', ok, bitmarkIds, assetId, sessionData, encryptedFilePath);
          if (ok) {
            resolve({ bitmarkIds, assetId, sessionData, encryptedFilePath });
          } else {
            reject(new Error(bitmarkIds || 'Can not issue file!'));
          }
        });
    });
  },
  transferOneSignature: (sessionId, bitmarkId, address) => {
    return new Promise((resolve, reject) => {
      SwiftBitmarkSDK.transferOneSignature(sessionId, bitmarkId, address, (ok, results) => {
        if (ok) {
          resolve({ result: ok });
        } else {
          reject(new Error(results || global.i18n.t("BitmarkSDK_canNotTransferOneSignature")));
        }
      });
    });
  },

  issueThenTransferFile: (sessionId, filePath, property_name, metadata, receiver, extra_info) => {
    return new Promise((resolve, reject) => {
      SwiftBitmarkSDK.issueThenTransferFile(sessionId, {
        url: filePath,
        property_name,
        metadata,
        receiver,
        extra_info,
      }, (ok, result) => {
        if (ok && result) {
          resolve(result);
        } else {
          reject(newError(result, global.i18n.t("BitmarkSDK_canNotIssueThenTransferFile")));
        }
      });
    });
  },

  createAndSubmitTransferOffer: (sessionId, bitmarkId, receiver) => {
    return new Promise((resolve, reject) => {
      SwiftBitmarkSDK.createAndSubmitTransferOffer(sessionId, bitmarkId, receiver, (ok, result) => {
        if (ok && result) {
          resolve(result);
        } else {
          reject(newError(result, global.i18n.t("BitmarkSDK_canNotSignFirstSignatureForTransfer")));
        }
      });
    });
  },
  signForTransferOfferAndSubmit: (sessionId, txid, signature1, offerId, action) => {
    return new Promise((resolve, reject) => {
      SwiftBitmarkSDK.signForTransferOfferAndSubmit(sessionId, txid, signature1, offerId, action, (ok, result) => {
        if (ok) {
          resolve({ result: ok });
        } else {
          reject(newError(result, global.i18n.t("BitmarkSDK_canNotSignSecondSignatureForTransfer")));
        }
      });
    });
  },

  // don use session di
  tryPhraseWords: (phraseWords, network) => {
    return new Promise((resolve, reject) => {
      SwiftBitmarkSDK.tryPhraseWords(phraseWords, network, (ok, result, phraseWords) => {
        if (ok) {
          resolve({ bitmarkAccountNumber: result, phraseWords });
        } else {
          reject(newError(result, global.i18n.t("BitmarkSDK_canNotTry24Words")));
        }
      });
    });
  },

  getAssetInfo: (filePath) => {
    return new Promise((resolve, reject) => {
      SwiftBitmarkSDK.getAssetInfo(filePath, (ok, result, fingerprint) => {
        if (ok) {
          resolve({ fingerprint, id: result });
        } else {
          reject(newError(result, global.i18n.t("BitmarkSDK_canNotGetBasicAssetInformation")));
        }
      });
    });
  },
  validateMetadata: (metadata) => {
    return new Promise((resolve, reject) => {
      SwiftBitmarkSDK.validateMetadata(metadata, (ok, result) => {
        if (ok) {
          resolve();
        } else {
          reject(newError(result, global.i18n.t("BitmarkSDK_metadataInvalid")));
        }
      });
    });
  },
  validateAccountNumber: (accountNumber, network) => {
    return new Promise((resolve, reject) => {
      SwiftBitmarkSDK.validateAccountNumber(accountNumber, network, (ok, result) => {
        if (ok) {
          resolve();
        } else {
          reject(newError(result, global.i18n.t("BitmarkSDK_accountInvalid")));
        }
      });
    });
  },
  downloadBitmark: (sessionId, bitmarkId, downloadingFolderPath) => {
    return new Promise((resolve, reject) => {
      SwiftBitmarkSDK.downloadBitmark(sessionId, bitmarkId, downloadingFolderPath, (ok, result) => {
        if (ok) {
          resolve(result);
        } else {
          reject(newError(result, global.i18n.t("BitmarkSDK_canNotDownloadBitmark")));
        }
      });
    });
  },
};
export { BitmarkSDK };