import DeviceInfo from 'react-native-device-info';
import { Text } from 'react-native';

Text.defaultProps = Text.defaultProps ||{};
Text.defaultProps.allowFontScaling = false;

import {
  BitmarkAppComponent,
  CodePushMainAppComponent
} from './src';

let ApplicationComponent = BitmarkAppComponent;
if (DeviceInfo.getBundleId() === 'com.bitmark.registry' || DeviceInfo.getBundleId() === 'com.bitmark.registry.inhouse') {
  ApplicationComponent = CodePushMainAppComponent;
}
export default ApplicationComponent;
