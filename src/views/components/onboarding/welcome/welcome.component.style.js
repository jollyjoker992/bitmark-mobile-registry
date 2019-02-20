import { StyleSheet } from 'react-native'
import { convertWidth, calculateAdditionalHeight } from 'src/utils';
import { config } from 'src/configs';
export default StyleSheet.create({
  body: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  welcomeBackground: {
    width: '100%',
    height: '100%',
    flexDirection: 'column',
    alignItems: 'center',
    alignContent: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
  },

  swipePage: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: 'white',
    paddingTop: 20 + (config.isIPhoneX ? 44 : 20),
    paddingBottom: 100 + (config.isIPhoneX ? 22 : 0),
  },
  swipePageContent: {
    alignItems: 'center', justifyContent: 'center',
  },
  introductionTitle: {
    width: convertWidth(275), minHeight: 47,
    fontFamily: 'avenir_next_w1g_bold', color: '#0060F2', fontSize: 17,
  },
  introductionDescription: {
    width: convertWidth(275),
    fontFamily: 'avenir_next_w1g_regular', fontSize: 17,
    minHeight: 117,
  },
  introductionTermPrivacy: {
    marginTop: calculateAdditionalHeight(667, 30, true),
    width: convertWidth(275),
  },
  introductionLinkButton: {
    marginTop: 20,
    left: convertWidth(50),
  },
  introductionImage: {
    flex: 1,
    resizeMode: 'contain', width: '90%', height: '90%',
  },
  bitmarkTermsPrivacyText: {
    fontFamily: 'avenir_next_w1g_light', fontSize: 14,
  },
  bitmarkTermsPrivacyButtonText: {
    fontFamily: 'avenir_next_w1g_light', color: '#0060F2', fontSize: 14,
  },

  welcomeLogo: {
    width: 316,
    height: 123,
    resizeMode: 'contain',
  },
  welcomeButtonArea: {
    position: 'absolute',
    bottom: 0,
    marginTop: 33,
    width: '100%',
    flexDirection: 'column',
    alignItems: 'center',
    zIndex: 10,
  },
  welcomeButton: {
    paddingTop: 10,
    paddingBottom: 10,
    height: 45,
    width: convertWidth(375),
    flexDirection: 'row', alignItems: 'center', alignContent: 'center', justifyContent: 'center',
    backgroundColor: '#0060F2',
  },
  welcomeButtonText: {
    fontFamily: 'avenir_next_w1g_bold', textAlign: 'center', fontSize: 16, color: 'white'
  },
});