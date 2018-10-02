import React from 'react';
import PropTypes from 'prop-types';
import {
  View, Text, TouchableOpacity, ScrollView, Image, ActivityIndicator,
  Clipboard,
  Alert,
} from 'react-native';

import { EventEmitterService } from "./../../../services";
import accountStyle from './account.component.style';

import defaultStyle from './../../../commons/styles';
import { DataProcessor, AppProcessor } from '../../../processors';

const SubTabs = {
  settings: 'SETTINGS',
  authorized: 'AUTHORIZED',
}
let ComponentName = 'AccountDetailComponent';
export class AccountDetailComponent extends React.Component {
  constructor(props) {
    super(props);
    this.handerChangeUserInfo = this.handerChangeUserInfo.bind(this);
    this.handerLoadingData = this.handerLoadingData.bind(this);
    this.revokeIFTTT = this.revokeIFTTT.bind(this);
    this.handerChangeIftttInformation = this.handerChangeIftttInformation.bind(this);

    EventEmitterService.remove(EventEmitterService.events.CHANGE_USER_DATA_IFTTT_INFORMATION, null, ComponentName);
    EventEmitterService.remove(EventEmitterService.events.CHANGE_USER_INFO, null, ComponentName);
    EventEmitterService.remove(EventEmitterService.events.APP_LOADING_DATA, null, ComponentName);

    let subTab = (this.props.screenProps.subTab &&
      (this.props.screenProps.subTab === SubTabs.settings || this.props.screenProps.subTab === SubTabs.authorized))
      ? this.props.screenProps.subTab : SubTabs.settings;

    this.state = {
      subTab,
      accountNumberCopyText: '',
      notificationUUIDCopyText: 'COPY',
      userInfo: DataProcessor.getUserInformation(),
      iftttInformation: null,
      appLoadingData: DataProcessor.isAppLoadingData(),
      gettingData: true,
    };
    let doGetScreenData = async () => {
      let iftttInformation = await DataProcessor.doGetIftttInformation();
      this.setState({ iftttInformation, gettingData: false });
    }
    doGetScreenData();

    if (this.props.screenProps.goToRecoveryPhase) {
      this.props.navigation.navigate('AccountRecovery', { isSignOut: false });
      this.props.screenProps.removeGoingToRecoveryPhase();
    }
  }

  componentDidMount() {
    EventEmitterService.on(EventEmitterService.events.CHANGE_USER_INFO, this.handerChangeUserInfo, ComponentName);
    EventEmitterService.on(EventEmitterService.events.CHANGE_USER_DATA_IFTTT_INFORMATION, this.handerChangeIftttInformation, ComponentName);
    EventEmitterService.on(EventEmitterService.events.APP_LOADING_DATA, this.handerLoadingData, ComponentName);
  }

  handerChangeIftttInformation(iftttInformation) {
    this.setState({ iftttInformation });
  }
  handerChangeUserInfo(userInfo) {
    this.setState({ userInfo });
  }
  handerLoadingData() {
    this.setState({ appLoadingData: DataProcessor.isAppLoadingData() });
  }

  switchSubTab(subTab) {
    this.setState({ subTab, });
  }

  revokeIFTTT() {
    Alert.alert(global.i18n.t("AccountDetailComponent_areYouSureYouWantToRevokeAccessToYourIfttt"), '', [{
      style: 'cancel',
      text: global.i18n.t("AccountDetailComponent_cancel"),
    }, {
      text: global.i18n.t("AccountDetailComponent_yes"),
      onPress: () => {
        AppProcessor.doRevokeIftttToken().then((result) => {
          if (result) {
            DataProcessor.doReloadUserData();
            this.props.navigation.goBack();
          }
        }).catch(error => {
          EventEmitterService.emit(EventEmitterService.events.APP_PROCESS_ERROR, { error });
          console.log('doRevokeIftttToken error :', error);
        });
      }
    }]);
  }

  render() {
    return (
      <View style={accountStyle.body}>
        <View style={accountStyle.header}>
          <TouchableOpacity style={defaultStyle.headerLeft} onPress={() => this.props.navigation.navigate('ScanQRCode')}>
            <Image style={accountStyle.cameraIcon} source={require('./../../../../assets/imgs/camera.png')} />
          </TouchableOpacity>
          <Text style={defaultStyle.headerTitle}>{global.i18n.t("AccountDetailComponent_account")}</Text>
          <TouchableOpacity style={defaultStyle.headerRight} onPress={() => {
            this.props.navigation.navigate('ApplicationDetail');
          }}>
            <Image style={accountStyle.bitmarkAccountHelpIcon} source={require('./../../../../assets/imgs/icon_help.png')} />
          </TouchableOpacity>
        </View>
        <View style={accountStyle.subTabArea}>
          {this.state.subTab === SubTabs.settings && <TouchableOpacity style={[accountStyle.subTabButton, {
            shadowOffset: { width: 2 },
            shadowOpacity: 0.15,
          }]}>
            <View style={accountStyle.subTabButtonArea}>
              <View style={[accountStyle.activeSubTabBar, { backgroundColor: '#0060F2' }]}></View>
              <View style={accountStyle.subTabButtonTextArea}>
                <Text style={accountStyle.subTabButtonText}>{global.i18n.t("AccountDetailComponent_settings")}</Text>
              </View>
            </View>
          </TouchableOpacity>}
          {this.state.subTab !== SubTabs.settings && <TouchableOpacity style={[accountStyle.subTabButton, {
            backgroundColor: '#F5F5F5',
            zIndex: 0,
          }]} onPress={() => this.switchSubTab(SubTabs.settings)}>
            <View style={accountStyle.subTabButtonArea}>
              <View style={[accountStyle.activeSubTabBar, { backgroundColor: '#F5F5F5' }]}></View>
              <View style={accountStyle.subTabButtonTextArea}>
                <Text style={[accountStyle.subTabButtonText, { color: '#C1C1C1' }]}>{global.i18n.t("AccountDetailComponent_settings")}</Text>
              </View>
            </View>
          </TouchableOpacity>}

          {this.state.subTab === SubTabs.authorized && <TouchableOpacity style={[accountStyle.subTabButton, {
            shadowOffset: { width: -2 },
            shadowOpacity: 0.15,
          }]}>
            <View style={accountStyle.subTabButtonArea}>
              <View style={[accountStyle.activeSubTabBar, { backgroundColor: '#0060F2' }]}></View>
              <View style={accountStyle.subTabButtonTextArea}>
                <Text style={accountStyle.subTabButtonText}>{global.i18n.t("AccountDetailComponent_authorized")}</Text>
              </View>
            </View>
          </TouchableOpacity>}
          {this.state.subTab !== SubTabs.authorized && <TouchableOpacity style={[accountStyle.subTabButton, {
            backgroundColor: '#F5F5F5',
            zIndex: 0,
          }]} onPress={() => this.switchSubTab(SubTabs.authorized)}>
            <View style={accountStyle.subTabButtonArea}>
              <View style={[accountStyle.activeSubTabBar, { backgroundColor: '#F5F5F5' }]}></View>
              <View style={accountStyle.subTabButtonTextArea}>
                <Text style={[accountStyle.subTabButtonText, { color: '#C1C1C1' }]}>{global.i18n.t("AccountDetailComponent_authorized")}</Text>
              </View>
            </View>
          </TouchableOpacity>}
        </View>

        <ScrollView style={[accountStyle.scrollSubTabArea]}>
          <TouchableOpacity activeOpacity={1} style={{ flex: 1 }}>
            {this.state.subTab === SubTabs.settings && <View style={accountStyle.contentSubTab}>
              <Text style={accountStyle.accountNumberLabel}>{global.i18n.t("AccountDetailComponent_accountNumberLabel")}</Text>

              <TouchableOpacity style={accountStyle.accountNumberArea} onPress={() => {
                Clipboard.setString(this.state.userInfo.bitmarkAccountNumber);
                this.setState({ accountNumberCopyText: global.i18n.t("AccountDetailComponent_copiedToClipboard") });
                setTimeout(() => { this.setState({ accountNumberCopyText: '' }) }, 1000);
              }}>
                <Text style={accountStyle.accountNumberValue}>{this.state.userInfo.bitmarkAccountNumber}</Text>
              </TouchableOpacity>
              <View style={accountStyle.accountNumberBar}>
                <Text style={accountStyle.accountNumberCopyButtonText}>{this.state.accountNumberCopyText}</Text>
              </View>

              <Text style={accountStyle.accountMessage}>{global.i18n.t("AccountDetailComponent_accountMessage")}</Text>

              <TouchableOpacity style={accountStyle.accountWriteDownButton} onPress={() => { this.props.navigation.navigate('AccountRecovery', { isSignOut: false }) }}>
                <Text style={accountStyle.accountWriteDownButtonText}>{global.i18n.t("AccountDetailComponent_writeDownRecoveryPhrase")} » </Text>
              </TouchableOpacity>
              {/* <TouchableOpacity style={accountStyle.accountRemoveButton} onPress={this.props.screenProps.logout}> */}
              <TouchableOpacity style={accountStyle.accountRemoveButton} onPress={() => { this.props.navigation.navigate('AccountRecovery', { isSignOut: true }) }}>
                <Text style={accountStyle.accountRemoveButtonText}>{global.i18n.t("AccountDetailComponent_removeAccessFromThisDevice")} » </Text>
              </TouchableOpacity>

              <TouchableOpacity style={accountStyle.accountRemoveButton} onPress={() => { this.props.navigation.navigate('WebAccountMigrate') }}>
                <Text style={accountStyle.accountRemoveButtonText}>{global.i18n.t("AccountDetailComponent_migrateWebAccount")} » </Text>
              </TouchableOpacity>

              <TouchableOpacity style={accountStyle.accountRemoveButton} onPress={() => { this.props.navigation.navigate('WebAccountSignIn') }}>
                <Text style={accountStyle.accountRemoveButtonText}>{global.i18n.t("AccountDetailComponent_signInUsingMobileApp")} » </Text>
              </TouchableOpacity>
            </View>}

            {this.state.subTab === SubTabs.authorized && <View style={accountStyle.contentSubTab}>
              <View style={accountStyle.dataSourcesArea}>
                <Text style={accountStyle.noAuthorizedMessage}>{global.i18n.t("AccountDetailComponent_noAuthorizedMessage")} </Text>
                {this.state.iftttInformation && this.state.iftttInformation.connectIFTTT && <View style={accountStyle.authorizedItem}>
                  <View style={accountStyle.authorizedItemTitle}>
                    <Text style={accountStyle.authorizedItemTitleText} >IFTTT</Text>
                    <TouchableOpacity style={accountStyle.authorizedItemRemoveButton} onPress={this.revokeIFTTT}>
                      <Text style={accountStyle.authorizedItemRemoveButtonText}>{global.i18n.t("AccountDetailComponent_remove")}</Text>
                    </TouchableOpacity>
                  </View>

                  <View style={accountStyle.authorizedItemDescription}>
                    <Image style={accountStyle.authorizedItemDescriptionIcon} source={require('./../../../../assets/imgs/ifttt-icon.png')} />
                    <View style={accountStyle.authorizedItemDescriptionDetail}>
                      <Text style={accountStyle.authorizedItemDescriptionText}>{global.i18n.t("AccountDetailComponent_authorizedItemDescriptionText")}</Text>
                      <TouchableOpacity style={accountStyle.authorizedViewButton} onPress={() => {
                        this.props.screenProps.homeNavigation.navigate('IftttActive', { stage: 'view' })
                      }}>
                        <Text style={accountStyle.authorizedViewButtonText}>{global.i18n.t("AccountDetailComponent_viewApplets")} »  </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>}
                {(this.state.appLoadingData || this.state.gettingData) && <ActivityIndicator size="large" style={{ marginTop: 46, }} />}
              </View>
            </View>}
          </TouchableOpacity>
        </ScrollView>
      </View >
    );
  }
}

AccountDetailComponent.propTypes = {
  navigation: PropTypes.shape({
    navigate: PropTypes.func,
    goBack: PropTypes.func,
  }),
  screenProps: PropTypes.shape({
    logout: PropTypes.func,
    subTab: PropTypes.string,
    homeNavigation: PropTypes.shape({
      navigate: PropTypes.func,
      goBack: PropTypes.func,
    }),
  }),
}