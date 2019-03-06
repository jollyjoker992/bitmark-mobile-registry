package com.bitmark.registry.utils.notification;

import android.app.ActivityManager;
import android.app.Application;
import android.content.Context;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;

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

import static com.bitmark.registry.utils.DataTypeMapper.jsonArrayToStringArray;
import static com.bitmark.registry.utils.DataTypeMapper.toJsonObject;

/**
 * Wrapper class of {@link RNPushNotificationListenerService} for manually handle notification
 */
public class NativeFirebaseMessagingService extends FirebaseMessagingService {

    @Override
    public void onMessageReceived(RemoteMessage message) {
        super.onMessageReceived(message);

        // Do not handle in foreground
        if (isApplicationInForeground()) return;

        RemoteMessage.Notification remoteNotification = message.getNotification();

        final Bundle bundle = new Bundle();

        // Remote Notification payload
        if (remoteNotification != null) {
            bundle.putString("title", remoteNotification.getTitle());
            bundle.putString("message", remoteNotification.getBody());
            if (remoteNotification.getIcon() != null)
                bundle.putString("smallIcon", remoteNotification.getIcon());
        }

        for (Map.Entry<String, String> entry : message.getData().entrySet()) {
            bundle.putString(entry.getKey(), entry.getValue());
        }

        // Notification data
        JSONObject notification = toJsonObject(bundle.getString("notification_payload", ""));
        if (notification != null) {
            if (notification.has("body_loc_key")) {
                String lockKey = notification.optString("body_loc_key");
                String[] locArgs = jsonArrayToStringArray(
                        notification.optJSONArray("body_loc_args"));
                bundle.putString("message", locArgs == null ? getLocMessage(lockKey) :
                        String.format(Locale.getDefault(), getLocMessage(lockKey), locArgs));

            }

            String body = notification.optString("body", null);
            if (body != null) bundle.putString("message", body);

            String icon = notification.optString("icon", null);
            if (icon != null) {
                bundle.putString("smallIcon", icon);
                bundle.putString("largeIcon", icon);
            }

            String color = notification.optString("color", null);
            if (color != null) bundle.putString("color", color);

        }


        // Push data
        JSONObject data = toJsonObject(bundle.getString("data", ""));
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
            ReactContext reactContext = mReactInstanceManager.getCurrentReactContext();
            // If it's constructed, send a notification
            if (reactContext != null) {
                handleRemotePushNotification((ReactApplicationContext) reactContext, bundle);
            } else {
                // Otherwise wait for construction, then send the notification
                mReactInstanceManager.addReactInstanceEventListener(
                        context -> handleRemotePushNotification((ReactApplicationContext) context,
                                bundle));
                if (!mReactInstanceManager.hasStartedCreatingInitialContext()) {
                    // Construct it in the background
                    mReactInstanceManager.createReactContextInBackground();
                }
            }
        });
    }

    private String getLocMessage(String locKey) {
        Context context = getApplicationContext();
        if (locKey == null) return "";
        switch (locKey) {
            case "notification_intercom_new_messages":
                return context.getString(R.string.notification_intercom_new_messages);
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

    private void handleRemotePushNotification(ReactApplicationContext context, Bundle bundle) {

        // If notification ID is not provided by the user for push notification, generate one at random
        if (bundle.getString("id") == null) {
            Random randomNumberGenerator = new Random(System.currentTimeMillis());
            bundle.putString("id", String.valueOf(randomNumberGenerator.nextInt()));
        }

        boolean isForeground = isApplicationInForeground();
        bundle.putBoolean("foreground", isForeground);
        bundle.putBoolean("userInteraction", false);


        // Push notification
        Application applicationContext = (Application) context.getApplicationContext();
        RNPushNotificationHelper pushNotificationHelper = new RNPushNotificationHelper(
                applicationContext);
        pushNotificationHelper.sendToNotificationCentre(bundle);

        // Deliver event to js
        NativeJsDelivery jsDelivery = new NativeJsDelivery(context);
        jsDelivery.notifyNotification(bundle);

        // If contentAvailable is set to true, then send out a remote fetch event
        if (bundle.getString("contentAvailable", "false").equalsIgnoreCase("true")) {
            jsDelivery.notifyRemoteFetch(bundle);
        }
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
