import { StyleSheet } from 'react-native'
import { constant, config } from 'src/configs';
import { convertWidth } from 'src/utils';
export default StyleSheet.create({
  body: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingTop: constant.headerSize.height + (config.isIPhoneX ? 44 : 0)
  },
  scrollContent: {
    width: '100%',
    flexDirection: 'column',
    paddingLeft: 51,
    paddingRight: 51,
  },

  // notification
  faceTouchIdTitle: {
    fontFamily: config.isAndroid ? 'avenir_next_w1g_bold' : 'AvenirNextW1G-bold',
    color: '#0060F2',
    fontSize: 17,
    marginTop: 25,
    width: convertWidth(275),
  },

  passcodeRemindImages: {
    marginTop: 73,
    flexDirection: 'row',
    alignContent: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
  touchIdImage: {
    width: 69,
    height: 69,
    resizeMode: 'contain',
  },
  faceIdImage: {
    marginLeft: 30,
    width: 69,
    height: 69,
    resizeMode: 'contain',
  },

  faceTouchIdDescription: {
    marginTop: 50,
    width: convertWidth(275),
    fontFamily: config.isAndroid ? 'avenir_next_w1g_light' : 'AvenirNextW1G-light',
    fontSize: 17,
    lineHeight: 20,
  },

  enableButtonArea: {
    flexDirection: 'column',
    alignItems: 'center',
    alignContent: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  enableButton: {
    height: 45,
    width: convertWidth(375),
    flexDirection: 'row',
    alignItems: 'center',
    alignContent: 'center',
    justifyContent: 'center',
    backgroundColor: '#0060F2'
  },
  enableButtonText: {
    fontFamily: config.isAndroid ? 'avenir_next_w1g_light' : 'AvenirNextW1G-light',
    textAlign: 'center',
    fontSize: 16,
    color: 'white'
  },
  skipButton: {
    height: 45 + (config.isIPhoneX ? (constant.blankFooter / 2) : 0),
    width: convertWidth(375),
    flexDirection: 'row',
    alignItems: 'center',
    alignContent: 'center',
    justifyContent: 'center',
    backgroundColor: '#F2FAFF',
  },
  skipButtonText: {
    paddingBottom: (constant.blankFooter / 2),
    fontFamily: config.isAndroid ? 'avenir_next_w1g_light' : 'AvenirNextW1G-light',
    textAlign: 'center',
    fontSize: 16,
    color: '#0060F2'
  }
});