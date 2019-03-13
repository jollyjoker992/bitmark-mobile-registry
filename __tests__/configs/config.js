const APPIUM_CONFIG = {
    HOST: 'localhost',
    PORT: 4723
};

const RUN_CONFIG = {
    platformName: 'iOS',
    platformVersion: '12.1',
    deviceName: 'iPhone X',
    automationName: 'XCUITest',
    app: '/Users/binle/Workspace/src/github.com/bitmark-inc/bitmark-mobile-registry/ios/build/Build/Products/Debug-iphonesimulator/Bitmark Registry dev.app' // relative to root of project
};

const TEST_CONFIG = {
    DEFAULT_TIMEOUT_INTERVAL: 100 * 60 * 1000,
    APP_LOAD_TIMEOUT: 5000,
    CHANGE_SCREEN_TIMEOUT: 5000
};


export {
    APPIUM_CONFIG,
    RUN_CONFIG,
    TEST_CONFIG
};
