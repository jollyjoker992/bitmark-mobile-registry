import React from 'react';
import {
  Text, View, TouchableOpacity, Image, SafeAreaView,
  Share,
  Alert,
  Linking,
} from 'react-native';
import Mailer from 'react-native-mail';
import { Actions } from 'react-native-router-flux';

import applicationDetailStyle from './application-detail.component.style';
import { config, } from 'src/configs';
import { CacheData, CommonProcessor } from 'src/processors';
import { defaultStyles } from 'src/views/commons';
import moment from 'moment';


export class ApplicationDetailComponent extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const shareApp = () => {
      Share.share({ title: 'Bitmark', message: '', url: config.appLink });
    };
    const requestSendFeedback = () => {
      Alert.alert(global.i18n.t("ApplicationDetailComponent_sendFeedbackTitle"), global.i18n.t("ApplicationDetailComponent_sendFeedbackMessage"), [{
        text: global.i18n.t("ApplicationDetailComponent_cancel"), style: 'cancel',
      }, {
        text: global.i18n.t("ApplicationDetailComponent_send"), onPress: sendFeedback,
      }]);
    };

    const rateApp = () => {
      Alert.alert(global.i18n.t("ApplicationDetailComponent_appStoreReviewTitle"), global.i18n.t("ApplicationDetailComponent_appStoreReviewMessage"), [{
        text: global.i18n.t("ApplicationDetailComponent_5Stars"),
        style: 'cancel',
        onPress: () => { Linking.openURL(config.appLink) }
      }, {
        text: global.i18n.t("ApplicationDetailComponent_4StarsOrLess"), onPress: requestSendFeedback,
      }]);
    }

    const sendFeedback = () => {
      Mailer.mail({
        subject: global.i18n.t("ApplicationDetailComponent_suggestionForBitmarkIos"),
        recipients: ['support@bitmark.com'],
        body: global.i18n.t("ApplicationDetailComponent_appVersion") + ' ' + config.version + ' (' + config.buildNumber + ')',
      }, (error) => {
        if (error) {
          Alert.alert(global.i18n.t("ApplicationDetailComponent_sendFeedbackErrorTitle"), global.i18n.t("ApplicationDetailComponent_sendFeedbackErrorMessage"));
        }
      });
    };

    return (
      <SafeAreaView style={applicationDetailStyle.body}>
        <View style={applicationDetailStyle.header}>
          <TouchableOpacity style={defaultStyles.headerLeft} onPress={Actions.pop} >
            <Image style={defaultStyles.headerLeftIcon} source={require('assets/imgs/header_blue_icon.png')} />
          </TouchableOpacity>
          <Text style={defaultStyles.headerTitle}>{global.i18n.t("ApplicationDetailComponent_details")}</Text>
          <TouchableOpacity style={defaultStyles.headerRight} />
        </View>
        <View style={applicationDetailStyle.bodyContent}>
          <View style={applicationDetailStyle.topArea}>
            <TouchableOpacity style={applicationDetailStyle.rowSetting} onPress={() => {
              Actions.bitmarkWebView({
                title: global.i18n.t("ApplicationDetailComponent_termsOfService"), sourceUrl: config.bitmark_web_site + '/legal/terms?env=app',
                hideBottomController: true,
              });
            }}>
              <Text style={applicationDetailStyle.itemSettingText}>{global.i18n.t("ApplicationDetailComponent_termsOfService").toUpperCase()}</Text>
            </TouchableOpacity>
            <View style={applicationDetailStyle.lineSetting}></View>
            <TouchableOpacity style={applicationDetailStyle.rowSetting} onPress={() => {
              Actions.bitmarkWebView({
                title: global.i18n.t("ApplicationDetailComponent_privacyPolicy"), sourceUrl: config.bitmark_web_site + '/legal/privacy?env=app',
                hideBottomController: true,
              });
            }}>
              <Text style={applicationDetailStyle.itemSettingText}>{global.i18n.t("ApplicationDetailComponent_privacyPolicy").toUpperCase()}</Text>
            </TouchableOpacity>
            <View style={applicationDetailStyle.lineSetting}></View>
          </View>

          <View style={applicationDetailStyle.donorInfo}>
            {config.isIPhone && <Text style={[applicationDetailStyle.version, { lineHeight: 20 }]}>{global.i18n.t("ApplicationDetailComponent_iCloudSync")} {CacheData.userInformation.lastSyncIcloud ? ('\n' + moment(CacheData.userInformation.lastSyncIcloud).format('YYYY/MM/DD, h:mma')) : ''}</Text>}
            <Text style={[applicationDetailStyle.version, { marginTop: 22, }]}>{global.i18n.t("ApplicationDetailComponent_version")} {config.version} ({config.buildNumber + (config.network !== 'livenet' ? '-' + config.network : '')})</Text>
          </View>

          <View style={applicationDetailStyle.bottomArea}>
            <View style={applicationDetailStyle.lineSetting}></View>
            <TouchableOpacity style={applicationDetailStyle.rowSetting} onPress={() => CommonProcessor.doDisplayedWhatNewInformation()}>
              <Text style={applicationDetailStyle.itemSettingText}>{global.i18n.t("ApplicationDetailComponent_whatNew")}</Text>
            </TouchableOpacity>
            <View style={applicationDetailStyle.lineSetting}></View>
            <TouchableOpacity style={applicationDetailStyle.rowSetting} onPress={() => rateApp()}>
              <Text style={applicationDetailStyle.itemSettingText}>{global.i18n.t("ApplicationDetailComponent_appStoreRatingAndReview")}</Text>
            </TouchableOpacity>
            <View style={applicationDetailStyle.lineSetting}></View>
            <TouchableOpacity style={applicationDetailStyle.rowSetting} onPress={() => { shareApp() }}>
              <Text style={applicationDetailStyle.itemSettingText}>{global.i18n.t("ApplicationDetailComponent_shareThisApp")}</Text>
            </TouchableOpacity>
            {/* <View style={applicationDetailStyle.lineSetting}></View>
            <TouchableOpacity style={[applicationDetailStyle.rowSetting, { marginBottom: constant.blankFooter, }]} onPress={() => { requestSendFeedback() }}>
              <Text style={applicationDetailStyle.itemSettingText}>{global.i18n.t("ApplicationDetailComponent_sendFeedback")}</Text>
            </TouchableOpacity> */}
          </View>
        </View>
      </SafeAreaView >
    );
  }
}
