import { StyleSheet } from 'react-native';
import { convertWidth } from 'src/utils';
import { constant } from 'src/configs';


export default StyleSheet.create({
  scroll: {
    flexDirection: 'column',
    width: '100%',
    backgroundColor: 'white',
  },
  body: {
    flex: 1,
    flexDirection: 'column',
    height: '100%',
    width: '100%',
    backgroundColor: 'white',
  },

  infoArea: {
    flexDirection: 'column',
  },
  fingerprintLabel: {
    fontFamily: 'avenir_next_w1g_bold', fontSize: 16, lineHeight: 19, color: 'black',
    marginLeft: convertWidth(19),
    marginTop: 28,
    height: 28,
  },
  fingerprintValue: {
    fontFamily: 'andale_mono', fontSize: 14, lineHeight: 16, color: '#0060F2',
    marginLeft: convertWidth(19),
    width: convertWidth(330),
  },
  fingerprintInfoArea: {
    flexDirection: 'row',
    height: 24,
    marginTop: 10,
  },
  fingerprintInfoMessage: {
    fontFamily: 'avenir_next_w1g_regular', fontSize: 12, lineHeight: 14, color: 'black',
    marginLeft: convertWidth(19),
  },
  fingerprintInfoFilename: {
    fontFamily: 'avenir_next_w1g_bold', fontSize: 12, lineHeight: 14, color: 'black',
    maxWidth: convertWidth(180),
  },
  fingerprintInfoFileFormat: {
    fontFamily: 'avenir_next_w1g_bold', fontSize: 12, lineHeight: 14, color: 'black',
  },

  assetTypeLabel: {
    fontFamily: 'avenir_next_w1g_bold', fontSize: 16, lineHeight: 19, color: 'black',
    marginLeft: convertWidth(19),
    marginTop: 20,
    height: 28,
  },

  assetTypeTypeInfoContainer: {
    marginLeft: convertWidth(19)
  },

  assetTypeTypeInfo: {
    fontFamily: 'avenir_next_w1g_light',
    fontSize: 17
  },

  assetTypeChooser: {
    flex: 1,
    flexDirection: 'row',
    marginLeft: convertWidth(19),
    marginRight: convertWidth(19),
    borderColor: '#0060F2',
    borderWidth: 1
  },

  assetTypeActiveButton: {
    backgroundColor: '#0060F2',
    width: '50%',
    height: 29,
    alignContent: 'center',
    alignItems: 'center',
    justifyContent: 'center'
  },

  assetTypeActiveButtonText: {
    fontFamily: 'avenir_next_w1g_light',
    color: '#FFFFFF',
    fontSize: 17
  },

  assetTypeInActiveButton: {
    backgroundColor: '#FFFFFF',
    width: '50%',
    height: 29,
    alignContent: 'center',
    alignItems: 'center',
    justifyContent: 'center'
  },

  assetTypeInActiveButtonText: {
    fontFamily: 'avenir_next_w1g_light',
    color: 'rgba(0, 96, 242, 0.6)',
    fontSize: 17
  },

  assetTypeHelper: {
    flex: 1,
    marginTop: 10,
    marginLeft: convertWidth(19),
    marginRight: convertWidth(19)
  },

  assetTypeHelperLinkText: {
    fontFamily: 'avenir_next_w1g_bold',
    fontSize: 12,
    color: '#0060F2'
  },

  assetNameLabel: {
    fontFamily: 'avenir_next_w1g_bold', fontSize: 16, lineHeight: 19, color: 'black',
    marginLeft: convertWidth(19),
    marginTop: 30,
    height: 28,
  },
  existAssetName: {
    marginTop: 12,
    marginLeft: convertWidth(19),
    width: convertWidth(330),
    borderBottomWidth: 1,
    borderBottomColor: '#C2C2C2',
    minHeight: 25,
    flexDirection: 'row',
    alignItems: 'center',
  },
  existAssetNameText: {
    fontFamily: 'avenir_next_w1g_bold', color: '#C2C2C2',
  },
  assetNameInput: {
    marginTop: 5,
    marginLeft: convertWidth(19),
    width: convertWidth(330),
    borderBottomWidth: 1,
    height: 25,
    fontFamily: 'andale_mono',
    fontSize: 13,
  },
  assetNameInputError: {
    fontFamily: 'avenir_next_w1g_regular', fontSize: 16, lineHeight: 19, color: '#FF003C',
    marginLeft: convertWidth(19),
    marginTop: 10,
    width: convertWidth(330),
  },

  metadataLabel: {
    fontFamily: 'avenir_next_w1g_bold', fontSize: 16, lineHeight: 19, color: 'black',
    marginLeft: convertWidth(19),
    marginTop: 29,
  },
  metadataDescription: {
    width: '100%',
    fontFamily: 'avenir_next_w1g_regular', fontSize: 14, lineHeight: 16, color: 'black',
    paddingLeft: convertWidth(19),
    marginTop: 5,
  },
  metadataArea: {
    flexDirection: 'row',
  },
  metadataList: {
  },
  metadataField: {
    flexDirection: 'row',
    width: '100%',
    paddingLeft: convertWidth(19),
    paddingRight: convertWidth(19),
    marginBottom: 15,
  },
  metadataFieldKeyRemoveButton: {
    flexDirection: 'row',
    height: '100%',
    marginTop: 11,
    width: convertWidth(15),
  },
  metadataFieldKeyRemoveIcon: {
    width: 10,
    height: 10,
    resizeMode: 'contain',
  },
  metadataFieldInfo: {
    flexDirection: 'column',
  },
  metadataFieldKeyArea: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#0060F2',
    height: 36,
    width: '100%',
  },
  metadataFieldKeyText: {
    fontFamily: 'andale_mono', fontSize: 14, color: 'black',
    marginLeft: 7,
    height: 19,
  },
  metadataFieldKeyEditIcon: {
    width: 10,
    height: 10,
    resizeMode: 'contain',
  },
  metadataFieldValue: {
    width: '100%',
    fontFamily: 'andale_mono', fontSize: 14, color: 'black',
    marginLeft: 7,
    marginTop: 12,
    marginBottom: 10,
  },
  metadataFieldValueBar: {
    borderBottomColor: '#0060F2',
    borderBottomWidth: 1,
  },

  metadataFieldButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingLeft: convertWidth(19),
    paddingRight: convertWidth(19),
  },
  addMetadataButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 5,
    paddingBottom: 5,
    paddingRight: 5,
    height: 36,
  },
  addMetadataButtonIcon: {
    width: 10,
    height: 10,
    resizeMode: 'contain',
  },
  addMetadataButtonText: {
    fontFamily: 'andale_mono',
    fontSize: 14,
    color: '#C2C2C2',
  },
  metadataInputError: {
    fontFamily: 'avenir_next_w1g_regular', fontSize: 16, lineHeight: 19, color: '#FF003C',
    marginLeft: convertWidth(19),

    marginTop: 10,
    width: convertWidth(330),
  },
  quantityLabel: {
    fontFamily: 'avenir_next_w1g_bold', fontSize: 16, lineHeight: 19, color: 'black',
    marginLeft: convertWidth(19),
    marginTop: 18,
    height: 28,
  },
  quantityInput: {
    marginTop: 12,
    marginLeft: convertWidth(19),
    width: convertWidth(330),
    borderBottomWidth: 1,
    height: 25,
    fontFamily: 'andale_mono', fontSize: 14, lineHeight: 16, color: 'black',
  },
  quantityInputError: {
    fontFamily: 'avenir_next_w1g_bold', fontSize: 16, lineHeight: 19, color: '#FF003C',
    marginLeft: convertWidth(19),
    marginTop: 10,
    width: convertWidth(347),
  },
  ownershipClaimLabel: {
    fontFamily: 'avenir_next_w1g_bold', fontSize: 16, lineHeight: 19, color: 'black',
    marginLeft: convertWidth(19),
    marginTop: 40,
    height: 28,
  },
  ownershipClaimMessage: {
    fontFamily: 'avenir_next_w1g_regular', fontSize: 14, lineHeight: 16, color: 'black',
    marginLeft: convertWidth(19),
    width: convertWidth(332),
    marginTop: 12,
    marginBottom: 20,
  },

  issueError: {
    fontFamily: 'avenir_next_w1g_regular', fontSize: 16, lineHeight: 19, color: '#FF003C',
    marginLeft: convertWidth(19),
    marginTop: 10,
    width: convertWidth(347),
  },

  issueButton: {
    width: convertWidth(375),
    height: constant.buttonHeight,
    borderTopWidth: 2,
    backgroundColor: '#F5F5F5',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  issueButtonText: {
    fontFamily: 'avenir_next_w1g_bold', fontSize: 17, lineHeight: 19, color: 'white',
  },
});