import React from 'react';
import PropTypes from 'prop-types';
import {
  View, TouchableOpacity, Image, Text, ScrollView,
  WebView,
  StyleSheet,
  Clipboard
} from 'react-native';
import { Actions } from 'react-native-router-flux';

import { defaultStyles } from 'src/views/commons';
import { constant, config } from 'src/configs';
import { convertWidth } from 'src/utils';


export class MusicIssueSuccessComponent extends React.Component {
  static propTypes = {
    assetName: PropTypes.string,
    assetId: PropTypes.string,
  }
  constructor(props) {
    super(props);
    this.state = {
      selected: 'embed',
      copied: false,
    };
  }

  copySelectedResult() {
    this.setState({ copied: true });
    Clipboard.setString(this.state.selected === 'embed'
      ? `<iframe width="320" height="180" frameborder="0" frameborder="0" src="${config.bitmark_profile_server}/asset/${this.props.assetId}/claim"/>`
      : `${config.registry_server_url}/assets/${this.props.assetId}/claim`);
    setTimeout(() => this.setState({ copied: false }), 1000);
  }

  render() {
    return (
      <View style={{ flex: 1, backgroundColor: '#0060F2' }}>
        <View style={cStyles.header}>
          <TouchableOpacity style={defaultStyles.headerLeft} />
          <Text style={defaultStyles.headerTitle}></Text>
          <TouchableOpacity style={defaultStyles.headerRight} onPress={() => Actions.jump('properties', { subTab: 'Release' })}>
            <Text style={[defaultStyles.headerRightText, { color: '#E6FF00', fontWeight: '900' }]}>{global.i18n.t("MusicIssueSuccessComponent_headerRightText")}</Text>
          </TouchableOpacity>
        </View>
        <View style={cStyles.content}>
          <ScrollView contentContainerStyle={cStyles.mainContent}>
            <Text style={cStyles.title}>{global.i18n.t("MusicIssueSuccessComponent_title")}</Text>
            <Text style={cStyles.description}>{global.i18n.t("MusicIssueSuccessComponent_description")}</Text>
            <View style={cStyles.claimIframe}>
              <WebView style={{ width: '100%', height: 'auto', backgroundColor: 'rgba(0,0,0,0)' }} scalesPageToFit={false}
                scrollEnabled={false}
                source={{ uri: `${config.bitmark_profile_server}/asset/${this.props.assetId}/claim` }} />
              <View style={{ position: 'absolute', flex: 1, zIndex: 1, width: '100%', height: '100%' }} />
            </View>
            <View style={cStyles.issueResult}>
              {this.state.selected === 'embed' && <View style={cStyles.resultArea}>
                <View style={cStyles.resultHeader}>
                  <Text style={cStyles.resultHeaderTitle}>{global.i18n.t("MusicIssueSuccessComponent_resultHeaderTitle1")}</Text>
                  <TouchableOpacity onPress={this.copySelectedResult.bind(this)}>
                    <Text style={cStyles.resultHeaderCopy}>{this.state.copied ? global.i18n.t("MusicIssueSuccessComponent_resultHeaderCopy1") : global.i18n.t("MusicIssueSuccessComponent_resultHeaderCopy2")}</Text>
                  </TouchableOpacity>
                </View>
              </View>}

              {this.state.selected !== 'embed' && <View style={cStyles.resultArea}>
                <View style={cStyles.resultHeader}>
                  <Text style={cStyles.resultHeaderTitle}>{global.i18n.t("MusicIssueSuccessComponent_resultHeaderTitle2")}</Text>
                  <TouchableOpacity onPress={this.copySelectedResult.bind(this)}>
                    <Text style={cStyles.resultHeaderCopy}>{this.state.copied ? global.i18n.t("MusicIssueSuccessComponent_resultHeaderCopy1") : global.i18n.t("MusicIssueSuccessComponent_resultHeaderCopy2")}</Text>
                  </TouchableOpacity>
                </View>
              </View>}
              <TouchableOpacity style={cStyles.resultContent} onPress={this.copySelectedResult.bind(this)}>
                <Text style={cStyles.resultContentText}>
                  {this.state.selected === 'embed'
                    ? `<iframe width="320" height="180" frameborder="0" frameborder="0" src="${config.bitmark_profile_server}/asset/${this.props.assetId}/claim"/>`
                    : `${config.registry_server_url}/assets/${this.props.assetId}/claim`
                  }
                </Text>
              </TouchableOpacity>
              <View style={cStyles.musicSuccessButtons}>
                <View style={{ flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  <TouchableOpacity
                    onPress={() => this.setState({ selected: 'embed' })}
                    style={[cStyles.musicSuccessButton, {
                      backgroundColor: this.state.selected === 'embed' ? '#E6FF00' : 'white',
                      borderColor: this.state.selected === 'embed' ? '#E6FF00' : 'white'
                    }]}>
                    <Image style={cStyles.musicSuccessButtonIcon} source={require('assets/imgs/music_embed_icon.png')} />
                  </TouchableOpacity>
                  <Text style={[cStyles.embedLabelText, { color: this.state.selected === 'embed' ? '#E6FF00' : 'white' }]}>{global.i18n.t("MusicIssueSuccessComponent_embedLabelText")}</Text>
                </View>
                <View style={{ flexDirection: 'column', alignItems: 'center', justifyContent: 'center', marginLeft: 25, }}>
                  <TouchableOpacity
                    onPress={() => this.setState({ selected: 'link' })}
                    style={[cStyles.musicSuccessButton, {
                      backgroundColor: this.state.selected === 'embed' ? 'white' : '#E6FF00',
                      borderColor: this.state.selected === 'embed' ? 'white' : '#E6FF00',
                    }]}>
                    <Image style={cStyles.musicSuccessButtonIcon} source={require('assets/imgs/music_link_icon.png')} />
                  </TouchableOpacity>
                  <Text style={[cStyles.embedLabelText, { color: this.state.selected === 'embed' ? 'white' : '#E6FF00' }]}>{global.i18n.t("MusicIssueSuccessComponent_linkLabelText")}</Text>
                </View>
              </View>
            </View>
          </ScrollView>
        </View>
      </View>
    );
  }
}

const cStyles = StyleSheet.create({

  header: {
    flexDirection: 'row',
    alignContent: 'center',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: constant.headerSize.height + constant.headerSize.paddingTop,
    paddingTop: constant.headerSize.paddingTop,
    width: '100%',
  },

  content: {
    flex: 1,
    flexDirection: 'column',
    width: '100%',
  },
  mainContent: {
    flexGrow: 1, flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
    width: '100%',
    paddingBottom: 10,
  },
  title: {
    fontFamily: 'Avenir-Black', fontSize: 24, fontWeight: '900', color: 'white', lineHeight: 33,
    paddingLeft: convertWidth(35), paddingRight: convertWidth(35),
    width: '100%',
  },
  description: {
    fontFamily: 'Avenir-Light', fontSize: 17, fontWeight: '300', color: 'white', lineHeight: 23,
    paddingLeft: convertWidth(39), paddingRight: convertWidth(35), marginTop: 30,
    width: '100%',
  },
  claimIframe: {
    width: '100%', minHeight: 180,
    paddingLeft: convertWidth(35), paddingRight: convertWidth(35),
    marginTop: 25,
  },
  issueResult: {
    flex: 1,
    width: '100%',
    marginTop: 50,
    paddingLeft: convertWidth(35), paddingRight: convertWidth(35),
  },
  resultArea: {
    width: '100%',
  },
  resultHeader: {
    flexDirection: 'row',
    paddingLeft: convertWidth(4),
  },
  resultHeaderTitle: {
    fontFamily: 'Avenir-Light', fontSize: 17, fontWeight: '300', color: 'white',
    flex: 1,
  },
  resultHeaderCopy: {
    fontFamily: 'Avenir-Black', fontSize: 14, fontWeight: '900', color: 'white', textAlign: 'center',
    minWidth: convertWidth(66),
  },
  resultContent: {
    marginTop: 5,
    minHeight: 40, width: '100%',
    backgroundColor: '#E6FF00',
    alignItems: 'center', justifyContent: 'center',
    padding: 10,
    borderWidth: 0.1, borderColor: '#E6FF00', borderRadius: 3,
  },
  resultContentText: {
    fontFamily: 'Avenir-Roman', fontSize: 14, fontWeight: '600',
    width: '100%',
  },

  musicSuccessButton: {
    width: 60, height: 60,
    borderRadius: 30, borderWidth: 1,
    marginTop: 19,
    flexDirection: 'column', alignItems: 'center',
  },
  musicSuccessButtons: {
    width: '100%',
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
  },
  musicSuccessButtonIcon: {
    width: 60, height: 60, resizeMode: 'contain',
  },
  embedLabelText: {
    marginTop: 9,
    fontFamily: 'Avenir-Light', fontSize: 17, fontWeight: '300',
  },
});
