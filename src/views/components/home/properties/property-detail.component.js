import React from 'react';
import PropTypes from 'prop-types';
import ReactNative, {
  View, Text, Image,
  ViewPropTypes,
  StyleSheet,
  Share,
  Linking,
} from 'react-native';
const { ActionSheetIOS } = ReactNative;
import { Provider, connect } from 'react-redux';
import moment from 'moment';

import { OneTabButtonComponent } from 'src/views/commons/one-tab-button.component';
import { convertWidth, isHealthRecord, isMedicalRecord, isImageFile, isVideoFile, isDocFile, isZipFile } from 'src/utils';
import { config } from 'src/configs';
import { CommonProcessor, BitmarkProcessor, EventEmitterService, AppProcessor } from 'src/processors';
import { Actions } from 'react-native-router-flux';
import { PropertyStore, PropertyActions } from 'src/views/stores';



class PrivatePropertyDetailComponent extends React.Component {
  static propTypes = {
    asset: PropTypes.any,
    bitmark: PropTypes.any,
    style: ViewPropTypes.style,
  }

  viewBitmarkOnBlockChain() {
    EventEmitterService.emit(EventEmitterService.events.APP_SHOW_COVER);
    Actions.bitmarkWebViewFull({
      title: 'REGISTRY', sourceUrl: `${config.registry_server_url}/bitmark/${this.props.bitmark.id}?env=app`,
    });
  }

  downloadBitmark() {
    BitmarkProcessor.doDownloadBitmark(this.props.bitmark).then(filePath => {
      if (filePath) {
        Share.share({ title: this.props.asset.name, url: filePath });
      }
    }).catch(error => {
      EventEmitterService.emit(EventEmitterService.events.APP_PROCESS_ERROR, { error });
    })
  }

  openAsset() {
    Share.share({ title: this.props.asset.name, url: this.props.asset.filePath });
  }

  transferBitmark() {
    EventEmitterService.emit(EventEmitterService.events.APP_SHOW_COVER);
    Actions.localPropertyTransfer({ bitmark: this.props.bitmark, asset: this.props.asset });
  }

  shareSocialLink() {
  }

  deleteBitmark() {
    ActionSheetIOS.showActionSheetWithOptions({
      title: 'This bitmark will be deleted.',
      options: ['Cancel', 'Delete'],
      destructiveButtonIndex: 1,
      cancelButtonIndex: 0,
    },
      (buttonIndex) => {
        if (buttonIndex === 1) {
          AppProcessor.doTransferBitmark(this.props.bitmark, config.zeroAddress).then((result) => {
            if (result) {
              EventEmitterService.emit(EventEmitterService.events.APP_SHOW_COVER);
            }
          }).catch(error => {
            console.log('error:', error);
            EventEmitterService.emit(EventEmitterService.events.APP_PROCESS_ERROR, { error });
          });
        }
      });
  }


  render() {
    return (
      <View style={cStyles.content}>
        <View style={cStyles.assetContent}>
          <View style={cStyles.thumbnailArea}>
            {(() => {
              if (this.props.asset.thumbnailPath) {
                return (<Image style={cStyles.thumbnailImage} source={{ uri: this.props.asset.thumbnailPath }} />);
              }
              if (isHealthRecord(this.props.asset)) {
                return (<Image style={cStyles.thumbnailImage} source={require('assets/imgs/asset_health_data_icon.png')} />);
              }
              if (isMedicalRecord(this.props.asset)) {
                return (<Image style={cStyles.thumbnailImage} source={require('assets/imgs/asset_medical_record_icon.png')} />);
              }
              if (isImageFile(this.props.asset.filePath)) {
                return (<Image style={cStyles.thumbnailImage} source={require('assets/imgs/asset_image_icon.png')} />);
              }
              if (isVideoFile(this.props.asset.filePath)) {
                return (<Image style={cStyles.thumbnailImage} source={require('assets/imgs/asset_video_icon.png')} />);
              }
              if (isDocFile(this.props.asset.filePath)) {
                return (<Image style={cStyles.thumbnailImage} source={require('assets/imgs/asset_doc_icon.png')} />);
              }
              if (isZipFile(this.props.asset.filePath)) {
                return (<Image style={cStyles.thumbnailImage} source={require('assets/imgs/asset_zip_icon.png')} />);
              }
              return (<Image style={cStyles.thumbnailImage} source={require('assets/imgs/asset_unknow_icon.png')} />);
            })()}
          </View>
          {this.props.bitmark.status === 'confirmed' && <View style={cStyles.assetInfo}>
            <View style={cStyles.rowInformation}>
              <Text style={cStyles.rowInfoLabel}>BITMARK ID</Text>
              <Text style={cStyles.rowInfoValue}>{this.props.bitmark.id}</Text>
            </View>
            <View style={[cStyles.rowInformation, { marginTop: 14, }]}>
              <Text style={cStyles.rowInfoLabel}>NAME</Text>
              <Text style={cStyles.rowInfoValue}>{this.props.asset.name}</Text>
            </View>
            <View style={cStyles.rowInformation}>
              <Text style={cStyles.rowInfoLabel}>ISSUE BY</Text>
              <Text style={cStyles.rowInfoValue}>{CommonProcessor.getDisplayedAccount(this.props.bitmark.issuer)}</Text>
            </View>
            <View style={cStyles.rowInformation}>
              <Text style={cStyles.rowInfoLabel}>ISSUE ON</Text>
              <Text style={cStyles.rowInfoValue}>{moment(this.props.bitmark.created_at).format('YYYY MMM DD HH:mm:ss').toUpperCase()}</Text>
            </View>
          </View>}

          {this.props.bitmark.status === 'pending' &&
            <View style={cStyles.assetInfo}>
              <View style={cStyles.rowInformation}>
                <Text style={cStyles.rowInfoLabel}>PENDING...</Text>
              </View>
              <View style={cStyles.rowInformation}>
                <Text style={[cStyles.rowInfoValue, { marginLeft: 0 }]}>{'BITMARK miners are working hard NOW!'.toUpperCase()}</Text>
              </View>
            </View>
          }
        </View>
        <View style={cStyles.actionArea}>
          <OneTabButtonComponent style={cStyles.actionRow} disabled={this.props.bitmark.status === 'pending'} onPress={this.viewBitmarkOnBlockChain.bind(this)}>
            <Image style={cStyles.actionRowIcon} source={this.props.bitmark.status === 'pending' ? require('assets/imgs/info_icon_grey.png') : require('assets/imgs/info_icon_blue.png')} />
            <Text style={[cStyles.actionRowText, this.props.bitmark.status === 'pending' ? { color: '#C1C1C1' } : {}]}>View bitmark details on blockchain</Text>
          </OneTabButtonComponent>
          <OneTabButtonComponent style={cStyles.actionRow} onPress={this.props.asset.filePath ? this.openAsset.bind(this) : this.downloadBitmark.bind(this)}>
            <Image style={cStyles.actionRowIcon} source={this.props.asset.filePath ? require('assets/imgs/open_asset_icon.png') : require('assets/imgs/download_asset_icon.png')} />
            <Text style={[cStyles.actionRowText]}>{this.props.asset.filePath ? 'Open asset in' : 'Download asset'}</Text>
          </OneTabButtonComponent>
          <OneTabButtonComponent style={cStyles.actionRow} disabled={this.props.bitmark.status === 'pending'} onPress={this.transferBitmark.bind(this)}>
            <Image style={cStyles.actionRowIcon} source={this.props.bitmark.status === 'pending' ? require('assets/imgs/transfer_bitmark_icon_grey.png') : require('assets/imgs/transfer_bitmark_icon_blue.png')} />
            <Text style={[cStyles.actionRowText, this.props.bitmark.status === 'pending' ? { color: '#C1C1C1' } : {}]}>Transfer bitmark</Text>
          </OneTabButtonComponent>
          <OneTabButtonComponent style={cStyles.actionRow} disabled={this.props.bitmark.status === 'pending'} onPress={this.shareSocialLink.bind(this)}>
            <Image style={cStyles.actionRowIcon} source={this.props.bitmark.status === 'pending' ? require('assets/imgs/share_icon_grey.png') : require('assets/imgs/share_icon_blue.png')} />
            <Text style={[cStyles.actionRowText, this.props.bitmark.status === 'pending' ? { color: '#C1C1C1' } : {}]}>Share link to social media</Text>
          </OneTabButtonComponent>
          <OneTabButtonComponent style={cStyles.actionRow} disabled={this.props.bitmark.status === 'pending'} onPress={this.deleteBitmark.bind(this)}>
            <Image style={cStyles.actionRowIcon} source={this.props.bitmark.status === 'pending' ? require('assets/imgs/delete_icon_grey.png') : require('assets/imgs/delete_icon_red.png')} />
            <Text style={[cStyles.actionRowText, this.props.bitmark.status === 'pending' ? { color: '#C1C1C1' } : { color: '#FF003C' }]}>Delete </Text>
          </OneTabButtonComponent>
        </View>
      </View>
    );
  }
}

const cStyles = StyleSheet.create({
  content: {
    flexDirection: 'column', alignItems: 'center',
    width: '100%',
    backgroundColor: 'white',
    paddingTop: 19, paddingBottom: config.isIPhoneX ? 10 : 0,
  },
  assetContent: {
    flexDirection: 'row',
    paddingBottom: 20,
    borderBottomWidth: 0.5, borderBottomColor: '#C1C1C1',
  },
  thumbnailArea: {
    width: 72,
    paddingLeft: convertWidth(17),
  },
  thumbnailImage: {
    width: 30, height: 30, resizeMode: 'cover',
  },
  assetInfo: {
    flex: 1, width: '100%',
  },
  rowInformation: {
    width: '100%',
    flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'flex-start',
    marginTop: 6,
  },
  rowInfoLabel: {
    width: 86,
    fontFamily: 'AvenirNextW1G-Bold', fontWeight: '600', fontSize: 12, lineHeight: 16,
  },
  rowInfoValue: {
    flex: 1,
    fontFamily: 'Andale Mono', fontSize: 12, lineHeight: 14,
    marginLeft: 5,
  },

  actionArea: {
    flexDirection: 'column',
    paddingTop: 20,
  },
  actionRow: {
    marginBottom: 35,
    width: '100%',
    paddingLeft: 22,
    flexDirection: 'row',
  },
  actionRowIcon: {
    width: 19, height: 19, resizeMode: 'contain',
  },
  actionRowText: {
    flex: 1,
    marginLeft: 30,
    fontFamily: 'AvenirNextW1G-Regular', fontSize: 14,
  },


});

const StorePropertyDetailComponent = connect(
  (state) => {
    return state.data;
  },
)(PrivatePropertyDetailComponent);

export class PropertyDetailComponent extends React.Component {
  static propTypes = {
    asset: PropTypes.object,
    bitmark: PropTypes.object,
  }
  constructor(props) {
    super(props);
    let tempState = { asset: this.props.asset, bitmark: this.props.bitmark };
    PropertyStore.dispatch(PropertyActions.init(tempState));
  }
  render() {
    return (
      <Provider store={PropertyStore}>
        <StorePropertyDetailComponent />
      </Provider>
    );
  }
}