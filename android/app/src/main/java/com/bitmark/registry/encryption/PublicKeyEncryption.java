package com.bitmark.registry.encryption;

public interface PublicKeyEncryption {

    byte[] encrypt(byte[] message, byte[] receiverPubKey);

    byte[] decrypt(byte[] cipher, byte[] senderPubKey);

}
