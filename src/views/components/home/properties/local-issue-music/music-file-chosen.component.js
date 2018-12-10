import React from 'react';
// import PropTypes from 'prop-types';
import {
  View, TouchableOpacity, Image, Text,
  StyleSheet,
  Alert,
} from 'react-native';
import { Actions } from 'react-native-router-flux';
import { DocumentPicker, DocumentPickerUtil } from 'react-native-document-picker';

import { defaultStyles } from 'src/views/commons';
import { constant, config } from 'src/configs';
import { convertWidth } from 'src/utils';
import { AppProcessor } from 'src/processors';


export class MusicFileChosenComponent extends React.Component {

  onChooseMusicFile() {
    DocumentPicker.show({
      filetype: [DocumentPickerUtil.audio(), 'public.data'],
    }, (error, response) => {
      if (error) {
        Actions.reset('assets');
        return;
      }
      if (response.fileSize > 100 * 1024 * 1024) {
        Alert.alert('Failed to Upload', 'The file you selected is too large. Maximum file size allowed is: 100MB.');
        return;
      }
      let filePath = response.uri.replace('file://', '');
      filePath = decodeURIComponent(filePath);
      AppProcessor.doCheckFileToIssue(filePath).then(asset => {
        Actions.musicBasicInfo({ filePath, asset });
      }).catch(error => {
        Alert.alert('Failed to Upload', 'The file you selected is too large. Maximum file size allowed is: 100MB.');
        console.log({ error });
      });


    });
  }
  render() {
    return (
      <View style={{ flex: 1, backgroundColor: '#0060F2' }}>
        <View style={cStyles.header}>
          <TouchableOpacity style={defaultStyles.headerLeft} onPress={Actions.pop}>
            <Image style={[defaultStyles.headerLeftIcon, { width: convertWidth(20), height: convertWidth(20) }]} source={require('assets/imgs/header_white_icon.png')} />
          </TouchableOpacity>
          <Text style={defaultStyles.headerTitle}></Text>
          <TouchableOpacity style={defaultStyles.headerRight} />
        </View>
        <View style={cStyles.content}>
          <View style={cStyles.mainContent}>
            <Text style={cStyles.title}>{'RELease limited\nedition Music!'.toUpperCase()}</Text>
            <Text style={cStyles.description}>Register the ownership of your tracks.{'\n'}Share it with the public.{'\n'}Build your legacy.</Text>
          </View>
          <View>
            <Text style={cStyles.message}>Distribute your music in only 3 steps!</Text>
          </View>
          <TouchableOpacity style={cStyles.chooseMusicButton} onPress={this.onChooseMusicFile.bind(this)}>
            <Text style={cStyles.chooseMusicButtonText}>UPLOAD YOUR FILE</Text>
          </TouchableOpacity>
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
    flex: 1, flexDirection: 'column', justifyContent: 'center',
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
  message: {
    fontFamily: 'Avenir-Medium', fontSize: 15, fontWeight: '300', color: 'white', textAlign: 'center', fontStyle: 'italic',
    width: '100%',
    marginBottom: 12,
  },
  chooseMusicButton: {
    flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    width: convertWidth(375), height: constant.buttonHeight + (config.isIPhoneX ? constant.blankFooter : 0),
    paddingBottom: config.isIPhoneX ? (constant.blankFooter / 2) : 0,
    backgroundColor: '#E6FF00',
  },
  chooseMusicButtonText: {
    fontFamily: 'Avenir-Black', fontSize: 16, fontWeight: '900', lineHeight: 33, color: '#0060F2',
  },
});
