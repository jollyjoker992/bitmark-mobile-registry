import moment from 'moment';
import React from 'react';
import {
  Text, View, TouchableOpacity, Image, SafeAreaView,
  Alert,
} from 'react-native';
import Camera from 'react-native-camera';
import componentStyle from './scan-qr-code.component.style';
import { Actions } from 'react-native-router-flux';
import { EventEmitterService } from 'src/processors/services';
import { AppProcessor, BitmarkProcessor } from 'src/processors';
import { defaultStyles } from 'src/views/commons';

export class ScanQRCodeComponent extends React.Component {
  constructor(props) {
    super(props);
    this.backToPropertiesScreen = this.backToPropertiesScreen.bind(this);
    this.scanned = false;
  }

  backToPropertiesScreen = () => {
    Actions.jump('properties');
  };

  onBarCodeRead(scanData) {
    this.cameraRef.stopPreview();
    if (this.scanned) {
      return;
    }
    this.scanned = true;
    let qrCode = scanData.data;

    let tempArrays = qrCode.split('|');
    if (tempArrays.length === 4 && tempArrays[0] === 'i') {
      let token = tempArrays[1];
      let timestamp = parseInt(tempArrays[2], 0);
      let encryptionKey = tempArrays[3];
      if (!timestamp || isNaN(timestamp)) {
        EventEmitterService.emit(EventEmitterService.events.APP_PROCESS_ERROR, {
          message: global.i18n.t("ScanQRCodeComponent_qrCodeIsInvalid"),
          onClose: Actions.pop
        });
        return;
      }
      let expiredTime = timestamp + 5 * 60 * 1000;
      if (expiredTime < moment().toDate().getTime()) {
        EventEmitterService.emit(EventEmitterService.events.APP_PROCESS_ERROR, {
          message: global.i18n.t("ScanQRCodeComponent_qrCodeIsExpired"),
          onClose: Actions.pop
        });
        return;
      }

      AppProcessor.doDecentralizedIssuance(token, encryptionKey, expiredTime).then(result => {
        if (result) {
          if (result instanceof Error) {
            EventEmitterService.emit(EventEmitterService.events.APP_PROCESS_ERROR, {
              message: result.message,
              onClose: Actions.pop
            });
            return;
          }
          BitmarkProcessor.doReloadUserAssetsBitmarks();
          Alert.alert(global.i18n.t("ScanQRCodeComponent_successTitle"), global.i18n.t("ScanQRCodeComponent_successMessage"), [{
            text: global.i18n.t("ScanQRCodeComponent_ok"),
            onPress: this.backToPropertiesScreen
          }]);
        }
      }).catch(error => {
        console.log('doDecentralizedIssuance error:', error);
        EventEmitterService.emit(EventEmitterService.events.APP_PROCESS_ERROR, { onClose: Actions.pop, error });
      });
    } else if (tempArrays.length === 3 && tempArrays[0] === 't') {
      let token = tempArrays[1];
      let timestamp = parseInt(tempArrays[2], 0);
      if (!timestamp || isNaN(timestamp)) {
        EventEmitterService.emit(EventEmitterService.events.APP_PROCESS_ERROR, {
          message: global.i18n.t("ScanQRCodeComponent_qrCodeIsInvalid"),
          onClose: Actions.pop
        });
        return;
      }
      let expiredTime = timestamp + 5 * 60 * 1000;
      if (expiredTime < moment().toDate().getTime()) {
        EventEmitterService.emit(EventEmitterService.events.APP_PROCESS_ERROR, {
          message: global.i18n.t("ScanQRCodeComponent_qrCodeIsExpired"),
          onClose: Actions.pop
        });
        return;
      }

      AppProcessor.doDecentralizedTransfer(token, expiredTime).then(result => {
        if (result) {
          if (result instanceof Error) {
            EventEmitterService.emit(EventEmitterService.events.APP_PROCESS_ERROR, {
              message: result.message,
              onClose: Actions.pop
            });
            return;
          }
          BitmarkProcessor.doReloadUserAssetsBitmarks();
          Alert.alert(global.i18n.t("ScanQRCodeComponent_successTitle"), global.i18n.t("ScanQRCodeComponent_yourPropertyRightsHaveBeenTransferred"), [{
            text: global.i18n.t("ScanQRCodeComponent_ok"),
            onPress: this.backToPropertiesScreen
          }]);
        }
      }).catch(error => {
        console.log('doDecentralizedTransfer error:', error);
        EventEmitterService.emit(EventEmitterService.events.APP_PROCESS_ERROR, { onClose: Actions.pop, error });
      });
    } else {
      EventEmitterService.emit(EventEmitterService.events.APP_PROCESS_ERROR, {
        message: global.i18n.t("ScanQRCodeComponent_qrCodeIsInvalid"),
        onClose: Actions.pop
      });
    }
  }

  render() {
    return (<SafeAreaView style={componentStyle.body}>
      <View style={componentStyle.header}>
        <TouchableOpacity style={defaultStyles.headerLeft} onPress={Actions.pop} >
          <Image style={defaultStyles.headerLeftIcon} source={require('assets/imgs/header_blue_icon.png')} />
        </TouchableOpacity>
        <Text style={defaultStyles.headerTitle}>{global.i18n.t("ScanQRCodeComponent_scanQrcode")}</Text>
        <TouchableOpacity style={defaultStyles.headerRight} />
      </View>
      <View style={componentStyle.bodyContent}>
        <Camera ref={(ref) => this.cameraRef = ref} style={componentStyle.scanCamera} aspect={Camera.constants.Aspect.fill} onBarCodeRead={this.onBarCodeRead.bind(this)} />
      </View>
    </SafeAreaView>);
  }
}
