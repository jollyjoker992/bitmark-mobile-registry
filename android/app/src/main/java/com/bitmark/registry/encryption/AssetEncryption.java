package com.bitmark.registry.encryption;

import com.bitmark.apiservice.utils.Pair;
import com.bitmark.cryptography.crypto.Chacha20Poly1305;

import java.io.File;
import java.io.IOException;

import static com.bitmark.cryptography.crypto.encoder.Hex.HEX;
import static com.bitmark.sdk.utils.FileUtils.read;

public class AssetEncryption {

    private static final byte[] NONCE = new byte[12];

    private final byte[] encryptionKey;

    public static AssetEncryption fromSessionData(PublicKeyEncryption encryption,
                                                  SessionData sessionData, byte[] senderPubKey) {
        final byte[] encryptionKey = encryption
                .decrypt(HEX.decode(sessionData.getEncryptedKey()), senderPubKey);
        return new AssetEncryption(encryptionKey);
    }

    public AssetEncryption() {
        this(Chacha20Poly1305.generateIetfKey());
    }

    private AssetEncryption(byte[] encryptionKey) {
        this.encryptionKey = encryptionKey;
    }

    public Pair<byte[], SessionData> encrypt(File file, byte[] receiverPubKey,
                                             PublicKeyEncryption encryption) throws IOException {
        final byte[] data = read(file);
        byte[] encryptedData = Chacha20Poly1305.aeadIetfEncrypt(data, null, NONCE, encryptionKey);
        final SessionData sessionData = SessionData
                .getDefault(encryptionKey, receiverPubKey, encryption);
        return new Pair<>(encryptedData, sessionData);
    }

    public byte[] decrypt(byte[] cipher) {
        return Chacha20Poly1305.aeadIetfDecrypt(cipher, null, NONCE, encryptionKey);
    }

}
