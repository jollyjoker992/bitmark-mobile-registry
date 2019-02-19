package com.bitmark.registry;

import com.bitmark.sdk.authentication.StatefulReactActivity;
import com.facebook.react.modules.core.PermissionListener;
import com.imagepicker.permissions.OnImagePickerPermissionsCallback;

public class MainActivity extends StatefulReactActivity
        implements OnImagePickerPermissionsCallback {
    private PermissionListener listener;

    /**
     * Returns the name of the main component registered from JavaScript.
     * This is used to schedule rendering of the component.
     */
    @Override
    protected String getMainComponentName() {
        return "Bitmark";
    }

    @Override
    public void setPermissionListener(PermissionListener listener) {
        this.listener = listener;
    }

    @Override
    public void onRequestPermissionsResult(int requestCode, String[] permissions,
                                           int[] grantResults) {
        if (listener != null) {
            listener.onRequestPermissionsResult(requestCode, permissions, grantResults);
        }
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);
    }
}
