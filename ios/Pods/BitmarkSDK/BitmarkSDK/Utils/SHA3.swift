//
//  SHA3.swift
//  BitmarkSDK
//
//  Created by Anh Nguyen on 10/5/18.
//  Copyright © 2018 Bitmark. All rights reserved.
//

import Foundation
import tinysha3

struct SHA3Compute {
    static func computeSHA3(data: Data, length: Int) -> Data {
        let byteLength = length / 8
        var output = Data(count: byteLength)
        
        output.withUnsafeMutableBytes({ (outputPointer: UnsafeMutablePointer<UInt8>) -> Void in
            return data.withUnsafeBytes({ (dataPointer: UnsafePointer<UInt8>) -> Void in
                sha3(dataPointer, data.count, outputPointer, Int32(byteLength))
            })
        })
        
        return output
    }
    
    static func computeSHAKE256(data: Data, repeatCount: Int, length: Int, count: Int) -> Data {
        var output = Data(count: length * count)
        
        output.withUnsafeMutableBytes({ (outputPointer: UnsafeMutablePointer<UInt8>) -> Void in
            return data.withUnsafeBytes({ (dataPointer: UnsafePointer<UInt8>) -> Void in
                shake256(dataPointer, Int32(repeatCount), data.count, outputPointer, Int32(length), Int32(count))
            })
        })
        
        return output
    }
}

public extension Data {
    public func sha3(length: Int) -> Data {
        return SHA3Compute.computeSHA3(data: self, length: length)
    }
}
