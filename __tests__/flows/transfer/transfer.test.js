import wd from 'wd';
import { APPIUM_CONFIG, RUN_CONFIG, TEST_CONFIG } from '../../configs/config'
import { accessExistingAccount } from "../../common/common";
import moment from "moment/moment";

jasmine.DEFAULT_TIMEOUT_INTERVAL = TEST_CONFIG.DEFAULT_TIMEOUT_INTERVAL;
const driver = wd.promiseChainRemote(APPIUM_CONFIG.HOST, APPIUM_CONFIG.PORT);

const NO_ENCRYPTION_PUBLIC_KEY_BITMARK_ACCOUNT = 'eMCcmw1SKoohNUf3LeioTFKaYNYfp2bzFYpjm3EddwxBSWYVCb';
const HAS_ENCRYPTION_PUBLIC_KEY_BITMARK_ACCOUNT = 'fADx4NWuuSXy6TefpnZwWvxTxepowchDT1D8r1bh5mnfwXP2XC';
const HAS_ENCRYPTION_PUBLIC_KEY_TWELVE_WORDS = ["grain", "pizza", "provide", "deliver", "custom", "sound", "veteran", "neutral", "hope", "reward", "earth", "omit"];

const TWELVE_WORDS = ["close", "nut", "height", "renew", "boring", "fatigue", "alarm", "slice", "transfer", "spoon", "movie", "saddle"];
const ACCOUNT_NUMBER = "fT3TAY5MaWJnTsCnNArLPRWDovwQh4Uv8GeZG4ox74p8PtA1sW";

beforeEach(async () => {
    let noResetConfig = {'noReset': false};
    Object.assign(noResetConfig, RUN_CONFIG);

    await driver.init(noResetConfig);
    await driver.sleep(TEST_CONFIG.APP_LOAD_TIMEOUT); // wait for app to load
});

// TEST CASES
test('Transfer to account without encryption public key', async () => {
    await accessExistingAccount(driver, TWELVE_WORDS);
    let {bitmarkId} = await transfer(NO_ENCRYPTION_PUBLIC_KEY_BITMARK_ACCOUNT);

    if (bitmarkId) {
        await driver.waitForElementByName('Invalid bitmark account number!', TEST_CONFIG.CHANGE_SCREEN_TIMEOUT)
    }
});

test('Transfer to account with encryption public key', async () => {
    await accessExistingAccount(driver, TWELVE_WORDS);
    let {bitmarkId, assetName} = await transfer(HAS_ENCRYPTION_PUBLIC_KEY_BITMARK_ACCOUNT);

    if (bitmarkId) {
        // Go to transaction history
        await driver
            .waitForElementByName('PROPERTIES', TEST_CONFIG.CHANGE_SCREEN_TIMEOUT)
            .elementByName('Transactions').tap()
            .waitForElementByName('HISTORY', TEST_CONFIG.CHANGE_SCREEN_TIMEOUT)
            .elementByName('HISTORY').tap();

        // Verify result
        let latestTransferEl = await driver.waitForElementByAccessibilityId(`item_0`, TEST_CONFIG.CHANGE_SCREEN_TIMEOUT);
        let latestElContent = await latestTransferEl.getAttribute('label');

        let receiverShortAccountNumber = `[${HAS_ENCRYPTION_PUBLIC_KEY_BITMARK_ACCOUNT.substring(0, 4)}...${HAS_ENCRYPTION_PUBLIC_KEY_BITMARK_ACCOUNT.substring(HAS_ENCRYPTION_PUBLIC_KEY_BITMARK_ACCOUNT.length - 4, HAS_ENCRYPTION_PUBLIC_KEY_BITMARK_ACCOUNT.length)}]`;
        let sender = 'YOU';
        let type = 'P2P TRANSFER';

        if (!latestElContent.includes('PENDING...')) {
            let transferDate = moment().format('YYYY MMM DD').toUpperCase();
            expect(latestElContent.includes(transferDate)).toBe(true);
        }

        expect(latestElContent.includes(assetName)).toBe(true);
        expect(latestElContent.includes(type)).toBe(true);
        expect(latestElContent.includes(sender)).toBe(true);
        expect(latestElContent.includes(receiverShortAccountNumber)).toBe(true);
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

test('Delete confirmed Bitmarks', async () => {
    await accessExistingAccount(driver, HAS_ENCRYPTION_PUBLIC_KEY_TWELVE_WORDS);

    await driver.sleep(5000);
    let numberOfBitmarksBeforeDeleting = await getNumberOfBitmarks(driver);

    let firstConfirmedElement = await driver.elementByIosPredicateStringOrNull("name BEGINSWITH 'item_' AND NOT label BEGINSWITH 'INCOMING' AND NOT label BEGINSWITH 'REGISTERING'");
    if (firstConfirmedElement) {
        await firstConfirmedElement.tap();

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
            .waitForElementByName('PROPERTIES', TEST_CONFIG.CHANGE_SCREEN_TIMEOUT)
            .sleep(5000);

        // Verify delete result
        if (!numberOfBitmarksBeforeDeleting.includes("99")) {
            let numberOfBitmarksAfterDeleting = await getNumberOfBitmarks(driver);
            expect(parseInt(numberOfBitmarksAfterDeleting) == (parseInt(numberOfBitmarksBeforeDeleting) - 1)).toBe(true);
        }
    } else {
        console.warn('There are no confirmed bitmarks to delete');
        return;
    }
});

async function transfer(accountNumber) {
    await driver.sleep(15000);
    let assetName;

    let firstConfirmedEl = await driver.elementByIosPredicateStringOrNull("name BEGINSWITH 'item_' AND NOT label BEGINSWITH 'INCOMING' AND NOT label BEGINSWITH 'REGISTERING' AND label CONTAINS 'YOU'");

    if (firstConfirmedEl) {
        let firstConfirmedElContent = await firstConfirmedEl.getAttribute('label');
        let getNameRegex = /\d{4} \w{3} \d{2} \d{2}:\d{2}:\d{2} (.*) YOU/g;
        let matches = getNameRegex.exec(firstConfirmedElContent);
        assetName = matches[1];
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

    return {bitmarkId, assetName};
}

async function getNumberOfBitmarks(driver) {
    let numberOfBitmarksElement = await driver.elementByAccessibilityId("numberOfBitmarks");
    let numberOfBitmarksElementContent = await numberOfBitmarksElement.getAttribute('label');
    let numberOfBitmarksRegex = /YOURS\((.*)\)/g;
    let matches = numberOfBitmarksRegex.exec(numberOfBitmarksElementContent);
    let numberOfBitmarks = matches[1];

    return numberOfBitmarks;
}
