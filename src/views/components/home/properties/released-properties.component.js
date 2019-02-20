import React from 'react';
import PropTypes from 'prop-types';
import {
  View, Text, Image, SafeAreaView, ScrollView,
  StyleSheet,
  Share,
} from 'react-native';
import { Provider, connect } from 'react-redux';
import moment from 'moment';

import { OneTabButtonComponent } from 'src/views/commons/one-tab-button.component';
import { convertWidth, } from 'src/utils';
import { constant } from 'src/configs';
import { Actions } from 'react-native-router-flux';
import { ReleasedPropertiesStore, ReleasedPropertiesActions } from 'src/views/stores';

import { defaultStyles } from 'src/views/commons';
import { CommonProcessor, EventEmitterService, CacheData } from 'src/processors';

class PrivateReleasedPropertiesComponent extends React.Component {
  static propTypes = {
    releasedAsset: PropTypes.any,
    releasedBitmarks: PropTypes.array,
  }


  viewBitmarkOnBlockChain() {
    EventEmitterService.emit(EventEmitterService.events.APP_SHOW_COVER, { type: 'PropertyMetadataComponent', asset: this.props.releasedAsset });
  }

  distribute() {
    Actions.musicReleaseToPublic({
      assetName: this.props.releasedAsset.name,
      assetId: this.props.releasedAsset.id,
      thumbnailPath: this.props.releasedAsset.thumbnailPath,
      limitedEditions: this.props.releasedAsset.editions[CacheData.userInformation.bitmarkAccountNumber].limited,
      totalEditionLeft: this.props.releasedAsset.editions[CacheData.userInformation.bitmarkAccountNumber].totalEditionLeft
    });
  }

  openAsset() {
    Share.share({ title: this.props.releasedAsset.name, url: this.props.releasedAsset.filePath }).catch(error => {
      EventEmitterService.emit(EventEmitterService.events.APP_PROCESS_ERROR, { error });
    });
  }

  render() {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#F5F5F5', }}>
        <View style={[defaultStyles.header, { height: constant.headerSize.height }]}>
          <OneTabButtonComponent style={defaultStyles.headerLeft} onPress={Actions.pop}>
            <Image style={defaultStyles.headerLeftIcon} source={require('assets/imgs/header_blue_icon.png')} />
          </OneTabButtonComponent>
          <View style={defaultStyles.headerCenter}>
            <Text style={defaultStyles.headerTitle} numberOfLines={1}>{global.i18n.t("ReleasedPropertiesComponent_headerTitle")}</Text>
          </View>
          <OneTabButtonComponent style={[defaultStyles.headerRight]} />
        </View>

        <View style={cStyles.body}>
          <View style={cStyles.releasePropertiesInformation}>
            <View style={cStyles.releasePropertiesInformationContent}>
              <Image style={cStyles.thumbnailImage} source={{ uri: this.props.releasedAsset.thumbnailPath }} />
              <View style={cStyles.assetContent}>
                <View style={{ width: '100%', }}>
                  <Text style={cStyles.assetContentName}>{this.props.releasedAsset.name}</Text>
                  <Text style={cStyles.register}>
                    {global.i18n.t("ReleasedPropertiesComponent_register", {
                      createdAt: moment(this.props.releasedAsset.created_at).format('YYYY MMM DD').toUpperCase(),
                      registrant: CommonProcessor.getDisplayedAccount(this.props.releasedAsset.registrant),
                    })}
                  </Text>
                </View>
                <OneTabButtonComponent style={{ padding: 4 }} onPress={this.viewBitmarkOnBlockChain.bind(this)}>
                  <Text style={cStyles.viewAssetInfoButtonText}>{global.i18n.t("ReleasedPropertiesComponent_viewAssetInfoButtonText")}</Text>
                </OneTabButtonComponent>
              </View>
            </View>
            <View style={cStyles.assetButtonsArea}>
              <OneTabButtonComponent style={cStyles.assetButton} onPress={this.distribute.bind(this)}>
                <Image style={cStyles.assetButtonIcon} source={require('assets/imgs/distribute_icon.png')} />
                <Text style={cStyles.assetButtonText}>{global.i18n.t("ReleasedPropertiesComponent_assetButtonText1")}</Text>
              </OneTabButtonComponent>
              <OneTabButtonComponent style={[cStyles.assetButton, { marginLeft: 19 }]} onPress={this.openAsset.bind(this)}>
                <Image style={cStyles.assetButtonIcon} source={require('assets/imgs/open_asset_icon.png')} />
                <Text style={cStyles.assetButtonText}>{global.i18n.t("ReleasedPropertiesComponent_assetButtonText2")}</Text>
              </OneTabButtonComponent>
            </View>
          </View>
          <Text style={cStyles.totalClaimedBitmarks}>{global.i18n.t("ReleasedPropertiesComponent_totalClaimedBitmarks", { total: this.props.releasedBitmarks.length })}</Text>
          <View style={[cStyles.rowClaimedBitmark, { marginTop: 10 }]}>
            <View style={cStyles.headerClaimedBitmark}>
              <Text style={cStyles.timestamp}>{global.i18n.t("ReleasedPropertiesComponent_timestamp")}</Text>
              <Text style={cStyles.bitmarkId}>{global.i18n.t("ReleasedPropertiesComponent_bitmarkId")}</Text>
              <Text style={cStyles.owner}>{global.i18n.t("ReleasedPropertiesComponent_owner")}</Text>
            </View>
          </View>
          <ScrollView style={{ flex: 1, width: '100%' }} contentContainerStyle={{ flexGrow: 1, width: '100%' }}>
            {this.props.releasedBitmarks.map(bitmark => (<View key={bitmark.id}>
              <View style={[cStyles.rowClaimedBitmark, { marginTop: 10 }]}>
                <Text style={cStyles.timestamp}>{moment(bitmark.created_at).format('YYYY MMM DD').toUpperCase()}</Text>
                <Text style={cStyles.bitmarkId} numberOfLines={1}>{bitmark.id}</Text>
                <Text style={cStyles.owner}>{CommonProcessor.getDisplayedAccount(bitmark.owner)}</Text>
              </View>
            </View>))}
          </ScrollView>
        </View>
      </SafeAreaView>
    );
  }
}

const cStyles = StyleSheet.create({
  body: {
    flex: 1, flexDirection: 'column', alignItems: 'center',
    width: '100%',
    backgroundColor: 'white',
    paddingTop: convertWidth(38),
  },
  releasePropertiesInformation: {
    flexDirection: 'column',
    width: '100%',
  },
  releasePropertiesInformationContent: {
    flexDirection: 'row',
  },
  thumbnailImage: {
    marginLeft: convertWidth(19),
    width: 126, height: 126, resizeMode: 'contain'
  },
  assetContent: {
    flex: 1,
    flexDirection: 'column', justifyContent: 'space-between',
    width: '100%',
    paddingLeft: convertWidth(19), paddingRight: convertWidth(10),
  },
  assetContentName: {
    fontFamily: 'avenir_next_w1g_bold', fontSize: 17,
    marginBottom: 14,
  },
  register: {
    fontFamily: 'andale_mono', fontSize: 14,
  },
  viewAssetInfoButtonText: {
    fontFamily: 'avenir_next_w1g_regular', fontSize: 12, color: '#0060F2'
  },
  assetButtonsArea: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    width: '100%',
    marginTop: 28,
    paddingLeft: convertWidth(19), paddingRight: convertWidth(19),
  },
  assetButton: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#F1F1F1',
    borderRadius: 4, borderWidth: 0.1,
    height: constant.bottomTabsHeight,
  },
  assetButtonText: {
    marginLeft: 10,
    fontFamily: 'avenir_next_w1g_bold', fontSize: 14, color: '#0060F2',
  },
  assetButtonIcon: {
    resizeMode: 'contain', height: 14, width: 17,
  },
  totalClaimedBitmarks: {
    width: '100%',
    marginTop: 29,
    paddingLeft: convertWidth(19), paddingRight: convertWidth(19),
  },
  rowClaimedBitmark: {
    width: '100%',
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingLeft: convertWidth(19), paddingRight: convertWidth(19),
  },
  headerClaimedBitmark: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    borderBottomWidth: 0.5, borderBottomColor: '#C1C1C1',
    borderTopWidth: 0.5, borderTopColor: '#C1C1C1',
    width: '100%', height: 34,
  },
  timestamp: {
    width: 86,
    fontFamily: 'andale_mono', fontSize: 13,
  },
  bitmarkId: {
    width: 80,
    fontFamily: 'andale_mono', fontSize: 13,
    marginLeft: convertWidth(20),
  },
  owner: {
    fontFamily: 'andale_mono', fontSize: 13,
    marginLeft: convertWidth(20),
    flex: 1, width: '100%',
  },


});

const StoreReleasedPropertiesComponent = connect(
  (state) => {
    return state.data;
  },
)(PrivateReleasedPropertiesComponent);

export class ReleasedPropertiesComponent extends React.Component {
  static propTypes = {
    releasedAsset: PropTypes.object,
    releasedBitmarks: PropTypes.array,
  }
  constructor(props) {
    super(props);
    let tempState = { releasedAsset: this.props.releasedAsset, releasedBitmarks: this.props.releasedBitmarks };
    ReleasedPropertiesStore.dispatch(ReleasedPropertiesActions.init(tempState));
  }
  render() {
    return (
      <Provider store={ReleasedPropertiesStore}>
        <StoreReleasedPropertiesComponent />
      </Provider>
    );
  }
}