const wd = require('wd');
const { APPIUM_CONFIG, RUN_CONFIG, TEST_CONFIG } = require('../../configs/config');
const { createNewAccountWithTouchId, isLoggedIn } = require("../../common/common");

jasmine.DEFAULT_TIMEOUT_INTERVAL = TEST_CONFIG.DEFAULT_TIMEOUT_INTERVAL;
const driver = wd.promiseChainRemote(APPIUM_CONFIG.HOST, APPIUM_CONFIG.PORT);

beforeAll(async () => {
    let noResetConfig = { 'noReset': true };
    Object.assign(noResetConfig, RUN_CONFIG);

    await driver.init(noResetConfig);
    await driver.sleep(TEST_CONFIG.APP_LOAD_TIMEOUT); // wait for app to load
});

// TEST CASES
test('Write Down Recovery Phrase', async () => {
    let isLogged = await isLoggedIn(driver);
    if (!isLogged) {
        await createNewAccountWithTouchId(driver);
    }

    await driver
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

    const NUMBER_OF_WORDS = 12;
    for (let i = 0; i < NUMBER_OF_WORDS; i++) {
        let input = await driver.elementByAccessibilityId(`word_${i}`);
        let word = await input.getValue();
        phraseWords.push(word);
    }

    // Input random words
    await driver
        .elementByName('TEST RECOVERY PHRASE »').tap()
        .waitForElementByName('TEST RECOVERY PHRASE', TEST_CONFIG.CHANGE_SCREEN_TIMEOUT); // Check Title

    for (let i = 0; i < NUMBER_OF_WORDS; i++) {
        let el = await driver.elementByName(phraseWords[i]);
        let isRandomWord = await el.getAttribute('accessibilityContainer');
        if (isRandomWord == "true") {
            await el.tap();
        }
    }

    // Finish test recovery phrase
    await driver
        .waitForElementByName('DONE', TEST_CONFIG.CHANGE_SCREEN_TIMEOUT)
        .elementByName('DONE').tap()
});


test('Logout', async () => {
    await driver
        // Go to Account Tab
        .waitForElementByName('Account', TEST_CONFIG.CHANGE_SCREEN_TIMEOUT)
        .elementByName('Account').tap()
        // Click link to go to logout screen
        .waitForElementByName('LOG OUT »', TEST_CONFIG.CHANGE_SCREEN_TIMEOUT)
        .elementByName('LOG OUT »').tap()
        // Click link to go to [WRITE DOWN RECOVERY PHRASE] screen
        .waitForElementByName('WRITE DOWN RECOVERY PHRASE', TEST_CONFIG.CHANGE_SCREEN_TIMEOUT)
        .elementByName("WRITE DOWN RECOVERY PHRASE").tap()
        .waitForElementByName('DONE', TEST_CONFIG.CHANGE_SCREEN_TIMEOUT);

    // Get words
    let phraseWords = [];

    const NUMBER_OF_WORDS = 12;
    for (let i = 0; i < NUMBER_OF_WORDS; i++) {
        let input = await driver.elementByAccessibilityId(`word_${i}`);
        let word = await input.getValue();
        phraseWords.push(word);
    }

    // Input random words
    await driver
        .elementByName('DONE').tap()
        .waitForElementByName('TEST RECOVERY PHRASE', TEST_CONFIG.CHANGE_SCREEN_TIMEOUT); // Check Title

    for (let i = 0; i < NUMBER_OF_WORDS; i++) {
        let el = await driver.elementByName(phraseWords[i]);
        let isRandomWord = await el.getAttribute('accessibilityContainer');
        if (isRandomWord == "true") {
            await el.tap();
        }
    }

    // Remove access and check result
    await driver
        .waitForElementByName('REMOVE ACCESS', TEST_CONFIG.CHANGE_SCREEN_TIMEOUT)
        .elementByName('REMOVE ACCESS').tap()
        .waitForElementByName('CREATE NEW ACCOUNT', TEST_CONFIG.CHANGE_SCREEN_TIMEOUT);
});