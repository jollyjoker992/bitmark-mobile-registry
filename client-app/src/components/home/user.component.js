import React from 'react';
import PropTypes from 'prop-types';
import {
  View
} from 'react-native';
import { NavigationActions } from 'react-navigation';

import { AccountComponent } from './account';
import { PropertiesComponent } from './properties';
import { TransactionsComponent } from './transactions';


import { BottomTabsComponent } from './bottom-tabs/bottom-tabs.component';
import { AppProcessor, DataProcessor } from '../../processors';
import { EventEmitterService } from '../../services';
import { BitmarkComponent } from '../../commons/components';
import { BottomTabStore, BottomTabActions } from '../../stores';

const MainTabs = BottomTabsComponent.MainTabs;

let ComponentName = 'UserComponent';
export class UserComponent extends React.Component {
  constructor(props) {
    super(props);
    this.logout = this.logout.bind(this);
    this.reloadUserData = this.reloadUserData.bind(this);
    this.switchMainTab = this.switchMainTab.bind(this);
    this.handerReceivedNotification = this.handerReceivedNotification.bind(this);
    this.refreshComponent = this.refreshComponent.bind(this);

    EventEmitterService.remove(EventEmitterService.events.APP_RECEIVED_NOTIFICATION, null, ComponentName);
    EventEmitterService.remove(EventEmitterService.events.NEED_RELOAD_USER_DATA, null, ComponentName);
    EventEmitterService.remove(EventEmitterService.events.NEED_REFRESH_USER_COMPONENT_STATE, null, ComponentName);

    let subTab;
    let mainTab = MainTabs.properties;
    let needReloadData;
    if (this.props.navigation.state && this.props.navigation.state.params) {
      needReloadData = this.props.navigation.state.params.needReloadData;
      if (this.props.navigation.state.params.displayedTab) {
        mainTab = this.props.navigation.state.params.displayedTab.mainTab;
        if (mainTab !== MainTabs.properties && mainTab !== MainTabs.transaction && mainTab !== MainTabs.account) {
          mainTab = MainTabs.properties;
        }
        subTab = this.props.navigation.state.params.displayedTab.subTab;
      }
    }
    this.state = {
      displayedTab: {
        mainTab,
        subTab,
      },
    };
    let bottomTabStoreState = BottomTabStore.getState().data;
    bottomTabStoreState.mainTab = mainTab;
    BottomTabStore.dispatch(BottomTabActions.init(bottomTabStoreState));
    this.needReloadData = needReloadData;
  }

  componentDidMount() {
    EventEmitterService.on(EventEmitterService.events.APP_RECEIVED_NOTIFICATION, this.handerReceivedNotification, ComponentName);
    EventEmitterService.on(EventEmitterService.events.NEED_RELOAD_USER_DATA, this.reloadUserData, ComponentName);
    EventEmitterService.on(EventEmitterService.events.NEED_REFRESH_USER_COMPONENT_STATE, this.refreshComponent, ComponentName);
  }

  refreshComponent(newState) {
    this.setState(newState);
    if (newState.changeMainTab) {
      let bottomTabStoreState = BottomTabStore.getState().data;
      bottomTabStoreState.mainTab = newState.changeMainTab.mainTab;
      BottomTabStore.dispatch(BottomTabActions.init(bottomTabStoreState));
    }
  }

  reloadUserData() {
    AppProcessor.doReloadUserData();
  }

  switchMainTab(mainTab) {
    let displayedTab = { mainTab, subTab: null };
    this.setState({ displayedTab });
    let bottomTabStoreState = BottomTabStore.getState().data;
    bottomTabStoreState.mainTab = mainTab;
    BottomTabStore.dispatch(BottomTabActions.init(bottomTabStoreState));
  }

  handerReceivedNotification(data) {
    console.log('UserComponent handerReceivedNotification data :', data);
    if (data.name === 'transfer_request' && data.id) {
      AppProcessor.doGetTransferOfferDetail(data.id).then(transferOfferDetail => {
        const resetHomePage = NavigationActions.reset({
          index: 1,
          actions: [
            NavigationActions.navigate({
              routeName: 'User', params: {
                displayedTab: { mainTab: MainTabs.transaction, subTab: 'ACTIONS REQUIRED' },
              }
            }),
            NavigationActions.navigate({
              routeName: 'TransactionDetail',
              params: { transferOffer: transferOfferDetail, }
            }),
          ]
        });
        this.props.navigation.dispatch(resetHomePage);
      }).catch(error => {
        console.log('handerReceivedNotification transfer_required error :', error);
      });
    } else if (data.name === 'transfer_rejected') {
      DataProcessor.doGetLocalBitmarkInformation(data.bitmark_id).then(bitmarkInformation => {
        const resetHomePage = NavigationActions.reset({
          index: 1,
          actions: [
            NavigationActions.navigate({
              routeName: 'User', params: { displayedTab: { mainTab: MainTabs.properties }, }
            }),
            NavigationActions.navigate({
              routeName: 'LocalPropertyDetail',
              params: { asset: bitmarkInformation.asset, bitmark: bitmarkInformation.bitmark }
            }),
          ]
        });
        this.props.navigation.dispatch(resetHomePage);
      });
    } else if (data.name === 'transfer_completed' || data.name === 'transfer_accepted') {
      const resetHomePage = NavigationActions.reset({
        index: 0,
        actions: [
          NavigationActions.navigate({
            routeName: 'User', params: {
              displayedTab: { mainTab: MainTabs.transaction, subTab: 'HISTORY' },
              needReloadData: true,
            }
          }),
        ]
      });
      this.props.navigation.dispatch(resetHomePage);
    } else if (data.name === 'transfer_item_received' && data.bitmark_id) {
      DataProcessor.doReloadLocalBitmarks().then(() => {
        return DataProcessor.doGetLocalBitmarkInformation(data.bitmark_id);
      }).then(bitmarkInformation => {
        const resetHomePage = NavigationActions.reset({
          index: 1,
          actions: [
            NavigationActions.navigate({
              routeName: 'User', params: { displayedTab: { mainTab: MainTabs.properties }, }
            }),
            NavigationActions.navigate({
              routeName: 'LocalPropertyDetail',
              params: { asset: bitmarkInformation.asset, bitmark: bitmarkInformation.bitmark }
            }),
          ]
        });
        this.props.navigation.dispatch(resetHomePage);
      });
    } else if (data.name === 'transfer_failed') {
      DataProcessor.doGetLocalBitmarkInformation(data.bitmark_id).then(bitmarkInformation => {
        const resetHomePage = NavigationActions.reset({
          index: 1,
          actions: [
            NavigationActions.navigate({
              routeName: 'User', params: { displayedTab: { mainTab: MainTabs.properties }, }
            }),
            NavigationActions.navigate({
              routeName: 'LocalPropertyDetail',
              params: { asset: bitmarkInformation.asset, bitmark: bitmarkInformation.bitmark }
            }),
          ]
        });
        this.props.navigation.dispatch(resetHomePage);
      });
    } else if (data.event === 'tracking_transfer_confirmed') {
      DataProcessor.doReloadTrackingBitmark().then(() => {
        return DataProcessor.doGetTrackingBitmarkInformation(data.bitmark_id);
      }).then(trackingBitmark => {
        const resetHomePage = NavigationActions.reset({
          index: 1,
          actions: [
            NavigationActions.navigate({
              routeName: 'User', params: { displayedTab: { mainTab: MainTabs.properties, subTab: 'TRACKED' }, }
            }),
            NavigationActions.navigate({
              routeName: 'LocalPropertyDetail',
              params: { asset: trackingBitmark.asset, bitmark: trackingBitmark }
            }),
          ]
        });
        this.props.navigation.dispatch(resetHomePage);
      }).catch(error => {
        console.log('handerReceivedNotification tracking_transfer_confirmed error :', error);
      });
    }
  }

  logout() {
    AppProcessor.doLogout().then(() => {
      const resetMainPage = NavigationActions.reset({
        index: 0,
        actions: [NavigationActions.navigate({ routeName: 'Main' })]
      });
      this.props.screenProps.rootNavigation.dispatch(resetMainPage);
    }).catch((error) => {
      console.log('log out error :', error);
    });
  }

  render() {
    return (
      <BitmarkComponent
        content={(<View style={{ flex: 1 }}>
          {this.state.displayedTab.mainTab === MainTabs.properties && <PropertiesComponent screenProps={{
            homeNavigation: this.props.navigation,
            needReloadData: this.needReloadData,
            donReloadData: () => this.needReloadData = false,
          }} />}
          {this.state.displayedTab.mainTab === MainTabs.transaction && <TransactionsComponent screenProps={{
            homeNavigation: this.props.navigation,
            subTab: this.state.displayedTab.subTab,
            needReloadData: this.needReloadData,
            donReloadData: () => this.needReloadData = false,
          }} />}
          {this.state.displayedTab.mainTab === MainTabs.account && <AccountComponent screenProps={{
            homeNavigation: this.props.navigation,
            subTab: this.state.displayedTab.subTab,
            logout: this.logout,
            needReloadData: this.needReloadData,
            goToRecoveryPhase: this.state.goToRecoveryPhase,
            removeGoingToRecoveryPhase: () => this.setState({ goToRecoveryPhase: false }),
            donReloadData: () => this.needReloadData = false,
          }} />}
        </View>)}
        footer={(<BottomTabsComponent mainTab={this.state.displayedTab.mainTab} switchMainTab={this.switchMainTab} homeNavigation={this.props.navigation} />)}
      />
    );
  }
}

UserComponent.propTypes = {
  navigation: PropTypes.shape({
    navigate: PropTypes.func,
    goBack: PropTypes.func,
    dispatch: PropTypes.func,
    state: PropTypes.shape({
      params: PropTypes.shape({
        displayedTab: PropTypes.shape({
          mainTab: PropTypes.string,
          subTab: PropTypes.string,
        }),
        needReloadData: PropTypes.bool,
      }),
    }),
  }),
  screenProps: PropTypes.shape({
    rootNavigation: PropTypes.shape({
      navigate: PropTypes.func,
      dispatch: PropTypes.func,
    })
  }),
}