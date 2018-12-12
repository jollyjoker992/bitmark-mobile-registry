import React from 'react';
// import PropTypes from 'prop-types';
import {
  View, TouchableOpacity, Image, Text,
  WebView,
  StyleSheet,
} from 'react-native';
import { Actions } from 'react-native-router-flux';

import { defaultStyles } from 'src/views/commons';
import { constant } from 'src/configs';
import { convertWidth } from 'src/utils';


export class MusicIssueSuccessComponent extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      selected: 'embed',
      copied: false,
    }
  }

  copySelectedResult() {
    this.setState({ copied: true });
    setTimeout(() => this.setState({ copied: false }), 1000);
  }

  render() {
    return (
      <View style={{ flex: 1, backgroundColor: '#0060F2' }}>
        <View style={cStyles.header}>
          <TouchableOpacity style={defaultStyles.headerLeft} />
          <Text style={defaultStyles.headerTitle}></Text>
          <TouchableOpacity style={defaultStyles.headerRight} onPress={() => Actions.reset('assets')}>
            <Text style={[defaultStyles.headerRightText, { color: '#E6FF00', fontWeight: '900' }]}>Done</Text>
          </TouchableOpacity>
        </View>
        <View style={cStyles.content}>
          <View style={cStyles.mainContent}>
            <Text style={cStyles.title}>{'Music successfully\nregistered!'.toUpperCase()}</Text>
            <Text style={cStyles.description}>You’re now ready to share and distribute your music to your fans.</Text>
            <View style={cStyles.claimIframe}>

            </View>
            <View style={cStyles.issueResult}>
              {this.state.selected === 'embed' && <View style={cStyles.resultArea}>
                <View style={cStyles.resultHeader}>
                  <Text style={cStyles.resultHeaderTitle}>Embed Bitmark</Text>
                  <TouchableOpacity onPress={this.copySelectedResult.bind(this)}>
                    <Text style={cStyles.resultHeaderCopy}>{this.state.copied ? 'COPIED' : 'COPY'}</Text>
                  </TouchableOpacity>
                </View>
              </View>}

              {this.state.selected !== 'embed' && <View style={cStyles.resultArea}>
                <View style={cStyles.resultHeader}>
                  <Text style={cStyles.resultHeaderTitle}>Share link</Text>
                  <TouchableOpacity onPress={this.copySelectedResult.bind(this)}>
                    <Text style={cStyles.resultHeaderCopy}>{this.state.copied ? 'COPIED' : 'COPY'}</Text>
                  </TouchableOpacity>
                </View>
              </View>}
              <View style={cStyles.resultContent}>
                <Text style={cStyles.resultContentText} >test</Text>
              </View>
              <View style={cStyles.musicSuccessButtons}>
                <TouchableOpacity
                  onPress={() => this.setState({ selected: 'embed' })}
                  style={[cStyles.musicSuccessButton, {
                    backgroundColor: this.state.selected === 'embed' ? '#E6FF00' : 'white',
                    borderColor: this.state.selected === 'embed' ? '#E6FF00' : 'white'
                  }]}>
                  <Image style={cStyles.musicSuccessButtonIcon} source={require('assets/imgs/music_embed_icon.png')} />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => this.setState({ selected: 'link' })}
                  style={[cStyles.musicSuccessButton, {
                    backgroundColor: this.state.selected === 'embed' ? 'white' : '#E6FF00',
                    borderColor: this.state.selected === 'embed' ? 'white' : '#E6FF00',
                    marginLeft: 25,
                  }]}>
                  <Image style={cStyles.musicSuccessButtonIcon} source={require('assets/imgs/music_link_icon.png')} />
                </TouchableOpacity>
              </View>
            </View>
          </View>
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
    flex: 1, flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
    width: '100%',
    paddingLeft: convertWidth(19), paddingRight: convertWidth(19),
  },
  title: {
    fontFamily: 'Avenir-Black', fontSize: 24, fontWeight: '900', color: 'white', lineHeight: 33,
    marginLeft: convertWidth(39),
    width: '100%',
  },
  description: {
    fontFamily: 'Avenir-Light', fontSize: 17, fontWeight: '300', color: 'white', lineHeight: 23,
    marginLeft: convertWidth(39), marginTop: 30,
    width: '100%',
  },
  claimIframe: {
    width: convertWidth(306), minHeight: 159,
    borderWidth: 1,
    marginTop: 36,
  },
  issueResult: {
    flex: 1,
    width: '100%',
    marginTop: 50,
  },
  resultArea: {
    width: '100%',
  },
  resultHeader: {
    flexDirection: 'row',
  },
  resultHeaderTitle: {
    fontFamily: 'Avenir-Light', fontSize: 17, fontWeight: '300', color: 'white',
    flex: 1,
  },
  resultHeaderCopy: {
    fontFamily: 'Avenir-Black', fontSize: 14, fontWeight: '600', color: 'white',
  },
  resultContent: {
    marginTop: 5,
    minHeight: 40, width: '100%',
    backgroundColor: '#E6FF00',
    alignItems: 'center', justifyContent: 'center',
    paddingLeft: 10,
  },
  resultContentText: {
    fontFamily: 'Avenir-Roman', fontSize: 14, fontWeight: '600',
    width: '100%',
  },

  musicSuccessButton: {
    width: 60, height: 60,
    borderRadius: 30, borderWidth: 1,
    marginTop: 19,
  },
  musicSuccessButtons: {
    width: '100%',
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
  },
  musicSuccessButtonIcon: {
    width: 60, height: 60, resizeMode: 'contain',
  }
});