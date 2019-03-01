import wd from 'wd';
import {APPIUM_CONFIG, RUN_CONFIG, TEST_CONFIG} from '../../configs/config'

jasmine.DEFAULT_TIMEOUT_INTERVAL = TEST_CONFIG.DEFAULT_TIMEOUT_INTERVAL;
const driver = wd.promiseChainRemote(APPIUM_CONFIG.HOST, APPIUM_CONFIG.PORT);

beforeAll(async () => {
    await driver.init(RUN_CONFIG);
    await driver.sleep(TEST_CONFIG.APP_LOAD_TIMEOUT); // wait for app to load
});

const phraseWords = ['bag', 'level', 'quote', 'meat', 'eye', 'vendor', 'clutch', 'snap', 'truck', 'elite', 'grant', 'valley'];

test('Access Existing Account', async () => {
    await driver.sleep(2000);

    // Go to ACCESS EXISTING ACCOUNT screen
    let result = await driver
        .waitForElementByName('ACCESS EXISTING ACCOUNT', TEST_CONFIG.CHANGE_SCREEN_TIMEOUT)
        .elementByName('ACCESS EXISTING ACCOUNT').tap()
        .waitForElementByName('SUBMIT', TEST_CONFIG.CHANGE_SCREEN_TIMEOUT);

    // Input words
    for (let i = 0; i < phraseWords.length; i++) {
        let input = await driver.elementByAccessibilityId(`input_word_${i}`);
        await input.type(phraseWords[i]);
    }

    // Submit words and finish login steps
    await driver
        .waitForElementByName('Done', TEST_CONFIG.CHANGE_SCREEN_TIMEOUT)
        .elementByName('Done').tap()
        .sleep(3000)
        .elementByName('SUBMIT').tap()
        // Touch Screen
        .waitForElementByName('SKIP', TEST_CONFIG.CHANGE_SCREEN_TIMEOUT)
        .elementByName('SKIP').tap()
        // iOS popup confirm
        .waitForElementByName('Yes', TEST_CONFIG.CHANGE_SCREEN_TIMEOUT)
        .elementByName("Yes").tap()
        // Notification
        .waitForElementByName('ENABLE', TEST_CONFIG.CHANGE_SCREEN_TIMEOUT)
        .elementByName("ENABLE").tap()
        // iOS popup confirm
        .waitForElementByName('Allow', TEST_CONFIG.CHANGE_SCREEN_TIMEOUT)
        .elementByName("Allow").tap();
});