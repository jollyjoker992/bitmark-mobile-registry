import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Provider, connect } from 'react-redux';
import {
  View, Image, Text, SafeAreaView,
} from 'react-native';
import { BottomTabBar } from 'react-navigation-tabs';

import componentStyles from './bottom-tabs.component.style';
import { Actions } from 'react-native-router-flux';
import { BottomTabStore } from 'src/views/stores';
import { OneTabButtonComponent } from 'src/views/commons/one-tab-button.component';

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
      <View style={componentStyles.bottomTabArea}>
        {routes.map((route, index) => {
          const active = index === this.props.navigation.state.index;
          const label = this.props.getLabelText({ route });
          if (label === 'properties') {
            return (<OneTabButtonComponent key={index} style={componentStyles.bottomTabButton} onPress={() => {
              this.props.onTabPress({ route });
              Actions.reset('properties');
            }}>
              {this.props.totalNewBitmarks > 0 && <View style={componentStyles.haveNewBitmark} />}
              <Image style={componentStyles.bottomTabButtonIcon} source={active
                ? require('assets/imgs/properties-icon-enable.png')
                : require('assets/imgs/properties-icon-disable.png')} />
              <Text style={[componentStyles.bottomTabButtonText, {
                color: active ? '#0060F2' : '#A4B5CD'
              }]}>{global.i18n.t("BottomTabsComponent_properties")}</Text>
            </OneTabButtonComponent>);
          }

          if (label === 'transactions') {
            return (<OneTabButtonComponent key={index} style={componentStyles.bottomTabButton} onPress={() => {
              this.props.onTabPress({ route });
              Actions.reset(label);
            }}>
              {this.props.totalTasks > 0 && <View style={componentStyles.transactionNumber}>
                <Text style={componentStyles.transactionNumberText}>{this.props.totalTasks < 100 ? this.props.totalTasks : 99}</Text>
              </View>}
              <Image style={componentStyles.bottomTabButtonIcon} source={active
                ? require('assets/imgs/transaction-icon-enable.png')
                : require('assets/imgs/transaction-icon-disable.png')} />
              <Text style={[componentStyles.bottomTabButtonText, {
                color: active ? '#0060F2' : '#A4B5CD'
              }]}>{global.i18n.t("BottomTabsComponent_transactions")}</Text>
            </OneTabButtonComponent>);
          }

          if (label === 'account') {
            return (<OneTabButtonComponent key={index} style={componentStyles.bottomTabButton} onPress={() => {
              this.props.onTabPress({ route });
              Actions.reset('accountDetail');
            }}>
              <Image style={componentStyles.bottomTabButtonIcon} source={active
                ? require('assets/imgs/account-icon-enable.png')
                : require('assets/imgs/account-icon-disable.png')} />
              <Text style={[componentStyles.bottomTabButtonText, {
                color: active ? '#0060F2' : '#A4B5CD'
              }]}>{global.i18n.t("BottomTabsComponent_account")}</Text>
            </OneTabButtonComponent>);
          }
        })}
      </View>
    );
  }
}

PrivateBottomTabsComponent.propTypes = {
  totalTasks: PropTypes.number,
  totalNewBitmarks: PropTypes.number,
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