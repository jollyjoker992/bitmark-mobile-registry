package com.bitmark.registry.utils;

import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.ReadableMapKeySetIterator;

import java.util.HashMap;
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
}
