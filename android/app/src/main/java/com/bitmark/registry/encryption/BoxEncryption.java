package com.bitmark.registry.encryption;

import com.bitmark.cryptography.crypto.Box;

import static com.bitmark.apiservice.utils.ArrayUtil.concat;
import static com.bitmark.apiservice.utils.ArrayUtil.slice;
import static com.bitmark.cryptography.crypto.Random.secureRandomBytes;

public class BoxEncryption implements PublicKeyEncryption {

    private final byte[] privateKey;

    public BoxEncryption(byte[] privateKey) {
        this.privateKey = privateKey;
    }

    @Override
    public byte[] encrypt(byte[] message, byte[] receiverPubKey) {
        final byte[] nonce = secureRandomBytes(Box.NONCE_BYTE_LENGTH);
        final byte[] cipher = Box.box(message, nonce, receiverPubKey, privateKey);
        return concat(nonce, cipher);
    }

    @Override
    public byte[] decrypt(byte[] cipher, byte[] senderPubKey) {
        final byte[] nonce = slice(cipher, 0, Box.NONCE_BYTE_LENGTH);
        final byte[] rawCipher = slice(cipher, Box.NONCE_BYTE_LENGTH, cipher.length);
        return Box.unbox(rawCipher, nonce, senderPubKey, privateKey);
    }
}
