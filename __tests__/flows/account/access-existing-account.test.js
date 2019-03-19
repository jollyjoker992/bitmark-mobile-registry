import wd from 'wd';
import { APPIUM_CONFIG, RUN_CONFIG, TEST_CONFIG } from '../../configs/config'

jasmine.DEFAULT_TIMEOUT_INTERVAL = TEST_CONFIG.DEFAULT_TIMEOUT_INTERVAL;
const driver = wd.promiseChainRemote(APPIUM_CONFIG.HOST, APPIUM_CONFIG.PORT);

beforeEach(async () => {
    await driver.init(RUN_CONFIG);
    await driver.sleep(TEST_CONFIG.APP_LOAD_TIMEOUT); // wait for app to load
});

const TWELVE_WORDS = ['bag', 'level', 'quote', 'meat', 'eye', 'vendor', 'clutch', 'snap', 'truck', 'elite', 'grant', 'valley'];
const TWENTY_FOUR_WORDS = ["accident", "sausage", "ticket", "dolphin", "original", "nasty", "theme", "life", "polar", "donor", "office", "weird", "neither", "escape", "flag", "spell", "submit", "salute", "sustain", "habit", "soap", "oil", "romance", "drama"];

test('Access Existing Account - 12 words', async () => {
    await driver.sleep(2000);

    // Go to ACCESS EXISTING ACCOUNT screen
    await driver
        .waitForElementByName('ACCESS EXISTING ACCOUNT', TEST_CONFIG.CHANGE_SCREEN_TIMEOUT)
        .elementByName('ACCESS EXISTING ACCOUNT').tap()
        .waitForElementByName('SUBMIT', TEST_CONFIG.CHANGE_SCREEN_TIMEOUT);

    // Input words
    for (let i = 0; i < TWELVE_WORDS.length; i++) {
        let input = await driver.elementByAccessibilityId(`input_word_${i}`);
        await input.type(TWELVE_WORDS[i]);
    }

    // Submit words and finish login steps
    await driver
        .waitForElementByName('Done', TEST_CONFIG.CHANGE_SCREEN_TIMEOUT)
        .elementByName('Done').tap()
        .sleep(3000)
        .elementByName('SUBMIT').tap()
        // TouchId Screen
        .waitForElementByName('SKIP', TEST_CONFIG.CHANGE_SCREEN_TIMEOUT)
        .elementByName('SKIP').tap()
        // iOS popup confirm
        .waitForElementByName('Yes', TEST_CONFIG.CHANGE_SCREEN_TIMEOUT)
        .elementByName("Yes").tap()
        // Notification Screen
        .waitForElementByName('ENABLE', TEST_CONFIG.CHANGE_SCREEN_TIMEOUT)
        .elementByName("ENABLE").tap()
        // iOS popup confirm
        .waitForElementByName('Allow', TEST_CONFIG.CHANGE_SCREEN_TIMEOUT)
        .elementByName("Allow").tap();
});

test('Access Existing Account - 24 words', async () => {
    await driver.sleep(2000);

    // Go to ACCESS EXISTING ACCOUNT screen
    await driver
        .waitForElementByName('ACCESS EXISTING ACCOUNT', TEST_CONFIG.CHANGE_SCREEN_TIMEOUT)
        .elementByName('ACCESS EXISTING ACCOUNT').tap()
        .waitForElementByName('Are you using 24 words of recovery phrase? Tap here to switch the form.', TEST_CONFIG.CHANGE_SCREEN_TIMEOUT)
        .elementByName("Are you using 24 words of recovery phrase? Tap here to switch the form.").tap()
        .waitForElementByName('SUBMIT', TEST_CONFIG.CHANGE_SCREEN_TIMEOUT);

    // Input words
    for (let i = 0; i < TWENTY_FOUR_WORDS.length; i++) {
        let input = await driver.elementByAccessibilityId(`input_word_${i}`);
        await input.type(TWENTY_FOUR_WORDS[i]);
        await driver.elementByName("return").tap();
    }

    // Submit words and finish login steps
    await driver
        .waitForElementByName('Done', TEST_CONFIG.CHANGE_SCREEN_TIMEOUT)
        .elementByName('Done').tap()
        .sleep(3000)
        .elementByName('SUBMIT').tap()
        // TouchId Screen
        .waitForElementByName('SKIP', TEST_CONFIG.CHANGE_SCREEN_TIMEOUT)
        .elementByName('SKIP').tap()
        // iOS popup confirm
        .waitForElementByName('Yes', TEST_CONFIG.CHANGE_SCREEN_TIMEOUT)
        .elementByName("Yes").tap()
        // Notification Screen
        .waitForElementByName('ENABLE', TEST_CONFIG.CHANGE_SCREEN_TIMEOUT)
        .elementByName("ENABLE").tap()
        // iOS popup confirm
        .waitForElementByName('Allow', TEST_CONFIG.CHANGE_SCREEN_TIMEOUT)
        .elementByName("Allow").tap();
});