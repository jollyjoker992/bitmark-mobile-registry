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
        <View style={{ width: '100%', flexDirection: 'row', justifyContent: 'space-between', }}>
          <Text style={{ marginLeft: convertWidth(19) }}>RECEIVE PROPERTY</Text>
          <OneTabButtonComponent style={{ padding: 4, paddingRight: convertWidth(19) }} onPress={() => {
            EventEmitterService.emit(EventEmitterService.events.APP_SHOW_COVER);
          }}>
            <Image style={{ width: 16, height: 16, resizeMode: 'contain', }} source={require('assets/imgs/close_icon_blue.png')} />
          </OneTabButtonComponent>
        </View>
        <View style={{ paddingRight: convertWidth(19), width: convertWidth(337), borderTopWidth: 1, borderColor: '#A4B5CD', marginTop: 15, }} />
        <View style={{ alignItems: 'center', justifyContent: 'center', marginTop: 50, }}>
          <QRCode
            getRef={(ref) => (this.qrCodeRef = ref)}
            value={CacheData.userInformation.bitmarkAccountNumber}
            size={200} />
        </View>
        <Text style={{ fontFamily: 'andale_mono', fontSize: 12, textAlign: 'center', paddingRight: convertWidth(19), paddingLeft: convertWidth(19), marginTop: 27, }}>{CacheData.userInformation.bitmarkAccountNumber}</Text>

        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', }}>
          <OneTabButtonComponent style={{ backgroundColor: '#0060F2', height: 45, width: 200, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', }} onPress={async () => {
            let accountNumberQRCodeImagePath = `${FileUtil.getSharedLocalStorageFolderPath(CacheData.userInformation.bitmarkAccountNumber, config.isAndroid)}/qr_code.jpg`;
            console.log('accountNumberQRCodeImagePath :', accountNumberQRCodeImagePath);
            if (!(await FileUtil.exists(accountNumberQRCodeImagePath))) {
              let writeQRCodeImage = async () => {
                return new Promise((resolve, reject) => {
                  this.qrCodeRef.toDataURL(data => {
                    FileUtil.writeFile(accountNumberQRCodeImagePath, data, 'base64').then(resolve).catch(reject);
                  });
                })
              };
              console.log('run 1');
              await writeQRCodeImage();
              console.log('run 2');
            }
            console.log('run 3');

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
            <Image style={{ width: 13, height: 16, resizeMode: 'contain', marginBottom: 1, }} source={require('assets/imgs/account_share_icon.png')} />
            <Text style={{ color: 'white', fontFamily: 'avenir_next_w1g_bold', fontSize: 17, marginLeft: 12, }}>SHARE</Text>
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
    borderWidth: 1,
  },


});