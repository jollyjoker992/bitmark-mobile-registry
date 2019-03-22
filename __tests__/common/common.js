import wd from 'wd';
import { TEST_CONFIG } from "../configs/config";

const sharp = require('sharp');
const path = require('path');
const { exec } = require('child_process');

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
        .elementByName('ENABLE TOUCH/FACE ID').tap();

    // Try to enter any passcode for iPhone X
    try {
        await driver.sleep(3000);
        await driver
            .keys('123')
            .keys(wd.SPECIAL_KEYS.Return)
            .sleep(1000);

    } catch (err) {
        console.log('This is not iPhone X');
    }

    // Notification
    await driver
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
const pushNewPhotoToDevice = (deviceUID, photoPath) => {
    let ratio = 0.5 + Math.random();
    let background = { r: 0, g: 0, b: 0, alpha: 1552967000000 / Date.now() };
    let desPhotoPath;
    return new Promise((resolve, reject) => {
        let photo = sharp(photoPath);
        photo.metadata().then(metadata => {
            // create new photo
            let width = Math.floor(metadata.width * ratio);
            let height = Math.floor(metadata.height * ratio);
            desPhotoPath = photoPath.replace(path.basename(photoPath), 'new_' + path.basename(photoPath));
            return photo.resize(width, height, { background }).toFile(desPhotoPath);
        }).then(() => {
            // push to simulator
            let commandString = `xcrun simctl addmedia ${deviceUID} ${desPhotoPath}`;
            console.log({ commandString });
            exec(commandString, (error) => {
                if (error) {
                    return reject(error);
                }
                resolve();
            })
        }).catch(reject);
    });
};


const issueNewPhotoWithoutMetadata = async (driver, photoPath, assetName, quantity) => {
    // create new photo and push to simulator
    let capabilities = await driver.sessionCapabilities();
    await pushNewPhotoToDevice(capabilities.udid, photoPath);

    await driver.waitForElementById('BottomTabsComponent_properties', TEST_CONFIG.CHANGE_SCREEN_TIMEOUT).elementById('BottomTabsComponent_properties').tap()
        .waitForElementById('addPropertyBtn', TEST_CONFIG.CHANGE_SCREEN_TIMEOUT).elementById('addPropertyBtn').tap()
        // select photo
        .waitForElementByName('PHOTOS', TEST_CONFIG.CHANGE_SCREEN_TIMEOUT).elementByName('PHOTOS').tap()
        // Choose image from lib
        .waitForElementByName('Choose from Library...', TEST_CONFIG.CHANGE_SCREEN_TIMEOUT).elementByName('Choose from Library...').tap();
    try {
        // allow permission
        await driver.waitForElementByName('OK', TEST_CONFIG.CHANGE_SCREEN_TIMEOUT).elementByName('OK').tap();
    } catch {
        console.log('Already allowed permission before');
    }

    let elements = driver.waitForElementByName('Camera Roll', TEST_CONFIG.CHANGE_SCREEN_TIMEOUT).elementByName('Camera Roll').tap()
        // Choose image from lib
        .waitForElementsByIosPredicateString("type == 'XCUIElementTypeCell'", TEST_CONFIG.CHANGE_SCREEN_TIMEOUT).elementsByIosPredicateString("type == 'XCUIElementTypeCell'");
    // Choose latest image
    await elements[elements.length - 1].tap();

    let textInputAssetName = await driver.waitForElementById('inputAssetName', TEST_CONFIG.CHANGE_SCREEN_TIMEOUT).elementById('inputAssetName');
    let textInputQuantity = await driver.waitForElementById('inputQuantity', TEST_CONFIG.CHANGE_SCREEN_TIMEOUT).elementById('inputQuantity');

    await textInputAssetName.type(assetName);
    await driver.hideKeyboard();
    // there is no error relate to asset name
    let numberOfErrors = (await driver.elementsById('errorInputAssetName')).length;
    expect(numberOfErrors).toEqual(0);

    // quantity
    await textInputQuantity.clear().type(quantity);
    await driver.hideKeyboard({ strategy: 'pressKey', key: 'Done' });
    // there is no error relate to quantity
    numberOfErrors = (await driver.elementsById('errorInputQuantity')).length;
    expect(length).toEqual(0);

    // do issue
    await driver.waitForElementByName('ISSUE', TEST_CONFIG.CHANGE_SCREEN_TIMEOUT).elementByName('ISSUE').tap();
    await driver.sleep(20 * 1000);
    await driver.waitForElementByName('OK', TEST_CONFIG.CHANGE_SCREEN_TIMEOUT).elementByName('OK').tap();
};

export {
    isLoggedIn,
    createNewAccountWithTouchId,
    createNewAccountWithoutTouchId,
    pushNewPhotoToDevice,
    issueNewPhotoWithoutMetadata,
    accessExistingAccount
};