//
//  BItmarkSDK.swift
//  BitmarkSDK
//
//  Created by Anh Nguyen on 8/24/18.
//  Copyright © 2018 Bitmark. All rights reserved.
//

import Foundation

public struct SDKConfig {
    public let apiToken: String
    public let network: Network
    public let urlSession: URLSession
    public let logger: SDKLogger
    
    public init(apiToken: String, network: Network, urlSession: URLSession? = nil, logger: SDKLogger? = nil) {
        self.apiToken = apiToken
        self.network = network
        self.urlSession = urlSession ?? URLSession.shared
        self.logger = logger ?? DefaultSDKLogger()
    }
}

var globalConfig: SDKConfig = SDKConfig(apiToken: "", network: .livenet, urlSession: URLSession.shared)

public func initialize(config: SDKConfig) {
    globalConfig = config
}

public enum SDKLogLevel: String {
    case debug = "DEBUG"
    case info = "INFO"
    case warn = "WARN"
    case error = "ERROR"
}
public protocol SDKLogger {
    func log(level: SDKLogLevel, message: String)
}

private struct DefaultSDKLogger: SDKLogger {
    func log(level: SDKLogLevel, message: String) {
        print("[\(level.rawValue)]\t\(message)")
    }
}
