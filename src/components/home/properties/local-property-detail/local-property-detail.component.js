import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { Provider, connect } from 'react-redux';
import {
  View, Text, TouchableOpacity, Image, FlatList, ScrollView, ActivityIndicator, TouchableWithoutFeedback, SafeAreaView,
  Clipboard,
  Share,
  Alert,
} from 'react-native';
import Hyperlink from 'react-native-hyperlink';

import { convertWidth } from './../../../../utils';

import propertyDetailStyle from './local-property-detail.component.style';
import defaultStyle from './../../../../commons/styles';
import { AppProcessor } from '../../../../processors/app-processor';
import { EventEmitterService } from '../../../../services';
import { config } from '../../../../configs';
import { DataProcessor } from '../../../../processors/data-processor';
import { BitmarkModel } from '../../../../models';
import { PropertyStore, PropertyActions } from '../../../../stores';
import { Actions } from 'react-native-router-flux';
import { iosConstant } from '../../../../configs/ios/ios.config';

class PrivateLocalPropertyDetailComponent extends React.Component {
  constructor(props) {
    super(props);
    this.downloadAsset = this.downloadAsset.bind(this);
    this.clickOnProvenance = this.clickOnProvenance.bind(this);
    this.changeTrackingBitmark = this.changeTrackingBitmark.bind(this);
    this.doGetScreenData = this.doGetScreenData.bind(this);

    let provenanceViewed = {};
    this.state = {
      provenanceViewed,
      copied: false,
      displayTopButton: false,
      provenance: [],
      gettingData: true,
    };
    this.doGetScreenData(this.props.bitmark);
  }
  async doGetScreenData(bitmark) {
    let provenance = await DataProcessor.doGetProvenance(bitmark.id);
    let provenanceViewed = {};
    provenance.forEach((history, index) => {
      history.key = index;
      provenanceViewed[history.tx_id] = history.isViewed;
    });

    if (DataProcessor.getUserInformation().bitmarkAccountNumber === this.props.bitmark.owner) {
      DataProcessor.doUpdateViewStatus(this.props.asset.id, this.props.bitmark.id);
    } else {
      DataProcessor.doUpdateViewStatus(null, this.props.bitmark.id);
    }

    // Augment info for asset preview
    let contentType = await BitmarkModel.doGetAssetTextContentType(this.props.asset.id);
    let assetTextContent;
    if (contentType && contentType === 'text') {
      assetTextContent = await BitmarkModel.doGetAssetTextContent(this.props.asset.id);
    }

    this.setState({
      contentType,
      assetTextContent,
      provenance, provenanceViewed, gettingData: false,
    });
  }

  downloadAsset() {
    if (this.props.asset.filePath) {
      Share.share({ title: this.props.asset.name, url: this.props.asset.filePath });
    } else {
      AppProcessor.doDownloadBitmark(this.props.bitmark, {
        indicator: true, title: global.i18n.t("LocalPropertyDetailComponent_preparingToExport"), message: global.i18n.t("LocalPropertyDetailComponent_downloadingFile", { fileName: this.props.asset.name })
      }).then(filePath => {
        if (filePath) {
          Share.share({ title: this.props.asset.name, url: filePath });
        }
      }).catch(error => {
        EventEmitterService.emit(EventEmitterService.events.APP_PROCESS_ERROR, { title: global.i18n.t("LocalPropertyDetailComponent_notReadyToDownload") });
        console.log('doDownload asset error :', error);
      });
    }
  }

  clickOnProvenance(item) {
    let sourceUrl = config.registry_server_url + `/account/${item.owner}?env=app`;
    Actions.bitmarkWebViewFull({ title: 'Registry', sourceUrl, });
  }

  changeTrackingBitmark() {
    if (!this.props.isTracking) {
      Alert.alert(global.i18n.t("LocalPropertyDetailComponent_trackBitmarkTitle"), global.i18n.t("LocalPropertyDetailComponent_trackBitmarkMessage"), [{
        text: global.i18n.t("LocalPropertyDetailComponent_cancel"), style: 'cancel',
      }, {
        text: global.i18n.t("LocalPropertyDetailComponent_yes"),
        onPress: () => {
          AppProcessor.doTrackingBitmark(this.props.asset, this.props.bitmark).catch(error => {
            EventEmitterService.emit(EventEmitterService.events.APP_PROCESS_ERROR, { error });
            console.log('doTrackingBitmark error :', error);
          });
        }
      }]);
    } else {
      Alert.alert(global.i18n.t("LocalPropertyDetailComponent_stopTrackingTitle"), global.i18n.t("LocalPropertyDetailComponent_stopTrackingMessage"), [{
        text: global.i18n.t("LocalPropertyDetailComponent_cancel"), style: 'cancel',
      }, {
        text: global.i18n.t("LocalPropertyDetailComponent_yes"),
        onPress: () => {
          AppProcessor.doStopTrackingBitmark(this.props.bitmark).catch(error => {
            EventEmitterService.emit(EventEmitterService.events.APP_PROCESS_ERROR, { error });
            console.log('doTrackingBitmark error :', error);
          });
        }
      }]);
    }
  }

  render() {
    console.log(this.props);
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#F5F5F5' }}>
        <TouchableWithoutFeedback onPress={() => this.setState({ displayTopButton: false })}><View style={[defaultStyle.header, { height: iosConstant.headerSize.height }]}>
          <TouchableOpacity style={defaultStyle.headerLeft} onPress={Actions.pop}>
            <Image style={defaultStyle.headerLeftIcon} source={require('../../../../../assets/imgs/header_blue_icon.png')} />
          </TouchableOpacity>
          <View style={defaultStyle.headerCenter}>
            <Text style={[defaultStyle.headerTitle, { maxWidth: convertWidth(180), }]} numberOfLines={1}>{this.props.asset.name} </Text>
            {this.props.asset.bitmarks && this.props.asset.bitmarks.length > 0 && <Text style={[defaultStyle.headerTitle]}>({this.props.asset.bitmarks.indexOf(this.props.bitmark) + 1}/{this.props.asset.bitmarks.length})</Text>}
          </View>
          <TouchableOpacity style={[defaultStyle.headerRight, { padding: 4 }]} onPress={() => this.setState({ displayTopButton: !this.state.displayTopButton })}>
            <Image style={propertyDetailStyle.threeDotIcon} source={this.state.displayTopButton
              ? require('../../../../../assets/imgs/three-dot-active.png')
              : require('../../../../../assets/imgs/three-dot-deactive.png')} />
          </TouchableOpacity>
        </View></TouchableWithoutFeedback>
        {/* <Text>{this.props.bitmark.owner + '\n' + DataProcessor.getUserInformation().bitmarkAccountNumber + '\n' + (this.props.bitmark.owner === DataProcessor.getUserInformation().bitmarkAccountNumber).toString()}</Text> */}
        <TouchableWithoutFeedback onPress={() => this.setState({ displayTopButton: false })}><View style={propertyDetailStyle.body}>
          {this.state.displayTopButton && <View style={propertyDetailStyle.topButtonsArea}>
            {this.props.bitmark.owner === DataProcessor.getUserInformation().bitmarkAccountNumber && <TouchableOpacity
              style={propertyDetailStyle.downloadAssetButton}
              disabled={!this.props.asset.filePath && this.props.bitmark.status !== 'confirmed'}
              onPress={this.downloadAsset}
            >
              {!this.props.asset.filePath && <Text style={[propertyDetailStyle.downloadAssetButtonText, this.props.bitmark.status !== 'confirmed' ? { color: '#A4B5CD', } : {}]}>
                {global.i18n.t("LocalPropertyDetailComponent_downloadAsset")}
              </Text>}
              {this.props.asset.filePath && <Text style={propertyDetailStyle.downloadAssetButtonText}>{global.i18n.t("LocalPropertyDetailComponent_shareAsset")}</Text>}
            </TouchableOpacity>}
            <TouchableOpacity style={propertyDetailStyle.topButton} onPress={() => {
              Clipboard.setString(this.props.bitmark.id);
              this.setState({ copied: true });
              setTimeout(() => { this.setState({ copied: false }) }, 1000);
            }}>
              <Text style={propertyDetailStyle.topButtonText}>{global.i18n.t("LocalPropertyDetailComponent_copyBitmarkId")}</Text>
              {this.state.copied && <Text style={propertyDetailStyle.copiedAssetIddButtonText}>{global.i18n.t("LocalPropertyDetailComponent_copiedToClipboard")}</Text>}
            </TouchableOpacity>
            {this.props.bitmark.owner === DataProcessor.getUserInformation().bitmarkAccountNumber && !this.props.bitmark.transferOfferId &&
              <TouchableOpacity style={propertyDetailStyle.topButton}
                disabled={this.props.bitmark.status !== 'confirmed'}
                onPress={() => Actions.localPropertyTransfer({ bitmark: this.props.bitmark, asset: this.props.asset })}>
                <Text style={[propertyDetailStyle.topButtonText, {
                  color: this.props.bitmark.status === 'confirmed' ? '#0060F2' : '#C2C2C2'
                }]}>{global.i18n.t("LocalPropertyDetailComponent_sendBitmark")}</Text>
              </TouchableOpacity>
            }
            <TouchableOpacity style={propertyDetailStyle.topButton} onPress={this.changeTrackingBitmark}>
              <Text style={[propertyDetailStyle.topButtonText]}>{this.props.isTracking ? global.i18n.t("LocalPropertyDetailComponent_stopTracking") : global.i18n.t("LocalPropertyDetailComponent_trackBitmark")}</Text>
            </TouchableOpacity>
          </View>}
          <ScrollView style={propertyDetailStyle.content}>
            <TouchableOpacity activeOpacity={1} style={{ flex: 1 }} onPress={() => this.setState({ displayTopButton: false })}>
              <View style={propertyDetailStyle.bottomImageBar}></View>
              <Text style={[propertyDetailStyle.assetName, { color: this.props.bitmark.status === 'pending' ? '#999999' : 'black' }]}>{this.props.asset.name}</Text>

              {this.props.bitmark.status !== 'pending' && <Hyperlink
                onPress={(url) => {
                  if (this.props.bitmark.status === 'confirmed') {
                    Actions.bitmarkWebViewFull({ title: global.i18n.t("LocalPropertyDetailComponent_registry"), sourceUrl: url });
                  }
                }}
                linkStyle={{ color: this.props.bitmark.status === 'pending' ? '#999999' : '#0060F2' }}
                linkText={url => {
                  if (url === `${config.registry_server_url}/account/${this.props.bitmark.issuer}`) {
                    if (this.props.bitmark.issuer === DataProcessor.getUserInformation().bitmarkAccountNumber) {
                      return global.i18n.t("LocalPropertyDetailComponent_you");
                    }
                    return `[${this.props.bitmark.issuer.substring(0, 4)}...${this.props.bitmark.issuer.substring(this.props.bitmark.issuer.length - 4, this.props.bitmark.issuer.length)}]`;
                  }
                  return '';
                }}>
                <Text style={[propertyDetailStyle.assetCreateAt]}>
                  {global.i18n.t("LocalPropertyDetailComponent_issuedOn", { time: moment(this.props.bitmark.created_at).format('YYYY MMM DD HH:mm:ss').toUpperCase() })}{'\n'}{global.i18n.t("LocalPropertyDetailComponent_byAccountNumber", { accountNumber: `${config.registry_server_url}/account/${this.props.bitmark.issuer}` })}
                </Text>
              </Hyperlink>}

              {this.props.bitmark.status === 'pending' && <Text style={[propertyDetailStyle.assetCreateAt, { color: '#999999' }]}>
                {global.i18n.t("LocalPropertyDetailComponent_pending")}

              </Text>}

              {this.props.asset && Object.keys(this.props.asset.metadata).length > 0 && <View style={propertyDetailStyle.metadataArea}>
                {Object.keys(this.props.asset.metadata).map((label, index) => (
                  <View key={index} style={[propertyDetailStyle.metadataItem, { marginBottom: index === Object.keys(this.props.asset.metadata).length ? 0 : 15 }]}>
                    <Text style={[propertyDetailStyle.metadataItemLabel, { color: this.props.bitmark.status === 'pending' ? '#999999' : 'black' }]}>{label.toUpperCase()}:</Text>
                    <Text style={[propertyDetailStyle.metadataItemValue, { color: this.props.bitmark.status === 'pending' ? '#999999' : 'black' }]}>{this.props.asset.metadata[label]}</Text>
                  </View>
                ))}
              </View>}

              {/*Preview*/}
              {/*Text preview*/}
              {this.state.contentType && this.state.contentType === 'text' &&
                <ScrollView style={propertyDetailStyle.assetPreview}>
                  <TouchableOpacity style={{ flex: 1 }}>
                    {this.state.assetTextContent &&
                      <Text>{this.state.assetTextContent}</Text>
                    }
                  </TouchableOpacity>
                </ScrollView>
              }
              {/*Image preview*/}
              {this.state.contentType && this.state.contentType === 'image' &&
                <View style={propertyDetailStyle.assetPreview}>
                  <Image
                    style={{ width: 125, height: 125 }}
                    source={{ uri: `${config.preview_asset_url}/${this.props.asset.id}` }}
                  />
                </View>
              }


              <Text style={[propertyDetailStyle.provenanceLabel]}>{global.i18n.t("LocalPropertyDetailComponent_provenance")}</Text>
              <View style={propertyDetailStyle.provenancesArea}>
                <View style={propertyDetailStyle.provenancesHeader}>
                  <Text style={propertyDetailStyle.provenancesHeaderLabelTimestamp}>{global.i18n.t("LocalPropertyDetailComponent_timestamp")}</Text>
                  <Text style={propertyDetailStyle.provenancesHeaderLabelOwner}>{global.i18n.t("LocalPropertyDetailComponent_owner")}</Text>
                </View>
                <View style={propertyDetailStyle.provenanceListArea}>
                  <FlatList
                    scrollEnabled={false}
                    extraData={this.state}
                    data={this.state.provenance || []}
                    renderItem={({ item }) => {
                      return (<TouchableOpacity style={propertyDetailStyle.provenancesRow} onPress={() => this.clickOnProvenance(item)} disabled={item.status === 'pending'}>
                        {this.props.isTracking && !this.state.provenanceViewed[item.tx_id] && !item.isViewed && <View style={propertyDetailStyle.provenancesNotView}></View>}
                        <Text style={[propertyDetailStyle.provenancesRowTimestamp, { color: item.status === 'pending' ? '#999999' : '#0060F2' }]} numberOfLines={1}>
                          {item.status === 'pending' ? global.i18n.t("LocalPropertyDetailComponent_pending") : item.created_at.toUpperCase()}
                        </Text>
                        <View style={propertyDetailStyle.provenancesRowOwnerRow}>
                          <Text style={[propertyDetailStyle.provenancesRowOwner, { color: item.status === 'pending' ? '#999999' : '#0060F2' }]} numberOfLines={1}>
                            {item.owner === DataProcessor.getUserInformation().bitmarkAccountNumber ? global.i18n.t("LocalPropertyDetailComponent_you") : '[' + item.owner.substring(0, 4) + '...' + item.owner.substring(item.owner.length - 4, item.owner.length) + ']'}
                          </Text>
                        </View>
                      </TouchableOpacity>);
                    }}
                  />
                  {this.state.gettingData && <ActivityIndicator style={{ marginTop: 42 }} size="large" />}
                </View>
              </View>
            </TouchableOpacity>
          </ScrollView>
        </View></ TouchableWithoutFeedback>
      </SafeAreaView>
    );
  }
}

PrivateLocalPropertyDetailComponent.propTypes = {
  bitmark: PropTypes.object,
  asset: PropTypes.object,
  isTracking: PropTypes.bool,
};

const StoreLocalPropertyDetailComponent = connect(
  (state) => {
    return state.data;
  },
)(PrivateLocalPropertyDetailComponent);

export class LocalPropertyDetailComponent extends React.Component {
  static propTypes = {
    asset: PropTypes.object,
    bitmark: PropTypes.object,
  }
  constructor(props) {
    super(props);
    let tempState = { asset: this.props.asset, bitmark: this.props.bitmark };
    PropertyStore.dispatch(PropertyActions.init(tempState));
    if (this.props.bitmark && this.props.bitmark.id) {
      DataProcessor.doGetTrackingBitmarkInformation(this.props.bitmark.id).then(data => {
        tempState.isTracking = !!data;
        PropertyStore.dispatch(PropertyActions.init(tempState));
      }).catch(error => {
        console.log('doGetTrackingBitmarkInformation error', error);
      })
    }
  }
  render() {
    return (
      <View style={{ flex: 1 }}>
        <Provider store={PropertyStore}>
          <StoreLocalPropertyDetailComponent />
        </Provider>
      </View>
    );
  }
}