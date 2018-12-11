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
            <View>
              {this.state.selected === 'embed' && <View style={cStyles.resultArea}>
                <View>
                  <Text>Embed Bitmark</Text>
                  <TouchableOpacity onPress={this.copySelectedResult.bind(this)}>
                    {this.state.copied && <Text>{this.state.copied ? 'COPIED' : 'COPY'}</Text>}
                  </TouchableOpacity>
                </View>
              </View>}

              {this.state.selected !== 'embed' && <View style={cStyles.resultArea}>
                <View>
                  <Text>Share link</Text>
                  <TouchableOpacity onPress={this.copySelectedResult.bind(this)}>
                    {this.state.copied && <Text>{this.state.copied ? 'COPIED' : 'COPY'}</Text>}
                  </TouchableOpacity>
                </View>
                <View style={cStyles.resultContent}>
                  <Text>test</Text>
                </View>
              </View>}
              <View style={cStyles.musicSuccessButtons}>
                <TouchableOpacity style={[cStyles.musicSuccessButton, { backgroundColor: this.state.selected === 'embed' ? '#E6FF00' : 'white' }]}>
                  <Image style={cStyles.musicSuccessButtonIcon} source={require('assets/imgs/music_embed_icon.png')} />
                </TouchableOpacity>
                <TouchableOpacity style={[cStyles.musicSuccessButton, { backgroundColor: this.state.selected === 'embed' ? 'white' : '#E6FF00' }]}>
                  <Image style={cStyles.musicSuccessButtonIcon} source={require('assets/imgs/music_link_icon.png')} />
                </TouchableOpacity>
              </View>
            </View>
          </View>
          <View>
            <Text style={cStyles.message}>Distribute your music in only 3 steps!</Text>
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
  },
  title: {
    fontFamily: 'Avenir-Black', fontSize: 24, fontWeight: '900', color: 'white', lineHeight: 33,
    marginLeft: convertWidth(39),
  },
  description: {
    fontFamily: 'Avenir-Light', fontSize: 17, fontWeight: '300', color: 'white', lineHeight: 23,
    marginLeft: convertWidth(39), marginTop: 30,
  },
  claimIframe: {
    width: convertWidth(306), minHeight: 159,
    borderWidth: 1,
  },
  message: {
    fontFamily: 'Avenir-Medium', fontSize: 15, fontWeight: '300', color: 'white', textAlign: 'center', fontStyle: 'italic',
    width: '100%',
    marginBottom: 12,
  },
  resultArea: {

  },
  resultContent: {
    minHeight: 40,
    backgroundColor: '#E6FF00',
  },

  musicSuccessButton: {
    width: 60, height: 60,
    borderRadius: 30, borderWidth: 1,
  },
  musicSuccessButtons: {
    width: '100%',
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
  },
  musicSuccessButtonIcon: {
    width: 60, height: 60, resizeMode: 'contain',
  }
});
