package com.bitmark.registry.modules.navigation;

import android.content.Intent;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

public class NavigationModule extends ReactContextBaseJavaModule {

    NavigationModule(ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @Override
    public String getName() {
        return "Navigation";
    }

    @ReactMethod
    public void openSystemSetting(String action, Promise promise) {
        try {
            Intent intent = new Intent(action);
            getReactApplicationContext().startActivity(intent);
        } catch (Throwable e) {
            promise.reject("ERROR_OPEN_SETTING", e);
        }
    }
}
