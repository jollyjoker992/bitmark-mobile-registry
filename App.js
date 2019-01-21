import { Text } from 'react-native';
import codePush from "react-native-code-push";
import DeviceInfo from 'react-native-device-info';
import { Sentry } from 'react-native-sentry';
import { Buffer } from 'safe-buffer';

import i18n from 'i18n-js';

import {
  BitmarkAppComponent,
  MainAppComponent
} from './src';
import { BitmarkSDK } from 'src/processors';
import { config } from 'src/configs';

Text.defaultProps = Text.defaultProps || {};
Text.defaultProps.allowFontScaling = false;

if (!__DEV__) {
  Sentry.config('https://24a5a145b3af4985b5162cd1f866168f@sentry.io/1342482').install();
  // set the tag context
  Sentry.setTagsContext({
    "environment": DeviceInfo.getBundleId(),
    "BundleId": DeviceInfo.getBundleId(),
    "Version": DeviceInfo.getVersion(),
    "BuildNumber": DeviceInfo.getBuildNumber(),
  });
}


// i18n.locale = 'zh';
i18n.locale = DeviceInfo.getDeviceLocale();
i18n.fallbacks = true;
i18n.translations = require('./assets/localizations.json');
global.i18n = i18n;
global.Buffer = global.Buffer || Buffer;

BitmarkSDK.sdkInit(config.network);

let codePushOptions = {
  updateDialog: {
    title: global.i18n.t("CodePushOptions_title"),
    optionalUpdateMessage: global.i18n.t("CodePushOptions_optionalUpdateMessage"),
    mandatoryUpdateMessage: global.i18n.t("CodePushOptions_mandatoryUpdateMessage"),
    optionalInstallButtonLabel: global.i18n.t("CodePushOptions_optionalInstallButtonLabel"),
    mandatoryContinueButtonLabel: global.i18n.t("CodePushOptions_mandatoryContinueButtonLabel"),
    optionalIgnoreButtonLabel: null
  },
  checkFrequency: codePush.CheckFrequency.ON_APP_RESUME,
  installMode: codePush.InstallMode.IMMEDIATE
};

let CodePushMainAppComponent = codePush(codePushOptions)(MainAppComponent);


let ApplicationComponent = BitmarkAppComponent;
if (DeviceInfo.getBundleId() === 'com.bitmark.registry' || DeviceInfo.getBundleId() === 'com.bitmark.registry.inhouse') {
  ApplicationComponent = CodePushMainAppComponent;
}
export default ApplicationComponent;
