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

// test('Issue new photo with checking asset name quantity, metadata-metadata do not check over 2048 bytes', async () => {
//   await driver.init(RUN_CONFIG);
//   await driver.sleep(TEST_CONFIG.APP_LOAD_TIMEOUT); // wait for app to load

//   await driver.sleep(3000);
//   await createNewAccountWithoutTouchId(driver);
//   await driver.sleep(3000);

//   let capabilities = await driver.sessionCapabilities();
//   await pushNewPhotoToDevice(capabilities.udid, path.join(__dirname, '../../assets/img/test.png'));

//   let elements = await driver
//     .waitForElementById('addPropertyBtn', TEST_CONFIG.CHANGE_SCREEN_TIMEOUT).elementById('addPropertyBtn').tap()
//     // select photo
//     .waitForElementByName('PHOTOS', TEST_CONFIG.CHANGE_SCREEN_TIMEOUT).elementByName('PHOTOS').tap()
//     // Choose image from lib
//     .waitForElementByName('Choose from Library...', TEST_CONFIG.CHANGE_SCREEN_TIMEOUT).elementByName('Choose from Library...').tap()
//     // allow permission
//     .waitForElementByName('OK', TEST_CONFIG.CHANGE_SCREEN_TIMEOUT).elementByName('OK').tap()
//     .waitForElementByName('Camera Roll', TEST_CONFIG.CHANGE_SCREEN_TIMEOUT).elementByName('Camera Roll').tap()
//     // Choose image from lib
//     .waitForElementsByIosPredicateString("type == 'XCUIElementTypeCell'", TEST_CONFIG.CHANGE_SCREEN_TIMEOUT).elementsByIosPredicateString("type == 'XCUIElementTypeCell'");
//   // Choose latest image
//   await elements[elements.length - 1].tap();

//   let textInputAssetName = await driver.waitForElementById('inputAssetName', TEST_CONFIG.CHANGE_SCREEN_TIMEOUT).elementById('inputAssetName');
//   let textInputQuantity = await driver.waitForElementById('inputQuantity', TEST_CONFIG.CHANGE_SCREEN_TIMEOUT).elementById('inputQuantity');
//   let btnAddMoreMetadata = await driver.waitForElementById('btnAddMoreMetadata', TEST_CONFIG.CHANGE_SCREEN_TIMEOUT).elementById('btnAddMoreMetadata');
//   await btnAddMoreMetadata.tap();
//   let errorString = '';
//   // asset name over 64 chars
//   await textInputAssetName.type(`Regression test ${new Date().toISOString()} ${new Date().toISOString()}`);
//   await driver.hideKeyboard();
//   errorString = await driver.waitForElementById('errorInputAssetName', TEST_CONFIG.CHANGE_SCREEN_TIMEOUT).elementById('errorInputAssetName').text();
//   expect(errorString).toEqual('You have exceeded the maximum number of characters in this field.');
//   // asset name empty
//   await textInputAssetName.clear();
//   await driver.hideKeyboard();
//   errorString = await driver.waitForElementById('errorInputAssetName', TEST_CONFIG.CHANGE_SCREEN_TIMEOUT).elementById('errorInputAssetName').text();
//   expect(errorString).toEqual('Please enter a property name.');
//   // asset name correct
//   await textInputAssetName.clear().type(`Regression test ${new Date().toISOString()}`);
//   await driver.hideKeyboard();
//   let length = (await driver.elementsById('errorInputAssetName')).length;
//   expect(length).toEqual(0);
//   // quantity over 101
//   await textInputQuantity.type(101);
//   await driver.hideKeyboard({ strategy: 'pressKey', key: 'Done' });
//   errorString = await driver.waitForElementById('errorInputQuantity', TEST_CONFIG.CHANGE_SCREEN_TIMEOUT).elementById('errorInputQuantity').text();
//   expect(errorString).toEqual('You cannot issue more than 100 bitmarks.');
//   // quantity empty
//   await textInputQuantity.clear();
//   await driver.hideKeyboard({ strategy: 'pressKey', key: 'Done' });
//   errorString = await driver.waitForElementById('errorInputQuantity', TEST_CONFIG.CHANGE_SCREEN_TIMEOUT).elementById('errorInputQuantity').text();
//   expect(errorString).toEqual('Number of bitmarks should be an integer number');
//   // quantity < 0
//   await textInputQuantity.type(-1);
//   await driver.hideKeyboard({ strategy: 'pressKey', key: 'Done' });
//   errorString = await driver.waitForElementById('errorInputQuantity', TEST_CONFIG.CHANGE_SCREEN_TIMEOUT).elementById('errorInputQuantity').text();
//   expect(errorString).toEqual('Create property requires a minimum quantity of 1 bitmark issuance.');
//   // quantity 100
//   await textInputQuantity.clear().type(5);
//   await driver.hideKeyboard({ strategy: 'pressKey', key: 'Done' });
//   length = (await driver.elementsById('errorInputQuantity')).length;
//   expect(length).toEqual(0);
//   // add metadata 0
//   let result = await btnAddMoreMetadata.tap();

//   await driver.waitForElementById('btnMetadataLabel_0', TEST_CONFIG.CHANGE_SCREEN_TIMEOUT).elementById('btnMetadataLabel_0').tap()
//     .waitForElementByName('CREATOR', TEST_CONFIG.CHANGE_SCREEN_TIMEOUT).elementByName('CREATOR').tap();
//   await driver.sleep(2000);
//   let metadataLabel0 = await driver.waitForElementById('btnMetadataLabel_0', TEST_CONFIG.CHANGE_SCREEN_TIMEOUT).elementById('btnMetadataLabel_0').text();
//   expect(metadataLabel0).toEqual('CREATOR');
//   let textInputMetadataValue0 = await driver.elementById('inputMetadataValue_0');
//   // // input over 2048 chars
//   // await textInputMetadataValue0.type(
//   //   `Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Habitant morbi tristique senectus et netus. At volutpat diam ut venenatis. Pharetra magna ac placerat vestibulum lectus mauris. Quis auctor elit sed vulputate mi sit. In tellus integer feugiat scelerisque varius morbi enim. Eget nulla facilisi etiam dignissim diam quis. Sit amet mauris commodo quis imperdiet. Felis eget velit aliquet sagittis id. Ut pharetra sit amet aliquam id diam maecenas. At risus viverra adipiscing at in tellus integer.  Euismod lacinia at quis risus sed vulputate odio ut enim. Sed id semper risus in hendrerit gravida. Turpis cursus in hac habitasse platea dictumst quisque sagittis. Viverra suspendisse potenti nullam ac tortor vitae purus faucibus ornare. Velit aliquet sagittis id consectetur purus ut faucibus pulvinar. Montes nascetur ridiculus mus mauris vitae ultricies leo integer malesuada. Fringilla phasellus faucibus scelerisque eleifend donec pretium vulputate sapien. Egestas fringilla phasellus faucibus scelerisque. Tellus mauris a diam maecenas. Condimentum lacinia quis vel eros donec ac odio. Risus quis varius quam quisque. Id faucibus nisl tincidunt eget nullam non nisi. Cursus in hac habitasse platea dictumst quisque sagittis purus. Molestie at elementum eu facilisis sed odio morbi quis. Ante in nibh mauris cursus mattis. Sed odio morbi quis commodo odio aenean sed adipiscing. Malesuada bibendum arcu vitae elementum. Pellentesque elit eget gravida cum sociis natoque penatibus. Nec ultrices dui sapien eget mi proin sed. Amet cursus sit amet dictum. Imperdiet massa tincidunt nunc pulvinar. Sit amet tellus cras adipiscing enim eu turpis. Aliquam eleifend mi in nulla posuere. Ac odio tempor orci dapibus ultrices in iaculis. Laoreet id donec ultrices tincidunt arcu non sodales. Fringilla est ullamcorper eget nulla facilisi etiam dignissim diam quis. Arcu odio ut sem nulla pharetra diam. Pharetra et ultrices neque ornare aenean euismod elementum nisi. Volutpat ac tincidunt vitae semper. Urna nec tincidunt praesent semper feugiat nibh sed pulvinar. Eu augue ut lectus arcu bibendum. Bibendum at varius vel pharetra vel turpis nunc eget lorem. A condimentum vitae sapien pellentesque habitant. Cursus vitae congue mauris rhoncus aenean vel. Mauris nunc congue nisi vitae suscipit tellus mauris a. Laoreet id donec ultrices tincidunt arcu. Pellentesque habitant morbi tristique senectus et netus et malesuada fames. Aenean pharetra magna ac placerat vestibulum lectus mauris. Tortor pretium viverra suspendisse potenti nullam ac tortor vitae purus. Fermentum odio eu feugiat pretium nibh ipsum consequat nisl. Lobortis scelerisque fermentum dui faucibus in ornare quam. Eget magna fermentum iaculis eu non diam phasellus. Urna id volutpat lacus laoreet non curabitur gravida. Ac felis donec et odio. Iaculis at erat pellentesque adipiscing. Lobortis mattis aliquam faucibus purus in massa. Suspendisse sed nisi lacus sed viverra tellus in hac. Aliquet risus feugiat in ante metus dictum. Velit sed ullamcorper morbi tincidunt ornare massa eget. Arcu dui vivamus arcu felis. Enim blandit volutpat maecenas volutpat blandit aliquam etiam erat velit. Dictum fusce ut placerat orci nulla pellentesque dignissim. Hac habitasse platea dictumst quisque. Vivamus arcu felis bibendum ut tristique et egestas quis. Aliquet eget sit amet tellus cras adipiscing enim eu. Eu volutpat odio facilisis mauris sit. Rhoncus est pellentesque elit ullamcorper dignissim cras tincidunt. Orci dapibus ultrices in iaculis nunc.`);
//   // await driver.hideKeyboard();
//   // errorString = await driver.waitForElementById('errorInputMetadata', TEST_CONFIG.CHANGE_SCREEN_TIMEOUT).elementById('errorInputMetadata').text();
//   // expect(errorString).toEqual('METADATA is too long (2048-BYTE LIMIT)!');
//   // input correct metdata for #0
//   await textInputMetadataValue0.clear().type('regression test');
//   await driver.hideKeyboard();
//   // add metadata 1
//   await btnAddMoreMetadata.tap();
//   await driver.waitForElementById('btnMetadataLabel_1').elementById('btnMetadataLabel_1').tap()
//     .waitForElementByName('CREATOR', TEST_CONFIG.CHANGE_SCREEN_TIMEOUT).elementByName('CREATOR').tap();
//   await driver.sleep(2000);
//   let metadataLabel1 = await driver.waitForElementById('btnMetadataLabel_1', TEST_CONFIG.CHANGE_SCREEN_TIMEOUT).elementById('btnMetadataLabel_1').text();
//   expect(metadataLabel1).toEqual('CREATOR');
//   errorString = await driver.waitForElementById('errorInputMetadata', TEST_CONFIG.CHANGE_SCREEN_TIMEOUT).elementById('errorInputMetadata').text();
//   expect(errorString).toEqual('Duplicated labels: creator');
//   await driver.waitForElementByName('EDIT', TEST_CONFIG.CHANGE_SCREEN_TIMEOUT).elementByName('EDIT').tap()
//     .waitForElementById('btnRemoveMetadataLabel_1', TEST_CONFIG.CHANGE_SCREEN_TIMEOUT).elementById('btnRemoveMetadataLabel_1').tap()
//     .waitForElementByName('Yes', TEST_CONFIG.CHANGE_SCREEN_TIMEOUT).elementByName('Yes').tap()
//     .waitForElementByName('DONE', TEST_CONFIG.CHANGE_SCREEN_TIMEOUT).elementByName('DONE').tap()
//   length = (await driver.elementsById('errorInputMetadata')).length;
//   expect(length).toEqual(0);

//   await driver.waitForElementByName('ISSUE', TEST_CONFIG.CHANGE_SCREEN_TIMEOUT).elementByName('ISSUE').tap();
//   await driver.sleep(20 * 1000);
//   await driver.waitForElementByName('OK', TEST_CONFIG.CHANGE_SCREEN_TIMEOUT).waitForElementByName('OK').tap();
// });

// test('issue new photo without metadata', async () => {
//   await issueNewPhotoWithoutMetadata(driver,
//     path.join(__dirname, '../../assets/img/test.png'),
//     `Regression test ${new Date().toISOString()}`,
//     5);
// });

// test('issue existing asset', async () => {
//   await driver.sleep(3000);
//   let capabilities = await driver.sessionCapabilities();

//   let elements = await driver
//     .waitForElementById('addPropertyBtn', TEST_CONFIG.CHANGE_SCREEN_TIMEOUT).elementById('addPropertyBtn').tap()
//     // select photo
//     .waitForElementByName('PHOTOS', TEST_CONFIG.CHANGE_SCREEN_TIMEOUT).elementByName('PHOTOS').tap()
//     // Choose image from lib
//     .waitForElementByName('Choose from Library...', TEST_CONFIG.CHANGE_SCREEN_TIMEOUT).elementByName('Choose from Library...').tap()
//     // allow permission
//     // .waitForElementByName('OK', TEST_CONFIG.CHANGE_SCREEN_TIMEOUT).elementByName('OK').tap()
//     .waitForElementByName('Camera Roll', TEST_CONFIG.CHANGE_SCREEN_TIMEOUT).elementByName('Camera Roll').tap()
//     // Choose image from lib
//     .waitForElementsByIosPredicateString("type == 'XCUIElementTypeCell'", TEST_CONFIG.CHANGE_SCREEN_TIMEOUT).elementsByIosPredicateString("type == 'XCUIElementTypeCell'");
//   // Choose latest image
//   await elements[elements.length - 1].tap();

//   let textInputQuantity = await driver.waitForElementById('inputQuantity', TEST_CONFIG.CHANGE_SCREEN_TIMEOUT).elementById('inputQuantity');

//   let length = (await driver.elementsById('inputAssetName')).length;
//   expect(length).toEqual(0);
//   length = (await driver.elementsById('btnAddMoreMetadata')).length;
//   expect(length).toEqual(0);

//   // quantity 
//   await textInputQuantity.clear().type(5);
//   await driver.hideKeyboard({ strategy: 'pressKey', key: 'Done' });
//   length = (await driver.elementsById('errorInputQuantity')).length;
//   expect(length).toEqual(0);

//   await driver.waitForElementByName('ISSUE', TEST_CONFIG.CHANGE_SCREEN_TIMEOUT).elementByName('ISSUE').tap();
//   await driver.sleep(10 * 1000);
//   await driver.waitForElementByName('OK', TEST_CONFIG.CHANGE_SCREEN_TIMEOUT).waitForElementByName('OK').tap();
// });


test('check transaction', async () => {

  let noResetConfig = { 'noReset': true };
  Object.assign(noResetConfig, RUN_CONFIG);
  await driver.init(noResetConfig);
  await driver.sleep(TEST_CONFIG.APP_LOAD_TIMEOUT); // wait for app to load

  await driver.sleep(3000);
  await driver.waitForElementById('BottomTabsComponent_transactions', TEST_CONFIG.CHANGE_SCREEN_TIMEOUT).elementById('BottomTabsComponent_transactions').tap();
  await driver.waitForElementByName('HISTORY', TEST_CONFIG.CHANGE_SCREEN_TIMEOUT).elementByName('HISTORY').tap();
  await driver.sleep(2000);

  let firstCompletedHistoryElement = await driver.waitForElementById("TransactionsComponent_completed_0", TEST_CONFIG.CHANGE_SCREEN_TIMEOUT).elementById("TransactionsComponent_completed_0");
  console.log({ firstCompletedHistoryElement });

  let propertyNameInHistory = await firstCompletedHistoryElement.elementById("TransactionsComponent_completed_property_0").text();
  console.log({ propertyNameInHistory });

});