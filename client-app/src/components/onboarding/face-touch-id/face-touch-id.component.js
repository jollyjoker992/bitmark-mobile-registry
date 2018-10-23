import React from 'react';
import PropTypes from 'prop-types';
import {
  View, Text, Image, TouchableOpacity, SafeAreaView,
  Linking,
  AppState,
  Alert
} from 'react-native'
import { CommonModel } from './../../../models';

import faceTouchIdStyle from './face-touch-id.component.style';
import { iosConstant } from '../../../configs/ios/ios.config';
import { Actions } from 'react-native-router-flux';

export class FaceTouchIdComponent extends React.Component {
  constructor(props) {
    super(props);
    this.handleAppStateChange = this.handleAppStateChange.bind(this);
    this.checkSupportFaceTouchId = this.checkSupportFaceTouchId.bind(this);
    this.doContinue = this.doContinue.bind(this);
    this.confirmSkipTouchId = this.confirmSkipTouchId.bind(this);

    this.state = {
      supported: true,
      errorMessage: '',
    }
    this.appState = AppState.currentState;
  }

  componentDidMount() {
    AppState.addEventListener('change', this.handleAppStateChange);
  }

  componentWillUnmount() {
    AppState.removeEventListener('change', this.handleAppStateChange);
  }

  handleAppStateChange = (nextAppState) => {
    if (this.appState.match(/background/) && nextAppState === 'active') {
      this.checkSupportFaceTouchId();
    }
    this.appState = nextAppState;
  }

  checkSupportFaceTouchId() {
    CommonModel.doCheckPasscodeAndFaceTouchId().then((supported) => {
      this.setState({ supported });
    });
  }

  doContinue(enableTouchId) {
    this.props.doContinue(enableTouchId).then((user) => {
      if (user) {
        Actions.notification();
      }
    }).catch(error => {
      console.log('error :', error);
      this.setState({ errorMessage: global.i18n.t("FaceTouchIdComponent_canNotCreateOrAccessBitmarkAccount") })
    });
  }

  confirmSkipTouchId() {
    Alert.alert(global.i18n.t("FaceTouchIdComponent_confirmMessage"), '', [{
      style: 'cancel',
      text: global.i18n.t("FaceTouchIdComponent_no"),
    }, {
      text: global.i18n.t("FaceTouchIdComponent_yes"),
      onPress: () => {
        this.doContinue(false);
      }
    }]);
  }

  render() {
    return (
      <View style={{ flex: 1, backgroundColor: 'white' }}>
        <View style={[faceTouchIdStyle.body]}>
          <Text style={[faceTouchIdStyle.faceTouchIdTitle]}>{global.i18n.t("FaceTouchIdComponent_faceTouchIdTitle")}</Text>
          <Text style={[faceTouchIdStyle.faceTouchIdDescription,]}>
            {global.i18n.t("FaceTouchIdComponent_faceTouchIdDescription")}
          </Text>
          <View style={faceTouchIdStyle.passcodeRemindImages}>
            <Image style={[faceTouchIdStyle.touchIdImage]} source={require('../../../../assets/imgs/touch-id.png')} />
            <Image style={[faceTouchIdStyle.faceIdImage]} source={require('../../../../assets/imgs/face-id.png')} />
          </View>

        </View>

        <View style={faceTouchIdStyle.enableButtonArea}>
          {/*Enable Button*/}
          <TouchableOpacity style={[faceTouchIdStyle.enableButton]}
            onPress={() => {
              if (!this.state.supported) {
                Linking.openURL('app-settings:');
              } else {
                this.doContinue(true);
              }
            }}>
            <Text style={faceTouchIdStyle.enableButtonText}>{global.i18n.t("FaceTouchIdComponent_enableButtonText")}</Text>
          </TouchableOpacity>
          {/*Skip Button*/}
          <TouchableOpacity style={[faceTouchIdStyle.skipButton]}
            onPress={() => {
              this.confirmSkipTouchId();
            }}>
            <Text style={faceTouchIdStyle.skipButtonText}>{global.i18n.t("FaceTouchIdComponent_skip")}</Text>
          </TouchableOpacity>
        </View>

      </View>
    );
  }
}

FaceTouchIdComponent.propTypes = {
  doContinue: PropTypes.func,
}