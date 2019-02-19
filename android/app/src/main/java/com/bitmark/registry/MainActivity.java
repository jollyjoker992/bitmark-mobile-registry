package com.bitmark.registry;

import android.support.annotation.NonNull;

import com.bitmark.sdk.authentication.StatefulReactActivity;
import com.facebook.react.modules.core.PermissionListener;
import com.imagepicker.permissions.OnImagePickerPermissionsCallback;

public class MainActivity extends StatefulReactActivity
        implements OnImagePickerPermissionsCallback {

    private PermissionListener permissionListener;

    /**
     * Returns the name of the main component registered from JavaScript.
     * This is used to schedule rendering of the component.
     */
    @Override
    protected String getMainComponentName() {
        return "Bitmark";
    }

    @Override
    public void setPermissionListener(@NonNull PermissionListener listener) {
        this.permissionListener = listener;
    }

    @Override
    public void onRequestPermissionsResult(int requestCode, String[] permissions,
                                           int[] grantResults) {
        if (permissionListener != null) {
            permissionListener.onRequestPermissionsResult(requestCode, permissions, grantResults);
        }
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);
    }
}
