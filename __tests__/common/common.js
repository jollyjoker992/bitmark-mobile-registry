import { TEST_CONFIG } from "../configs/config";

const isLoggedIn = async (driver) => {
    await driver.sleep(3000);
    let isNotLoggedIn = await driver.hasElementByName('CREATE NEW ACCOUNT', TEST_CONFIG.CHANGE_SCREEN_TIMEOUT);
    return !isNotLoggedIn;
};

const createNewAccountWithTouchId = async (driver) => {
    await driver.sleep(3000);

    let result = await driver
        .waitForElementByName('CREATE NEW ACCOUNT', TEST_CONFIG.CHANGE_SCREEN_TIMEOUT)
        .elementByName('CREATE NEW ACCOUNT').tap()
        // TouchId Screen
        .waitForElementByName('ENABLE TOUCH/FACE ID', TEST_CONFIG.CHANGE_SCREEN_TIMEOUT)
        .elementByName('ENABLE TOUCH/FACE ID').tap()
        // Notification
        .waitForElementByName('ENABLE', TEST_CONFIG.CHANGE_SCREEN_TIMEOUT)
        .elementByName("ENABLE").tap();

    try {
        // iOS popup confirm
        await driver
            .waitForElementByName('Allow', TEST_CONFIG.CHANGE_SCREEN_TIMEOUT)
            .elementByName("Allow").tap();
    } catch {
        console.log('Already allowed notification before');
    }

    await closeWhatNewScreen(driver);

    return result;
};

const createNewAccountWithoutTouchId = async (driver) => {
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

    await closeWhatNewScreen(driver);

    return result;
};

const accessExistingAccount = async (driver, phraseWords) => {
    await driver.sleep(3000);

    // Go to ACCESS EXISTING ACCOUNT screen
    await driver
        .waitForElementByName('ACCESS EXISTING ACCOUNT', TEST_CONFIG.CHANGE_SCREEN_TIMEOUT)
        .elementByName('ACCESS EXISTING ACCOUNT').tap()
        .waitForElementByName('SUBMIT', TEST_CONFIG.CHANGE_SCREEN_TIMEOUT);

    if (phraseWords.length == 24) {
        await driver.waitForElementByName('Are you using 24 words of recovery phrase? Tap here to swich the form.', TEST_CONFIG.CHANGE_SCREEN_TIMEOUT)
            .elementByName("Are you using 24 words of recovery phrase? Tap here to swich the form.").tap();
    }

    await driver.sleep(2000);

    // Input words
    for (let i = 0; i < phraseWords.length; i++) {
        let input = await driver.elementByAccessibilityId(`input_word_${i}`);
        await input.type(phraseWords[i]);
        await driver.elementByName("return").tap();
    }

    // Submit words and finish login steps
    let result = await driver
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

    await closeWhatNewScreen(driver);

    return result;
};

const closeWhatNewScreen = async (driver) => {
    try {
        await driver
            .sleep(3000)
            .waitForElementByAccessibilityId('closeBtn', TEST_CONFIG.CHANGE_SCREEN_TIMEOUT)
            .elementByAccessibilityId("closeBtn").tap();
    } catch {
        console.log("Don't have What's New");
    }
};

export {
    isLoggedIn,
    createNewAccountWithTouchId,
    createNewAccountWithoutTouchId,
    accessExistingAccount
};