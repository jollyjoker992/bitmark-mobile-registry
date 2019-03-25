import React from 'react';
import PropTypes from 'prop-types';
import {
  View, Text, Image,
  ViewPropTypes,
  StyleSheet,
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';

import CustomShare from 'react-native-share';

import { OneTabButtonComponent } from 'src/views/commons/one-tab-button.component';
import { convertWidth, FileUtil } from 'src/utils';
import { CacheData, EventEmitterService } from 'src/processors';
import { config } from 'src/configs';


export class AccountQrCodeComponent extends React.Component {
  static propTypes = {
    asset: PropTypes.any,
    style: ViewPropTypes.style,
  }

  render() {
    return (
      <View style={cStyles.content}>
        <View style={cStyles.headers}>
          <Text style={cStyles.headerTitle}>{global.i18n.t("AccountQrCodeComponent_headerTitle")}</Text>
          <OneTabButtonComponent style={cStyles.headerCloseButton} onPress={() => {
            EventEmitterService.emit(EventEmitterService.events.APP_SHOW_COVER);
          }}>
            <Image style={cStyles.headerCloseButtonImage} source={require('assets/imgs/close_icon_blue.png')} />
          </OneTabButtonComponent>
        </View>
        <View style={cStyles.headerBar} />
        <View style={cStyles.qrCodeArea}>
          <QRCode
            getRef={(ref) => (this.qrCodeRef = ref)}
            value={CacheData.userInformation.bitmarkAccountNumber}
            size={200} />
        </View>
        <Text style={cStyles.accountNumber}>{CacheData.userInformation.bitmarkAccountNumber}</Text>

        <View style={cStyles.bottomButtonArea}>
          <OneTabButtonComponent style={cStyles.shareButton} onPress={async () => {
            let accountNumberQRCodeImagePath = `${FileUtil.getSharedLocalStorageFolderPath(CacheData.userInformation.bitmarkAccountNumber, config.isAndroid)}/qr_code.jpg`;
            if (!(await FileUtil.exists(accountNumberQRCodeImagePath))) {
              let writeQRCodeImage = async () => {
                return new Promise((resolve, reject) => {
                  this.qrCodeRef.toDataURL(data => {
                    FileUtil.writeFile(accountNumberQRCodeImagePath, data, 'base64').then(resolve).catch(reject);
                  });
                })
              };
              await writeQRCodeImage();
            }
            CustomShare.open({
              title: CacheData.userInformation.bitmarkAccountNumber,
              message: CacheData.userInformation.bitmarkAccountNumber,
              url: (config.isAndroid ? 'file://' : '') + accountNumberQRCodeImagePath,
            }).then(() => {
              console.log('Share success', accountNumberQRCodeImagePath);
            }).catch(error => {
              console.log('Share error :', error);
            });
          }}>
            <Image style={cStyles.shareIcon} source={require('assets/imgs/account_share_icon.png')} />
            <Text style={cStyles.shareButtonText}>{global.i18n.t("AccountQrCodeComponent_shareButtonText")}</Text>
          </OneTabButtonComponent>
        </View>
      </View>
    );
  }
}

const cStyles = StyleSheet.create({
  content: {
    flexDirection: 'column', alignItems: 'center',
    width: '100%', height: 490, minHeight: 200,
    backgroundColor: 'white',
    paddingTop: 18,
  },
  headers: {
    width: '100%',
    flexDirection: 'row', justifyContent: 'space-between',
  },
  headerTitle: {
    fontFamily: 'avenir_next_w1g_bold', fontSize: 14, color: 'black',
    marginLeft: convertWidth(19)
  },
  headerCloseButton: {
    padding: 4, paddingRight: convertWidth(19)
  },
  headerCloseButtonImage: {
    width: 16, height: 16, resizeMode: 'contain',
  },
  headerBar: {
    width: convertWidth(337),
    paddingLeft: convertWidth(19), paddingRight: convertWidth(19),
    borderTopWidth: 1, borderColor: '#A4B5CD',
    marginTop: 15,
  },
  qrCodeArea: {
    alignItems: 'center', justifyContent: 'center',
    marginTop: 50,
  },
  accountNumber: {
    fontFamily: 'andale_mono', fontSize: 12, textAlign: 'center',
    paddingRight: convertWidth(19), paddingLeft: convertWidth(19),
    marginTop: 27,
  },
  bottomButtonArea: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
  },
  shareButton: {
    backgroundColor: '#0060F2',
    height: 45, width: 200,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
  },
  shareIcon: {
    width: 13, height: 16, resizeMode: 'contain',
    marginBottom: 1,
  },
  shareButtonText: {
    color: 'white', fontFamily: 'avenir_next_w1g_bold', fontSize: 17,
    marginLeft: 12,
  }

});