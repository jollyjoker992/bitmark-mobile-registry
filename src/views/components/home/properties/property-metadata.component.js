import React from 'react';
import PropTypes from 'prop-types';
import {
  View, Text, Image, ScrollView,
  ViewPropTypes,
  StyleSheet,
} from 'react-native';
import { Provider, connect } from 'react-redux';

import { OneTabButtonComponent } from 'src/views/commons/one-tab-button.component';
import { convertWidth, } from 'src/utils';
import { config, constant } from 'src/configs';
import { EventEmitterService, } from 'src/processors';
import { Actions } from 'react-native-router-flux';
import { PropertyMetadataStore, PropertyMetadataActions, } from 'src/views/stores';



class PrivatePropertyMetadataComponent extends React.Component {
  static propTypes = {
    releasedAsset: PropTypes.any,
    style: ViewPropTypes.style,
  }

  viewBitmarkOnBlockChain() {
    EventEmitterService.emit(EventEmitterService.events.APP_SHOW_COVER);
    Actions.bitmarkWebViewFull({
      title: 'REGISTRY', sourceUrl: `${config.registry_server_url}/assets/${this.props.releasedAsset.id}?env=app`,
    });
  }

  close() {
    EventEmitterService.emit(EventEmitterService.events.APP_SHOW_COVER);
  }


  render() {
    return (
      <View style={cStyles.content}>
        <View style={cStyles.assetContent}>
          <View style={cStyles.thumbnailArea}>
            {(() => {
              if (this.props.releasedAsset.thumbnailPath) {
                return (<Image style={cStyles.thumbnailImage} source={{ uri: this.props.releasedAsset.thumbnailPath }} />);
              }
              return (<Image style={cStyles.thumbnailImage} source={require('assets/imgs/asset_unknow_icon.png')} />);
            })()}
          </View>
          <Text style={cStyles.label}>{'Property metadata'.toUpperCase()}</Text>
          <OneTabButtonComponent style={{ padding: 4, paddingRight: convertWidth(19), }} onPress={this.close.bind(this)}>
            <Image style={cStyles.closeIcon} source={require('assets/imgs/close_icon_blue.png')} />
          </OneTabButtonComponent>
        </View>
        <ScrollView contentContainerStyle={{ flexDirection: 'column', justifyContent: 'flex-end', width: '100%', }}>
          {Object.keys(this.props.releasedAsset.metadata).map(label => (<View key={label} style={cStyles.metadataRow}>
            <Text style={cStyles.metadataLabel}>{label.toUpperCase()}</Text>
            <Text style={cStyles.metadataValue}>{this.props.releasedAsset.metadata[label]}</Text>
          </View>))}
        </ScrollView>
        <View style={cStyles.actionArea}>
          <OneTabButtonComponent style={cStyles.actionRow} onPress={this.viewBitmarkOnBlockChain.bind(this)}>
            <Text style={cStyles.actionRowText}>{'View asset details on blockchain'.toUpperCase()}</Text>
          </OneTabButtonComponent>
        </View>
      </View>
    );
  }
}

const cStyles = StyleSheet.create({
  content: {
    flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between',
    width: '100%',
    backgroundColor: 'white',
    paddingTop: 19, paddingBottom: config.isIPhoneX ? 10 : 0,
    borderTopWidth: 0.1, borderTopRightRadius: 5, borderTopLeftRadius: 5,
    maxHeight: config.deviceSize.height - 100,
  },
  assetContent: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingBottom: 20,
  },
  thumbnailArea: {
    width: 59,
    paddingLeft: convertWidth(19),
  },
  thumbnailImage: {
    width: 30, height: 30, resizeMode: 'cover',
  },
  label: {
    flex: 1,
    fontFamily: 'AvenirNextW1G-Bold', fontSize: 14,
  },
  closeIcon: {
    width: 16, height: 16, resizeMode: 'cover',
  },

  actionArea: {
    width: '100%',
    flexDirection: 'column',
    paddingTop: 20,
    paddingLeft: convertWidth(16), paddingRight: convertWidth(16),
    borderTopWidth: 0.5, borderTopColor: '#C1C1C1',
  },
  actionRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    marginBottom: 35,
    width: '100%', height: constant.buttonHeight,
    backgroundColor: '#F1F1F1'
  },
  actionRowText: {
    width: '100%',
    fontFamily: 'AvenirNextW1G-Bold', fontSize: 16, color: '#0060F2', textAlign: 'center',
  },
  metadataRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start', alignItems: 'flex-start',
    width: '100%',
    paddingLeft: convertWidth(19), paddingRight: convertWidth(19),
    marginBottom: 12,
  },
  metadataLabel: {
    width: convertWidth(102),
    fontFamily: 'Andale Mono', fontSize: 14,
  },
  metadataValue: {
    flex: 1,
    fontFamily: 'Andale Mono', fontSize: 14,
  },

});

const StorePropertyMetadataComponent = connect(
  (state) => {
    return state.data;
  },
)(PrivatePropertyMetadataComponent);

export class PropertyMetadataComponent extends React.Component {
  static propTypes = {
    releasedAsset: PropTypes.object,
  }
  constructor(props) {
    super(props);
    let tempState = { releasedAsset: this.props.releasedAsset, };
    PropertyMetadataStore.dispatch(PropertyMetadataActions.init(tempState));
  }
  render() {
    return (
      <Provider store={PropertyMetadataStore}>
        <StorePropertyMetadataComponent />
      </Provider>
    );
  }
}