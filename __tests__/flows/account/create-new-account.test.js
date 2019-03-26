const wd = require('wd');
const { APPIUM_CONFIG, RUN_CONFIG, TEST_CONFIG } = require('../../configs/config');
const { createNewAccountWithoutTouchId, createNewAccountWithTouchId } = require("../../common/common");

jasmine.DEFAULT_TIMEOUT_INTERVAL = TEST_CONFIG.DEFAULT_TIMEOUT_INTERVAL;
const driver = wd.promiseChainRemote(APPIUM_CONFIG.HOST, APPIUM_CONFIG.PORT);

beforeEach(async () => {
    await driver.init(RUN_CONFIG);
    await driver.sleep(TEST_CONFIG.APP_LOAD_TIMEOUT); // wait for app to load
});

// TEST CASES
test('Creat New Account - Enable Touch Id', async () => {
    await createNewAccountWithTouchId(driver);
});

test('Creat New Account - Skip Touch Id', async () => {
    await createNewAccountWithoutTouchId(driver);
});