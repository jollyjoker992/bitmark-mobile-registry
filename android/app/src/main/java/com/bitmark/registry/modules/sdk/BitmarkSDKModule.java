package com.bitmark.registry.modules.sdk;

import android.app.Activity;
import android.text.TextUtils;

import com.bitmark.apiservice.configuration.GlobalConfiguration;
import com.bitmark.apiservice.configuration.Network;
import com.bitmark.apiservice.params.IssuanceParams;
import com.bitmark.apiservice.params.RegistrationParams;
import com.bitmark.apiservice.params.TransferOfferParams;
import com.bitmark.apiservice.params.TransferParams;
import com.bitmark.apiservice.params.TransferResponseParams;
import com.bitmark.apiservice.params.query.AssetQueryBuilder;
import com.bitmark.apiservice.params.query.BitmarkQueryBuilder;
import com.bitmark.apiservice.params.query.TransactionQueryBuilder;
import com.bitmark.apiservice.response.GetBitmarkResponse;
import com.bitmark.apiservice.response.GetBitmarksResponse;
import com.bitmark.apiservice.response.GetTransactionResponse;
import com.bitmark.apiservice.response.GetTransactionsResponse;
import com.bitmark.apiservice.response.RegistrationResponse;
import com.bitmark.apiservice.utils.Address;
import com.bitmark.apiservice.utils.Data;
import com.bitmark.apiservice.utils.Pair;
import com.bitmark.apiservice.utils.callback.Callable1;
import com.bitmark.apiservice.utils.callback.Callback0;
import com.bitmark.apiservice.utils.callback.Callback1;
import com.bitmark.apiservice.utils.record.AssetRecord;
import com.bitmark.apiservice.utils.record.BitmarkRecord;
import com.bitmark.apiservice.utils.record.OfferRecord;
import com.bitmark.cryptography.crypto.Ed25519;
import com.bitmark.cryptography.crypto.key.KeyPair;
import com.bitmark.cryptography.crypto.key.PrivateKey;
import com.bitmark.cryptography.error.ValidateException;
import com.bitmark.registry.BuildConfig;
import com.bitmark.registry.encryption.AssetEncryption;
import com.bitmark.registry.encryption.BoxEncryption;
import com.bitmark.registry.encryption.PublicKeyEncryption;
import com.bitmark.registry.encryption.SessionData;
import com.bitmark.registry.utils.NetworkMapper;
import com.bitmark.registry.utils.error.NativeModuleException;
import com.bitmark.sdk.authentication.KeyAuthenticationSpec;
import com.bitmark.sdk.authentication.error.AuthenticationRequiredException;
import com.bitmark.sdk.features.Account;
import com.bitmark.sdk.features.Asset;
import com.bitmark.sdk.features.Bitmark;
import com.bitmark.sdk.features.BitmarkSDK;
import com.bitmark.sdk.features.Transaction;
import com.bitmark.sdk.utils.SharedPreferenceApi;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.ReadableMap;

import java.io.File;
import java.io.IOException;
import java.security.InvalidKeyException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static com.bitmark.apiservice.utils.Awaitility.await;
import static com.bitmark.cryptography.crypto.encoder.Hex.HEX;
import static com.bitmark.cryptography.crypto.encoder.Raw.RAW;
import static com.bitmark.registry.keymanagement.ApiKeyManager.API_KEY_MANAGER;
import static com.bitmark.registry.utils.DataTypeMapper.toJson;
import static com.bitmark.registry.utils.DataTypeMapper.toStringArray;
import static com.bitmark.registry.utils.DataTypeMapper.toStringMap;
import static com.bitmark.registry.utils.DataTypeMapper.toWritableArray;
import static com.bitmark.registry.utils.DataTypeMapper.toWritableMap;
import static com.bitmark.sdk.authentication.error.AuthenticationRequiredException.PASSWORD;
import static com.bitmark.sdk.utils.FileUtils.isValid;
import static com.bitmark.sdk.utils.FileUtils.read;
import static com.bitmark.sdk.utils.FileUtils.write;

public class BitmarkSDKModule extends ReactContextBaseJavaModule implements BitmarkSDKExposable {

    private static final String ERROR_UNEXPECTED_CODE = "ERROR_UNEXPECTED";

    private static final String ERROR_GET_ACCOUNT_CODE = "ERROR_GET_ACCOUNT";

    private static final String ACTIVE_ACCOUNT_NUMBER = "active_account_number";

    private String accountNumber;

    BitmarkSDKModule(ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @Override
    public String getName() {
        return "BitmarkSDK";
    }

    @ReactMethod
    @Override
    public void sdkInit(String network, Promise promise) {
        try {

            Network networkConfigure = NetworkMapper.from(network);

            String apiKey = networkConfigure == Network.TEST_NET ? "bmk-lljpzkhqdkzmblhg" :
                    API_KEY_MANAGER.getBitmarkApiKey();
            try {
                BitmarkSDK.init(GlobalConfiguration.builder().withApiToken(apiKey)
                                                   .withNetwork(networkConfigure));
                promise.resolve(true);
            } catch (UnsupportedOperationException e) {
                promise.resolve(true);
            }

        } catch (Throwable e) {
            promise.reject("ERROR_SDK_INIT", e);
        }
    }

    @ReactMethod
    @Override
    public void createAccount(Boolean authentication, Promise promise) {
        try {

            final Account account = new Account();
            saveAccountNumber(account.getAccountNumber());
            KeyAuthenticationSpec spec = new KeyAuthenticationSpec.Builder(
                    getReactApplicationContext()).setAuthenticationRequired(authentication)
                                                 .setAuthenticationValidityDuration(10 * 60)
                                                 .build();
            account.saveToKeyStore(getAttachedActivity(), spec, new Callback0() {
                @Override
                public void onSuccess() {
                    promise.resolve(null);
                }

                @Override
                public void onError(Throwable throwable) {
                    if (!handleKeyStoreException(throwable, promise))
                        promise.reject("ERROR_SAVE_KEY_STORE", throwable);
                }
            });

        } catch (Throwable e) {
            promise.reject(ERROR_UNEXPECTED_CODE, e);
        }
    }

    @ReactMethod
    @Override
    public void createAccountFromPhrase(ReadableArray phraseWords, Boolean authentication,
                                        Promise promise) {
        try {

            final Account account = Account.fromRecoveryPhrase(toStringArray(phraseWords));
            saveAccountNumber(account.getAccountNumber());
            KeyAuthenticationSpec spec = new KeyAuthenticationSpec.Builder(
                    getReactApplicationContext()).setAuthenticationRequired(authentication)
                                                 .setAuthenticationValidityDuration(10 * 60)
                                                 .build();
            account.saveToKeyStore(getAttachedActivity(), spec, new Callback0() {
                @Override
                public void onSuccess() {
                    Map<String, Object> accountMap = new HashMap<>();
                    accountMap.put("account_number", account.getAccountNumber());
                    promise.resolve(toWritableMap(accountMap));
                }

                @Override
                public void onError(Throwable throwable) {
                    if (!handleKeyStoreException(throwable, promise))
                        promise.reject("ERROR_SAVE_KEY_STORE", throwable);
                }
            });

        } catch (Throwable e) {
            promise.reject(ERROR_UNEXPECTED_CODE, e);
        }
    }

    @ReactMethod
    @Override
    public void removeAccount(Promise promise) throws NativeModuleException {
        getAccount(promise, new Callback1<Account>() {
            @Override
            public void onSuccess(Account account) {
                try {
                    account.removeFromKeyStore(getAttachedActivity(),
                            new KeyAuthenticationSpec.Builder(getReactApplicationContext()).build(),
                            new Callback0() {
                                @Override
                                public void onSuccess() {
                                    promise.resolve(account.getAccountNumber());
                                }

                                @Override
                                public void onError(Throwable throwable) {
                                    if (!handleKeyStoreException(throwable, promise))
                                        promise.reject("ERROR_REMOVE_ACCOUNT", throwable);
                                }
                            });
                } catch (NativeModuleException e) {
                    e.printStackTrace();
                    promise.reject(e);
                }
            }

            @Override
            public void onError(Throwable throwable) {
                promise.reject(ERROR_GET_ACCOUNT_CODE, throwable);
            }
        });
    }

    @ReactMethod
    @Override
    public void accountInfo(Promise promise) throws NativeModuleException {
        getAccount(promise, new Callback1<Account>() {
            @Override
            public void onSuccess(Account account) {
                promise.resolve(toWritableArray(account.getAccountNumber(), account
                        .getRecoveryPhrase().getMnemonicWords(), 0x01, HEX.encode(
                        account.getEncryptionKey().publicKey().toBytes())));

            }

            @Override
            public void onError(Throwable throwable) {
                promise.reject(ERROR_GET_ACCOUNT_CODE, throwable);
            }
        });
    }

    @ReactMethod
    @Override
    public void sign(ReadableArray messages, Promise promise) throws NativeModuleException {
        getAccount(promise, new Callback1<Account>() {
            @Override
            public void onSuccess(Account account) {
                PrivateKey key = account.getKeyPair().privateKey();
                String[] messageArray = toStringArray(messages);
                String[] signatures = new String[messageArray.length];

                for (int i = 0, size = messageArray.length; i < size; i++) {
                    String message = messageArray[i];
                    signatures[i] = HEX.encode(Ed25519.sign(RAW.decode(message), key.toBytes()));
                }

                promise.resolve(toWritableArray(signatures));
            }

            @Override
            public void onError(Throwable throwable) {
                promise.reject(ERROR_GET_ACCOUNT_CODE, throwable);
            }
        });
    }

    @ReactMethod
    @Override
    public void signHexData(ReadableArray messages, Promise promise) throws NativeModuleException {
        getAccount(promise, new Callback1<Account>() {
            @Override
            public void onSuccess(Account account) {
                PrivateKey key = account.getKeyPair().privateKey();
                String[] messageArray = toStringArray(messages);
                String[] signatures = new String[messageArray.length];

                for (int i = 0, size = messageArray.length; i < size; i++) {
                    String message = messageArray[i];
                    signatures[i] = HEX.encode(
                            Ed25519.sign(HEX.decode(message), key.toBytes()));
                }

                promise.resolve(toWritableArray(signatures));
            }

            @Override
            public void onError(Throwable throwable) {
                promise.reject(ERROR_GET_ACCOUNT_CODE, throwable);
            }
        });
    }

    @ReactMethod
    @Override
    public void issue(ReadableMap params, Promise promise) throws NativeModuleException {

        Map<String, String> metadata = toStringMap(params.getMap("metadata"));
        String assetName = params.getString("asset_name");
        String filePath = params.getString("file_path");
        File file = new File(filePath);

        if (TextUtils.isEmpty(assetName) || TextUtils.isEmpty(filePath) || !isValid(
                file)) {
            promise.reject(ERROR_UNEXPECTED_CODE, new NativeModuleException("Invalid params"));
            return;
        }

        int optQuantity = 1;
        if (params.hasKey("quantity")) optQuantity = params.getInt("quantity");

        final int quantity = optQuantity;

        getAccount(promise, new Callback1<Account>() {
            @Override
            public void onSuccess(Account account) {

                Address owner = account.toAddress();
                KeyPair keyPair = account.getKeyPair();


                try {

                    // Register asset
                    RegistrationParams registrationParams = new RegistrationParams(assetName,
                            metadata, owner);
                    registrationParams.generateFingerprint(file);
                    registrationParams.sign(keyPair);
                    String assetId = await((Callable1<RegistrationResponse>) callback -> Asset
                            .register(registrationParams, callback)).getAssets().get(0).getId();


                    // Issue bitmark
                    IssuanceParams issuanceParams = new IssuanceParams(assetId, owner,
                            quantity);
                    issuanceParams.sign(keyPair);
                    List<String> bitmarkIds = await(
                            callback -> Bitmark.issue(issuanceParams, callback));
                    promise.resolve(toWritableArray(bitmarkIds));

                } catch (Throwable throwable) {
                    promise.reject(ERROR_UNEXPECTED_CODE, throwable);
                }

            }

            @Override
            public void onError(Throwable throwable) {
                promise.reject(ERROR_GET_ACCOUNT_CODE, throwable);
            }
        });
    }

    @Override
    public void giveAwayBitmark(ReadableMap params, Promise promise)
            throws NativeModuleException {

        String assetId = params.getString("asset_id");
        String receiver = params.getString("recipient");

        if (TextUtils.isEmpty(assetId) || TextUtils.isEmpty(receiver)) {
            promise.reject(ERROR_UNEXPECTED_CODE, new NativeModuleException("Invalid Params"));
            return;
        }

        getAccount(promise, new Callback1<Account>() {
            @Override
            public void onSuccess(Account account) {

                try {

                    // Issue bitmark
                    Address owner = account.toAddress();
                    IssuanceParams issuanceParams = new IssuanceParams(assetId, owner);
                    issuanceParams.sign(account.getKeyPair());
                    List<String> bitmarkIds = await(
                            callback -> Bitmark.issue(issuanceParams, callback));

                    // Create Transfer payload
                    String bitmarkId = bitmarkIds.get(0);
                    GetBitmarkResponse response = await(
                            callback -> Bitmark.get(bitmarkId, callback));
                    BitmarkRecord bitmark = response.getBitmark();
                    if (bitmark == null) {
                        promise.reject(ERROR_UNEXPECTED_CODE,
                                new NativeModuleException("Bitmark is not existed"));
                        return;
                    }

                    String link = bitmark.getHeadId();
                    TransferParams transferParams = new TransferParams(
                            Address.fromAccountNumber(receiver), link);
                    promise.resolve(toWritableArray(bitmarkId, transferParams));

                } catch (Throwable throwable) {
                    promise.reject(ERROR_UNEXPECTED_CODE, throwable);
                }

            }

            @Override
            public void onError(Throwable throwable) {
                promise.reject(ERROR_GET_ACCOUNT_CODE, throwable);
            }
        });
    }

    @ReactMethod
    @Override
    public void transfer(ReadableMap params, Promise promise) throws NativeModuleException {

        String bitmarkId = params.getString("bitmark_id");
        String receiver = params.getString("recipient");

        if (TextUtils.isEmpty(bitmarkId) || TextUtils.isEmpty(receiver)) {
            promise.reject(ERROR_UNEXPECTED_CODE, new NativeModuleException("Invalid Params"));
            return;
        }

        getAccount(promise, new Callback1<Account>() {
            @Override
            public void onSuccess(Account account) {

                try {
                    GetBitmarkResponse response = await(
                            callback -> Bitmark.get(bitmarkId, callback));
                    BitmarkRecord bitmark = response.getBitmark();
                    if (bitmark == null) {
                        promise.reject(ERROR_UNEXPECTED_CODE,
                                new NativeModuleException("Bitmark is not existed"));
                        return;
                    }

                    String link = bitmark.getHeadId();

                    TransferParams transferParams = new TransferParams(
                            Address.fromAccountNumber(receiver), link);
                    transferParams.sign(account.getKeyPair());
                    String txId = await(callback -> Bitmark.transfer(transferParams, callback));
                    promise.resolve(txId);

                } catch (Throwable throwable) {
                    promise.reject(ERROR_UNEXPECTED_CODE, throwable);
                }

            }

            @Override
            public void onError(Throwable throwable) {
                promise.reject(ERROR_GET_ACCOUNT_CODE, throwable);
            }
        });
    }

    @ReactMethod
    @Override
    public void offer(ReadableMap params, Promise promise) throws NativeModuleException {

        String bitmarkId = params.getString("bitmark_id");
        String receiver = params.getString("recipient");

        if (TextUtils.isEmpty(bitmarkId) || TextUtils.isEmpty(receiver)) {
            promise.reject(new NativeModuleException("Invalid Params"));
            return;
        }

        getAccount(promise, new Callback1<Account>() {
            @Override
            public void onSuccess(Account account) {

                try {
                    GetBitmarkResponse response = await(
                            callback -> Bitmark.get(bitmarkId, callback));
                    BitmarkRecord bitmark = response.getBitmark();
                    if (bitmark == null) {
                        promise.reject(ERROR_UNEXPECTED_CODE,
                                new NativeModuleException("Bitmark is not existed"));
                        return;
                    }

                    String link = bitmark.getHeadId();

                    TransferOfferParams offerParams = new TransferOfferParams(
                            Address.fromAccountNumber(receiver), link);
                    offerParams.sign(account.getKeyPair());
                    String txId = await(callback -> Bitmark.offer(offerParams, callback));
                    promise.resolve(txId);

                } catch (Throwable throwable) {
                    promise.reject(ERROR_UNEXPECTED_CODE, throwable);
                }
            }

            @Override
            public void onError(Throwable throwable) {
                promise.reject(ERROR_GET_ACCOUNT_CODE, throwable);
            }
        });
    }

    @ReactMethod
    @Override
    public void response(ReadableMap params, Promise promise)
            throws NativeModuleException {

        String bitmarkId = params.getString("bitmark_id");
        String response = params.getString("response");

        if (TextUtils.isEmpty(bitmarkId) || TextUtils.isEmpty(response)) {
            promise.reject(ERROR_UNEXPECTED_CODE, new NativeModuleException("Invalid Params"));
            return;
        }

        getAccount(promise, new Callback1<Account>() {
            @Override
            public void onSuccess(Account account) {

                try {
                    GetBitmarkResponse getBitmarkResponse = await(
                            callback -> Bitmark.get(bitmarkId, callback));
                    BitmarkRecord bitmark = getBitmarkResponse.getBitmark();
                    if (bitmark == null) {
                        promise.reject(ERROR_UNEXPECTED_CODE,
                                new NativeModuleException("Bitmark is not existed"));
                        return;
                    }

                    OfferRecord offerRecord = bitmark.getOffer();
                    final Data<TransferResponseParams> wrapperTransferResponseParams = new Data<>();

                    switch (response) {
                        case "accept":
                            wrapperTransferResponseParams
                                    .setValue(TransferResponseParams.accept(offerRecord));
                        case "reject":
                            wrapperTransferResponseParams
                                    .setValue(TransferResponseParams.reject(offerRecord));
                        case "cancel":
                            wrapperTransferResponseParams.setValue(TransferResponseParams
                                    .cancel(offerRecord, bitmark.getOwner()));
                        default:
                            promise.reject(new NativeModuleException("Invalid response type"));

                    }

                    TransferResponseParams responseParams = wrapperTransferResponseParams
                            .getValue();
                    if (responseParams == null) return;

                    responseParams.sign(account.getKeyPair());
                    String status = await(
                            callback -> Bitmark.respond(responseParams, callback));
                    promise.resolve(status);

                } catch (Throwable throwable) {
                    promise.reject(ERROR_UNEXPECTED_CODE, throwable);
                }
            }

            @Override
            public void onError(Throwable throwable) {
                promise.reject(ERROR_GET_ACCOUNT_CODE, throwable);
            }
        });
    }

    @ReactMethod
    @Override
    public void tryPhrase(ReadableArray phraseWords, Promise promise) {
        try {
            String[] phraseWordArray = toStringArray(phraseWords);
            Account.fromRecoveryPhrase(phraseWordArray);
            promise.resolve(true);
        } catch (ValidateException e) {
            promise.resolve(false);
        }
    }

    @ReactMethod
    @Override
    public void getAssetInfo(String filePath, Promise promise) throws NativeModuleException {

        File file = new File(filePath);
        if (!file.exists() || file.isDirectory()) {
            promise.reject(ERROR_UNEXPECTED_CODE, new NativeModuleException(
                    "Invalid file. The file is not existed or a directory"));
            return;
        }

        try {

            String fingerprint = RegistrationParams.computeFingerprint(file);
            String assetId = HEX.encode(RAW.decode(fingerprint));
            promise.resolve(toWritableArray(assetId, fingerprint));

        } catch (Throwable e) {
            promise.reject(ERROR_UNEXPECTED_CODE, e);
        }
    }

    @ReactMethod
    @Override
    public void validateMetadata(ReadableMap metadataMap, Promise promise) {
        try {

            Map<String, String> metadata = toStringMap(metadataMap);
            String packedMetadata = RegistrationParams.getPackedMetadata(metadata);
            if (RAW.decode(packedMetadata).length <= 2048) promise.resolve(true);
            else promise.resolve(false);

        } catch (Throwable e) {
            promise.reject(ERROR_UNEXPECTED_CODE, e);
        }
    }

    @ReactMethod
    @Override
    public void validateAccountNumber(String accountNumber, Promise promise) {
        try {

            promise.resolve(Account.isValidAccountNumber(accountNumber));

        } catch (Throwable e) {
            promise.reject(ERROR_UNEXPECTED_CODE, e);
        }
    }

    @ReactMethod
    @Override
    public void getBitmarks(ReadableMap params, Promise promise) {

        try {

            String owner = null;
            if (params.hasKey("owner")) owner = params.getString("owner");
            String issuedBy = null;
            if (params.hasKey("issuer")) issuedBy = params.getString("issuer");
            Boolean isPending = null;
            if (params.hasKey("pending")) isPending = params.getBoolean("pending");
            String offerTo = null;
            if (params.hasKey("offer_to")) offerTo = params.getString("offer_to");
            String offerFrom = null;
            if (params.hasKey("offer_from")) offerFrom = params.getString("offer_from");
            ReadableArray bitmarkIdsArray = null;
            if (params.hasKey("bitmark_ids")) bitmarkIdsArray = params.getArray("bitmark_ids");
            String[] bitmarkIds = bitmarkIdsArray != null ? toStringArray(bitmarkIdsArray) : null;
            String referencedAssetId = null;
            if (params.hasKey("asset_id"))
                referencedAssetId = params.getString("asset_id");
            Boolean loadAsset = null;
            if (params.hasKey("load_asset")) loadAsset = params.getBoolean("load_asset");
            Integer at = null;
            if (params.hasKey("at")) at = params.getInt("at");
            String to = null;
            if (params.hasKey("to")) to = params.getString("to");
            Integer limit = null;
            if (params.hasKey("limit")) limit = params.getInt("limit");

            BitmarkQueryBuilder builder = new BitmarkQueryBuilder();
            if (!TextUtils.isEmpty(owner)) builder.ownedBy(owner);
            if (!TextUtils.isEmpty(issuedBy)) builder.issuedBy(issuedBy);
            if (!TextUtils.isEmpty(offerTo)) builder.offerTo(offerTo);
            if (!TextUtils.isEmpty(offerFrom)) builder.offerFrom(offerFrom);
            if (bitmarkIds != null) builder.bitmarkIds(bitmarkIds);
            if (!TextUtils.isEmpty(referencedAssetId)) builder.referencedAssetId(referencedAssetId);
            if (loadAsset != null) builder.loadAsset(loadAsset);
            if (isPending != null) builder.pending(isPending);
            if (at != null) builder.at((long) at);
            if (!TextUtils.isEmpty(to)) builder.to(to);
            if (limit != null) builder.limit(limit);

            GetBitmarksResponse response = await(callback -> Bitmark.list(builder, callback));
            promise.resolve(toWritableArray(response.getBitmarks(), response.getAssets()));
        } catch (Throwable throwable) {
            promise.reject(ERROR_UNEXPECTED_CODE, throwable);
        }

    }

    @ReactMethod
    @Override
    public void getBitmark(ReadableMap params, Promise promise) {

        try {

            String id = params.getString("bitmark_id");
            Data<Boolean> wrapperIncludeAsset = new Data<>();
            if (params.hasKey("load_asset"))
                wrapperIncludeAsset.setValue(params.getBoolean("load_asset"));

            final Boolean includeAsset = wrapperIncludeAsset.getValue();

            GetBitmarkResponse response = await(callback ->
            {
                if (includeAsset != null) Bitmark.get(id, includeAsset, callback);
                else Bitmark.get(id, callback);
            });
            promise.resolve(toWritableArray(response.getBitmark(), response.getAsset()));

        } catch (Throwable throwable) {
            promise.reject(ERROR_UNEXPECTED_CODE, throwable);
        }

    }

    @ReactMethod
    @Override
    public void getAsset(String id, Promise promise) {
        try {

            AssetRecord asset = await(callback -> Asset.get(id, callback));
            promise.resolve(toJson(asset));

        } catch (Throwable e) {
            promise.reject(ERROR_UNEXPECTED_CODE, e);
        }
    }

    @ReactMethod
    @Override
    public void getAssets(ReadableMap params, Promise promise) {
        try {

            String registrant = null;
            if (params.hasKey("registrant")) registrant = params.getString("registrant");

            ReadableArray assetIdArray = null;
            if (params.hasKey("asset_ids")) assetIdArray = params.getArray("asset_ids");
            String[] assetIds = assetIdArray == null ? null : toStringArray(assetIdArray);

            Integer limit = null;
            if (params.hasKey("limit")) limit = params.getInt("limit");

            AssetQueryBuilder builder = new AssetQueryBuilder();
            if (!TextUtils.isEmpty(registrant)) builder.registrant(registrant);
            if (assetIds != null) builder.assetIds(assetIds);
            if (limit != null) builder.limit(limit);

            List<AssetRecord> assets = await(callback -> Asset.list(builder, callback));
            promise.resolve(toJson(assets));

        } catch (Throwable e) {
            promise.reject(ERROR_UNEXPECTED_CODE, e);
        }
    }

    @ReactMethod
    @Override
    public void getTx(ReadableMap params, Promise promise) {
        try {

            String id = params.getString("tx_id");
            Data<Boolean> wrapperIncludeAsset = new Data<>();
            if (params.hasKey("load_asset"))
                wrapperIncludeAsset.setValue(params.getBoolean("load_asset"));

            final Boolean includeAsset = wrapperIncludeAsset.getValue();

            GetTransactionResponse response = await(callback ->
            {
                if (includeAsset != null) Transaction.get(id, includeAsset, callback);
                else Transaction.get(id, callback);
            });
            promise.resolve(toWritableArray(response.getTransaction(), response.getAsset()));

        } catch (Throwable e) {
            promise.reject(ERROR_UNEXPECTED_CODE, e);
        }
    }

    @ReactMethod
    @Override
    public void getTxs(ReadableMap params, Promise promise) {
        try {

            String owner = null;
            if (params.hasKey("owner")) owner = params.getString("owner");

            String assetId = null;
            if (params.hasKey("asset_id")) assetId = params.getString("asset_id");

            String bitmarkId = null;
            if (params.hasKey("bitmark_id")) bitmarkId = params.getString("bitmark_id");

            Boolean loadAsset = null;
            if (params.hasKey("load_asset")) loadAsset = params.getBoolean("load_asset");

            Integer limit = null;
            if (params.hasKey("limit")) limit = params.getInt("limit");

            TransactionQueryBuilder builder = new TransactionQueryBuilder();
            if (!TextUtils.isEmpty(owner)) builder.ownedBy(owner);
            if (!TextUtils.isEmpty(assetId)) builder.referenceAsset(assetId);
            if (!TextUtils.isEmpty(bitmarkId)) builder.referenceBitmark(bitmarkId);
            if (loadAsset != null) builder.loadAsset(loadAsset);
            if (limit != null) builder.limit(limit);

            GetTransactionsResponse response = await(
                    callback -> Transaction.list(builder, callback));
            promise.resolve(toWritableArray(response.getTransactions(), response.getAssets()));

        } catch (Throwable e) {
            promise.reject(ERROR_UNEXPECTED_CODE, e);
        }
    }

    @Override
    public void encryptFile(ReadableMap params, Promise promise) throws NativeModuleException {

        final File inputFile = new File(params.getString("file_path"));
        final String receiver = params.getString("recipient");
        final File outputFile = new File(params.getString("output_file_path"));

        if (!isValid(inputFile) || isValid(outputFile) || TextUtils
                .isEmpty(receiver)) {
            promise.reject(ERROR_UNEXPECTED_CODE, new NativeModuleException("Invalid params"));
            return;
        }

        getAccount(promise, new Callback1<Account>() {
            @Override
            public void onSuccess(Account account) {

                final AssetEncryption assetEncryption = new AssetEncryption();
                final byte[] receiverPubKey = HEX.decode(receiver);
                final PublicKeyEncryption keyEncryption = new BoxEncryption(
                        account.getEncryptionKey().privateKey().toBytes());

                try {
                    Pair<byte[], SessionData> result = assetEncryption
                            .encrypt(inputFile, receiverPubKey, keyEncryption);
                    byte[] data = result.first();
                    write(outputFile, data);
                    promise.resolve(result.second().toMap());

                } catch (IOException e) {
                    promise.reject(e);
                }

            }

            @Override
            public void onError(Throwable throwable) {
                promise.reject(ERROR_GET_ACCOUNT_CODE, throwable);
            }
        });

    }

    @Override
    public void decryptFile(ReadableMap params, Promise promise) throws NativeModuleException {

        final File inputFile = new File(params.getString("encrypted_file_path"));
        final String sender = params.getString("sender");
        final File outputFile = new File(params.getString("output_file_path"));
        final SessionData sessionData = SessionData.fromReadableMap(params.getMap("session_data"));


        if (!isValid(inputFile) || isValid(outputFile) || TextUtils
                .isEmpty(sender)) {
            promise.reject(ERROR_UNEXPECTED_CODE, new NativeModuleException("Invalid params"));
            return;
        }

        getAccount(promise, new Callback1<Account>() {
            @Override
            public void onSuccess(Account account) {

                try {
                    final byte[] encryptedData = read(inputFile);
                    final byte[] senderPubKey = HEX.decode(sender);
                    final PublicKeyEncryption keyEncryption = new BoxEncryption(
                            account.getEncryptionKey().privateKey().toBytes());

                    final AssetEncryption assetEncryption = AssetEncryption
                            .fromSessionData(keyEncryption, sessionData, senderPubKey);
                    final byte[] decryptedData = assetEncryption.decrypt(encryptedData);
                    write(outputFile, decryptedData);
                    promise.resolve(true);

                } catch (IOException e) {
                    promise.reject(e);
                }

            }

            @Override
            public void onError(Throwable throwable) {
                promise.reject(ERROR_GET_ACCOUNT_CODE, throwable);
            }
        });
    }

    @Override
    public void encryptSessionData(ReadableMap params, Promise promise)
            throws NativeModuleException {

        if (!params.hasKey("session_data")) throw new NativeModuleException("Missing Session Data");
        final Map<String, String> sessionDataMap = toStringMap(params.getMap("session_data"));
        final String receiver = params.getString("receiver_pub_key");
        final String encryptionDataKey = sessionDataMap.get("enc_data_key");

        if (TextUtils.isEmpty(encryptionDataKey) || TextUtils.isEmpty(receiver)) {
            promise.reject(ERROR_UNEXPECTED_CODE, new NativeModuleException("Invalid params"));
            return;
        }

        getAccount(promise, new Callback1<Account>() {
            @Override
            public void onSuccess(Account account) {

                final byte[] receiverPubKey = HEX.decode(receiver);
                final PublicKeyEncryption keyEncryption = new BoxEncryption(
                        account.getEncryptionKey().privateKey().toBytes());
                final byte[] key = keyEncryption.decrypt(HEX.decode(encryptionDataKey),
                        account.getEncryptionKey().publicKey().toBytes());

                final SessionData sessionData = SessionData
                        .getDefault(key, receiverPubKey, keyEncryption);
                promise.resolve(sessionData.toMap());
            }

            @Override
            public void onError(Throwable throwable) {
                promise.reject(ERROR_GET_ACCOUNT_CODE, throwable);
            }
        });

    }

    @Override
    public void registerNewAsset(ReadableMap params, Promise promise)
            throws NativeModuleException {

        final File file = new File(params.getString("url"));
        final String name = params.getString("property_name");
        final Map<String, String> metadata = toStringMap(params.getMap("metadata"));

        if (!isValid(file) || TextUtils.isEmpty(name)) {
            promise.reject(ERROR_UNEXPECTED_CODE, new NativeModuleException("Invalid params"));
            return;
        }

        getAccount(promise, new Callback1<Account>() {
            @Override
            public void onSuccess(Account account) {

                try {
                    // Register Asset
                    RegistrationParams registrationParams = new RegistrationParams(name, metadata,
                            account.toAddress());
                    registrationParams.generateFingerprint(file);
                    registrationParams.sign(account.getKeyPair());
                    RegistrationResponse res = await(
                            callback -> Asset.register(registrationParams, callback));
                    String assetId = res.getAssets().get(0).getId();

                    // Issue new bitmark
                    IssuanceParams issuanceParams = new IssuanceParams(assetId,
                            account.toAddress());
                    issuanceParams.sign(account.getKeyPair());
                    List<String> bitmarkIds = await(
                            callback -> Bitmark.issue(issuanceParams, callback));
                    String bitmarkId = bitmarkIds.get(0);

                    promise.resolve(new String[]{bitmarkId, assetId});

                } catch (Throwable throwable) {
                    promise.reject(ERROR_UNEXPECTED_CODE, throwable);
                }

            }

            @Override
            public void onError(Throwable throwable) {
                promise.reject(ERROR_GET_ACCOUNT_CODE, throwable);
            }
        });
    }

    private void getAccount(Promise promise, Callback1<Account> callback)
            throws NativeModuleException {
        KeyAuthenticationSpec spec = new KeyAuthenticationSpec.Builder(
                getReactApplicationContext()).build();
        Account.loadFromKeyStore(getAttachedActivity(), getAccountNumber(), spec,
                new Callback1<Account>() {
                    @Override
                    public void onSuccess(Account account) {
                        callback.onSuccess(account);
                    }

                    @Override
                    public void onError(Throwable throwable) {
                        if (!handleKeyStoreException(throwable, promise))
                            callback.onError(throwable);
                    }
                });
    }

    private Activity getAttachedActivity() throws NativeModuleException {
        Activity activity = getCurrentActivity();
        if (activity == null) throw new NativeModuleException("Has not attached to any activity");
        return activity;
    }

    private String getAccountNumber() {
        if (!TextUtils.isEmpty(accountNumber)) return accountNumber;
        else {
            return accountNumber = new SharedPreferenceApi(getReactApplicationContext(),
                    BuildConfig.APPLICATION_ID).get(ACTIVE_ACCOUNT_NUMBER, String.class);
        }
    }

    private void saveAccountNumber(String accountNumber) {
        new SharedPreferenceApi(getReactApplicationContext(), BuildConfig.APPLICATION_ID)
                .put(ACTIVE_ACCOUNT_NUMBER, accountNumber);
    }

    private boolean handleKeyStoreException(Throwable throwable, Promise promise) {
        if (throwable instanceof AuthenticationRequiredException) {
            AuthenticationRequiredException ex = (AuthenticationRequiredException) throwable;
            if (ex.getType().equals(PASSWORD))
                promise.reject("PASSCODE_SET_UP_REQUIRED", throwable);
            else promise.reject("BIOMETRIC_SET_UP_REQUIRED", throwable);
            return true;
        } else if (throwable instanceof InvalidKeyException) {
            promise.reject("UNREADABLE_KEY", throwable);
            return true;
        } else return false;
    }

}
