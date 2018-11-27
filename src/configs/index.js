import DeviceInfo from 'react-native-device-info';
import { iosConfig, iosConstant } from './ios/ios.config';
import { androidConfig, androidConstant } from './android/android.config';

let NETWORKS = {
  devnet: 'devnet',
  testnet: 'testnet',
  livenet: 'livenet',
};

let network = NETWORKS.livenet;
network = DeviceInfo.getBundleId() === 'com.bitmark.registry.inhouse' ? NETWORKS.testnet : network;

let config = {
  network,
  NETWORKS,
  localization: DeviceInfo.getDeviceLocale(),
  zeroAddress: 'dw9MQXcC5rJZb3QE1nz86PiQAheMP1dx9M3dr52tT8NNs14m33',
  bitmark_network: NETWORKS.testnet,
  appLink: 'https://itunes.apple.com/us/app/bitmark-registry/id1429427796?ls=1&mt=8',
  api_server_url: 'https://api.test.bitmark.com',
  registry_server_url: 'https://registry.test.bitmark.com',
  trade_server_url: 'https://trade.devel.bitmark.com',
  mobile_server_url: 'https://bm.devel.bitmark.com',
  ifttt_server_url: 'https://channel.devel.bitmark.com:8090',
  ifttt_invite_url: 'https://ifttt.com/features/redeem?code=10403-fa99108249f426f459a2e1033ddfbbb5',
  ifttt_bitmark_service_url: 'https://ifttt.com/bitmarkdevel',
  ifttt_bitmark_service_settings_url: "https://ifttt.com/services/bitmarkdevel/settings",
  web_app_server_url: 'http://192.168.0.109:8900',
  preview_asset_url: 'https://preview.test.bitmarkaccountassets.com',
  bitmark_web_site: 'https://bitmark.com',
  file_courier_server: 'https://file-courier.test.bitmark.com',
  needResetLocalData: 1535081368111,
};

if (config.network === NETWORKS.testnet) {
  config.trade_server_url = 'https://trade.test.bitmark.com';
  config.mobile_server_url = 'https://bm.test.bitmark.com';
  config.ifttt_server_url = 'https://when.test.bitmark.com:8090';
  config.ifttt_invite_url = 'https://ifttt.com/features/redeem?code=10518-3f2950b543e7a5a2dc307de0c05775e4';
  config.ifttt_bitmark_service_url = 'https://ifttt.com/bitmarktest';
  config.ifttt_bitmark_service_settings_url = "https://ifttt.com/services/bitmarktest/settings";
  config.web_app_server_url = "https://webapp.test.bitmark.com";
  config.preview_asset_url = "https://preview.test.bitmarkaccountassets.com";
  config.file_courier_server = 'https://file-courier.test.bitmark.com';
} else if (config.network === NETWORKS.livenet) {
  config.bitmark_network = NETWORKS.livenet;
  config.api_server_url = 'https://api.bitmark.com';
  config.registry_server_url = 'https://registry.bitmark.com';
  config.trade_server_url = 'https://trade.bitmark.com';
  config.mobile_server_url = 'https://bm.bitmark.com';
  config.ifttt_server_url = 'https://when.live.bitmark.com:8090';
  config.ifttt_invite_url = 'https://ifttt.com/features/redeem?code=9187-5ba0e766190b2d174a5a3708fe2002ae';
  config.ifttt_bitmark_service_url = 'https://ifttt.com/bitmark';
  config.ifttt_bitmark_service_settings_url = "https://ifttt.com/services/bitmark/settings";
  config.web_app_server_url = "https://a.bitmark.com";
  config.preview_asset_url = "https://preview.bitmarkaccountassets.com";
  config.bitmark_web_site = 'https://bitmark.com';
  config.zeroAddress = 'a3ezwdYVEVrHwszQrYzDTCAZwUD3yKtNsCq9YhEu97bPaGAKy1';
  // TODO
  // config.file_courier_server = 'https://file-courier.test.bitmark.com';
}

let ios = {
  config: iosConfig,
  constant: iosConstant,
};

let android = {
  config: androidConfig,
  constant: androidConstant,
};

export { config, ios, android };

// ┌────────────┬───────────────────────────────────────┐
// │ Name       │ Deployment Key                        │
// ├────────────┼───────────────────────────────────────┤
// │ Production │ q0VOHmW4l3oxFuhbfqVY48zWJHiMBJFSo1yHX │
// ├────────────┼───────────────────────────────────────┤
// │ Staging    │ CGnP-G4I33angJRWeHM-6O3yPtwHS1KHiyySm │
// └────────────┴───────────────────────────────────────┘
// document
// https://microsoft.github.io/code-push/docs/cli.html#link-6

// code-push app add Bitmark ios react-native


// testnet
// code-push release-react Bitmark-Registry ios --pre "Bitmark Registry dev" --mandatory true  --sourcemapOutput "source-map-tool/source-map/test/main.jsbundle_1.1.1.map"
// code-push release-react dungle_bitmark/Bitmark-Registry ios --pre "Bitmark dev" -m --description "update code" --sourcemapOutput "source-map-tool/source-map/test/main.jsbundle_1.0.8.map" [--targetBinaryVersion "~1.1.1"]

// livetnet
// code-push release-react Bitmark-Registry ios -d Production --mandatory true --sourcemapOutput "source-map-tool/source-map/live/main.jsbundle_1.1.1.map"
// code-push release-react Bitmark-Registry ios -d Production -m --description "update code" --sourcemapOutput "source-map-tool/source-map/live/main.jsbundle_1.1.1.map" [--targetBinaryVersion "~1.1.1"]


// react-native run-ios --device "Bitmark’s iPhone" --scheme 'Bitmark Registry dev'
// react-native run-ios --device "iPhone 5 testing" --scheme 'Bitmark dev'


// code-push release-react dungle_bitmark/Bitmark-Registry ios --pre "Bitmark Registry dev" --mandatory true  --sourcemapOutput "tools/source-map-tool/source-map/test/main.jsbundle_1.0.8.map" --plistFile=/Users/binle/Workspace/src/github.com/bitmark-inc/bitmark-mobile-registry/client-app/ios/Bitmark/Info-dev.plist