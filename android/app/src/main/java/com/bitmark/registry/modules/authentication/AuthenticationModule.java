package com.bitmark.registry.modules.authentication;

import android.app.KeyguardManager;
import android.content.Context;
import android.text.TextUtils;

import com.bitmark.apiservice.utils.callback.Callback1;
import com.bitmark.registry.BuildConfig;
import com.bitmark.registry.utils.error.NativeModuleException;
import com.bitmark.sdk.authentication.KeyAuthenticationSpec;
import com.bitmark.sdk.authentication.error.AuthenticationRequiredException;
import com.bitmark.sdk.features.Account;
import com.bitmark.sdk.utils.SharedPreferenceApi;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

import java.security.InvalidKeyException;

import static com.bitmark.registry.utils.Constant.ACTIVE_ACCOUNT_NUMBER;
import static com.bitmark.registry.utils.Constant.ENCRYPTION_KEY_ALIAS;
import static com.bitmark.sdk.authentication.error.AuthenticationRequiredException.PASSWORD;

public class AuthenticationModule extends ReactContextBaseJavaModule implements Authentication {

    AuthenticationModule(ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @Override
    public String getName() {
        return "Authentication";
    }

    @ReactMethod
    @Override
    public void isSupported(Promise promise) {
        KeyguardManager keyguardManager = (KeyguardManager) getReactApplicationContext()
                .getSystemService(Context.KEYGUARD_SERVICE);
        promise.resolve(keyguardManager.isDeviceSecure());
    }

    @ReactMethod
    @Override
    public void authenticate(String authDescription, Promise promise) {
        String accountNumber = getAccountNumber();
        if (TextUtils.isEmpty(accountNumber)) {
            promise.reject("ERROR_CANNOT_GET_ACTIVE_ACCOUNT_NUMBER",
                    new NativeModuleException("Cannot get active account number"));
            return;
        }
        KeyAuthenticationSpec spec = new KeyAuthenticationSpec.Builder(
                getReactApplicationContext()).setKeyAlias(ENCRYPTION_KEY_ALIAS)
                                             .setAuthenticationDescription(authDescription).build();
        Account.loadFromKeyStore(getCurrentActivity(), accountNumber, spec,
                new Callback1<Account>() {
                    @Override
                    public void onSuccess(Account account) {
                        promise.resolve(null);
                    }

                    @Override
                    public void onError(Throwable throwable) {
                        if (!handleKeyStoreException(throwable, promise))
                            promise.reject("ERROR_AUTHENTICATE", throwable);
                    }
                });
    }

    private boolean handleKeyStoreException(Throwable throwable, Promise promise) {
        if (throwable instanceof AuthenticationRequiredException) {
            AuthenticationRequiredException ex = (AuthenticationRequiredException) throwable;
            if (ex.getType().equals(PASSWORD))
                promise.reject("PASSCODE_SET_UP_REQUIRED", throwable);
            else promise.reject("BIOMETRIC_SET_UP_REQUIRED", throwable);
            return true;
        } else if (throwable instanceof InvalidKeyException) {
            promise.reject("UNREADABLE_KEY", throwable);
            return true;
        } else return false;
    }

    private String getAccountNumber() {
        return new SharedPreferenceApi(getReactApplicationContext(),
                BuildConfig.APPLICATION_ID).get(ACTIVE_ACCOUNT_NUMBER, String.class);
    }
}
