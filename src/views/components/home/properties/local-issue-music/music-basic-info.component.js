import React from 'react';
import PropTypes from 'prop-types';
import {
  View, TouchableOpacity, Image, Text, TextInput, KeyboardAvoidingView, ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import { Actions } from 'react-native-router-flux';
import { DocumentPicker, DocumentPickerUtil } from 'react-native-document-picker';

import { defaultStyles } from 'src/views/commons';
import { constant, config } from 'src/configs';
import { convertWidth } from 'src/utils';
import { AppProcessor } from 'src/processors';

export class MusicBasicInfoComponent extends React.Component {
  propTypes = {
    filePath: PropTypes.string,
  }

  constructor(props) {
    super(props);
    this.state = {
      filePath: this.props.filePath || 'abc/test.mp4',
      thumbnailPath: null,
      canContinue: false,
    }
  }

  changeFile() {
    Alert.alert('Confirmation', 'Are you sure you want to delete the uploaded file? You will have to re-upload the file again in order to release your music.', [{
      text: 'Cancel', style: 'cancel',
    }, {
      text: 'Delete',
      onPress: () => {
        DocumentPicker.show({
          filetype: [DocumentPickerUtil.audio(), 'public.data'],
        }, (error, response) => {
          if (error) {
            Actions.jump('assets');
            return;
          }
          if (response.fileSize > 100 * 1024 * 1024) {
            Alert.alert('Failed to Upload', 'The file you selected is too large. Maximum file size allowed is: 100MB.');
            return;
          }
          let filePath = response.uri.replace('file://', '');
          filePath = decodeURIComponent(filePath);
          AppProcessor.doCheckFileToIssue(filePath).then(asset => {
            if (asset && asset.name) {
              Alert.alert('Registration Failed', 'The file is already registered before and will not be added again. Please try to add different file.');
            } else {
              this.setState({ filePath });
            }
          }).catch(error => {
            Alert.alert('Failed to Upload', 'The file you selected is too large. Maximum file size allowed is: 100MB.');
            console.log({ error });
          });
        });
      }
    }])
  }

  render() {
    return (
      <View style={{ flex: 1, backgroundColor: 'white' }}>
        <KeyboardAvoidingView behavior="padding" enabled style={{ flex: 1 }} >
          <View style={cStyles.header}>
            <TouchableOpacity style={defaultStyles.headerLeft} onPress={Actions.pop}>
              <Image style={[defaultStyles.headerLeftIcon, { width: convertWidth(20), height: convertWidth(20) }]} source={require('assets/imgs/header_blue_icon.png')} />
            </TouchableOpacity>
            <Text style={[defaultStyles.headerTitle, { color: '#0060F2' }]}>{'Basic info (2 OF 3)'.toUpperCase()}</Text>
            <TouchableOpacity style={defaultStyles.headerRight} onPress={() => Actions.jump('assets')}>
              <Text style={defaultStyles.headerRightText}>Cancel</Text>
            </TouchableOpacity>
          </View>
          <ScrollView contentContainerStyle={{ flexGrow: 1, alignItems: 'center' }}>
            <View style={cStyles.content}>
              <View style={cStyles.mainContent}>
                {!!this.state.thumbnailPath && <View style={cStyles.thumbnailArea}>
                  <Image style={cStyles.thumbnailImage} source={{ uri: this.state.thumbnailPath }} />
                </View>}
                {!this.state.thumbnailPath && <View style={cStyles.thumbnailArea}>
                  <Image style={cStyles.thumbnailImageIcon} source={require('assets/imgs/music_thumbnail.png')} />
                  <Text style={cStyles.thumbnailImageText}>{'+ add cover image'.toUpperCase()}</Text>
                </View>}

                <View style={cStyles.fileInfo}>
                  <Text style={cStyles.fileName}>{this.state.filePath.substring(this.state.filePath.lastIndexOf('/') + 1, this.state.filePath.length)}</Text>
                  <TouchableOpacity style={cStyles.fileRemoveButton} onPress={this.changeFile.bind(this)}>
                    <Image style={cStyles.fileRemoveButtonIcon} source={require('assets/imgs/remove-icon.png')} />
                  </TouchableOpacity>
                </View>

                <View style={cStyles.fieldArea}>
                  <Text style={cStyles.fieldLabel}>PROPERTY NAME</Text>
                  <TextInput style={cStyles.fieldInput}
                    placeholder='64-CHARACTER MAX'
                  />
                </View>

                <View style={cStyles.fieldArea}>
                  <Text style={cStyles.fieldLabel}>{'NUMBER OF Limited Editions'.toUpperCase()}</Text>
                  <TextInput style={cStyles.fieldInput}
                  />
                </View>

                <View style={cStyles.fieldArea}>
                  <Text style={cStyles.fieldLabel}>{'Description'.toUpperCase()}</Text>
                  <TextInput style={cStyles.fieldInput}
                    placeholder='1024 CHARACTER MAX'
                  />
                </View>
              </View>
            </View>
          </ScrollView>
          <TouchableOpacity style={[cStyles.continueButton, this.state.canContinue ? { backgroundColor: '#0060F2' } : {}]}>
            <Text style={cStyles.continueButtonText}>NEXT STEP</Text>
          </TouchableOpacity>
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
    backgroundColor: '#E6FF00',
    flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    width: '100%', height: 206,
  },
  thumbnailImage: {

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
    width: 15, height: 15, resizeMode: 'contain'
  },
  fieldArea: {
    alignItems: 'center',
    borderBottomWidth: 1, borderBottomColor: '#0060F2',
    marginTop: 30,
    width: '100%',
  },
  fieldLabel: {
    width: '100%',
    fontFamily: 'Avenir-Black', fontSize: 16, fontWeight: '800',
  },
  fieldInput: {
    width: '100%',
    marginTop: 9, marginBottom: 4,
    fontFamily: 'Avenir-Book', fontSize: 16, fontWeight: '300',
    paddingLeft: 7,
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
