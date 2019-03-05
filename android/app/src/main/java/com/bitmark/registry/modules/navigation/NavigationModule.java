package com.bitmark.registry.modules.navigation;

import android.app.Activity;
import android.content.Intent;
import android.net.Uri;
import android.provider.MediaStore;
import android.text.TextUtils;

import com.bitmark.apiservice.utils.callback.Callback1;
import com.bitmark.registry.utils.MediaUtils;
import com.bitmark.registry.utils.error.NativeModuleException;
import com.facebook.react.bridge.ActivityEventListener;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

import static android.app.Activity.RESULT_OK;

public class NavigationModule extends ReactContextBaseJavaModule {

    private static final int READ_DOCUMENT_CODE = 42;

    private static final int READ_MEDIA_CODE = 43;

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
                    Uri uri = data.getData();
                    MediaUtils.getAbsolutePathFromUri(context, uri, new Callback1<String>() {
                        @Override
                        public void onSuccess(String path) {
                            if (TextUtils.isEmpty(path)) promise.reject("UNSUPPORT_FILE",
                                    new NativeModuleException("Unsupport file type"));
                            else
                                promise.resolve(path);
                        }

                        @Override
                        public void onError(Throwable throwable) {
                            promise.reject("ERROR_BROWSE_DOCUMENT", throwable);
                        }
                    });

                }
            }

            @Override
            public void onNewIntent(Intent intent) {

            }
        });
    }

    @ReactMethod
    public void browseMedia(String type, Promise promise) throws NativeModuleException {
        if (!type.equals("photo") && !type.equals("video"))
            throw new NativeModuleException("Invalid type");
        Intent intent = new Intent(Intent.ACTION_PICK);
        if (type.equals("photo")) {
            intent.setDataAndType(MediaStore.Images.Media.EXTERNAL_CONTENT_URI, "image/*");
        } else if (type.equals("video")) {
            intent.setDataAndType(MediaStore.Video.Media.EXTERNAL_CONTENT_URI, "video/*");
        }
        ReactApplicationContext context = getReactApplicationContext();
        context.startActivityForResult(intent, READ_MEDIA_CODE, null);
        context.addActivityEventListener(new ActivityEventListener() {
            @Override
            public void onActivityResult(Activity activity, int requestCode, int resultCode,
                                         Intent data) {
                context.removeActivityEventListener(this);
                if (resultCode == RESULT_OK && requestCode == READ_MEDIA_CODE) {
                    Uri uri = data.getData();
                    MediaUtils.getAbsolutePathFromUri(context, uri, new Callback1<String>() {
                        @Override
                        public void onSuccess(String path) {
                            if (TextUtils.isEmpty(path)) promise.reject("UNSUPPORT_FILE",
                                    new NativeModuleException("Unsupport file type"));
                            else
                                promise.resolve(path);
                        }

                        @Override
                        public void onError(Throwable throwable) {
                            promise.reject("ERROR_BROWSE_MEDIA", throwable);
                        }
                    });


                }
            }

            @Override
            public void onNewIntent(Intent intent) {

            }
        });
    }
}
