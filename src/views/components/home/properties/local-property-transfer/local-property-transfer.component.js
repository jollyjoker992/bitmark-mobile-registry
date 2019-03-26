import React from 'react';
import PropTypes from 'prop-types';
import {
  View, Text, Image, TextInput, ScrollView, SafeAreaView, KeyboardAvoidingView,
  Keyboard,
  Platform,
} from 'react-native';
import { Actions } from 'react-native-router-flux';

import propertyTransferStyle from './local-property-transfer.component.style';
import { AccountService, AppProcessor, EventEmitterService } from 'src/processors';
import { defaultStyles } from 'src/views/commons';
import { constant, config } from 'src/configs';
import { convertWidth } from 'src/utils';
import { OneTabButtonComponent } from 'src/views/commons/one-tab-button.component';


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
    Keyboard.dismiss();
    AccountService.doValidateBitmarkAccountNumber(this.state.bitmarkAccount).then((result) => {
      if (!result) {
        this.setState({ bitmarkAccountError: global.i18n.t("LocalPropertyTransferComponent_invalidBitmarkAccountNumber") });
        return;
      }
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
    });
  }

  render() {
    return (
      <SafeAreaView style={{ flex: 1, borderBottomWidth: 0.3, backgroundColor: '#F5F5F5' }}>
        <KeyboardAvoidingView behavior={Platform.select({ ios: 'padding', android: '' })} style={{ flex: 1 }} >
          <View style={[defaultStyles.header, { height: constant.headerSize.height }]}>
            <OneTabButtonComponent style={defaultStyles.headerLeft} onPress={Actions.pop}>
              <Image style={defaultStyles.headerLeftIcon} source={require('assets/imgs/header_blue_icon.png')} />
            </OneTabButtonComponent>
            <View style={defaultStyles.headerCenter}>
              <Text style={[defaultStyles.headerTitle, { maxWidth: convertWidth(180), }]} numberOfLines={1}>{this.state.asset.name} </Text>
              {this.state.bitmarkIndexNumber && <Text style={[defaultStyles.headerTitle, { maxWidth: convertWidth(180), }]} numberOfLines={1}>({this.state.bitmarkIndexNumber})</Text>}
            </View>
            <OneTabButtonComponent style={[defaultStyles.headerRight]} />
          </View>

          <View style={propertyTransferStyle.body}>
            <ScrollView style={propertyTransferStyle.content}>
              <OneTabButtonComponent accessible={false} activeOpacity={1} style={propertyTransferStyle.mainContent}>
                <View style={{ width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 38, height: 27, }}>
                  <Text style={propertyTransferStyle.transferTitle}>{global.i18n.t("LocalPropertyTransferComponent_sendBitmark")}</Text>
                  <OneTabButtonComponent style={{ padding: 4, paddingRight: 0 }} onPress={() => Actions.scanQRCode({
                    onDone: (bitmarkAccount) => {
                      this.setState({ bitmarkAccount });
                    }
                  })}>
                    <Image style={{ width: 23, height: 23, resizeMode: 'contain', }} source={require('assets/imgs/scan_icon.png')} />
                  </OneTabButtonComponent>
                </View>
                <View style={propertyTransferStyle.inputAccountNumberBar} >
                  <TextInput style={[config.isAndroid ? { padding: 2 } : {}, propertyTransferStyle.inputAccountNumber]} placeholder={global.i18n.t("LocalPropertyTransferComponent_recipientBitmarkAccountNumber")}
                    testID={'transferBitmarkAccount'}
                    onChangeText={(bitmarkAccount) => this.setState({ bitmarkAccount })}
                    returnKeyType="done"
                    value={this.state.bitmarkAccount}
                    onFocus={() => { this.setState({ bitmarkAccountError: false, transferError: '' }) }}
                  />
                  {!!this.state.bitmarkAccount && <OneTabButtonComponent style={propertyTransferStyle.removeAccountNumberButton} onPress={() => this.setState({ bitmarkAccount: '', bitmarkAccountError: false, transferError: '' })} >
                    <Image style={propertyTransferStyle.removeAccountNumberIcon} source={require('assets/imgs/remove-icon.png')} />
                  </OneTabButtonComponent>}
                </View>
                <Text style={propertyTransferStyle.accountNumberError}>{this.state.bitmarkAccountError}</Text>
                <Text style={propertyTransferStyle.transferMessage}>{global.i18n.t("LocalPropertyTransferComponent_transferMessage")}</Text>
                <Text style={propertyTransferStyle.accountNumberError}>{this.state.transferError}</Text>
              </OneTabButtonComponent>
            </ScrollView>
          </View>

          <OneTabButtonComponent style={[propertyTransferStyle.sendButton, {
            borderTopColor: this.state.bitmarkAccount ? '#0060F2' : '#A4B5CD'
          }]}
            disabled={!this.state.bitmarkAccount}
            onPress={this.onSendProperty}>
            <Text style={[propertyTransferStyle.sendButtonText, {
              color: this.state.bitmarkAccount ? '#0060F2' : '#C2C2C2'
            }]}>{global.i18n.t("LocalPropertyTransferComponent_send")}</Text>
          </OneTabButtonComponent>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }
}

LocalPropertyTransferComponent.propTypes = {
  bitmark: PropTypes.object,
  asset: PropTypes.object,
}