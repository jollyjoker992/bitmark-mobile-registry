package com.bitmark.registry.encryption;

import com.bitmark.cryptography.error.ValidateException;
import com.facebook.react.bridge.ReadableMap;

import java.util.HashMap;
import java.util.Map;

import static com.bitmark.cryptography.crypto.encoder.Hex.HEX;

public class SessionData {

    private static final String CHACHA20_POLY1305_ALGORITHM = "chacha20poly1305";

    private final String algorithm;

    private final String encryptedKey;

    public static SessionData getDefault(byte[] sessionKey,
                                         byte[] receiverPubKey, PublicKeyEncryption encryption)
            throws ValidateException {
        byte[] encryptedKey = encryption.encrypt(sessionKey, receiverPubKey);
        return new SessionData(HEX.encode(encryptedKey), CHACHA20_POLY1305_ALGORITHM);
    }

    public static SessionData fromReadableMap(ReadableMap readableMap) {
        String algorithm = readableMap.getString("data_key_alg");
        String encryptedKey = readableMap.getString("enc_data_key");
        return new SessionData(encryptedKey, algorithm);
    }

    private SessionData(String encryptedKey, String algorithm) {
        this.encryptedKey = encryptedKey;
        this.algorithm = algorithm;
    }

    public String getAlgorithm() {
        return algorithm;
    }

    public String getEncryptedKey() {
        return encryptedKey;
    }

    public Map<String, Object> toMap() {
        Map<String, Object> map = new HashMap<>();
        map.put("data_key_alg", algorithm);
        map.put("enc_data_key", encryptedKey);
        return map;
    }
}
