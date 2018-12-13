package com.bitmark.registry;

import com.bitmark.sdk.authentication.StatefulReactActivity;

public class MainActivity extends StatefulReactActivity {

    /**
     * Returns the name of the main component registered from JavaScript.
     * This is used to schedule rendering of the component.
     */
    @Override
    protected String getMainComponentName() {
        return "Bitmark";
    }
}
