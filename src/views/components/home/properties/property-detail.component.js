import React from 'react';
import PropTypes from 'prop-types';
import {
  View, Text, Image, SafeAreaView, ActivityIndicator, ScrollView,
  ViewPropTypes,
  StyleSheet,
} from 'react-native';
import { Provider, connect } from 'react-redux';
import moment from 'moment';

import { OneTabButtonComponent } from 'src/views/commons/one-tab-button.component';
import { convertWidth, isHealthRecord, isMedicalRecord, isImageFile, isVideoFile, isDocFile, isZipFile, } from 'src/utils';
import { constant, config } from 'src/configs';
import { CommonProcessor, CacheData, TransactionProcessor, EventEmitterService } from 'src/processors';
import { Actions } from 'react-native-router-flux';
import { PropertyStore, PropertyActions } from 'src/views/stores';
import { defaultStyles } from 'src/views/commons';



class PrivatePropertyDetailComponent extends React.Component {
  static propTypes = {
    asset: PropTypes.any,
    bitmark: PropTypes.any,
    style: ViewPropTypes.style,
  }

  constructor(props) {
    super(props);
    this.state = {
      copied: false,
      displayTopButton: false,
      provenance: [],
      gettingData: true,
    };
    this.doGetScreenData(this.props.bitmark);
  }

  async doGetScreenData(bitmark) {
    if (!bitmark || !bitmark.id) {
      return;
    }
    let provenance = await TransactionProcessor.doGetProvenance(bitmark.id);
    this.setState({
      provenance, gettingData: false,
    });
  }

  clickOnProvenance(item) {
    let sourceUrl = config.registry_server_url + `/account/${item.owner}?env=app`;
    Actions.bitmarkWebViewFull({ title: 'Registry', sourceUrl, });
  }
  viewActionSheet() {
    EventEmitterService.emit(EventEmitterService.events.APP_SHOW_COVER, {
      type: 'PropertyActionSheetComponent',
      bitmark: this.props.bitmark, asset: this.props.asset,
      fromPropertyDetail: true,
    });
  }

  viewDescription() {
    EventEmitterService.emit(EventEmitterService.events.APP_SHOW_COVER, { type: 'PropertyMetadataComponent', asset: this.props.asset });
  }
  openAsset() {

  }
  transferBitmark() {
    Actions.localPropertyTransfer({ bitmark: this.props.bitmark, asset: this.props.asset });
  }

  render() {
    return (
      <SafeAreaView style={cStyles.body}>
        <View style={[defaultStyles.header, { height: constant.headerSize.height }]}>
          <OneTabButtonComponent style={defaultStyles.headerLeft} onPress={Actions.pop}>
            <Image style={defaultStyles.headerLeftIcon} source={require('assets/imgs/header_blue_icon.png')} />
          </OneTabButtonComponent>
          <View style={defaultStyles.headerCenter}>
            <Text style={[defaultStyles.headerTitle, { maxWidth: convertWidth(180) }]} numberOfLines={1}>YOURS PROPERTIES</Text>
          </View>
          <OneTabButtonComponent style={[defaultStyles.headerRight, { padding: 4, paddingRight: convertWidth(19) }]} onPress={this.viewActionSheet.bind(this)}>
            <Image style={cStyles.threeDotIcon} source={require('assets/imgs/property_setting_blue.png')} />
          </OneTabButtonComponent>
        </View>
        <View style={cStyles.bodyContent}>
          <View style={cStyles.assetInformation}>
            <View style={[cStyles.assetThumbnailArea, this.props.bitmark.status === 'confirmed' ? {} : { opacity: 0.2 }]}>
              {(() => {
                if (this.props.asset.thumbnailPath) {
                  return (<Image style={[cStyles.assetThumbnailImage, { width: 126, height: 126, resizeMode: 'contain', marginBottom: 0 }]}
                    source={{ uri: this.props.asset.thumbnailPath }} />);
                }
                if (isHealthRecord(this.props.asset)) {
                  return (<Image style={cStyles.assetThumbnailImage} source={require('assets/imgs/asset_health_data_icon.png')} />);
                }
                if (isMedicalRecord(this.props.asset)) {
                  return (<Image style={cStyles.assetThumbnailImage} source={require('assets/imgs/asset_medical_record_icon.png')} />);
                }
                if (isImageFile(this.props.asset.filePath)) {
                  return (<Image style={cStyles.assetThumbnailImage} source={require('assets/imgs/asset_image_icon.png')} />);
                }
                if (isVideoFile(this.props.asset.filePath)) {
                  return (<Image style={cStyles.assetThumbnailImage} source={require('assets/imgs/asset_video_icon.png')} />);
                }
                if (isDocFile(this.props.asset.filePath)) {
                  return (<Image style={cStyles.assetThumbnailImage} source={require('assets/imgs/asset_doc_icon.png')} />);
                }
                if (isZipFile(this.props.asset.filePath)) {
                  return (<Image style={cStyles.assetThumbnailImage} source={require('assets/imgs/asset_zip_icon.png')} />);
                }
                return (<Image style={cStyles.assetThumbnailImage} source={require('assets/imgs/asset_unknow_icon.png')} />);
              })()}

            </View>
            <View style={cStyles.assetContent}>
              <View>
                <Text style={[cStyles.assetContentName, this.props.bitmark.status === 'confirmed' ? {} : { opacity: 0.2 }]}>
                  {this.props.asset.name + (this.props.asset.edition ? `${this.props.bitmark.editionNumber || '-'}/${this.props.asset.editions[CacheData.userInformation.bitmarkAccountNumber].limited}` : '')}
                </Text>
                {this.props.bitmark.status === 'confirmed' &&
                  <Text style={cStyles.assetRegister}>ISSUED ON {moment(this.props.bitmark.issued_at).format('YYYY MMM DD').toUpperCase()} by {CommonProcessor.getDisplayedAccount(this.props.bitmark.issuer)} </Text>}
                {(this.props.bitmark.status === 'pending' || this.props.bitmark.status === 'queuing') &&
                  <Text style={[cStyles.assetRegister, { fontFamily: 'AvenirNextW1G-Demi' }]}>Pending...</Text>
                }
              </View>
              <OneTabButtonComponent style={cStyles.viewDescriptionButton} onPress={this.viewDescription.bind(this)}>
                <Text style={cStyles.viewDescriptionButtonText}>VIEW DESCRIPTION</Text>
              </OneTabButtonComponent>
            </View>
          </View>

          <View style={[cStyles.buttonArea, this.props.bitmark.status === 'confirmed' ? {} : { opacity: 0.2 }]}>
            <OneTabButtonComponent style={cStyles.buttonOpen} disabled={this.props.bitmark.status !== 'confirmed'} onPress={this.openAsset.bind(this)}>
              <Image style={cStyles.buttonOpenIcon} source={require('assets/imgs/asset_open_icon.png')} />
              <Text style={cStyles.buttonOpenText}>OPEN</Text>
            </OneTabButtonComponent>
            <OneTabButtonComponent style={cStyles.buttonTransfer} disabled={this.props.bitmark.status !== 'confirmed'} onPress={this.transferBitmark.bind(this)}>
              <Image style={cStyles.buttonTransferIcon} source={require('assets/imgs/transfer_bitmark_icon_blue.png')} />
              <Text style={cStyles.buttonTransferText}>TRANSFER</Text>
            </OneTabButtonComponent>
          </View>

          <View style={cStyles.provenanceArea}>
            <Text style={cStyles.provenanceLabel}>PROVENANCE</Text>
            <View style={[cStyles.provenanceRow, {
              borderBottomColor: '#EDF0F4', borderBottomWidth: 0.5,
              borderTopColor: '#EDF0F4', borderTopWidth: 0.5
            }]}>
              <Text style={[cStyles.provenanceRowItem, this.props.bitmark.status === 'confirmed' ? {} : {
                color: '#545454', fontFamily: 'AvenirNextW1G-Regular'
              }]}>TIMESTAMP</Text>
              <Text style={[cStyles.provenanceRowItem, { marginLeft: convertWidth(19), }, this.props.bitmark.status === 'confirmed' ? {} : {
                color: '#545454', fontFamily: 'AvenirNextW1G-Regular'
              }]}>OWNER</Text>
            </View>
            <ScrollView contentContainerStyle={{ flexGrow: 1, width: '100%', flexDirection: 'column', alignItems: 'center', }}>
              {this.state.gettingData && <ActivityIndicator style={{ marginTop: 42 }} size="large" />}
              {(this.state.provenance || []).map((item, index) => (<OneTabButtonComponent key={index} style={cStyles.provenanceRow}
                onPress={() => this.clickOnProvenance.bind(this)(item)}
                disabled={item.status === 'pending' || item.status === 'queuing'}
              >
                <Text style={[cStyles.provenanceRowItem, {
                  color: (item.status === 'pending' || item.status === 'queuing') ? '#999999' : 'black'
                }]} numberOfLines={1}>
                  {(item.status === 'pending' || item.status === 'queuing') ? 'Waiting to be confirmed...' : (moment(item.created_at).format('YYYY MMM DD HH:mm:ss')).toUpperCase()}
                </Text>

                <Text style={[cStyles.provenanceRowItem, {
                  marginLeft: convertWidth(19),
                  color: (item.status === 'pending' || item.status === 'queuing') ? '#999999' : 'black'
                }]} numberOfLines={1}>
                  {CommonProcessor.getDisplayedAccount(item.owner)}
                </Text>
              </OneTabButtonComponent>))}
            </ScrollView>
          </View>

        </View>
      </SafeAreaView>
    );
  }
}

const cStyles = StyleSheet.create({
  body: {
    flex: 1,
    flexDirection: 'column', alignItems: 'center',
    width: '100%',
    backgroundColor: '#F5F5F5',
  },
  threeDotIcon: {
    width: 18, height: 4.5, resizeMode: 'contain'
  },
  bodyContent: {
    flex: 1, flexDirection: 'column', alignItems: 'center',
    width: '100%',
    backgroundColor: 'white',
  },
  assetInformation: {
    flexDirection: 'row',
    width: '100%',
    marginTop: 30,
  },
  assetThumbnailArea: {
    width: 126, height: 126,
    marginLeft: convertWidth(19),
    alignItems: 'center', justifyContent: 'center',
  },
  assetThumbnailImage: {
    width: 41, height: 33, resizeMode: 'contain',
    marginBottom: 10,
  },
  assetContent: {
    flex: 1, flexDirection: 'column', justifyContent: 'space-between',
    marginLeft: convertWidth(19), marginRight: convertWidth(19),
  },
  assetContentName: {
    fontFamily: 'AvenirNextW1G-Bold', fontSize: 17,
  },
  assetRegister: {
    marginTop: 14,
    fontFamily: 'Andale Mono', fontSize: 12,
  },
  viewDescriptionButton: {
    paddingTop: 5,
  },
  viewDescriptionButtonText: {
    fontFamily: 'AvenirNextW1G-Regular', fontSize: 12, color: '#0060F2',
  },
  buttonArea: {
    marginTop: 30,
    width: '100%',
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingLeft: convertWidth(19), paddingRight: convertWidth(19),
  },
  buttonOpen: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    height: constant.buttonHeight,
    backgroundColor: '#F1F1F1',
  },
  buttonOpenText: {
    fontFamily: 'AvenirNextW1G-Bold', fontSize: 14, color: '#0060F2',
  },
  buttonOpenIcon: {
    width: 18, height: 18, resizeMode: 'contain',
    marginRight: convertWidth(20),
  },
  buttonTransfer: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    height: constant.buttonHeight,
    backgroundColor: '#F1F1F1',
    marginLeft: convertWidth(19),
  },
  buttonTransferText: {
    fontFamily: 'AvenirNextW1G-Bold', fontSize: 14, color: '#0060F2',
  },
  buttonTransferIcon: {
    width: 18, height: 18, resizeMode: 'contain',
    marginRight: convertWidth(20),
  },

  provenanceArea: {
    flex: 1, flexDirection: 'column', alignItems: 'center', width: '100%',
    marginTop: 30,
    paddingLeft: convertWidth(19), paddingRight: convertWidth(19),
  },
  provenanceLabel: {
    width: '100%',
    height: 27,
  },
  provenanceRow: {
    flexDirection: 'row',
    width: '100%',
    paddingTop: 10, paddingBottom: 10,
  },
  provenanceRowItem: {
    fontFamily: 'Andale Mono', fontSize: 13,
    flex: 1,
  },

});

const StorePropertyDetailComponent = connect(
  (state) => state.data
)(PrivatePropertyDetailComponent);

export class PropertyDetailComponent extends React.Component {
  static propTypes = {
    asset: PropTypes.object,
    bitmark: PropTypes.object,
  }
  constructor(props) {
    super(props);

    console.log('props:', props);
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