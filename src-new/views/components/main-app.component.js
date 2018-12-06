
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ReactNative from 'react-native';
const {
  Linking,
  Alert,
  View,
} = ReactNative;


import { DefaultRouterComponent } from './onboarding';
import { UserRouterComponent } from './home';
import { MainAppHandlerComponent } from './main-app-handler.component';
import { CodePushUpdateComponent } from './code-push/code-push.component';
import CodePush from 'react-native-code-push';
import { EventEmitterService, AppProcessor, DataProcessor, CommonModel } from 'src-new/processors';
import { config } from 'src-new/configs';
import { LoadingComponent } from '../commons';

export class BitmarkAppComponent extends Component {
  static propTypes = {
    message: PropTypes.string,
  };

  constructor(props) {
    super(props);

    this.doOpenApp = this.doOpenApp.bind(this);
    this.doAppRefresh = this.doAppRefresh.bind(this);

    this.state = {
      user: null,
      networkStatus: true,
    };
  }

  componentDidMount() {
    EventEmitterService.on(EventEmitterService.events.APP_NETWORK_CHANGED, this.doOpenApp);
  }
  componentWillUnmount() {
    EventEmitterService.remove(EventEmitterService.events.APP_NETWORK_CHANGED, this.doOpenApp);
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (!this.state.user || this.state.user.bitmarkAccountNumber !== nextState.user.bitmarkAccountNumber) {
      return true;
    }
    return false;
  }

  doOpenApp({ networkStatus, justCreatedBitmarkAccount }) {
    if (!networkStatus) {
      return;
    }
    AppProcessor.doCheckNoLongerSupportVersion().then((result) => {
      if (!result) {
        Alert.alert(global.i18n.t("MainComponent_newVersionAvailableTitle"), global.i18n.t("MainComponent_newVersionAvailableMessage"), [{
          text: global.i18n.t("MainComponent_visitAppstore"),
          onPress: () => Linking.openURL(config.appLink)
        }]);
        return;
      }
      this.doAppRefresh(justCreatedBitmarkAccount);
    }).catch(error => {
      console.log('doOpenApp error:', error);
    });
  }
  doAppRefresh(justCreatedBitmarkAccount) {
    DataProcessor.doCheckHaveCodePushUpdate().then(updated => {
      if (updated) {
        return DataProcessor.doOpenApp(justCreatedBitmarkAccount).then(user => {
          user = user || {};
          this.setState({ user });
          if (user && user.bitmarkAccountNumber) {
            CommonModel.doCheckPasscodeAndFaceTouchId().then(ok => {
              if (ok) {
                AppProcessor.doStartBackgroundProcess(justCreatedBitmarkAccount);
              } else {
                if (!this.requiringTouchId) {
                  this.requiringTouchId = true;
                  Alert.alert(global.i18n.t("MainComponent_pleaseEnableYourTouchIdMessage"), '', [{
                    text: global.i18n.t("MainComponent_enable"),
                    style: 'cancel',
                    onPress: () => {
                      Linking.openURL('app-settings:');
                      this.requiringTouchId = false;
                    }
                  }]);
                }
              }
            });
          }
        }).catch(error => {
          console.log('doAppRefresh error:', error);
        });
      }
    });
  }

  render() {
    let DisplayComponent = LoadingComponent;
    if (this.state.user) {
      DisplayComponent = this.state.user.bitmarkAccountNumber ? UserRouterComponent : DefaultRouterComponent;
    }
    return (

      <View style={{ flex: 1 }}>
        <DisplayComponent />
        <MainAppHandlerComponent />
      </View>
    );
  }
}

export class MainAppComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      status: null,
      progress: 0,
    };

    CodePush.checkForUpdate().then((needUpdate) => {
      console.log('checkForUpdate  :', needUpdate);
      DataProcessor.setCodePushUpdated(!needUpdate);
    }).catch(error => {
      DataProcessor.setCodePushUpdated(true);
      console.log('checkForUpdate error :', error);
    });
    CodePush.getCurrentPackage().then(updateInfo => {
      console.log('current package :', updateInfo);
    }).catch(error => {
      console.log('getCurrentPackage error :', error);
    });
  }

  codePushStatusDidChange(status) {
    switch (status) {
      case CodePush.SyncStatus.CHECKING_FOR_UPDATE:
        this.setState({ status: 'checking' });
        break;
      case CodePush.SyncStatus.DOWNLOADING_PACKAGE:
        this.setState({ status: 'downloading' });
        break;
      case CodePush.SyncStatus.INSTALLING_UPDATE:
        this.setState({ status: 'installing' });
        break;
      case CodePush.SyncStatus.UP_TO_DATE:
        this.setState({ status: 'updated' });
        break;
      case CodePush.SyncStatus.UPDATE_INSTALLED:
        this.setState({ status: 'updated' });
        break;
    }
  }

  codePushDownloadDidProgress(progress) {
    this.setState({ progress: Math.floor(progress.receivedBytes * 100 / progress.totalBytes) });
    console.log(Math.floor(progress.receivedBytes * 100 / progress.totalBytes));
  }

  render() {
    return (
      <View style={{ flex: 1 }}>
        <CodePushUpdateComponent shouldRender={this.state.status && (this.state.status === 'downloading' || this.state.status === 'installing')}
          status={this.state.status} progress={this.state.progress} />
        <BitmarkAppComponent />
      </View>
    );
  }
}
