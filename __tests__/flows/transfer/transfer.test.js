import wd from 'wd';
import { APPIUM_CONFIG, RUN_CONFIG, TEST_CONFIG } from '../../configs/config'
import { accessExistingAccount } from "../../common/common";

jasmine.DEFAULT_TIMEOUT_INTERVAL = TEST_CONFIG.DEFAULT_TIMEOUT_INTERVAL;
const driver = wd.promiseChainRemote(APPIUM_CONFIG.HOST, APPIUM_CONFIG.PORT);

const NO_ENCRYPTION_PUBLIC_KEY_BITMARK_ACCOUNT = 'eMCcmw1SKoohNUf3LeioTFKaYNYfp2bzFYpjm3EddwxBSWYVCb';
const HAS_ENCRYPTION_PUBLIC_KEY_BITMARK_ACCOUNT = 'fADx4NWuuSXy6TefpnZwWvxTxepowchDT1D8r1bh5mnfwXP2XC';
const HAS_ENCRYPTION_PUBLIC_KEY_TWELVE_WORDS = ["autumn", "census", "bamboo", "december", "off", "lonely", "walk", "embark", "control", "inch", "fabric", "rough"];

const TWELVE_WORDS = ["close", "nut", "height", "renew", "boring", "fatigue", "alarm", "slice", "transfer", "spoon", "movie", "saddle"];

beforeEach(async () => {
    let noResetConfig = {'noReset': false};
    Object.assign(noResetConfig, RUN_CONFIG);

    await driver.init(noResetConfig);
    await driver.sleep(TEST_CONFIG.APP_LOAD_TIMEOUT); // wait for app to load
});

// TEST CASES
test('Delete all confirmed Bitmarks', async () => {
    await accessExistingAccount(driver, HAS_ENCRYPTION_PUBLIC_KEY_TWELVE_WORDS);

    await driver.sleep(5000);
    let allConfirmedElements = await driver.elementsByIosPredicateString("name BEGINSWITH 'item_' AND NOT label BEGINSWITH 'INCOMING' AND NOT label BEGINSWITH 'REGISTERING'");
    if (allConfirmedElements.length) {
        for (let i = 0; i < allConfirmedElements.length; i++) {
            let confirmedElement = allConfirmedElements[i];
            await confirmedElement.tap();

            // Delete bitmark
            await driver
                .waitForElementByName('YOUR PROPERTIES', TEST_CONFIG.CHANGE_SCREEN_TIMEOUT)
                .elementByName('toggleOptions').tap()
                // Click DELETE option
                .waitForElementByName('DELETE', TEST_CONFIG.CHANGE_SCREEN_TIMEOUT)
                .elementByName('DELETE').tap()
                // Confirm delete
                .waitForElementByName('Delete', TEST_CONFIG.CHANGE_SCREEN_TIMEOUT)
                .elementByName('Delete').tap()
                // Should return to PROPERTIES screen
                .waitForElementByName('PROPERTIES', TEST_CONFIG.CHANGE_SCREEN_TIMEOUT);
        }
    } else {
        console.warn('There are no confirmed bitmarks to delete');
        return;
    }
});


test('Transfer to account without encryption public key', async () => {
    await accessExistingAccount(driver, TWELVE_WORDS);
    let bitmarkId = await transfer(NO_ENCRYPTION_PUBLIC_KEY_BITMARK_ACCOUNT);

    if (bitmarkId) {
        await driver.waitForElementByName('Invalid bitmark account number!', TEST_CONFIG.CHANGE_SCREEN_TIMEOUT)
    }
});

test('Transfer to account with encryption public key', async () => {
    await accessExistingAccount(driver, TWELVE_WORDS);
    let bitmarkId = await transfer(HAS_ENCRYPTION_PUBLIC_KEY_BITMARK_ACCOUNT);

    if (bitmarkId) {
        await driver.waitForElementByName('PROPERTIES', TEST_CONFIG.CHANGE_SCREEN_TIMEOUT);
    }
});


test('Download bitmark', async () => {
    await accessExistingAccount(driver, HAS_ENCRYPTION_PUBLIC_KEY_TWELVE_WORDS);
    let firstConfirmedEl = await driver.elementByIosPredicateStringOrNull("name BEGINSWITH 'item_' AND NOT label BEGINSWITH 'INCOMING' AND NOT label BEGINSWITH 'REGISTERING'");

    if (firstConfirmedEl) {
        await firstConfirmedEl.tap();
    } else {
        let incomingEl = await driver.elementByIosPredicateStringOrNull("name BEGINSWITH 'item_' AND label BEGINSWITH 'INCOMING'");

        if (incomingEl) {
            // Wait for 3 minutes for bitmark get confirmed
            await driver.sleep(3 * 60 * 1000);
            await incomingEl.tap();
        } else {
            console.warn('There are no confirmed bitmarks to download');
            return;
        }
    }

    // Show options menu
    await driver
        .waitForElementByName('YOUR PROPERTIES', TEST_CONFIG.CHANGE_SCREEN_TIMEOUT)
        .elementByName('toggleOptions').tap();

    // Try to download/share
    await driver.sleep(2000);
    let downloadEl = await driver.elementByNameOrNull('DOWNLOAD');
    if (downloadEl) {
        await downloadEl.tap();
    } else {
        let shareEl = await driver.elementByNameOrNull('SHARE');
        await shareEl.tap();
    }

    // Agree on confirm popup if any
    try {
        // iOS popup confirm
        await driver
            .waitForElementByName('OK', 7000)
            .elementByName("OK").tap();
    } catch {
        console.log('Bitmark is not ready to download');
    }

    // Wait for download completion and execute copy file
    await driver
        .waitForElementByName('Copy', 30000)
        .elementByName("Copy").tap();
});


async function transfer(accountNumber) {
    await driver.sleep(3000);

    let firstConfirmedEl = await driver.elementByIosPredicateStringOrNull("name BEGINSWITH 'item_' AND NOT label BEGINSWITH 'INCOMING' AND NOT label BEGINSWITH 'REGISTERING'");

    if (firstConfirmedEl) {
        await firstConfirmedEl.tap();
    } else {
        console.warn('There are no confirmed bitmarks to transfer');
        return;
    }

    // Copy bitmark Id for later usage
    let bitmarkIdBase64 = await driver
        .waitForElementByName('YOUR PROPERTIES', TEST_CONFIG.CHANGE_SCREEN_TIMEOUT)
        .elementByName('toggleOptions').tap()
        .waitForElementByName('COPY BITMARK ID', TEST_CONFIG.CHANGE_SCREEN_TIMEOUT)
        .elementByName('COPY BITMARK ID').tap()
        .sleep(2000)
        .getClipboard();

    let bitmarkId = atob(bitmarkIdBase64);

    // Go to TRANSFER screen
    let transferAccountTextField = await driver
        .elementByName('TRANSFER').tap()
        .waitForElementByName('TRANSFER BITMARK', TEST_CONFIG.CHANGE_SCREEN_TIMEOUT)
        .elementByAccessibilityId('transferBitmarkAccount');

    // Input account number
    let accountChars = accountNumber.split('');
    for (let i = 0; i < accountChars.length; i++) {
        await transferAccountTextField.type(accountChars[i]);
    }

    // Finish inputting account number and execute transfer
    await driver
        .waitForElementByName('Done', TEST_CONFIG.CHANGE_SCREEN_TIMEOUT)
        .elementByName('Done').tap()
        .sleep(1000)
        .elementByName('TRANSFER').tap();

    return bitmarkId;
}
