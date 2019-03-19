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
        .elementByName('ENABLE TOUCH/FACE ID').tap()
        // Notification
        .waitForElementByName('ENABLE', TEST_CONFIG.CHANGE_SCREEN_TIMEOUT)
        .elementByName("ENABLE").tap();

    try {
        // iOS popup confirm
        await driver
            .waitForElementByName('Allow', TEST_CONFIG.CHANGE_SCREEN_TIMEOUT)
            .elementByName("Allow").tap();
    } catch (err) {
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


const pushNewPhotoToDevice = (deviceUID, photoPath) => {
    let ratio = 0.5 + Math.random();
    let background = { r: 0, g: 0, b: 0, alpha: 1552967000000 / Date.now() };
    let desPhotoPath;
    return new Promise((resolve, reject) => {
        let photo = sharp(photoPath);
        photo.metadata().then(metadata => {
            let width = Math.floor(metadata.width * ratio);
            let height = Math.floor(metadata.height * ratio);
            desPhotoPath = photoPath.replace(path.basename(photoPath), 'new_' + path.basename(photoPath));
            return photo.resize(width, height, { background }).toFile(desPhotoPath);
        }).then(() => {
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
    let capabilities = await driver.sessionCapabilities();
    await pushNewPhotoToDevice(capabilities.udid, photoPath);
    let elements = await driver
        .waitForElementById('addPropertyBtn', TEST_CONFIG.CHANGE_SCREEN_TIMEOUT).elementById('addPropertyBtn').tap()
        // select photo
        .waitForElementByName('PHOTOS', TEST_CONFIG.CHANGE_SCREEN_TIMEOUT).elementByName('PHOTOS').tap()
        // Choose image from lib
        .waitForElementByName('Choose from Library...', TEST_CONFIG.CHANGE_SCREEN_TIMEOUT).elementByName('Choose from Library...').tap()
        // allow permission
        // .waitForElementByName('OK', TEST_CONFIG.CHANGE_SCREEN_TIMEOUT).elementByName('OK').tap()
        .waitForElementByName('Camera Roll', TEST_CONFIG.CHANGE_SCREEN_TIMEOUT).elementByName('Camera Roll').tap()
        // Choose image from lib
        .waitForElementsByIosPredicateString("type == 'XCUIElementTypeCell'", TEST_CONFIG.CHANGE_SCREEN_TIMEOUT).elementsByIosPredicateString("type == 'XCUIElementTypeCell'");
    // Choose latest image
    await elements[elements.length - 1].tap();

    let textInputAssetName = await driver.waitForElementById('inputAssetName', TEST_CONFIG.CHANGE_SCREEN_TIMEOUT).waitForElementById('inputAssetName');
    let textInputQuantity = await driver.waitForElementById('inputQuantity', TEST_CONFIG.CHANGE_SCREEN_TIMEOUT).waitForElementById('inputQuantity');

    await textInputAssetName.type(assetName);
    await driver.hideKeyboard();
    let length = (await driver.elementsById('errorInputAssetName')).length;
    expect(length).toEqual(0);

    // quantity
    await textInputQuantity.clear().type(quantity);
    await driver.hideKeyboard({ strategy: 'pressKey', key: 'Done' });
    length = (await driver.elementsById('errorInputQuantity')).length;
    expect(length).toEqual(0);

    await driver.waitForElementByName('ISSUE', TEST_CONFIG.CHANGE_SCREEN_TIMEOUT).elementByName('ISSUE').tap();
    await driver.sleep(20 * 1000);
    await driver.waitForElementByName('OK', TEST_CONFIG.CHANGE_SCREEN_TIMEOUT).waitForElementByName('OK').tap();
};

export {
    isLoggedIn,
    createNewAccountWithTouchId,
    createNewAccountWithoutTouchId,
    pushNewPhotoToDevice,
    issueNewPhotoWithoutMetadata,
};