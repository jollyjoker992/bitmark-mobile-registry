import React from 'react';
import PropTypes from 'prop-types';
import ReactNative, {
  View, TouchableOpacity, Image, Text, TextInput, KeyboardAvoidingView, ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import ImagePicker from 'react-native-image-picker';
import { Actions } from 'react-native-router-flux';
import { DocumentPicker, DocumentPickerUtil } from 'react-native-document-picker';

import { defaultStyles } from 'src/views/commons';
import { constant, config } from 'src/configs';
import { convertWidth, isImageFile, FileUtil } from 'src/utils';
import { AppProcessor } from 'src/processors';

const { ActionSheetIOS } = ReactNative;

export class MusicBasicInfoComponent extends React.Component {
  static propTypes = {
    filePath: PropTypes.string,
    asset: PropTypes.any,
  }

  constructor(props) {
    super(props);
    this.state = {
      filePath: this.props.filePath,
      thumbnailPath: null,
      canContinue: false,
      assetName: '',
      // assetName: this.props.asset.name || '',
      assetNameError: '',
      limited: '',
      limitedError: '',
      description: '',
      // description: this.props.asset.metadata.description || '',
      descriptionError: '',
      thumbnailPathError: '',
    }
  }

  changeFile() {
    DocumentPicker.show({
      filetype: [DocumentPickerUtil.allFiles(), "public.data"],
    }, async (error, response) => {
      if (error) {
        Actions.jump('assets');
        return;
      }
      if (response.fileSize > 100 * 1024 * 1024) {
        Alert.alert(global.i18n.t('MusicBasicInfoComponent_failedChangeFileAlertTitle'), global.i18n.t('MusicBasicInfoComponent_failedChangeFileAlertMessage'));
        return;
      }
      let filePath = response.uri.replace('file://', '');
      filePath = decodeURIComponent(filePath);

      let destPath = FileUtil.CacheDirectory + '/' + (response.fileName || (response.uri.substring(response.uri.lastIndexOf('/') + 1, response.uri.length)));
      await FileUtil.moveFileSafe(filePath, destPath);
      filePath = destPath;

      AppProcessor.doCheckFileToIssue(filePath).then(asset => {
        if (asset && asset.name) {
          Alert.alert(global.i18n.t('MusicBasicInfoComponent_registerFailedAlertTitle'), global.i18n.t('MusicBasicInfoComponent_registerFailedAlertMessage'));
        } else {
          if (this.state.filePath !== filePath) {
            FileUtil.removeSafe(this.state.filePath);
          }
          this.setState({ filePath });
        }
      }).catch(error => {
        Alert.alert(global.i18n.t('MusicBasicInfoComponent_failedChangeFileAlertTitle'), global.i18n.t('MusicBasicInfoComponent_failedChangeFileAlertMessage'));
        console.log({ error });
      });
    });
  }

  onChooseThumbnail() {
    ActionSheetIOS.showActionSheetWithOptions({
      title: global.i18n.t('MusicBasicInfoComponent_chooseThumbnailTitle'),
      options: [global.i18n.t('MusicBasicInfoComponent_chooseThumbnailCancel'),
      global.i18n.t('MusicBasicInfoComponent_chooseThumbnailCapture'),
      global.i18n.t('MusicBasicInfoComponent_chooseThumbnailPhoto'),
      global.i18n.t('MusicBasicInfoComponent_chooseThumbnailFile'),
      ],
      cancelButtonIndex: 0,
    },
      (buttonIndex) => {
        switch (buttonIndex) {
          case 1: {
            ImagePicker.launchCamera({}, async (response) => {
              if (response.error || response.didCancel) {
                return;
              }
              if (response.fileSize > 100 * 1024 * 1024) {
                Alert.alert(global.i18n.t('MusicBasicInfoComponent_failedChangeFileAlertTitle'), global.i18n.t('MusicBasicInfoComponent_failedChangeFileAlertMessage'));
                return;
              }
              console.log('response uri:', response.uri);
              let thumbnailPath = response.uri.replace('file://', '');
              thumbnailPath = decodeURIComponent(thumbnailPath);
              let destPath = FileUtil.CacheDirectory + '/' + (response.fileName || (response.uri.substring(response.uri.lastIndexOf('/') + 1, response.uri.length)));
              await FileUtil.copyFileSafe(thumbnailPath, destPath);
              console.log('destPath :', destPath);
              thumbnailPath = destPath;
              this.setState({
                thumbnailPath, thumbnailPathError: '',
                canContinue: this.state.assetName && this.state.limited && this.state.description && !this.state.assetNameError && !this.state.descriptionError && !this.state.limitedError,
              });
            });
            break;
          }
          case 2: {
            ImagePicker.launchImageLibrary({}, async (response) => {
              if (response.error || response.didCancel) {
                return;
              }
              if (response.fileSize > 100 * 1024 * 1024) {
                Alert.alert(global.i18n.t('MusicBasicInfoComponent_failedChangeFileAlertTitle'), global.i18n.t('MusicBasicInfoComponent_failedChangeFileAlertMessage'));
                return;
              }
              console.log('response.uri :', response.uri);
              let thumbnailPath = response.uri.replace('file://', '');
              thumbnailPath = decodeURIComponent(thumbnailPath);
              let destPath = FileUtil.CacheDirectory + '/' + (response.fileName || (response.uri.substring(response.uri.lastIndexOf('/') + 1, response.uri.length)));
              await FileUtil.copyFileSafe(thumbnailPath, destPath);
              console.log('destPath :', destPath);
              thumbnailPath = destPath;
              this.setState({
                thumbnailPath, thumbnailPathError: '',
                canContinue: this.state.assetName && this.state.limited && this.state.description && !this.state.assetNameError && !this.state.descriptionError && !this.state.limitedError,
              });
            });
            break;
          }
          case 3: {
            DocumentPicker.show({
              filetype: [DocumentPickerUtil.allFiles(), "public.data"],
            }, async (error, response) => {
              if (error) {
                return;
              }
              if (response.fileSize > 100 * 1024 * 1024) {
                Alert.alert(global.i18n.t('MusicBasicInfoComponent_failedChangeFileAlertTitle'), global.i18n.t('MusicBasicInfoComponent_failedChangeFileAlertMessage'));
                return;
              }
              let thumbnailPath = response.uri.replace('file://', '');
              thumbnailPath = decodeURIComponent(thumbnailPath);
              let destPath = FileUtil.CacheDirectory + '/' + (response.fileName || (response.uri.substring(response.uri.lastIndexOf('/') + 1, response.uri.length)));
              await FileUtil.moveFileSafe(thumbnailPath, destPath);
              thumbnailPath = destPath;

              let thumbnailPathError = '';
              if (!isImageFile(this.thumbnailPath)) {
                thumbnailPath = '';
                thumbnailPathError = global.i18n.t('MusicBasicInfoComponent_chooseThumbnailFileWrong');
              }
              if (this.state.thumbnailPath && this.state.thumbnailPath !== thumbnailPath) {
                FileUtil.removeSafe(this.state.thumbnailPath);
              }
              this.setState({
                thumbnailPath, thumbnailPathError,
                canContinue: !!thumbnailPath && this.state.assetName && this.state.limited && this.state.description && !this.state.assetNameError && !this.state.descriptionError && !this.state.limitedError,
              });
            });
            break;
          }
          default: {
            break;
          }
        }
      });
  }

  onInputAsset(assetName) {
    let assetNameError = '';
    if (assetName) {
      let temp = new Buffer(assetName);
      if (temp.length > 64) {
        assetNameError = global.i18n.t('MusicBasicInfoComponent_assetNameError1');
      }
    } else {
      assetNameError = global.i18n.t('MusicBasicInfoComponent_assetNameError2');
    }

    this.setState({
      assetName, assetNameError,
      canContinue: assetName && this.state.limited && this.state.description && !!this.state.thumbnailPath && !assetNameError && !this.state.descriptionError && !this.state.limitedError,
    });
  }
  onInputLimited(limited) {
    limited = parseInt(limited);
    let limitedError = '';
    if (isNaN(limited) || limited <= 0) {
      limitedError = global.i18n.t('MusicBasicInfoComponent_limitedError1');
    }
    console.log({ limited, limitedError });
    this.setState({
      limited, limitedError,
      canContinue: this.state.assetName && limited && this.state.description && !!this.state.thumbnailPath && !limitedError && !this.state.descriptionError && !this.state.assetNameError,
    });
  }

  onInputDescription(description) {
    let descriptionError = '';
    if (description) {
      let temp = new Buffer(description);
      if (temp.length > 1024) {
        global.i18n.t('MusicBasicInfoComponent_descriptionError1');
      }
    } else {
      global.i18n.t('MusicBasicInfoComponent_descriptionError2');
    }
    this.setState({
      description, descriptionError,
      canContinue: this.state.assetName && this.state.limited && description && !!this.state.thumbnailPath && !descriptionError && !this.state.limitedError && !this.state.assetNameError,
    });
  }
  onContinue() {
    let assetNameError = '';
    if (this.state.assetName) {
      let temp = new Buffer(this.state.assetName);
      if (temp.length > 64) {
        assetNameError = global.i18n.t('MusicBasicInfoComponent_assetNameError1');
      }
    } else {
      assetNameError = global.i18n.t('MusicBasicInfoComponent_assetNameError2');
    }
    let limited = parseInt(this.state.limited);
    let limitedError = '';
    if (isNaN(limited) || limited <= 0) {
      limitedError = global.i18n.t('MusicBasicInfoComponent_limitedError1');
    }
    let descriptionError = '';
    if (this.state.description) {
      let temp = new Buffer(this.state.description);
      if (temp.length > 1024) {
        descriptionError = global.i18n.t('MusicBasicInfoComponent_descriptionError1');
      }
    } else {
      descriptionError = global.i18n.t('MusicBasicInfoComponent_descriptionError2');
    }
    let thumbnailPathError = '';
    if (!this.state.thumbnailPath) {
      thumbnailPathError = global.i18n.t('MusicBasicInfoComponent_thumbnailError');
    }
    let canContinue = this.state.assetName && this.state.limited && this.state.description && !!this.state.thumbnailPath && !descriptionError && !limitedError && !assetNameError;

    if (canContinue) {
      Actions.musicMetadata({
        filePath: this.state.filePath,
        thumbnailPath: this.state.thumbnailPath,
        assetName: this.state.assetName,
        limitedEdition: this.state.limited,
        description: this.state.description,
      });
    } else {
      this.setState({
        canContinue,
        thumbnailPathError,
        assetNameError,
        limitedError,
        descriptionError,
      });
    }
  }

  doCancel() {
    Alert.alert(global.i18n.t('MusicBasicInfoComponent_cancelTitle'), global.i18n.t('MusicBasicInfoComponent_cancelMessage'), [{
      text: global.i18n.t('MusicBasicInfoComponent_cancelYes'), onPress: () => Actions.jump('assets'),
    }, {
      text: global.i18n.t('MusicBasicInfoComponent_cancelNo'), style: 'cancel',
    }]);
  }

  render() {
    return (
      <View style={{ flex: 1, backgroundColor: 'white' }}>
        <KeyboardAvoidingView behavior="padding" style={{ flex: 1 }} >
          <View style={cStyles.header}>
            <TouchableOpacity style={defaultStyles.headerLeft} onPress={Actions.pop}>
              <Image style={[defaultStyles.headerLeftIcon, { width: convertWidth(20), height: convertWidth(20) }]} source={require('assets/imgs/header_blue_icon.png')} />
            </TouchableOpacity>
            <Text style={[defaultStyles.headerTitle, { color: '#0060F2' }]}>{global.i18n.t('MusicBasicInfoComponent_headerTitle')}</Text>
            <TouchableOpacity style={defaultStyles.headerRight} onPress={this.doCancel.bind(this)}>
              <Text style={defaultStyles.headerRightText}>{global.i18n.t('MusicBasicInfoComponent_headerRightText')}</Text>
            </TouchableOpacity>
          </View>
          <ScrollView contentContainerStyle={{ flexGrow: 1, alignItems: 'center' }}>
            <View style={cStyles.content}>
              <View style={cStyles.mainContent}>
                {!!this.state.thumbnailPath && <TouchableOpacity style={cStyles.thumbnailArea} onPress={this.onChooseThumbnail.bind(this)}>
                  <Image style={cStyles.thumbnailImage} source={{ uri: this.state.thumbnailPath }} />
                </TouchableOpacity>}
                {!this.state.thumbnailPath && <TouchableOpacity style={[cStyles.thumbnailArea, { backgroundColor: '#E6FF00' }]} onPress={this.onChooseThumbnail.bind(this)}>
                  <Image style={cStyles.thumbnailImageIcon} source={require('assets/imgs/music_thumbnail.png')} />
                  <Text style={cStyles.thumbnailImageText}>{global.i18n.t('MusicBasicInfoComponent_thumbnailImageText')}</Text>
                  <Text style={[cStyles.fieldInputError, { width: 'auto' }]}>{this.state.thumbnailPathError}</Text>
                </TouchableOpacity>}

                <View style={cStyles.fileInfo}>
                  <Text style={cStyles.fileName}>{this.state.filePath.substring(this.state.filePath.lastIndexOf('/') + 1, this.state.filePath.length)}</Text>
                  <TouchableOpacity style={cStyles.fileRemoveButton} onPress={this.changeFile.bind(this)}>
                    <Image style={cStyles.fileRemoveButtonIcon} source={require('assets/imgs/change_file_icon.png')} />
                  </TouchableOpacity>
                </View>

                <View style={[cStyles.fieldArea, { marginTop: 30 }]}>
                  <Text style={cStyles.fieldLabel}>{global.i18n.t('MusicBasicInfoComponent_fieldLabelPropertyName')}</Text>
                  <TextInput style={[cStyles.fieldInput]}
                    placeholder={global.i18n.t('MusicBasicInfoComponent_fieldLabelPropertyNamePlaceholder')}
                    defaultValue={this.state.assetName}
                    onChangeText={(assetName) => this.onInputAsset.bind(this)(assetName)}
                  />
                  <View style={{ borderBottomWidth: 2, borderBottomColor: this.state.assetNameError ? '#FF003C' : '#0060F2', width: '100%' }} />
                  <Text style={cStyles.fieldInputError}>{this.state.assetNameError}</Text>
                </View>

                <View style={cStyles.fieldArea}>
                  <Text style={cStyles.fieldLabel}>{global.i18n.t('MusicBasicInfoComponent_fieldLabelLimited')}</Text>
                  <TextInput style={[cStyles.fieldInput]}
                    keyboardType='number-pad'
                    placeholder="e.g. 300"
                    onChangeText={(limitedNumber) => this.onInputLimited.bind(this)(limitedNumber)}
                  />
                  <View style={{ borderBottomWidth: 2, borderBottomColor: this.state.limitedError ? '#FF003C' : '#0060F2', width: '100%' }} />
                  <Text style={cStyles.fieldInputError}>{this.state.limitedError}</Text>
                </View>

                <View style={cStyles.fieldArea}>
                  <Text style={cStyles.fieldLabel}>{global.i18n.t('MusicBasicInfoComponent_fieldLabelDescription')}</Text>
                  <TextInput style={[cStyles.fieldInput]}
                    placeholder={global.i18n.t('MusicBasicInfoComponent_fieldLabelDescriptionPlaceholder')}
                    defaultValue={this.state.description}
                    multiline={true}
                    onChangeText={(description) => this.onInputDescription.bind(this)(description)}
                  />
                  <View style={{ borderBottomWidth: 2, borderBottomColor: this.state.descriptionError ? '#FF003C' : '#0060F2', width: '100%' }} />
                  <Text style={cStyles.fieldInputError}>{this.state.descriptionError}</Text>
                </View>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
        <TouchableOpacity style={[cStyles.continueButton, this.state.canContinue ? { backgroundColor: '#0060F2' } : {}]} onPress={this.onContinue.bind(this)}>
          <Text style={cStyles.continueButtonText}>{global.i18n.t('MusicBasicInfoComponent_continueButtonText')}</Text>
        </TouchableOpacity>
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
    borderBottomWidth: 1, borderBottomColor: '#0060F2',
    backgroundColor: 'white',
  },

  content: {
    flex: 1, flexDirection: 'column',
    width: '100%',
    paddingTop: 20, paddingLeft: 19, paddingRight: 19,
  },
  mainContent: {
    flex: 1, flexDirection: 'column', alignItems: 'center',
    width: '100%',
  },
  thumbnailArea: {
    flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    width: '100%', height: 206,
  },
  thumbnailImage: {
    width: '100%', height: '100%', resizeMode: 'contain',
  },
  thumbnailImageIcon: {
    width: 78, height: 55, resizeMode: 'contain',
  },
  thumbnailImageText: {
    fontFamily: 'Avenir-Black', fontSize: 16, fontWeight: '800', textAlign: 'center', color: '#0060F2',
    marginTop: 17,
  },
  fileInfo: {
    flexDirection: 'row',
    marginTop: 33,
  },
  fileName: {
    flex: 1,
    fontFamily: 'Avenir-Black', fontSize: 16, fontWeight: '800',
  },
  fileRemoveButton: {
    paddingLeft: 8,
  },
  fileRemoveButtonIcon: {
    width: 22, height: 22, resizeMode: 'contain'
  },
  fieldArea: {
    alignItems: 'center',
    marginTop: 10,
    width: '100%',
  },
  fieldLabel: {
    width: '100%',
    fontFamily: 'Avenir-Black', fontSize: 16, fontWeight: '800',
  },
  fieldInput: {
    width: '100%',
    marginTop: 9, marginBottom: 4,
    paddingLeft: 7, paddingBottom: 5,
    fontFamily: 'Avenir-Book', fontSize: 16, fontWeight: '300',
  },
  fieldInputError: {
    minHeight: 20, width: '100%',
    fontFamily: 'Avenir-Light', fontSize: 14, fontWeight: '300', color: '#FF003C',
  },

  continueButton: {
    flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    width: convertWidth(375), height: constant.buttonHeight + (config.isIPhoneX ? constant.blankFooter : 0),
    paddingBottom: config.isIPhoneX ? (constant.blankFooter / 2) : 0,
    backgroundColor: '#999999',
  },
  continueButtonText: {
    fontFamily: 'Avenir-Black', fontSize: 16, fontWeight: '900', lineHeight: 33, color: 'white',
  },
});
