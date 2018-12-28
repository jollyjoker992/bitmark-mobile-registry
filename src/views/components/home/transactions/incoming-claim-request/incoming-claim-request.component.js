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
import { AppProcessor, EventEmitterService } from 'src/processors';

export class IncomingClaimRequestComponent extends React.Component {
  propTypes = {
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
          if (result) {
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
        AppProcessor.doProcessIncomingClaimRequest(this.props.incomingClaimRequest, true).then((result => {
          if (result) {
            Actions.jump('transactions');
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
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#F5F5F5' }}>
        <View style={[defaultStyles.header, { height: constant.headerSize.height }]}>
          <TouchableOpacity style={defaultStyles.headerLeft} onPress={Actions.pop}>
            <Image style={defaultStyles.headerLeftIcon} source={require('assets/imgs/header_blue_icon.png')} />
          </TouchableOpacity>
          <Text style={defaultStyles.headerTitle}>{global.i18n.t("IncomingClaimRequestComponent_headerTitle")}</Text>
          <TouchableOpacity style={defaultStyles.headerRight}></TouchableOpacity>
        </View>

        <View style={incomingClaimRequestStyle.body}>
          <ScrollView style={[incomingClaimRequestStyle.contentScroll]} contentContainerStyle={{ flexGrow: 1, }}>
            <TouchableOpacity activeOpacity={1} style={incomingClaimRequestStyle.content}>
              <Image style={incomingClaimRequestStyle.assetThumbnail} source={{ uri: `${config.bitmark_profile_server}/s/asset/thumbnail?asset_id=${this.props.incomingClaimRequest.asset.id}` }} />
              <Text style={incomingClaimRequestStyle.assetInfo}>{this.props.incomingClaimRequest.asset.name} [{this.props.incomingClaimRequest.index}/{this.props.incomingClaimRequest.asset.limitedEdition}]</Text>
              <Text style={incomingClaimRequestStyle.claimMessage}>
                {global.i18n.t("IncomingClaimRequestComponent_claimMessage0")} <Text style={{ fontFamily: 'Andale Mono' }}>[{this.props.incomingClaimRequest.from}] </Text>{global.i18n.t("IncomingClaimRequestComponent_claimMessage1")} <Text style={{ fontWeight: 'bold' }}>{this.props.incomingClaimRequest.asset.name}</Text>. {global.i18n.t("IncomingClaimRequestComponent_claimMessage2")}
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View >

        <View style={incomingClaimRequestStyle.buttonsArea}>
          <TouchableOpacity style={incomingClaimRequestStyle.rejectButton} onPress={this.doReject}>
            <Text style={incomingClaimRequestStyle.rejectButtonText}>{global.i18n.t("IncomingClaimRequestComponent_rejectButtonText")}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[incomingClaimRequestStyle.acceptButton, { marginLeft: 1 }]} onPress={this.doAccept}>
            <Text style={incomingClaimRequestStyle.acceptButtonText}>{global.i18n.t("IncomingClaimRequestComponent_acceptButtonText")}</Text>
          </TouchableOpacity>
        </View>

      </SafeAreaView>
    );
  }
}