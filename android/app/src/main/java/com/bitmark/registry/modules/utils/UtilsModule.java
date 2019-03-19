package com.bitmark.registry.modules.utils;


import android.app.ProgressDialog;
import android.app.admin.DevicePolicyManager;
import android.content.Context;
import android.net.Uri;

import com.bitmark.registry.utils.MediaUtils;
import com.bitmark.registry.utils.WidgetUtils;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

import static com.bitmark.sdk.utils.CommonUtils.switchOnMain;

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
        final ProgressDialog dialog = WidgetUtils
                .buildSimpleHorizontalProgressDialog(getCurrentActivity());
        MediaUtils
                .getAbsolutePathFromUri(getReactApplicationContext(), Uri.parse(uri),
                        new MediaUtils.TaskExecutionCallback<String>() {
                            @Override
                            public void onSuccess(String path) {
                                switchOnMain(dialog::dismiss);
                                promise.resolve(path);
                            }

                            @Override
                            public void onError(Throwable throwable) {
                                switchOnMain(dialog::dismiss);
                                promise.reject("ERROR_GET_ABSOLUTE_PATH", throwable);
                            }

                            @Override
                            public void onLongRunningTaskInvoked(int progress) {
                                switchOnMain(() -> {
                                    if (!dialog.isShowing()) dialog.show();
                                    dialog.setProgress(progress);
                                });
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
