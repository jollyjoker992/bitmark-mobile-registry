#include <jni.h>

const char *BITMARK_API_KEY = "bitmark-api-key-to-be-filled";
const char *CODE_PUSH_API_KEY = "code-push-api-key-to-be-filled";

extern "C"
JNIEXPORT jstring JNICALL
Java_com_bitmark_registry_keymanagement_ApiKeyManager_getBitmarkApiKey(JNIEnv *env,
                                                                              jobject instance) {
    return env->NewStringUTF(BITMARK_API_KEY);
}

extern "C"
JNIEXPORT jstring JNICALL
Java_com_bitmark_registry_keymanagement_ApiKeyManager_getCodePushApiKey(JNIEnv *env,
                                                                               jobject instance) {

    return env->NewStringUTF(CODE_PUSH_API_KEY);
}