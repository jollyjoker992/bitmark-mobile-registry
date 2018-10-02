import React from 'react';
import PropTypes from 'prop-types';
import { NavigationActions } from 'react-navigation';
import {
  View, Text, TouchableOpacity, ScrollView, FlatList, Image, ActivityIndicator,
  Dimensions,
  Alert,
} from 'react-native';
import moment from 'moment';

import { DataProcessor, AppProcessor } from './../../../processors';

import transactionsStyle from './transactions.component.style';
import { EventEmitterService } from '../../../services';
import defaultStyle from './../../../commons/styles';
import { convertWidth } from '../../../utils';
import { config } from '../../../configs';
import { BottomTabsComponent } from '../bottom-tabs/bottom-tabs.component';

let SubTabs = {
  required: 'ACTIONS REQUIRED',
  completed: 'HISTORY',
};

const ActionTypes = {
  transfer: 'transfer',
  ifttt: 'ifttt',
  test_write_down_recovery_phase: 'test_write_down_recovery_phase'
};

let currentSize = Dimensions.get('window');

let ComponentName = 'TransactionsComponent';
export class TransactionsComponent extends React.Component {
  constructor(props) {
    super(props);

    SubTabs = {
      required: global.i18n.t("TransactionsComponent_actionsRequired"),
      completed: global.i18n.t("TransactionsComponent_history"),
    };

    this.switchSubTab = this.switchSubTab.bind(this);
    this.handerChangeScreenData = this.handerChangeScreenData.bind(this);
    this.acceptAllTransfers = this.acceptAllTransfers.bind(this);
    this.reloadData = this.reloadData.bind(this);
    this.handerLoadingData = this.handerLoadingData.bind(this);

    this.clickToActionRequired = this.clickToActionRequired.bind(this);
    this.clickToCompleted = this.clickToCompleted.bind(this);

    EventEmitterService.remove(EventEmitterService.events.CHANGE_TRANSACTION_SCREEN_ACTION_REQUIRED_DATA, null, ComponentName);
    EventEmitterService.remove(EventEmitterService.events.CHANGE_TRANSACTION_SCREEN_HISTORIES_DATA, null, ComponentName);
    EventEmitterService.remove(EventEmitterService.events.APP_LOADING_DATA, null, ComponentName);

    let subTab = (this.props.screenProps.subTab === SubTabs.required || this.props.screenProps.subTab === SubTabs.completed) ? this.props.screenProps.subTab : SubTabs.required;
    this.state = {
      currentUser: DataProcessor.getUserInformation(),
      subTab,
      totalActionRequired: 0,
      totalCompleted: 0,
      actionRequired: [],
      completed: [],
      appLoadingData: DataProcessor.isAppLoadingData(),
      gettingData: true,
      lengthDisplayActionRequired: 0,
      lengthDisplayCompleted: 0,
    };

    const doGetScreenData = async () => {

      let { actionRequired, totalActionRequired } = await DataProcessor.doGetTransactionScreenActionRequired(0);
      let { completed, totalCompleted } = await DataProcessor.doGetTransactionScreenHistories(0);

      this.setState({
        totalActionRequired,
        totalCompleted,
        completed,
        actionRequired,
        gettingData: false,
        lengthDisplayActionRequired: actionRequired.length,
        lengthDisplayCompleted: completed.length,
      });
    };

    doGetScreenData();
  }
  UNSAFE_componentWillReceiveProps(nextProps) {
    let subTab = (nextProps.subTab === SubTabs.required || nextProps.subTab === SubTabs.completed) ? nextProps.subTab : this.state.subTab;
    this.setState({ subTab });
  }

  componentDidMount() {
    this.switchSubTab(this.state.subTab);
    EventEmitterService.on(EventEmitterService.events.CHANGE_TRANSACTION_SCREEN_ACTION_REQUIRED_DATA, this.handerChangeScreenData, ComponentName);
    EventEmitterService.on(EventEmitterService.events.CHANGE_TRANSACTION_SCREEN_HISTORIES_DATA, this.handerChangeScreenData, ComponentName);

    EventEmitterService.on(EventEmitterService.events.APP_LOADING_DATA, this.handerLoadingData, ComponentName);

    if (this.props.screenProps.needReloadData) {
      this.reloadData();
      if (this.props.screenProps.doneReloadData) {
        this.props.screenProps.doneReloadData()
      }
    }
  }

  async handerChangeScreenData() {
    let { actionRequired, totalActionRequired } = await DataProcessor.doGetTransactionScreenActionRequired(this.state.lengthDisplayActionRequired);
    let { completed, totalCompleted } = await DataProcessor.doGetTransactionScreenHistories(this.state.lengthDisplayCompleted);

    this.setState({
      actionRequired: actionRequired,
      completed: completed,
      lengthDisplayActionRequired: actionRequired.length,
      lengthDisplayCompleted: completed.length,
      totalActionRequired,
      totalCompleted,
    });
  }
  handerLoadingData() {
    this.setState({
      appLoadingData: DataProcessor.isAppLoadingData(),
    });
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
    if (item.type === ActionTypes.transfer && item.transferOffer) {
      this.props.screenProps.homeNavigation.navigate('TransactionDetail', {
        transferOffer: item.transferOffer,
      });
    } else if (item.type === ActionTypes.ifttt) {
      AppProcessor.doIssueIftttData(item, {
        indicator: true, title: '', message: global.i18n.t("TransactionsComponent_sendingYourTransactionToTheBitmarkNetwork")
      }).then(result => {
        if (result) {
          DataProcessor.doReloadUserData();
          Alert.alert(global.i18n.t("TransactionsComponent_success"), global.i18n.t("TransactionsComponent_yourPropertyRightsHaveBeenRegistered"), [{
            text: global.i18n.t("TransactionsComponent_ok"),
            onPress: () => {
              const resetHomePage = NavigationActions.reset({
                index: 0,
                actions: [
                  NavigationActions.navigate({
                    routeName: 'User', params: {
                      displayedTab: { mainTab: BottomTabsComponent.MainTabs.properties },
                    }
                  }),
                ]
              });
              this.props.screenProps.homeNavigation.dispatch(resetHomePage);
            }
          }]);
        }
      }).catch(error => {
        console.log('doIssueIftttData error:', error);
        EventEmitterService.emit(EventEmitterService.events.APP_PROCESS_ERROR, { error });
      });
    } else if (item.type === ActionTypes.test_write_down_recovery_phase) {
      EventEmitterService.emit(EventEmitterService.events.NEED_REFRESH_USER_COMPONENT_STATE, {
        displayedTab: {
          mainTab: 'Account',
          subTab: null
        },
        goToRecoveryPhase: true,
        changeMainTab: {mainTab: 'Account'}
      });
    }
  }

  clickToCompleted(item) {
    if (item.title === 'SEND' && item.type === 'P2P TRANSFER') {
      let sourceUrl = config.registry_server_url + `/transaction/${item.txid}?env=app`;
      this.props.screenProps.homeNavigation.navigate('BitmarkWebView', { title: global.i18n.t("TransactionsComponent_registry"), sourceUrl, isFullScreen: true });
    } else if (item.title === 'ISSUANCE') {
      let sourceUrl = config.registry_server_url + `/issuance/${item.blockNumber}/${item.assetId}/${DataProcessor.getUserInformation().bitmarkAccountNumber}?env=app`;
      this.props.screenProps.homeNavigation.navigate('BitmarkWebView', { title: global.i18n.t("TransactionsComponent_registry"), sourceUrl, isFullScreen: true });
    }
  }

  async acceptAllTransfers() {
    AppProcessor.doGetAllTransfersOffers().then(transferOffers => {
      console.log(transferOffers);
      Alert.alert(global.i18n.t("TransactionsComponent_signForAcceptanceOfAllBitmarksSentToYou"), global.i18n.t("TransactionsComponent_acceptTransfer", {length: transferOffers.length}), [{
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
    return (
      <View style={transactionsStyle.body}>
        <View style={transactionsStyle.header}>
          <TouchableOpacity style={defaultStyle.headerLeft}></TouchableOpacity>
          <Text style={defaultStyle.headerTitle}>{global.i18n.t("TransactionsComponent_transactions")}</Text>
          <TouchableOpacity style={defaultStyle.headerRight}></TouchableOpacity>
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
            if (scrollEvent.nativeEvent.contentOffset.y >= (scrollEvent.nativeEvent.contentSize.height - currentSize.height) && (this.state.lengthDisplayActionRequired < this.state.totalActionRequired)) {
              this.loadingActionRequiredWhenScroll = true;
              let lengthDisplayActionRequired = Math.min(this.state.totalActionRequired, this.state.lengthDisplayActionRequired + 20);
              let { actionRequired } = await DataProcessor.doGetTransactionScreenActionRequired(lengthDisplayActionRequired);
              this.setState({ lengthDisplayActionRequired: actionRequired.length, actionRequired });
            }
            this.loadingActionRequiredWhenScroll = false;
          }}
          scrollEventThrottle={1}>
          <TouchableOpacity activeOpacity={1} style={{ flex: 1 }}>
            {this.state.actionRequired && this.state.actionRequired.length === 0 && (!this.state.gettingData && !this.state.appLoadingData) && <View style={transactionsStyle.contentSubTab}>
              <Text style={transactionsStyle.titleNoRequiredTransferOffer}>{global.i18n.t("TransactionsComponent_noActionsRequired")}</Text>
              <Text style={transactionsStyle.messageNoRequiredTransferOffer}>{global.i18n.t("TransactionsComponent_messageNoRequiredTransferOffer")}</Text>
            </View>}

            {this.state.actionRequired && this.state.actionRequired.length > 0 && <View style={transactionsStyle.contentSubTab}>
              <FlatList data={this.state.actionRequired}
                extraData={this.state}
                renderItem={({ item }) => {
                  return (<TouchableOpacity style={transactionsStyle.transferOfferRow} onPress={() => this.clickToActionRequired(item)}>
                    <View style={transactionsStyle.transferOfferTitle}>
                      <Text style={transactionsStyle.transferOfferTitleType}>{item.typeTitle.toUpperCase()}</Text>
                      <Text style={transactionsStyle.transferOfferTitleTime} >{moment(item.timestamp).format('YYYY MMM DD').toUpperCase()}</Text>
                      <Image style={transactionsStyle.transferOfferTitleIcon} source={require('./../../../../assets/imgs/sign-request-icon.png')} />
                    </View>

                    {item.type === ActionTypes.transfer && <View style={transactionsStyle.iftttTask}>
                      <Text style={transactionsStyle.iftttTitle}>{item.transferOffer.asset.name}</Text>
                      <Text style={transactionsStyle.iftttDescription}>{global.i18n.t("TransactionsComponent_signToReceiveTheBitmarkFrom", {accountNumber: item.transferOffer.bitmark.owner.substring(0, 4) + '...' + item.transferOffer.bitmark.owner.substring(item.transferOffer.bitmark.owner.length - 4, item.transferOffer.bitmark.owner.length)})}</Text>
                    </View>}

                    {item.type === ActionTypes.ifttt && <View style={transactionsStyle.iftttTask}>
                      <Text style={transactionsStyle.iftttTitle}>{item.assetInfo.propertyName}</Text>
                      <Text style={transactionsStyle.iftttDescription}>{global.i18n.t("TransactionsComponent_signYourBitmarkIssuanceForYourIftttData")}</Text>
                    </View>}

                    {item.type === ActionTypes.test_write_down_recovery_phase && <View style={transactionsStyle.recoveryPhaseActionRequired}>
                      <Text style={transactionsStyle.recoveryPhaseActionRequiredTitle}>{global.i18n.t("TransactionsComponent_recoveryPhaseActionRequiredTitle")}</Text>
                      <View style={transactionsStyle.recoveryPhaseActionRequiredDescriptionArea}>
                        <Text style={transactionsStyle.recoveryPhaseActionRequiredDescription}>{global.i18n.t("TransactionsComponent_recoveryPhaseActionRequiredDescription")}</Text>
                        <Image style={transactionsStyle.recoveryPhaseActionRequiredImportantIcon} source={require('./../../../../assets/imgs/alert.png')} />
                      </View>
                    </View>}
                  </TouchableOpacity>)
                }} />
            </View>}
            {(this.state.gettingData || this.state.appLoadingData || (this.state.lengthDisplayActionRequired < this.state.totalActionRequired)) &&
              <View style={transactionsStyle.contentSubTab}>
                <ActivityIndicator size="large" style={{ marginTop: 46, }} />
              </View>
            }
          </TouchableOpacity>
        </ScrollView>}
        {this.state.subTab === SubTabs.required && this.state.actionRequired && this.state.actionRequired.length > 0
          && (this.state.actionRequired.findIndex(item => item.type === ActionTypes.transfer) >= 0) && <TouchableOpacity style={transactionsStyle.acceptAllTransfersButton} onPress={this.acceptAllTransfers} >
            <Text style={transactionsStyle.acceptAllTransfersButtonText}>{global.i18n.t("TransactionsComponent_acceptAllTransfersButtonText")}</Text>
          </TouchableOpacity>
        }

        {this.state.subTab === SubTabs.completed && <ScrollView style={[transactionsStyle.scrollSubTabArea]}
          onScroll={async (scrollEvent) => {
            if (this.loadingCompletedWhenScroll) {
              return;
            }
            if (scrollEvent.nativeEvent.contentOffset.y >= (scrollEvent.nativeEvent.contentSize.height - currentSize.height) && (this.state.lengthDisplayCompleted < this.state.totalCompleted)) {
              this.loadingCompletedWhenScroll = true;
              let lengthDisplayCompleted = Math.min(this.state.totalActionRequired, this.state.lengthDisplayCompleted + 20);
              let { completed } = await DataProcessor.doGetTransactionScreenHistories(lengthDisplayCompleted);
              this.setState({ lengthDisplayCompleted: completed.length, completed });
            }
            this.loadingCompletedWhenScroll = false;
          }}
          scrollEventThrottle={1}
        >
          <TouchableOpacity activeOpacity={1} style={{ flex: 1 }}>
            {this.state.completed && this.state.completed.length === 0 && !this.state.appLoadingData && <View style={transactionsStyle.contentSubTab}>
              <Text style={transactionsStyle.titleNoRequiredTransferOffer}>NO TRANSACTION HISTORY.</Text>
              <Text style={transactionsStyle.messageNoRequiredTransferOffer}>Your transaction history will be available here.</Text>
            </View>}
            {this.state.completed && this.state.completed.length > 0 && <View style={transactionsStyle.contentSubTab}>
              <FlatList data={this.state.completed}
                extraData={this.state}
                renderItem={({ item }) => {
                  return (
                    <TouchableOpacity style={transactionsStyle.completedTransfer} onPress={() => this.clickToCompleted(item)} disabled={(item.status === 'pending' || item.status === 'waiting')}>
                      <View style={transactionsStyle.completedTransferHeader}>
                        <Text style={[transactionsStyle.completedTransferHeaderTitle, {
                          color: (item.status === 'pending' || item.status === 'waiting')
                            ? '#999999' : (
                              (item.status === 'canceled' || item.status === 'rejected') ? '#FF003C' : '#0060F2'
                            ),
                          width: (item.status === 'waiting' || item.status === 'canceled' || item.status === 'rejected')
                            ? 'auto' : convertWidth(102)
                        }]}>{item.title}</Text>
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
                          <Text style={transactionsStyle.completedTransferContentRowValue} numberOfLines={1}>{item.type.toUpperCase()}</Text>
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
            {(this.state.gettingData || this.state.appLoadingData || (this.state.lengthDisplayCompleted < this.state.totalCompleted)) &&
              <View style={transactionsStyle.contentSubTab}>
                <ActivityIndicator size="large" style={{ marginTop: 46, }} />
              </View>
            }
          </TouchableOpacity>
        </ScrollView>}
      </View >
    );
  }
}

TransactionsComponent.propTypes = {
  subTab: PropTypes.string,
  navigation: PropTypes.shape({
    navigate: PropTypes.func,
    goBack: PropTypes.func,
  }),
  screenProps: PropTypes.shape({
    subTab: PropTypes.string,
    switchMainTab: PropTypes.func,
    logout: PropTypes.func,
    homeNavigation: PropTypes.shape({
      navigate: PropTypes.func,
      goBack: PropTypes.func,
      dispatch: PropTypes.func,
    }),
    needReloadData: PropTypes.bool,
    doneReloadData: PropTypes.func,
  }),
}