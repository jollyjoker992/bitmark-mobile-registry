import { StyleSheet } from 'react-native';
import { convertWidth } from 'src/utils';

export default StyleSheet.create({
  body: {
    flex: 1,
    flexDirection: 'column',
    height: '100%',
    width: '100%',
    backgroundColor: 'white',
  },
  threeDotIcon: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
    marginRight: 15,
  },
  content: {
    flexDirection: 'column',
  },
  mainContent: {
    flexDirection: 'column',
    paddingLeft: convertWidth(19),
    paddingRight: convertWidth(19),
  },
  transferTitle: {
    fontFamily: 'avenir_next_w1g_bold', fontSize: 16, lineHeight: 19, color: 'black',
  },
  inputAccountNumberBar: {
    borderBottomWidth: 1,
    borderBottomColor: '#0060F2',
    width: convertWidth(336),
    height: 35,
    paddingLeft: convertWidth(7),
    paddingRight: convertWidth(7),
    marginTop: 8,
  },
  inputAccountNumber: {
    fontFamily: 'andale_mono', fontSize: 14, lineHeight: 16, color: 'black',
    width: convertWidth(315),
    marginTop: 12,
    height: 20,
  },
  removeAccountNumberButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    padding: 4,
  },
  removeAccountNumberIcon: {
    width: 10,
    height: 10,
    resizeMode: 'contain',
  },
  accountNumberError: {
    fontFamily: 'avenir_next_w1g_regular', fontSize: 14, lineHeight: 16, color: '#FF003C',
    width: convertWidth(325),
    marginTop: 12,
    height: 20,
  },
  transferMessage: {
    fontFamily: 'avenir_next_w1g_regular', fontSize: 15, lineHeight: 18, color: 'black',
    marginTop: 20,
    width: convertWidth(336),
  },
  sendButton: {
    width: convertWidth(375),
    height: 45,
    borderTopWidth: 3,
    backgroundColor: '#F5F5F5',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonText: {
    fontFamily: 'avenir_next_w1g_bold', fontSize: 17, lineHeight: 20, color: '#0060F2',
  },


});