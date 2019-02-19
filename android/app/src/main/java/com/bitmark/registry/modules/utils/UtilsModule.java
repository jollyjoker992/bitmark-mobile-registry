package com.bitmark.registry.modules.utils;


import android.net.Uri;

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
        try {
            String path = MediaUtils
                    .getAbsolutePathFromUri(getReactApplicationContext(), Uri.parse(uri));
            promise.resolve(path);
        } catch (Throwable e) {
            promise.reject("ERROR_GET_ABSOLUTE_PATH", e);
        }
    }


}
