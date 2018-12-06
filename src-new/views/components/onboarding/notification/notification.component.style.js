import { StyleSheet } from 'react-native'
import { constant, config } from 'src-new/configs';
import { convertWidth } from 'src-new/utils';
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
    fontFamily: 'Avenir black',
    color: '#0060F2',
    fontSize: 20,
    fontWeight: '900',
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
    fontFamily: 'Avenir light',
    fontWeight: '300',
    fontSize: 17,
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
    fontFamily: 'Avenir black',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '900',
    color: 'white',
  },
});