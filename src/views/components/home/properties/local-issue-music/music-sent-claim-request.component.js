import React from 'react';
import PropTypes from 'prop-types';
import {
  View, TouchableOpacity, Image, Text, ScrollView,
  StyleSheet,
} from 'react-native';
import { Actions } from 'react-native-router-flux';

import { defaultStyles } from 'src/views/commons';
import { constant, config } from 'src/configs';
import { convertWidth } from 'src/utils';
import { AppProcessor, EventEmitterService } from 'src/processors';


export class MusicSentClaimRequestComponent extends React.Component {
  static propTypes = {
    asset: PropTypes.string,
  }
  constructor(props) {
    super(props);
  }

  onSubmit() {
    AppProcessor.doSendClaimRequest(this.props.asset).then(() => {
      Actions.pop();
    }).catch(error => {
      EventEmitterService.emit(EventEmitterService.events.APP_PROCESS_ERROR, { error });
    })
  }

  render() {
    return (
      <View style={{ flex: 1 }}>
        <View style={cStyles.header}>
          <TouchableOpacity style={defaultStyles.headerLeft} onPress={Actions.pop}>
            <Image style={[defaultStyles.headerLeftIcon, { width: convertWidth(20), height: convertWidth(20) }]} source={require('assets/imgs/header_blue_icon.png')} />
          </TouchableOpacity>
          <Text style={[defaultStyles.headerTitle, { color: '#0060F2' }]}>{'SEND REQUEST'.toUpperCase()}</Text>
          <TouchableOpacity style={defaultStyles.headerRight} />
        </View>
        <ScrollView contentContainerStyle={{ flexGrow: 1, alignItems: 'center' }}>
          <View style={cStyles.content}>
            <Image style={cStyles.thumbnailImage} source={{ uri: `${config.bitmark_profile_server}/s/asset/thumbnail?asset_id=${this.props.asset.id}` }} />
            <View style={cStyles.assetInfo}>
              <Text style={cStyles.assetName}>{this.props.asset.name}</Text>
              <Text style={cStyles.editionInfo}>Ed.{this.props.asset.totalBitmark}/{this.props.asset.limitedEdition}</Text>
            </View>
            <Text style={cStyles.registrant}>{this.props.asset.registrant}</Text>
            <Text style={cStyles.informationTitle}>SIGN to SEND REQUEST</Text>
            <Text style={cStyles.informationDescription}>We will inform the artist of your request by sending a message with your account number. After the artist accepts the request, the property will be automatically transferred to your account.</Text>
          </View>
        </ScrollView>

        <TouchableOpacity
          style={[cStyles.continueButton, (!this.state.metadataError) ? { backgroundColor: '#0060F2' } : {}]}
          disabled={!!this.state.metadataError}
          onPress={this.onSubmit.bind(this)}
        >
          <Text style={cStyles.continueButtonText}>SIGN </Text>
        </TouchableOpacity>
      </View>
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
  },

  content: {
    flex: 1, flexDirection: 'column',
    width: '100%',
    paddingTop: 20, paddingLeft: 19, paddingRight: 19,
    backgroundColor: 'white',
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
