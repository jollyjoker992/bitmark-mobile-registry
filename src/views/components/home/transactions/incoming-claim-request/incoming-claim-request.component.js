import React from 'react';
import PropTypes from 'prop-types';
import {
  View, Text, TouchableOpacity, ScrollView, Image, SafeAreaView,
  Alert,
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
          title: 'Pending...!',
          message: 'Sending your transaction to the Bitmark network...',
        }).then((result => {
          if (result && result.ok) {
            EventEmitterService.emit(EventEmitterService.events.APP_SUBMITTING, {
              indicator: constant.indicators.success,
              title: 'Success! ',
              message: 'The account will receive the property bitmark and notification very soon.',
            });
            setTimeout(() => {
              EventEmitterService.emit(EventEmitterService.events.APP_SUBMITTING, null);
              Actions.jump('transactions');
            }, 2000);
          } else if (result && !result.ok) {
            EventEmitterService.emit(EventEmitterService.events.APP_SUBMITTING, {
              indicator: constant.indicators.searching,
              title: 'Sorry!',
              message: 'There is no bitmark confirmed, please wait and try again later.',
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
                <Image style={incomingClaimRequestStyle.assetThumbnail} source={{ uri: `${config.bitmark_profile_server}/s/asset/thumbnail?asset_id=${this.props.incomingClaimRequest.asset.id}` }} />
                <Text style={incomingClaimRequestStyle.assetInfo}>{this.props.incomingClaimRequest.asset.name}</Text>
                <Text style={incomingClaimRequestStyle.editionNumber}>Editions [{this.props.incomingClaimRequest.index}/{this.props.incomingClaimRequest.asset.editions[bitmarkAccountNumber].limited}]</Text>
                <Text style={incomingClaimRequestStyle.issuer}>{CommonProcessor.getDisplayedAccount(CacheData.userInformation.bitmarkAccountNumber)}</Text>
              </View>
              <View style={incomingClaimRequestStyle.requestInfoArea}>
                <View style={incomingClaimRequestStyle.requestFromAccount}>
                  <Text style={incomingClaimRequestStyle.requestFromAccountLabel}>REQUEST FROM ACCOUNT</Text>
                  <OneTabButtonComponent style={incomingClaimRequestStyle.requestFromAccountCopyButton}>
                    <Text style={incomingClaimRequestStyle.requestFromAccountCopyButtonText}>COPY</Text>
                  </OneTabButtonComponent>
                </View>
                <View style={incomingClaimRequestStyle.requestFromAccountNumber}>
                  <Text style={incomingClaimRequestStyle.requestFromAccountNumberValue}>{this.props.incomingClaimRequest.from}</Text>
                </View>
                <Text style={incomingClaimRequestStyle.requestMessage}>The account above has requested the property {this.props.incomingClaimRequest.asset.name}. Please sign to transfer the bitmark. </Text>
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