import wd from 'wd';
import {APPIUM_CONFIG, RUN_CONFIG, TEST_CONFIG} from '../../configs/config'

jasmine.DEFAULT_TIMEOUT_INTERVAL = TEST_CONFIG.DEFAULT_TIMEOUT_INTERVAL;
const driver = wd.promiseChainRemote(APPIUM_CONFIG.HOST, APPIUM_CONFIG.PORT);

beforeAll(async () => {
    await driver.init(RUN_CONFIG);
    await driver.sleep(TEST_CONFIG.APP_LOAD_TIMEOUT); // wait for app to load
});

test('Creat New Account', async () => {
    await driver.sleep(3000);
    let result = await driver
        .waitForElementByName('CREATE NEW ACCOUNT', TEST_CONFIG.CHANGE_SCREEN_TIMEOUT)
        .elementByName('CREATE NEW ACCOUNT').tap()
        // TouchId Screen
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

test('Write Down Recovery Phrase', async () => {
    let result = await driver
        // Go to Account Tab
        .waitForElementByName('Account', TEST_CONFIG.CHANGE_SCREEN_TIMEOUT)
        .elementByName('Account').tap()
        // Click link to go to Warning screen
        .waitForElementByName('WRITE DOWN RECOVERY PHRASE »', TEST_CONFIG.CHANGE_SCREEN_TIMEOUT)
        .elementByName('WRITE DOWN RECOVERY PHRASE »').tap()
        // Click link to go to [WRITE DOWN RECOVERY PHRASE] screen
        .waitForElementByName('WRITE DOWN RECOVERY PHRASE', TEST_CONFIG.CHANGE_SCREEN_TIMEOUT)
        .elementByName("WRITE DOWN RECOVERY PHRASE").tap()
        .waitForElementByName('TEST RECOVERY PHRASE »', TEST_CONFIG.CHANGE_SCREEN_TIMEOUT);

    // Get words
    let phraseWords = [];
    for (let i = 0; i < 12; i++) {
        let input = await driver.elementByAccessibilityId(`word_${i}`);
        let word = await input.getValue();
        phraseWords.push(word);
    }


    await driver
        .elementByName('TEST RECOVERY PHRASE »').tap()
        .waitForElementByName('TEST RECOVERY PHRASE', TEST_CONFIG.CHANGE_SCREEN_TIMEOUT);

    // TODO Fill words and logout

});