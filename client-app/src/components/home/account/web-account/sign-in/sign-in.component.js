import React from 'react';
import PropTypes from 'prop-types';
import {
  Text, View, TouchableOpacity, Image,
} from 'react-native';
import Camera from 'react-native-camera';
import Hyperlink from 'react-native-hyperlink';
import componentStyle from './sign-in.component.style';

import defaultStyles from '../../../../../commons/styles';
import { DataProcessor, AppProcessor } from '../../../../../processors';
import { EventEmitterService } from '../../../../../services';

export class WebAccountSignInComponent extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      userInformation: DataProcessor.getUserInformation(),
    };
    this.scanned = false;
  }

  onBarCodeRead(scanData) {
    this.cameraRef.stopPreview();
    if (this.scanned) {
      return;
    }
    this.scanned = true;
    let tempArray = scanData.data.split('|');
    if (tempArray && tempArray.length === 2 && tempArray[0] === 'mobile_login') {
      AppProcessor.doSignInOnWebApp(scanData.data).then((result) => {
        if (result) {
          this.props.navigation.goBack();
        }
      }).catch(error => {
        console.log('doSignInOnWebApp error:', error);
        EventEmitterService.emit(EventEmitterService.events.APP_PROCESS_ERROR, { message: global.i18n.t("WebAccountSignInComponent_cannotSignIn") });
        this.props.navigation.goBack();
      });
    } else {
      EventEmitterService.emit(EventEmitterService.events.APP_PROCESS_ERROR, {
        message: global.i18n.t("WebAccountSignInComponent_qrCodeIsInvalid"),
        onClose: this.props.navigation.goBack
      });
    }
  }

  render() {
    return (<View style={componentStyle.body}>
      <View style={componentStyle.header}>
        <TouchableOpacity style={defaultStyles.headerLeft} onPress={() => this.props.navigation.goBack()} >
          <Image style={defaultStyles.headerLeftIcon} source={require('./../../../../../../assets/imgs/header_blue_icon.png')} />
        </TouchableOpacity>
        <Text style={defaultStyles.headerTitle}>{global.i18n.t("WebAccountSignInComponent_webAccountSignIn")}</Text>
        <TouchableOpacity style={defaultStyles.headerRight} />
      </View>
      <View style={componentStyle.bodyContent}>
        <Hyperlink
          linkStyle={{ color: '#0060F2', }}
          linkText={url => url}
        >
          <Text style={componentStyle.scanMessage}>{global.i18n.t("WebAccountSignInComponent_scanMessage")}</Text>
        </Hyperlink>
        <Camera ref={(ref) => this.cameraRef = ref} style={componentStyle.scanCamera} aspect={Camera.constants.Aspect.fill} onBarCodeRead={this.onBarCodeRead.bind(this)} />
      </View>
    </View>);
  }
}

WebAccountSignInComponent.propTypes = {
  navigation: PropTypes.shape({
    navigate: PropTypes.func,
    goBack: PropTypes.func,
  })
};