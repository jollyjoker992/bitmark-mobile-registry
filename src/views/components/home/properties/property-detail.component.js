import React from 'react';
import PropTypes from 'prop-types';
import ReactNative, {
  View, Text, Image, SafeAreaView, ActivityIndicator, ScrollView, TouchableWithoutFeedback, WebView, Animated,
  ViewPropTypes,
  Alert,
  StatusBar,
  StyleSheet,
  Clipboard,
  Share,
  BackHandler,
  Linking,
} from 'react-native';
import { Provider, connect } from 'react-redux';
import moment from 'moment';
// import Video from 'react-native-video';
import Hyperlink from 'react-native-hyperlink';
import CustomShare from 'react-native-share';

import { OneTabButtonComponent } from 'src/views/commons/one-tab-button.component';
import { convertWidth, isHealthRecord, isMedicalRecord, isImageFile, isVideoFile, isDocFile, isZipFile, isMusicAsset, } from 'src/utils';
import { constant, config } from 'src/configs';
import { CommonProcessor, CacheData, TransactionProcessor, EventEmitterService, AppProcessor, DataProcessor } from 'src/processors';
import { Actions } from 'react-native-router-flux';
import { PropertyStore, PropertyActions } from 'src/views/stores';
import { defaultStyles } from 'src/views/commons';

const { ActionSheetIOS } = ReactNative;


class PrivatePropertyDetailComponent extends React.Component {
  static propTypes = {
    asset: PropTypes.any,
    bitmark: PropTypes.any,
    claimToAccount: PropTypes.string,
    style: ViewPropTypes.style,
  }

  constructor(props) {
    super(props);
    this.state = {
      animatedBottom: new Animated.Value(-config.deviceSize.height),
      copied: false,
      displayTopButton: false,
      provenance: [],
      gettingData: !!this.props.bitmark,
      paused: false,
      bitmark: this.props.bitmark || {
        asset_id: this.props.asset.id,
        status: 'Requesting',
        owner: this.props.claimToAccount || this.props.asset.registrant,
        issuer: this.props.claimToAccount || this.props.asset.registrant,
        isDraft: true,
      },
    };
    this.doGetScreenData(this.props.bitmark);
  }

  async doGetScreenData(bitmark) {
    if (bitmark) {
      if (!bitmark.isDraft) {
        let provenance = await TransactionProcessor.doGetProvenance(bitmark.id);
        this.setState({ provenance, gettingData: false, });
      }
    } else if (this.props.claimToAccount) {

      this.setState({
        gettingData: false,
      });
      DataProcessor.doSendIncomingClaimRequest(this.props.asset, this.props.claimToAccount || this.props.asset.registrant).then(() => {
        CommonProcessor.doMarkDoneSendClaimRequest();
      }).catch(error => {
        CommonProcessor.doMarkDoneSendClaimRequest();
        console.log('error:', JSON.stringify(error));
        EventEmitterService.emit(EventEmitterService.events.APP_PROCESS_ERROR, { error });
      });
    }
  }

  componentDidMount() {
    if (config.isAndroid) {
      this.backHandler = BackHandler.addEventListener('hardwareBackPress', () => Actions.jump('properties'));
    }
  }
  componentWillUnmount() {
    if (config.isAndroid && this.backHandler) {
      this.backHandler.remove();
    }
  }

  clickOnProvenance(item) {
    let sourceUrl = config.registry_server_url + `/account/${item.owner}?env=app`;
    Actions.bitmarkWebViewFull({ title: global.i18n.t("PropertyDetailComponent_registry"), sourceUrl, });
  }

  downloadAsset() {
    AppProcessor.doDownloadBitmark(this.state.bitmark, {
      indicator: true, title: global.i18n.t("PropertyDetailComponent_preparingToExport"), message: global.i18n.t("PropertyDetailComponent_downloadingFile", { fileName: this.props.asset.name })
    }).then(filePath => {
      if (filePath) {
        CustomShare.open({ title: this.props.asset.name, url: filePath }).then(() => {
          console.log('Share success', filePath);
        }).catch(error => {
          console.log('Share error :', error);
        });
      }
    }).catch(error => {
      EventEmitterService.emit(EventEmitterService.events.APP_PROCESS_ERROR, { title: global.i18n.t("PropertyDetailComponent_notReadyToDownload") });
      console.log('doDownload asset error :', error);
    });
  }

  shareAssetFile() {
    if (this.props.asset.filePath) {
      CustomShare.open({ title: this.props.asset.name, url: this.props.asset.filePath }).then(() => {
        console.log('Share success', this.props.asset.filePath);
      }).catch(error => {
        console.log('Share error :', error);
      });
    } else {
      this.downloadAsset();
    }
  }
  transferBitmark() {
    Actions.localPropertyTransfer({ bitmark: this.state.bitmark, asset: this.props.asset });
  }

  deleteBitmark() {
    ActionSheetIOS.showActionSheetWithOptions({
      title: global.i18n.t("PropertyDetailComponent_titleDeleteModal"),
      options: [global.i18n.t("PropertyDetailComponent_cancelButtonDeleteModal"), global.i18n.t("PropertyDetailComponent_deleteButtonDeleteModal")],
      destructiveButtonIndex: 1,
      cancelButtonIndex: 0,
    },
      (buttonIndex) => {
        if (buttonIndex === 1) {
          AppProcessor.doTransferBitmark(this.state.bitmark, config.zeroAddress, true).then((result) => {
            if (result) {
              Actions.jump('properties');
            }
          }).catch(error => {
            console.log('error:', error);
            EventEmitterService.emit(EventEmitterService.events.APP_PROCESS_ERROR, { error });
          })
        }
      });
  }

  onMessage(event) {
    let data = event.nativeEvent.data;
    if (data) {
      try {
        data = JSON.parse(data);
        if (data.event === 'scroll-to-end') {
          let listAnimations = [];
          listAnimations.push(Animated.timing(this.state.animatedBottom, {
            toValue: 0,
            duration: 300,
          }));
          Animated.parallel(listAnimations).start();
        } else if (data.event === 'scroll-up') {
          let listAnimations = [];
          listAnimations.push(Animated.timing(this.state.animatedBottom, {
            toValue: - config.deviceSize.height,
            duration: 300,
          }));
          Animated.parallel(listAnimations).start();
        }
      } catch (error) {
        //TODO
      }
    }
  }

  showActionSheets({ playLink }) {
    let options = [global.i18n.t("PropertyDetailComponent_releaseActionCancel")];
    if (playLink) {
      options.push(global.i18n.t("PropertyDetailComponent_releaseActionPlay"));
    }
    if (this.state.bitmark && !this.state.bitmark.isDraft) {
      options.push(global.i18n.t("PropertyDetailComponent_releaseActionDownload"));
      options.push(global.i18n.t("PropertyDetailComponent_releaseActionTransfer"));
    }

    ActionSheetIOS.showActionSheetWithOptions({
      title: global.i18n.t("PropertyDetailComponent_releaseActionTitle"),
      options,
      cancelButtonIndex: 0,
    },
      (buttonIndex) => {
        if (buttonIndex === 1) {
          if (playLink) {
            Linking.openURL(playLink);
          } else {
            this.shareAssetFile();
          }
        } else if (buttonIndex === 2) {
          if (playLink) {
            this.shareAssetFile();
          } else {
            Actions.localPropertyTransfer({ bitmark: this.state.bitmark, asset: this.props.asset });
          }
        } else if (buttonIndex === 3) {
          if (playLink) {
            Actions.localPropertyTransfer({ bitmark: this.state.bitmark, asset: this.props.asset });
          }
        }
      });
  }
  render() {
    if (isMusicAsset(this.props.asset)) {
      let editionNumber = this.state.bitmark ? this.state.bitmark.editionNumber : 0;
      let issuer = this.state.bitmark ? this.state.bitmark.issuer : this.props.claimToAccount;

      let totalEditionLeft = issuer ? this.props.asset.editions[issuer].totalEditionLeft : null;
      let limited = issuer ? this.props.asset.editions[issuer].limited : null;
      let webUrl = `${config.mobile_server_url}/api/claim_requests_view/${this.props.asset.id}?edition_number=${editionNumber || '?'}`;
      webUrl += (totalEditionLeft !== null) ? `&remaining=${totalEditionLeft}` : '';
      webUrl += limited ? `&total=${limited}` : '';
      let playLink;
      let metadata = this.props.asset.metadata;
      for (let key in metadata) {
        if (key.toLowerCase() === constant.asset.metadata.labels.playlink) {
          playLink = this.props.asset.metadata[key];
          break;
        }
      }

      return (<View style={[cStyles.body]}>
        <StatusBar hidden={!config.isIPhoneX} />
        <View style={[cStyles.bodyContent, { backgroundColor: 'black', paddingTop: config.isIPhoneX ? 44 : 0, paddingBottom: config.isIPhoneX ? 22 : 0 }]}>
          <OneTabButtonComponent style={{ position: 'absolute', top: config.isIPhoneX ? 44 : 0, left: 0, zIndex: 1, }} onPress={() => {
            Actions.jump('properties');
            CommonProcessor.doMarkDoneSendClaimRequest();
          }}>
            <Text style={{ color: 'white', padding: 20, fontSize: 20 }}>X</Text>
          </OneTabButtonComponent>
          <View style={{ width: '100%', flex: 1, height: '100%', backgroundColor: 'black' }} >
            <WebView
              style={{ flex: 1, }}
              bounces={false}
              injectedJavaScript={`document.addEventListener('scroll', () =>{
                  if (( window.pageYOffset + window.screen.height + 200) >= document.body.scrollHeight) {
                    window.postMessage(JSON.stringify({event: 'scroll-to-end'}));
                  } else {
                    window.postMessage(JSON.stringify({event: 'scroll-up'}));
                  }
                });`}
              onMessage={this.onMessage.bind(this)}
              source={{
                uri: webUrl,
              }}
            />
          </View>
          <Animated.View style={[cStyles.assetInformation, {
            position: 'absolute', bottom: this.state.animatedBottom,
            backgroundColor: 'white',
            paddingTop: 20,
            paddingBottom: config.isIPhoneX ? 44 : 20,
          }]}>
            <View style={{ width: '100%', flexDirection: 'row', alignItems: 'center', paddingLeft: convertWidth(15), paddingRight: convertWidth(15) }}>
              <Image style={{ width: 15, height: 15, resizeMode: 'contain', marginRight: 5, }} source={require('assets/imgs/logo.png')} />
              <Text style={{ fontFamily: 'Andale Mono', fontSize: 14, color: '#545454', }} >{global.i18n.t("PropertyDetailComponent_releaseLabel")}</Text>
            </View>

            <View style={{ width: '100%', flexDirection: 'row', paddingLeft: convertWidth(15), paddingRight: convertWidth(15), alignItems: 'center', justifyContent: 'space-between', marginTop: 5, }}>
              <View style={{ width: convertWidth(319), borderWidth: 2, height: 0, borderColor: 'black', marginTop: 2, }} />
              <Image style={{ width: 18, height: 18, resizeMode: 'contain', }} source={require('assets/imgs/+_grey.png')} />
            </View>
            <View style={cStyles.assetContent}>
              <Text numberOfLines={1} style={{ fontFamily: 'Andale Mono', color: '#545454', fontSize: 14, }}>{global.i18n.t("PropertyDetailComponent_releaseAssetId", { assetId: this.props.asset.id })}</Text>
              <Text numberOfLines={1} style={{ fontFamily: 'Andale Mono', color: '#545454', fontSize: 14, marginTop: 5 }}>{global.i18n.t("PropertyDetailComponent_releaseIssuedAt", { issuedAt: moment(this.props.asset.created_at).format('YYYY MMM DD').toUpperCase() })}</Text>
            </View>

            <View style={{ paddingLeft: convertWidth(15), paddingRight: convertWidth(15), width: '100%', }}>

              <OneTabButtonComponent
                style={cStyles.actionRow}
                disabled={this.state.bitmark && this.state.bitmark.isDraft}
                onPress={() => this.showActionSheets.bind(this)({ playLink })}>
                <Text style={[cStyles.actionRowText, (this.state.bitmark && this.state.bitmark.isDraft) ? { color: '#999999' } : {}]}>
                  {(this.state.bitmark && this.state.bitmark.isDraft) ? global.i18n.t("PropertyDetailComponent_releaseAuthenticating") : global.i18n.t("PropertyDetailComponent_releaseActionViewOptions")}
                </Text>
              </OneTabButtonComponent>

            </View>
          </Animated.View>
        </View >
      </View >);
    } else {
      if (this.props.bitmark && this.props.asset) {
        return (<SafeAreaView style={cStyles.body}>
          <TouchableWithoutFeedback onPress={() => this.setState({ displayTopButton: false })}>
            <View style={[defaultStyles.header, { height: constant.headerSize.height }]}>
              <OneTabButtonComponent style={defaultStyles.headerLeft} onPress={() => Actions.jump('properties')}>
                <Image style={defaultStyles.headerLeftIcon} source={require('assets/imgs/header_blue_icon.png')} />
              </OneTabButtonComponent>
              <View style={defaultStyles.headerCenter}>
                <Text style={[defaultStyles.headerTitle, { maxWidth: convertWidth(180) }]} numberOfLines={1}>{global.i18n.t("PropertyDetailComponent_releaseTitle")}</Text>
              </View>
              <OneTabButtonComponent style={[defaultStyles.headerRight, { padding: 4, paddingRight: convertWidth(19) }]} onPress={() => this.setState({ displayTopButton: !this.state.displayTopButton })}>
                <Image style={cStyles.threeDotIcon} source={this.state.displayTopButton
                  ? require('assets/imgs/three-dot-active.png')
                  : require('assets/imgs/three-dot-deactive.png')} />
              </OneTabButtonComponent>
            </View>
          </TouchableWithoutFeedback>
          <TouchableWithoutFeedback onPress={() => this.setState({ displayTopButton: false })}>
            <View style={cStyles.bodyContent}>
              {this.state.displayTopButton && <View style={cStyles.topButtonsArea}>
                {this.props.bitmark.owner === CacheData.userInformation.bitmarkAccountNumber && <OneTabButtonComponent
                  style={cStyles.downloadAssetButton}
                  disabled={!this.props.asset.filePath && this.props.bitmark.status !== 'confirmed'}
                  onPress={() => this.props.asset.filePath ? this.shareAssetFile.bind(this)() : this.downloadAsset.bind(this)()}
                >
                  {!this.props.asset.filePath && <Text style={[cStyles.downloadAssetButtonText, this.props.bitmark.status !== 'confirmed' ? { color: '#A4B5CD', } : {}]}>
                    {global.i18n.t("PropertyDetailComponent_downloadAsset")}
                  </Text>}
                  {this.props.asset.filePath && <Text style={cStyles.downloadAssetButtonText}>{global.i18n.t("PropertyDetailComponent_shareAsset")}</Text>}
                </OneTabButtonComponent>}
                <OneTabButtonComponent style={cStyles.topButton} onPress={() => {
                  Clipboard.setString(this.props.bitmark.id);
                  this.setState({ copied: true });
                  setTimeout(() => { this.setState({ copied: false }) }, 1000);
                }}>
                  <Text style={cStyles.topButtonText}>{global.i18n.t("PropertyDetailComponent_copyBitmarkId")}</Text>
                  <Text style={cStyles.copiedAssetIddButtonText}>{this.state.copied ? global.i18n.t("PropertyDetailComponent_copiedToClipboard") : ''}</Text>
                </OneTabButtonComponent>
                {this.props.bitmark.owner === CacheData.userInformation.bitmarkAccountNumber && !this.props.bitmark.transferOfferId &&
                  <OneTabButtonComponent style={cStyles.topButton}
                    disabled={this.props.bitmark.status !== 'confirmed'}
                    onPress={() => {
                      if (this.props.asset.filePath) {
                        Actions.localPropertyTransfer({ bitmark: this.props.bitmark, asset: this.props.asset });
                      } else {
                        Alert.alert(global.i18n.t("PropertyDetailComponent_transferRequiredTitle"), global.i18n.t("PropertyDetailComponent_transferRequiredMessage"), [{
                          text: global.i18n.t("PropertyDetailComponent_downloadAsset"),
                          onPress: this.downloadAsset.bind(this),
                        }]);
                      }
                    }}>
                    <Text style={[cStyles.topButtonText, {
                      color: this.props.bitmark.status === 'confirmed' ? '#0060F2' : '#C2C2C2'
                    }]}>{global.i18n.t("PropertyDetailComponent_sendBitmark")}</Text>
                  </OneTabButtonComponent>
                }
                {this.props.bitmark.owner === CacheData.userInformation.bitmarkAccountNumber && <OneTabButtonComponent style={cStyles.topButton}
                  disabled={this.props.bitmark.status !== 'confirmed'}
                  onPress={this.deleteBitmark.bind(this)}>
                  <Text style={[cStyles.topButtonText, {
                    color: this.props.bitmark.status === 'confirmed' ? '#0060F2' : '#C2C2C2'
                  }]}>{global.i18n.t("PropertyDetailComponent_deleteBitmark")}</Text>
                </OneTabButtonComponent>}
              </View>}

              <ScrollView style={{ width: '100%', flex: 1 }} contentContainerStyle={{ flexGrow: 1, }}>
                <View style={cStyles.bottomImageBar}></View>

                <View style={[cStyles.assetThumbnailArea, { color: this.props.bitmark.status === 'pending' ? '#999999' : 'black' }]}>
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

                <View style={[cStyles.assetInformation, { marginTop: 0 }]}>
                  <View style={cStyles.assetContent}>
                    <Text style={[cStyles.assetContentName, { color: this.props.bitmark.status === 'pending' ? '#999999' : 'black' }]}>
                      {this.props.asset.name + (this.props.asset.editions ? `${this.props.bitmark.editionNumber || '?'}/${this.props.asset.editions[CacheData.userInformation.bitmarkAccountNumber].limited}` : '')}
                    </Text>

                    <Hyperlink
                      onPress={(url) => {
                        if (this.props.bitmark.status === 'confirmed') {
                          Actions.bitmarkWebViewFull({ title: global.i18n.t("PropertyDetailComponent_registry"), sourceUrl: url });
                        }
                      }}
                      linkStyle={{ color: this.props.bitmark.status === 'pending' ? '#999999' : '#0060F2' }}
                      linkText={url => {
                        if (url === `${config.registry_server_url}/account/${this.props.bitmark.issuer}`) {
                          return CommonProcessor.getDisplayedAccount(this.props.bitmark.issuer);
                        }
                        return '';
                      }}>
                      <Text style={[cStyles.assetRegister, this.props.bitmark.status === 'confirmed' ? {} : { fontFamily: 'AvenirNextW1G-Demi', color: '#999999' }]}>
                        {this.props.bitmark.status === 'confirmed'
                          ? global.i18n.t('PropertyDetailComponent_issuedOn', { time: moment(this.props.bitmark.issued_at).format('YYYY MMM DD').toUpperCase() })
                          : global.i18n.t('PropertyDetailComponent_pending')}
                      </Text>
                    </Hyperlink>
                  </View>
                </View>

                {this.props.asset && Object.keys(this.props.asset.metadata).length > 0 && <View style={cStyles.metadataArea}>
                  {Object.keys(this.props.asset.metadata).map((label, index) => (
                    <View key={index} style={[cStyles.metadataItem, { marginBottom: index === Object.keys(this.props.asset.metadata).length ? 0 : 15 }]}>
                      <Text style={[cStyles.metadataItemLabel, { color: this.props.bitmark.status === 'pending' ? '#999999' : 'black' }]}>{label.toUpperCase()}:</Text>
                      <Text style={[cStyles.metadataItemValue, { color: this.props.bitmark.status === 'pending' ? '#999999' : 'black' }]}>{this.props.asset.metadata[label]}</Text>
                    </View>
                  ))}
                </View>}

                <View style={cStyles.provenanceArea}>
                  <Text style={cStyles.provenanceLabel}>{global.i18n.t("PropertyDetailComponent_provenance")}</Text>
                  <View style={[cStyles.provenanceRow, {
                    paddingBottom: 0, paddingTop: 0,
                    backgroundColor: '#F5F5F5'
                  }]}>
                    <Text style={[cStyles.provenanceRowItem, this.props.bitmark.status === 'confirmed' ? {} : {
                      color: '#545454', fontFamily: 'AvenirNextW1G-Regular'
                    }]}>{global.i18n.t("PropertyDetailComponent_timestamp")}</Text>
                    <Text style={[cStyles.provenanceRowItem, { marginLeft: convertWidth(19), }, this.props.bitmark.status === 'confirmed' ? {} : {
                      color: '#545454', fontFamily: 'AvenirNextW1G-Regular'
                    }]}>{global.i18n.t("PropertyDetailComponent_owner")}</Text>
                  </View>
                  {this.state.gettingData && <ActivityIndicator style={{ marginTop: 42 }} size="large" />}
                  {(this.state.provenance || []).map((item, index) => (<OneTabButtonComponent key={index} style={cStyles.provenanceRow}
                    onPress={() => this.clickOnProvenance.bind(this)(item)}
                    disabled={item.status === 'pending' || item.status === 'queuing'}
                  >
                    <Text style={[cStyles.provenanceRowItem, {
                      color: (item.status === 'pending' || item.status === 'queuing') ? '#999999' : '#0060F2'
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
                </View>
              </ScrollView>
            </View>
          </TouchableWithoutFeedback>
        </SafeAreaView>)
      } else {
        Actions.jump('properties');
        return <View style={cStyles.body} />
      }
    }
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
    width: 20, height: 20, resizeMode: 'contain',
    marginRight: 15,
  },
  bodyContent: {
    flex: 1, flexDirection: 'column', alignItems: 'center',
    width: '100%',
    backgroundColor: 'white',
  },
  topButtonsArea: {
    position: 'absolute',
    top: 3,
    right: 0,
    zIndex: 10,
    width: 198,
    backgroundColor: '#F5F5F5',
    shadowColor: 'black',
    shadowOffset: { height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  downloadAssetButton: {
    width: '100%',
    minHeight: 45,
    flexDirection: 'column',
    paddingLeft: convertWidth(19),
    paddingRight: convertWidth(19),
    paddingTop: 12,
    paddingBottom: 12,
  },
  downloadAssetButtonText: {
    fontFamily: 'Avenir Black',
    fontWeight: '900',
    fontSize: 16,
    color: '#0060F2',
    textAlign: 'right',
  },
  topButton: {
    width: '100%',
    minHeight: 45,
    flexDirection: 'column',
    paddingLeft: convertWidth(19),
    paddingRight: convertWidth(19),
    paddingTop: 12,
    paddingBottom: 12,
  },
  topButtonText: {
    fontFamily: 'Avenir Black',
    fontWeight: '900',
    fontSize: 16,
    color: '#0060F2',
    textAlign: 'right',
  },
  copiedAssetIddButtonText: {
    position: 'absolute', bottom: 4, right: convertWidth(19),
    fontFamily: 'Avenir Black',
    fontWeight: '400',
    fontSize: 8,
    color: '#0060F2',
    marginTop: 5,
    fontStyle: 'italic',
    textAlign: 'right',
  },
  bottomImageBar: {
    borderWidth: 2,
    width: convertWidth(130),
    marginLeft: convertWidth(19),
  },
  assetThumbnailArea: {
    width: '100%',
  },
  assetThumbnailImage: {
    width: 73, height: 73, resizeMode: 'contain',
    marginLeft: convertWidth(19),
    marginTop: 29,
  },
  assetInformation: {
    marginTop: 20,
    flexDirection: 'column',
    width: '100%',
  },
  assetContent: {
    flex: 1, flexDirection: 'column', justifyContent: 'space-between',
    paddingLeft: convertWidth(15), paddingRight: convertWidth(19),
    marginTop: 10,
  },
  assetContentName: {
    marginTop: 34,
    fontFamily: 'AvenirNextW1G-Bold', fontSize: 18,
  },
  assetRegister: {
    marginTop: 10,
    fontFamily: 'Andale Mono', fontSize: 13,
  },
  metadataArea: {
    marginTop: 26,
    flexDirection: 'column',
  },
  metadataItem: {
    width: '100%',
    paddingLeft: convertWidth(19),
    flexDirection: 'row',
  },
  metadataItemLabel: {
    fontFamily: 'Andale Mono',
    fontSize: 13,
    fontWeight: '900',
    color: '#0060F2',
    width: convertWidth(117),
    marginTop: 1,
  },
  metadataItemValue: {
    fontFamily: 'Avenir Black',
    fontSize: 14,
    fontWeight: '400',
    width: convertWidth(196),
    marginLeft: convertWidth(22),
  },

  provenanceArea: {
    flex: 1, flexDirection: 'column', alignItems: 'center', width: '100%',
    marginTop: 30,
    paddingLeft: convertWidth(19), paddingRight: convertWidth(19),
  },
  provenanceLabel: {
    fontFamily: 'AvenirNextW1G-Bold',
    fontSize: 14,
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

  actionRow: {
    marginTop: 15,
    height: 45,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#F1F1F1',
  },
  actionRowText: {
    width: '100%',
    textAlign: 'center',
    fontFamily: 'AvenirNextW1G-Bold', color: '#0060F2',
  },

});

const StorePropertyDetailComponent = connect(
  (state) => state.data
)(PrivatePropertyDetailComponent);

export class PropertyDetailComponent extends React.Component {
  static propTypes = {
    asset: PropTypes.object,
    bitmark: PropTypes.object,
    claimToAccount: PropTypes.string,
  }
  constructor(props) {
    super(props);

    let tempState = { asset: this.props.asset, bitmark: this.props.bitmark, claimToAccount: this.props.claimToAccount };
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