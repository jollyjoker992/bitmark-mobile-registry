import React from 'react';
import PropTypes from 'prop-types';
import Swiper from 'react-native-swiper';
import { StackNavigator, } from 'react-navigation';
import Hyperlink from 'react-native-hyperlink';
import {
  View, Text, TouchableOpacity, Image,
  StatusBar,
  AppState,
} from 'react-native'
import Video from 'react-native-video';

import {
  BitmarkWebViewComponent,
  BitmarkComponent
} from './../../../commons/components';
import defaultStyle from './../../../commons/styles';

import newAccountStyle from './new-account.component.style';

import { AppProcessor } from '../../../processors';
import { iosConstant } from '../../../configs/ios/ios.config';
import { config } from '../../../configs';
const helper = require('../../../utils/helper');

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
    await helper.addTestWriteRecoveryPhaseActionRequired(user);

    return user;
  }

  render() {
    return (
      <View style={newAccountStyle.body}>
        <StatusBar hidden={false} />
        <View style={newAccountStyle.main}>
          <Swiper activeDotColor='#0060F2'
            scrollEnabled={this.state.scrollEnabled}
            showsPagination={this.state.showPagination} style={newAccountStyle.swipeArea} showsButtons={false}
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

            {/*REGISTER ASSETS*/}
            <BitmarkComponent
              backgroundColor='white'
              ref={(ref) => this.fullRef = ref}
              header={(<View style={[defaultStyle.header, { backgroundColor: 'white' }]}>
                <TouchableOpacity style={defaultStyle.headerLeft} onPress={() => { this.props.navigation.goBack() }}>
                  <Image style={defaultStyle.headerLeftIcon} source={require('../../../../assets/imgs/header_blue_icon.png')} />
                </TouchableOpacity>
                <Text style={defaultStyle.headerTitle}></Text>
                <TouchableOpacity style={defaultStyle.headerRight}>
                </TouchableOpacity>
              </View>)}
              contentInScroll={true}
              content={(
                <View style={newAccountStyle.swipePage}>
                  <View style={newAccountStyle.introductionArea}>
                    <Text style={[newAccountStyle.introductionTitle]}>{global.i18n.t("NewAccountComponent_introductionTitle1")}</Text>
                    <Text style={[newAccountStyle.introductionDescription]}>
                      {global.i18n.t("NewAccountComponent_introductionDescription1")}
                    </Text>
                  </View>

                  <View style={newAccountStyle.introductionImageArea}>
                    <Image style={newAccountStyle.onBoardingImage} source={require('../../../../assets/imgs/register-assets.png')} />
                  </View>
                </View>
              )}
            />

            {/*MANAGE YOUR PROPERTY*/}
            <BitmarkComponent
              backgroundColor='white'
              ref={(ref) => this.fullRef = ref}
              header={(<View style={[defaultStyle.header, { backgroundColor: 'white' }]}></View>)}
              contentInScroll={true}
              content={(
                <View style={newAccountStyle.swipePage}>
                  <View style={newAccountStyle.introductionArea}>
                    <Text style={[newAccountStyle.introductionTitle]}>{global.i18n.t("NewAccountComponent_introductionTitle2")}</Text>
                    <Text style={[newAccountStyle.introductionDescription]}>
                      {global.i18n.t("NewAccountComponent_introductionDescription2")}
                    </Text>
                  </View>

                  <View style={newAccountStyle.introductionImageArea}>
                    <Image style={newAccountStyle.onBoardingImage} source={require('../../../../assets/imgs/manage-your-property.png')} />
                  </View>
                </View>
              )}
            />

            {/*ACTIONS AND HISTORY*/}
            <BitmarkComponent
              backgroundColor='white'
              ref={(ref) => this.fullRef = ref}
              header={(<View style={[defaultStyle.header, { backgroundColor: 'white' }]}></View>)}
              contentInScroll={true}
              content={(
                <View style={newAccountStyle.swipePage}>
                  <View style={newAccountStyle.introductionArea}>
                    <Text style={[newAccountStyle.introductionTitle]}>{global.i18n.t("NewAccountComponent_introductionTitle3")}</Text>
                    <Text style={[newAccountStyle.introductionDescription]}>
                      {global.i18n.t("NewAccountComponent_introductionDescription3")}
                    </Text>
                  </View>

                  <View style={newAccountStyle.introductionImageArea}>
                    <Image style={newAccountStyle.actionAndHistoryOnBoardingImage} source={require('../../../../assets/imgs/actions-and-history.png')} />
                  </View>
                </View>
              )}
            />

            {/*PUBLIC ACCOUNT NUMBER*/}
            <FullPublicAccountNumberComponent screenProps={{
              newAccountNavigation: this.props.navigation,
              createBitmarkAccount: this.createNewAccount,
              setShowPagination: (show) => {
                this.setState({
                  showPagination: show,
                  scrollEnabled: show,
                })
              },
              isFullScreen: true
            }} />
          </Swiper>

          {this.state.index === 0 && <View style={[newAccountStyle.skipButtonArea]}>
            <TouchableOpacity style={[newAccountStyle.skipButton]} onPress={() => { this.swiper.scrollBy(3) }}>
              <Text style={[newAccountStyle.skipButtonText, { color: '#0060F2', fontSize: 14, fontWeight: '900' }]}>{global.i18n.t("NewAccountComponent_skip")}</Text>
            </TouchableOpacity>
          </View>}
        </View>
      </View>
    );
  }
}

NewAccountComponent.propTypes = {
  screenProps: PropTypes.shape({
    enableJustCreatedBitmarkAccount: PropTypes.func,
  }),
  navigation: PropTypes.shape({
    navigate: PropTypes.func,
    goBack: PropTypes.func,
    state: PropTypes.shape({
      params: PropTypes.shape({
        justCreatedBitmarkAccount: PropTypes.bool,
      })
    })
  })
};

class PublicAccountNumberComponent extends React.Component {
  constructor(props) {
    super(props)
  }
  render() {
    return (
      <BitmarkComponent
        backgroundColor='white'
        ref={(ref) => this.fullRef = ref}
        header={(<View style={[defaultStyle.header, { backgroundColor: 'white' }]}></View>)}
        contentInScroll={true}
        content={(
          <View style={newAccountStyle.swipePage}>
            <View style={newAccountStyle.introductionArea}>
              <Text style={[newAccountStyle.introductionTitle,]}>{global.i18n.t("PublicAccountNumberComponent_introductionTitle")}</Text>
              <Text style={[newAccountStyle.introductionDescription]}>
                {global.i18n.t("PublicAccountNumberComponent_introductionDescription")}
              </Text>
            </View>

            <View style={newAccountStyle.introductionImageArea}>
              <Image style={newAccountStyle.publicAccountNumberOnBoardingImage} source={require('../../../../assets/imgs/public-account-number.png')} />
            </View>

            <View style={newAccountStyle.introductionTermPrivacy}>
              <Hyperlink
                onPress={(url) => {
                  if (url === (config.bitmark_web_site + '/privacy')) {
                    this.props.navigation.navigate('BitmarkWebView', { title: global.i18n.t("PublicAccountNumberComponent_privacyPolicy"), sourceUrl: config.bitmark_web_site + '/privacy?env=app', isFullScreen: true, });
                    this.props.screenProps.setShowPagination(false);
                  } else if (url === (config.bitmark_web_site + '/terms')) {
                    this.props.navigation.navigate('BitmarkWebView', { title: global.i18n.t("PublicAccountNumberComponent_termsOfService"), sourceUrl: config.bitmark_web_site + '/terms?env=app', isFullScreen: true, });
                    this.props.screenProps.setShowPagination(false);
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
                <Text style={newAccountStyle.bitmarkTermsPrivacyText}>{global.i18n.t("PublicAccountNumberComponent_bitmarkTermsPrivacyText", {0: config.bitmark_web_site + '/terms', 1: config.bitmark_web_site + '/privacy'})}</Text>
              </Hyperlink>
            </View>
          </ View>
        )}
        footerHeight={45 + iosConstant.blankFooter / 2}
        footer={(<View style={newAccountStyle.letDoItButtonArea}>
          <TouchableOpacity style={[newAccountStyle.letDoItButton]} onPress={() => {
            this.props.screenProps.newAccountNavigation.navigate('FaceTouchId', { doContinue: this.props.screenProps.createBitmarkAccount });
          }}>
            <Text style={[newAccountStyle.letDoItButtonText]}>{global.i18n.t("PublicAccountNumberComponent_letDoIt")}</Text>
          </TouchableOpacity>
        </View>
        )}
      />
    );
  }
}

PublicAccountNumberComponent.propTypes = {
  screenProps: PropTypes.shape({
    newAccountNavigation: PropTypes.shape({
      navigate: PropTypes.func,
    }),
    createBitmarkAccount: PropTypes.func,
    setShowPagination: PropTypes.func,
  }),
  navigation: PropTypes.shape({
    navigate: PropTypes.func,
    state: PropTypes.shape({
      params: PropTypes.shape({
        justCreatedBitmarkAccount: PropTypes.bool,
      })
    })
  })
};

var FullPublicAccountNumberComponent = StackNavigator({
  PublicAccountNumber: { screen: PublicAccountNumberComponent },
  BitmarkWebView: { screen: BitmarkWebViewComponent },
}, {
    headerMode: 'none',
    mode: 'modal',
    navigationOptions: {
      gesturesEnabled: false,
    },
    cardStyle: {
      shadowOpacity: 0,
    }
  }
);
