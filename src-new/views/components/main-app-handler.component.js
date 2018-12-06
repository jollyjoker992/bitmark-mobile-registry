
import React, { Component } from 'react';
import ReactNative from 'react-native';
import KeepAwake from 'react-native-keep-awake';
const {
  Linking,
  Alert,
  AppState,
  NetInfo,
  View, TouchableOpacity, Text
} = ReactNative;
import { setJSExceptionHandler, setNativeExceptionHandler } from 'react-native-exception-handler';
import RNExitApp from 'react-native-exit-app';
import Mailer from 'react-native-mail';
import { Actions } from 'react-native-router-flux';

import {
  DefaultIndicatorComponent,
  BitmarkIndicatorComponent,
  BitmarkInternetOffComponent,
  BitmarkDialogComponent,
} from './../commons';
import { UserModel, EventEmitterService, DataProcessor, CommonModel } from 'src-new/processors';
import { FileUtil, convertWidth, runPromiseWithoutError } from 'src-new/utils';
import { constant } from 'src-new/configs';

const CRASH_LOG_FILE_NAME = 'crash_log.txt';
const CRASH_LOG_FILE_PATH = FileUtil.CacheDirectory + '/' + CRASH_LOG_FILE_NAME;
const ERROR_LOG_FILE_NAME = 'error_log.txt';
const ERROR_LOG_FILE_PATH = FileUtil.CacheDirectory + '/' + ERROR_LOG_FILE_NAME;

export class MainAppHandlerComponent extends Component {
  constructor(props) {
    super(props);

    this.handleDeppLink = this.handleDeppLink.bind(this);
    this.handleAppStateChange = this.handleAppStateChange.bind(this);
    this.handerProcessingEvent = this.handerProcessingEvent.bind(this);
    this.handerSubmittingEvent = this.handerSubmittingEvent.bind(this);
    this.handleNetworkChange = this.handleNetworkChange.bind(this);
    this.handerProcessErrorEvent = this.handerProcessErrorEvent.bind(this);
    this.doTryConnectInternet = this.doTryConnectInternet.bind(this);
    this.doRefresh = this.doRefresh.bind(this);
    this.migrationFilesToLocalStorage = this.migrationFilesToLocalStorage.bind(this);

    this.state = {
      user: null,
      processingCount: 0,
      submitting: null,
      networkStatus: true,
      passTouchFaceId: true,
    };
    this.appState = AppState.currentState;
  }

  componentDidMount() {
    EventEmitterService.on(EventEmitterService.events.APP_NEED_REFRESH, this.doRefresh);
    EventEmitterService.on(EventEmitterService.events.APP_PROCESSING, this.handerProcessingEvent);
    EventEmitterService.on(EventEmitterService.events.APP_SUBMITTING, this.handerSubmittingEvent);
    EventEmitterService.on(EventEmitterService.events.APP_PROCESS_ERROR, this.handerProcessErrorEvent);
    EventEmitterService.on(EventEmitterService.events.APP_MIGRATION_FILE_LOCAL_STORAGE, this.migrationFilesToLocalStorage);
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
    EventEmitterService.remove(EventEmitterService.events.APP_NEED_REFRESH, this.doRefresh);
    EventEmitterService.remove(EventEmitterService.events.APP_PROCESSING, this.handerProcessingEvent);
    EventEmitterService.remove(EventEmitterService.events.APP_SUBMITTING, this.handerSubmittingEvent);
    EventEmitterService.remove(EventEmitterService.events.APP_PROCESS_ERROR, this.handerProcessErrorEvent);
    EventEmitterService.remove(EventEmitterService.events.APP_MIGRATION_FILE_LOCAL_STORAGE, this.migrationFilesToLocalStorage);
    Linking.addEventListener('url', this.handleDeppLink);
    AppState.removeEventListener('change', this.handleAppStateChange);
    NetInfo.isConnected.removeEventListener('connectionChange', this.handleNetworkChange);
  }

  migrationFilesToLocalStorage() {
    Alert.alert(i18n.t('LocalStorageMigrationComponent_title'), i18n.t('LocalStorageMigrationComponent_message'), [{
      text: i18n.t('LocalStorageMigrationComponent_buttonText'), style: 'cancel',
      onPress: () => Actions.localStorageMigration()
    }]);
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
      runPromiseWithoutError(DataProcessor.doMetricOnScreen(true));
      this.doTryConnectInternet();
    }
    if (nextAppState.match(/background/)) {
      runPromiseWithoutError(DataProcessor.doMetricOnScreen(false));
    }
    this.appState = nextAppState;
  }

  handleNetworkChange(networkStatus) {
    this.setState({ networkStatus });
    if (networkStatus) {
      UserModel.doTryGetCurrentUser().then(async (userInformation) => {
        if (userInformation && userInformation.bitmarkAccountNumber) {
          let passTouchFaceId = !!(await CommonModel.doStartFaceTouchSessionId(i18n.t('FaceTouchId_doOpenApp')));
          console.log('passTouchFaceId :', passTouchFaceId);
          this.setState({ passTouchFaceId });
          if (passTouchFaceId) {
            EventEmitterService.emit(EventEmitterService.events.APP_NETWORK_CHANGED, { networkStatus });
          }
        } else {
          EventEmitterService.emit(EventEmitterService.events.APP_NETWORK_CHANGED, { networkStatus });
        }
      });
    }
  }

  doTryConnectInternet() {
    NetInfo.isConnected.removeEventListener('connectionChange', this.handleNetworkChange);
    NetInfo.isConnected.fetch().then().done(() => {
      NetInfo.isConnected.addEventListener('connectionChange', this.handleNetworkChange);
    });
  }

  async doRefresh(justCreatedBitmarkAccount) {
    if (DataProcessor.getUserInformation() && DataProcessor.getUserInformation().bitmarkAccountNumber) {
      let passTouchFaceId = !!CommonModel.getFaceTouchSessionId();
      if (!passTouchFaceId) {
        passTouchFaceId = !!(await CommonModel.doStartFaceTouchSessionId(i18n.t('FaceTouchId_doOpenApp')));
      }
      this.setState({ passTouchFaceId });
      if (passTouchFaceId && this.state.networkStatus) {
        EventEmitterService.emit(EventEmitterService.events.APP_NETWORK_CHANGED, { networkStatus: this.state.networkStatus, justCreatedBitmarkAccount });
      }
    } else if (this.state.networkStatus) {
      EventEmitterService.emit(EventEmitterService.events.APP_NETWORK_CHANGED, { networkStatus: this.state.networkStatus, justCreatedBitmarkAccount });
    }
  }

  render() {
    let styles = {};
    if (!this.state.networkStatus || this.state.processingCount || this.state.emptyDataSource || !this.state.passTouchFaceId ||
      (!!this.state.submitting && !this.state.submitting.title && !this.state.submitting.message) ||
      (!!this.state.submitting && (this.state.submitting.title || this.state.submitting.message))) {
      styles.height = '100%';
    }

    return (
      <View style={[{ position: 'absolute', width: '100%', top: 0, left: 0, zIndex: constant.zIndex.dialog }, styles]}>
        {!this.state.networkStatus && <BitmarkInternetOffComponent tryConnectInternet={this.doTryConnectInternet} />}
        {!this.state.passTouchFaceId && <BitmarkDialogComponent dialogStyle={{
          minHeight: 0, backgroundColor: 'rgba(256,256,256, 0.7)', flex: 1, width: '100%',
        }}>
          <TouchableOpacity style={{ flex: 1, justifyContent: 'center', }} onPress={this.doRefresh}>
            <Text style={{
              width: convertWidth(300),
              color: 'white', fontWeight: '900', fontSize: 16,
              backgroundColor: '#FF4444', padding: 10,
              textAlign: 'center',
            }}>{i18n.t('MainComponent_pleaseAuthorizeText​')}</Text>
          </TouchableOpacity>
        </BitmarkDialogComponent>}
        {this.state.processingCount > 0 && <DefaultIndicatorComponent />}
        {!!this.state.submitting && !this.state.submitting.title && !this.state.submitting.message && <DefaultIndicatorComponent />}
        {!!this.state.submitting && (this.state.submitting.title || this.state.submitting.message) && <BitmarkIndicatorComponent
          indicator={!!this.state.submitting.indicator} title={this.state.submitting.title} message={this.state.submitting.message} />}
      </View>
    );
  }
}