import React from 'react';
import PropTypes from 'prop-types';
import { Provider, connect } from 'react-redux';
import {
  View, Text, TouchableOpacity, Image, SafeAreaView,
} from 'react-native';
import ImagePicker from 'react-native-image-picker';
import { DocumentPicker, DocumentPickerUtil } from 'react-native-document-picker';
import { Actions } from 'react-native-router-flux';

import issuanceOptionsStyle from './issuance-options.component.style';
import { FileUtil } from 'src-new/utils';
import { AppProcessor, EventEmitterService } from 'src-new/processors';
import { defaultStyles } from 'src-new/views/commons';
import { AccountStore } from 'src-new/views/stores';


export class PrivateIssuanceOptionsComponent extends React.Component {
  constructor(props) {
    super(props);
    this.onChooseFile = this.onChooseFile.bind(this);
    this.onChoosePhotoFile = this.onChoosePhotoFile.bind(this);
    this.issueIftttData = this.issueIftttData.bind(this);
  }

  // ==========================================================================================

  onChoosePhotoFile() {
    let options = {
      title: '',
      takePhotoButtonTitle: null,
      chooseFromLibraryButtonTitle: global.i18n.t("IssuanceOptionsComponent_chooseFromLibraryButtonTitle"),
      cancelButtonTitle: global.i18n.t("IssuanceOptionsComponent_cancelButtonTitle"),
      mediaType: 'mixed',
      noData: true,
    };
    ImagePicker.showImagePicker(options, (response) => {
      if (response.error || response.didCancel) {
        return;
      }
      this.prepareToIssue(response);
    });
  }

  onChooseFile() {
    DocumentPicker.show({
      filetype: [DocumentPickerUtil.allFiles(), "public.data"],
    }, (error, response) => {
      if (error) {
        return;
      }
      this.prepareToIssue(response);
    });
  }

  async prepareToIssue(response) {
    let filePath = response.uri.replace('file://', '');
    filePath = decodeURIComponent(filePath);

    // Move file from "tmp" folder to "cache" folder
    let destPath = FileUtil.CacheDirectory + '/' + response.fileName;
    await FileUtil.moveFileSafe(filePath, destPath);
    filePath = destPath;

    let fileName = response.fileName.substring(0, response.fileName.lastIndexOf('.'));
    let fileFormat = response.fileName.substring(response.fileName.lastIndexOf('.'));
    AppProcessor.doCheckFileToIssue(filePath).then(asset => {
      Actions.localIssueFile({
        filePath, fileName, fileFormat, asset,
        fingerprint: asset.fingerprint
      });
    }).catch(error => {
      console.log('onChooseFile error :', error);
      EventEmitterService.emit(EventEmitterService.events.APP_PROCESS_ERROR, { error });
    });
  }

  issueIftttData() {
    if (!this.props.iftttInformation || !this.props.iftttInformation.connectIFTTT) {
      Actions.iftttActive();
    } else {
      Actions.jump('accountDetail', { subTab: 'AUTHORIZED' });
    }
  }

  render() {
    return (
      <SafeAreaView style={issuanceOptionsStyle.body}>
        <View style={issuanceOptionsStyle.header}>
          <TouchableOpacity style={defaultStyles.headerLeft} onPress={Actions.pop}>
            <Image style={defaultStyles.headerLeftIcon} source={require('assets/imgs/header_blue_icon.png')} />
          </TouchableOpacity>
          <Text style={defaultStyles.headerTitle}>{global.i18n.t("IssuanceOptionsComponent_register")}</Text>
          <TouchableOpacity style={defaultStyles.headerRight} />
        </View>
        <View style={issuanceOptionsStyle.content}>
          <TouchableOpacity style={issuanceOptionsStyle.optionButton} onPress={this.onChoosePhotoFile}>
            <Text style={issuanceOptionsStyle.optionButtonText}>{global.i18n.t("IssuanceOptionsComponent_photos")}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={issuanceOptionsStyle.optionButton} onPress={this.onChooseFile}>
            <Text style={issuanceOptionsStyle.optionButtonText}>{global.i18n.t("IssuanceOptionsComponent_files")}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={issuanceOptionsStyle.optionButton} onPress={this.issueIftttData}>
            <Text style={issuanceOptionsStyle.optionButtonText}>{global.i18n.t("IssuanceOptionsComponent_iftttData")}</Text>
            {(!this.props.iftttInformation || !this.props.iftttInformation.connectIFTTT) && <Image style={issuanceOptionsStyle.optionButtonNextIcon} source={require('assets/imgs/next-icon-blue.png')} />}
            {this.props.iftttInformation && !!this.props.iftttInformation.connectIFTTT && <Text style={issuanceOptionsStyle.optionButtonStatus}>{global.i18n.t("IssuanceOptionsComponent_authorized")}</Text>}
          </TouchableOpacity>

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
      <View style={{ flex: 1 }}>
        <Provider store={AccountStore}>
          <StoreIssuanceOptionsComponent />
        </Provider>
      </View>
    );
  }
}
