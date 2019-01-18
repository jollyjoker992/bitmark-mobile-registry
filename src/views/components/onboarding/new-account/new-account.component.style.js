import { StyleSheet } from 'react-native'
import { config, constant } from 'src/configs';
import { convertWidth, calculateAdditionalHeight } from 'src/utils';

export default StyleSheet.create({
  body: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    backgroundColor: 'white',
    // borderWidth: 2, borderColor: 'red',
  },

  // new account
  main: {
    flex: 1,
  },
  swipeArea: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
  },
  swipePage: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: 'white',
    paddingBottom: 75,
  },
  swipePageContent: {
    alignItems: 'center', justifyContent: 'center',
  },
  swipeDotButton: {
    backgroundColor: '#C4C4C4',
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 3,
    marginRight: 3,
    marginTop: 3,
    marginBottom: 3,
  },
  swipePagination: {
    position: 'absolute',
    bottom: 50 + (config.isIPhoneX ? (constant.blankFooter / 2) : 0),
  },

  introductionTitle: {
    width: convertWidth(275), minHeight: 47,
    fontFamily: 'AvenirNextW1G-Bold', color: '#0060F2', fontSize: 17,
  },
  introductionDescription: {
    width: convertWidth(275),
    fontFamily: 'AvenirNextW1G-Regular', fontSize: 17,
    minHeight: 117,
  },
  introductionLinkButton: {
    marginTop: 20,
    left: convertWidth(50),
  },
  introductionLink: {
    fontFamily: 'AvenirNextW1G-Bold', color: '#0060F2', fontSize: 14,
  },
  introductionImage: {
    flex: 1,
    resizeMode: 'contain', width: '100%', height: '100%',
  },
  introductionTermPrivacy: {
    marginTop: calculateAdditionalHeight(667, 30, true),
    width: convertWidth(275),
  },
  termPrivacySecondLine: {
    flexDirection: 'row',
    alignContent: 'center',
    alignItems: 'center',
  },
  bitmarkTermsPrivacyText: {
    fontFamily: 'AvenirNextW1G-Light', fontSize: 14,
  },
  bitmarkTermsPrivacyButtonText: {
    fontFamily: 'AvenirNextW1G-Light', color: '#0060F2', fontSize: 14,
  },

  skipButtonArea: {
    position: 'absolute',
    bottom: 20 + (config.isIPhoneX ? (constant.blankFooter / 2) : 0),
    width: '100%',
    flexDirection: 'column',
    alignItems: 'center',
  },
  skipButton: {
    marginTop: 10,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    alignContent: 'center',
    justifyContent: 'center',
  },
  skipButtonText: {
    fontFamily: 'AvenirNextW1G-Bold', textAlign: 'center', fontSize: 14, color: '#0060F2'
  },

  letDoItButtonArea: {
    width: '100%',
    flexDirection: 'column',
    alignItems: 'center',
    position: 'absolute',
    bottom: 0,
  },
  letDoItButton: {
    marginTop: 10,
    width: convertWidth(375),
    minHeight: 45 + (config.isIPhoneX ? (constant.blankFooter / 2) : 0),
    flexDirection: 'row',
    alignItems: 'center',
    alignContent: 'center',
    justifyContent: 'center',
    backgroundColor: '#0060F2',
  },
  letDoItButtonText: {
    paddingBottom: constant.blankFooter / 2,
    fontFamily: 'AvenirNextW1G-Bold', textAlign: 'center', fontSize: 16, color: 'white'
  },
});