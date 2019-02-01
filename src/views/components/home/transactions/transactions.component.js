import React from 'react';
import PropTypes from 'prop-types';
import { Provider, connect } from 'react-redux';
import {
  View, Text, TouchableOpacity, ScrollView, FlatList, Image, ActivityIndicator, SafeAreaView,
  Dimensions,
  Alert,
} from 'react-native';
import moment from 'moment';
import { Actions } from 'react-native-router-flux';


import transactionsStyle from './transactions.component.style';
import { DataProcessor, AppProcessor, EventEmitterService, CacheData, TransactionProcessor } from 'src/processors';
import { config, constant } from 'src/configs';
import { defaultStyles } from 'src/views/commons';
import { convertWidth } from 'src/utils';
import { TransactionsStore } from 'src/views/stores';

const SubTabs = {
  required: 'ACTIONS REQUIRED',
  completed: 'HISTORY',
};

const ActionRequireTypes = TransactionProcessor.TransactionActionRequireTypes;
const TransactionHistoryTypes = TransactionProcessor.TransactionHistoryTypes;

let currentSize = Dimensions.get('window');

class PrivateTransactionsComponent extends React.Component {
  static SubTabs = SubTabs;
  constructor(props) {
    super(props);

    this.switchSubTab = this.switchSubTab.bind(this);
    this.acceptAllTransfers = this.acceptAllTransfers.bind(this);
    this.reloadData = this.reloadData.bind(this);

    this.clickToActionRequired = this.clickToActionRequired.bind(this);
    this.clickToCompleted = this.clickToCompleted.bind(this);

    let subTab = this.props.subTab || SubTabs.required;
    this.state = {
      currentUser: CacheData.userInformation,
      subTab,
    };

  }

  reloadData() {
    AppProcessor.doReloadUserData().catch((error) => {
      console.log('doReloadUserData error :', error);
      EventEmitterService.emit(EventEmitterService.events.APP_PROCESS_ERROR, { error });
    });
  }

  switchSubTab(subTab) {
    this.setState({ subTab });
  }

  clickToActionRequired(item) {
    if (item.type === ActionRequireTypes.transfer && item.transferOffer) {
      Actions.transferOffer({ transferOffer: item.transferOffer, });
    } else if (item.type === ActionRequireTypes.ifttt) {
      AppProcessor.doIssueIftttData(item, {
        indicator: true, title: '', message: global.i18n.t("TransactionsComponent_sendingYourTransactionToTheBitmarkNetwork")
      }).then(result => {
        if (result) {
          DataProcessor.doReloadUserData();
          Alert.alert(global.i18n.t("TransactionsComponent_success"), global.i18n.t("TransactionsComponent_yourPropertyRightsHaveBeenRegistered"), [{
            text: global.i18n.t("TransactionsComponent_ok"),
            onPress: () => Actions.jump('properties')
          }]);
        }
      }).catch(error => {
        console.log('doIssueIftttData error:', error);
        EventEmitterService.emit(EventEmitterService.events.APP_PROCESS_ERROR, { error });
      });
    } else if (item.type === ActionRequireTypes.test_write_down_recovery_phase) {
      Actions.jump('recoveryPhrase');
    } else if (item.type === ActionRequireTypes.claim_request) {
      Actions.incomingClaimRequest({ incomingClaimRequest: item.incomingClaimRequest });
    }
  }

  clickToCompleted(item) {
    if (item.title === TransactionHistoryTypes.transfer.title && item.type === TransactionHistoryTypes.transfer.type) {
      let sourceUrl = config.registry_server_url + `/transaction/${item.txid}?env=app`;
      Actions.bitmarkWebViewFull({ title: global.i18n.t("TransactionsComponent_registry"), sourceUrl, })
    } else if (item.title === TransactionHistoryTypes.issuance.title) {
      let sourceUrl = config.registry_server_url + `/issuance/${item.blockNumber}/${item.assetId}/${CacheData.userInformation.bitmarkAccountNumber}?env=app`;
      Actions.bitmarkWebViewFull({ title: global.i18n.t("TransactionsComponent_registry"), sourceUrl, })
    }
  }

  async acceptAllTransfers() {
    TransactionProcessor.doGetAllTransfersOffers().then(transferOffers => {
      Alert.alert(global.i18n.t("TransactionsComponent_signForAcceptanceOfAllBitmarksSentToYou"), global.i18n.t("TransactionsComponent_acceptTransfer", { length: transferOffers.length }), [{
        text: global.i18n.t("TransactionsComponent_cancel"), style: 'cancel',
      }, {
        text: global.i18n.t("TransactionsComponent_yes"),
        onPress: () => {
          AppProcessor.doAcceptAllTransfers(transferOffers, { indicator: true, }, result => {
            if (result) {
              Alert.alert(global.i18n.t("TransactionsComponent_acceptanceSubmittedTitle"), global.i18n.t("TransactionsComponent_acceptanceSubmittedMessage"));
            }
          }).catch(error => {
            console.log('acceptAllTransfers error:', error);
            Alert.alert(global.i18n.t("TransactionsComponent_requestFailedTitle"), global.i18n.t("TransactionsComponent_requestFailedMessage"));
          });
        }
      }]);
    }).catch(error => {
      console.log('doGetAllTransfersOffers error:', error);
      EventEmitterService.emit(EventEmitterService.events.APP_PROCESS_ERROR, { error });
    });
  }

  render() {
    let bitmarkAccountNumber = CacheData.userInformation.bitmarkAccountNumber;
    return (
      <SafeAreaView style={transactionsStyle.body}>
        <View style={[transactionsStyle.header, { height: constant.headerSize.height }]}>
          <TouchableOpacity style={defaultStyles.headerLeft}></TouchableOpacity>
          <Text style={defaultStyles.headerTitle}>{global.i18n.t("TransactionsComponent_transactions")}</Text>
          <TouchableOpacity style={defaultStyles.headerRight}></TouchableOpacity>
        </View>
        <View style={transactionsStyle.subTabArea}>
          {this.state.subTab === SubTabs.required && <TouchableOpacity style={[transactionsStyle.subTabButton, {
            shadowOffset: { width: 2 },
            shadowOpacity: 0.15,
          }]}>
            <View style={transactionsStyle.subTabButtonArea}>
              <View style={[transactionsStyle.activeSubTabBar, { backgroundColor: '#0060F2' }]}></View>
              <View style={transactionsStyle.subTabButtonTextArea}>
                <Text style={transactionsStyle.subTabButtonText}>{global.i18n.t("TransactionsComponent_actionsRequired")}</Text>
              </View>
            </View>
          </TouchableOpacity>}
          {this.state.subTab !== SubTabs.required && <TouchableOpacity style={[transactionsStyle.subTabButton, {
            backgroundColor: '#F5F5F5',
            zIndex: 0,
          }]} onPress={() => this.switchSubTab(SubTabs.required)}>
            <View style={transactionsStyle.subTabButtonArea}>
              <View style={[transactionsStyle.activeSubTabBar, { backgroundColor: '#F5F5F5' }]}></View>
              <View style={transactionsStyle.subTabButtonTextArea}>
                <Text style={[transactionsStyle.subTabButtonText, { color: '#C1C1C1' }]}>{global.i18n.t("TransactionsComponent_actionsRequired")}</Text>
              </View>
            </View>
          </TouchableOpacity>}

          {this.state.subTab === SubTabs.completed && <TouchableOpacity style={[transactionsStyle.subTabButton, {
            shadowOffset: { width: -2 },
            shadowOpacity: 0.15,
          }]}>
            <View style={transactionsStyle.subTabButtonArea}>
              <View style={[transactionsStyle.activeSubTabBar, { backgroundColor: '#0060F2' }]}></View>
              <View style={transactionsStyle.subTabButtonTextArea}>
                <Text style={transactionsStyle.subTabButtonText}>{global.i18n.t("TransactionsComponent_history")}</Text>
              </View>
            </View>
          </TouchableOpacity>}
          {this.state.subTab !== SubTabs.completed && <TouchableOpacity style={[transactionsStyle.subTabButton, {
            backgroundColor: '#F5F5F5',
            zIndex: 0,
          }]} onPress={() => this.switchSubTab(SubTabs.completed)}>
            <View style={transactionsStyle.subTabButtonArea}>
              <View style={[transactionsStyle.activeSubTabBar, { backgroundColor: '#F5F5F5' }]}></View>
              <View style={transactionsStyle.subTabButtonTextArea}>
                <Text style={[transactionsStyle.subTabButtonText, { color: '#C1C1C1' }]}>{global.i18n.t("TransactionsComponent_history")}</Text>
              </View>
            </View>
          </TouchableOpacity>}
        </View>

        {this.state.subTab === SubTabs.required && <ScrollView style={[transactionsStyle.scrollSubTabArea]}
          onScroll={async (scrollEvent) => {
            if (this.loadingActionRequiredWhenScroll) {
              return;
            }
            if (scrollEvent.nativeEvent.contentOffset.y >= (scrollEvent.nativeEvent.contentSize.height - currentSize.height) && (this.props.actionRequired.length < this.props.totalActionRequired)) {
              this.loadingActionRequiredWhenScroll = true;
              await TransactionProcessor.doAddMoreActionRequired(this.props.actionRequired.length);
            }
            this.loadingActionRequiredWhenScroll = false;
          }}
          scrollEventThrottle={1}>
          <TouchableOpacity activeOpacity={1} style={{ flex: 1 }}>
            {this.props.actionRequired && this.props.actionRequired.length === 0 && !this.props.appLoadingData && <View style={transactionsStyle.contentSubTab}>
              <Text style={transactionsStyle.titleNoRequiredTransferOffer}>{global.i18n.t("TransactionsComponent_noActionsRequired")}</Text>
              <Text style={transactionsStyle.messageNoRequiredTransferOffer}>{global.i18n.t("TransactionsComponent_messageNoRequiredTransferOffer")}</Text>
            </View>}

            {this.props.actionRequired && this.props.actionRequired.length > 0 && <View style={transactionsStyle.contentSubTab}>
              <FlatList data={this.props.actionRequired}
                keyExtractor={(item, index) => (index + '')}
                extraData={this.state}
                renderItem={({ item }) => {
                  return (<TouchableOpacity style={transactionsStyle.transferOfferRow} onPress={() => this.clickToActionRequired(item)}>
                    <View style={transactionsStyle.transferOfferTitle}>
                      <Text style={transactionsStyle.transferOfferTitleType}>{item.typeTitle.toUpperCase()}</Text>
                      <Text style={transactionsStyle.transferOfferTitleTime} >{moment(item.timestamp).format('YYYY MMM DD').toUpperCase()}</Text>
                      <Image style={transactionsStyle.transferOfferTitleIcon} source={require('assets/imgs/sign-request-icon.png')} />
                    </View>

                    {item.type === ActionRequireTypes.transfer && <View style={transactionsStyle.iftttTask}>
                      <Text style={transactionsStyle.iftttTitle}>{item.transferOffer.asset.name}</Text>
                      <Text style={transactionsStyle.iftttDescription}>{global.i18n.t("TransactionsComponent_signToReceiveTheBitmarkFrom", { accountNumber: item.transferOffer.bitmark.owner.substring(0, 4) + '...' + item.transferOffer.bitmark.owner.substring(item.transferOffer.bitmark.owner.length - 4, item.transferOffer.bitmark.owner.length) })}</Text>
                    </View>}

                    {item.type === ActionRequireTypes.ifttt && <View style={transactionsStyle.iftttTask}>
                      <Text style={transactionsStyle.iftttTitle}>{item.assetInfo.propertyName}</Text>
                      <Text style={transactionsStyle.iftttDescription}>{global.i18n.t("TransactionsComponent_signYourBitmarkIssuanceForYourIftttData")}</Text>
                    </View>}

                    {item.type === ActionRequireTypes.test_write_down_recovery_phase && <View style={transactionsStyle.recoveryPhaseActionRequired}>
                      <Text style={transactionsStyle.recoveryPhaseActionRequiredTitle}>{global.i18n.t("TransactionsComponent_recoveryPhaseActionRequiredTitle")}</Text>
                      <View style={transactionsStyle.recoveryPhaseActionRequiredDescriptionArea}>
                        <Text style={transactionsStyle.recoveryPhaseActionRequiredDescription}>{global.i18n.t("TransactionsComponent_recoveryPhaseActionRequiredDescription")}</Text>
                        <Image style={transactionsStyle.recoveryPhaseActionRequiredImportantIcon} source={require('assets/imgs/alert.png')} />
                      </View>
                    </View>}

                    {item.type === ActionRequireTypes.claim_request && <View style={transactionsStyle.iftttTask}>
                      <Text style={transactionsStyle.iftttTitle}>{item.incomingClaimRequest.asset.name} {item.incomingClaimRequest.index}/{item.incomingClaimRequest.asset.editions[bitmarkAccountNumber].limited}</Text>
                      <Text style={transactionsStyle.iftttDescription}>{global.i18n.t("TransactionsComponent_claimRequestMessage", { accountNumber: item.incomingClaimRequest.from })}</Text>
                    </View>}
                  </TouchableOpacity>)
                }} />
            </View>}
            {(this.props.appLoadingData || (this.props.actionRequired.length < this.props.totalActionRequired)) &&
              <View style={transactionsStyle.contentSubTab}>
                <ActivityIndicator size="large" style={{ marginTop: 46, }} />
              </View>
            }
          </TouchableOpacity>
        </ScrollView>}

        {this.state.subTab === SubTabs.required && this.props.actionRequired && this.props.actionRequired.length > 0
          && (this.props.actionRequired.findIndex(item => item.type === ActionRequireTypes.transfer) >= 0) && <TouchableOpacity style={transactionsStyle.acceptAllTransfersButton} onPress={this.acceptAllTransfers} >
            <Text style={transactionsStyle.acceptAllTransfersButtonText}>{global.i18n.t("TransactionsComponent_acceptAllTransfersButtonText")}</Text>
          </TouchableOpacity>
        }

        {this.state.subTab === SubTabs.completed && <ScrollView style={[transactionsStyle.scrollSubTabArea]}
          onScroll={async (scrollEvent) => {
            if (this.loadingCompletedWhenScroll) {
              return;
            }
            if (scrollEvent.nativeEvent.contentOffset.y >= (scrollEvent.nativeEvent.contentSize.height - currentSize.height) && (this.props.completed.length < this.props.totalCompleted)) {
              this.loadingCompletedWhenScroll = true;
              await TransactionProcessor.doAddMoreCompleted(this.props.completed.length);
            }
            this.loadingCompletedWhenScroll = false;
          }}
          scrollEventThrottle={1}
        >
          <TouchableOpacity activeOpacity={1} style={{ flex: 1 }}>
            {this.props.completed && this.props.completed.length === 0 && !this.props.appLoadingData && <View style={transactionsStyle.contentSubTab}>
              <Text style={transactionsStyle.titleNoRequiredTransferOffer}>{global.i18n.t("TransactionsComponent_noTransactionHistoryTitle")}</Text>
              <Text style={transactionsStyle.messageNoRequiredTransferOffer}>{global.i18n.t("TransactionsComponent_noTransactionHistoryMessage")}</Text>
            </View>}
            {this.props.completed && this.props.completed.length > 0 && <View style={transactionsStyle.contentSubTab}>
              <FlatList data={this.props.completed}
                keyExtractor={(item, index) => (index + '')}
                extraData={this.state}
                renderItem={({ item }) => {
                  if (item.outgoingClaimRequest) {
                    return (
                      <TouchableOpacity style={transactionsStyle.completedTransfer}>
                        <View style={transactionsStyle.completedTransferHeader}>
                          {item.outgoingClaimRequest.status === 'accepted' && <View style={transactionsStyle.completedTransferHeaderIconArea}>
                            <Image style={transactionsStyle.completedTransferHeaderIconImage} source={require('assets/imgs/accepted_icon.png')} />
                          </View>}
                          {item.outgoingClaimRequest.status === 'rejected' && <View style={transactionsStyle.completedTransferHeaderIconArea}>
                            <Image style={transactionsStyle.completedTransferHeaderIconImage} source={require('assets/imgs/rejected_icon.png')} />
                          </View>}

                          {item.outgoingClaimRequest.status === 'pending' && <Text style={[transactionsStyle.completedTransferHeaderTitle, { color: '#999999', }]}>
                            {global.i18n.t("TransactionsComponent_claimRequestHistoryPending")}
                          </Text>}
                          <Text style={[transactionsStyle.completedTransferHeaderValue, {
                            color: item.status === 'pending' ? '#999999' : '#0060F2'
                          }]}>{moment(item.timestamp).format('YYYY MMM DD HH:mm:ss').toUpperCase()}</Text>
                        </View>
                        <View style={transactionsStyle.completedTransferContent}>
                          <View style={transactionsStyle.completedTransferContentRow}>
                            <Text style={[transactionsStyle.completedTransferContentRowLabel, { marginTop: 1, }]}>{global.i18n.t("TransactionsComponent_property")}</Text>
                            <Text style={[transactionsStyle.completedTransferContentRowPropertyName]} numberOfLines={1} >{item.outgoingClaimRequest.asset.name}</Text>
                          </View>
                          <View style={transactionsStyle.completedTransferContentRow}>
                            <Text style={transactionsStyle.completedTransferContentRowLabel}>{global.i18n.t("TransactionsComponent_type")}</Text>
                            <Text style={transactionsStyle.completedTransferContentRowValue} numberOfLines={1}>{global.i18n.t("TransactionsComponent_claimRequestHistoryTitle")}</Text>
                          </View>
                          <View style={[transactionsStyle.completedTransferContentRow, { marginTop: 1, }]}>
                            <Text style={transactionsStyle.completedTransferContentRowLabel}>{global.i18n.t("TransactionsComponent_from")}</Text>
                            <Text style={transactionsStyle.completedTransferContentRowValue} numberOfLines={1}>{item.outgoingClaimRequest.from === this.state.currentUser.bitmarkAccountNumber ? global.i18n.t("TransactionsComponent_you") :
                              ('[' + item.outgoingClaimRequest.from.substring(0, 4) + '...' + item.outgoingClaimRequest.from.substring(item.outgoingClaimRequest.from.length - 4, item.outgoingClaimRequest.from.length) + ']')}</Text>
                          </View>
                          <View style={transactionsStyle.completedTransferContentRow}>
                            <Text style={transactionsStyle.completedTransferContentRowLabel}>{global.i18n.t("TransactionsComponent_to")}</Text>
                            <Text style={transactionsStyle.completedTransferContentRowValue} numberOfLines={1}>{(item.outgoingClaimRequest.asset.registrant === this.state.currentUser.bitmarkAccountNumber ? global.i18n.t("TransactionsComponent_you") :
                              (CacheData.identities[item.outgoingClaimRequest.asset.registrant] ? CacheData.identities[item.outgoingClaimRequest.asset.registrant].name :
                                ('[' + item.outgoingClaimRequest.asset.registrant.substring(0, 4) + '...' + item.outgoingClaimRequest.asset.registrant.substring(item.outgoingClaimRequest.asset.registrant.length - 4, item.outgoingClaimRequest.asset.registrant.length) + ']')))}</Text>
                          </View>
                        </View>
                      </TouchableOpacity>
                    )
                  }
                  return (
                    <TouchableOpacity style={transactionsStyle.completedTransfer} onPress={() => this.clickToCompleted(item)} disabled={(item.status === 'pending' || item.status === 'waiting')}>
                      <View style={transactionsStyle.completedTransferHeader}>
                        {(item.status === 'confirmed' || item.status === 'accepted') && <View style={transactionsStyle.completedTransferHeaderIconArea}>
                          <Image style={transactionsStyle.completedTransferHeaderIconImage} source={require('assets/imgs/accepted_icon.png')} />
                        </View>}
                        {(item.status !== 'confirmed' && item.status !== 'accepted') && <Text style={[transactionsStyle.completedTransferHeaderTitle, {
                          color: (item.status === 'pending' || item.status === 'waiting')
                            ? '#999999' : (
                              (item.status === 'canceled' || item.status === 'rejected') ? '#FF003C' : '#0060F2'
                            ),
                          width: (item.status === 'waiting' || item.status === 'canceled' || item.status === 'rejected')
                            ? 'auto' : convertWidth(102)
                        }]}>{global.i18n.t(`TransactionsComponent_title_${item.title}`, { defaultValue: item.title })}</Text>}

                        {(item.status !== 'waiting' && item.status !== 'rejected' && item.status !== 'canceled') &&
                          <Text style={[transactionsStyle.completedTransferHeaderValue, {
                            color: (item.status === 'pending' || item.status === 'waiting') ? '#999999' : '#0060F2'
                          }]}>{item.status === 'pending' ? global.i18n.t("TransactionsComponent_pending") : moment(item.timestamp).format('YYYY MMM DD HH:mm:ss').toUpperCase()}</Text>
                        }
                      </View>
                      <View style={transactionsStyle.completedTransferContent}>
                        <View style={transactionsStyle.completedTransferContentRow}>
                          <Text style={[transactionsStyle.completedTransferContentRowLabel, { marginTop: 1, }]}>{global.i18n.t("TransactionsComponent_property")}</Text>
                          <Text style={[transactionsStyle.completedTransferContentRowPropertyName]} numberOfLines={1} >{item.assetName}</Text>
                        </View>
                        {!!item.type && <View style={transactionsStyle.completedTransferContentRow}>
                          <Text style={transactionsStyle.completedTransferContentRowLabel}>{global.i18n.t("TransactionsComponent_type")}</Text>
                          <Text style={transactionsStyle.completedTransferContentRowValue} numberOfLines={1}> {global.i18n.t(`TransactionsComponent_type_${item.type}`, { defaultValue: item.type })}</Text>
                        </View>}
                        <View style={[transactionsStyle.completedTransferContentRow, { marginTop: 1, }]}>
                          <Text style={transactionsStyle.completedTransferContentRowLabel}>{global.i18n.t("TransactionsComponent_from")}</Text>
                          <Text style={transactionsStyle.completedTransferContentRowValue} numberOfLines={1}>{item.from === this.state.currentUser.bitmarkAccountNumber ? global.i18n.t("TransactionsComponent_you") :
                            ('[' + item.from.substring(0, 4) + '...' + item.from.substring(item.from.length - 4, item.from.length) + ']')}</Text>
                        </View>
                        {!!item.to && <View style={transactionsStyle.completedTransferContentRow}>
                          <Text style={transactionsStyle.completedTransferContentRowLabel}>{global.i18n.t("TransactionsComponent_to")}</Text>
                          <Text style={transactionsStyle.completedTransferContentRowValue} numberOfLines={1}>{item.researcherName ? item.researcherName : (item.to === this.state.currentUser.bitmarkAccountNumber ? global.i18n.t("TransactionsComponent_you") :
                            ('[' + item.to.substring(0, 4) + '...' + item.to.substring(item.to.length - 4, item.to.length) + ']'))}</Text>
                        </View>}
                      </View>
                    </TouchableOpacity>
                  )
                }} />
            </View >}
            {(this.props.appLoadingData || (this.props.completed.length < this.props.totalCompleted)) &&
              <View style={transactionsStyle.contentSubTab}>
                <ActivityIndicator size="large" style={{ marginTop: 46, }} />
              </View>
            }
          </TouchableOpacity>
        </ScrollView>}
      </SafeAreaView >
    );
  }
}

PrivateTransactionsComponent.propTypes = {
  totalActionRequired: PropTypes.number,
  actionRequired: PropTypes.array,
  totalCompleted: PropTypes.number,
  completed: PropTypes.array,
  appLoadingData: PropTypes.bool,
  subTab: PropTypes.string,

}

const StoreTransactionsComponent = connect(
  (state) => {
    return state.data;
  },
)(PrivateTransactionsComponent);

export class TransactionsComponent extends React.Component {
  static propTypes = {
    subTab: PropTypes.string,

  }
  constructor(props) {
    super(props);
  }
  render() {
    return (
      <View style={{ flex: 1 }}>
        <Provider store={TransactionsStore}>
          <StoreTransactionsComponent subTab={this.props.subTab} />
        </Provider>
      </View>
    );
  }
}

