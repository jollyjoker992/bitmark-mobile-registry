package com.bitmark.registry.utils.error;

public class NativeModuleException extends Exception {

    public NativeModuleException(String message) {
        super(message);
    }

    public NativeModuleException(Throwable throwable) {
        super(throwable);
    }
}
