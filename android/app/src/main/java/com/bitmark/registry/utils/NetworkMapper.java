package com.bitmark.registry.utils;

import com.bitmark.apiservice.configuration.Network;

public class NetworkMapper {

    private NetworkMapper() {
    }

    public static Network from(String network) {
        switch (network) {
            case "testnet":
                return Network.TEST_NET;
            case "livenet":
                return Network.LIVE_NET;
            default:
                throw new UnsupportedOperationException("Invalid network");
        }
    }


}
