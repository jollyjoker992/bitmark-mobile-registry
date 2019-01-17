import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Provider, connect } from 'react-redux';
import {
  View, Text, TouchableOpacity, ScrollView, Image, ActivityIndicator, SafeAreaView,
  Dimensions,
} from 'react-native';

import { Actions } from 'react-native-router-flux';

import propertiesStyles from './properties.component.style';
import { defaultStyles, BitmarkWebViewComponent } from 'src/views/commons';
import { config, } from 'src/configs';
import { PropertiesStore, PropertiesActions } from 'src/views/stores';
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
      <View style={propertiesStyles.body}>
        <View style={[propertiesStyles.header, { zIndex: 1 }]}>
          <TouchableOpacity style={defaultStyles.headerLeft}></TouchableOpacity>
          <Text style={defaultStyles.headerTitle}>{global.i18n.t("PropertiesComponent_headerTitle")}</Text>
          <TouchableOpacity style={defaultStyles.headerRight} onPress={this.addProperty}>
            <Image style={propertiesStyles.addPropertyIcon} source={require('assets/imgs/plus-icon.png')} />
          </TouchableOpacity>
        </View>

        <View style={propertiesStyles.subTabArea}>
          {this.state.subTab === SubTabs.local && <TouchableOpacity style={[propertiesStyles.subTabButton, {
            shadowOffset: { width: 2 },
            shadowOpacity: 0.15,
          }]}>
            <View style={propertiesStyles.subTabButtonArea}>
              <View style={[propertiesStyles.activeSubTabBar, { backgroundColor: '#0060F2' }]}></View>
              <View style={propertiesStyles.subTabButtonTextArea}>
                <Text style={[propertiesStyles.subTabButtonText, { marginLeft: this.props.bitmarks.length > 9 ? 8 : 0 }]}>
                  {global.i18n.t("PropertiesComponent_yours")}
                  <Text style={{ fontSize: this.props.bitmarks.length > 9 ? 10 : 14 }}>{(this.props.bitmarks.length > 0 ? ` (${this.props.bitmarks.length > 99 ? '99+' : this.props.bitmarks.length})` : '')}</Text>
                </Text>
              </View>
            </View>
          </TouchableOpacity>}
          {this.state.subTab !== SubTabs.local && <TouchableOpacity style={[propertiesStyles.subTabButton, {
            backgroundColor: '#F5F5F5',
            zIndex: 0,
          }]} onPress={() => this.switchSubTab(SubTabs.local)}>
            <View style={propertiesStyles.subTabButtonArea}>
              <View style={[propertiesStyles.activeSubTabBar, { backgroundColor: '#F5F5F5' }]}></View>
              <View style={propertiesStyles.subTabButtonTextArea}>
                <Text style={[propertiesStyles.subTabButtonText, { color: '#C1C1C1', marginLeft: this.props.bitmarks.length > 9 ? 10 : 0 }]}>{global.i18n.t("PropertiesComponent_yours")}<Text style={{ fontSize: this.props.bitmarks.length > 9 ? 8 : 14 }}>{(this.props.bitmarks.length > 0 ? ` (${this.props.bitmarks.length > 99 ? '99+' : this.props.bitmarks.length})` : '')}</Text></Text>
              </View>
            </View>
          </TouchableOpacity>}

          {this.state.subTab === SubTabs.release && <TouchableOpacity style={[propertiesStyles.subTabButton, {
            shadowOffset: { width: 2 },
            shadowOpacity: 0.15,
          }]}>
            <View style={propertiesStyles.subTabButtonArea}>
              <View style={[propertiesStyles.activeSubTabBar, { backgroundColor: '#0060F2' }]}></View>
              <View style={propertiesStyles.subTabButtonTextArea}>
                <Text style={propertiesStyles.subTabButtonText}>RELEASE</Text>
              </View>
            </View>
          </TouchableOpacity>}
          {this.state.subTab !== SubTabs.release && <TouchableOpacity style={[propertiesStyles.subTabButton, {
            backgroundColor: '#F5F5F5',
            zIndex: 0,
          }]} onPress={() => this.switchSubTab(SubTabs.release)}>
            <View style={propertiesStyles.subTabButtonArea}>
              <View style={[propertiesStyles.activeSubTabBar, { backgroundColor: '#F5F5F5' }]}></View>
              <View style={propertiesStyles.subTabButtonTextArea}>
                <Text style={[propertiesStyles.subTabButtonText, { color: '#C1C1C1' }]}>RELEASE</Text>
              </View>
            </View>
          </TouchableOpacity>}

          {this.state.subTab === SubTabs.global && <TouchableOpacity style={[propertiesStyles.subTabButton, {
            shadowOffset: { width: -2 },
            shadowOpacity: 0.15,
          }]}>
            <View style={propertiesStyles.subTabButtonArea}>
              <View style={[propertiesStyles.activeSubTabBar, { backgroundColor: '#0060F2' }]}></View>
              <View style={propertiesStyles.subTabButtonTextArea}>
                <Text style={propertiesStyles.subTabButtonText}>{global.i18n.t("PropertiesComponent_global")}</Text>
              </View>
            </View>
          </TouchableOpacity>}
          {this.state.subTab !== SubTabs.global && <TouchableOpacity style={[propertiesStyles.subTabButton, {
            backgroundColor: '#F5F5F5',
            zIndex: 0,
          }]} onPress={() => this.switchSubTab(SubTabs.global)}>
            <View style={propertiesStyles.subTabButtonArea}>
              <View style={[propertiesStyles.activeSubTabBar, { backgroundColor: '#F5F5F5' }]}></View>
              <View style={propertiesStyles.subTabButtonTextArea}>
                <Text style={[propertiesStyles.subTabButtonText, { color: '#C1C1C1' }]}>{global.i18n.t("PropertiesComponent_global")}</Text>
              </View>
            </View>
          </TouchableOpacity>}
        </View>

        {this.state.subTab === SubTabs.local && <ScrollView style={[propertiesStyles.scrollSubTabArea]}
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
          <TouchableOpacity activeOpacity={1} style={propertiesStyles.contentSubTab}>
            {(!this.props.appLoadingData && this.props.displayedBitmarks && this.props.displayedBitmarks.length === 0) && <View style={propertiesStyles.messageNoBitmarkArea}>
              {(this.state.subTab === SubTabs.local) && <Text style={propertiesStyles.messageNoBitmarkLabel}>
                {global.i18n.t("PropertiesComponent_messageNoBitmarkLabel")}
              </Text>}
              {(this.state.subTab === SubTabs.local) && <Text style={propertiesStyles.messageNoBitmarkContent}>
                {global.i18n.t("PropertiesComponent_messageNoBitmarkContent")}
              </Text>}
            </View>}
            {this.props.displayedBitmarks && this.props.displayedBitmarks.length > 0 && this.state.subTab === SubTabs.local && this.props.displayedBitmarks.map(bitmark => (
              <TouchableOpacity key={bitmark.id} style={[propertiesStyles.bitmarkRowArea]} onPress={() => {
                // TODO
              }} >
                <View>

                </View>
              </TouchableOpacity>
            ))}
            {(this.props.appLoadingData || (this.props.displayedBitmarks && this.props.displayedBitmarks.length < this.props.bitmarks)) && <View style={propertiesStyles.messageNoBitmarkArea}>
              <ActivityIndicator size="large" style={{ marginTop: 46, }} />
            </View>}
          </TouchableOpacity>
        </ScrollView>}

        {this.state.subTab === SubTabs.global && <View style={propertiesStyles.globalArea}>
          <BitmarkWebViewComponent sourceUrl={config.registry_server_url + '?env=app'} heightButtonController={38} />
        </View>}

        {(!this.props.appLoadingData && this.props.displayedBitmarks && this.props.displayedBitmarks.length === 0 && this.state.subTab === SubTabs.local) &&
          <TouchableOpacity style={propertiesStyles.addFirstPropertyButton} onPress={this.addProperty}>
            <Text style={propertiesStyles.addFirstPropertyButtonText}>{global.i18n.t("PropertiesComponent_addFirstPropertyButtonText")}</Text>
          </TouchableOpacity>
        }
      </View>
    );
  }
}

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

