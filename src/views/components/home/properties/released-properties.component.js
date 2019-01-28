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
    Share.share({ title: this.props.releasedAsset.name, url: this.props.releasedAsset.filePath });
  }


  render() {
    return (
      <SafeAreaView style={{ flex: 1, }}>
        <View style={[defaultStyles.header, { height: constant.headerSize.height }]}>
          <OneTabButtonComponent style={defaultStyles.headerLeft} onPress={Actions.pop}>
            <Image style={defaultStyles.headerLeftIcon} source={require('assets/imgs/header_blue_icon.png')} />
          </OneTabButtonComponent>
          <View style={defaultStyles.headerCenter}>
            <Text style={defaultStyles.headerTitle} numberOfLines={1}>RELEASED PROPERTIES</Text>
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
                  <Text style={cStyles.register}>REGISTER ON {moment(this.props.releasedAsset.created_at).format('YYYY MMM DD').toUpperCase()} BY {CommonProcessor.getDisplayedAccount(this.props.releasedAsset.registrant)}</Text>
                </View>
                <OneTabButtonComponent style={{ padding: 4 }} onPress={this.viewBitmarkOnBlockChain.bind(this)}>
                  <Text style={cStyles.viewAssetInfoButtonText}>{'View Asset Info'.toUpperCase()}</Text>
                </OneTabButtonComponent>
              </View>
            </View>
            <View style={cStyles.assetButtonsArea}>
              <OneTabButtonComponent style={cStyles.assetButton} onPress={this.distribute.bind(this)}>
                <Image style={cStyles.assetButtonIcon} source={require('assets/imgs/distribute_icon.png')} />
                <Text style={cStyles.assetButtonText}>DISTRIBUTE</Text>
              </OneTabButtonComponent>
              <OneTabButtonComponent style={[cStyles.assetButton, { marginLeft: 19 }]} onPress={this.openAsset.bind(this)}>
                <Image style={cStyles.assetButtonIcon} source={require('assets/imgs/open_asset_icon.png')} />
                <Text style={cStyles.assetButtonText}>OPEN ASSET</Text>
              </OneTabButtonComponent>
            </View>
          </View>
          <Text style={cStyles.totalClaimedBitmarks}>TOTAL CLAIMED BITMARKS ({this.props.releasedBitmarks.length})</Text>
          <View style={[cStyles.rowClaimedBitmark, { marginTop: 10 }]}>
            <View style={cStyles.headerClaimedBitmark}>
              <Text style={cStyles.timestamp}>TIMESTAMP</Text>
              <Text style={cStyles.bitmarkId}>BITMARK ID</Text>
              <Text style={cStyles.owner}>OWNER</Text>
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
    fontFamily: 'AvenirNextW1G-Bold', fontSize: 17,
    marginBottom: 14,
  },
  register: {
    fontFamily: 'Andale Mono', fontSize: 14,
  },
  viewAssetInfoButtonText: {
    fontFamily: 'AvenirNextW1G-Regular', fontSize: 12, color: '#0060F2'
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
    fontFamily: 'AvenirNextW1G-Bold', fontSize: 14, color: '#0060F2',
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
    fontFamily: 'Andale Mono', fontSize: 13,
  },
  bitmarkId: {
    width: 80,
    fontFamily: 'Andale Mono', fontSize: 13,
    marginLeft: convertWidth(20),
  },
  owner: {
    fontFamily: 'Andale Mono', fontSize: 13,
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