import React from 'react';
import { Provider, connect } from 'react-redux';
import PropTypes from 'prop-types';
import {
  View, Text, ScrollView, Image, ActivityIndicator, SafeAreaView,
  Clipboard,
  Alert,
} from 'react-native';
import { Actions } from 'react-native-router-flux';
import Intercom from 'react-native-intercom';

import accountStyle from './account.component.style';
import { AppProcessor, EventEmitterService, DataProcessor } from 'src/processors';
import { defaultStyles } from 'src/views/commons';
import { AccountStore } from 'src/views/stores';
import { OneTabButtonComponent } from 'src/views/commons/one-tab-button.component';

const SubTabs = {
  settings: 'SETTINGS',
  authorized: 'AUTHORIZED',
}
class PrivateAccountDetailComponent extends React.Component {
  constructor(props) {
    super(props);

    let subTab = this.props.subTab || SubTabs.settings;

    this.state = {
      subTab,
      accountNumberCopyText: '',
    };
  }

  logout() {
    AppProcessor.doLogout().then(() => {
      EventEmitterService.emit(EventEmitterService.events.APP_NEED_REFRESH);
    }).catch((error) => {
      console.log('log out error :', error);
    });
  }

  switchSubTab(subTab) {
    this.setState({ subTab, });
  }

  render() {
    return (
      <SafeAreaView style={accountStyle.body}>
        <View style={accountStyle.header}>
          <OneTabButtonComponent style={defaultStyles.headerLeft} />
          <Text style={defaultStyles.headerTitle}>{global.i18n.t("AccountDetailComponent_account")}</Text>
          <OneTabButtonComponent style={defaultStyles.headerRight} />
        </View>
        <View style={accountStyle.subTabArea}>
          {this.state.subTab === SubTabs.settings && <OneTabButtonComponent style={[accountStyle.subTabButton, {
            shadowOffset: { width: 2 },
            shadowOpacity: 0.15,
          }]}>
            <View style={accountStyle.subTabButtonArea}>
              <View style={[accountStyle.activeSubTabBar, { backgroundColor: '#0060F2' }]}></View>
              <View style={accountStyle.subTabButtonTextArea}>
                <Text style={accountStyle.subTabButtonText}>{global.i18n.t("AccountDetailComponent_settings")}</Text>
              </View>
            </View>
          </OneTabButtonComponent>}
          {this.state.subTab !== SubTabs.settings && <OneTabButtonComponent style={[accountStyle.subTabButton, {
            backgroundColor: '#F5F5F5',
            zIndex: 0,
          }]} onPress={() => this.switchSubTab(SubTabs.settings)}>
            <View style={accountStyle.subTabButtonArea}>
              <View style={[accountStyle.activeSubTabBar, { backgroundColor: '#F5F5F5' }]}></View>
              <View style={accountStyle.subTabButtonTextArea}>
                <Text style={[accountStyle.subTabButtonText, { color: '#C1C1C1' }]}>{global.i18n.t("AccountDetailComponent_settings")}</Text>
              </View>
            </View>
          </OneTabButtonComponent>}

          {this.state.subTab === SubTabs.authorized && <OneTabButtonComponent style={[accountStyle.subTabButton, {
            shadowOffset: { width: -2 },
            shadowOpacity: 0.15,
          }]}>
            <View style={accountStyle.subTabButtonArea}>
              <View style={[accountStyle.activeSubTabBar, { backgroundColor: '#0060F2' }]}></View>
              <View style={accountStyle.subTabButtonTextArea}>
                <Text style={accountStyle.subTabButtonText}>{global.i18n.t("AccountDetailComponent_authorized")}</Text>
              </View>
            </View>
          </OneTabButtonComponent>}
          {this.state.subTab !== SubTabs.authorized && <OneTabButtonComponent style={[accountStyle.subTabButton, {
            backgroundColor: '#F5F5F5',
            zIndex: 0,
          }]} onPress={() => this.switchSubTab(SubTabs.authorized)}>
            <View style={accountStyle.subTabButtonArea}>
              <View style={[accountStyle.activeSubTabBar, { backgroundColor: '#F5F5F5' }]}></View>
              <View style={accountStyle.subTabButtonTextArea}>
                <Text style={[accountStyle.subTabButtonText, { color: '#C1C1C1' }]}>{global.i18n.t("AccountDetailComponent_authorized")}</Text>
              </View>
            </View>
          </OneTabButtonComponent>}
        </View>

        <ScrollView style={[accountStyle.scrollSubTabArea]} contentContainerStyle={{ flexGrow: 1 }}>
          {this.state.subTab === SubTabs.settings && <View style={accountStyle.contentSubTab}>
            <View style={{ flex: 1, borderBottomWidth: 1, borderBottomColor: "#A4B5CD" }}>
              <View style={{ width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 27, }}>
                <Text style={accountStyle.accountNumberLabel}>{global.i18n.t("AccountDetailComponent_accountNumberLabel")}</Text>
                <OneTabButtonComponent style={{ padding: 4, paddingRight: 0 }} onPress={() => {
                  EventEmitterService.emit(EventEmitterService.events.APP_SHOW_COVER, { type: 'AccountQrCodeComponent' });
                }}>
                  <Image style={{ width: 19, height: 19, resizeMode: 'contain', }} source={require('assets/imgs/qr-code-icon.png')} />
                </OneTabButtonComponent>
              </View>

              <OneTabButtonComponent style={accountStyle.accountNumberArea} onPress={() => {
                Clipboard.setString(this.props.userInformation ? this.props.userInformation.bitmarkAccountNumber : '');
                this.setState({ accountNumberCopyText: global.i18n.t("AccountDetailComponent_copiedToClipboard") });
                setTimeout(() => { this.setState({ accountNumberCopyText: '' }) }, 1000);
              }}>
                <Text style={accountStyle.accountNumberValue}>{this.props.userInformation ? this.props.userInformation.bitmarkAccountNumber : ''}</Text>
              </OneTabButtonComponent>
              <View style={accountStyle.accountNumberBar}>
                <Text style={accountStyle.accountNumberCopyButtonText}>{this.state.accountNumberCopyText}</Text>
              </View>

              <Text style={accountStyle.accountMessage}>{global.i18n.t("AccountDetailComponent_accountMessage")}</Text>

              <OneTabButtonComponent style={accountStyle.accountWriteDownButton} onPress={Actions.recoveryPhrase}>
                <Text style={accountStyle.accountWriteDownButtonText}>{global.i18n.t("AccountDetailComponent_writeDownRecoveryPhrase")} »</Text>
              </OneTabButtonComponent>
              {/* <OneTabButtonComponent style={accountStyle.accountRemoveButton} onPress={this.logout.bind(this)}> */}
              <OneTabButtonComponent style={accountStyle.accountRemoveButton} onPress={() => Actions.recoveryPhrase({ isSignOut: true, logout: this.logout.bind(this) })}>
                <Text style={accountStyle.accountRemoveButtonText}>{global.i18n.t("AccountDetailComponent_removeAccessFromThisDevice")} »</Text>
              </OneTabButtonComponent>

              <OneTabButtonComponent style={accountStyle.accountRemoveButton} onPress={Actions.applicationDetail}>
                <Text style={accountStyle.accountRemoveButtonText}>{global.i18n.t("AccountDetailComponent_appDetails")} »</Text>
              </OneTabButtonComponent>

              {/* <OneTabButtonComponent style={accountStyle.accountRemoveButton} onPress={Actions.webAccountMigrate}>
                <Text style={accountStyle.accountRemoveButtonText}>{global.i18n.t("AccountDetailComponent_migrateWebAccount")} » </Text>
              </OneTabButtonComponent>

              <OneTabButtonComponent style={accountStyle.accountRemoveButton} onPress={Actions.webAccountSignIn}>
                <Text style={accountStyle.accountRemoveButtonText}>{global.i18n.t("AccountDetailComponent_signInUsingMobileApp")} » </Text>
              </OneTabButtonComponent> */}
            </View>
            <OneTabButtonComponent style={[accountStyle.accountRemoveButton, { height: 45 }]} onPress={() => {
              Intercom.displayConversationsList();
            }}>
              <Text style={accountStyle.accountRemoveButtonText}>{global.i18n.t("AccountDetailComponent_needHelp")}</Text>
            </OneTabButtonComponent>
          </View>}

          {this.state.subTab === SubTabs.authorized && <View style={accountStyle.contentSubTab}>
            <View style={accountStyle.dataSourcesArea}>
              <Text style={accountStyle.noAuthorizedMessage}>{global.i18n.t("AccountDetailComponent_noAuthorizedMessage")} </Text>
              {this.props.appLoadingData && <ActivityIndicator size="large" style={{ marginTop: 46, }} />}
            </View>
          </View>}
        </ScrollView>
      </SafeAreaView >
    );
  }
}

PrivateAccountDetailComponent.propTypes = {
  userInformation: PropTypes.any,
  iftttInformation: PropTypes.any,
  appLoadingData: PropTypes.bool,
  subTab: PropTypes.string,
}


const StoreAccountDetailComponent = connect(
  (state) => {
    return state.data;
  },
)(PrivateAccountDetailComponent);

export class AccountDetailComponent extends React.Component {
  static propTypes = {
    subTab: PropTypes.string,
  }
  constructor(props) {
    super(props);
  }
  render() {
    return (
      <View style={{ flex: 1 }}>
        <Provider store={AccountStore}>
          <StoreAccountDetailComponent subTab={this.props.subTab} />
        </Provider>
      </View>
    );
  }
}

