import React from 'react';
import {
  View, Text, Image,
  StatusBar,
} from 'react-native';
import Hyperlink from 'react-native-hyperlink';

import welcomeComponentStyle from './welcome.component.style';
import { Actions } from 'react-native-router-flux';
import { constant, config } from 'src/configs';
import { OneTabButtonComponent } from 'src/views/commons/one-tab-button.component';
import { AppProcessor, CommonModel } from 'src/processors';

export class WelcomeComponent extends React.Component {
  constructor(props) {
    super(props);
  }

  async createNewAccount(enableTouchId) {
    console.log('createNewAccount run 1');
    let user = await AppProcessor.doCreateNewAccount(enableTouchId);
    console.log('createNewAccount run 2', user);
    if (!user) {
      return;
    }
    await CommonModel.doSetLocalData(`${CommonModel.KEYS.TEST_RECOVERY_PHASE_ACTION_REQUIRED}-${user.bitmarkAccountNumber}`, {
      timestamp: (new Date()).toISOString()
    });
    return { user, justCreatedBitmarkAccount: true };
  }

  render() {
    return (
      <View style={welcomeComponentStyle.body}>
        <StatusBar hidden={!config.isIPhoneX} />
        <View style={welcomeComponentStyle.welcomeBackground}>
          <View style={welcomeComponentStyle.swipePage}>
            <View style={welcomeComponentStyle.swipePageContent}>
              <Text style={[welcomeComponentStyle.introductionTitle]}>{global.i18n.t("WelcomeComponent_introductionTitle")}</Text>
              <Text style={[welcomeComponentStyle.introductionDescription]}>{global.i18n.t("WelcomeComponent_introductionDescription")}</Text>
              <Image style={welcomeComponentStyle.introductionImage} source={require('assets/imgs/introduction1.png')} />

              <View style={welcomeComponentStyle.introductionTermPrivacy}>
                <Hyperlink
                  onPress={(url) => {
                    console.log({ url });
                    if (url === (config.bitmark_web_site + '/legal/privacy')) {
                      Actions.bitmarkWebViewFull({ title: global.i18n.t("PublicAccountNumberComponent_privacyPolicy"), sourceUrl: config.bitmark_web_site + '/legal/privacy?env=app', });
                    } else if (url === (config.bitmark_web_site + '/legal/terms')) {
                      Actions.bitmarkWebViewFull({ title: global.i18n.t("PublicAccountNumberComponent_termsOfService"), sourceUrl: config.bitmark_web_site + '/legal/terms?env=app', });
                    }
                  }}
                  linkStyle={welcomeComponentStyle.bitmarkTermsPrivacyButtonText}
                  linkText={url => {
                    if (url.indexOf(config.bitmark_web_site + '/legal/terms') === 0) {
                      return url.replace(config.bitmark_web_site + '/legal/terms', global.i18n.t("PublicAccountNumberComponent_termsOfService"));
                    } else if (url.indexOf(config.bitmark_web_site + '/legal/privacy') === 0) {
                      return url.replace(config.bitmark_web_site + '/legal/privacy', global.i18n.t("PublicAccountNumberComponent_privacyPolicy"));
                    }
                    return '';
                  }}>
                  <Text style={welcomeComponentStyle.bitmarkTermsPrivacyText}>
                    {global.i18n.t("PublicAccountNumberComponent_bitmarkTermsPrivacyText", { 0: config.bitmark_web_site + '/legal/terms', 1: config.bitmark_web_site + '/legal/privacy' })}
                  </Text>
                </Hyperlink>
              </View>

            </View>
          </View>
          <View style={[welcomeComponentStyle.welcomeButtonArea]}>
            <OneTabButtonComponent style={[welcomeComponentStyle.welcomeButton,]} onPress={() => Actions.faceTouchId({ doContinue: this.createNewAccount })}>
              <Text style={[welcomeComponentStyle.welcomeButtonText,]}>{global.i18n.t("WelcomeComponent_createNewAccount")}</Text>
            </OneTabButtonComponent>
            <OneTabButtonComponent style={[welcomeComponentStyle.welcomeButton, {
              backgroundColor: '#F2FAFF',
              height: 45 + (constant.blankFooter / 2),
            }]} onPress={Actions.signIn}>
              <Text style={[welcomeComponentStyle.welcomeButtonText, {
                color: '#0060F2',
                paddingBottom: (constant.blankFooter / 2),
              }]}>{global.i18n.t("WelcomeComponent_accessExistingAccount")}</Text>
            </OneTabButtonComponent>
          </View>
        </View>
      </View>
    );
  }
}