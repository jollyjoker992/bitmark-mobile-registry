import React from 'react';
import PropTypes from 'prop-types';
import { Provider, connect } from 'react-redux';
import {
  View, Text, TouchableOpacity, Image,
} from 'react-native';
import ImagePicker from 'react-native-image-picker';
import { DocumentPicker, DocumentPickerUtil } from 'react-native-document-picker';
import { NavigationActions } from 'react-navigation';

import issuanceOptionsStyle from './issuance-options.component.style';
import defaultStyle from './../../../../../commons/styles';
import { AppProcessor, DataProcessor } from '../../../../../processors';
import { EventEmitterService } from '../../../../../services';
import { BottomTabsComponent } from '../../../bottom-tabs/bottom-tabs.component';
import { FileUtil } from '../../../../../utils';
import { CommonModel } from '../../../../../models';
import { AccountStore } from '../../../../../stores';

export class PrivateIssuanceOptionsComponent extends React.Component {
  constructor(props) {
    super(props);
    this.onChooseFile = this.onChooseFile.bind(this);
    this.onChoosePhotoFile = this.onChoosePhotoFile.bind(this);
    this.issueIftttData = this.issueIftttData.bind(this);
  }

  // ==========================================================================================

  onChoosePhotoFile() {
    CommonModel.doTrackEvent({
      event_name: 'registry_user_want_issue_photo',
      account_number: DataProcessor.getUserInformation().bitmarkAccountNumber,
    });
    let options = {
      title: '',
      takePhotoButtonTitle: '',
      mediaType: 'mixed',
      noData: true,
    };
    ImagePicker.showImagePicker(options, (response) => {
      if (response.error || response.didCancel) {
        return;
      }
      CommonModel.doTrackEvent({
        event_name: 'registry_user_chosen_photo_for_issuance',
        account_number: DataProcessor.getUserInformation().bitmarkAccountNumber,
      });
      this.prepareToIssue(response);
    });
  }

  onChooseFile() {
    CommonModel.doTrackEvent({
      event_name: 'registry_user_want_issue_file',
      account_number: DataProcessor.getUserInformation().bitmarkAccountNumber,

    });
    DocumentPicker.show({
      filetype: [DocumentPickerUtil.allFiles(), "public.data"],
    }, (error, response) => {
      if (error) {
        return;
      }
      CommonModel.doTrackEvent({
        event_name: 'registry_user_chosen_file_for_issuance',
        account_number: DataProcessor.getUserInformation().bitmarkAccountNumber,
      });
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
      this.props.screenProps.homeNavigation.navigate('LocalIssueFile', {
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
      this.props.screenProps.homeNavigation.navigate('IftttActive');
    } else {
      const resetHomePage = NavigationActions.reset({
        index: 0,
        actions: [
          NavigationActions.navigate({
            routeName: 'User', params: {
              displayedTab: { mainTab: BottomTabsComponent.MainTabs.account, subTab: 'AUTHORIZED' },
            }
          }),
        ]
      });
      this.props.screenProps.homeNavigation.dispatch(resetHomePage);
    }
  }

  render() {
    return (
      <View style={issuanceOptionsStyle.body}>
        <View style={issuanceOptionsStyle.header}>
          <TouchableOpacity style={defaultStyle.headerLeft} onPress={() => this.props.screenProps.issuanceNavigation.goBack()}>
            <Image style={defaultStyle.headerLeftIcon} source={require('../../../../../../assets/imgs/header_blue_icon.png')} />
          </TouchableOpacity>
          <Text style={defaultStyle.headerTitle}>{global.i18n.t("IssuanceOptionsComponent_register")}</Text>
          <TouchableOpacity style={defaultStyle.headerRight} />
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
            {(!this.props.iftttInformation || !this.props.iftttInformation.connectIFTTT) && <Image style={issuanceOptionsStyle.optionButtonNextIcon} source={require('./../../../../../../assets/imgs/next-icon-blue.png')} />}
            {this.props.iftttInformation && !!this.props.iftttInformation.connectIFTTT && <Text style={issuanceOptionsStyle.optionButtonStatus}>{global.i18n.t("IssuanceOptionsComponent_authorized")}</Text>}
          </TouchableOpacity>

          <Text style={issuanceOptionsStyle.message}>
            {global.i18n.t("IssuanceOptionsComponent_message")}
          </Text>
        </View>
      </View>
    );
  }
}

PrivateIssuanceOptionsComponent.propTypes = {
  iftttInformation: PropTypes.any,
  screenProps: PropTypes.shape({
    homeNavigation: PropTypes.shape({
      navigate: PropTypes.func,
      dispatch: PropTypes.func,
      goBack: PropTypes.func,
    }),
    issuanceNavigation: PropTypes.shape({
      navigate: PropTypes.func,
      goBack: PropTypes.func,
    }),
  }),
  navigation: PropTypes.shape({
    navigate: PropTypes.func,
    goBack: PropTypes.func,
  }),
}


const StoreIssuanceOptionsComponent = connect(
  (state) => {
    return state.data;
  },
)(PrivateIssuanceOptionsComponent);

export class IssuanceOptionsComponent extends React.Component {
  static propTypes = {
    navigation: PropTypes.shape({
      navigate: PropTypes.func,
      goBack: PropTypes.func,
    }),
    screenProps: PropTypes.shape({
      logout: PropTypes.func,
      subTab: PropTypes.string,
      homeNavigation: PropTypes.shape({
        navigate: PropTypes.func,
        goBack: PropTypes.func,
      }),
    }),
  }
  constructor(props) {
    super(props);
  }
  render() {
    return (
      <View style={{ flex: 1 }}>
        <Provider store={AccountStore}>
          <StoreIssuanceOptionsComponent screenProps={this.props.screenProps} navigation={this.props.navigation} />
        </Provider>
      </View>
    );
  }
}
