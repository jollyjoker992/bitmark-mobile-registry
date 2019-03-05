package com.bitmark.registry.utils;

import android.app.Activity;
import android.app.ProgressDialog;

import com.bitmark.registry.R;

public class WidgetUtils {

    private WidgetUtils() {
    }

    public static ProgressDialog buildSimpleHorizontalProgressDialog(Activity activity) {
        final ProgressDialog dialog = new ProgressDialog(activity);
        dialog.setProgressStyle(ProgressDialog.STYLE_HORIZONTAL);
        dialog.setMax(100);
        dialog.setProgress(0);
        dialog.setMessage(activity.getString(R.string.loading_dot));
        return dialog;
    }
}
