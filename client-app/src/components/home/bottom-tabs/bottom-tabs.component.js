import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Provider, connect } from 'react-redux';
import {
  View, TouchableOpacity, Image, Text, SafeAreaView,
} from 'react-native';
// import { NavigationActions } from 'react-navigation';
import { BottomTabBar } from 'react-navigation-tabs';

import userStyle from './bottom-tabs.component.style';
import { BottomTabStore } from '../../../stores';
import { Actions } from 'react-native-router-flux';

const MainTabs = {
  properties: 'Properties',
  transaction: 'Transactions',
  account: 'Account',
};
export class PrivateBottomTabsComponent extends BottomTabBar {

  constructor(props) {
    super(props);
  }

  render() {
    const routes = this.props.navigation.state.routes;
    return (
      <View style={userStyle.bottomTabArea}>
        {routes.map((route, index) => {
          const active = index === this.props.navigation.state.index;
          const label = this.props.getLabelText({ route });
          if (label === 'properties') {
            return (<TouchableOpacity style={userStyle.bottomTabButton} onPress={() => {
              this.props.onTabPress({ route });
              Actions.reset('assets');
            }}>
              {(this.props.existNewAsset || this.props.existNewTracking) && <View style={userStyle.haveNewBitmark} />}
              <Image style={userStyle.bottomTabButtonIcon} source={active
                ? require('./../../../../assets/imgs/properties-icon-enable.png')
                : require('./../../../../assets/imgs/properties-icon-disable.png')} />
              <Text style={[userStyle.bottomTabButtonText, {
                color: active ? '#0060F2' : '#A4B5CD'
              }]}>{global.i18n.t("BottomTabsComponent_properties")}</Text>
            </TouchableOpacity>);
          }

          if (label === 'transactions') {
            return (<TouchableOpacity style={userStyle.bottomTabButton} onPress={() => {
              this.props.onTabPress({ route });
              //TODO
              Actions.reset(label);
            }}>
              {this.props.totalTasks > 0 && <View style={userStyle.transactionNumber}>
                <Text style={userStyle.transactionNumberText}>{this.props.totalTasks < 100 ? this.props.totalTasks : 99}</Text>
              </View>}
              <Image style={userStyle.bottomTabButtonIcon} source={active
                ? require('./../../../../assets/imgs/transaction-icon-enable.png')
                : require('./../../../../assets/imgs/transaction-icon-disable.png')} />
              <Text style={[userStyle.bottomTabButtonText, {
                color: active ? '#0060F2' : '#A4B5CD'
              }]}>{global.i18n.t("BottomTabsComponent_transactions")}</Text>
            </TouchableOpacity>);
          }

          if (label === 'account') {
            return (<TouchableOpacity style={userStyle.bottomTabButton} onPress={() => {
              this.props.onTabPress({ route });
              Actions.reset('accountDetail');
            }}>
              <Image style={userStyle.bottomTabButtonIcon} source={active
                ? require('./../../../../assets/imgs/account-icon-enable.png')
                : require('./../../../../assets/imgs/account-icon-disable.png')} />
              <Text style={[userStyle.bottomTabButtonText, {
                color: active ? '#0060F2' : '#A4B5CD'
              }]}>{global.i18n.t("BottomTabsComponent_account")}</Text>
            </TouchableOpacity>);
          }
        })}
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
    navigation: PropTypes.any,
    getLabelText: PropTypes.func,
    onTabPress: PropTypes.func,
  }
  constructor(props) {
    super(props);
  }
  render() {
    return (
      <SafeAreaView style={{ backgroundColor: '#F5F5F5' }}>
        <Provider store={BottomTabStore}>
          <StoreBottomTabsComponent
            navigation={this.props.navigation}
            getLabelText={this.props.getLabelText}
            onTabPress={this.props.onTabPress}
          />
        </Provider>
      </SafeAreaView>
    );
  }
}