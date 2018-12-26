package com.bitmark.registry;

import android.app.Application;

import com.bitmark.registry.modules.sdk.BitmarkSDKPackage;
import com.chirag.RNMail.RNMail;
import com.corbt.keepawake.KCKeepAwakePackage;
import com.crashlytics.android.Crashlytics;
import com.dieam.reactnativepushnotification.ReactNativePushNotificationPackage;
import com.facebook.react.ReactApplication;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.react.shell.MainReactPackage;
import com.facebook.soloader.SoLoader;
import com.imagepicker.ImagePickerPackage;
import com.learnium.RNDeviceInfo.RNDeviceInfo;
import com.lwansbrough.RCTCamera.RCTCameraPackage;
import com.microsoft.codepush.react.CodePush;
import com.psykar.cookiemanager.CookieManagerPackage;
import com.reactnativedocumentpicker.ReactNativeDocumentPicker;
import com.rnfs.RNFSPackage;
import com.rnziparchive.RNZipArchivePackage;

import java.util.Arrays;
import java.util.List;

import io.fabric.sdk.android.Fabric;
import io.sentry.RNSentryPackage;

import static com.bitmark.registry.keymanagement.ApiKeyManager.API_KEY_MANAGER;

public class MainApplication extends Application implements ReactApplication {

    private final ReactNativeHost mReactNativeHost = new ReactNativeHost(this) {

        @Override
        protected String getJSBundleFile() {
            return CodePush.getJSBundleFile();
        }

        @Override
        public boolean getUseDeveloperSupport() {
            return BuildConfig.DEBUG;
        }

        @Override
        protected List<ReactPackage> getPackages() {
            return Arrays.asList(
                    new MainReactPackage(),
                    new RNSentryPackage(),
                    new RCTCameraPackage(),
                    new KCKeepAwakePackage(),
                    new CodePush(
                            API_KEY_MANAGER.getCodePushApiKey(),
                            getApplicationContext(), BuildConfig.DEBUG),
                    new CookieManagerPackage(),
                    new ReactNativeDocumentPicker(),
                    new RNZipArchivePackage(),
                    new ImagePickerPackage(),
                    new RNDeviceInfo(),
                    new ReactNativePushNotificationPackage(),
                    new RNMail(),
                    new RNFSPackage(),
                    new BitmarkSDKPackage()
            );
        }

        @Override
        protected String getJSMainModuleName() {
            return "index";
        }
    };

    @Override
    public ReactNativeHost getReactNativeHost() {
        return mReactNativeHost;
    }

    @Override
    public void onCreate() {
        super.onCreate();
        Fabric.with(this, new Crashlytics());
        SoLoader.init(this, /* native exopackage */ false);
    }
}
