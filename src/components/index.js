
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ReactNative from 'react-native';
import KeepAwake from 'react-native-keep-awake';
import DeviceInfo from 'react-native-device-info';

// import PushNotification from 'react-native-push-notification';

const {
  Linking,
  Alert,
  AppState,
  NetInfo,
  // PushNotificationIOS,
  View,
} = ReactNative;

import {
  LoadingComponent,
  DefaultIndicatorComponent,
  BitmarkIndicatorComponent,
  BitmarkInternetOffComponent,
} from './../commons/components';
import { EventEmitterService } from './../services';
import { AppProcessor, DataProcessor } from '../processors';
import { CommonModel, UserModel } from '../models';
import { setJSExceptionHandler, setNativeExceptionHandler } from 'react-native-exception-handler';
import RNExitApp from 'react-native-exit-app';
import Mailer from 'react-native-mail';
import { FileUtil } from "../utils";
import { config } from '../configs';
import { iosConstant } from '../configs/ios/ios.config';
import { DefaultRouterComponent } from './onboarding';
import { UserRouterComponent } from './home';

const CRASH_LOG_FILE_NAME = 'crash_log.txt';
const CRASH_LOG_FILE_PATH = FileUtil.CacheDirectory + '/' + CRASH_LOG_FILE_NAME;
const ERROR_LOG_FILE_NAME = 'error_log.txt';
const ERROR_LOG_FILE_PATH = FileUtil.CacheDirectory + '/' + ERROR_LOG_FILE_NAME;

class MainEventsHandlerComponent extends Component {
  constructor(props) {
    super(props);

    this.handleDeppLink = this.handleDeppLink.bind(this);
    this.handleAppStateChange = this.handleAppStateChange.bind(this);
    this.handerProcessingEvent = this.handerProcessingEvent.bind(this);
    this.handerSubmittingEvent = this.handerSubmittingEvent.bind(this);
    this.handleNetworkChange = this.handleNetworkChange.bind(this);
    this.handerProcessErrorEvent = this.handerProcessErrorEvent.bind(this);
    this.doTryConnectInternet = this.doTryConnectInternet.bind(this);

    this.state = {
      user: null,
      processingCount: 0,
      submitting: null,
      networkStatus: true,
    };
    this.appState = AppState.currentState;
  }

  componentDidMount() {
    EventEmitterService.on(EventEmitterService.events.APP_PROCESSING, this.handerProcessingEvent);
    EventEmitterService.on(EventEmitterService.events.APP_SUBMITTING, this.handerSubmittingEvent);
    EventEmitterService.on(EventEmitterService.events.APP_PROCESS_ERROR, this.handerProcessErrorEvent);
    Linking.addEventListener('url', this.handleDeppLink);
    AppState.addEventListener('change', this.handleAppStateChange);
    NetInfo.isConnected.fetch().then().done(() => {
      NetInfo.isConnected.addEventListener('connectionChange', this.handleNetworkChange);
    });

    // Handle Crashes
    this.checkAndShowCrashLog();
    this.registerCrashHandler();
  }
  componentWillUnmount() {
    EventEmitterService.remove(EventEmitterService.events.APP_PROCESSING, this.handerProcessingEvent);
    EventEmitterService.remove(EventEmitterService.events.APP_SUBMITTING, this.handerSubmittingEvent);
    EventEmitterService.remove(EventEmitterService.events.APP_PROCESS_ERROR, this.handerProcessErrorEvent);
    Linking.addEventListener('url', this.handleDeppLink);
    AppState.removeEventListener('change', this.handleAppStateChange);
    NetInfo.isConnected.removeEventListener('connectionChange', this.handleNetworkChange);
  }

  handerProcessingEvent(processing) {
    let processingCount = this.state.processingCount + (processing ? 1 : -1);
    processingCount = processingCount < 0 ? 0 : processingCount;
    this.setState({ processingCount });

    if (processingCount === 1) {
      KeepAwake.activate();
    } else if (processingCount === 0) {
      KeepAwake.deactivate();
    }

  }

  registerCrashHandler() {
    // Handle JS error
    const jsErrorHandler = async (error, isFatal) => {
      if (error && isFatal) {
        let userInformation = await UserModel.doGetCurrentUser();
        let crashLog = `${error.name} : ${error.message}\r\n${error.stack ? error.stack : ''}`;
        crashLog = `${userInformation.bitmarkAccountNumber ? 'Bitmark account number:' + userInformation.bitmarkAccountNumber + '\r\n' : ''}${crashLog}`;

        console.log('Unexpected JS error:', crashLog);

        await FileUtil.create(CRASH_LOG_FILE_PATH, crashLog);
        RNExitApp.exitApp();
      }
    };
    setJSExceptionHandler(jsErrorHandler, false);

    // Handle native code error
    setNativeExceptionHandler(async (exceptionString) => {
      let userInformation = await UserModel.doGetCurrentUser();
      let crashLog = `${userInformation.bitmarkAccountNumber ? 'Bitmark account number:' + userInformation.bitmarkAccountNumber + '\r\n' : ''}${exceptionString}`;
      console.log('Unexpected Native Code error:', crashLog);

      await FileUtil.create(CRASH_LOG_FILE_PATH, crashLog);
    });
  }

  async checkAndShowCrashLog() {
    //let crashLog = await CommonModel.doGetLocalData(CommonModel.KEYS.CRASH_LOG);
    let hasCrashLog = await FileUtil.exists(CRASH_LOG_FILE_PATH);

    if (hasCrashLog) {
      let title = global.i18n.t("MainComponent_crashReportTitle");
      let message = global.i18n.t("MainComponent_crashReportMessage");

      Alert.alert(title, message, [{
        text: global.i18n.t("MainComponent_cancel"),
        style: 'cancel',
        onPress: () => {
          FileUtil.removeSafe(CRASH_LOG_FILE_PATH);
        }
      }, {
        text: global.i18n.t("MainComponent_send"),
        onPress: () => {
          this.sendReport(CRASH_LOG_FILE_PATH, CRASH_LOG_FILE_NAME);
        }
      }]);
    }
  }

  sendReport(logFilePath, attachmentName) {
    Mailer.mail({
      subject: (attachmentName == CRASH_LOG_FILE_NAME) ? 'Crash Report' : 'Error Report',
      recipients: ['support@bitmark.com'],
      body: `App version: ${DataProcessor.getApplicationVersion()} (${DataProcessor.getApplicationBuildNumber()})`,
      attachment: {
        path: logFilePath,
        type: 'doc',
        name: attachmentName,
      }
    }, (error) => {
      if (error) {
        Alert.alert(global.i18n.t("MainComponent_error"), global.i18n.t("MainComponent_couldNotSendMail"));
      }

      // Remove crash/error log file
      FileUtil.removeSafe(logFilePath);
    });
  }

  handerProcessErrorEvent(processError) {
    if (processError && (processError.title || processError.message)) {
      this.handleDefaultJSError(processError);
    } else {
      this.handleUnexpectedJSError(processError);
    }
  }

  handleDefaultJSError(processError) {
    let title = processError.title;
    let message = processError.message;

    Alert.alert(title, message, [{
      text: global.i18n.t("MainComponent_ok"),
      style: 'cancel',
      onPress: () => {
        if (processError && processError.onClose) {
          processError.onClose();
        }
      }
    }]);
  }

  handleUnexpectedJSError(processError) {
    let title = global.i18n.t("MainComponent_errorReportTitle");
    let message = global.i18n.t("MainComponent_errorReportMessage");

    Alert.alert(title, message, [{
      text: global.i18n.t("MainComponent_cancel"),
      style: 'cancel',
      onPress: () => {
        if (processError && processError.onClose) {
          processError.onClose();
        }
      }
    }, {
      text: global.i18n.t("MainComponent_send"),
      onPress: async () => {
        // Write error to log file
        let error = processError.error || new Error('There was an error');
        let userInformation = await UserModel.doGetCurrentUser();
        let errorLog = `${error.name} : ${error.message}\r\n${error.stack ? error.stack : ''}`;
        errorLog = `${userInformation.bitmarkAccountNumber ? 'Bitmark account number:' + userInformation.bitmarkAccountNumber + '\r\n' : ''}${errorLog}`;

        console.log('Handled JS error:', errorLog);

        await FileUtil.create(ERROR_LOG_FILE_PATH, errorLog);
        this.sendReport(ERROR_LOG_FILE_PATH, ERROR_LOG_FILE_NAME);

        if (processError && processError.onClose) {
          processError.onClose();
        }
      }
    }]);
  }

  handerSubmittingEvent(submitting) {
    this.setState({ submitting });

    if (submitting) {
      KeepAwake.activate();
    } else {
      KeepAwake.deactivate();
    }

  }

  handleDeppLink(event) {
    const route = event.url.replace(/.*?:\/\//g, '');
    const params = route.split('/');
    switch (params[0]) {
      // case 'login': {
      //   break;
      // }
      default: {
        // TODO
        break;
      }
    }
  }

  handleAppStateChange = (nextAppState) => {
    if (this.appState.match(/background/) && nextAppState === 'active') {
      if (config.network === config.NETWORKS.livenet) {
        i18n.locale = 'en';
      } else {
        i18n.locale = DeviceInfo.getDeviceLocale();
      }
      runPromiseWithoutError(DataProcessor.doMetricOnScreen(true));
      this.doTryConnectInternet();
    }
    if (nextAppState.match(/background/)) {
      runPromiseWithoutError(DataProcessor.doMetricOnScreen(false));
    }
    this.appState = nextAppState;
  }

  handleNetworkChange(networkStatus) {
    EventEmitterService.emit(EventEmitterService.events.APP_NETWORK_CHANGED, networkStatus);
    this.setState({ networkStatus });
  }

  doTryConnectInternet() {
    NetInfo.isConnected.removeEventListener('connectionChange', this.handleNetworkChange);
    NetInfo.isConnected.fetch().then().done(() => {
      NetInfo.isConnected.addEventListener('connectionChange', this.handleNetworkChange);
    });
  }

  render() {
    let styles = {};
    if (!this.state.networkStatus || this.state.processingCount || this.state.emptyDataSource ||
      (!!this.state.submitting && !this.state.submitting.title && !this.state.submitting.message) ||
      (!!this.state.submitting && (this.state.submitting.title || this.state.submitting.message))) {
      styles.height = '100%';
    }

    return (
      <View style={[{ position: 'absolute', width: '100%', top: 0, left: 0, zIndex: iosConstant.zIndex.dialog }, styles]}>
        {!this.state.networkStatus && <BitmarkInternetOffComponent tryConnectInternet={this.doTryConnectInternet} />}
        {this.state.processingCount > 0 && <DefaultIndicatorComponent />}
        {!!this.state.submitting && !this.state.submitting.title && !this.state.submitting.message && <DefaultIndicatorComponent />}
        {!!this.state.submitting && (this.state.submitting.title || this.state.submitting.message) && <BitmarkIndicatorComponent
          indicator={!!this.state.submitting.indicator} title={this.state.submitting.title} message={this.state.submitting.message} />}
      </View>
    );
  }
}

export class BitmarkAppComponent extends Component {
  static propTypes = {
    message: PropTypes.string,
  };

  constructor(props) {
    super(props);

    this.doOpenApp = this.doOpenApp.bind(this);
    this.doRefresh = this.doRefresh.bind(this);

    this.state = {
      user: null,
      networkStatus: true,
    };
  }

  componentDidMount() {
    EventEmitterService.on(EventEmitterService.events.APP_NEED_REFRESH, this.doRefresh);
    EventEmitterService.on(EventEmitterService.events.APP_NETWORK_CHANGED, this.doOpenApp);
  }
  componentWillUnmount() {
    EventEmitterService.remove(EventEmitterService.events.APP_NEED_REFRESH, this.doRefresh);
    EventEmitterService.remove(EventEmitterService.events.APP_NETWORK_CHANGED, this.doOpenApp);
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (!this.state.user || this.state.user.bitmarkAccountNumber !== nextState.user.bitmarkAccountNumber) {
      return true;
    }
    return false;
  }

  doOpenApp(networkStatus) {
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
      this.doRefresh();
    }).catch(error => {
      console.log('doOpenApp error:', error);
    });
  }
  doRefresh(justCreatedBitmarkAccount) {
    return DataProcessor.doOpenApp(justCreatedBitmarkAccount).then(user => {
      console.log('doOpenApp user: ', user)
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
      console.log('doRefresh error:', error);
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
        <MainEventsHandlerComponent />
      </View>
    );
  }
}


export * from './code-push/code-push.component';