import React from 'react';
import PropTypes from 'prop-types';
import {
  View, Text, TouchableOpacity, ScrollView, Image, SafeAreaView,
  Alert,
} from 'react-native';

import claimRequestStyle from './claim-request.component.style';
import { defaultStyles } from 'src/views/commons';
import { constant, config } from 'src/configs';
import { Actions } from 'react-native-router-flux';
import { AppProcessor, EventEmitterService } from 'src/processors';

export class ClaimRequestComponent extends React.Component {
  propTypes = {
    claimRequest: PropTypes.any,
  }
  constructor(props) {
    super(props);
    this.doReject = this.doReject.bind(this);
    this.doAccept = this.doAccept.bind(this);

  }

  doReject() {
    Alert.alert('Do you want reject this request?', '', [{
      text: 'OK', onPress: () => {
        AppProcessor.doProcessClaimRequest(this.props.claimRequest, false).then((result => {
          if (result) {
            Actions.jump('transactions');
          }
        })).catch(error => {
          console.log({ error });
          EventEmitterService.emit(EventEmitterService.events.APP_PROCESS_ERROR, { error });
        });
      }
    }, {
      text: 'Cancel', style: 'cancel',
    }])
  }
  doAccept() {
    AppProcessor.doProcessClaimRequest(this.props.claimRequest, true).then((result => {
      if (result) {
        Actions.jump('transactions');
      }
    })).catch(error => {
      console.log({ error });
      EventEmitterService.emit(EventEmitterService.events.APP_PROCESS_ERROR, { error });
    });
  }

  render() {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#F5F5F5' }}>
        <View style={[defaultStyles.header, { height: constant.headerSize.height }]}>
          <TouchableOpacity style={defaultStyles.headerLeft} onPress={Actions.pop}>
            <Image style={defaultStyles.headerLeftIcon} source={require('assets/imgs/header_blue_icon.png')} />
          </TouchableOpacity>
          <Text style={defaultStyles.headerTitle}>{global.i18n.t("ClaimRequestComponent_headerTitle")}</Text>
          <TouchableOpacity style={defaultStyles.headerRight}></TouchableOpacity>
        </View>

        <View style={claimRequestStyle.body}>
          <ScrollView style={[claimRequestStyle.contentScroll]} contentContainerStyle={{ flexGrow: 1, }}>
            <TouchableOpacity activeOpacity={1} style={claimRequestStyle.content}>
              <Image style={claimRequestStyle.assetThumbnail} source={{ uri: `${config.bitmark_profile_server}/s/asset/thumbnail?asset_id=${this.props.claimRequest.asset.id}` }} />
              <Text style={claimRequestStyle.assetInfo}>{this.props.claimRequest.asset.name} [{this.props.claimRequest.asset.issuedBitmarks.length}/{this.props.claimRequest.asset.limitedEdition}]</Text>
              <Text style={claimRequestStyle.claimMessage}>
                <Text style={{ fontFamily: 'Andale Mono' }}>{this.props.claimRequest.from}</Text> {global.i18n.t("ClaimRequestComponent_claimMessage1")} <Text style={{ fontWeight: 'bold' }}>{this.props.claimRequest.asset.name}</Text>. {global.i18n.t("ClaimRequestComponent_claimMessage2")}
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View >

        <View style={claimRequestStyle.buttonsArea}>
          <TouchableOpacity style={claimRequestStyle.rejectButton} onPress={this.doReject}>
            <Text style={claimRequestStyle.rejectButtonText}>{global.i18n.t("ClaimRequestComponent_rejectButtonText")}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[claimRequestStyle.acceptButton, { marginLeft: 1 }]} onPress={this.doAccept}>
            <Text style={claimRequestStyle.acceptButtonText}>{global.i18n.t("ClaimRequestComponent_acceptButtonText")}</Text>
          </TouchableOpacity>
        </View>

      </SafeAreaView>
    );
  }
}