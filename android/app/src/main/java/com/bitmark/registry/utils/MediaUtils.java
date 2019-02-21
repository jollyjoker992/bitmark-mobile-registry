package com.bitmark.registry.utils;

import android.content.ContentUris;
import android.content.Context;
import android.database.Cursor;
import android.net.Uri;
import android.os.Environment;
import android.provider.DocumentsContract;
import android.provider.MediaStore;

import com.bitmark.cryptography.crypto.Random;
import com.bitmark.registry.BuildConfig;

import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.util.Date;

public class MediaUtils {

    public static boolean isMediaDocument(Uri uri) {
        return "com.android.providers.media.documents".equals(uri.getAuthority());
    }

    public static boolean isDownloadsDocument(Uri uri) {
        return "com.android.providers.downloads.documents".equals(uri.getAuthority());
    }

    public static boolean isExternalStorageDocument(Uri uri) {
        return "com.android.externalstorage.documents".equals(uri.getAuthority());
    }

    public static String getAbsolutePathFromUri(Context context, Uri uri) throws Exception {

        if (DocumentsContract.isDocumentUri(context, uri)) {
            if (isMediaDocument(uri)) {

                final String docId = DocumentsContract.getDocumentId(uri);
                final String[] split = docId.split(":");
                final String type = split[0];

                Uri contentUri = null;
                if ("image".equals(type)) {
                    contentUri = MediaStore.Images.Media.EXTERNAL_CONTENT_URI;
                } else if ("video".equals(type)) {
                    contentUri = MediaStore.Video.Media.EXTERNAL_CONTENT_URI;
                } else if ("audio".equals(type)) {
                    contentUri = MediaStore.Audio.Media.EXTERNAL_CONTENT_URI;
                }

                final String selection = "_id=?";
                final String[] selectionArgs = new String[]{split[1]};

                return getDataColumn(context, contentUri, selection, selectionArgs);

            } else if (isDownloadsDocument(uri)) {

                final String id = DocumentsContract.getDocumentId(uri);

                if (id.startsWith("raw:")) {

                    return id.replaceFirst("raw:", "");
                } else {

                    String[] contentUriPrefixesToTry = new String[]{
                            "content://downloads/public_downloads",
                            "content://downloads/my_downloads",
                            "content://downloads/all_downloads"
                    };

                    String path = null;
                    for (String contentUriPrefix : contentUriPrefixesToTry) {
                        Uri contentUri = ContentUris
                                .withAppendedId(Uri.parse(contentUriPrefix), Long.valueOf(id));
                        path = getDataColumn(context, contentUri, null, null);
                        if (path != null) break;
                    }

                    if (path == null) {
                        path = writeCacheFile(context, uri, getTempCacheFileName());
                    }

                    return path;
                }
            } else if (isExternalStorageDocument(uri)) {

                final String docId = DocumentsContract.getDocumentId(uri);
                final String[] split = docId.split(":");
                final String type = split[0];

                if ("primary".equalsIgnoreCase(type)) {

                    return Environment.getExternalStorageDirectory() + "/" + split[1];
                } else {

                    String[] proj = {MediaStore.Images.Media.DATA};
                    Cursor cursor = context.getContentResolver()
                                           .query(uri, proj, null, null, null);
                    int columnIndex = cursor
                            .getColumnIndexOrThrow(MediaStore.Images.Media.DATA);
                    cursor.moveToFirst();
                    String path = cursor.getString(columnIndex);
                    cursor.close();

                    return path;
                }
            }
        } else if ("content".equalsIgnoreCase(uri.getScheme())) {

            return getDataColumn(context, uri, null, null);
        } else if ("file".equalsIgnoreCase(uri.getScheme())) {

            return uri.getPath();
        }
        return null;
    }

    public static String getDataColumn(Context context, Uri uri, String selection,
                                       String[] selectionArgs) throws IOException {
        Cursor cursor = null;
        final String[] projection = {MediaStore.MediaColumns.DATA, MediaStore.MediaColumns.DISPLAY_NAME};

        try {
            cursor = context.getContentResolver()
                            .query(uri, projection, selection, selectionArgs, null);
            if (cursor != null && cursor.moveToFirst()) {
                final int columnIndex = cursor.getColumnIndexOrThrow(MediaStore.MediaColumns.DATA);
                return cursor.getString(columnIndex);
            }
        } catch (Exception e) {
            if (cursor != null) {
                final int columnIndex = cursor
                        .getColumnIndexOrThrow(MediaStore.MediaColumns.DISPLAY_NAME);
                final String displayName = cursor.getString(columnIndex);

                return writeCacheFile(context, uri, "temp" + displayName);
            } else {
                return writeCacheFile(context, uri, getTempCacheFileName());
            }
        } finally {
            if (cursor != null)
                cursor.close();
        }
        return null;
    }

    public static String writeCacheFile(Context context, Uri uri, String displayName)
            throws IOException {
        try (InputStream input = context.getContentResolver().openInputStream(uri)) {
            try {
                File file = new File(getCacheDir(context), displayName);
                try (OutputStream output = new FileOutputStream(file)) {

                    byte[] buffer = new byte[4 * 1024];
                    int read;

                    while ((read = input.read(buffer)) != -1) {
                        output.write(buffer, 0, read);
                    }
                    output.flush();

                    return file.getAbsolutePath();

                }
            } catch (Exception e) {
                throw new IOException(e);
            } finally {
                if (input != null) input.close();
            }
        } catch (FileNotFoundException e) {
            throw new IOException(e);
        }
    }

    public static String getTempCacheFileName() {
        return "temp" + getRandomFileName();
    }

    public static File getCacheDir(Context context) {
        File file = new File(context.getCacheDir() + BuildConfig.APPLICATION_ID);
        if (!file.exists()) {
            try {
                file.createNewFile();
            } catch (IOException e) {
                return context.getCacheDir();
            }
        }
        return file;
    }

    private static String getRandomFileName() {
        long millis = System.currentTimeMillis();
        return Random.secureRandomInt() + "_" + millis;
    }
}
