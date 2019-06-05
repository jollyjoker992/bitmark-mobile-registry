import PropTypes from 'prop-types';
import React from 'react';
import {
  Text, View, Image,
  Alert, StyleSheet,
} from 'react-native';
import Camera from 'react-native-camera';
import componentStyle from './qr-code-authorization.component.style';
import { Actions } from 'react-native-router-flux';
import { defaultStyles, BitmarkDialogComponent } from 'src/views/commons';
import { OneTabButtonComponent } from 'src/views/commons/one-tab-button.component';
import { DataProcessor, CacheData } from "src/processors";
import { convertWidth } from "src/utils";


export class QRCodeAuthorizationComponent extends React.Component {
  static propTypes = {
    onDone: PropTypes.func,
    params: PropTypes.any
  };

  constructor(props) {
    super(props);
    this.backToPropertiesScreen = this.backToPropertiesScreen.bind(this);
    this.verificationLink = CacheData.verificationLink;
    CacheData.verificationLink = undefined;
    this.scanned = false;
    this.state = {
      authorized: false,
      domain: ''
    };
  }

  backToPropertiesScreen = () => {
    Actions.jump('properties');
  };

  componentDidMount() {
    if (this.props.params && this.props.params.fromVerificationLink) {
      setTimeout(() => this.cameraRef.stopPreview(), 1000);
      this.processVerificationLink(this.props.params.link);
    }
  }

  processVerificationLink(verificationLink) {
    if (!this.isValidVerificationLink(verificationLink)) {
      Alert.alert("Unrecognized Verification Link", "Please check the Verification Link again.", [{
        text: "OK",
        onPress: () => {
          this.scanned = false
        },
      }], {cancelable: false});
    } else {
      const {url, code} = this.extractLinkInfo(verificationLink);
      const domain = this.extractDomainFromUrl(url);
      this.setState({domain});

      this.confirmAuthorization(code, domain, url);
    }
  }

  onBarCodeRead(scanData) {
    if (this.scanned) {
      return;
    }
    this.scanned = true;
    let qrCode = scanData.data;
    if (this.props.onDone) {
      this.props.onDone(qrCode);
      return Actions.pop();
    }

    if (!this.isValidQRCode(qrCode)) {
      Alert.alert("Unrecognized QR Code", "Please scan the QR code again or contact the QR code provider if you’re still experiencing problems.", [{
        text: "OK",
        onPress: () => {
          this.scanned = false
        },
      }], {cancelable: false});
    } else {
      this.cameraRef.stopPreview();
      let qrCodeParts = qrCode.split('|');
      const code = qrCodeParts[0];
      const url = qrCodeParts[1];
      const domain = this.extractDomainFromUrl(url);
      this.setState({domain});

      this.confirmAuthorization(code, domain, url);
    }
  }

  confirmAuthorization(code, domain, url) {
    Alert.alert("Authorization Required",
      `${domain} requires your digital signature to authorize this action. To prevent abuse, please only authorize actions from trusted websites.`, [{
        text: "Cancel",
        onPress: () => {
          this.backToPropertiesScreen();
        },
      }, {
        text: "Authorize",
        onPress: () => {
          this.requestAuthorization(code, url);
        },
      }], {cancelable: false});
  }

  async requestAuthorization(code, url) {
    let error = false;
    try {
      const resp = await DataProcessor.requestAuthorization(code, url);
      if (resp.ok) {
        this.setState({authorized: true});
        // Display in 3s ans do next step
        setTimeout(() => {
          this.setState({authorized: false});
          if (this.verificationLink) {
            Alert.alert('', `To complete the process, please return to the browser.`, [{
              text: "OK",
              onPress: () => {
                this.backToPropertiesScreen();
              },
            }], {cancelable: false});
          } else {
            this.backToPropertiesScreen();
          }
        }, 3000);
      } else {
        error = true;
      }
    } catch (err) {
      error = true;
    }

    if (error) {
      Alert.alert('', `There was an error while requesting to ${this.extractDomainFromUrl(url)}.`, [{
        text: "OK",
      }], {cancelable: false});
    }
  }

  isValidVerificationLink(link) {
    if (!link) return false;
    let linkParts = link.split('/');
    if (linkParts.length <= 2) return false;
    const {url, code} = this.extractLinkInfo(link);
    return code.split(' ').length >= 5 &&  this.isValidURL(url);
  }

  extractLinkInfo(link) {
    const linkParts = link.split('/');
    const url = linkParts.slice(2).join('/');
    const code = linkParts[1].replace(/%20/g, ' ');
    return {code, url};
  }

  extractDomainFromUrl(url) {
    const matches = url.match(/^https?\:\/\/([^\/?#]+)(?:[\/?#]|$)/i);
    return matches && matches[1];
  }

  isValidQRCode(qrCode) {
    const qrCodeParts = qrCode.split('|');
    return qrCodeParts.length == 2 && qrCodeParts[0].split(' ').length >= 5 && this.isValidURL(qrCodeParts[1]);
  }

  isValidURL(url) {
    return (url.startsWith('http://') || url.startsWith('https://'));
  }

  render() {
    return (<View style={componentStyle.body}>
      <View style={componentStyle.header}>
        <OneTabButtonComponent style={defaultStyles.headerLeft} onPress={Actions.pop}>
          <Image style={defaultStyles.headerLeftIcon} source={require('assets/imgs/header_blue_icon.png')}/>
        </OneTabButtonComponent>
        <Text style={defaultStyles.headerTitle}>{global.i18n.t("ScanQRCodeComponent_scanQrcode")}</Text>
        <OneTabButtonComponent style={defaultStyles.headerRight}/>
      </View>

      <View style={componentStyle.bodyContent}>
        <Camera ref={(ref) => this.cameraRef = ref} style={componentStyle.scanCamera} aspect={Camera.constants.Aspect.fill}
                onBarCodeRead={this.onBarCodeRead.bind(this)}/>
      </View>

      {this.state.authorized &&
      <AuthorizedComponent domain={this.state.domain}/>
      }
    </View>);
  }
}

export class AuthorizedComponent extends React.Component {
  static propTypes = {
    domain: PropTypes.string,
  };

  render() {
    return (
      <BitmarkDialogComponent dialogStyle={dialogStyleSheet.dialogBody}>
        <View style={dialogStyleSheet.dialog}>
          <Image style={dialogStyleSheet.authorizedIcon} source={require('assets/imgs/authorized-icon.png')}/>
          <Text style={dialogStyleSheet.title}>Authorized!</Text>
          <Text style={dialogStyleSheet.message}>{`Your authorization has been sent to ${this.props.domain}.`}</Text>
        </View>
      </BitmarkDialogComponent>
    );
  }
}

const dialogStyleSheet = StyleSheet.create({
  dialogBody: {
    minHeight: 0,
    backgroundColor: 'rgba(256,256,256, 0.7)',
    flex: 1,
    width: '100%'
  },
  dialog: {
    alignItems: 'center',
    justifyContent: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 12,
    width: convertWidth(270),
    height: 196,
    padding: 20,
    paddingTop: 32
  },
  authorizedIcon: {
    width: 43,
    height: 43,
    resizeMode: 'contain'
  },
  title: {
    fontFamily: 'avenir_next_w1g_bold',
    color: '#000000',
    fontSize: 17,
    marginTop: 10,
    textAlign: 'center',
  },
  message: {
    fontFamily: 'avenir_next_w1g_regular',
    color: '#000000',
    fontSize: 13,
    marginTop: 10,
    textAlign: 'center',
  },
});
