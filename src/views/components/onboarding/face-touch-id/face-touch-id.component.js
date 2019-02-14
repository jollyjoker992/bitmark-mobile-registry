import React from 'react';
import PropTypes from 'prop-types';
import {
  View, Text, Image, TouchableOpacity,
  Linking,
  AppState,
  Alert
} from 'react-native'

import faceTouchIdStyle from './face-touch-id.component.style';
import { Actions } from 'react-native-router-flux';
import { CommonModel, EventEmitterService } from 'src/processors';

export class FaceTouchIdComponent extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      supported: true,
    }
    this.appState = AppState.currentState;
  }


  doContinue(enableTouchId = true) {
    let doSubmit = () => {
      this.props.doContinue(enableTouchId).then((result) => {
        console.log('doContinue result :', result);
        if (result && result.user) {
          Actions.notification({ justCreatedBitmarkAccount: result.justCreatedBitmarkAccount });
        }
      }).catch(error => {
        console.log('doContinue error :', error);
        EventEmitterService.emit(EventEmitterService.events.APP_PROCESS_ERROR, { error });
      });
    };

    if (enableTouchId) {
      CommonModel.doCheckPasscodeAndFaceTouchId().then((supported) => {
        if (supported) {
          doSubmit();
        } else {
          Linking.openURL('app-settings:');
        }
      });
    } else {
      doSubmit();
    }
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
            <Image style={[faceTouchIdStyle.touchIdImage]} source={require('assets/imgs/touch-id.png')} />
            <Image style={[faceTouchIdStyle.faceIdImage]} source={require('assets/imgs/face-id.png')} />
          </View>

        </View>

        <View style={faceTouchIdStyle.enableButtonArea}>
          {/*Enable Button*/}
          <TouchableOpacity style={[faceTouchIdStyle.enableButton]}
            onPress={() => this.doContinue.bind(this)}>
            <Text style={faceTouchIdStyle.enableButtonText}>{global.i18n.t("FaceTouchIdComponent_enableButtonText")}</Text>
          </TouchableOpacity>
          {/*Skip Button*/}
          <TouchableOpacity style={[faceTouchIdStyle.skipButton]}
            onPress={this.confirmSkipTouchId.bind(this)}>
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