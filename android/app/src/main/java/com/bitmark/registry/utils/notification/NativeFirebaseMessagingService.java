package com.bitmark.registry.utils.notification;

import android.app.ActivityManager;
import android.app.Application;
import android.content.Context;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.util.Log;

import com.bitmark.registry.R;
import com.dieam.reactnativepushnotification.helpers.ApplicationBadgeHelper;
import com.dieam.reactnativepushnotification.modules.RNPushNotificationHelper;
import com.dieam.reactnativepushnotification.modules.RNPushNotificationListenerService;
import com.facebook.react.ReactApplication;
import com.facebook.react.ReactInstanceManager;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;
import com.google.firebase.messaging.FirebaseMessagingService;
import com.google.firebase.messaging.RemoteMessage;

import org.json.JSONObject;

import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Random;

import static com.dieam.reactnativepushnotification.modules.RNPushNotification.LOG_TAG;

/**
 * Wrapper class of {@link RNPushNotificationListenerService} for manually handle notification
 */
public class NativeFirebaseMessagingService extends FirebaseMessagingService {

    @Override
    public void onMessageReceived(RemoteMessage message) {
        super.onMessageReceived(message);
        RemoteMessage.Notification remoteNotification = message.getNotification();

        final Bundle bundle = new Bundle();
        if (remoteNotification != null) {
            bundle.putString("title", remoteNotification.getTitle());
            bundle.putString("message", rebuildMessage(remoteNotification));
        }

        for (Map.Entry<String, String> entry : message.getData().entrySet()) {
            bundle.putString(entry.getKey(), entry.getValue());
        }
        JSONObject data = getPushData(bundle.getString("data"));
        if (bundle.containsKey("twi_body")) {
            bundle.putString("message", bundle.getString("twi_body"));
        }

        if (data != null) {
            if (!bundle.containsKey("message")) {
                bundle.putString("message", data.optString("alert", null));
            }
            if (!bundle.containsKey("title")) {
                bundle.putString("title", data.optString("title", null));
            }
            if (!bundle.containsKey("sound")) {
                bundle.putString("soundName", data.optString("sound", null));
            }
            if (!bundle.containsKey("color")) {
                bundle.putString("color", data.optString("color", null));
            }

            final int badge = data.optInt("badge", -1);
            if (badge >= 0) {
                ApplicationBadgeHelper.INSTANCE.setApplicationIconBadgeNumber(this, badge);
            }
        }

        Handler handler = new Handler(Looper.getMainLooper());
        handler.post(() -> {
            // Construct and load our normal React JS code bundle
            ReactInstanceManager mReactInstanceManager = ((ReactApplication) getApplication())
                    .getReactNativeHost().getReactInstanceManager();
            ReactContext context = mReactInstanceManager.getCurrentReactContext();
            // If it's constructed, send a notification
            if (context != null) {
                handleRemotePushNotification((ReactApplicationContext) context, bundle);
            } else {
                // Otherwise wait for construction, then send the notification
                mReactInstanceManager.addReactInstanceEventListener(
                        context1 -> handleRemotePushNotification((ReactApplicationContext) context1,
                                bundle));
                if (!mReactInstanceManager.hasStartedCreatingInitialContext()) {
                    // Construct it in the background
                    mReactInstanceManager.createReactContextInBackground();
                }
            }
        });
    }

    private String rebuildMessage(RemoteMessage.Notification notification) {
        String locMessage = getLocMessage(notification);
        return locMessage.isEmpty() ? notification.getBody() :
                String.format(Locale.getDefault(), locMessage,
                        notification.getBodyLocalizationArgs());
    }

    private String getLocMessage(RemoteMessage.Notification remoteNotification) {
        Context context = getApplicationContext();
        String type = remoteNotification.getBodyLocalizationKey();
        if (type == null) return "";
        switch (type) {
            case "notification_tracking_transfer_confirmed":
                return context.getString(R.string.notification_tracking_transfer_confirmed);
            case "notification_transfer_confirmed_sender":
                return context.getString(R.string.notification_transfer_confirmed_sender);
            case "notification_transfer_confirmed_receiver":
                return context.getString(R.string.notification_transfer_confirmed_receiver);
            case "notification_transfer_request":
                return context.getString(R.string.notification_transfer_failed);
            case "notification_transfer_failed":
                return context.getString(R.string.notification_transfer_request);
            case "notification_transfer_rejected":
                return context.getString(R.string.notification_transfer_rejected);
            case "notification_transfer_accepted":
                return context.getString(R.string.notification_transfer_accepted);
            case "notification_claim_request":
                return context.getString(R.string.notification_claim_request);
            case "notification_claim_request_rejected":
                return context.getString(R.string.notification_claim_request_rejected);
            default:
                return "";

        }
    }

    private JSONObject getPushData(String dataString) {
        try {
            return new JSONObject(dataString);
        } catch (Exception e) {
            return null;
        }
    }

    private void handleRemotePushNotification(ReactApplicationContext context, Bundle bundle) {

        // If notification ID is not provided by the user for push notification, generate one at random
        if (bundle.getString("id") == null) {
            Random randomNumberGenerator = new Random(System.currentTimeMillis());
            bundle.putString("id", String.valueOf(randomNumberGenerator.nextInt()));
        }

        boolean isForeground = isApplicationInForeground();

        NativeJsDelivery jsDelivery = new NativeJsDelivery(context);
        bundle.putBoolean("foreground", isForeground);
        bundle.putBoolean("userInteraction", false);
        jsDelivery.notifyNotification(bundle);

        // If contentAvailable is set to true, then send out a remote fetch event
        if (bundle.getString("contentAvailable", "false").equalsIgnoreCase("true")) {
            jsDelivery.notifyRemoteFetch(bundle);
        }

        Log.v(LOG_TAG, "sendNotification: " + bundle);

        Application applicationContext = (Application) context.getApplicationContext();
        RNPushNotificationHelper pushNotificationHelper = new RNPushNotificationHelper(
                applicationContext);
        pushNotificationHelper.sendToNotificationCentre(bundle);
    }

    private boolean isApplicationInForeground() {
        ActivityManager activityManager = (ActivityManager) this.getSystemService(ACTIVITY_SERVICE);
        List<ActivityManager.RunningAppProcessInfo> processInfos = activityManager
                .getRunningAppProcesses();
        if (processInfos != null) {
            for (ActivityManager.RunningAppProcessInfo processInfo : processInfos) {
                if (processInfo.processName.equals(getApplication().getPackageName())) {
                    if (processInfo.importance == ActivityManager.RunningAppProcessInfo.IMPORTANCE_FOREGROUND) {
                        for (String d : processInfo.pkgList) {
                            return true;
                        }
                    }
                }
            }
        }
        return false;
    }
}
