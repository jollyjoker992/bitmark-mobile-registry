import DeviceInfo from 'react-native-device-info';
import { Text } from 'react-native';

Text.defaultProps.allowFontScaling = false;

import { BitmarkAppComponent, CodePushMainAppComponent } from './src';

let ApplicationComponent = BitmarkAppComponent;
if (
  DeviceInfo.getBundleId() === 'com.bitmark.registry' ||
  DeviceInfo.getBundleId() === 'com.bitmark.registry.inhouse'
) {
  ApplicationComponent = CodePushMainAppComponent;
} else {
  // disable warning/exception messages, suggest by dung to avoid the exception of
  // 'Could not invoke HeadlessJsTaskSupport.notifyTaskFinished'
  // steps to generate exception:
  // first time open app => restore account => 24 words => enable face id => exception
  console.disableYellowBox = true;
  console.reportErrorsAsExceptions = false;
}
export default ApplicationComponent;
