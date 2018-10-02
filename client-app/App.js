import DeviceInfo from 'react-native-device-info';
import { Text } from 'react-native';

Text.defaultProps = Text.defaultProps ||{};
Text.defaultProps.allowFontScaling = false;

import i18n from 'i18n-js';
// i18n.locale = DeviceInfo.getDeviceLocale();
i18n.locale = "en";

console.log('i18n.locale:', i18n.locale);
i18n.fallbacks = true;
i18n.translations = require('./assets/localizations.json');

global.i18n = i18n;

import {
  BitmarkAppComponent,
  CodePushMainAppComponent
} from './src';

let ApplicationComponent = BitmarkAppComponent;
if (DeviceInfo.getBundleId() === 'com.bitmark.registry' || DeviceInfo.getBundleId() === 'com.bitmark.registry.inhouse') {
  ApplicationComponent = CodePushMainAppComponent;
}
export default ApplicationComponent;
