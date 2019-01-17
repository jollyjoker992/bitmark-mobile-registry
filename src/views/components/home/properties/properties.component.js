import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Provider, connect } from 'react-redux';
import {
  View, Text, TouchableOpacity, ScrollView, Image, ActivityIndicator, SafeAreaView,
  Dimensions,
  StyleSheet,
} from 'react-native';

import { Actions } from 'react-native-router-flux';

import { defaultStyles, BitmarkWebViewComponent } from 'src/views/commons';
import { config, constant } from 'src/configs';
import { convertWidth } from 'src/utils';

import { PropertiesStore, PropertiesActions } from 'src/views/stores';
import { CacheData, CommonProcessor } from 'src/processors';
let currentSize = Dimensions.get('window');

const SubTabs = {
  local: 'Yours',
  release: 'Release',
  global: 'Global',
};

let loadingDataWhenScroll = false;

class PrivatePropertiesComponent extends React.Component {
  static propTypes = {
    displayedBitmarks: PropTypes.array,
    bitmarks: PropTypes.array,
    assets: PropTypes.any,
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
    loadingDataWhenScroll = false;
    return (
      <View style={cStyles.body}>
        <View style={[cStyles.header, { zIndex: 1 }]}>
          <TouchableOpacity style={defaultStyles.headerLeft}></TouchableOpacity>
          <Text style={defaultStyles.headerTitle}>{global.i18n.t("PropertiesComponent_headerTitle")}</Text>
          <TouchableOpacity style={defaultStyles.headerRight} onPress={this.addProperty}>
            <Image style={cStyles.addPropertyIcon} source={require('assets/imgs/plus-icon.png')} />
          </TouchableOpacity>
        </View>

        <View style={cStyles.subTabArea}>
          {this.state.subTab === SubTabs.local && <TouchableOpacity style={[cStyles.subTabButton, {
            shadowOffset: { width: 2 },
            shadowOpacity: 0.15,
          }]}>
            <View style={cStyles.subTabButtonArea}>
              <View style={[cStyles.activeSubTabBar, { backgroundColor: '#0060F2' }]}></View>
              <View style={cStyles.subTabButtonTextArea}>
                <Text style={[cStyles.subTabButtonText, { marginLeft: this.props.bitmarks.length > 9 ? 8 : 0 }]}>
                  {global.i18n.t("PropertiesComponent_yours")}
                  <Text style={{ fontSize: this.props.bitmarks.length > 9 ? 10 : 14 }}>{(this.props.bitmarks.length > 0 ? ` (${this.props.bitmarks.length > 99 ? '99+' : this.props.bitmarks.length})` : '')}</Text>
                </Text>
              </View>
            </View>
          </TouchableOpacity>}
          {this.state.subTab !== SubTabs.local && <TouchableOpacity style={[cStyles.subTabButton, {
            backgroundColor: '#F5F5F5',
            zIndex: 0,
          }]} onPress={() => this.switchSubTab(SubTabs.local)}>
            <View style={cStyles.subTabButtonArea}>
              <View style={[cStyles.activeSubTabBar, { backgroundColor: '#F5F5F5' }]}></View>
              <View style={cStyles.subTabButtonTextArea}>
                <Text style={[cStyles.subTabButtonText, { color: '#C1C1C1', marginLeft: this.props.bitmarks.length > 9 ? 10 : 0 }]}>{global.i18n.t("PropertiesComponent_yours")}<Text style={{ fontSize: this.props.bitmarks.length > 9 ? 8 : 14 }}>{(this.props.bitmarks.length > 0 ? ` (${this.props.bitmarks.length > 99 ? '99+' : this.props.bitmarks.length})` : '')}</Text></Text>
              </View>
            </View>
          </TouchableOpacity>}

          {this.state.subTab === SubTabs.release && <TouchableOpacity style={[cStyles.subTabButton, {
            shadowOffset: { width: 2 },
            shadowOpacity: 0.15,
          }]}>
            <View style={cStyles.subTabButtonArea}>
              <View style={[cStyles.activeSubTabBar, { backgroundColor: '#0060F2' }]}></View>
              <View style={cStyles.subTabButtonTextArea}>
                <Text style={cStyles.subTabButtonText}>RELEASE</Text>
              </View>
            </View>
          </TouchableOpacity>}
          {this.state.subTab !== SubTabs.release && <TouchableOpacity style={[cStyles.subTabButton, {
            backgroundColor: '#F5F5F5',
            zIndex: 0,
          }]} onPress={() => this.switchSubTab(SubTabs.release)}>
            <View style={cStyles.subTabButtonArea}>
              <View style={[cStyles.activeSubTabBar, { backgroundColor: '#F5F5F5' }]}></View>
              <View style={cStyles.subTabButtonTextArea}>
                <Text style={[cStyles.subTabButtonText, { color: '#C1C1C1' }]}>RELEASE</Text>
              </View>
            </View>
          </TouchableOpacity>}

          {this.state.subTab === SubTabs.global && <TouchableOpacity style={[cStyles.subTabButton, {
            shadowOffset: { width: -2 },
            shadowOpacity: 0.15,
          }]}>
            <View style={cStyles.subTabButtonArea}>
              <View style={[cStyles.activeSubTabBar, { backgroundColor: '#0060F2' }]}></View>
              <View style={cStyles.subTabButtonTextArea}>
                <Text style={cStyles.subTabButtonText}>{global.i18n.t("PropertiesComponent_global")}</Text>
              </View>
            </View>
          </TouchableOpacity>}
          {this.state.subTab !== SubTabs.global && <TouchableOpacity style={[cStyles.subTabButton, {
            backgroundColor: '#F5F5F5',
            zIndex: 0,
          }]} onPress={() => this.switchSubTab(SubTabs.global)}>
            <View style={cStyles.subTabButtonArea}>
              <View style={[cStyles.activeSubTabBar, { backgroundColor: '#F5F5F5' }]}></View>
              <View style={cStyles.subTabButtonTextArea}>
                <Text style={[cStyles.subTabButtonText, { color: '#C1C1C1' }]}>{global.i18n.t("PropertiesComponent_global")}</Text>
              </View>
            </View>
          </TouchableOpacity>}
        </View>

        {this.state.subTab === SubTabs.local && <ScrollView style={[cStyles.scrollSubTabArea]}
          onScroll={async (scrollEvent) => {
            if (loadingDataWhenScroll) {
              return;
            }
            if (scrollEvent.nativeEvent.contentOffset.y >= (scrollEvent.nativeEvent.contentSize.height - currentSize.height) &&
              (this.props.displayedBitmarks.length < this.props.bitmarks.length)) {
              loadingDataWhenScroll = true;
              PropertiesStore.dispatch(PropertiesActions.viewMoreBitmarks());
            }
            loadingDataWhenScroll = false;
          }}
          scrollEventThrottle={1}
        >
          <TouchableOpacity activeOpacity={1} style={cStyles.contentSubTab}>
            {(!this.props.appLoadingData && this.props.displayedBitmarks && this.props.displayedBitmarks.length === 0) && <View style={cStyles.messageNoBitmarkArea}>
              {(this.state.subTab === SubTabs.local) && <Text style={cStyles.messageNoBitmarkLabel}>
                {global.i18n.t("PropertiesComponent_messageNoBitmarkLabel")}
              </Text>}
              {(this.state.subTab === SubTabs.local) && <Text style={cStyles.messageNoBitmarkContent}>
                {global.i18n.t("PropertiesComponent_messageNoBitmarkContent")}
              </Text>}
            </View>}
            {this.props.displayedBitmarks && this.props.displayedBitmarks.length > 0 && this.state.subTab === SubTabs.local && this.props.displayedBitmarks.map(bitmark => (
              <TouchableOpacity key={bitmark.id} style={[cStyles.bitmarkRowArea]} onPress={() => {
                // TODO
              }}>
                <View style={cStyles.thumbnailArea}>

                </View>
                <View style={cStyles.bitmarkContent}>
                  <Text style={cStyles.bitmarkAssetName} numberOfLines={1}>{this.props.assets[bitmark.asset_id].name}</Text>
                  <Text style={cStyles.bitmarkissuer} numberOfLines={1}>{CommonProcessor.getDisplayedAccount(bitmark.issuer)}</Text>
                </View>
                {bitmark.status === 'pending' && <Image style={cStyles.bitmarkPendingIcon} source={require('assets/imgs/pending-status.png')} />}
              </TouchableOpacity>
            ))}
            {(this.props.appLoadingData || (this.props.displayedBitmarks && this.props.displayedBitmarks.length < this.props.bitmarks)) && <View style={cStyles.messageNoBitmarkArea}>
              <ActivityIndicator size="large" style={{ marginTop: 46, }} />
            </View>}
          </TouchableOpacity>
        </ScrollView>}

        {this.state.subTab === SubTabs.global && <View style={cStyles.globalArea}>
          <BitmarkWebViewComponent sourceUrl={config.registry_server_url + '?env=app'} heightButtonController={38} />
        </View>}

        {(!this.props.appLoadingData && this.props.displayedBitmarks && this.props.displayedBitmarks.length === 0 && this.state.subTab === SubTabs.local) &&
          <TouchableOpacity style={cStyles.addFirstPropertyButton} onPress={this.addProperty}>
            <Text style={cStyles.addFirstPropertyButtonText}>{global.i18n.t("PropertiesComponent_addFirstPropertyButtonText")}</Text>
          </TouchableOpacity>
        }
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
    fontFamily: 'AvenirNextW1G-Bold',
    fontSize: 14,
    textAlign: 'center',
    flexDirection: 'row',
    alignItems: 'center',
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
    flexDirection: 'column',
  },
  messageNoBitmarkArea: {
    width: '100%',
    flexDirection: 'column',
    alignItems: 'center',
  },
  messageNoBitmarkLabel: {
    marginTop: 46,
    width: convertWidth(337),
    fontFamily: 'AvenirNextW1G-Bold',
    fontSize: 17,
    color: '#0060F2'
  },
  messageNoBitmarkContent: {
    marginTop: 46,
    width: convertWidth(337),
    fontFamily: 'AvenirNextW1G-Light',
    fontSize: 17,
  },
  addFirstPropertyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignContent: 'center',
    justifyContent: 'center',
    backgroundColor: '#0060F2',
    marginTop: 30,
    width: convertWidth(375),
    minHeight: 45,
    position: 'absolute',
    bottom: 0,
  },
  addFirstPropertyButtonText: {
    fontFamily: 'AvenirNextW1G-Bold', textAlign: 'center', fontSize: 16, color: 'white'
  },
  bitmarkRowArea: {
    width: '100%',
    flexDirection: 'row', alignItems: 'center',
    borderBottomColor: '#EDF0F4',
    borderBottomWidth: 1,
    paddingLeft: convertWidth(27), paddingRight: convertWidth(27), paddingTop: 15, paddingBottom: 20,
  },
  thumbnailArea: {
    width: 40, height: 40,
    borderWidth: 1,
  },
  bitmarkContent: {
    flex: 1, width: '100%',
    flexDirection: 'column',
    paddingLeft: convertWidth(26),
  },
  bitmarkAssetName: {
    width: '100%',
    fontFamily: 'AvenirNextW1G-Demi', fontSize: 13,
  },
  bitmarkissuer: {
    marginTop: 8,
    width: '100%',
    fontFamily: 'Andale Mono', fontSize: 13,
  },
  bitmarkPendingIcon: {
    width: 13, height: 17, resizeMode: 'contain',
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

  }
  constructor(props) {
    super(props);
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

