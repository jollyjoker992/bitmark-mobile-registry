import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { Provider, connect } from 'react-redux';
import {
  View, Text, TouchableOpacity, Image, FlatList, ScrollView, ActivityIndicator, TouchableWithoutFeedback,
  Clipboard,
  Share,
  Alert,
} from 'react-native';
import Hyperlink from 'react-native-hyperlink';

import { BitmarkComponent } from './../../../../commons/components';
import { convertWidth } from './../../../../utils';

import propertyDetailStyle from './local-property-detail.component.style';
import defaultStyle from './../../../../commons/styles';
import { AppProcessor } from '../../../../processors/app-processor';
import { EventEmitterService } from '../../../../services';
import { config } from '../../../../configs';
import { DataProcessor } from '../../../../processors/data-processor';
import { BitmarkModel } from '../../../../models';
import { PropertyStore, PropertyActions } from '../../../../stores';

class PrivateLocalPropertyDetailComponent extends React.Component {
  constructor(props) {
    super(props);
    this.downloadAsset = this.downloadAsset.bind(this);
    this.clickOnProvenance = this.clickOnProvenance.bind(this);
    this.changeTrackingBitmark = this.changeTrackingBitmark.bind(this);
    this.doGetScreenData = this.doGetScreenData.bind(this);

    console.log('PrivateLocalPropertyDetailComponent props', props);
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
    AppProcessor.doDownloadBitmark(this.props.bitmark, {
      indicator: true, title: 'Preparing to export...', message: `Downloading “${this.props.asset.name}”...`
    }).then(filePath => {
      if (filePath) {
        Share.share({ title: this.props.asset.name, url: filePath });
      }
    }).catch(error => {
      EventEmitterService.emit(EventEmitterService.events.APP_PROCESS_ERROR, { title: "Your bitmark isn't ready to download.\nPlease try again later." });
      console.log('doDownload asset error :', error);
    });
  }

  clickOnProvenance(item) {
    let sourceUrl = config.registry_server_url + `/account/${item.owner}?env=app`;
    this.props.navigation.navigate('BitmarkWebView', { title: 'Registry', sourceUrl, isFullScreen: true });
  }

  changeTrackingBitmark() {
    if (!this.props.isTracking) {
      Alert.alert('Track This Bitmark', 'By tracking a bitmark you can always view the latest bitmarks status in the tracked properties list, are you sure you want to do it?', [{
        text: 'Cancel', style: 'cancel',
      }, {
        text: 'YES',
        onPress: () => {
          AppProcessor.doTrackingBitmark(this.props.asset, this.props.bitmark).catch(error => {
            EventEmitterService.emit(EventEmitterService.events.APP_PROCESS_ERROR, { error });
            console.log('doTrackingBitmark error :', error);
          });
        }
      }]);
    } else {
      Alert.alert('Stop Tracking', 'If you stop tracking a bitmark, the bitmark will be removed from the tracked list, are you sure you want to do it?', [{
        text: 'Cancel', style: 'cancel',
      }, {
        text: 'YES',
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
    return (
      <BitmarkComponent
        header={(<TouchableWithoutFeedback onPress={() => this.setState({ displayTopButton: false })}><View style={defaultStyle.header}>
          <TouchableOpacity style={defaultStyle.headerLeft} onPress={() => this.props.navigation.goBack()}>
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
        </View></TouchableWithoutFeedback>)}
        content={(<TouchableWithoutFeedback onPress={() => this.setState({ displayTopButton: false })}><View style={propertyDetailStyle.body}>
          {this.state.displayTopButton && <View style={propertyDetailStyle.topButtonsArea}>
            {this.props.bitmark.owner === DataProcessor.getUserInformation().bitmarkAccountNumber && <TouchableOpacity style={propertyDetailStyle.downloadAssetButton} disabled={this.props.bitmark.status !== 'confirmed'} onPress={this.downloadAsset}>
              <Text style={[propertyDetailStyle.downloadAssetButtonText, { color: this.props.bitmark.status === 'confirmed' ? '#0060F2' : '#A4B5CD', }]}>DOWNLOAD ASSET</Text>
            </TouchableOpacity>}
            <TouchableOpacity style={propertyDetailStyle.topButton} onPress={() => {
              Clipboard.setString(this.props.bitmark.id);
              this.setState({ copied: true });
              setTimeout(() => { this.setState({ copied: false }) }, 1000);
            }}>
              <Text style={propertyDetailStyle.topButtonText}>COPY BITMARK ID</Text>
              {this.state.copied && <Text style={propertyDetailStyle.copiedAssetIddButtonText}>Copied to clipboard!</Text>}
            </TouchableOpacity>
            {this.props.bitmark.owner === DataProcessor.getUserInformation().bitmarkAccountNumber && !this.props.bitmark.transferOfferId &&
              <TouchableOpacity style={propertyDetailStyle.topButton}
                disabled={this.props.bitmark.status !== 'confirmed'}
                onPress={() => this.props.navigation.navigate('LocalPropertyTransfer', { bitmark: this.props.bitmark, asset: this.props.asset })}>
                <Text style={[propertyDetailStyle.topButtonText, {
                  color: this.props.bitmark.status === 'confirmed' ? '#0060F2' : '#C2C2C2'
                }]}>SEND BITMARK</Text>
              </TouchableOpacity>
            }
            <TouchableOpacity style={propertyDetailStyle.topButton} onPress={this.changeTrackingBitmark}>
              <Text style={[propertyDetailStyle.topButtonText]}>{this.props.isTracking ? 'STOP TRACKING' : 'TRACK BITMARK'}</Text>
            </TouchableOpacity>

          </View>}
          <ScrollView style={propertyDetailStyle.content}>
            <TouchableOpacity activeOpacity={1} style={{ flex: 1 }} onPress={() => this.setState({ displayTopButton: false })}>
              <View style={propertyDetailStyle.bottomImageBar}></View>
              <Text style={[propertyDetailStyle.assetName, { color: this.props.bitmark.status === 'pending' ? '#999999' : 'black' }]}>{this.props.asset.name}</Text>

              {this.props.bitmark.status !== 'pending' && <Hyperlink
                onPress={(url) => {
                  if (this.props.bitmark.status === 'confirmed') {
                    this.props.navigation.navigate('BitmarkWebView', { title: 'REGISTRY', sourceUrl: url, isFullScreen: true, });
                  }
                }}
                linkStyle={{ color: this.props.bitmark.status === 'pending' ? '#999999' : '#0060F2' }}
                linkText={url => {
                  if (url === `${config.registry_server_url}/account/${this.props.bitmark.issuer}`) {
                    if (this.props.bitmark.issuer === DataProcessor.getUserInformation().bitmarkAccountNumber) {
                      return 'YOU';
                    }
                    return `[${this.props.bitmark.issuer.substring(0, 4)}...${this.props.bitmark.issuer.substring(this.props.bitmark.issuer.length - 4, this.props.bitmark.issuer.length)}]`;
                  }
                  return '';
                }}>
                <Text style={[propertyDetailStyle.assetCreateAt]}>
                  ISSUED ON {moment(this.props.bitmark.created_at).format('YYYY MMM DD HH:mm:ss').toUpperCase()}{'\n'}BY {`${config.registry_server_url}/account/${this.props.bitmark.issuer}`}
                </Text>
              </Hyperlink>}

              {this.props.bitmark.status === 'pending' && <Text style={[propertyDetailStyle.assetCreateAt, { color: '#999999' }]}>
                PENDING....
              </Text>}

              {this.props.asset && Object.keys(this.props.asset.metadata).length > 0 && <View style={propertyDetailStyle.metadataArea}>
                {Object.keys(this.props.asset.metadata).map((label, index) => (
                  <View key={label} style={[propertyDetailStyle.metadataItem, { marginBottom: index === Object.keys(this.props.asset.metadata).length ? 0 : 15 }]}>
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


              <Text style={[propertyDetailStyle.provenanceLabel]}>PROVENANCE</Text>
              <View style={propertyDetailStyle.provenancesArea}>
                <View style={propertyDetailStyle.provenancesHeader}>
                  <Text style={propertyDetailStyle.provenancesHeaderLabelTimestamp}>TIMESTAMP</Text>
                  <Text style={propertyDetailStyle.provenancesHeaderLabelOwner}>OWNER</Text>
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
                          {item.status === 'pending' ? 'PENDING…' : item.created_at.toUpperCase()}
                        </Text>
                        <View style={propertyDetailStyle.provenancesRowOwnerRow}>
                          <Text style={[propertyDetailStyle.provenancesRowOwner, { color: item.status === 'pending' ? '#999999' : '#0060F2' }]} numberOfLines={1}>
                            {item.owner === DataProcessor.getUserInformation().bitmarkAccountNumber ? 'YOU' : '[' + item.owner.substring(0, 4) + '...' + item.owner.substring(item.owner.length - 4, item.owner.length) + ']'}
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
        </View></ TouchableWithoutFeedback>)}
      />
    );
  }
}

PrivateLocalPropertyDetailComponent.propTypes = {
  bitmark: PropTypes.object,
  asset: PropTypes.object,
  isTracking: PropTypes.bool,
  navigation: PropTypes.shape({
    navigate: PropTypes.func,
    goBack: PropTypes.func,
    state: PropTypes.shape({
      params: PropTypes.shape({
        asset: PropTypes.object,
        bitmark: PropTypes.object,
      }),
    }),
  }),
};

const StoreLocalPropertyDetailComponent = connect(
  (state) => {
    return state.data;
  },
)(PrivateLocalPropertyDetailComponent);

export class LocalPropertyDetailComponent extends React.Component {
  static propTypes = {
    navigation: PropTypes.shape({
      navigate: PropTypes.func,
      goBack: PropTypes.func,
      state: PropTypes.shape({
        params: PropTypes.shape({
          asset: PropTypes.object,
          bitmark: PropTypes.object,
        }),
      }),
    }),
  }
  constructor(props) {
    super(props);
    let params = this.props.navigation.state.params;
    PropertyStore.dispatch(PropertyActions.init(params));
    if (params.bitmark && params.bitmark.id) {
      DataProcessor.doGetTrackingBitmarkInformation(params.bitmark.id).then(data => {
        params.isTracking = !!data;
        PropertyStore.dispatch(PropertyActions.init(params));
      }).catch(error => {
        console.log('doGetTrackingBitmarkInformation error', error);
      })
    }
  }
  render() {
    return (
      <View style={{ flex: 1 }}>
        <Provider store={PropertyStore}>
          <StoreLocalPropertyDetailComponent navigation={this.props.navigation} />
        </Provider>
      </View>
    );
  }
}