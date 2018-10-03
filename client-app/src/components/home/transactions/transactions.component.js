import React from 'react';
import PropTypes from 'prop-types';
import { NavigationActions } from 'react-navigation';
import { Provider, connect } from 'react-redux';
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
import { TransactionsStore } from '../../../stores';

const SubTabs = {
  required: 'ACTIONS REQUIRED',
  completed: 'HISTORY',
};

const ActionTypes = {
  transfer: 'transfer',
  ifttt: 'ifttt',
  test_write_down_recovery_phase: 'test_write_down_recovery_phase'
};

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

    let subTab = (this.props.screenProps.subTab === SubTabs.required || this.props.screenProps.subTab === SubTabs.completed) ? this.props.screenProps.subTab : SubTabs.required;
    this.state = {
      currentUser: DataProcessor.getUserInformation(),
      subTab,
    };

  }
  UNSAFE_componentWillReceiveProps(nextProps) {
    let subTab = (nextProps.subTab === SubTabs.required || nextProps.subTab === SubTabs.completed) ? nextProps.subTab : this.state.subTab;
    this.setState({ subTab });
  }

  componentDidMount() {
    this.switchSubTab(this.state.subTab);
    if (this.props.screenProps.needReloadData) {
      this.reloadData();
      if (this.props.screenProps.doneReloadData) {
        this.props.screenProps.doneReloadData()
      }
    }
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
        indicator: true, title: '', message: 'Sending your transaction to the Bitmark network...'
      }).then(result => {
        if (result) {
          DataProcessor.doReloadUserData();
          Alert.alert('Success!', 'Your property rights have been registered.', [{
            text: 'OK',
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
          mainTab: BottomTabsComponent.MainTabs.account,
          subTab: null
        },
        goToRecoveryPhase: true,
        changeMainTab: { mainTab: BottomTabsComponent.MainTabs.account }
      });
    }
  }

  clickToCompleted(item) {
    if (item.title === 'SEND' && item.type === 'P2P TRANSFER') {
      let sourceUrl = config.registry_server_url + `/transaction/${item.txid}?env=app`;
      this.props.screenProps.homeNavigation.navigate('BitmarkWebView', { title: 'REGISTRY', sourceUrl, isFullScreen: true });
    } else if (item.title === 'ISSUANCE') {
      let sourceUrl = config.registry_server_url + `/issuance/${item.blockNumber}/${item.assetId}/${DataProcessor.getUserInformation().bitmarkAccountNumber}?env=app`;
      this.props.screenProps.homeNavigation.navigate('BitmarkWebView', { title: 'REGISTRY', sourceUrl, isFullScreen: true });
    }
  }

  async acceptAllTransfers() {
    AppProcessor.doGetAllTransfersOffers().then(transferOffers => {
      console.log(transferOffers);
      Alert.alert('Sign for acceptance of all bitmarks sent to you?', `Accept “${transferOffers.length}” properties sent to you.`, [{
        text: 'Cancel', style: 'cancel',
      }, {
        text: 'Yes',
        onPress: () => {
          AppProcessor.doAcceptAllTransfers(transferOffers, { indicator: true, }, result => {
            if (result) {
              Alert.alert('Acceptance Submitted', 'Your signature for the transfer request has been successfully submitted to the Bitmark network.');
            }
          }).catch(error => {
            console.log('acceptAllTransfers error:', error);
            Alert.alert('Request Failed', 'This error may be due to a request expiration or a network error. We will inform the property owner that the property transfer failed. Please try again later or contact the property owner to resend a property transfer request.');
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
          <Text style={defaultStyle.headerTitle}>TRANSACTIONS</Text>
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
                <Text style={transactionsStyle.subTabButtonText}>{SubTabs.required.toUpperCase()}</Text>
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
                <Text style={[transactionsStyle.subTabButtonText, { color: '#C1C1C1' }]}>{SubTabs.required.toUpperCase()}</Text>
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
                <Text style={transactionsStyle.subTabButtonText}>{SubTabs.completed.toUpperCase()}</Text>
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
                <Text style={[transactionsStyle.subTabButtonText, { color: '#C1C1C1' }]}>{SubTabs.completed.toUpperCase()}</Text>
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
              await DataProcessor.doAddMoreActionRequired(this.props.actionRequired.length);
            }
            this.loadingActionRequiredWhenScroll = false;
          }}
          scrollEventThrottle={1}>
          <TouchableOpacity activeOpacity={1} style={{ flex: 1 }}>
            {this.props.actionRequired && this.props.actionRequired.length === 0 && !this.props.appLoadingData && <View style={transactionsStyle.contentSubTab}>
              <Text style={transactionsStyle.titleNoRequiredTransferOffer}>NO ACTIONS REQUIRED.</Text>
              <Text style={transactionsStyle.messageNoRequiredTransferOffer}>This is where you will receive authorization requests.</Text>
            </View>}

            {this.props.actionRequired && this.props.actionRequired.length > 0 && <View style={transactionsStyle.contentSubTab}>
              <FlatList data={this.props.actionRequired}
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
                      <Text style={transactionsStyle.iftttDescription}>Sign to receive the bitmark from {'[' + item.transferOffer.bitmark.owner.substring(0, 4) + '...' + item.transferOffer.bitmark.owner.substring(item.transferOffer.bitmark.owner.length - 4, item.transferOffer.bitmark.owner.length) + ']'}.</Text>
                    </View>}

                    {item.type === ActionTypes.ifttt && <View style={transactionsStyle.iftttTask}>
                      <Text style={transactionsStyle.iftttTitle}>{item.assetInfo.propertyName}</Text>
                      <Text style={transactionsStyle.iftttDescription}>Sign your bitmark issuance for your IFTTT data.</Text>
                    </View>}

                    {item.type === ActionTypes.test_write_down_recovery_phase && <View style={transactionsStyle.recoveryPhaseActionRequired}>
                      <Text style={transactionsStyle.recoveryPhaseActionRequiredTitle}>Write Down Your Recovery Phrase</Text>
                      <View style={transactionsStyle.recoveryPhaseActionRequiredDescriptionArea}>
                        <Text style={transactionsStyle.recoveryPhaseActionRequiredDescription}>Protect your Bitmark account.</Text>
                        <Image style={transactionsStyle.recoveryPhaseActionRequiredImportantIcon} source={require('./../../../../assets/imgs/alert.png')} />
                      </View>
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
          && (this.props.actionRequired.findIndex(item => item.type === ActionTypes.transfer) >= 0) && <TouchableOpacity style={transactionsStyle.acceptAllTransfersButton} onPress={this.acceptAllTransfers} >
            <Text style={transactionsStyle.acceptAllTransfersButtonText}>SIGN FOR ALL BITMARKS SENT TO YOU</Text>
          </TouchableOpacity>
        }

        {this.state.subTab === SubTabs.completed && <ScrollView style={[transactionsStyle.scrollSubTabArea]}
          onScroll={async (scrollEvent) => {
            if (this.loadingCompletedWhenScroll) {
              return;
            }
            if (scrollEvent.nativeEvent.contentOffset.y >= (scrollEvent.nativeEvent.contentSize.height - currentSize.height) && (this.props.completed.length < this.props.totalCompleted)) {
              this.loadingCompletedWhenScroll = true;
              await DataProcessor.doAddMoreCompleted(this.props.completed.length);
            }
            this.loadingCompletedWhenScroll = false;
          }}
          scrollEventThrottle={1}
        >
          <TouchableOpacity activeOpacity={1} style={{ flex: 1 }}>
            {this.props.completed && this.props.completed.length === 0 && !this.props.appLoadingData && <View style={transactionsStyle.contentSubTab}>
              <Text style={transactionsStyle.titleNoRequiredTransferOffer}>NO TRANSACTION HISTORY.</Text>
              <Text style={transactionsStyle.messageNoRequiredTransferOffer}>Your transaction history will be available here.</Text>
            </View>}
            {this.props.completed && this.props.completed.length > 0 && <View style={transactionsStyle.contentSubTab}>
              <FlatList data={this.props.completed}
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
                          }]}>{item.status === 'pending' ? 'PENDING...' : moment(item.timestamp).format('YYYY MMM DD HH:mm:ss').toUpperCase()}</Text>
                        }
                      </View>
                      <View style={transactionsStyle.completedTransferContent}>
                        <View style={transactionsStyle.completedTransferContentRow}>
                          <Text style={[transactionsStyle.completedTransferContentRowLabel, { marginTop: 1, }]}>PROPERTY</Text>
                          <Text style={[transactionsStyle.completedTransferContentRowPropertyName]} numberOfLines={1} >{item.assetName}</Text>
                        </View>
                        {!!item.type && <View style={transactionsStyle.completedTransferContentRow}>
                          <Text style={transactionsStyle.completedTransferContentRowLabel}>TYPE</Text>
                          <Text style={transactionsStyle.completedTransferContentRowValue} numberOfLines={1}>{item.type.toUpperCase()}</Text>
                        </View>}
                        <View style={[transactionsStyle.completedTransferContentRow, { marginTop: 1, }]}>
                          <Text style={transactionsStyle.completedTransferContentRowLabel}>FROM</Text>
                          <Text style={transactionsStyle.completedTransferContentRowValue} numberOfLines={1}>{item.from === this.state.currentUser.bitmarkAccountNumber ? 'YOU' :
                            ('[' + item.from.substring(0, 4) + '...' + item.from.substring(item.from.length - 4, item.from.length) + ']')}</Text>
                        </View>
                        {!!item.to && <View style={transactionsStyle.completedTransferContentRow}>
                          <Text style={transactionsStyle.completedTransferContentRowLabel}>TO</Text>
                          <Text style={transactionsStyle.completedTransferContentRowValue} numberOfLines={1}>{item.researcherName ? item.researcherName : (item.to === this.state.currentUser.bitmarkAccountNumber ? 'YOU' :
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
      </View >
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

const StoreTransactionsComponent = connect(
  (state) => {
    return state.data;
  },
)(PrivateTransactionsComponent);

export class TransactionsComponent extends React.Component {
  static propTypes = {
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
  constructor(props) {
    super(props);
  }
  render() {
    return (
      <View style={{ flex: 1 }}>
        <Provider store={TransactionsStore}>
          <StoreTransactionsComponent
            screenProps={this.props.screenProps} navigation={this.props.navigation} subTab={this.props.subTab} />
        </Provider>
      </View>
    );
  }
}

