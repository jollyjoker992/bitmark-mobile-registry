import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Provider, connect } from 'react-redux';
import {
  View, TouchableOpacity, Image, Text,
} from 'react-native';
// import { NavigationActions } from 'react-navigation';

import userStyle from './bottom-tabs.component.style';
import { BottomTabStore } from '../../../stores';

const MainTabs = {
  properties: 'Properties',
  transaction: 'Transactions',
  account: 'Account',
};
export class PrivateBottomTabsComponent extends React.Component {

  constructor(props) {
    super(props);
    this.switchMainTab = this.switchMainTab.bind(this);
  }

  switchMainTab(mainTab) {
    if (mainTab === this.props.mainTab) {
      return;
    }
    this.props.switchMainTab(mainTab);
  }

  render() {
    return (
      <View style={userStyle.bottomTabArea}>
        <TouchableOpacity style={userStyle.bottomTabButton} onPress={() => this.switchMainTab(MainTabs.properties)}>
          {(this.props.existNewAsset || this.props.existNewTracking) && <View style={userStyle.haveNewBitmark} />}
          <Image style={userStyle.bottomTabButtonIcon} source={this.props.mainTab === MainTabs.properties
            ? require('./../../../../assets/imgs/properties-icon-enable.png')
            : require('./../../../../assets/imgs/properties-icon-disable.png')} />
          <Text style={[userStyle.bottomTabButtonText, {
            color: this.props.mainTab === MainTabs.properties ? '#0060F2' : '#A4B5CD'
          }]}>{global.i18n.t("BottomTabsComponent_properties")}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={userStyle.bottomTabButton} onPress={() => this.switchMainTab(MainTabs.transaction)}>
          {this.props.totalTasks > 0 && <View style={userStyle.transactionNumber}>
            <Text style={userStyle.transactionNumberText}>{this.props.totalTasks < 100 ? this.props.totalTasks : 99}</Text>
          </View>}
          <Image style={userStyle.bottomTabButtonIcon} source={this.props.mainTab === MainTabs.transaction
            ? require('./../../../../assets/imgs/transaction-icon-enable.png')
            : require('./../../../../assets/imgs/transaction-icon-disable.png')} />
          <Text style={[userStyle.bottomTabButtonText, {
            color: this.props.mainTab === MainTabs.transaction ? '#0060F2' : '#A4B5CD'
          }]}>{global.i18n.t("BottomTabsComponent_transactions")}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={userStyle.bottomTabButton} onPress={() => this.switchMainTab(MainTabs.account)}>
          <Image style={userStyle.bottomTabButtonIcon} source={this.props.mainTab === MainTabs.account
            ? require('./../../../../assets/imgs/account-icon-enable.png')
            : require('./../../../../assets/imgs/account-icon-disable.png')} />
          <Text style={[userStyle.bottomTabButtonText, {
            color: this.props.mainTab === MainTabs.account ? '#0060F2' : '#A4B5CD'
          }]}>{global.i18n.t("BottomTabsComponent_account")}</Text>
        </TouchableOpacity>
      </View>
    );
  }
}

PrivateBottomTabsComponent.propTypes = {
  totalTasks: PropTypes.number,
  mainTab: PropTypes.string,
  switchMainTab: PropTypes.func,
  homeNavigation: PropTypes.shape({
    dispatch: PropTypes.func,
  }),
  existNewAsset: PropTypes.bool,
  existNewTracking: PropTypes.bool,
};

const StoreBottomTabsComponent = connect(
  (state) => {
    return state.data;
  },
)(PrivateBottomTabsComponent);

export class BottomTabsComponent extends Component {
  static MainTabs = MainTabs;
  static propTypes = {
    mainTab: PropTypes.string,
    switchMainTab: PropTypes.func,
    homeNavigation: PropTypes.shape({
      dispatch: PropTypes.func,
    }),
  }
  constructor(props) {
    super(props);
  }
  render() {
    return (
      <View style={{ flex: 1 }}>
        <Provider store={BottomTabStore}>
          <StoreBottomTabsComponent mainTab={this.props.mainTab} switchMainTab={this.props.switchMainTab} homeNavigation={this.props.homeNavigation} />
        </Provider>
      </View>
    );
  }
}