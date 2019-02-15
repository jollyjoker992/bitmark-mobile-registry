package com.bitmark.registry.modules.sdk;

import com.bitmark.registry.utils.error.NativeModuleException;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.ReadableMap;

public interface BitmarkSDKExposable {

    void sdkInit(String network, Promise promise);

    void createAccount(Boolean authentication, Promise promise);

    void createAccountFromPhrase(ReadableArray phraseWords, Boolean authentication,
                                 Promise promise);

    void removeAccount(Promise promise) throws NativeModuleException;

    void accountInfo(Promise promise) throws NativeModuleException;

    void sign(ReadableArray messages, Promise promise) throws NativeModuleException;

    void signHexData(ReadableArray messages, Promise promise) throws NativeModuleException;

    void issue(ReadableMap params, Promise promise) throws NativeModuleException;

    void giveAwayBitmark(ReadableMap params, Promise promise) throws NativeModuleException;

    void transfer(ReadableMap params, Promise promise) throws NativeModuleException;

    void offer(ReadableMap params, Promise promise) throws NativeModuleException;

    void response(ReadableMap params, Promise promise) throws NativeModuleException;

    void tryPhrase(ReadableArray phraseWords, Promise promise);

    void getAssetInfo(String filePath, Promise promise) throws NativeModuleException;

    void validateMetadata(ReadableMap metadata, Promise promise);

    void validateAccountNumber(String accountNumber, Promise promise);

    void getBitmarks(ReadableMap params, Promise promise);

    void getBitmark(ReadableMap params, Promise promise);

    void getAsset(String id, Promise promise);

    void getAssets(ReadableMap params, Promise promise);

    void getTx(ReadableMap params, Promise promise);

    void getTxs(ReadableMap params, Promise promise);

    void encryptFile(ReadableMap params, Promise promise) throws NativeModuleException;

    void decryptFile(ReadableMap params, Promise promise) throws NativeModuleException;

    void encryptSessionData(ReadableMap params, Promise promise) throws NativeModuleException;

    void registerNewAsset(ReadableMap params, Promise promise) throws NativeModuleException;

    void migrate(Boolean authentication, Promise promise);

}
