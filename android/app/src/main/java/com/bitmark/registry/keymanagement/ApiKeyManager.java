package com.bitmark.registry.keymanagement;

public class ApiKeyManager {

    public static final ApiKeyManager API_KEY_MANAGER = new ApiKeyManager();

    static {
        System.loadLibrary("api-key");
    }

    public native String getBitmarkApiKey();

    public native String getCodePushApiKey();

    public native String getIntercomApiKey();

}
