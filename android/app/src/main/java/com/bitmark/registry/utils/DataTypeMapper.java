package com.bitmark.registry.utils;

import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.ReadableMapKeySetIterator;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.WritableNativeArray;
import com.facebook.react.bridge.WritableNativeMap;
import com.google.gson.GsonBuilder;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class DataTypeMapper {

    private DataTypeMapper() {
    }

    public static String[] toStringArray(ReadableArray array) {
        final int size = array.size();
        String[] result = new String[size];
        for (int i = 0; i < size; i++) {
            result[i] = array.getString(i);
        }
        return result;
    }

    public static Map<String, String> toStringMap(ReadableMap map) {
        Map<String, String> result = new HashMap<>();

        ReadableMapKeySetIterator iterator = map.keySetIterator();
        while (iterator.hasNextKey()) {
            String key = iterator.nextKey();
            String value = map.getString(key);
            result.put(key, value);
        }
        return result;
    }

    public static String toJson(Object object) {
        return new GsonBuilder().create().toJson(object);
    }

    public static WritableArray toWritableArray(Object... objects) {
        WritableArray array = new WritableNativeArray();
        for (Object value : objects) {
            if (value instanceof Boolean) {
                array.pushBoolean((Boolean) value);
            } else if (value instanceof Integer) {
                array.pushInt((Integer) value);
            } else if (value instanceof Double) {
                array.pushDouble((Double) value);
            } else if (value instanceof String) {
                array.pushString((String) value);
            } else if (value instanceof Map) {
                array.pushMap(toWritableMap((Map<String, Object>) value));
            } else if (value.getClass().isArray()) {
                array.pushArray(toWritableArray((Object[]) value));
            } else {
                array.pushString(toJson(value));
            }
        }
        return array;
    }

    public static WritableArray toWritableArray(List<Object> objects) {
        WritableArray array = new WritableNativeArray();
        for (Object value : objects) {
            if (value instanceof Boolean) {
                array.pushBoolean((Boolean) value);
            } else if (value instanceof Integer) {
                array.pushInt((Integer) value);
            } else if (value instanceof Double) {
                array.pushDouble((Double) value);
            } else if (value instanceof String) {
                array.pushString((String) value);
            } else if (value instanceof Map) {
                array.pushMap(toWritableMap((Map<String, Object>) value));
            } else if (value.getClass().isArray()) {
                array.pushArray(toWritableArray((Object[]) value));
            } else {
                array.pushString(toJson(value));
            }
        }
        return array;
    }

    public static WritableMap toWritableMap(Map<String, Object> map) {
        WritableMap result = new WritableNativeMap();
        for (Map.Entry<String, Object> entry : map.entrySet()) {
            Object value = entry.getValue();
            String key = entry.getKey();
            if (value instanceof Boolean) {
                result.putBoolean(key, (Boolean) value);
            } else if (value instanceof Integer) {
                result.putInt(key, (Integer) value);
            } else if (value instanceof Double) {
                result.putDouble(key, (Double) value);
            } else if (value instanceof String) {
                result.putString(key, (String) value);
            } else if (value.getClass().isArray()) {
                result.putArray(key, toWritableArray((Object[]) value));
            } else if (value instanceof Map) {
                result.putMap(key, toWritableMap((Map<String, Object>) value));
            } else {
                result.putString(key, toJson(value));
            }
        }
        return result;
    }

}
