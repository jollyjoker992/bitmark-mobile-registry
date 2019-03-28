package com.bitmark.registry.modules.authentication;

import com.facebook.react.bridge.Promise;

public interface Authentication {

    void isSupported(Promise promise);

    void authenticate(String authDescription, Promise promise);

}
