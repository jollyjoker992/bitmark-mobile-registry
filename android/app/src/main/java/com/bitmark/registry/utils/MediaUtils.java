package com.bitmark.registry.utils;

import android.content.ContentUris;
import android.content.Context;
import android.database.Cursor;
import android.net.Uri;
import android.os.Environment;
import android.provider.DocumentsContract;
import android.provider.MediaStore;
import android.support.v4.provider.DocumentFile;
import android.webkit.MimeTypeMap;

import com.bitmark.apiservice.utils.BackgroundJobScheduler;
import com.bitmark.cryptography.crypto.Random;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.URLDecoder;

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

    public static void getAbsolutePathFromUri(Context context, Uri uri,
                                              TaskExecutionCallback<String> callback) {

        try {
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

                    String path = getDataColumn(context, contentUri, selection, selectionArgs);
                    if (path == null)
                        writeCacheFile(context, contentUri, getFileNameFromUri(context, contentUri),
                                callback);
                    else callback.onSuccess(path);

                } else if (isDownloadsDocument(uri)) {

                    final String id = DocumentsContract.getDocumentId(uri);

                    if (id.startsWith("raw:")) {

                        callback.onSuccess(id.replaceFirst("raw:", ""));
                    } else {

                        String[] contentUriPrefixesToTry = new String[]{
                                "content://downloads/public_downloads",
                                "content://downloads/my_downloads",
                                "content://downloads/all_downloads",
                                "content://com.android.providers.downloads.documents/document"
                        };

                        String path = null;
                        for (String contentUriPrefix : contentUriPrefixesToTry) {
                            Uri contentUri = ContentUris
                                    .withAppendedId(Uri.parse(contentUriPrefix), Long.valueOf(id));
                            path = getDataColumn(context, contentUri, null, null);
                            if (path != null) break;
                        }

                        if (path == null) {
                            writeCacheFile(context, uri, getRandomFileName(), callback);
                        } else callback.onSuccess(path);
                    }
                } else if (isExternalStorageDocument(uri)) {

                    final String docId = DocumentsContract.getDocumentId(uri);
                    final String[] split = docId.split(":");
                    final String type = split[0];

                    if ("primary".equalsIgnoreCase(type)) {

                        callback.onSuccess(
                                Environment.getExternalStorageDirectory() + "/" + split[1]);
                    } else {

                        String[] proj = {MediaStore.Images.Media.DATA};
                        Cursor cursor = context.getContentResolver()
                                               .query(uri, proj, null, null, null);
                        int columnIndex = cursor
                                .getColumnIndexOrThrow(MediaStore.Images.Media.DATA);
                        cursor.moveToFirst();
                        String path = cursor.getString(columnIndex);
                        cursor.close();

                        callback.onSuccess(path);
                    }
                } else {
                    writeCacheFile(context, uri, getFileNameFromUri(context, uri), callback);
                }
            } else if ("content".equalsIgnoreCase(uri.getScheme())) {

                String path = getDataColumn(context, uri, null, null);
                if (path == null)
                    writeCacheFile(context, uri, getFileNameFromUri(context, uri), callback);
                else callback.onSuccess(path);

            } else if ("file".equalsIgnoreCase(uri.getScheme())) {

                callback.onSuccess(uri.getPath());

            }
        } catch (Throwable e) {
            callback.onError(e);
        }
    }

    public static String getDataColumn(Context context, Uri uri, String selection,
                                       String[] selectionArgs) {

        final String[] projection = {MediaStore.MediaColumns.DATA, MediaStore.MediaColumns.DISPLAY_NAME};
        try (Cursor cursor = context.getContentResolver()
                                    .query(uri, projection, selection, selectionArgs, null)) {
            if (cursor != null && cursor.moveToFirst()) {
                final int columnIndex = cursor.getColumnIndexOrThrow(MediaStore.MediaColumns.DATA);
                return cursor.getString(columnIndex);
            } else return null;
        } catch (Exception e) {
            return null;
        }
    }

    public static void writeCacheFile(Context context, Uri uri, String displayName,
                                      TaskExecutionCallback<String> callback) {
        BackgroundJobScheduler.getInstance().execute(() -> {
            callback.onLongRunningTaskInvoked(0);
            try (InputStream input = context.getContentResolver().openInputStream(uri)) {
                String fileName = (uri.getAuthority() + "." + URLDecoder
                        .decode(uri.getPath(), "UTF-8") + "." + displayName)
                        .replaceAll("[$&+,:;=?@#|'<>.^*()%!-/]", ".");
                File file = new File(getCacheDir(context), fileName);
                if (!file.exists()) {
                    file.createNewFile();
                    try (OutputStream output = new FileOutputStream(file)) {

                        final long fileLength = DocumentFile.fromSingleUri(context, uri).length();
                        long recordedByteLength = 0;
                        byte[] buffer = new byte[4 * 1024];
                        int read;

                        while ((read = input.read(buffer)) != -1) {
                            output.write(buffer, 0, read);
                            recordedByteLength += buffer.length;
                            int progress = (int) (recordedByteLength * 100 / fileLength);
                            callback.onLongRunningTaskInvoked(progress >= 100 ? 100 : progress);
                        }
                        output.flush();
                    }
                }
                callback.onLongRunningTaskInvoked(100);
                callback.onSuccess(file.getAbsolutePath());
            } catch (IOException e) {
                callback.onError(e);
            }
        });
    }

    public static File getCacheDir(Context context) {
        File file = new File(context.getCacheDir(), "media_data");
        if (!file.exists()) file.mkdir();
        return file;
    }

    private static String getRandomFileName() {
        long millis = System.currentTimeMillis();
        return Random.secureRandomInt() + "_" + millis;
    }

    private static String getFileExt(String mimeType) {
        return MimeTypeMap.getSingleton().getExtensionFromMimeType(mimeType);
    }

    private static String getFileNameFromUri(Context context, Uri uri) {
        DocumentFile documentFile = DocumentFile.fromSingleUri(context, uri);
        if (documentFile == null) throw new IllegalArgumentException("Invalid uri");
        String name = documentFile.getName();
        String ext = getFileExt(documentFile.getType());
        if (name != null) {
            if (!name.contains(".") || (ext != null && name.contains(".") && !name
                    .substring(name.lastIndexOf("."))
                    .contains(ext)))
                // The file extension is incorrect, change to correct extension from mimetype
                return name.concat("." + ext);
            else return name;
        } else return getRandomFileName();
    }

    public interface TaskExecutionCallback<T> {

        void onSuccess(T data);

        void onError(Throwable e);

        void onLongRunningTaskInvoked(int progress);
    }
}
