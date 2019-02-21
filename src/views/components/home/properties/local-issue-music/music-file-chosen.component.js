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
import { convertWidth, FileUtil } from 'src/utils';
import { AppProcessor, EventEmitterService } from 'src/processors';


export class MusicFileChosenComponent extends React.Component {

  onChooseMusicFile() {
    DocumentPicker.show({
      filetype: [DocumentPickerUtil.allFiles(), "public.data"],
    }, async (error, response) => {
      if (error) {
        Actions.jump('properties');
        return;
      }
      if (response.fileSize > 100 * 1024 * 1024) {
        Alert.alert(global.i18n.t('MusicFileChosenComponent_failedAlertTitle'), global.i18n.t('MusicFileChosenComponent_failedAlertMessage'));
        return;
      }
      let filePath = response.uri.replace('file://', '');
      filePath = decodeURIComponent(filePath);

      let destPath = FileUtil.CacheDirectory + '/' + response.fileName;
      await FileUtil.moveFileSafe(filePath, destPath);
      filePath = destPath;

      AppProcessor.doCheckFileToIssue(filePath).then(asset => {
        if (asset && asset.name) {
          // Actions.musicBasicInfo({ filePath, asset });
          Alert.alert(global.i18n.t('MusicFileChosenComponent_failedAlertTitle2'), global.i18n.t('MusicFileChosenComponent_failedAlertMessage2'));
        } else {
          Actions.musicBasicInfo({ filePath });
        }
      }).catch(error => {
        EventEmitterService.emit(EventEmitterService.events.APP_PROCESS_ERROR, { error });
        console.log('doCheckFileToIssue error:', error);
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
            <Text style={cStyles.title}>{global.i18n.t('MusicFileChosenComponent_title')}</Text>
            <Text style={cStyles.description}>{global.i18n.t('MusicFileChosenComponent_description')}</Text>
            <Image style={cStyles.musicImage} source={require('assets/imgs/music_upload.png')} />
          </View>
          <View>
            <Text style={cStyles.message}>{global.i18n.t('MusicFileChosenComponent_message')}</Text>
          </View>
          <TouchableOpacity style={cStyles.chooseMusicButton} onPress={this.onChooseMusicFile.bind(this)}>
            <Text style={cStyles.chooseMusicButtonText}>{global.i18n.t('MusicFileChosenComponent_chooseMusicButtonText')}</Text>
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
    fontFamily: config.isAndroid ? 'avenir_next_w1g_bold' : 'AvenirNextW1G-bold', fontSize: 24, color: 'white', lineHeight: 33,
    marginLeft: convertWidth(39),
  },
  description: {
    fontFamily: config.isAndroid ? 'avenir_next_w1g_light' : 'AvenirNextW1G-light', fontSize: 17, color: 'white', lineHeight: 23,
    marginLeft: convertWidth(39), marginTop: 30,
  },
  musicImage: {
    width: 303, height: 248, resizeMode: 'contain',
    marginTop: 75,
  },
  message: {
    fontFamily: config.isAndroid ? 'avenir_next_w1g_light' : 'AvenirNextW1G-light', fontSize: 15, color: 'white', textAlign: 'center', fontStyle: 'italic',
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
    fontFamily: config.isAndroid ? 'avenir_next_w1g_bold' : 'AvenirNextW1G-bold', fontSize: 16, lineHeight: 33, color: '#0060F2',
  },
});
