import {
  StyleSheet,
} from 'react-native'
import { constant } from 'src/configs';
import { convertWidth } from 'src/utils';


export default StyleSheet.create({
  body: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%',
    height: '100%',
    backgroundColor: 'white',
  },
  header: {
    flexDirection: 'row',
    alignContent: 'center',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    height: constant.headerSize.height,
    width: '100%',
  },
  bodyContent: {
    flex: 1,
    flexDirection: 'column',
    width: '100%',
    height: 600,
    paddingLeft: convertWidth(19),
    paddingRight: convertWidth(19),
    backgroundColor: 'white',
  },

  rowSetting: {
    backgroundColor: 'white',
    width: '100%',
    minHeight: 48,
    flexDirection: 'row',
    alignContent: 'center',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  lineSetting: {
    width: '100%',
    borderWidth: 0.5,
    borderColor: '#C0CCDF',
  },

  itemSettingText: {
    fontSize: 15,
    fontFamily: 'Avenir Black',
    color: '#0060F2',
    fontWeight: '900',
  },

  topArea: {
    width: '100%',
    marginTop: 38,
  },

  donorInfo: {
    flexDirection: 'column', justifyContent: 'flex-start',
    paddingBottom: 10,
    marginTop: 22,
    flex: 1,
  },

  bottomArea: {
    width: '100%',
  },

  version: {
    fontSize: 14,
    color: 'black',
    fontFamily: 'Andale Mono'
  },

  sendFeedbackPopupTitle: {
    fontFamily: 'Arial',
    fontSize: 15.42,
    textAlign: 'center',
    fontWeight: '800',
    width: convertWidth(248),
    marginTop: 26,
  },
  sendFeedbackPopupDescription: {
    fontFamily: 'Arial',
    fontSize: 13,
    textAlign: 'center',
    fontWeight: '300',
    color: '#4A4A4A',
    width: convertWidth(223),
    marginTop: 10,
    marginBottom: 25,
  },
  sendFeedbackPopupButtonArea: {
    borderTopColor: '#919191',
    borderTopWidth: 1,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    alignContent: 'center',
    height: 46,
  },
  sendFeedbackPopupButtonSeparate: {
    borderLeftWidth: 1,
    borderLeftColor: '#919191',
    height: '100%'
  },
  sendFeedbackPopupButton: {
    flexDirection: 'row',
    alignContent: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    width: convertWidth(132),
  },
  sendFeedbackPopupButtonText: {
    fontFamily: 'Arial',
    fontSize: 15.42,
    textAlign: 'center',
    fontWeight: '800',
    color: '#0060F2',
  },
});