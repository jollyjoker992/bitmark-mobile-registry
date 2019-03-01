import wd from 'wd';
import {APPIUM_CONFIG, RUN_CONFIG, TEST_CONFIG} from '../../configs/config'

jasmine.DEFAULT_TIMEOUT_INTERVAL = TEST_CONFIG.DEFAULT_TIMEOUT_INTERVAL;
const driver = wd.promiseChainRemote(APPIUM_CONFIG.HOST, APPIUM_CONFIG.PORT);

beforeAll(async () => {
    await driver.init(RUN_CONFIG);
    await driver.sleep(TEST_CONFIG.APP_LOAD_TIMEOUT); // wait for app to load
});

test('Creat New Account', async () => {
    let result = await driver
        .waitForElementByName('CREATE NEW ACCOUNT', TEST_CONFIG.CHANGE_SCREEN_TIMEOUT)
        .elementByName('CREATE NEW ACCOUNT').tap()
        .waitForElementByName('SKIP', TEST_CONFIG.CHANGE_SCREEN_TIMEOUT)
        .elementByName('SKIP').tap()
        // iOS popup confirm
        .waitForElementByName('Yes', TEST_CONFIG.CHANGE_SCREEN_TIMEOUT)
        .elementByName("Yes").tap()
        .waitForElementByName('ENABLE', TEST_CONFIG.CHANGE_SCREEN_TIMEOUT)
        .elementByName("ENABLE").tap()
        // iOS popup confirm
        .waitForElementByName('Allow', TEST_CONFIG.CHANGE_SCREEN_TIMEOUT)
        .elementByName("Allow").tap();
});