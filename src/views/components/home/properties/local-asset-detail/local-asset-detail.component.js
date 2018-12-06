import moment from 'moment';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  View, Text, TouchableOpacity, Image, ScrollView, TouchableWithoutFeedback, SafeAreaView,
  Clipboard,
  Share,
  Alert,
} from 'react-native';
import Hyperlink from 'react-native-hyperlink';
import { Provider, connect } from 'react-redux';
import assetDetailStyle from './local-asset-detail.component.style';
import { Actions } from 'react-native-router-flux';
import { BitmarkModel, AppProcessor, EventEmitterService, CacheData } from 'src/processors';
import { runPromiseWithoutError, convertWidth } from 'src/utils';
import { defaultStyles } from 'src/views/commons';
import { config, constant } from 'src/configs';
import { AssetStore, AssetActions } from 'src/views/stores';



class PrivateLocalAssetDetailComponent extends React.Component {
  constructor(props) {
    super(props);
    this.cancelTransferring = this.cancelTransferring.bind(this);

    this.state = {
      displayTopButton: false,
      copied: false,
      assetTextContent: '',
    };
  }

  componentDidMount() {
    // Augment info for asset preview
    let doGetContentAsset = async () => {
      let contentType = await BitmarkModel.doGetAssetTextContentType(this.props.asset.id);
      if (contentType && contentType === 'text') {
        let text = await BitmarkModel.doGetAssetTextContent(this.props.asset.id);
        this.setState({ assetTextContent: text });
      }
      this.setState({ contentType });
    };
    runPromiseWithoutError(doGetContentAsset());
  }

  cancelTransferring(bitmark) {
    let title = global.i18n.t("LocalAssetDetailComponent_cancelSendRequestTitle");
    let message = global.i18n.t("LocalAssetDetailComponent_cancelSendRequestMessage");
    let faceTouchMessage;

    Alert.alert(title, message, [{
      text: global.i18n.t("LocalAssetDetailComponent_cancel"), style: 'cancel',
    }, {
      text: global.i18n.t("LocalAssetDetailComponent_yes"),
      onPress: () => {
        AppProcessor.doCancelTransferBitmark(bitmark.transferOfferId, faceTouchMessage).catch(error => {
          console.log('cancel transferring bitmark error :', error);
          EventEmitterService.emit(EventEmitterService.events.APP_PROCESS_ERROR, {
            onClose: async () => {
              AppProcessor.doReloadUserData().catch(error => {
                console.log('AppProcessor.doReloadUserData error', error);
              });
            },
            error
          });
        });
      }
    }]);
  }

  downloadAsset() {
    AppProcessor.doDownloadBitmark(this.props.bitmarkCanDownload, {
      indicator: true, title: global.i18n.t("LocalAssetDetailComponent_preparingToExport"), message: global.i18n.t("LocalAssetDetailComponent_downloadingFile", { fileName: this.props.asset.name })
    }).then(filePath => {
      if (filePath) {
        Share.share({ title: this.props.asset.name, url: filePath });
      }
    }).catch(error => {
      EventEmitterService.emit(EventEmitterService.events.APP_PROCESS_ERROR, { title: global.i18n.t("LocalAssetDetailComponent_notReadyToDownload") });
      console.log('doDownload asset error :', error);
    });
  }

  shareAssetFile() {
    if (this.props.asset.filePath) {
      Share.share({ title: this.props.asset.name, url: this.props.asset.filePath });
    } else {
      this.downloadAsset();
    }
  }

  render() {
    if (!this.props.asset) {
      Actions.pop();
    }
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#F5F5F5', }}>
        <TouchableWithoutFeedback onPress={() => this.setState({ displayTopButton: false })}><View style={[defaultStyles.header, { height: constant.headerSize.height }]}>
          <TouchableOpacity style={defaultStyles.headerLeft} onPress={Actions.pop}>
            <Image style={defaultStyles.headerLeftIcon} source={require('assets/imgs/header_blue_icon.png')} />
          </TouchableOpacity>
          <Text style={[defaultStyles.headerTitle]} numberOfLines={1}>{this.props.asset.name}</Text>
          <TouchableOpacity style={defaultStyles.headerRight} onPress={() => this.setState({ displayTopButton: !this.state.displayTopButton })}>
            <Image style={assetDetailStyle.threeDotIcon} source={this.state.displayTopButton
              ? require('assets/imgs/three-dot-active.png')
              : require('assets/imgs/three-dot-deactive.png')} />
          </TouchableOpacity>
        </View></TouchableWithoutFeedback>

        <TouchableWithoutFeedback onPress={() => this.setState({ displayTopButton: false })}><View style={assetDetailStyle.body}>
          {this.state.displayTopButton && <View style={assetDetailStyle.topButtonsArea}>
            <TouchableOpacity style={assetDetailStyle.downloadAssetButton} disabled={!this.props.bitmarkCanDownload && !this.props.asset.filePath} onPress={this.shareAssetFile.bind(this)}>
              {this.props.asset.filePath && <Text style={[assetDetailStyle.downloadAssetButtonText]}>
                {global.i18n.t("LocalAssetDetailComponent_shareAssetButtonText")}
              </Text>}
              {!this.props.asset.filePath && <Text style={[assetDetailStyle.downloadAssetButtonText, !this.props.bitmarkCanDownload ? { color: '#A4B5CD' } : {}]}>
                {global.i18n.t("LocalAssetDetailComponent_downloadAssetButtonText")}
              </Text>}
            </TouchableOpacity>
            <TouchableOpacity style={assetDetailStyle.copyAssetIddButton} onPress={() => {
              Clipboard.setString(this.props.asset.id);
              this.setState({ copied: true });
              setTimeout(() => { this.setState({ copied: false }) }, 1000);
            }}>
              <Text style={assetDetailStyle.copyAssetIddButtonText}>{global.i18n.t("LocalAssetDetailComponent_copyAssetIddButtonText")}</Text>
              {this.state.copied && <Text style={assetDetailStyle.copiedAssetIddButtonText}>{global.i18n.t("LocalAssetDetailComponent_copiedAssetIddButtonText")}</Text>}
            </TouchableOpacity>
          </View>}
          <ScrollView style={assetDetailStyle.content}>
            <TouchableOpacity activeOpacity={1} style={{ flex: 1 }} onPress={() => this.setState({ displayTopButton: false })}>
              <View style={assetDetailStyle.bottomImageBar}></View>

              <Text style={[assetDetailStyle.assetName, { color: this.props.asset.created_at ? 'black' : '#999999' }]} >{this.props.asset.name}</Text>
              <View style={assetDetailStyle.assetCreatorRow}>
                <Text style={[assetDetailStyle.assetCreatorBound, { color: this.props.asset.created_at ? 'black' : '#999999' }]}>
                  {this.props.asset.created_at ? (global.i18n.t("LocalAssetDetailComponent_registeredOn") + moment(this.props.asset.created_at).format('YYYY MMM DD HH:mm:ss').toUpperCase()) : global.i18n.t("LocalAssetDetailComponent_registering")}
                </Text>
                <Hyperlink
                  onPress={(url) => {
                    if (this.props.asset.created_at) {
                      Actions.bitmarkWebViewFull({ title: global.i18n.t("LocalAssetDetailComponent_registry"), sourceUrl: url, });
                    }
                  }}
                  linkStyle={{ color: this.props.asset.created_at ? '#0060F2' : '#999999' }}
                  linkText={url => {
                    if (url === `${config.registry_server_url}/account/${this.props.asset.registrant}`) {
                      if (this.props.asset.registrant === CacheData.userInformation.bitmarkAccountNumber) {
                        return global.i18n.t("LocalAssetDetailComponent_you");
                      }
                      return `[${this.props.asset.registrant.substring(0, 4)}...${this.props.asset.registrant.substring(this.props.asset.registrant.length - 4, this.props.asset.registrant.length)}]`;
                    }
                    return '';
                  }}>
                  <Text style={[assetDetailStyle.assetCreatorBound, { color: this.props.asset.created_at ? 'black' : '#999999' }]}>{global.i18n.t("LocalAssetDetailComponent_byAccountnumber", { accountNumber: `${config.registry_server_url}/account/${this.props.asset.registrant}` })}</Text>
                </Hyperlink>
              </View>

              {this.props.asset && Object.keys(this.props.asset.metadata).length > 0 && <View style={assetDetailStyle.metadataArea}>
                {Object.keys(this.props.asset.metadata).map((label, index) => (
                  <View key={index} style={[assetDetailStyle.metadataItem, { marginBottom: index === Object.keys(this.props.asset.metadata).length ? 0 : 15 }]}>
                    <Text style={[assetDetailStyle.metadataItemLabel, { color: this.props.asset.created_at ? 'black' : '#999999' }]}>{label.toUpperCase()}:</Text>
                    <Text style={[assetDetailStyle.metadataItemValue, { color: this.props.asset.created_at ? 'black' : '#999999' }]}>{this.props.asset.metadata[label]}</Text>
                  </View>
                ))}
              </View>}

              {/*Preview*/}
              {/*Text preview*/}
              {this.state.contentType && this.state.contentType === 'text' &&
                <ScrollView style={assetDetailStyle.assetPreview}>
                  <TouchableOpacity style={{ flex: 1 }}>
                    {this.state.assetTextContent &&
                      <Text>{this.state.assetTextContent}</Text>
                    }
                  </TouchableOpacity>
                </ScrollView>
              }
              {/*Image preview*/}
              {this.state.contentType && this.state.contentType === 'image' &&
                <View style={assetDetailStyle.assetPreview}>
                  <Image
                    style={{ width: 125, height: 125 }}
                    source={{ uri: `${config.preview_asset_url}/${this.props.asset.id}` }}
                  />
                </View>
              }

              <Text style={assetDetailStyle.bitmarkLabel}>{global.i18n.t("LocalAssetDetailComponent_yourPropertyBitmarks")} ({(this.props.asset.bitmarks || []).length})</Text>
              <View style={assetDetailStyle.bitmarksArea}>
                <View style={assetDetailStyle.bitmarksHeader}>
                  <Text style={[assetDetailStyle.bitmarksHeaderLabel]}>{global.i18n.t("LocalAssetDetailComponent_bitmarkId")}</Text>
                  <Text style={[assetDetailStyle.bitmarksHeaderLabel, { width: convertWidth(218) }]}>{global.i18n.t("LocalAssetDetailComponent_action")}</Text>
                </View>
                <View style={assetDetailStyle.bitmarkListArea}>
                  {(this.props.asset.bitmarks || []).map((bitmark) => {
                    if (bitmark.transferOfferId) {
                      return (<View key={bitmark.id} style={[assetDetailStyle.bitmarksRow]} >
                        {!bitmark.isViewed && <View style={assetDetailStyle.bitmarkNotView}></View>}
                        <Text style={assetDetailStyle.bitmarksRowNo} numberOfLines={1}>{bitmark.id}</Text>

                        <TouchableOpacity style={assetDetailStyle.bitmarkViewButton} disabled={true}>
                          <Text style={[assetDetailStyle.bitmarkViewButtonText, { color: '#999999', }]}>{global.i18n.t("LocalAssetDetailComponent_sending")}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={assetDetailStyle.bitmarkTransferButton} onPress={() => this.cancelTransferring(bitmark)}>
                          <Text style={[assetDetailStyle.bitmarkTransferButtonText]}>{global.i18n.t("LocalAssetDetailComponent_cancel").toUpperCase()}</Text>
                        </TouchableOpacity>
                      </View>);
                    }

                    if (bitmark.status === 'pending') {
                      return (<View key={bitmark.id} style={[assetDetailStyle.bitmarksRow]} >
                        {!bitmark.isViewed && <View style={assetDetailStyle.bitmarkNotView}></View>}
                        <Text style={assetDetailStyle.bitmarksRowNo} numberOfLines={1}>{bitmark.id}</Text>
                        <TouchableOpacity style={assetDetailStyle.bitmarkViewButton} onPress={() => {
                          Actions.localPropertyDetail({ asset: this.props.asset, bitmark: bitmark });
                        }}>
                          <Text style={[assetDetailStyle.bitmarkViewButtonText]}>{global.i18n.t("LocalAssetDetailComponent_viewDetails")}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={assetDetailStyle.bitmarkTransferButton} disabled={true}>
                          <Text style={[assetDetailStyle.bitmarkTransferButtonText, { color: '#999999' }]}>{global.i18n.t("LocalAssetDetailComponent_pending")}</Text>
                        </TouchableOpacity>
                      </View>);
                    }

                    return (<View key={bitmark.id} style={[assetDetailStyle.bitmarksRow]} >
                      {!bitmark.isViewed && <View style={assetDetailStyle.bitmarkNotView}></View>}
                      <Text style={assetDetailStyle.bitmarksRowNo} numberOfLines={1}>{'' + bitmark.id}</Text>
                      <TouchableOpacity style={assetDetailStyle.bitmarkViewButton} onPress={() => {
                        Actions.localPropertyDetail({ asset: this.props.asset, bitmark: bitmark });
                      }}>
                        <Text style={[assetDetailStyle.bitmarkViewButtonText]}>{global.i18n.t("LocalAssetDetailComponent_viewDetails")}</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={[assetDetailStyle.bitmarkTransferButton]} onPress={() => {
                        if (this.props.asset.filePath) {
                          Actions.localPropertyTransfer({ asset: this.props.asset, bitmark: bitmark });
                        } else {
                          Alert.alert(global.i18n.t('LocalAssetDetailComponent_emptyFileTransferTitle'), global.i18n.t('LocalAssetDetailComponent_emptyFileTransferMessage'), [{
                            text: global.i18n.t("LocalAssetDetailComponent_downloadAssetButtonText"),
                            onPress: this.downloadAsset.bind(this),
                          }]);
                        }
                      }}>
                        <Text style={[assetDetailStyle.bitmarkTransferButtonText]}>{global.i18n.t("LocalAssetDetailComponent_send")}</Text>
                      </TouchableOpacity>
                    </View>);
                  })}
                </View>
              </View>
            </TouchableOpacity>
          </ScrollView>
        </View></TouchableWithoutFeedback>
      </SafeAreaView>
    );
  }
}

PrivateLocalAssetDetailComponent.propTypes = {
  bitmarkCanDownload: PropTypes.object,
  asset: PropTypes.object,
}

const StoreLocalAssetDetailComponent = connect(
  (state) => {
    return state.data;
  },
)(PrivateLocalAssetDetailComponent);

export class LocalAssetDetailComponent extends Component {
  static propTypes = {
    asset: PropTypes.object,
  }
  constructor(props) {
    super(props);
    AssetStore.dispatch(AssetActions.init({ asset: this.props.asset }));
  }
  render() {
    return (
      <View style={{ flex: 1 }}>
        <Provider store={AssetStore}>
          <StoreLocalAssetDetailComponent />
        </Provider>
      </View>
    );
  }
}
