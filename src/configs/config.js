import { Platform, Dimensions } from 'react-native';
import DeviceInfo from 'react-native-device-info';
import { merge } from 'lodash';

import { iosConfig } from './ios-config';
import { androidConfig } from './android-config';

const NETWORKS = {
  devnet: 'devnet',
  testnet: 'testnet',
  livenet: 'livenet',
};

let network = NETWORKS.livenet;
let bundleId = DeviceInfo.getBundleId();
network = bundleId === 'com.bitmark.registry.inhouse' ? NETWORKS.testnet : network;

let commonConfig = {
  network,
  NETWORKS,

  bundleId,
  version: DeviceInfo.getVersion(),
  buildNumber: DeviceInfo.getBuildNumber(),
  localization: DeviceInfo.getDeviceLocale(),
  windowSize: Dimensions.get('window'),

  zeroAddress: 'dw9MQXcC5rJZb3QE1nz86PiQAheMP1dx9M3dr52tT8NNs14m33',
  bitmark_network: NETWORKS.testnet,
  appLink: 'https://itunes.apple.com/us/app/bitmark-registry/id1429427796?ls=1&mt=8',
  api_server_url: 'https://api.test.bitmark.com',
  key_account_server_url: 'https://key.test.bitmarkaccountassets.com',
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
  bitmark_profile_server: 'http://192.168.0.106:1102',
  needResetLocalData: 1551067776993,
};

if (commonConfig.network === NETWORKS.testnet) {
  commonConfig.trade_server_url = 'https://trade.test.bitmark.com';
  commonConfig.mobile_server_url = 'https://bm.test.bitmark.com';
  commonConfig.ifttt_server_url = 'https://when.test.bitmark.com:8090';
  commonConfig.ifttt_invite_url = 'https://ifttt.com/features/redeem?code=10518-3f2950b543e7a5a2dc307de0c05775e4';
  commonConfig.ifttt_bitmark_service_url = 'https://ifttt.com/bitmarktest';
  commonConfig.ifttt_bitmark_service_settings_url = "https://ifttt.com/services/bitmarktest/settings";
  commonConfig.web_app_server_url = "https://webapp.test.bitmark.com";
  commonConfig.preview_asset_url = "https://preview.test.bitmarkaccountassets.com";
  commonConfig.file_courier_server = 'https://file-courier.test.bitmark.com';
  commonConfig.key_account_server_url = 'https://key.test.bitmarkaccountassets.com';
  commonConfig.bitmark_profile_server = 'https://profiles.test.bitmark.com';
  // commonConfig.bitmark_profile_server = 'http://192.168.0.102:1102';

} else if (commonConfig.network === NETWORKS.livenet) {
  commonConfig.bitmark_network = NETWORKS.livenet;
  commonConfig.api_server_url = 'https://api.bitmark.com';
  commonConfig.registry_server_url = 'https://registry.bitmark.com';
  commonConfig.trade_server_url = 'https://trade.bitmark.com';
  commonConfig.mobile_server_url = 'https://bm.bitmark.com';
  commonConfig.ifttt_server_url = 'https://when.live.bitmark.com:8090';
  commonConfig.ifttt_invite_url = 'https://ifttt.com/features/redeem?code=9187-5ba0e766190b2d174a5a3708fe2002ae';
  commonConfig.ifttt_bitmark_service_url = 'https://ifttt.com/bitmark';
  commonConfig.ifttt_bitmark_service_settings_url = "https://ifttt.com/services/bitmark/settings";
  commonConfig.web_app_server_url = "https://a.bitmark.com";
  commonConfig.preview_asset_url = "https://preview.bitmarkaccountassets.com";
  commonConfig.bitmark_web_site = 'https://bitmark.com';
  commonConfig.zeroAddress = 'a3ezwdYVEVrHwszQrYzDTCAZwUD3yKtNsCq9YhEu97bPaGAKy1';
  commonConfig.file_courier_server = 'https://file-courier.bitmark.com';
  commonConfig.bitmark_profile_server = 'https://profiles.bitmark.com';
  commonConfig.key_account_server_url = 'https://key.bitmarkaccountassets.com';
}


let config = merge({}, commonConfig, Platform.select({ ios: iosConfig, android: androidConfig }));

export { config };
