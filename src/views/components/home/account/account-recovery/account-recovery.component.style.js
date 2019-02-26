import { StyleSheet, } from 'react-native';
import { constant } from 'src/configs';
import { convertWidth } from 'src/utils';

export default StyleSheet.create({
  body: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    alignContent: 'center',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F5F5F5',
    height: constant.headerSize.height,
    width: '100%',
  },

  recoveryPhraseContent: {
    flex: 1,
    flexDirection: 'column',
    paddingLeft: convertWidth(19),
    paddingRight: convertWidth(19),
    backgroundColor: 'white',
  },
  recoveryPhraseWarningIcon: {
    width: 137,
    height: 36,
    resizeMode: 'contain',
    marginTop: 41,
    marginLeft: convertWidth(85),
  },
  recoveryDescription: {
    fontFamily: 'avenir_next_w1g_regular', fontSize: 15, lineHeight: 18, color: 'black',
    marginTop: 23,
    width: convertWidth(337),
  },
  recoveryPhraseBottomButton: {
    width: convertWidth(375),
    height: 45,
    backgroundColor: '#0060F2',
    flexDirection: 'row',
    alignContent: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
  recoveryPhraseBottomButtonText: {
    fontFamily: 'avenir_next_w1g_bold', fontSize: 16, textAlign: 'center', color: 'white',
  },

  writeRecoveryPhraseContentMessage: {
    fontFamily: 'avenir_next_w1g_regular', fontSize: 17, color: 'black',
    width: convertWidth(309),
    marginTop: 20,
  },

  writeRecoveryPhraseContentList: {
    marginTop: 10,
    backgroundColor: 'white',
    width: '100%',
    height: 283,
    flexDirection: 'row',
  },
  writeRecoveryPhraseContentHalfList: {
    flexDirection: 'column',
    paddingTop: 17,
    paddingBottom: 17,
    height: 283,
  },
  writeRecoveryPhraseContentTestButtonText: {
    fontFamily: 'avenir_next_w1g_light',
    fontSize: 14,
    color: '#0060F2',
    marginTop: 66,
  },
  recoveryPhraseSet: {
    flexDirection: 'row',
    height: 21,
  },
  recoveryPhraseIndex: {
    fontFamily: 'avenir_next_w1g_regular',
    fontSize: 15,
    color: '#D4D4D4',
    width: convertWidth(39),
    textAlign: 'left',
  },
  recoveryPhraseWord: {
    fontFamily: 'avenir_next_w1g_regular',
    fontSize: 15,
    color: '#0060F2',
    width: convertWidth(108),
  },

  recoveryPhraseChoose: {
    height: 29,
    flexDirection: 'row',
    alignItems: 'center',
    alignContent: 'center',
    marginRight: 7,
  },
  recoveryPhraseChooseButton: {
    borderWidth: 1,
    borderColor: '#0060F2',
    backgroundColor: 'white',
    paddingLeft: 7,
    paddingRight: 7,
    borderRadius: 2,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    alignContent: 'center',
  },
  recoveryPhraseChooseButtonText: {
    fontFamily: 'avenir_next_w1g_regular',
    fontSize: 15,
    color: '#0060F2',
    textAlign: 'center',
  },
  recoveryPhraseTestResult: {
    backgroundColor: 'white',
    flexDirection: 'column',
    alignItems: 'center',
    paddingTop: 27,
    paddingBottom: 27,
  },
  recoveryPhraseTestTitle: {
    fontFamily: 'avenir_next_w1g_bold', fontSize: 15, color: 'black',
  },
  recoveryPhraseTestMessage: {
    fontFamily: 'avenir_next_w1g_regular', fontSize: 15, textAlign: 'center', color: 'black',
    width: convertWidth(309),
    marginTop: 11,
  },
});