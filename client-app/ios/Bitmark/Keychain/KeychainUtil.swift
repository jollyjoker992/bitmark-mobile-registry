//
//  KeychainUtil.swift
//  Bitmark
//
//  Created by Anh Nguyen on 1/29/18.
//  Copyright © 2018 Bitmark Inc. All rights reserved.
//

import Foundation
import KeychainAccess

struct KeychainUtil {

  private static let bitmarkSeedCoreKey = "bitmark_core"
  private static let authenticationKey = "authentication"
  
  static func getKeychain(reason: String, authentication: Bool) throws -> Keychain {
    #if (arch(i386) || arch(x86_64)) && os(iOS) && authentication
      let semaphore = DispatchSemaphore(value: 0)
      var cancel = false
      
      let alert = UIAlertController(title: "Keychain access request", message: reason, preferredStyle: .alert)
      alert.addAction(UIAlertAction(title: "Ok", style: .default, handler: { _ in
        semaphore.signal()
      }))
      alert.addAction(UIAlertAction(title: "Cancel", style: .cancel, handler: { _ in
        cancel = true
        semaphore.signal()
      }))
    
      UIApplication.shared.delegate?.window??.rootViewController?.present(alert, animated: true, completion: nil)
    
      _ = semaphore.wait(timeout: .distantFuture)
    
      alert.dismiss(animated: true, completion: nil)
      
      if cancel {
        throw KeychainAccess.Status.userCanceled
      }
    #endif
    
    guard let bundleIdentifier = Bundle.main.bundleIdentifier else {
        throw("Cannot get app information")
    }

    if authentication {
      return Keychain(service: bundleIdentifier) // Z5CE7A3A7N is the app prefix
        .accessibility(.whenPasscodeSetThisDeviceOnly, authenticationPolicy: .userPresence)
        .authenticationPrompt(reason)
    } else {
      return Keychain(service: bundleIdentifier)
    }
  }
  
  static func saveCore(_ core: Data, authentication: Bool) throws {
    try DispatchQueue.main.sync {
      UserDefaults().set(authentication, forKey: authenticationKey)
      try getKeychain(reason: "Touch/Face ID or a passcode is required to authorize your transactions.", authentication: authentication)
        .set(core, key: bitmarkSeedCoreKey)
    }
  }
  
  static func getCore(reason: String) throws -> Data? {
    return try DispatchQueue.main.sync {
      let authentication = UserDefaults().bool(forKey: authenticationKey)
      return try getKeychain(reason: reason, authentication: authentication)
        .getData(bitmarkSeedCoreKey)
    }

  }
  
  static func clearCore() throws {
    try DispatchQueue.main.sync {
      let authentication = UserDefaults().bool(forKey: authenticationKey)
      try getKeychain(reason: "Bitmark app would like to remove your account from keychain.", authentication: authentication)
        .remove(bitmarkSeedCoreKey)
      UserDefaults().removeObject(forKey: authenticationKey)
    }
  }
}
