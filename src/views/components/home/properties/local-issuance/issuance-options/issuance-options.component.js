import React from 'react';
import PropTypes from 'prop-types';
import {Provider, connect} from 'react-redux';
import {
  View, Text, TouchableOpacity, Image, SafeAreaView,
  Alert, PermissionsAndroid, Platform
} from 'react-native';
import ImagePicker from 'react-native-image-picker';
import {DocumentPicker, DocumentPickerUtil} from 'react-native-document-picker';
import {Actions} from 'react-native-router-flux';

import issuanceOptionsStyle from './issuance-options.component.style';
import {FileUtil, isReleasedAsset} from 'src/utils';
import {AppProcessor, EventEmitterService, CacheData} from 'src/processors';
import {defaultStyles} from 'src/views/commons';
import {AccountStore} from 'src/views/stores';
import {config} from 'src/configs';


export class PrivateIssuanceOptionsComponent extends React.Component {
  // ==========================================================================================
  onChoosePhotoFile() {
    let options = {
      title: '',
      takePhotoButtonTitle: null,
      chooseFromLibraryButtonTitle: global.i18n.t("IssuanceOptionsComponent_chooseFromLibraryButtonTitle"),
      cancelButtonTitle: global.i18n.t("IssuanceOptionsComponent_cancelButtonTitle"),
      mediaType: 'photo',
      noData: true,
    };
    ImagePicker.showImagePicker(options, (response) => {
      if (response.error || response.didCancel) {
        return;
      }
      this.prepareToIssue(response);
    });
  }

  async onChooseFile() {

    if ((await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE)) === PermissionsAndroid.RESULTS.GRANTED) {
      DocumentPicker.show({
        filetype: [DocumentPickerUtil.allFiles(), "public.data"],
      }, (error, response) => {
        console.log('onChooseFile :', error, response);
        if (error) {
          return;
        }
        this.prepareToIssue(response, true);
      });

    }

  }

  async prepareToIssue(response, isFile) {
    console.log('prepareToIssue :', response, isFile);
    let filePath;
    let destPath = FileUtil.CacheDirectory + '/' + response.fileName;
    if (isFile) {
      if (config.isAndroid) {
        await FileUtil.copyFileSafe((await FileUtil.pathFromUri(decodeURIComponent(response.uri))), destPath);
      } else {
        await FileUtil.moveFileSafe(decodeURIComponent(response.uri.replace('file://', '')), destPath);
      }
    } else {
      if (config.isAndroid) {
        await FileUtil.copyFileSafe(response.path, destPath);
      } else {
        await FileUtil.moveFileSafe(decodeURIComponent(response.uri.replace('file://', '')), destPath);
      }
    }
    filePath = destPath;
    console.log('filePath :', filePath);

    let fileName = response.fileName.substring(0, response.fileName.lastIndexOf('.'));
    let fileFormat = response.fileName.substring(response.fileName.lastIndexOf('.'));
    AppProcessor.doCheckFileToIssue(filePath).then(asset => {
      if (isReleasedAsset(asset)) {
        Alert.alert('Can not issue!', 'This asset was released by other account!')
        return;
      }
      Actions.localIssueFile({
        filePath, fileName, fileFormat, asset,
        fingerprint: asset.fingerprint
      });
    }).catch(error => {
      console.log('doCheckFileToIssue error :', error);
      EventEmitterService.emit(EventEmitterService.events.APP_PROCESS_ERROR, {error});
    });
  }

  issueIftttData() {
    if (!this.props.iftttInformation || !this.props.iftttInformation.connectIFTTT) {
      Actions.iftttActive();
    } else {
      Actions.jump('accountDetail', {subTab: 'AUTHORIZED'});
    }
  }

  render() {
    return (
      <SafeAreaView style={issuanceOptionsStyle.body}>
        <View style={issuanceOptionsStyle.header}>
          <TouchableOpacity style={defaultStyles.headerLeft} onPress={Actions.pop}>
            <Image style={defaultStyles.headerLeftIcon} source={require('assets/imgs/header_blue_icon.png')}/>
          </TouchableOpacity>
          <Text style={defaultStyles.headerTitle}>{global.i18n.t("IssuanceOptionsComponent_register")}</Text>
          <TouchableOpacity style={defaultStyles.headerRight}/>
        </View>
        <View style={issuanceOptionsStyle.content}>
          {CacheData.identities[CacheData.userInformation.bitmarkAccountNumber] && CacheData.identities[CacheData.userInformation.bitmarkAccountNumber].is_released_account &&
          <TouchableOpacity style={issuanceOptionsStyle.optionButton} onPress={Actions.musicFileChosen}>
            <Image style={issuanceOptionsStyle.chooseIcon} source={require('assets/imgs/music_icon.png')}/>
            <Text
              style={issuanceOptionsStyle.optionButtonText}>{global.i18n.t("IssuanceOptionsComponent_musics")}</Text>
            <Image style={issuanceOptionsStyle.optionButtonNextIcon}
                   source={require('assets/imgs/next-icon-blue.png')}/>
          </TouchableOpacity>}
          <TouchableOpacity style={issuanceOptionsStyle.optionButton} onPress={this.onChoosePhotoFile.bind(this)}>
            <Image style={issuanceOptionsStyle.chooseIcon} source={require('assets/imgs/photo_icon.png')}/>
            <Text
              style={issuanceOptionsStyle.optionButtonText}>{global.i18n.t("IssuanceOptionsComponent_photos")}</Text>
            <Image style={issuanceOptionsStyle.optionButtonNextIcon}
                   source={require('assets/imgs/next-icon-blue.png')}/>
          </TouchableOpacity>
          <TouchableOpacity style={issuanceOptionsStyle.optionButton} onPress={this.onChooseFile.bind(this)}>
            <Image style={issuanceOptionsStyle.chooseIcon} source={require('assets/imgs/file_icon.png')}/>
            <Text style={issuanceOptionsStyle.optionButtonText}>{global.i18n.t("IssuanceOptionsComponent_files")}</Text>
            <Image style={issuanceOptionsStyle.optionButtonNextIcon}
                   source={require('assets/imgs/next-icon-blue.png')}/>
          </TouchableOpacity>
          {config.isIPhone &&
          <TouchableOpacity style={issuanceOptionsStyle.optionButton} onPress={this.issueIftttData.bind(this)}>
            <Image style={issuanceOptionsStyle.chooseIcon} source={require('assets/imgs/ifttt-icon.png')}/>
            <Text
              style={issuanceOptionsStyle.optionButtonText}>{global.i18n.t("IssuanceOptionsComponent_iftttData")}</Text>
            {(!this.props.iftttInformation || !this.props.iftttInformation.connectIFTTT) &&
            <Image style={issuanceOptionsStyle.optionButtonNextIcon}
                   source={require('assets/imgs/next-icon-blue.png')}/>}
            {this.props.iftttInformation && !!this.props.iftttInformation.connectIFTTT && <Text
              style={issuanceOptionsStyle.optionButtonStatus}>{global.i18n.t("IssuanceOptionsComponent_authorized")}</Text>}
          </TouchableOpacity>}

          <Text style={issuanceOptionsStyle.message}>
            {global.i18n.t("IssuanceOptionsComponent_message")}
          </Text>
        </View>
      </SafeAreaView>
    );
  }
}

PrivateIssuanceOptionsComponent.propTypes = {
  iftttInformation: PropTypes.any,
}


const StoreIssuanceOptionsComponent = connect(
  (state) => {
    return state.data;
  },
)(PrivateIssuanceOptionsComponent);

export class IssuanceOptionsComponent extends React.Component {

  constructor(props) {
    super(props);
  }

  render() {
    return (
      <View style={{flex: 1}}>
        <Provider store={AccountStore}>
          <StoreIssuanceOptionsComponent />
        </Provider>
      </View>
    );
  }
}
