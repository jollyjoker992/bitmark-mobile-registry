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
    } catch(err) {
        console.log('Already allowed notification before')
    }

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

    return result;
};


export {
    isLoggedIn,
    createNewAccountWithTouchId,
    createNewAccountWithoutTouchId
};