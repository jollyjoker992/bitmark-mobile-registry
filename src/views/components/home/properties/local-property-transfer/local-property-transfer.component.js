import React from 'react';
import PropTypes from 'prop-types';
import {
  View, Text, TouchableOpacity, Image, TextInput, ScrollView, SafeAreaView,
} from 'react-native';
import { Actions } from 'react-native-router-flux';

import propertyTransferStyle from './local-property-transfer.component.style';
import { AccountService, AppProcessor, EventEmitterService } from 'src/processors';
import { defaultStyles } from 'src/views/commons';
import { constant } from 'src/configs';
import { convertWidth } from 'src/utils';


export class LocalPropertyTransferComponent extends React.Component {
  constructor(props) {
    super(props);
    this.onSendProperty = this.onSendProperty.bind(this);

    let bitmark = this.props.bitmark;
    let asset = this.props.asset;

    let bitmarkIndexNumber;
    if (asset.bitmarks) {
      bitmarkIndexNumber = asset.bitmarks.findIndex(item => item.id === bitmark.id);
      bitmarkIndexNumber = (bitmarkIndexNumber + 1) + '/' + asset.bitmarks.length;
    }
    this.state = {
      bitmark,
      asset,
      bitmarkIndexNumber,
      bitmarkAccount: '',
      bitmarkAccountError: '',
      transferError: '',
    };
  }

  onSendProperty() {
    AccountService.doValidateBitmarkAccountNumber(this.state.bitmarkAccount).then(() => {
      this.setState({
        bitmarkAccountError: '',
      });
      AppProcessor.doTransferBitmark(this.state.bitmark, this.state.bitmarkAccount).then((result) => {
        if (result) {
          Actions.jump('properties');
          EventEmitterService.emit(EventEmitterService.events.NEED_RELOAD_USER_DATA);
        }
      }).catch(error => {
        EventEmitterService.emit(EventEmitterService.events.APP_PROCESS_ERROR, {
          onClose: Actions.pop,
          error
        });
        console.log('transfer bitmark error :', error);
      });
    }).catch(error => {
      console.log('onSendProperty doValidateBitmarkAccountNumber :', error);
      this.setState({ bitmarkAccountError: global.i18n.t("LocalPropertyTransferComponent_invalidBitmarkAccountNumber") });
    });
  }

  render() {
    return (
      <SafeAreaView style={{ flex: 1, borderBottomWidth: 0.3, backgroundColor: '#F5F5F5' }}>
        <View style={[defaultStyles.header, { height: constant.headerSize.height }]}>
          <TouchableOpacity style={defaultStyles.headerLeft} onPress={Actions.pop}>
            <Image style={defaultStyles.headerLeftIcon} source={require('assets/imgs/header_blue_icon.png')} />
          </TouchableOpacity>
          <View style={defaultStyles.headerCenter}>
            <Text style={[defaultStyles.headerTitle, { maxWidth: convertWidth(180), }]} numberOfLines={1}>{this.state.asset.name} </Text>
            {this.state.bitmarkIndexNumber && <Text style={[defaultStyles.headerTitle, { maxWidth: convertWidth(180), }]} numberOfLines={1}>({this.state.bitmarkIndexNumber})</Text>}
          </View>
          <TouchableOpacity style={[defaultStyles.headerRight]} />
        </View>

        <View style={propertyTransferStyle.body}>
          <ScrollView style={propertyTransferStyle.content}>
            <TouchableOpacity activeOpacity={1} style={propertyTransferStyle.mainContent}>
              <Text style={propertyTransferStyle.transferTitle}>{global.i18n.t("LocalPropertyTransferComponent_sendBitmark")}</Text>
              <View style={propertyTransferStyle.inputAccountNumberBar} >
                <TextInput style={propertyTransferStyle.inputAccountNumber} placeholder={global.i18n.t("LocalPropertyTransferComponent_recipientBitmarkAccountNumber")}
                  onChangeText={(bitmarkAccount) => this.setState({ bitmarkAccount })}
                  returnKeyType="done"
                  value={this.state.bitmarkAccount}
                  onFocus={() => { this.setState({ bitmarkAccountError: false, transferError: '' }) }}
                />
                {!!this.state.bitmarkAccount && <TouchableOpacity style={propertyTransferStyle.removeAccountNumberButton} onPress={() => this.setState({ bitmarkAccount: '', bitmarkAccountError: false, transferError: '' })} >
                  <Image style={propertyTransferStyle.removeAccountNumberIcon} source={require('assets/imgs/remove-icon.png')} />
                </TouchableOpacity>}
              </View>
              <Text style={propertyTransferStyle.accountNumberError}>{this.state.bitmarkAccountError}</Text>
              <Text style={propertyTransferStyle.transferMessage}>{global.i18n.t("LocalPropertyTransferComponent_transferMessage")}</Text>
              <Text style={propertyTransferStyle.accountNumberError}>{this.state.transferError}</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        <TouchableOpacity style={[propertyTransferStyle.sendButton, {
          borderTopColor: this.state.bitmarkAccount ? '#0060F2' : '#A4B5CD'
        }]}
          disabled={!this.state.bitmarkAccount}
          onPress={this.onSendProperty}>
          <Text style={[propertyTransferStyle.sendButtonText, {
            color: this.state.bitmarkAccount ? '#0060F2' : '#C2C2C2'
          }]}>{global.i18n.t("LocalPropertyTransferComponent_send")}</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }
}

LocalPropertyTransferComponent.propTypes = {
  bitmark: PropTypes.object,
  asset: PropTypes.object,
}