import React from 'react';
import Swiper from 'react-native-swiper';
import Hyperlink from 'react-native-hyperlink';
import {
  View, Text, TouchableOpacity, Image,
  StatusBar,
  AppState,
} from 'react-native'
import { Actions } from 'react-native-router-flux';
import newAccountStyle from './new-account.component.style';
import { AppProcessor, CommonModel } from 'src/processors';
import { defaultStyles } from 'src/views/commons';
import { constant, config } from 'src/configs';
import { convertWidth } from 'src/utils';

export class NewAccountComponent extends React.Component {
  constructor(props) {
    super(props);
    this.handleAppStateChange = this.handleAppStateChange.bind(this);
    this.createNewAccount = this.createNewAccount.bind(this);
    this.state = {
      showPagination: true,
      scrollEnabled: true,
      index: 0,
    };
  }
  componentDidMount() {
    AppState.addEventListener('change', this.handleAppStateChange);
  }

  componentWillUnmount() {
    AppState.removeEventListener('change', this.handleAppStateChange);
  }
  handleAppStateChange(nextAppState) {
    if (nextAppState === 'active') {
      this.setState({
        index: this.state.index
      });
      if (this['player' + this.state.index] && this['player' + this.state.index].seek) {
        this['player' + this.state.index].seek(0);
      }
    }
  }

  async createNewAccount(enableTouchId) {
    let user = await AppProcessor.doCreateNewAccount(enableTouchId);
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
      <View style={newAccountStyle.body}>
        <StatusBar hidden={false} />
        <View style={newAccountStyle.main}>
          <Swiper activeDotColor='#0060F2'
            scrollEnabled={this.state.scrollEnabled}
            showsPagination={this.state.showPagination} showsButtons={false}
            buttonWrapperStyle={{ color: 'black' }} loop={false}
            paginationStyle={newAccountStyle.swipePagination}
            ref={swiper => this.swiper = swiper}
            onIndexChanged={(index) => {
              this.setState({
                index: index,
              });
              if (this['player' + index] && this['player' + index].seek) {
                this['player' + index].seek(0);
              }
            }}
            dot={
              <View style={newAccountStyle.swipeDotButton} />
            }>

            <View style={[newAccountStyle.swipeArea, { paddingTop: 0, }]} >
              <View style={[defaultStyles.header, {
                backgroundColor: 'white',
                height: constant.headerSize.height + (config.isIPhoneX ? 44 : 20), paddingTop: config.isIPhoneX ? 44 : 20,
              }]}>
                <TouchableOpacity style={defaultStyles.headerLeft} onPress={Actions.pop}>
                  <Image style={defaultStyles.headerLeftIcon} source={require('assets/imgs/header_blue_icon.png')} />
                </TouchableOpacity>
                <Text style={defaultStyles.headerTitle}></Text>
                <TouchableOpacity style={defaultStyles.headerRight}>
                </TouchableOpacity>
              </View>

              <View style={newAccountStyle.swipePage}>
                <View style={newAccountStyle.swipePageContent}>
                  <Text style={[newAccountStyle.introductionTitle]}>{global.i18n.t("NewAccountComponent_introductionTitle1")}</Text>
                  <Text style={[newAccountStyle.introductionDescription]}>
                    {global.i18n.t("NewAccountComponent_introductionDescription1")}
                  </Text>
                  <Image style={[newAccountStyle.introductionImage, { width: convertWidth(261), height: 385 * convertWidth(261) / 261 }]} source={require('assets/imgs/introduction1.png')} />
                </View>
              </View>
            </View>

            <View style={newAccountStyle.swipeArea} >
              <View style={[defaultStyles.header, { backgroundColor: 'white', height: constant.headerSize.height + (config.isIPhoneX ? 44 : 22) }]} />
              <View style={newAccountStyle.swipePage}>
                <View style={newAccountStyle.swipePageContent}>
                  <Text style={[newAccountStyle.introductionTitle]}>{global.i18n.t("NewAccountComponent_introductionTitle2")}</Text>
                  <Text style={[newAccountStyle.introductionDescription]}>
                    {global.i18n.t("NewAccountComponent_introductionDescription2")}
                  </Text>
                  <Image style={newAccountStyle.introductionImage} source={require('assets/imgs/introduction2.png')} />
                </View>
              </View>
            </View>

            <View style={newAccountStyle.swipeArea} >
              <View style={[defaultStyles.header, { backgroundColor: 'white', height: constant.headerSize.height + (config.isIPhoneX ? 44 : 22) }]} />
              <View style={newAccountStyle.swipePage}>
                <View style={newAccountStyle.swipePageContent}>
                  <Text style={[newAccountStyle.introductionTitle]}>{global.i18n.t("NewAccountComponent_introductionTitle3")}</Text>
                  <Text style={[newAccountStyle.introductionDescription]}>
                    {global.i18n.t("NewAccountComponent_introductionDescription3")}
                  </Text>
                  <Image style={newAccountStyle.introductionImage} source={require('assets/imgs/introduction3.png')} />
                </View>
              </View>
            </View>

            <View style={newAccountStyle.swipeArea} >
              <View style={[defaultStyles.header, { backgroundColor: 'white', height: constant.headerSize.height + (config.isIPhoneX ? 44 : 22) }]} />
              <View style={newAccountStyle.swipePage}>
                <View style={newAccountStyle.swipePageContent}>
                  <Text style={[newAccountStyle.introductionTitle,]}>{global.i18n.t("PublicAccountNumberComponent_introductionTitle")}</Text>
                  <Text style={[newAccountStyle.introductionDescription]}>
                    {global.i18n.t("PublicAccountNumberComponent_introductionDescription")}
                  </Text>
                  <Image style={[newAccountStyle.introductionImage, { width: convertWidth(216), height: 368 * convertWidth(216) / 216 }]} source={require('assets/imgs/introduction4.png')} />

                  <View style={newAccountStyle.introductionTermPrivacy}>
                    <Hyperlink
                      onPress={(url) => {
                        if (url === (config.bitmark_web_site + '/privacy')) {
                          Actions.bitmarkWebViewFull({ title: global.i18n.t("PublicAccountNumberComponent_privacyPolicy"), sourceUrl: config.bitmark_web_site + '/privacy?env=app', });
                        } else if (url === (config.bitmark_web_site + '/terms')) {
                          Actions.bitmarkWebViewFull({ title: global.i18n.t("PublicAccountNumberComponent_termsOfService"), sourceUrl: config.bitmark_web_site + '/terms?env=app', });
                        }
                      }}
                      linkStyle={newAccountStyle.bitmarkTermsPrivacyButtonText}
                      linkText={url => {
                        if (url === (config.bitmark_web_site + '/terms')) {
                          return global.i18n.t("PublicAccountNumberComponent_termsOfService");
                        } else if (url === (config.bitmark_web_site + '/privacy')) {
                          return global.i18n.t("PublicAccountNumberComponent_privacyPolicy");
                        }
                        return '';
                      }}>
                      <Text style={newAccountStyle.bitmarkTermsPrivacyText}>{global.i18n.t("PublicAccountNumberComponent_bitmarkTermsPrivacyText", { 0: config.bitmark_web_site + '/terms', 1: config.bitmark_web_site + '/privacy' })}</Text>
                    </Hyperlink>
                  </View>
                </ View>
              </View>
              <View style={newAccountStyle.letDoItButtonArea}>
                <TouchableOpacity style={[newAccountStyle.letDoItButton]} onPress={() => {
                  Actions.faceTouchId({ doContinue: this.createNewAccount })
                }}>
                  <Text style={[newAccountStyle.letDoItButtonText]}>{global.i18n.t("PublicAccountNumberComponent_letDoIt")}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Swiper>

          {this.state.index === 0 && <View style={[newAccountStyle.skipButtonArea]}>
            <TouchableOpacity style={[newAccountStyle.skipButton]} onPress={() => { this.swiper.scrollBy(3) }}>
              <Text style={[newAccountStyle.skipButtonText,]}>{global.i18n.t("NewAccountComponent_skip")}</Text>
            </TouchableOpacity>
          </View>}
        </View>
      </View>
    );
  }
}