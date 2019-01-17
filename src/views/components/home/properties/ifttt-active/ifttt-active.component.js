import React from 'react';
import PropTypes from 'prop-types';
import { Provider, connect } from 'react-redux';
import {
  View, Text, TouchableOpacity, Image, WebView, ActivityIndicator, SafeAreaView,
} from 'react-native';
import { Actions } from 'react-native-router-flux';
import styles from './ifttt-active.component.style';
import { config, constant } from 'src/configs';
import { EventEmitterService, AppProcessor, DataProcessor, CacheData } from 'src/processors';
import { defaultStyles } from 'src/views/commons';
import { runPromiseWithoutError, convertWidth } from 'src/utils';
import { AccountStore } from 'src/views/stores';
import { TransactionProcessor } from 'src/processors/transaction-processor';

class PrivateIftttActiveComponent extends React.Component {
  constructor(props) {
    super(props);
    this.onMessage = this.onMessage.bind(this);
    this.onNavigationStateChange = this.onNavigationStateChange.bind(this);

    this.state = {
      loading: true,
      processing: false,
      currentUrl: config.ifttt_invite_url,
      webViewUrl: config.ifttt_invite_url,
    }
    this.signed = false;
  }

  onMessage(event) {
    let message = event.nativeEvent.data;
    if (message === 'enable-ifttt') {
      this.setState({ processing: true });
      EventEmitterService.emit(EventEmitterService.events.APP_PROCESSING, true);
      AppProcessor.doCreateSignatureData().then(data => {
        // this.setState({ processing: false });
        if (!data) {
          EventEmitterService.emit(EventEmitterService.events.APP_PROCESSING, false);
          return;
        }
        this.signed = true;
        this.webViewRef.postMessage(JSON.stringify(data));

      }).catch(error => {
        EventEmitterService.emit(EventEmitterService.events.APP_PROCESSING, false);
        this.setState({ processing: false });
        console.log('IftttActiveComponent createSignatureData error :', error);
      });
    }
  }

  onNavigationStateChange(webViewState) {
    let currentUrl = webViewState.url;
    this.setState({ currentUrl });

    if (!this.props.stage) {
      if ((currentUrl === config.ifttt_bitmark_service_url || currentUrl === (config.ifttt_bitmark_service_settings_url)) && this.signed) {
        TransactionProcessor.doReloadIFTTTInformation().then((iftttInformation) => {
          EventEmitterService.emit(EventEmitterService.events.APP_PROCESSING, false);
          this.setState({ processing: false });
          if (iftttInformation.connectIFTTT && currentUrl === (config.ifttt_bitmark_service_settings_url)) {
            this.setState({
              webViewUrl: config.ifttt_bitmark_service_url,
              currentUrl: config.ifttt_bitmark_service_url,
            });
          }
        }).catch(error => {
          console.log('doReloadIFTTTInformation : ', error);
        });
      }
    } else {
      if (currentUrl === (config.ifttt_bitmark_service_settings_url) && this.signed) {
        EventEmitterService.emit(EventEmitterService.events.APP_PROCESSING, false);
        this.setState({ processing: false });
      }
    }
  }

  render() {
    return (
      <View style={styles.body}>
        <View style={[defaultStyles.header, { height: constant.headerSize.height, zIndex: 2, }]}>
          {this.props.iftttInformation && this.props.iftttInformation.connectIFTTT && <TouchableOpacity style={[defaultStyles.headerLeft, { width: 60 }]} />}

          {!this.props.iftttInformation || !this.props.iftttInformation.connectIFTTT && <TouchableOpacity style={[defaultStyles.headerLeft, { width: 60 }]} onPress={() => {
            runPromiseWithoutError(DataProcessor.doReloadIFTTTInformation())
            Actions.pop();
          }}>
            <Image style={defaultStyles.headerLeftIcon} source={require('assets/imgs/header_blue_icon.png')} />
          </TouchableOpacity>}

          <Text style={[defaultStyles.headerTitle, { maxWidth: convertWidth(375) - 120 }]}>{global.i18n.t("IftttActiveComponent_registerYourIftttData")}</Text>
          {(!this.props.iftttInformation || !this.props.iftttInformation.connectIFTTT) && <TouchableOpacity style={[defaultStyles.headerRight, { width: 60 }]} />}
          {this.props.iftttInformation && this.props.iftttInformation.connectIFTTT &&
            <TouchableOpacity style={[defaultStyles.headerRight, { width: 60, }]} onPress={Actions.pop}>
              <Text style={defaultStyles.headerRightText}>{global.i18n.t("IftttActiveComponent_done")}</Text>
            </TouchableOpacity>
          }
        </View>

        <View style={styles.main}>
          <WebView ref={(ref) => this.webViewRef = ref}
            dataDetectorTypes="none"
            source={{ uri: this.state.webViewUrl }}
            onMessage={this.onMessage}
            onNavigationStateChange={this.onNavigationStateChange}
            onLoadStart={() => this.setState({ loading: true })}
            onLoadEnd={() => {
              this.setState({ loading: false });
              let bitmarkAccountNumber = CacheData.userInformation.bitmarkAccountNumber;

              if (this.state.currentUrl.indexOf(config.ifttt_server_url) >= 0 && this.state.currentUrl.indexOf(bitmarkAccountNumber) < 0) {
                this.setState({
                  webViewUrl: this.state.currentUrl + `&bitmark_account=${bitmarkAccountNumber}`,
                  currentUrl: this.state.currentUrl + `&bitmark_account=${bitmarkAccountNumber}`,
                });
              }
              if (!this.props.stage && !this.signed &&
                (this.state.currentUrl.indexOf('https://ifttt.com/onboarding') >= 0 || this.state.currentUrl.indexOf('https://ifttt.com/discover') >= 0 || this.state.currentUrl === config.ifttt_bitmark_service_url)) {
                this.setState({
                  webViewUrl: config.ifttt_bitmark_service_settings_url + '/connect',
                  currentUrl: config.ifttt_bitmark_service_settings_url + '/connect',
                });
              }
            }}
          />
          {this.state.loading && !this.state.processing && <View style={{
            flex: 1, position: 'absolute', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            width: '100%', height: '100%',
          }}>
            <ActivityIndicator style={{ marginTop: 20 }} size={"large"} />
          </View>}
        </View>
      </View>
    );
  }
}

PrivateIftttActiveComponent.propTypes = {
  iftttInformation: PropTypes.any,
  stage: PropTypes.string,
}

const StoreIftttActiveComponent = connect(
  (state) => {
    return state.data;
  },
)(PrivateIftttActiveComponent);

export class IftttActiveComponent extends React.Component {
  static propTypes = {
    stage: PropTypes.string,
  }
  constructor(props) {
    super(props);
  }
  render() {
    return (
      <SafeAreaView style={{ flex: 1, borderWidth: 1, }}>
        <Provider store={AccountStore}>
          <StoreIftttActiveComponent stage={this.props.stage} />
        </Provider>
      </SafeAreaView>
    );
  }
}

