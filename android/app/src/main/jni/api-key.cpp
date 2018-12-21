#include <jni.h>

const char *BITMARK_API_KEY = "bmk-lljpzkhqdkzmblhg";
const char *CODE_PUSH_API_KEY = "CGnP-G4I33angJRWeHM-6O3yPtwHS1KHiyySm";

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