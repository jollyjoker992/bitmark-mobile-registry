import wd from 'wd';
import { APPIUM_CONFIG, RUN_CONFIG, TEST_CONFIG } from '../../configs/config'
import { issueNewPhotoWithoutMetadata, pushNewPhotoToDevice, createNewAccountWithoutTouchId } from '__tests__/common/common';

let path = require('path');

jasmine.DEFAULT_TIMEOUT_INTERVAL = TEST_CONFIG.DEFAULT_TIMEOUT_INTERVAL;
const driver = wd.promiseChainRemote(APPIUM_CONFIG.HOST, APPIUM_CONFIG.PORT);

// beforeAll(async () => {
//   let noResetConfig = { 'noReset': true };
//   Object.assign(noResetConfig, RUN_CONFIG);
//   await driver.init(noResetConfig);
//   await driver.sleep(TEST_CONFIG.APP_LOAD_TIMEOUT); // wait for app to load
// });

const checkAfterIssue = async (assetName) => {

  //check asset name of first item in properties
  let propertyNameInProperties = await driver.waitForElementById("PropertiesComponent_yours_assetName_0", TEST_CONFIG.CHANGE_SCREEN_TIMEOUT).elementById("PropertiesComponent_yours_assetName_0").text();
  expect(propertyNameInProperties).toEqual(assetName);

  //access to detail screen
  await driver.waitForElementById("item_0", TEST_CONFIG.CHANGE_SCREEN_TIMEOUT).elementById("item_0").tap();

  //check assetName
  propertyNameInProperties = await driver.waitForElementById("PropertyDetailComponent_assetName", TEST_CONFIG.CHANGE_SCREEN_TIMEOUT).elementById("PropertyDetailComponent_assetName").text();
  expect(propertyNameInProperties).toEqual(assetName);

  // wait load provenance
  await driver.sleep(2000);

  // get list provenance
  let list = await driver.waitForElementsById("PropertyDetailComponent_provenance", TEST_CONFIG.CHANGE_SCREEN_TIMEOUT).elementsById("PropertyDetailComponent_provenance");
  expect(list.length).toEqual(1);
  // check last owner is YOU
  let lastOwner = await driver.waitForElementById(`PropertyDetailComponent_provenance_owner_${list.length - 1}`, TEST_CONFIG.CHANGE_SCREEN_TIMEOUT).elementById(`PropertyDetailComponent_provenance_owner_${list.length - 1}`).text();
  expect(lastOwner).toEqual('YOU');
  await driver.waitForElementById("PropertyDetailComponent_backBTN", TEST_CONFIG.CHANGE_SCREEN_TIMEOUT).elementById("PropertyDetailComponent_backBTN").tap();

  //check asset name of first item in history
  await driver.waitForElementById('BottomTabsComponent_transactions', TEST_CONFIG.CHANGE_SCREEN_TIMEOUT).elementById('BottomTabsComponent_transactions').tap();
  await driver.waitForElementByName('HISTORY', TEST_CONFIG.CHANGE_SCREEN_TIMEOUT).elementByName('HISTORY').tap();
  await driver.sleep(2000);
  // check asset name
  let propertyNameInHistory = await driver.waitForElementById("TransactionsComponent_completed_property_0", TEST_CONFIG.CHANGE_SCREEN_TIMEOUT).elementById("TransactionsComponent_completed_property_0").text();
  expect(propertyNameInHistory).toEqual(assetName);
  // check type
  let typeInHistory = await driver.waitForElementById("TransactionsComponent_completed_type_0", TEST_CONFIG.CHANGE_SCREEN_TIMEOUT).elementById("TransactionsComponent_completed_type_0").text();
  expect(typeInHistory).toEqual('PROPERTY ISSUANCE');
};

test('Issue new photo with checking asset name quantity, metadata-metadata do not check over 2048 bytes', async () => {
  await driver.init(RUN_CONFIG);
  await driver.sleep(TEST_CONFIG.APP_LOAD_TIMEOUT); // wait for app to load

  await createNewAccountWithoutTouchId(driver);
  await driver.sleep(3000);

  let capabilities = await driver.sessionCapabilities();
  await pushNewPhotoToDevice(capabilities.udid, path.join(__dirname, '../../assets/img/test.png'));

  let elements = await driver
    .waitForElementById('addPropertyBtn', TEST_CONFIG.CHANGE_SCREEN_TIMEOUT).elementById('addPropertyBtn').tap()
    // select photo
    .waitForElementByName('PHOTOS', TEST_CONFIG.CHANGE_SCREEN_TIMEOUT).elementByName('PHOTOS').tap()
    // Choose image from lib
    .waitForElementByName('Choose from Library...', TEST_CONFIG.CHANGE_SCREEN_TIMEOUT).elementByName('Choose from Library...').tap()
    // allow permission
    .waitForElementByName('OK', TEST_CONFIG.CHANGE_SCREEN_TIMEOUT).elementByName('OK').tap()
    .waitForElementByName('Camera Roll', TEST_CONFIG.CHANGE_SCREEN_TIMEOUT).elementByName('Camera Roll').tap()
    // Choose image from lib
    .waitForElementsByIosPredicateString("type == 'XCUIElementTypeCell'", TEST_CONFIG.CHANGE_SCREEN_TIMEOUT).elementsByIosPredicateString("type == 'XCUIElementTypeCell'");
  // Choose latest image
  await elements[elements.length - 1].tap();

  let textInputAssetName = await driver.waitForElementById('inputAssetName', TEST_CONFIG.CHANGE_SCREEN_TIMEOUT).elementById('inputAssetName');
  let textInputQuantity = await driver.waitForElementById('inputQuantity', TEST_CONFIG.CHANGE_SCREEN_TIMEOUT).elementById('inputQuantity');
  let btnAddMoreMetadata = await driver.waitForElementById('btnAddMoreMetadata', TEST_CONFIG.CHANGE_SCREEN_TIMEOUT).elementById('btnAddMoreMetadata');
  await btnAddMoreMetadata.tap();
  let errorString = '';
  // asset name over 64 chars
  await textInputAssetName.type(`Regression test ${new Date().toISOString()} ${new Date().toISOString()}`);
  await driver.hideKeyboard();
  errorString = await driver.waitForElementById('errorInputAssetName', TEST_CONFIG.CHANGE_SCREEN_TIMEOUT).elementById('errorInputAssetName').text();
  expect(errorString).toEqual('You have exceeded the maximum number of characters in this field.');
  // asset name empty
  await textInputAssetName.clear();
  await driver.hideKeyboard();
  errorString = await driver.waitForElementById('errorInputAssetName', TEST_CONFIG.CHANGE_SCREEN_TIMEOUT).elementById('errorInputAssetName').text();
  expect(errorString).toEqual('Please enter a property name.');
  // asset name correct
  let assetName = `Regression test ${new Date().toISOString()}`;
  await textInputAssetName.clear().type(assetName);
  await driver.hideKeyboard();
  let numberOfErrors = (await driver.elementsById('errorInputAssetName')).length;
  expect(numberOfErrors).toEqual(0);
  // quantity over 101
  await textInputQuantity.type(101);
  await driver.hideKeyboard({ strategy: 'pressKey', key: 'Done' });
  errorString = await driver.waitForElementById('errorInputQuantity', TEST_CONFIG.CHANGE_SCREEN_TIMEOUT).elementById('errorInputQuantity').text();
  expect(errorString).toEqual('You cannot issue more than 100 bitmarks.');
  // quantity empty
  await textInputQuantity.clear();
  await driver.hideKeyboard({ strategy: 'pressKey', key: 'Done' });
  errorString = await driver.waitForElementById('errorInputQuantity', TEST_CONFIG.CHANGE_SCREEN_TIMEOUT).elementById('errorInputQuantity').text();
  expect(errorString).toEqual('Number of bitmarks should be an integer number');
  // quantity < 0
  await textInputQuantity.type(-1);
  await driver.hideKeyboard({ strategy: 'pressKey', key: 'Done' });
  errorString = await driver.waitForElementById('errorInputQuantity', TEST_CONFIG.CHANGE_SCREEN_TIMEOUT).elementById('errorInputQuantity').text();
  expect(errorString).toEqual('Create property requires a minimum quantity of 1 bitmark issuance.');
  // quantity 100
  await textInputQuantity.clear().type(100);
  await driver.hideKeyboard({ strategy: 'pressKey', key: 'Done' });
  numberOfErrors = (await driver.elementsById('errorInputQuantity')).length;
  expect(numberOfErrors).toEqual(0);
  // add first metadata
  await btnAddMoreMetadata.tap();
  await driver.waitForElementById('btnMetadataLabel_0', TEST_CONFIG.CHANGE_SCREEN_TIMEOUT).elementById('btnMetadataLabel_0').tap()
    .waitForElementByName('CREATOR', TEST_CONFIG.CHANGE_SCREEN_TIMEOUT).elementByName('CREATOR').tap();
  await driver.sleep(2000);
  let metadataLabel0 = await driver.waitForElementById('btnMetadataLabel_0', TEST_CONFIG.CHANGE_SCREEN_TIMEOUT).elementById('btnMetadataLabel_0').text();
  expect(metadataLabel0).toEqual('CREATOR');
  let textInputMetadataValue0 = await driver.elementById('inputMetadataValue_0');
  await textInputMetadataValue0.clear().type('regression test');
  await driver.hideKeyboard();
  // add second metadata 
  await btnAddMoreMetadata.tap();
  await driver.waitForElementById('btnMetadataLabel_1').elementById('btnMetadataLabel_1').tap()
    .waitForElementByName('CREATOR', TEST_CONFIG.CHANGE_SCREEN_TIMEOUT).elementByName('CREATOR').tap();
  await driver.sleep(2000);
  let metadataLabel1 = await driver.waitForElementById('btnMetadataLabel_1', TEST_CONFIG.CHANGE_SCREEN_TIMEOUT).elementById('btnMetadataLabel_1').text();
  expect(metadataLabel1).toEqual('CREATOR');
  errorString = await driver.waitForElementById('errorInputMetadata', TEST_CONFIG.CHANGE_SCREEN_TIMEOUT).elementById('errorInputMetadata').text();
  expect(errorString).toEqual('Duplicated labels: creator');
  await driver.waitForElementByName('EDIT', TEST_CONFIG.CHANGE_SCREEN_TIMEOUT).elementByName('EDIT').tap()
    .waitForElementById('btnRemoveMetadataLabel_1', TEST_CONFIG.CHANGE_SCREEN_TIMEOUT).elementById('btnRemoveMetadataLabel_1').tap()
    .waitForElementByName('Yes', TEST_CONFIG.CHANGE_SCREEN_TIMEOUT).elementByName('Yes').tap()
    .waitForElementByName('DONE', TEST_CONFIG.CHANGE_SCREEN_TIMEOUT).elementByName('DONE').tap()
  numberOfErrors = (await driver.elementsById('errorInputMetadata')).length;
  expect(numberOfErrors).toEqual(0);

  await driver.waitForElementByName('ISSUE', TEST_CONFIG.CHANGE_SCREEN_TIMEOUT).elementByName('ISSUE').tap();
  await driver.sleep(20 * 1000);
  await driver.waitForElementByName('OK', TEST_CONFIG.CHANGE_SCREEN_TIMEOUT).waitForElementByName('OK').tap();

  await checkAfterIssue(assetName);
});

test('issue new photo without metadata', async () => {
  let assetName = `Regression test ${new Date().toISOString()}`;
  await issueNewPhotoWithoutMetadata(driver,
    path.join(__dirname, '../../assets/img/test.png'),
    assetName,
    5);

  await checkAfterIssue(assetName);
});

test('issue existing asset', async () => {
  await driver.sleep(3000);

  let elements = await driver
    .waitForElementById('BottomTabsComponent_properties', TEST_CONFIG.CHANGE_SCREEN_TIMEOUT).elementById('BottomTabsComponent_properties').tap()
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

  let textInputQuantity = await driver.waitForElementById('inputQuantity', TEST_CONFIG.CHANGE_SCREEN_TIMEOUT).elementById('inputQuantity');

  let numberElementInputAssetName = (await driver.elementsById('inputAssetName')).length;
  expect(numberElementInputAssetName).toEqual(0);
  let numberElementBtnAddMetadata = (await driver.elementsById('btnAddMoreMetadata')).length;
  expect(numberElementBtnAddMetadata).toEqual(0);

  let assetName = await driver.waitForElementById('LocalIssueFileComponent_existing_assetName', TEST_CONFIG.CHANGE_SCREEN_TIMEOUT).elementById('LocalIssueFileComponent_existing_assetName').text();

  // quantity 
  await textInputQuantity.clear().type(5);
  await driver.hideKeyboard({ strategy: 'pressKey', key: 'Done' });
  let numberOfErrors = (await driver.elementsById('errorInputQuantity')).length;
  expect(numberOfErrors).toEqual(0);

  await driver.waitForElementByName('ISSUE', TEST_CONFIG.CHANGE_SCREEN_TIMEOUT).elementByName('ISSUE').tap();
  await driver.sleep(10 * 1000);
  await driver.waitForElementByName('OK', TEST_CONFIG.CHANGE_SCREEN_TIMEOUT).waitForElementByName('OK').tap();

  await checkAfterIssue(assetName);
});