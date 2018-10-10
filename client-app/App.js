import { Text } from 'react-native';
import codePush from "react-native-code-push";
import DeviceInfo from 'react-native-device-info';

Text.defaultProps = Text.defaultProps || {};
Text.defaultProps.allowFontScaling = false;

import i18n from 'i18n-js';

import {
  BitmarkAppComponent,
  MainAppComponent
} from './src';
import { config } from './src/configs';

if (config.network === config.NETWORKS.livenet) {
  i18n.locale = 'en';
} else {
  i18n.locale = DeviceInfo.getDeviceLocale();
}
console.log('i18n.locale:', i18n.locale);
i18n.fallbacks = true;
i18n.translations = require('./assets/localizations.json');
global.i18n = i18n;

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
