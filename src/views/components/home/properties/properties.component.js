import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Provider, connect } from 'react-redux';
import {
  View, Text, ScrollView, Image, ActivityIndicator, SafeAreaView,
  StyleSheet,
} from 'react-native';

import { Actions } from 'react-native-router-flux';

import { defaultStyles, BitmarkWebViewComponent } from 'src/views/commons';
import { config, constant } from 'src/configs';
import { convertWidth, isReleasedAsset, isHealthRecord, isMedicalRecord, isImageFile, isVideoFile, isZipFile, isDocFile } from 'src/utils';

import { PropertiesStore, PropertiesActions } from 'src/views/stores';
import { CommonProcessor, EventEmitterService, CacheData, BitmarkProcessor } from 'src/processors';
import moment from 'moment';
import { OneTabButtonComponent } from 'src/views/commons/one-tab-button.component';

const SubTabs = {
  local: 'Yours',
  release: 'Release',
  global: 'Global',
};

let loadingDataWhenScroll = false;

class PrivatePropertiesComponent extends React.Component {
  static propTypes = {
    assets: PropTypes.any,
    displayedBitmarks: PropTypes.array,
    bitmarks: PropTypes.array,

    displayedReleasedAssets: PropTypes.array,
    releasedAssets: PropTypes.array,
    releasedBitmarks: PropTypes.any,

    appLoadingData: PropTypes.bool,
    subTab: PropTypes.string,
  }

  constructor(props) {
    super(props);

    this.switchSubTab = this.switchSubTab.bind(this);
    this.addProperty = this.addProperty.bind(this);

  }

  switchSubTab(subTab) {
    PropertiesStore.dispatch(PropertiesActions.update({ subTab }));
  }

  addProperty() {
    Actions.issuanceOptions();
  }

  viewPropertyDetail(bitmark) {
    EventEmitterService.emit(EventEmitterService.events.APP_SHOW_COVER, {
      type: 'PropertyActionSheetComponent',
      bitmark, asset: this.props.assets[bitmark.asset_id]
    });
    BitmarkProcessor.doUpdateViewStatus(bitmark.id);
  }

  viewReleaseDetail(releasedAsset) {
    let releasedBitmarksOfAsset = Object.values(this.props.releasedBitmarks).filter(bitmark =>
      (bitmark.asset_id === releasedAsset.id &&
        bitmark.issuer === CacheData.userInformation.bitmarkAccountNumber &&
        bitmark.owner !== CacheData.userInformation.bitmarkAccountNumber));
    Actions.releasedProperties({ releasedAsset, releasedBitmarks: releasedBitmarksOfAsset });
  }

  render() {
    console.log('this.props :', this.props);
    let bitmarkAccountNumber = CacheData.userInformation.bitmarkAccountNumber;
    loadingDataWhenScroll = false;
    return (
      <View style={cStyles.body}>
        <View style={[cStyles.header, { zIndex: 1 }]}>
          <OneTabButtonComponent style={defaultStyles.headerLeft}></OneTabButtonComponent>
          <Text style={defaultStyles.headerTitle}>{global.i18n.t("PropertiesComponent_headerTitle")}</Text>
          <OneTabButtonComponent style={defaultStyles.headerRight} onPress={this.addProperty} testID={"addPropertyBtn"} >
            <Image style={cStyles.addPropertyIcon} source={require('assets/imgs/plus-icon.png')} />
          </OneTabButtonComponent>
        </View>

        <View style={cStyles.subTabArea}>
          {this.props.subTab === SubTabs.local && <OneTabButtonComponent style={[cStyles.subTabButton, {
            shadowOffset: { width: 2 },
            shadowOpacity: 0.15,
          }]}>
            <View style={cStyles.subTabButtonArea}>
              <View style={[cStyles.activeSubTabBar, { backgroundColor: '#0060F2' }]}></View>
              <View style={cStyles.subTabButtonTextArea}>
                <Text style={[cStyles.subTabButtonText, { marginLeft: 0 }]}>
                  {global.i18n.t("PropertiesComponent_yours")}
                  <Text style={{ fontSize: 10 }}>{` (${this.props.bitmarks.length > 99 ? '99+' : this.props.bitmarks.length})`}</Text>
                </Text>
              </View>
            </View>
          </OneTabButtonComponent>}
          {this.props.subTab !== SubTabs.local && <OneTabButtonComponent style={[cStyles.subTabButton, {
            backgroundColor: '#F5F5F5',
            zIndex: 0,
          }]} onPress={() => this.switchSubTab(SubTabs.local)}>
            <View style={cStyles.subTabButtonArea}>
              <View style={[cStyles.activeSubTabBar, { backgroundColor: '#F5F5F5' }]}></View>
              <View style={cStyles.subTabButtonTextArea}>
                <Text style={[cStyles.subTabButtonText, { color: '#C1C1C1', marginLeft: 0 }]}>{global.i18n.t("PropertiesComponent_yours")}<Text style={{ fontSize: 10 }}>{` (${this.props.bitmarks.length > 99 ? '99+' : this.props.bitmarks.length})`}</Text></Text>
              </View>
            </View>
          </OneTabButtonComponent>}

          {CacheData.identities[CacheData.userInformation.bitmarkAccountNumber] && CacheData.identities[CacheData.userInformation.bitmarkAccountNumber].is_released_account &&
            this.props.subTab === SubTabs.release && <OneTabButtonComponent style={[cStyles.subTabButton, {
              shadowOffset: { width: 2 },
              shadowOpacity: 0.15,
            }]}>
              <View style={cStyles.subTabButtonArea}>
                <View style={[cStyles.activeSubTabBar, { backgroundColor: '#0060F2' }]}></View>
                <View style={cStyles.subTabButtonTextArea}>
                  <Text style={cStyles.subTabButtonText}>{global.i18n.t("PropertiesComponent_release")}</Text>
                </View>
              </View>
            </OneTabButtonComponent>}
          {CacheData.identities[CacheData.userInformation.bitmarkAccountNumber] && CacheData.identities[CacheData.userInformation.bitmarkAccountNumber].is_released_account &&
            this.props.subTab !== SubTabs.release && <OneTabButtonComponent style={[cStyles.subTabButton, {
              backgroundColor: '#F5F5F5',
              zIndex: 0,
            }]} onPress={() => this.switchSubTab(SubTabs.release)}>
              <View style={cStyles.subTabButtonArea}>
                <View style={[cStyles.activeSubTabBar, { backgroundColor: '#F5F5F5' }]}></View>
                <View style={cStyles.subTabButtonTextArea}>
                  <Text style={[cStyles.subTabButtonText, { color: '#C1C1C1' }]}>{global.i18n.t("PropertiesComponent_release")}</Text>
                </View>
              </View>
            </OneTabButtonComponent>}

          {this.props.subTab === SubTabs.global && <OneTabButtonComponent style={[cStyles.subTabButton, {
            shadowOffset: { width: -2 },
            shadowOpacity: 0.15,
          }]}>
            <View style={cStyles.subTabButtonArea}>
              <View style={[cStyles.activeSubTabBar, { backgroundColor: '#0060F2' }]}></View>
              <View style={cStyles.subTabButtonTextArea}>
                <Text style={cStyles.subTabButtonText}>{global.i18n.t("PropertiesComponent_global")}</Text>
              </View>
            </View>
          </OneTabButtonComponent>}
          {this.props.subTab !== SubTabs.global && <OneTabButtonComponent style={[cStyles.subTabButton, {
            backgroundColor: '#F5F5F5',
            zIndex: 0,
          }]} onPress={() => this.switchSubTab(SubTabs.global)}>
            <View style={cStyles.subTabButtonArea}>
              <View style={[cStyles.activeSubTabBar, { backgroundColor: '#F5F5F5' }]}></View>
              <View style={cStyles.subTabButtonTextArea}>
                <Text style={[cStyles.subTabButtonText, { color: '#C1C1C1' }]}>{global.i18n.t("PropertiesComponent_global")}</Text>
              </View>
            </View>
          </OneTabButtonComponent>}
        </View>

        {this.props.subTab === SubTabs.local && <ScrollView style={[cStyles.scrollSubTabArea]}
          contentContainerStyle={{ flexGrow: 1 }}
          onScroll={async (scrollEvent) => {
            if (loadingDataWhenScroll) {
              return;
            }
            if (scrollEvent.nativeEvent.contentOffset.y >= (scrollEvent.nativeEvent.contentSize.height - config.windowSize.height) &&
              (this.props.displayedBitmarks.length < this.props.bitmarks.length)) {
              loadingDataWhenScroll = true;
              PropertiesStore.dispatch(PropertiesActions.viewMoreBitmarks());
            }
            loadingDataWhenScroll = false;
          }}
          scrollEventThrottle={1}
        >
          <OneTabButtonComponent activeOpacity={1} style={cStyles.contentSubTab}>
            {(!this.props.appLoadingData && this.props.displayedBitmarks && this.props.displayedBitmarks.length === 0) && <View style={cStyles.messageNoBitmarkArea}>
              <View>
                <Text style={cStyles.messageNoBitmarkLabel}>
                  {global.i18n.t("PropertiesComponent_messageNoBitmarkLabel")}
                </Text>
                <Text style={cStyles.messageNoContent}>
                  {global.i18n.t("PropertiesComponent_messageNoContent")}
                </Text>
              </View>
              <OneTabButtonComponent style={cStyles.addFirstPropertyButton} onPress={this.addProperty}>
                <Text style={cStyles.addFirstPropertyButtonText}>{global.i18n.t("PropertiesComponent_addFirstPropertyButtonText")}</Text>
              </OneTabButtonComponent>
            </View>}
            {this.props.displayedBitmarks && this.props.displayedBitmarks.length > 0 && this.props.subTab === SubTabs.local && this.props.displayedBitmarks.map(bitmark => {
              if (!bitmark || !bitmark.id) {
                return
              }
              return (
                <OneTabButtonComponent key={bitmark.id} style={[cStyles.bitmarkRowArea]} onPress={() => {
                  BitmarkProcessor.doUpdateViewStatus(bitmark.id);
                  Actions.propertyDetail({ bitmark, asset: this.props.assets[bitmark.asset_id] });
                }}>

                  <View style={cStyles.bitmarkContent}>
                    <Text style={[cStyles.bitmarkCreatedAt, bitmark.isViewed ? {} : { color: '#0060F2' }]}>
                      {bitmark.created_at ? moment(bitmark.created_at).format('YYYY MMM DD HH:mm:ss').toUpperCase()
                        : (bitmark.issuer === CacheData.userInformation.bitmarkAccountNumber ? global.i18n.t("PropertiesComponent_registering") : global.i18n.t("PropertiesComponent_transferring"))}
                    </Text>
                    <Text style={[cStyles.bitmarkAssetName, bitmark.isViewed ? {} : { color: '#0060F2' }]} numberOfLines={1}>
                      {this.props.assets[bitmark.asset_id].name + `${isReleasedAsset(this.props.assets[bitmark.asset_id])
                        ? ` [${(bitmark.editionNumber === undefined || bitmark.editionNumber < 0) ? '?' : bitmark.editionNumber}/${this.props.assets[bitmark.asset_id].editions[bitmark.issuer].limited}]`
                        : ''}`}
                    </Text>
                    <Text style={[cStyles.bitmarkissuer, bitmark.isViewed ? {} : { color: '#0060F2' }]} numberOfLines={1}>{CommonProcessor.getDisplayedAccount(bitmark.issuer)}</Text>
                  </View>

                  <View style={cStyles.thumbnailArea}>
                    {(() => {
                      if (this.props.assets[bitmark.asset_id].thumbnailPath) {
                        return (<Image style={cStyles.thumbnailImage} source={{ uri: (config.isAndroid ? 'file://' : '') + this.props.assets[bitmark.asset_id].thumbnailPath }} />);
                      }
                      if (isHealthRecord(this.props.assets[bitmark.asset_id])) {
                        return (<Image style={cStyles.thumbnailImage} source={require('assets/imgs/asset_health_data_icon.png')} />);
                      }
                      if (isMedicalRecord(this.props.assets[bitmark.asset_id])) {
                        return (<Image style={cStyles.thumbnailImage} source={require('assets/imgs/asset_medical_record_icon.png')} />);
                      }
                      if (isImageFile(this.props.assets[bitmark.asset_id].filePath)) {
                        return (<Image style={cStyles.thumbnailImage} source={require('assets/imgs/asset_image_icon.png')} />);
                      }
                      if (isVideoFile(this.props.assets[bitmark.asset_id].filePath)) {
                        return (<Image style={cStyles.thumbnailImage} source={require('assets/imgs/asset_video_icon.png')} />);
                      }
                      if (isDocFile(this.props.assets[bitmark.asset_id].filePath)) {
                        return (<Image style={cStyles.thumbnailImage} source={require('assets/imgs/asset_doc_icon.png')} />);
                      }
                      if (isZipFile(this.props.assets[bitmark.asset_id].filePath)) {
                        return (<Image style={cStyles.thumbnailImage} source={require('assets/imgs/asset_zip_icon.png')} />);
                      }
                      return (<Image style={cStyles.thumbnailImage} source={require('assets/imgs/asset_unknow_icon.png')} />);
                    })()}
                  </View>
                  {/* <OneTabButtonComponent style={{ padding: 20, }} onPress={() => this.viewPropertyDetail.bind(this)(bitmark)}>
                  <Image style={cStyles.propertySettingIcon} source={require('assets/imgs/property_setting_grey.png')} />
                </OneTabButtonComponent> */}
                </OneTabButtonComponent>
              )
            })}
            {(this.props.appLoadingData || (this.props.displayedBitmarks && this.props.displayedBitmarks.length < this.props.bitmarks)) && <View style={cStyles.messageNoBitmarkArea}>
              <ActivityIndicator size="large" style={{ marginTop: 46, }} />
            </View>}
          </OneTabButtonComponent>
        </ScrollView>}

        {this.props.subTab === SubTabs.release && <ScrollView style={[cStyles.scrollSubTabArea]}
          contentContainerStyle={{ flexGrow: 1 }}
          onScroll={async (scrollEvent) => {
            if (loadingDataWhenScroll) {
              return;
            }
            if (scrollEvent.nativeEvent.contentOffset.y >= (scrollEvent.nativeEvent.contentSize.height - config.windowSize.height) &&
              (this.props.displayedReleasedAssets.length < this.props.releasedAssets.length)) {
              loadingDataWhenScroll = true;
              PropertiesStore.dispatch(PropertiesActions.viewMoreReleasedAssets());
            }
            loadingDataWhenScroll = false;
          }}
          scrollEventThrottle={1}
        >
          <OneTabButtonComponent activeOpacity={1} style={cStyles.contentSubTab}>
            {(!this.props.appLoadingData && this.props.displayedReleasedAssets && this.props.displayedReleasedAssets.length === 0) && <View style={cStyles.messageNoBitmarkArea}>
              <View>
                <Text style={cStyles.messageNoBitmarkLabel}>
                  {global.i18n.t("PropertiesComponent_messageNoReleaseLabel")}
                </Text>
                <Text style={cStyles.messageNoContent}>
                  {global.i18n.t("PropertiesComponent_messageNoReleaseContent")}
                </Text>
              </View>
              <View style={{ flex: 1, justifyContent: 'center', width: '100%', paddingTop: 10, paddingBottom: 10, }}>
                <Image style={cStyles.noReleaseIcon} source={require('assets/imgs/No_release_icon.png')} />
              </View>
              <OneTabButtonComponent style={cStyles.addFirstPropertyButton} onPress={Actions.musicFileChosen}>
                <Text style={cStyles.addFirstPropertyButtonText}> {global.i18n.t("PropertiesComponent_releaseYourMusic")}</Text>
              </OneTabButtonComponent>
            </View>}
            {this.props.displayedReleasedAssets && this.props.displayedReleasedAssets.length > 0 && this.props.subTab === SubTabs.release && this.props.displayedReleasedAssets.map(asset => (
              <OneTabButtonComponent key={asset.id} style={[cStyles.bitmarkRowArea]} onPress={() => this.viewReleaseDetail.bind(this)(asset)}>
                <View style={cStyles.thumbnailArea}>
                  <Image style={cStyles.thumbnailImage} source={{ uri: asset.thumbnailPath }} />
                </View>
                <View style={cStyles.bitmarkContent}>
                  <Text style={cStyles.releasedAssetName} numberOfLines={1}>{asset.name}</Text>
                  <Text style={cStyles.releasedAssetEditionLeft} numberOfLines={1}>
                    {global.i18n.t("PropertiesComponent_releasedAssetEditionLeft", {
                      number: asset.editions[bitmarkAccountNumber].totalEditionLeft,
                      total: asset.editions[bitmarkAccountNumber].limited
                    })}
                  </Text>
                </View>
              </OneTabButtonComponent>
            ))}
            {(this.props.appLoadingData || (this.props.displayedReleasedAssets && this.props.displayedReleasedAssets.length < this.props.bitmarks)) && <View style={cStyles.messageNoBitmarkArea}>
              <ActivityIndicator size="large" style={{ marginTop: 46, }} />
            </View>}
          </OneTabButtonComponent>
        </ScrollView>}

        {this.props.subTab === SubTabs.global && <View style={cStyles.globalArea}>
          <BitmarkWebViewComponent sourceUrl={config.registry_server_url + '?env=app'} heightButtonController={38} />
        </View>}
      </View>
    );
  }
}

const cStyles = StyleSheet.create({
  body: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%',
    backgroundColor: 'white',
  },
  header: {
    flexDirection: 'row',
    alignContent: 'center',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F5F5F5',
    height: constant.headerSize.height,
    width: '100%',
  },
  addPropertyIcon: {
    width: 18,
    height: 18,
    resizeMode: 'contain',
    marginRight: 17,
  },
  subTabArea: {
    width: '100%',
    height: 39,
    backgroundColor: 'white',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  subTabButton: {
    flex: 1,
    height: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: 'black',
    shadowOffset: { height: 0 },
    shadowRadius: 3,
    zIndex: 1,
  },
  subTabButtonArea: {
    width: '100%',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  subTabButtonTextArea: {
    flexDirection: 'row',
    alignItems: 'center',
    alignContent: 'center',
    justifyContent: 'center',
    height: 35,
  },
  subTabButtonText: {
    fontFamily: 'avenir_next_w1g_bold', fontSize: 14, textAlign: 'center', color: 'black',
  },
  activeSubTabBar: {
    height: 4,
    backgroundColor: '#0060F2'
  },
  scrollSubTabArea: {
    width: '100%',
    flexDirection: 'column',
    alignContent: 'center',
    backgroundColor: 'white',
  },
  contentSubTab: {
    width: '100%',
    flex: 1, flexDirection: 'column',
  },
  messageNoBitmarkArea: {
    flex: 1,
    width: '100%',
    flexDirection: 'column', justifyContent: 'space-between',
  },
  messageNoBitmarkLabel: {
    marginTop: 46,
    width: '100%',
    paddingLeft: convertWidth(19), paddingRight: convertWidth(19),
    fontFamily: 'avenir_next_w1g_bold', fontSize: 17, color: '#0060F2'
  },
  messageNoContent: {
    marginTop: 46,
    width: '100%',
    paddingLeft: convertWidth(19), paddingRight: convertWidth(19),
    fontFamily: 'avenir_next_w1g_regular', fontSize: 17, color: 'black',
  },
  noReleaseIcon: {
    resizeMode: 'stretch', height: '100%',
    maxHeight: 248,
    maxWidth: convertWidth(303)
  },
  addFirstPropertyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignContent: 'center',
    justifyContent: 'center',
    backgroundColor: '#0060F2',
    minHeight: 45,
  },
  addFirstPropertyButtonText: {
    fontFamily: 'avenir_next_w1g_bold', textAlign: 'center', fontSize: 16, color: 'white'
  },
  bitmarkRowArea: {
    width: '100%',
    flexDirection: 'row', alignItems: 'center',
    borderBottomColor: '#EDF0F4',
    borderBottomWidth: 1,
    paddingLeft: convertWidth(27), paddingTop: 15, paddingBottom: 20,
  },
  thumbnailArea: {
    width: 40, height: 40,
    marginRight: convertWidth(19),
  },
  thumbnailImage: {
    width: 40, height: 40, resizeMode: 'contain',
  },
  bitmarkContent: {
    flex: 1, width: '100%',
    flexDirection: 'column',
  },
  bitmarkCreatedAt: {
    fontFamily: 'andale_mono', fontSize: 13, width: '100%', color: 'black',
  },
  bitmarkAssetName: {
    fontFamily: 'avenir_next_w1g_bold', fontSize: 14, color: 'black',
    width: '100%',
    marginTop: 10,
  },
  bitmarkissuer: {
    fontFamily: 'andale_mono', fontSize: 14, color: 'black',
    marginTop: 10,
    width: '100%',
  },
  releasedAssetName: {
    width: '100%',
    fontFamily: 'avenir_next_w1g_demi', fontSize: 13, color: 'black',
  },
  releasedAssetEditionLeft: {
    marginTop: 3,
    width: '100%',
    fontFamily: 'avenir_next_w1g_demi', fontSize: 13, color: '#0060F2',
  },
  globalArea: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'white',
    paddingBottom: 2,
  },
});

const StorePropertiesComponent = connect(
  (state) => {
    return state.data;
  },
)(PrivatePropertiesComponent);

export class PropertiesComponent extends Component {
  static propTypes = {
    subTab: PropTypes.string,
  }
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    PropertiesStore.dispatch(PropertiesActions.update({ subTab: this.props.subTab || SubTabs.local }));
  }
  render() {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#F5F5F5' }}>
        <Provider store={PropertiesStore}>
          <StorePropertiesComponent />
        </Provider>
      </SafeAreaView>
    );
  }
}

