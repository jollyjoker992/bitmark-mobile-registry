import React from 'react';
import PropTypes from 'prop-types';
import {
  View, Text, Image, TextInput, FlatList, KeyboardAvoidingView, SafeAreaView, ScrollView,
  Alert,
  Platform,
  Keyboard,
} from 'react-native';
import { Actions } from 'react-native-router-flux';
import localAddPropertyStyle from './issue-file.component.style';
import { AppProcessor, BitmarkService } from 'src/processors';
import { FileUtil, convertWidth, getMetadataLabel, getMetadataValue } from 'src/utils';
import { defaultStyles } from 'src/views/commons';
import { constant, config } from 'src/configs';
import { OneTabButtonComponent } from 'src/views/commons/one-tab-button.component';



export class LocalIssueFileComponent extends React.Component {
  constructor(props) {
    super(props);
    this.onIssueFile = this.onIssueFile.bind(this);
    this.doInputAssetName = this.doInputAssetName.bind(this);
    this.onChangeMetadataValue = this.onChangeMetadataValue.bind(this);
    this.onEndChangeMetadataValue = this.onEndChangeMetadataValue.bind(this);
    this.onEndChangeMetadataKey = this.onEndChangeMetadataKey.bind(this);
    this.addNewMetadataField = this.addNewMetadataField.bind(this);

    this.doInputQuantity = this.doInputQuantity.bind(this);

    let metadataList = [];

    let asset = this.props.asset || {};
    let fingerprint = this.props.fingerprint || '';
    let fileFormat = this.props.fileFormat || '';
    let filePath = this.props.filePath || '';
    let fileName = this.props.fileName || '';

    let existingAsset = !!(asset && asset.name);
    if (existingAsset) {
      let key = 0;
      for (let label in asset.metadata) {
        metadataList.push({
          key,
          label: getMetadataLabel(label, true),
          value: getMetadataValue(asset.metadata[label]),
        });
        key++;
      }
    }

    this.state = {
      existingAsset,
      fingerprint,
      metadataList,
      filePath,
      fileName,
      fileFormat,
      fileError: '',
      assetName: asset ? asset.name : null,
      canAddNewMetadata: true,
      canIssue: false,
      quantity: null,
      selectedMetadata: null,
      isEditingMetadata: false,

      assetNameError: '',
      quantityError: '',
      metadataError: '',
      issueError: '',
    }
  }

  // ==========================================================================================
  // ==========================================================================================
  onIssueFile() {
    Keyboard.dismiss();
    AppProcessor.doIssueFile(this.state.filePath, this.state.assetName, this.state.metadataList, parseInt(this.state.quantity), {
      indicator: true, title: '', message: global.i18n.t("LocalIssueFileComponent_issueMessage")
    }).then((data) => {
      if (data) {
        // Remove temp asset file
        FileUtil.removeSafe(this.state.filePath);
        Alert.alert(global.i18n.t("LocalIssueFileComponent_success"), global.i18n.t("LocalIssueFileComponent_successMessage"), [{
          text: global.i18n.t("LocalIssueFileComponent_ok"),
          onPress: () => Actions.jump('properties')
        }], { cancelable: false });
      }
    }).catch(error => {
      this.setState({ issueError: global.i18n.t("LocalIssueFileComponent_thereWasAProblemIssuingBitmarks") });
      console.log('issue bitmark error :', error);
    });
  }

  doInputAssetName(assetName) {
    this.checkIssuance(assetName, this.state.metadataList, this.state.quantity);
  }

  async checkIssuance(assetName, metadataList, quantity) {
    let assetNameError = '';
    if (typeof (assetName) === 'string') {
      if (assetName.length > 64) {
        assetNameError = global.i18n.t("LocalIssueFileComponent_youHaveExceededTheMaximumNumberOfCharacters");
      } else if (!assetName) {
        assetNameError = global.i18n.t("LocalIssueFileComponent_pleaseEnterAPropertyName");
      }
    }
    let quantityError = '';
    if (typeof (quantity) === 'string') {
      let quantityNumber = parseInt(quantity);
      if (quantity !== quantityNumber.toString()) {
        quantityError = global.i18n.t("LocalIssueFileComponent_quantityError1");
      } else if (isNaN(quantityNumber) || quantityNumber <= 0) {
        quantityError = global.i18n.t("LocalIssueFileComponent_quantityError2");
      } else if (quantityNumber > 100) {
        quantityError = global.i18n.t("LocalIssueFileComponent_quantityError3");
      }
    }
    metadataList.forEach(item => {
      item.label = item.label.trim();
      item.value = item.value.trim();
    });
    let metadataError = await BitmarkService.doCheckMetadata(metadataList);
    let metadataFieldErrorIndex = metadataList.findIndex((item) => ((!item.label && item.value) || (item.label && !item.value)));
    let metadataFieldEmptyIndex = metadataList.findIndex((item) => (!item.label && !item.value));
    this.setState({
      assetName,
      assetNameError,
      quantity,
      quantityError,
      metadataList,
      metadataError,
      isEditingMetadata: metadataList.length === 0 ? false : this.state.isEditingMetadata,
      canAddNewMetadata: (metadataFieldErrorIndex < 0) && !metadataError && (metadataFieldEmptyIndex < 0),
      canIssue: (metadataFieldErrorIndex < 0 && !metadataError &&
        assetName && !assetNameError &&
        quantity && !quantityError),
    });
  }

  onChangeMetadataValue(key, value) {
    let metadataList = this.state.metadataList;
    for (let metadata of metadataList) {
      if (metadata.key === key) {
        metadata.value = value;
      }
    }
    this.setState({ metadataList });
  }
  onEndChangeMetadataValue() {
    this.checkIssuance(this.state.assetName, this.state.metadataList, this.state.quantity);
  }

  onEndChangeMetadataKey(key, label) {
    let metadataList = this.state.metadataList;
    for (let metadata of metadataList) {
      if (metadata.key === key) {
        metadata.label = label;
      }
    }
    this.checkIssuance(this.state.assetName, metadataList, this.state.quantity);
  }

  removeMetadata(key) {
    Alert.alert(global.i18n.t("LocalIssueFileComponent_confirmDeleteLable"), '', [{
      text: global.i18n.t("LocalIssueFileComponent_cancel"), style: 'cancel',
    }, {
      text: global.i18n.t("LocalIssueFileComponent_yes"), style: 'destructive',
      onPress: () => {
        let metadataList = this.state.metadataList.filter((item) => item.key != key);
        this.checkIssuance(this.state.assetName, metadataList, this.state.quantity);
      }
    }], { cancelable: false });
  }

  addNewMetadataField() {
    let metadataList = this.state.metadataList;
    metadataList.push({ key: metadataList.length, label: '', value: '' });
    this.checkIssuance(this.state.assetName, metadataList, this.state.quantity);
  }

  doInputQuantity(quantity) {
    this.checkIssuance(this.state.assetName, this.state.metadataList, quantity);
  }

  render() {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#F5F5F5', }}>
        <KeyboardAvoidingView behavior={Platform.select({ ios: 'padding', android: '' })} enabled style={{ flex: 1 }} >
          <View style={[defaultStyles.header, { height: constant.headerSize.height }]}>
            <OneTabButtonComponent style={[defaultStyles.headerLeft, { width: 50, }]} onPress={Actions.pop}>
              <Image style={defaultStyles.headerLeftIcon} source={require('assets/imgs/header_blue_icon.png')} />
            </OneTabButtonComponent>
            <Text style={[defaultStyles.headerTitle, { maxWidth: convertWidth(375) - 100 }]}>{global.i18n.t("LocalIssueFileComponent_registerPropertyRights")}</Text>
            <OneTabButtonComponent style={[defaultStyles.headerRight, { width: 50, }]} />
          </View>

          <ScrollView style={localAddPropertyStyle.body}>
            <View style={localAddPropertyStyle.infoArea}>
              <Text style={localAddPropertyStyle.fingerprintLabel}>{global.i18n.t("LocalIssueFileComponent_fingerprintLabel")}</Text>
              <Text style={localAddPropertyStyle.fingerprintValue} numberOfLines={1} >{this.state.fingerprint}</Text>
              <View style={localAddPropertyStyle.fingerprintInfoArea}>
                <Text style={localAddPropertyStyle.fingerprintInfoMessage}>{global.i18n.t("LocalIssueFileComponent_generatedFrom")} </Text>
                <Text style={localAddPropertyStyle.fingerprintInfoFilename} numberOfLines={1} >{this.state.fileName}</Text>
                <Text style={localAddPropertyStyle.fingerprintInfoFileFormat}>{this.state.fileFormat}</Text>
              </View>

              <Text style={localAddPropertyStyle.assetNameLabel}>{global.i18n.t("LocalIssueFileComponent_propertyName")}</Text>
              {!this.state.existingAsset && <TextInput
                testID='inputAssetName'
                ref={(ref) => this.assetNameInputRef = ref}
                style={[config.isAndroid ? { padding: 2 } : {}, localAddPropertyStyle.assetNameInput, {
                  color: this.state.existingAsset ? '#C2C2C2' : 'black',
                  borderBottomColor: this.state.assetNameError ? '#FF003C' : (this.state.existingAsset ? '#C2C2C2' : '#0060F2')
                }]} placeholder={global.i18n.t("LocalIssueFileComponent_64characterMax")}
                onChangeText={this.doInputAssetName}
                numberOfLines={1}
                editable={!this.state.existingAsset}
                returnKeyType="done"
                returnKeyLabel={global.i18n.t("LocalIssueFileComponent_done")}
              />}
              {!!this.state.assetNameError && <Text testID='errorInputAssetName' style={localAddPropertyStyle.assetNameInputError}>{this.state.assetNameError}</Text>}

              {this.state.existingAsset && <View style={localAddPropertyStyle.existAssetName}>
                <Text style={[localAddPropertyStyle.existAssetNameText]}>{this.state.assetName}</Text>
              </View>}

              <Text style={localAddPropertyStyle.metadataLabel}>{global.i18n.t("LocalIssueFileComponent_metadata")}</Text>
              <Text style={localAddPropertyStyle.metadataDescription}>{global.i18n.t("LocalIssueFileComponent_metadataDescription")}</Text>
              <View style={localAddPropertyStyle.metadataArea}>
                <FlatList style={localAddPropertyStyle.metadataList}
                  keyExtractor={(item) => item.key + ''}
                  scrollEnabled={false}
                  data={this.state.metadataList}
                  extraData={this.state}
                  renderItem={({ item }) => {
                    console.log('btnRemoveMetadataLabel_' + item.key);
                    return (
                      <View style={localAddPropertyStyle.metadataField}>
                        {!this.state.existingAsset && this.state.isEditingMetadata && <OneTabButtonComponent
                          testID={'btnRemoveMetadataLabel_' + item.key}
                          style={localAddPropertyStyle.metadataFieldKeyRemoveButton} onPress={() => this.removeMetadata(item.key)}>
                          <Image style={localAddPropertyStyle.metadataFieldKeyRemoveIcon} source={require('assets/imgs/remove-icon-red.png')} />
                        </OneTabButtonComponent>}
                        <View style={[localAddPropertyStyle.metadataFieldInfo, { width: convertWidth(this.state.isEditingMetadata ? 322 : 337) }]}>
                          <OneTabButtonComponent style={[localAddPropertyStyle.metadataFieldKeyArea, {
                            borderBottomColor: item.labelError ? '#FF003C' : (this.state.existingAsset ? '#C2C2C2' : '#0060F2')
                          }]}
                            testID={'btnMetadataLabel_' + item.key}
                            disabled={this.state.existingAsset}
                            onPress={() => {
                              Actions.localIssueFileEditLabel({
                                label: item.label,
                                labelKey: item.key,
                                onEndChangeMetadataKey: this.onEndChangeMetadataKey
                              })
                              this.setState({ isEditingMetadata: false });
                            }}
                          >
                            <Text style={[localAddPropertyStyle.metadataFieldKeyText, {
                              color: (item.label && !this.state.existingAsset) ? 'black' : '#C1C1C1',
                              width: convertWidth(this.state.isEditingMetadata ? 286 : 302),
                            }]}>{item.label ? getMetadataLabel(item.label) : global.i18n.t("LocalIssueFileComponent_label")}</Text>
                            {!this.state.existingAsset && <Image style={localAddPropertyStyle.metadataFieldKeyEditIcon}
                              source={require('assets/imgs/next-icon-blue.png')} />}
                          </OneTabButtonComponent>
                          <TextInput style={[config.isAndroid ? { padding: 2 } : {}, localAddPropertyStyle.metadataFieldValue, {
                            color: (item.label && !this.state.existingAsset) ? 'black' : '#C1C1C1',
                          }]} placeholder={global.i18n.t("LocalIssueFileComponent_description")}
                            testID={'inputMetadataValue_' + item.key}
                            ref={(ref) => this['valueInput_' + item.key] = ref}
                            multiline={true}
                            value={item.value}
                            onChangeText={(text) => this.onChangeMetadataValue(item.key, text)}
                            onEndEditing={this.onEndChangeMetadataValue}
                            returnKeyLabel={global.i18n.t("LocalIssueFileComponent_done")}
                            returnKeyType="done"
                            blurOnSubmit={true}
                            editable={!this.state.existingAsset}
                            onFocus={() => {
                              this.setState({ isEditingMetadata: false });
                            }}
                          />
                          <View style={[localAddPropertyStyle.metadataFieldValueBar, {
                            borderBottomColor: item.valueError ? '#FF003C' : (this.state.existingAsset ? '#C2C2C2' : '#0060F2')
                          }]} />
                        </View>
                      </View>
                    )
                  }}
                />
              </View>
              {!this.state.existingAsset && <View style={localAddPropertyStyle.metadataFieldButtons}>
                <OneTabButtonComponent
                  testID="btnAddMoreMetadata"
                  style={localAddPropertyStyle.addMetadataButton} disabled={!this.state.canAddNewMetadata} onPress={this.addNewMetadataField}>
                  <Image style={localAddPropertyStyle.addMetadataButtonIcon} source={
                    this.state.canAddNewMetadata ? require('assets/imgs/plus-white-blue-icon.png') : require('assets/imgs/plus-white-blue-icon-disable.png')} />
                  <Text style={[localAddPropertyStyle.addMetadataButtonText, { color: this.state.canAddNewMetadata ? '#0060F2' : '#C2C2C2' }]}>{global.i18n.t("LocalIssueFileComponent_addLabel")}</Text>
                </OneTabButtonComponent>

                {this.state.isEditingMetadata && <OneTabButtonComponent style={[localAddPropertyStyle.addMetadataButton]} onPress={() => this.setState({ isEditingMetadata: false })}>
                  <Text style={[localAddPropertyStyle.addMetadataButtonText, { color: '#0060F2' }]}>{global.i18n.t("LocalIssueFileComponent_done").toUpperCase()}</Text>
                </OneTabButtonComponent>}
                {!this.state.isEditingMetadata && this.state.metadataList.length > 0 && <OneTabButtonComponent style={[localAddPropertyStyle.addMetadataButton]} onPress={() => this.setState({ isEditingMetadata: true })}>
                  <Text style={[localAddPropertyStyle.addMetadataButtonText, { color: this.state.isEditingMetadata ? '#C2C2C2' : '#0060F2' }]}>{global.i18n.t("LocalIssueFileComponent_edit")}</Text>
                </OneTabButtonComponent>}
              </View>}
              {!!this.state.metadataError && <Text testID='errorInputMetadata' style={localAddPropertyStyle.metadataInputError}>{this.state.metadataError}</Text>}

              <Text style={localAddPropertyStyle.quantityLabel}>{global.i18n.t("LocalIssueFileComponent_quantityLabel")}</Text>
              <TextInput
                testID='inputQuantity'
                ref={(ref) => this.quantityInputRef = ref}
                style={[config.isAndroid ? { padding: 2 } : {}, localAddPropertyStyle.quantityInput, {
                  borderBottomColor: this.state.quantityError ? '#FF003C' : '#0060F2'
                }]} placeholder="1 ~ 100"
                onChangeText={this.doInputQuantity}
                keyboardType={'numeric'}
                returnKeyType="done"
                returnKeyLabel={global.i18n.t("LocalIssueFileComponent_done")}
              />
              {!!this.state.quantityError && <Text testID='errorInputQuantity' style={localAddPropertyStyle.quantityInputError}>{this.state.quantityError}</Text>}
              <Text style={localAddPropertyStyle.ownershipClaimLabel}>{global.i18n.t("LocalIssueFileComponent_ownershipClaimLabel")}</Text>
              <Text style={localAddPropertyStyle.ownershipClaimMessage}>{global.i18n.t("LocalIssueFileComponent_ownershipClaimMessage")}</Text>
              {!!this.state.issueError && <Text style={localAddPropertyStyle.issueError}>{this.state.issueError}</Text>}
            </View>
          </ScrollView>

          <OneTabButtonComponent
            testID="btnIssue"
            style={[localAddPropertyStyle.issueButton, { borderTopColor: this.state.canIssue ? '#0060F2' : '#C2C2C2' }]}
            onPress={this.onIssueFile}
            disabled={!this.state.canIssue}
          >
            <Text style={[localAddPropertyStyle.issueButtonText, { color: this.state.canIssue ? '#0060F2' : '#C2C2C2' }]}>{global.i18n.t("LocalIssueFileComponent_issueButtonText")}</Text>
          </OneTabButtonComponent>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }
}

LocalIssueFileComponent.propTypes = {
  asset: PropTypes.object,
  fileName: PropTypes.string,
  fileFormat: PropTypes.string,
  filePath: PropTypes.string,
  fingerprint: PropTypes.string,
};