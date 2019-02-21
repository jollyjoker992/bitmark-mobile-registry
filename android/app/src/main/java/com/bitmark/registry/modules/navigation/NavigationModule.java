package com.bitmark.registry.modules.navigation;

import android.app.Activity;
import android.content.Context;
import android.content.Intent;
import android.net.Uri;

import com.bitmark.registry.utils.MediaUtils;
import com.facebook.react.bridge.ActivityEventListener;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

import static android.app.Activity.RESULT_OK;

public class NavigationModule extends ReactContextBaseJavaModule {

    private static final int READ_DOCUMENT_CODE = 42;

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
            promise.resolve(null);
        } catch (Throwable e) {
            promise.reject("ERROR_OPEN_SETTING", e);
        }
    }

    @ReactMethod
    public void browseDocument(Promise promise) {
        Intent intent = new Intent(Intent.ACTION_OPEN_DOCUMENT);
        intent.addCategory(Intent.CATEGORY_OPENABLE);
        intent.setType("*/*");
        ReactApplicationContext context = getReactApplicationContext();
        context.startActivityForResult(intent, READ_DOCUMENT_CODE, null);
        context.addActivityEventListener(new ActivityEventListener() {
            @Override
            public void onActivityResult(Activity activity, int requestCode, int resultCode,
                                         Intent data) {
                context.removeActivityEventListener(this);
                if (resultCode == RESULT_OK && requestCode == READ_DOCUMENT_CODE) {
                    Uri uri = intent.getData();
                    try {
                        String path = MediaUtils.getAbsolutePathFromUri(context, uri);
                        promise.resolve(path);
                    } catch (Throwable e) {
                        promise.reject(e);
                    }
                }
            }

            @Override
            public void onNewIntent(Intent intent) {

            }
        });
    }
}
