import React from 'react';
import moment from 'moment';
import PropTypes from 'prop-types';
import {
  View, Text, TouchableOpacity, ScrollView, Image, FlatList, SafeAreaView,
  Alert,
} from 'react-native';

import transferOfferStyle from './transfer-offer.component.style';
import { BitmarkModel, EventEmitterService, AppProcessor } from 'src/processors';
import { defaultStyles } from 'src/views/commons';
import { Actions } from 'react-native-router-flux';

export class TransferOfferComponent extends React.Component {
  propTypes = {
    transferOffer: PropTypes.any,
  }
  constructor(props) {
    super(props);
    this.doReject = this.doReject.bind(this);
    this.doAccept = this.doAccept.bind(this);

    let transferOffer = this.props.transferOffer;
    if (!transferOffer) {
      Actions.pop();
    }
    let metadataList = [];
    if (transferOffer && transferOffer.asset) {
      for (let key in transferOffer.asset.metadata) {
        metadataList.push({ key, description: transferOffer.asset.metadata[key] })
      }
    }
    this.state = {
      transferOffer,
      metadataList,
      transactionData: null
    };
    BitmarkModel.doGetTransactionDetail(transferOffer.record.link).then(transactionData => {
      console.log('transactionData :', transactionData);
      this.setState({ transactionData })
    }).catch(error => {
      console.log('TransferOfferComponent doGetTransactionDetail error :', error);
      EventEmitterService.emit(EventEmitterService.events.APP_PROCESS_ERROR, { error });
    });
  }

  doReject() {
    Alert.alert(global.i18n.t("TransferOfferComponent_areYouSureYouWantToRejectReceiptOfThisProperty"), '', [{
      text: global.i18n.t("TransferOfferComponent_cancel"), style: 'cancel',
    }, {
      text: global.i18n.t("TransferOfferComponent_yes"),
      onPress: () => {
        AppProcessor.doRejectTransferBitmark(this.state.transferOffer, { indicator: true, }, {
          indicator: false, title: '', message: ''
        }).then(data => {
          if (data) {
            Alert.alert(global.i18n.t("TransferOfferComponent_receiptRejectedTitle"), global.i18n.t("TransferOfferComponent_receiptRejectedMessage"), [{
              text: global.i18n.t("TransferOfferComponent_ok"),
              onPress: () => Actions.jump('assets')
            }]);
          }
        }).catch(error => {
          Alert.alert(global.i18n.t("TransferOfferComponent_requestFailedTitle"), global.i18n.t("TransferOfferComponent_requestFailedMessage"));
          console.log('TransferOfferComponent doRejectTransferBitmark error:', error);
        });
      },
    }]);
  }
  doAccept() {
    AppProcessor.doAcceptTransferBitmark(this.state.transferOffer, { indicator: true, }).then(data => {
      if (data) {
        Alert.alert(global.i18n.t("TransferOfferComponent_signatureSubmittedTitle"), global.i18n.t("TransferOfferComponent_signatureSubmittedMessage"), [{
          text: global.i18n.t("TransferOfferComponent_ok"),
          onPress: () => Actions.jump('assets')
        }]);
      }
    }).catch(error => {
      Alert.alert(global.i18n.t("TransferOfferComponent_requestFailedTitle"), global.i18n.t("TransferOfferComponent_signatureSubmittedMessage"));
      console.log('TransferOfferComponent doRejectTransferBitmark error:', error);
    });
  }

  render() {
    return (
      <SafeAreaView style={{ flex: 1 }}>
        <View style={defaultStyles.header}>
          <TouchableOpacity style={defaultStyles.headerLeft} onPress={Actions.pop}>
            <Image style={defaultStyles.headerLeftIcon} source={require('assets/imgs/header_blue_icon.png')} />
          </TouchableOpacity>
          <Text style={defaultStyles.headerTitle}>{global.i18n.t("TransferOfferComponent_signForBitmark")}</Text>
          <TouchableOpacity style={defaultStyles.headerRight}></TouchableOpacity>
        </View>

        <View style={transferOfferStyle.body}>
          <ScrollView style={[transferOfferStyle.contentScroll]} scroll>
            <TouchableOpacity activeOpacity={1} style={transferOfferStyle.content}>
              <Text style={transferOfferStyle.assetName}>{this.state.transferOffer.asset.name}</Text>
              <Text style={transferOfferStyle.transferOfferContent}>
                <Text style={transferOfferStyle.transferOfferSenderFix}>[</Text>
                <Text style={transferOfferStyle.transferOfferSenderName} numberOfLines={1}>{this.state.transferOffer.from.substring(0, 12)}...</Text>
                <Text style={transferOfferStyle.transferOfferSenderFix}>] </Text>
                {global.i18n.t("TransferOfferComponent_hasSentTheProperty")}
                <Text style={transferOfferStyle.transferOfferAssetName}> {this.state.transferOffer.asset.name} </Text>
                {global.i18n.t("TransferOfferComponent_toYouPleaseSignAcceptTheBitmarkForTheProperty")}
              </Text>
              <View style={transferOfferStyle.externalArea}>
                <View style={transferOfferStyle.externalAreaRow}>
                  <Text style={transferOfferStyle.externalAreaRowLabel}>{global.i18n.t("TransferOfferComponent_bitmarkId")}:</Text>
                  <Text style={transferOfferStyle.externalAreaRowValue} numberOfLines={1}>{this.state.transferOffer.bitmark.id}</Text>
                </View>
                <View style={transferOfferStyle.externalAreaRow}>
                  <Text style={transferOfferStyle.externalAreaRowLabel}>{global.i18n.t("TransferOfferComponent_issuer")}:</Text>
                  <View style={transferOfferStyle.externalAreaRowValueIssuerView}>
                    <Text style={transferOfferStyle.externalAreaRowValueIssuer_}>[</Text>
                    <Text style={transferOfferStyle.externalAreaRowValueIssuer} numberOfLines={1}>{this.state.transferOffer.asset.registrantName || this.state.transferOffer.asset.registrant}</Text>
                    <Text style={transferOfferStyle.externalAreaRowValueIssuer_}>]</Text>
                  </View>
                </View>
                <View style={transferOfferStyle.externalAreaRow}>
                  <Text style={transferOfferStyle.externalAreaRowLabel}>{global.i18n.t("TransferOfferComponent_timestamp")}:</Text>
                  {this.state.transactionData && <Text style={transferOfferStyle.externalAreaRowValue}>{global.i18n.t("TransferOfferComponent_block")} #{this.state.transactionData.tx.block_number}{'\n'}{moment(this.state.transactionData.block.created_at).format('DD MMM YYYY HH:mm:ss')}</Text>}
                  {!this.state.transactionData && <Text style={transferOfferStyle.externalAreaRowValue}>{global.i18n.t("TransferOfferComponent_block")} #...{'\n'}</Text>}
                </View>
                <View style={transferOfferStyle.metadataArea}>
                  <FlatList data={this.state.metadataList}
                    extraData={this.state}
                    renderItem={({ item }) => {
                      return (
                        <View style={transferOfferStyle.externalAreaRow}>
                          <Text style={transferOfferStyle.externalAreaRowLabel}>{item.key}:</Text>
                          <Text style={transferOfferStyle.metadataRowValue}>{item.description}</Text>
                        </View>
                      )
                    }} />
                </View>
              </View>
            </TouchableOpacity>
          </ScrollView>
        </View >

        <View style={transferOfferStyle.buttonsArea}>
          <TouchableOpacity style={transferOfferStyle.rejectButton} onPress={this.doReject}>
            <Text style={transferOfferStyle.rejectButtonText}>{global.i18n.t("TransferOfferComponent_reject")}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[transferOfferStyle.acceptButton, { marginLeft: 1 }]} onPress={this.doAccept}>
            <Text style={transferOfferStyle.acceptButtonText}>{global.i18n.t("TransferOfferComponent_accept")}</Text>
          </TouchableOpacity>
        </View>

      </SafeAreaView>
    );
  }
}