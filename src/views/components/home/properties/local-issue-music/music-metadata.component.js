import { merge } from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import {
  View, Image, Text, TextInput, KeyboardAvoidingView, ScrollView,
  StyleSheet,
  Keyboard,
  Platform,
  BackHandler,
  Alert,
} from 'react-native';
import { Actions } from 'react-native-router-flux';

import { defaultStyles } from 'src/views/commons';
import { constant, config } from 'src/configs';
import { convertWidth, getMetadataLabel } from 'src/utils';
import { BitmarkService, AppProcessor, EventEmitterService } from 'src/processors';
import { OneTabButtonComponent } from 'src/views/commons/one-tab-button.component';


export class MusicMetadataComponent extends React.Component {
  static propTypes = {
    filePath: PropTypes.string,
    thumbnailPath: PropTypes.string,
    assetName: PropTypes.string,
    limitedEdition: PropTypes.number,
  }
  constructor(props) {
    super(props);
    this.onKeyboardDidShow = this.onKeyboardDidShow.bind(this);
    this.onKeyboardDidHide = this.onKeyboardDidHide.bind(this);
    this.onKeyboardWillShow = this.onKeyboardWillShow.bind(this);

    this.state = {
      canAddNewMetadata: false,
      isEditingMetadata: false,
      metadata: [{
        label: '', value: '',
      }],
      isDisplayingKeyboard: false,
      metadataError: '',
      keyboardHeight: 0,
    };
  }

  componentDidMount() {
    this.keyboardWillShowListener = Keyboard.addListener('keyboardWillShow', this.onKeyboardWillShow);
    this.keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', this.onKeyboardDidShow);
    this.keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', this.onKeyboardDidHide);
    if (config.isAndroid) {
      this.backHandler = BackHandler.addEventListener('hardwareBackPress', () => Actions.jump('properties', { subTab: 'Release' }));
    }
  }
  componentWillUnmount() {
    this.keyboardWillShowListener.remove();
    this.keyboardDidShowListener.remove();
    this.keyboardDidHideListener.remove();
    if (config.isAndroid && this.backHandler) {
      this.backHandler.remove();
    }
  }

  onKeyboardWillShow() {
    this.setState({ keyboardHeight: 1 });
  }
  onKeyboardDidShow(keyboardEvent) {
    let keyboardHeight = keyboardEvent.endCoordinates.height;
    this.setState({ keyboardHeight, });
  }
  onKeyboardDidHide() {
    this.setState({ keyboardHeight: 0 });
  }

  addMetadata() {
    let metadata = this.state.metadata;
    metadata.push({ label: '', value: '' });
    this.setState({
      metadata,
    });
    this.checkMetadata(metadata);
    setTimeout(() => {
      if (this.scrollRef) {
        this.scrollRef.scrollToEnd();
      }
    }, 500);

  }
  async checkMetadata(metadata) {
    metadata = metadata || this.state.metadata;
    let isEditingMetadata = this.isEditingMetadata;
    if (metadata.length === 0) {
      isEditingMetadata = false;
    }

    let metadataError = false;
    for (let item of metadata) {
      item.label = item.label.trim();
      item.value = item.value.trim();

      item.labelError = !item.label && item.value;
      item.valueError = !item.value && item.label;
      metadataError = metadataError || !!item.labelError || !!item.valueError;
    }

    if (!metadataError) {
      let tempMetadata = merge([], metadata);
      tempMetadata.push({ label: constant.asset.metadata.labels.type, value: constant.asset.metadata.values.music });
      metadataError = await BitmarkService.doCheckMetadata(tempMetadata);
    }

    this.setState({
      metadataError,
      metadata,
      canAddNewMetadata: !metadataError && (metadata.findIndex(item => (!item.value || !item.label)) < 0),
      isEditingMetadata,
    });
  }
  onChangeMetadataLabel(index, text) {
    let metadata = this.state.metadata;
    metadata[index].label = text;
    this.checkMetadata(metadata);
  }

  onChangeMetadataValue(index, text) {
    let metadata = this.state.metadata;
    metadata[index].value = text;
    this.checkMetadata(metadata);
  }
  onEndChangeMetadataValue() {
    this.checkMetadata();
  }

  onRemoveMetadata(index) {
    Alert.alert(global.i18n.t('MusicMetadataComponent_deleteAlertTitle'), '', [{
      text: global.i18n.t('MusicMetadataComponent_deleteAlertCancel'), style: 'cancel',
    }, {
      text: global.i18n.t('MusicMetadataComponent_deleteAlertYes'), style: 'destructive',
      onPress: () => {
        let metadata = this.state.metadata;
        metadata.splice(index, 1);
        this.checkMetadata(metadata);
      }
    }], { cancelable: false });
  }

  onSubmit() {
    Keyboard.dismiss();
    let tempMetadata = merge([], this.state.metadata);
    tempMetadata.push({ label: constant.asset.metadata.labels.type, value: constant.asset.metadata.values.music });

    AppProcessor.doIssueMusic(this.props.filePath, this.props.assetName, tempMetadata, this.props.thumbnailPath, this.props.limitedEdition, {
      indicator: true, title: '', message: global.i18n.t('MusicMetadataComponent_processMessage'),
    }).then(result => {
      if (result) {
        Actions.musicIssueSuccess({
          assetId: result[0].assetId,
          assetName: this.props.assetName,
          thumbnailPath: this.props.thumbnailPath,
          limitedEditions: this.props.limitedEdition,
          totalEditionLeft: this.props.limitedEdition,
        });
      }
    }).catch(error => {
      EventEmitterService.emit(EventEmitterService.events.APP_PROCESS_ERROR, { error });
      console.log('doIssueMusic error:', error);
    })
  }

  doCancel() {
    Alert.alert(global.i18n.t('MusicMetadataComponent_cancelTitle'), global.i18n.t('MusicMetadataComponent_cancelMessage'), [{
      text: global.i18n.t('MusicMetadataComponent_cancelYes'), onPress: () => Actions.jump('properties'),
    }, {
      text: global.i18n.t('MusicMetadataComponent_cancelNo'), style: 'cancel',
    }], { cancelable: false });
  }

  render() {
    return (
      <View style={{ flex: 1, backgroundColor: 'white' }}>
        <KeyboardAvoidingView behavior={Platform.select({ ios: 'padding', android: '' })} enabled style={{ flex: 1, borderBottomColor: '#0060F2', borderBottomWidth: 1, backgroundColor: 'white' }} >
          <View style={cStyles.header}>
            <OneTabButtonComponent style={defaultStyles.headerLeft} onPress={Actions.pop}>
              <Image style={[defaultStyles.headerLeftIcon, { width: convertWidth(20), height: convertWidth(20) }]} source={require('assets/imgs/header_blue_icon.png')} />
            </OneTabButtonComponent>
            <Text style={[defaultStyles.headerTitle, { color: '#0060F2' }]}>{global.i18n.t('MusicMetadataComponent_headerTitle')}</Text>
            <OneTabButtonComponent style={defaultStyles.headerRight} onPress={this.doCancel}>
              <Text style={defaultStyles.headerRightText}>{global.i18n.t('MusicMetadataComponent_headerRightText')}</Text>
            </OneTabButtonComponent>
          </View>
          <ScrollView contentContainerStyle={{ flexGrow: 1, alignItems: 'center', backgroundColor: 'white' }} ref={(ref) => this.scrollRef = ref}>
            <View style={cStyles.content}>
              <View style={cStyles.mainContent}>
                {this.state.metadata.map((item, index) => (<View key={index} style={cStyles.fieldArea}>
                  {this.state.isEditingMetadata && <OneTabButtonComponent style={cStyles.fieldRemoveButton} onPress={() => this.onRemoveMetadata.bind(this)(index)}>
                    <Image style={cStyles.fieldRemoveButtonIcon} source={require('assets/imgs/remove-icon-red.png')} />
                  </OneTabButtonComponent>}
                  <View style={cStyles.filedInputArea}>
                    <OneTabButtonComponent
                      style={[cStyles.fieldLabelButton, item.labelError ? { borderBottomColor: '#FF003C' } : {}]}
                      disabled={this.state.isEditingMetadata}
                      onPress={() => Actions.musicMetadataEdit({ index: index, label: item.label, onChangeMetadataLabel: this.onChangeMetadataLabel.bind(this) })}
                    >
                      <Text style={[cStyles.fieldLabelButtonText, item.label ? {} : { color: '#C1C1C1' }]}>
                        {item.label ? getMetadataLabel(item.label, true) : global.i18n.t('MusicMetadataComponent_fieldLabelButtonText', { index: index + 1 })}
                      </Text>
                      <Image style={cStyles.fieldLabelButtonIcon} source={require('assets/imgs/next-icon-blue.png')} />
                    </OneTabButtonComponent>
                    <View style={[cStyles.fieldLabelButton, item.valueError ? { borderBottomColor: '#FF003C' } : {}]}>
                      <TextInput style={[config.isAndroid ? { padding: 2 } : {}, cStyles.fieldValue]}
                        multiline={true}
                        placeholder={global.i18n.t('MusicMetadataComponent_fieldValuePlaceholder')} placeholderTextColor='#C1C1C1'
                        onChangeText={(text) => this.onChangeMetadataValue.bind(this)(index, text)}
                        onEndEditing={this.onEndChangeMetadataValue.bind(this)}
                        onFocus={() => {
                          this.setState({ isEditingMetadata: false });
                        }}
                      />
                    </View>
                  </View>
                </View>))}

                <View style={cStyles.metadataButtonArea}>
                  <OneTabButtonComponent style={cStyles.metadataAddButton} disabled={!this.state.canAddNewMetadata} onPress={this.addMetadata.bind(this)}>
                    <Image style={cStyles.metadataAddButtonIcon} source={
                      this.state.canAddNewMetadata ? require('assets/imgs/plus-white-blue-icon.png') : require('assets/imgs/plus-white-blue-icon-disable.png')} />
                    <Text style={[cStyles.metadataAddButtonText, { color: this.state.canAddNewMetadata ? '#0060F2' : '#C2C2C2' }]}>{global.i18n.t('MusicMetadataComponent_metadataAddButtonText')}</Text>
                  </OneTabButtonComponent>

                  {this.state.isEditingMetadata && this.state.metadata.length > 0 && <OneTabButtonComponent style={[cStyles.metadataEditButton]} onPress={() => this.setState({ isEditingMetadata: false })}>
                    <Text style={[cStyles.metadataEditButtonText, { color: '#0060F2' }]}>{global.i18n.t('MusicMetadataComponent_metadataEditButtonText2')}</Text>
                  </OneTabButtonComponent>}
                  {!this.state.isEditingMetadata && this.state.metadata.length > 0 && <OneTabButtonComponent style={[cStyles.metadataEditButton]} onPress={() => this.setState({ isEditingMetadata: true })}>
                    <Text style={[cStyles.metadataEditButtonText, { color: this.state.isEditingMetadata ? '#C2C2C2' : '#0060F2' }]}>{global.i18n.t('MusicMetadataComponent_metadataEditButtonText1')}</Text>
                  </OneTabButtonComponent>}
                </View>
                {!!this.state.metadataError && <Text style={cStyles.metadataInputError}>{this.state.metadataError}</Text>}
              </View>
            </View>
          </ScrollView>
          {this.state.keyboardHeight === 0 && <View style={cStyles.ownershipArea}>
            <Text style={cStyles.ownershipTitle}>{global.i18n.t('MusicMetadataComponent_ownershipTitle')}</Text>
            <Text style={cStyles.ownershipDescription}>{global.i18n.t('MusicMetadataComponent_ownershipDescription')}</Text>
          </View>}

          <OneTabButtonComponent
            style={[cStyles.continueButton, (!this.state.metadataError) ? { backgroundColor: '#0060F2' } : {}, this.state.keyboardHeight ? { height: constant.buttonHeight } : {}]}
            disabled={!!this.state.metadataError}
            onPress={this.onSubmit.bind(this)}
          >
            <Text style={cStyles.continueButtonText}>{global.i18n.t('MusicMetadataComponent_continueButtonText')}</Text>
          </OneTabButtonComponent>
        </KeyboardAvoidingView>
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
    backgroundColor: 'white'
  },

  content: {
    flex: 1, flexDirection: 'column',
    width: '100%',
    paddingTop: 20, paddingLeft: 19, paddingRight: 19, paddingBottom: 10,
    backgroundColor: 'white',
  },
  mainContent: {
    flex: 1, flexDirection: 'column', alignItems: 'center',
    width: '100%',
  },

  fieldArea: {
    flexDirection: 'row',
    marginTop: 30,
    width: '100%',
  },
  fieldRemoveButton: {
    paddingRight: 5,
    marginTop: 5,
  },
  fieldRemoveButtonIcon: {
    width: 10, height: 10, resizeMode: 'contain',
  },
  filedInputArea: {
    flex: 1,
  },
  fieldLabelButton: {
    flexDirection: 'row',
    width: '100%',
    paddingBottom: 5, paddingLeft: 7,
    borderBottomWidth: 1, borderBottomColor: '#0060F2',
  },
  fieldLabelButtonText: {
    flex: 1,
    fontFamily: 'avenir_next_w1g_light', fontSize: 16, color: 'black',
  },
  fieldLabelButtonIcon: {
    width: 10, height: 10, resizeMode: 'contain',
  },
  fieldValue: {
    width: '100%',
    marginTop: 9,
    fontFamily: 'avenir_next_w1g_light', fontSize: 16, color: 'black',
  },

  metadataButtonArea: {
    flexDirection: 'row', justifyContent: 'space-between',
    width: '100%',
    marginTop: 33,
  },
  metadataAddButton: {
    flexDirection: 'row', alignItems: 'center',
  },
  metadataAddButtonIcon: {
    width: 12, height: 12, resizeMode: 'contain',
  },
  metadataAddButtonText: {
    minWidth: convertWidth(117),
    marginLeft: 10,
    fontFamily: 'andale_mono', fontSize: 13, color: 'black',
  },
  metadataEditButton: {
  },
  metadataEditButtonText: {
    fontFamily: 'andale_mono', fontSize: 14, color: 'black',
  },
  metadataInputError: {
    color: 'red',
    width: '100%',
    marginTop: 20,
  },
  ownershipArea: {
    paddingTop: 10, paddingBottom: 10, paddingLeft: convertWidth(19), paddingRight: convertWidth(19),
    backgroundColor: '#EDF0F4',
  },
  ownershipTitle: {
    fontFamily: 'avenir_next_w1g_bold', fontSize: 16, color: 'black',
  },
  ownershipDescription: {
    fontFamily: 'avenir_next_w1g_light', fontSize: 17, marginTop: 5,
  },

  continueButton: {
    flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    width: convertWidth(375), height: constant.buttonHeight + (config.isIPhoneX ? constant.blankFooter : 0),
    paddingBottom: config.isIPhoneX ? (constant.blankFooter / 2) : 0,
    backgroundColor: '#999999',
  },
  continueButtonText: {
    fontFamily: 'avenir_next_w1g_bold', fontSize: 16, lineHeight: 33, color: 'white',
  },
});
