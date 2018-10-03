import React from 'react';
import { Provider, connect } from 'react-redux';
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
import { AccountStore } from '../../../stores';

const SubTabs = {
  settings: 'SETTINGS',
  authorized: 'AUTHORIZED',
}
class PrivateAccountDetailComponent extends React.Component {
  constructor(props) {
    super(props);
    this.revokeIFTTT = this.revokeIFTTT.bind(this);

    let subTab = (this.props.screenProps.subTab &&
      (this.props.screenProps.subTab === SubTabs.settings || this.props.screenProps.subTab === SubTabs.authorized))
      ? this.props.screenProps.subTab : SubTabs.settings;

    this.state = {
      subTab,
      accountNumberCopyText: '',
    };

    if (this.props.screenProps.goToRecoveryPhase) {
      this.props.navigation.navigate('AccountRecovery', { isSignOut: false });
      this.props.screenProps.removeGoingToRecoveryPhase();
    }
  }

  switchSubTab(subTab) {
    this.setState({ subTab, });
  }

  revokeIFTTT() {
    Alert.alert('Are you sure you want to revoke access to your IFTTT?', '', [{
      style: 'cancel',
      text: 'Cancel',
    }, {
      text: 'Yes',
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
          <Text style={defaultStyle.headerTitle}>ACCOUNT</Text>
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
                <Text style={accountStyle.subTabButtonText}>{SubTabs.settings.toUpperCase()}</Text>
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
                <Text style={[accountStyle.subTabButtonText, { color: '#C1C1C1' }]}>{SubTabs.settings.toUpperCase()}</Text>
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
                <Text style={accountStyle.subTabButtonText}>{SubTabs.authorized.toUpperCase()}</Text>
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
                <Text style={[accountStyle.subTabButtonText, { color: '#C1C1C1' }]}>{SubTabs.authorized.toUpperCase()}</Text>
              </View>
            </View>
          </TouchableOpacity>}
        </View>

        <ScrollView style={[accountStyle.scrollSubTabArea]}>
          <TouchableOpacity activeOpacity={1} style={{ flex: 1 }}>
            {this.state.subTab === SubTabs.settings && <View style={accountStyle.contentSubTab}>
              <Text style={accountStyle.accountNumberLabel}>{'YOUR Bitmark Account Number'.toUpperCase()}</Text>

              <TouchableOpacity style={accountStyle.accountNumberArea} onPress={() => {
                Clipboard.setString(this.props.userInformation.bitmarkAccountNumber);
                this.setState({ accountNumberCopyText: 'Copied to clipboard!' });
                setTimeout(() => { this.setState({ accountNumberCopyText: '' }) }, 1000);
              }}>
                <Text style={accountStyle.accountNumberValue}>{this.props.userInformation.bitmarkAccountNumber}</Text>
              </TouchableOpacity>
              <View style={accountStyle.accountNumberBar}>
                <Text style={accountStyle.accountNumberCopyButtonText}>{this.state.accountNumberCopyText}</Text>
              </View>

              <Text style={accountStyle.accountMessage}>To protect your privacy, you are identified in the Bitmark system by a pseudonymous account number. This number is public. You can safely share it with others without compromising your security.</Text>

              <TouchableOpacity style={accountStyle.accountWriteDownButton} onPress={() => { this.props.navigation.navigate('AccountRecovery', { isSignOut: false }) }}>
                <Text style={accountStyle.accountWriteDownButtonText}>{'WRITE DOWN RECOVERY PHRASE »'.toUpperCase()} </Text>
              </TouchableOpacity>
              {/* <TouchableOpacity style={accountStyle.accountRemoveButton} onPress={this.props.screenProps.logout}> */}
              <TouchableOpacity style={accountStyle.accountRemoveButton} onPress={() => { this.props.navigation.navigate('AccountRecovery', { isSignOut: true }) }}>
                <Text style={accountStyle.accountRemoveButtonText}>{'Remove access from this device »'.toUpperCase()} </Text>
              </TouchableOpacity>

              <TouchableOpacity style={accountStyle.accountRemoveButton} onPress={() => { this.props.navigation.navigate('WebAccountMigrate') }}>
                <Text style={accountStyle.accountRemoveButtonText}>{'MIGRATE WEB ACCOUNT »'.toUpperCase()} </Text>
              </TouchableOpacity>

              <TouchableOpacity style={accountStyle.accountRemoveButton} onPress={() => { this.props.navigation.navigate('WebAccountSignIn') }}>
                <Text style={accountStyle.accountRemoveButtonText}>{'SIGN IN USING MOBILE APP »'.toUpperCase()} </Text>
              </TouchableOpacity>
            </View>}

            {this.state.subTab === SubTabs.authorized && <View style={accountStyle.contentSubTab}>
              <View style={accountStyle.dataSourcesArea}>
                <Text style={accountStyle.noAuthorizedMessage}>If you authorize 3rd-party apps to access your Bitmark account, they will appear here. </Text>
                {this.props.iftttInformation && this.props.iftttInformation.connectIFTTT && <View style={accountStyle.authorizedItem}>
                  <View style={accountStyle.authorizedItemTitle}>
                    <Text style={accountStyle.authorizedItemTitleText} >IFTTT</Text>
                    <TouchableOpacity style={accountStyle.authorizedItemRemoveButton} onPress={this.revokeIFTTT}>
                      <Text style={accountStyle.authorizedItemRemoveButtonText}>REMOVE</Text>
                    </TouchableOpacity>
                  </View>

                  <View style={accountStyle.authorizedItemDescription}>
                    <Image style={accountStyle.authorizedItemDescriptionIcon} source={require('./../../../../assets/imgs/ifttt-icon.png')} />
                    <View style={accountStyle.authorizedItemDescriptionDetail}>
                      <Text style={accountStyle.authorizedItemDescriptionText}>Can:{'\n'}Deliver registration requests{'\n'}Trigger when applets run.</Text>
                      <TouchableOpacity style={accountStyle.authorizedViewButton} onPress={() => {
                        this.props.screenProps.homeNavigation.navigate('IftttActive', { stage: 'view' })
                      }}>
                        <Text style={accountStyle.authorizedViewButtonText}>{'VIEW APPLETS » '.toUpperCase()} </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>}
                {this.props.appLoadingData && <ActivityIndicator size="large" style={{ marginTop: 46, }} />}
              </View>
            </View>}
          </TouchableOpacity>
        </ScrollView>
      </View >
    );
  }
}

PrivateAccountDetailComponent.propTypes = {
  userInformation: PropTypes.any,
  iftttInformation: PropTypes.any,
  appLoadingData: PropTypes.bool,
  navigation: PropTypes.shape({
    navigate: PropTypes.func,
    goBack: PropTypes.func,
  }),
  screenProps: PropTypes.shape({
    removeGoingToRecoveryPhase: PropTypes.func,
    goToRecoveryPhase: PropTypes.func,
    logout: PropTypes.func,
    subTab: PropTypes.string,
    homeNavigation: PropTypes.shape({
      navigate: PropTypes.func,
      goBack: PropTypes.func,
    }),
  }),
}


const StoreAccountDetailComponent = connect(
  (state) => {
    return state.data;
  },
)(PrivateAccountDetailComponent);

export class AccountDetailComponent extends React.Component {
  static propTypes = {
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
  constructor(props) {
    super(props);
  }
  render() {
    return (
      <View style={{ flex: 1 }}>
        <Provider store={AccountStore}>
          <StoreAccountDetailComponent
            screenProps={this.props.screenProps} navigation={this.props.navigation} />
        </Provider>
      </View>
    );
  }
}

