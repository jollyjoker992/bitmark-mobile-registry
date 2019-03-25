const path = require('path');
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
    platformVersion: '12.1',
    deviceName: 'iPhone X',
    automationName: 'XCUITest',
    app: process.env.APP_URL || path.join(__dirname, '../../ios/build/Bitmark Registry dev/Build/Products/Debug-iphonesimulator/Bitmark Registry dev.app/') // relative to root of project
};

const TEST_CONFIG = localConfig.TEST_CONFIG || {
    DEFAULT_TIMEOUT_INTERVAL: 100 * 60000,
    APP_LOAD_TIMEOUT: 5000,
    CHANGE_SCREEN_TIMEOUT: 5000
};


module.exports = {
    APPIUM_CONFIG,
    RUN_CONFIG,
    TEST_CONFIG
};