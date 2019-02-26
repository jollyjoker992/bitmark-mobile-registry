import { StyleSheet } from 'react-native'
import { convertWidth } from 'src/utils';
import { constant } from 'src/configs';

export default StyleSheet.create({
  body: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    backgroundColor: 'white',
  },

  mainContent: {
    flex: 1, flexDirection: 'column',
    backgroundColor: 'white',
  },
  //sign-in
  writeRecoveryPhraseContentMessage: {
    fontFamily: 'avenir_next_w1g_regular', fontSize: 17, color: 'black',
    width: convertWidth(336),
    marginTop: 18,
    marginLeft: convertWidth(19),
  },
  writeRecoveryPhraseArea: {
    marginTop: 14,
    backgroundColor: 'white',
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  writeRecoveryPhraseContentHalfList: {
    flexDirection: 'column',
    paddingTop: 19,
    paddingBottom: 19,
  },
  writeRecoveryPhraseContentTestButtonText: {
    fontFamily: 'avenir_next_w1g_light', fontSize: 14, color: '#0060F2',
    marginTop: 66,
  },
  recoveryPhraseSet: {
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
    marginTop: 4,
    marginBottom: 4,
  },
  recoveryPhraseIndex: {
    fontFamily: 'avenir_next_w1g_regular', fontSize: 15, color: '#D4D4D4',
    width: convertWidth(23),
    textAlign: 'right',
  },
  recoveryPhraseWord: {
    fontFamily: 'avenir_next_w1g_regular', fontSize: 15, color: '#0060F2',
    width: convertWidth(107),
    marginLeft: 6,
  },

  recoveryPhraseTestResult: {
    flexDirection: 'column',
    alignItems: 'center',
    minHeight: 80,
  },
  recoveryPhraseTestTitle: {
    fontFamily: 'avenir_next_w1g_bold', fontSize: 15, color: 'black',
    marginTop: 10,
  },
  recoveryPhraseTestMessage: {
    fontFamily: 'avenir_next_w1g_regular', fontSize: 15, textAlign: 'center', color: 'black',
    width: convertWidth(335),
    marginTop: 5,
  },
  recoveringMessage: {
    fontFamily: 'avenir_next_w1g_bold', fontSize: 18, textAlign: 'center', color: '#0060F2',
    width: convertWidth(307),
    minHeight: 42,
    marginTop: 158,
  },
  recoveringIndicator: {
    marginTop: 30,
    transform: [
      { scale: 1.5 },
    ],
  },

  switchFormMessageButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    backgroundColor: 'white',
  },
  switchFormMessage: {
    width: convertWidth(240),
    fontFamily: 'avenir_next_w1g_medium', textAlign: 'center', fontSize: 14, color: '#0054FC',
    marginBottom: 24,
  },

  submitButton: {
    height: constant.buttonHeight,
    width: convertWidth(375),
    flexDirection: 'row',
    alignItems: 'center',
    alignContent: 'center',
    justifyContent: 'center',
    backgroundColor: '#0060F2',
  },
  submitButtonText: {
    fontFamily: 'avenir_next_w1g_bold', textAlign: 'center', fontSize: 16, color: 'white'
  },

  keyboardExternal: {
    width: '100%', height: constant.buttonHeight,
    flexDirection: 'row',
    alignContent: 'center',
    alignItems: 'center',
    paddingLeft: 8,
    paddingRight: 8,
    backgroundColor: '#EEEFF1',
  },
  prevButton: {
    marginLeft: 10,
  },
  prevButtonImage: {
    width: convertWidth(16),
    height: convertWidth(16),
    resizeMode: 'contain'
  },
  nextButton: {
    marginLeft: 5,
  },
  nextButtonImage: {
    width: convertWidth(16),
    height: convertWidth(16),
    resizeMode: 'contain'
  },
  doneButton: {
    position: 'absolute',
    right: 10,
  },
  doneButtonText: {
    fontSize: 16,
    color: '#0060F2',
    fontWeight: '600',
  },
  selectionList: {
    width: convertWidth(200),
    height: 30,
    marginLeft: 20,
    marginRight: 20,
    flexDirection: 'row',
    alignContent: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectionItem: {
    marginLeft: 4,
    padding: 4,
  },
  selectionItemText: {
    color: 'blue',
  },
});