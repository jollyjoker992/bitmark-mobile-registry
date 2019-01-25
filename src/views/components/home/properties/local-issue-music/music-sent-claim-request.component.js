import React from 'react';
import PropTypes from 'prop-types';
import {
  View, TouchableOpacity, Image, Text, ScrollView, ImageBackground,
  Alert,
  StyleSheet,
} from 'react-native';
import { Actions } from 'react-native-router-flux';

import { defaultStyles } from 'src/views/commons';
import { constant, config } from 'src/configs';
import { convertWidth } from 'src/utils';
import { AppProcessor, EventEmitterService, CommonProcessor } from 'src/processors';

export class MusicSentIncomingClaimRequestComponent extends React.Component {
  static propTypes = {
    asset: PropTypes.any,
    issuer: PropTypes.any,
  }
  constructor(props) {
    super(props);
    this.onSubmit = this.onSubmit.bind(this);
    this.goToBitmarkDetail = this.goToBitmarkDetail.bind(this);
  }

  componentDidMount() {
    this.onSubmit();
  }

  onSubmit() {
    // TODO Chinese
    this.setState({
      status: 'PROCESSING...'
    });
    AppProcessor.doSendIncomingClaimRequest(this.props.asset, this.props.issuer, {
      indicator: constant.indicators.processing,
      title: 'Pending...',
      message: 'Sending your transaction to the Bitmark network...',
    }).then((result) => {
      this.result = result;
      this.setState({
        status: 'OK'
      });
      CommonProcessor.doMarkDoneSendClaimRequest();
      EventEmitterService.emit(EventEmitterService.events.APP_SUBMITTING, {
        indicator: constant.indicators.success,
        title: 'Success!',
        message: 'You will receive a notification when the artist confirms your request.',
      });
      setTimeout(() => {
        EventEmitterService.emit(EventEmitterService.events.APP_SUBMITTING, null);
      }, 2000)
    }).catch(error => {
      this.setState({
        status: null
      });
      CommonProcessor.doMarkDoneSendClaimRequest();
      console.log('error:', JSON.stringify(error));
      if (error.statusCode === 429 && error.data.code === 1012) {
        Alert.alert('', global.i18n.t("MusicSentClaimRequestComponent_limitRequestErrorMessage"), [{
          text: 'OK', onPress: Actions.pop
        }]);
        return;
      }
      EventEmitterService.emit(EventEmitterService.events.APP_PROCESS_ERROR, { error });
    })
  }

  goToBitmarkDetail() {
    Actions.propertyDetail(this.result);
    // Actions.jump('transactions', { subTab: 'HISTORY' });
  }

  render() {
    let issuer = this.props.issuer || this.props.asset.registrant;
    return (
      <ImageBackground source={require('assets/imgs/claim_background.png')} style={{ flex: 1, resizeMode: 'contain' }}>
        <View style={cStyles.header}>
          <TouchableOpacity style={defaultStyles.headerLeft} onPress={Actions.pop}>
            <Image style={[defaultStyles.headerLeftIcon, { width: convertWidth(20), height: convertWidth(20) }]} source={require('assets/imgs/header_blue_icon.png')} />
          </TouchableOpacity>
          <Text style={[defaultStyles.headerTitle,]}>{global.i18n.t("MusicSentClaimRequestComponent_headerTitle")}</Text>
          <TouchableOpacity style={defaultStyles.headerRight} />
        </View>
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ flexGrow: 1, }}>
          <View style={cStyles.content}>
            <Image style={cStyles.thumbnailImage} source={{ uri: `${config.bitmark_profile_server}/s/asset/thumbnail?asset_id=${this.props.asset.id}` }} />
            <View style={cStyles.assetInfo}>
              <Text style={cStyles.assetName}>{this.props.asset.name}</Text>
              <Text style={cStyles.editionInfo}>Ed. {this.props.asset.editions[issuer].totalEditionLeft}/{this.props.asset.editions[issuer].limited}</Text>
            </View>
            <Text style={cStyles.registrant}>{CommonProcessor.getDisplayedAccount(issuer)}</Text>
            <Text style={cStyles.informationTitle}>{global.i18n.t("MusicSentClaimRequestComponent_informationTitle")}</Text>
            <Text style={cStyles.informationDescription}>{global.i18n.t("MusicSentClaimRequestComponent_informationDescription")}</Text>
          </View>
        </ScrollView>

        <TouchableOpacity
          style={[cStyles.continueButton, { backgroundColor: '#0060F2' }]}
          onPress={() => this.state.status ? this.goToBitmarkDetail() : this.onSubmit()}
        >
          <Text style={cStyles.continueButtonText}>{(this.state && this.state.status) ? this.state.status : 'RETRY'}</Text>
        </TouchableOpacity>
      </ImageBackground>
    );
  }
}

const cStyles = StyleSheet.create({

  header: {
    flexDirection: 'row',
    alignContent: 'center',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: constant.headerSize.height + constant.headerSize.paddingTop,
    paddingTop: constant.headerSize.paddingTop,
    width: '100%',
    borderBottomWidth: 1, borderBottomColor: '#0060F2',
    backgroundColor: 'white',
  },
  content: {
    flex: 1, flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    width: '100%',
    paddingTop: 20, paddingLeft: 19, paddingRight: 19,
  },
  thumbnailImage: {
    width: 188, height: 188, resizeMode: 'contain',
  },
  assetInfo: {
    width: '100%', flexDirection: 'row', justifyContent: 'space-between',
    marginTop: 19,
  },
  assetName: {
    fontFamily: 'Avenir-Black', fontSize: 20, fontWeight: '900', color: 'white',
  },
  editionInfo: {
    fontFamily: 'Avenir-Medium', fontSize: 20, fontWeight: '400', color: 'white',
  },
  registrant: {
    marginTop: 10,
    width: '100%',
    fontFamily: 'Avenir-Medium', fontSize: 16, fontWeight: '900', color: 'white',
  },

  informationTitle: {
    marginTop: 57,
    width: '100%',
    fontFamily: 'Avenir-Medium', fontSize: 16, fontWeight: '900', color: '#E6FF00',
  },
  informationDescription: {
    marginTop: 17,
    width: '100%',
    fontFamily: 'Avenir-Medium', fontSize: 16, fontWeight: '300', color: 'white',
  },

  continueButton: {
    flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    width: convertWidth(375), height: constant.buttonHeight + (config.isIPhoneX ? constant.blankFooter : 0),
    paddingBottom: config.isIPhoneX ? (constant.blankFooter / 2) : 0,
    backgroundColor: '#999999',
  },
  continueButtonText: {
    fontFamily: 'Avenir-Black', fontSize: 16, fontWeight: '900', lineHeight: 33, color: 'white',
  },
});
