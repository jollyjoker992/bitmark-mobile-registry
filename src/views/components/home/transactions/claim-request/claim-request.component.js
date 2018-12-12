import React from 'react';
import PropTypes from 'prop-types';
import {
  View, Text, TouchableOpacity, ScrollView, Image, SafeAreaView,
} from 'react-native';

import claimRequestStyle from './claim-request.component.style';
import { defaultStyles } from 'src/views/commons';

export class ClaimRequestComponent extends React.Component {
  constructor(props) {
    super(props);
    this.doReject = this.doReject.bind(this);
    this.doAccept = this.doAccept.bind(this);

  }

  doReject() {

  }
  doAccept() {

  }

  render() {
    return (
      <SafeAreaView style={{ flex: 1 }}>
        <View style={defaultStyles.header}>
          <TouchableOpacity style={defaultStyles.headerLeft} onPress={() => this.props.navigation.goBack()}>
            <Image style={defaultStyles.headerLeftIcon} source={require('assets/imgs/header_blue_icon.png')} />
          </TouchableOpacity>
          <Text style={defaultStyles.headerTitle}>{global.i18n.t("ClaimRequestComponent_signForBitmark")}</Text>
          <TouchableOpacity style={defaultStyles.headerRight}></TouchableOpacity>
        </View>

        <View style={claimRequestStyle.body}>
          <ScrollView style={[claimRequestStyle.contentScroll]} scroll>
            <TouchableOpacity activeOpacity={1} style={claimRequestStyle.content}>
              <Image style={claimRequestStyle.assetThumbnail} source={{}} />
              <Text style={claimRequestStyle.assetInfo} >1939 [23/200]</Text>
              <Text style={claimRequestStyle.claimMessage}>[full account number] has requested property [property name]. Please sign to issue and send the bitmark.</Text>
            </TouchableOpacity>
          </ScrollView>
        </View >

        <View style={claimRequestStyle.buttonsArea}>
          <TouchableOpacity style={claimRequestStyle.rejectButton} onPress={this.doReject}>
            <Text style={claimRequestStyle.rejectButtonText}>{global.i18n.t("ClaimRequestComponent_reject")}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[claimRequestStyle.acceptButton, { marginLeft: 1 }]} onPress={this.doAccept}>
            <Text style={claimRequestStyle.acceptButtonText}>{global.i18n.t("ClaimRequestComponent_accept")}</Text>
          </TouchableOpacity>
        </View>

      </SafeAreaView>
    );
  }
}

ClaimRequestComponent.propTypes = {
  navigation: PropTypes.shape({
    navigate: PropTypes.func,
    goBack: PropTypes.func,
    dispatch: PropTypes.func,
    state: PropTypes.shape({
      params: PropTypes.shape({
        transferOffer: PropTypes.object,
      }),
    }),
  }),
}