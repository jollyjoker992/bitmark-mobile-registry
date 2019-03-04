let localConfig = {};
try {
    localConfig = require('./local-config');
} catch (err) {
    console.log('Local config is not existing');
}

const APPIUM_CONFIG = localConfig.APPIUM_CONFIG || {
    HOST: 'localhost',
    PORT: 4723
};

const RUN_CONFIG = localConfig.RUN_CONFIG || {
    platformName: 'iOS',
    platformVersion: '11.3',
    deviceName: 'iPhone 6',
    automationName: 'XCUITest',
    app: '/Users/dungle/WebstormProjects/bitmark-mobile-registry/ios/build/Build/Products/Debug-iphonesimulator/Bitmark Registry dev.app' // relative to root of project
};

const TEST_CONFIG = localConfig.TEST_CONFIG || {
    DEFAULT_TIMEOUT_INTERVAL: 100 * 60000,
    APP_LOAD_TIMEOUT: 5000,
    CHANGE_SCREEN_TIMEOUT: 5000
};


export {
    APPIUM_CONFIG,
    RUN_CONFIG,
    TEST_CONFIG
};
