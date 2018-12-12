//
//  AssetEncryption.swift
//  Bitmark Registry
//
//  Created by Anh Nguyen on 12/7/18.
//  Copyright © 2018 Bitmark Inc. All rights reserved.
//

import Foundation
import BitmarkSDK
import TweetNacl

public struct SessionData {
  let encryptedDataKey: Data
  let dataKeyAlgorithm: String
  
  public init (encryptedDataKey: Data, dataKeyAlgorithm: String) {
    self.encryptedDataKey = encryptedDataKey
    self.dataKeyAlgorithm = dataKeyAlgorithm
  }
}

extension SessionData: Codable {
  
  enum SessionDataKeys: String, CodingKey {
    case encryptedDataKey = "enc_data_key"
    case dataKeyAlgorithm = "data_key_alg"
  }
  
  public init(from decoder: Decoder) throws {
    let container = try decoder.container(keyedBy: SessionDataKeys.self)
    self.init(encryptedDataKey: try container.decode(String.self, forKey: SessionDataKeys.encryptedDataKey).hexDecodedData,
              dataKeyAlgorithm: try container.decode(String.self, forKey: SessionDataKeys.dataKeyAlgorithm))
  }
  
  public func encode(to encoder: Encoder) throws {
    var container = encoder.container(keyedBy: SessionDataKeys.self)
    try container.encode(self.encryptedDataKey.hexEncodedString, forKey: .encryptedDataKey)
    try container.encode(self.dataKeyAlgorithm, forKey: .dataKeyAlgorithm)
  }
}

extension SessionData {
  static func createSessionData(account: Account, sessionKey: Data, forRecipient publicKey: Data) throws -> SessionData {
    let encryptedSessionKey = try account.encryptionKey.encrypt(message: sessionKey, receiverPublicKey: publicKey)
    
    return SessionData(encryptedDataKey: encryptedSessionKey,
                       dataKeyAlgorithm: "chacha20poly1305")
  }
}

struct AssetEncryption {
  
  let key: Data
  private let nonce = Data(bytes: Array<UInt8>(repeating: 0x00, count: 12))
  
  init() throws {
    var key = Data(count: 32)
    _ = key.withUnsafeMutableBytes {
      return SecRandomCopyBytes(kSecRandomDefault, 32, $0)
    }
    
    try self.init(key: key)
  }
  
  init(key: Data) throws {
    if key.count != 32 {
      throw("Invalid key length for chacha20, actual count: \(key.count)")
    }
    self.key = key
  }
  
  func encrypt(data: Data, signWithAccount account: Account, forRecipient publicKey: Data) throws -> (encryptedData: Data, sessionData: SessionData) {
    let encryptedData = try Chacha20Poly1305.seal(withKey: key, nonce: nonce, plainText: data, additionalData: nil)
    
    return (encryptedData,
            try SessionData.createSessionData(account: account,
                                              sessionKey: key,
                                              forRecipient: publicKey))
  }
  
  func decypt(data: Data) throws -> Data {
    return try Chacha20Poly1305.open(withKey: key, nonce: nonce, cipherText: data, additionalData: nil)
  }
}

extension AssetEncryption {
  init(fromSessionData sessionData: SessionData, account: Account, senderEncryptionPublicKey: Data) throws {
    // Decrypt message
    let key = try account.encryptionKey.decrypt(cipher: sessionData.encryptedDataKey, senderPublicKey: senderEncryptionPublicKey)
    try self.init(key: key)
  }
}
