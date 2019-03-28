import { StyleSheet } from 'react-native'
import { constant, config } from 'src/configs';
import { convertWidth } from 'src/utils';
export default StyleSheet.create({
  body: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: 'white',
    paddingLeft: convertWidth(50),
    paddingRight: convertWidth(50),
    paddingTop: constant.headerSize.height + (config.isIPhoneX ? 44 : 0),
    paddingBottom: 90,
  },
  // notification
  notificationTitle: {
    fontFamily: 'avenir_next_w1g_bold', color: '#0060F2',
    fontSize: 20,
    marginTop: 25,
  },

  notificationImage: {
    marginTop: 63,
    width: convertWidth(275),
    height: 215 * convertWidth(275) / 275,
    resizeMode: 'contain',
  },

  notificationDescription: {
    marginTop: 37,
    width: convertWidth(275),
    fontFamily: 'avenir_next_w1g_regular', fontSize: 17, color: 'black',
  },

  enableButtonArea: {
    flexDirection: 'column',
    width: '100%',
  },
  enableButton: {
    height: 45,
    width: convertWidth(375),
    flexDirection: 'row',
    alignItems: 'center',
    alignContent: 'center',
    justifyContent: 'center',
    backgroundColor: '#0060F2',
  },
  enableButtonText: {
    fontFamily: 'avenir_next_w1g_bold', textAlign: 'center', fontSize: 16, color: 'white',
  },
});