
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
import { Sentry } from 'react-native-sentry';

import {
  DefaultIndicatorComponent,
  BitmarkIndicatorComponent,
  BitmarkInternetOffComponent,
  BitmarkDialogComponent,
} from './../commons';
import { UserModel, EventEmitterService, DataProcessor, CacheData, BitmarkSDK, AppProcessor } from 'src/processors';
import { convertWidth, runPromiseWithoutError } from 'src/utils';
import { constant } from 'src/configs';

export class MainAppHandlerComponent extends Component {
  constructor(props) {
    super(props);

    this.handleDeepLink = this.handleDeepLink.bind(this);
    this.handleAppStateChange = this.handleAppStateChange.bind(this);
    this.handerProcessingEvent = this.handerProcessingEvent.bind(this);
    this.handerSubmittingEvent = this.handerSubmittingEvent.bind(this);
    this.handleNetworkChange = this.handleNetworkChange.bind(this);
    this.handerProcessErrorEvent = this.handerProcessErrorEvent.bind(this);
    this.doTryConnectInternet = this.doTryConnectInternet.bind(this);
    this.doRefresh = this.doRefresh.bind(this);

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
    Linking.getInitialURL().then((url) => {
      this.handleDeepLink({ url });
    }).catch(err => console.error('An error occurred', err));
    Linking.addEventListener('url', this.handleDeepLink);
    AppState.addEventListener('change', this.handleAppStateChange);
    NetInfo.isConnected.fetch().then().done(() => {
      NetInfo.isConnected.addEventListener('connectionChange', this.handleNetworkChange);
    });

  }
  componentWillUnmount() {
    EventEmitterService.remove(EventEmitterService.events.APP_NEED_REFRESH, this.doRefresh);
    EventEmitterService.remove(EventEmitterService.events.APP_PROCESSING, this.handerProcessingEvent);
    EventEmitterService.remove(EventEmitterService.events.APP_SUBMITTING, this.handerSubmittingEvent);
    EventEmitterService.remove(EventEmitterService.events.APP_PROCESS_ERROR, this.handerProcessErrorEvent);
    Linking.addEventListener('url', this.handleDeepLink);
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
        Sentry.captureException(error, { logger: 'user' });

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

  handleDeepLink(event) {
    if (!event.url) {
      return;
    }
    const route = event.url.replace(/.*?:\/\//g, '');
    const params = route.split('/');
    switch (params[0]) {
      case 'claim': {
        let assetId = params[1];
        if (assetId) {
          UserModel.doTryGetCurrentUser().then(userInformation => {
            if (!userInformation || !userInformation.bitmarkAccountNumber) {
              Alert.alert('', global.i18n.t("MainComponent_claimMessageWhenUserNotLogin"));
            }
          });
          AppProcessor.doGetAssetToClaim(assetId).then(asset => {
            DataProcessor.doViewSendClaimRequest(asset);
          }).catch(error => {
            EventEmitterService.emit(EventEmitterService.events.APP_PROCESS_ERROR, { error });
          })
        }
        break;
      }
      default: {
        // TODO
        break;
      }
    }
  }

  handleAppStateChange = (nextAppState) => {
    console.log('nextAppState :', nextAppState);
    if (this.appState.match(/background/) && nextAppState === 'active') {
      runPromiseWithoutError(DataProcessor.doMetricOnScreen(true));
      this.doTryConnectInternet();
    }
    if (nextAppState && nextAppState.match(/background/)) {
      runPromiseWithoutError(DataProcessor.doMetricOnScreen(false));
    }
    this.appState = nextAppState;
  }

  handleNetworkChange(networkStatus) {
    this.setState({ networkStatus });
    if (networkStatus) {
      UserModel.doTryGetCurrentUser().then(async (userInformation) => {
        if (userInformation && userInformation.bitmarkAccountNumber) {
          let result = await runPromiseWithoutError(BitmarkSDK.requestSession(i18n.t('FaceTouchId_doOpenApp')));
          let passTouchFaceId = result && !result.error;
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
    if (CacheData.userInformation && CacheData.userInformation.bitmarkAccountNumber) {
      let result = await runPromiseWithoutError(BitmarkSDK.requestSession(i18n.t('FaceTouchId_doOpenApp')));
      let passTouchFaceId = result && !result.error;
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
              backgroundColor: '#0060F2', padding: 10,
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