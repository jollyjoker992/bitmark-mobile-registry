import React from 'react';
import PropTypes from 'prop-types';
import {
  View, Text, TouchableOpacity, ScrollView, Image, SafeAreaView,
  Alert,
  Clipboard,
} from 'react-native';

import incomingClaimRequestStyle from './incoming-claim-request.component.style';
import { defaultStyles } from 'src/views/commons';
import { constant, config } from 'src/configs';
import { Actions } from 'react-native-router-flux';
import { AppProcessor, EventEmitterService, CacheData, CommonProcessor } from 'src/processors';
import { OneTabButtonComponent } from 'src/views/commons/one-tab-button.component';

export class IncomingClaimRequestComponent extends React.Component {
  static propTypes = {
    incomingClaimRequest: PropTypes.any,
  }
  constructor(props) {
    super(props);
    this.doReject = this.doReject.bind(this);
    this.doAccept = this.doAccept.bind(this);
    this.state = {
      copyText: 'copy',
    };
  }

  doReject() {
    Alert.alert(global.i18n.t('IncomingClaimRequestComponent_rejectAlertTitle'), '', [{
      text: global.i18n.t('IncomingClaimRequestComponent_rejectAlertOK'), onPress: () => {
        AppProcessor.doProcessIncomingClaimRequest(this.props.incomingClaimRequest, false).then((result => {
          if (result && result.ok) {
            Actions.jump('transactions');
          }
        })).catch(error => {
          console.log({ error });
          EventEmitterService.emit(EventEmitterService.events.APP_PROCESS_ERROR, { error });
        });
      }
    }, {
      text: global.i18n.t('IncomingClaimRequestComponent_rejectAlertCancel'), style: 'cancel',
    }])
  }
  doAccept() {
    Alert.alert(global.i18n.t('IncomingClaimRequestComponent_signAlertTitle'), '', [{
      text: global.i18n.t('IncomingClaimRequestComponent_signAlertAgree'), onPress: () => {
        AppProcessor.doProcessIncomingClaimRequest(this.props.incomingClaimRequest, true, {
          indicator: constant.indicators.processing,
          title: global.i18n.t('IncomingClaimRequestComponent_processingTitle'),
          message: global.i18n.t('IncomingClaimRequestComponent_processingMessage'),
        }).then((result => {
          if (result && result.ok) {
            EventEmitterService.emit(EventEmitterService.events.APP_SUBMITTING, {
              indicator: constant.indicators.success,
              title: global.i18n.t('IncomingClaimRequestComponent_successTitle'),
              message: global.i18n.t('IncomingClaimRequestComponent_successMessage'),
            });
            setTimeout(() => {
              EventEmitterService.emit(EventEmitterService.events.APP_SUBMITTING, null);
              Actions.jump('transactions');
            }, 2000);
          } else if (result && !result.ok) {
            EventEmitterService.emit(EventEmitterService.events.APP_SUBMITTING, {
              indicator: constant.indicators.searching,
              title: global.i18n.t('IncomingClaimRequestComponent_noBitmarkTitle'),
              message: global.i18n.t('IncomingClaimRequestComponent_noBitmarkMessage'),
            });
            setTimeout(() => {
              EventEmitterService.emit(EventEmitterService.events.APP_SUBMITTING, null);
            }, 2000);
          }
        })).catch(error => {
          console.log({ error });
          EventEmitterService.emit(EventEmitterService.events.APP_PROCESS_ERROR, { error });
        });
      }
    }, {
      text: global.i18n.t('IncomingClaimRequestComponent_signAlertDisagree'), style: 'cancel'
    }]);
  }

  render() {
    let bitmarkAccountNumber = CacheData.userInformation.bitmarkAccountNumber;
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#F5F5F5' }}>
        <View style={[defaultStyles.header, { height: constant.headerSize.height }]}>
          <OneTabButtonComponent style={defaultStyles.headerLeft} onPress={Actions.pop}>
            <Image style={defaultStyles.headerLeftIcon} source={require('assets/imgs/header_blue_icon.png')} />
          </OneTabButtonComponent>
          <Text style={defaultStyles.headerTitle}>{global.i18n.t("IncomingClaimRequestComponent_headerTitle")}</Text>
          <OneTabButtonComponent style={defaultStyles.headerRight} />
        </View>

        <View style={incomingClaimRequestStyle.body}>
          <ScrollView style={[incomingClaimRequestStyle.contentScroll]} contentContainerStyle={{ flexGrow: 1, }}>
            <TouchableOpacity activeOpacity={1} style={incomingClaimRequestStyle.content}>
              <View style={incomingClaimRequestStyle.assetInfoArea}>
                <Image style={incomingClaimRequestStyle.assetThumbnail} source={{ uri: this.props.incomingClaimRequest.asset.thumbnailPath || `${config.bitmark_profile_server}/s/asset/thumbnail?asset_id=${this.props.incomingClaimRequest.asset.id}` }} />
                <Text style={incomingClaimRequestStyle.assetInfo}>{this.props.incomingClaimRequest.asset.name}</Text>
                <Text style={incomingClaimRequestStyle.editionNumber}>
                  {global.i18n.t("IncomingClaimRequestComponent_editionNumber", {
                    number: this.props.incomingClaimRequest.index + '/' + this.props.incomingClaimRequest.asset.editions[bitmarkAccountNumber].limited
                  })}
                </Text>
                <Text style={incomingClaimRequestStyle.issuer}>{CommonProcessor.getDisplayedAccount(CacheData.userInformation.bitmarkAccountNumber)}</Text>
              </View>
              <View style={incomingClaimRequestStyle.requestInfoArea}>
                <View style={incomingClaimRequestStyle.requestFromAccount}>
                  <Text style={incomingClaimRequestStyle.requestFromAccountLabel}>{global.i18n.t("IncomingClaimRequestComponent_requestFromAccountLabel")}</Text>
                  <OneTabButtonComponent style={incomingClaimRequestStyle.requestFromAccountCopyButton} onPress={() => {
                    Clipboard.setString(this.props.incomingClaimRequest.from);
                    this.setState({ copyText: 'copied' });
                    setTimeout(() => { this.setState({ copyText: 'copy' }) }, 1000);
                  }}>
                    <Text style={incomingClaimRequestStyle.requestFromAccountCopyButtonText}>{global.i18n.t(`IncomingClaimRequestComponent_${this.state.copyText}`)}</Text>
                  </OneTabButtonComponent>
                </View>
                <View style={incomingClaimRequestStyle.requestFromAccountNumber}>
                  <Text style={incomingClaimRequestStyle.requestFromAccountNumberValue}>{this.props.incomingClaimRequest.from}</Text>
                </View>
                <Text style={incomingClaimRequestStyle.requestMessage}>{global.i18n.t("IncomingClaimRequestComponent_requestMessage", { assetName: this.props.incomingClaimRequest.asset.name })}</Text>
              </View>
            </TouchableOpacity>
          </ScrollView>
        </View >

        <View style={incomingClaimRequestStyle.buttonsArea}>
          <OneTabButtonComponent style={incomingClaimRequestStyle.rejectButton} onPress={this.doReject}>
            <Text style={incomingClaimRequestStyle.rejectButtonText}>{global.i18n.t("IncomingClaimRequestComponent_rejectButtonText")}</Text>
          </OneTabButtonComponent>
          <OneTabButtonComponent style={[incomingClaimRequestStyle.acceptButton, { marginLeft: 1 }]} onPress={this.doAccept}>
            <Text style={incomingClaimRequestStyle.acceptButtonText}>{global.i18n.t("IncomingClaimRequestComponent_acceptButtonText")}</Text>
          </OneTabButtonComponent>
        </View>

      </SafeAreaView>
    );
  }
}