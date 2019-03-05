package com.bitmark.registry.modules.utils;


import android.app.admin.DevicePolicyManager;
import android.content.Context;
import android.net.Uri;

import com.bitmark.apiservice.utils.callback.Callback1;
import com.bitmark.registry.utils.MediaUtils;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

public class UtilsModule extends ReactContextBaseJavaModule {

    UtilsModule(ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @Override
    public String getName() {
        return "NativeUtils";
    }

    @ReactMethod
    public void getAbsolutePathFromUri(String uri, Promise promise) {
        MediaUtils
                .getAbsolutePathFromUri(getReactApplicationContext(), Uri.parse(uri),
                        new Callback1<String>() {
                            @Override
                            public void onSuccess(String path) {
                                promise.resolve(path);
                            }

                            @Override
                            public void onError(Throwable throwable) {
                                promise.reject("ERROR_GET_ABSOLUTE_PATH", throwable);
                            }
                        });
    }

    @ReactMethod
    public void checkDiskEncrypted(Promise promise) {
        DevicePolicyManager devicePolicyManager = (DevicePolicyManager) getReactApplicationContext()
                .getSystemService(Context.DEVICE_POLICY_SERVICE);

        int status = devicePolicyManager.getStorageEncryptionStatus();
        promise.resolve(DevicePolicyManager.ENCRYPTION_STATUS_ACTIVE == status);
    }

}
