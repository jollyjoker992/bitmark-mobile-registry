import React, { Component } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { Provider, connect } from 'react-redux';
import {
  View, Text, TouchableOpacity, ScrollView, FlatList, Image, ActivityIndicator, SafeAreaView,
  Dimensions,
} from 'react-native';

import { Actions } from 'react-native-router-flux';

import assetsStyle from './assets.component.style';
import { DataProcessor, CacheData } from 'src/processors';
import { defaultStyles, BitmarkWebViewComponent } from 'src/views/commons';
import { config, constant } from 'src/configs';
import { AssetsStore } from 'src/views/stores';
let currentSize = Dimensions.get('window');

const SubTabs = {
  local: 'Yours',
  global: 'Global',
};

let loadingDataWhenScroll = false;

class PrivateAssetsComponent extends React.Component {
  static propTypes = {
    totalAssets: PropTypes.number,
    totalBitmarks: PropTypes.number,
    assets: PropTypes.array,
    existNewAsset: PropTypes.bool,
    appLoadingData: PropTypes.bool,
  }

  constructor(props) {
    super(props);

    this.switchSubTab = this.switchSubTab.bind(this);
    this.addProperty = this.addProperty.bind(this);

    this.state = {
      subTab: SubTabs.local
    };
  }

  switchSubTab(subTab) {
    this.setState({ subTab, });
  }

  addProperty() {
    Actions.issuanceOptions();
  }

  render() {
    console.log('assets props:', this.props);
    loadingDataWhenScroll = false;
    return (
      <View style={assetsStyle.body}>
        <View style={[assetsStyle.header, { zIndex: 1 }]}>
          <TouchableOpacity style={defaultStyles.headerLeft}></TouchableOpacity>
          <Text style={defaultStyles.headerTitle}>{global.i18n.t("AssetsComponent_headerTitle")}</Text>
          <TouchableOpacity style={defaultStyles.headerRight} onPress={this.addProperty}>
            <Image style={assetsStyle.addPropertyIcon} source={require('assets/imgs/plus-icon.png')} />
          </TouchableOpacity>
        </View>

        <View style={assetsStyle.subTabArea}>
          {this.state.subTab === SubTabs.local && <TouchableOpacity style={[assetsStyle.subTabButton, {
            shadowOffset: { width: 2 },
            shadowOpacity: 0.15,
          }]}>
            <View style={assetsStyle.subTabButtonArea}>
              <View style={[assetsStyle.activeSubTabBar, { backgroundColor: '#0060F2' }]}></View>
              <View style={assetsStyle.subTabButtonTextArea}>
                {/* {this.props.existNewAsset && <View style={assetsStyle.newItem}></View>} */}
                <Text style={[assetsStyle.subTabButtonText, { marginLeft: this.props.totalBitmarks > 9 ? 8 : 0 }]}>
                  {global.i18n.t("AssetsComponent_yours")}
                  <Text style={{ fontSize: this.props.totalBitmarks > 9 ? 10 : 14 }}>{(this.props.totalBitmarks > 0 ? ` (${this.props.totalBitmarks > 99 ? '99+' : this.props.totalBitmarks})` : '')}</Text>
                </Text>
              </View>
            </View>
          </TouchableOpacity>}
          {this.state.subTab !== SubTabs.local && <TouchableOpacity style={[assetsStyle.subTabButton, {
            backgroundColor: '#F5F5F5',
            zIndex: 0,
          }]} onPress={() => this.switchSubTab(SubTabs.local)}>
            <View style={assetsStyle.subTabButtonArea}>
              <View style={[assetsStyle.activeSubTabBar, { backgroundColor: '#F5F5F5' }]}></View>
              <View style={assetsStyle.subTabButtonTextArea}>
                {/* {this.props.existNewAsset && <View style={assetsStyle.newItem}></View>} */}
                <Text style={[assetsStyle.subTabButtonText, { color: '#C1C1C1', marginLeft: this.props.totalBitmarks > 9 ? 10 : 0 }]}>{global.i18n.t("AssetsComponent_yours")}<Text style={{ fontSize: this.props.totalBitmarks > 9 ? 8 : 14 }}>{(this.props.totalBitmarks > 0 ? ` (${this.props.totalBitmarks > 99 ? '99+' : this.props.totalBitmarks})` : '')}</Text></Text>
              </View>
            </View>
          </TouchableOpacity>}

          {this.state.subTab === SubTabs.global && <TouchableOpacity style={[assetsStyle.subTabButton, {
            shadowOffset: { width: -2 },
            shadowOpacity: 0.15,
          }]}>
            <View style={assetsStyle.subTabButtonArea}>
              <View style={[assetsStyle.activeSubTabBar, { backgroundColor: '#0060F2' }]}></View>
              <View style={assetsStyle.subTabButtonTextArea}>
                <Text style={assetsStyle.subTabButtonText}>{global.i18n.t("AssetsComponent_global")}</Text>
              </View>
            </View>
          </TouchableOpacity>}
          {this.state.subTab !== SubTabs.global && <TouchableOpacity style={[assetsStyle.subTabButton, {
            backgroundColor: '#F5F5F5',
            zIndex: 0,
          }]} onPress={() => this.switchSubTab(SubTabs.global)}>
            <View style={assetsStyle.subTabButtonArea}>
              <View style={[assetsStyle.activeSubTabBar, { backgroundColor: '#F5F5F5' }]}></View>
              <View style={assetsStyle.subTabButtonTextArea}>
                <Text style={[assetsStyle.subTabButtonText, { color: '#C1C1C1' }]}>{global.i18n.t("AssetsComponent_global")}</Text>
              </View>
            </View>
          </TouchableOpacity>}
        </View>

        {this.state.subTab == SubTabs.local && <ScrollView style={[assetsStyle.scrollSubTabArea]}
          onScroll={async (scrollEvent) => {
            if (loadingDataWhenScroll) {
              return;
            }
            if (scrollEvent.nativeEvent.contentOffset.y >= (scrollEvent.nativeEvent.contentSize.height - currentSize.height) &&
              (this.props.assets.length < this.props.totalAssets)) {
              loadingDataWhenScroll = true;
              await DataProcessor.doAddMoreAssets(this.props.assets.length);
            }
            loadingDataWhenScroll = false;
          }}
          scrollEventThrottle={1}
        >
          <TouchableOpacity activeOpacity={1} style={assetsStyle.contentSubTab}>
            {(!this.props.appLoadingData && this.props.assets && this.props.assets.length === 0) && <View style={assetsStyle.messageNoAssetArea}>
              {(this.state.subTab === SubTabs.local) && <Text style={assetsStyle.messageNoAssetLabel}>
                {global.i18n.t("AssetsComponent_messageNoAssetLabel")}
              </Text>}
              {(this.state.subTab === SubTabs.local) && <Text style={assetsStyle.messageNoAssetContent}>
                {global.i18n.t("AssetsComponent_messageNoAssetContent")}
              </Text>}
            </View>}
            {this.props.assets && this.props.assets.length > 0 && this.state.subTab === SubTabs.local && this.props.assets.map(item => (
              <TouchableOpacity key={item.id} style={[assetsStyle.assetRowArea]} onPress={() => Actions.localAssetDetail({ asset: item })} >
                {/* {!item.isViewed && <View style={[assetsStyle.newItem, { top: 22 }]}></View>} */}

                <View style={assetsStyle.assetInfoArea}>
                  <Text style={[assetsStyle.assetCreatedAt, {
                    color: item.created_at ? 'black' : '#999999'
                  }]}>
                    {item.created_at ? moment(item.created_at).format('YYYY MMM DD HH:mm:ss').toUpperCase() : global.i18n.t("AssetsComponent_registering")}
                  </Text>
                  <Text style={[assetsStyle.assetName, { color: item.created_at ? 'black' : '#999999' }]} numberOfLines={1}>{item.name}</Text>
                  <View style={assetsStyle.assetCreatorRow}>
                    <Text style={[assetsStyle.assetCreator, { color: item.created_at ? 'black' : '#999999' }]} numberOfLines={1}>
                      {item.registrant === CacheData.userInformation.bitmarkAccountNumber ? global.i18n.t("AssetsComponent_you") :
                        (item.registrantName ? item.registrantName : ('[' + item.registrant.substring(0, 4) + '...' + item.registrant.substring(item.registrant.length - 4, item.registrant.length) + ']'))}
                    </Text>
                  </View>
                  <View style={assetsStyle.assetQuantityArea}>
                    {item.created_at && <Text style={assetsStyle.assetQuantity}>{global.i18n.t("AssetsComponent_quantity")}: {item.bitmarks.length}</Text>}
                    {!item.created_at && <Text style={assetsStyle.assetQuantityPending}>{global.i18n.t("AssetsComponent_quantity")}: {item.bitmarks.length}</Text>}
                    {!item.created_at && <Image style={assetsStyle.assetQuantityPendingIcon} source={require('assets/imgs/pending-status.png')} />}
                  </View>
                </View>
                {item.metadata && item.metadata.type === constant.asset.type.music && <View style={assetsStyle.extendArea}>
                  <Image style={assetsStyle.thumbnailImage} source={{ uri: item.thumbnailPath || `${config.bitmark_profile_server}/s/asset/thumbnail?asset_id=${item.id}` }} />
                  {item.registrant === CacheData.userInformation.bitmarkAccountNumber && <Text style={assetsStyle.editionInfo}>Ed. {item.limitedEdition - item.totalIssuedBitmarks + 1}/{item.limitedEdition}</Text>}
                </View>}
              </TouchableOpacity>
            ))}
            {(this.props.appLoadingData || (this.props.assets && this.props.assets.length < this.props.totalAssets)) && <View style={assetsStyle.messageNoAssetArea}>
              <ActivityIndicator size="large" style={{ marginTop: 46, }} />
            </View>}
          </TouchableOpacity>
        </ScrollView>}

        {this.state.subTab === SubTabs.global && <View style={assetsStyle.globalArea}>
          <BitmarkWebViewComponent sourceUrl={config.registry_server_url + '?env=app'} heightButtonController={38} />
        </View>}

        {(!this.props.appLoadingData && this.props.assets && this.props.assets.length === 0 && this.state.subTab === SubTabs.local) &&
          <TouchableOpacity style={assetsStyle.addFirstPropertyButton} onPress={this.addProperty}>
            <Text style={assetsStyle.addFirstPropertyButtonText}>{global.i18n.t("AssetsComponent_addFirstPropertyButtonText")}</Text>
          </TouchableOpacity>
        }
      </View>
    );
  }
}

const StoreAssetsComponent = connect(
  (state) => {
    return state.data;
  },
)(PrivateAssetsComponent);

export class AssetsComponent extends Component {
  static propTypes = {

  }
  constructor(props) {
    super(props);
  }
  render() {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#F5F5F5' }}>
        <Provider store={AssetsStore}>
          <StoreAssetsComponent />
        </Provider>
      </SafeAreaView>
    );
  }
}

