import { StyleSheet, } from 'react-native';
import { convertWidth } from 'src/utils';

export default StyleSheet.create({
  body: {
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%',
    flex: 1,
    backgroundColor: 'white',
  },
  contentScroll: {
    flexDirection: 'column',
    width: '100%',
  },
  content: {
    flex: 1, flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    paddingLeft: convertWidth(19),
    paddingRight: convertWidth(19),
  },
  assetInfoArea: {
    flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    paddingTop: 10,
    paddingBottom: 30,
    borderBottomWidth: 0.5,
    width: convertWidth(337),
  },
  assetThumbnail: {
    width: 229, height: 229, resizeMode: 'contain',
  },
  assetInfo: {
    marginTop: 11,
    fontFamily: 'avenir_next_w1g_bold', fontSize: 20,
  },
  editionNumber: {
    marginTop: 3,
    fontFamily: 'avenir_next_w1g_medium', fontSize: 16,
  },
  issuer: {
    fontFamily: 'avenir_next_w1g_medium', fontSize: 16,
  },
  requestInfoArea: {
    alignItems: 'center', justifyContent: 'center',
    width: '100%',
    marginTop: 30,
    paddingBottom: 20,
  },
  requestFromAccount: {
    flexDirection: 'row', justifyContent: 'space-between',
    width: '100%',
  },
  requestFromAccountLabel: {
    fontFamily: 'avenir_next_w1g_bold', fontSize: 17,
  },
  requestFromAccountCopyButton: {

  },
  requestFromAccountCopyButtonText: {
    fontFamily: 'avenir_next_w1g_bold', fontSize: 14, color: '#0060F2'

  },
  requestFromAccountNumber: {
    marginTop: 10, marginBottom: 10,
    paddingTop: 9, paddingBottom: 9,
    borderBottomWidth: 0.5, borderTopWidth: 0.5,
  },
  requestFromAccountNumberValue: {
    fontFamily: 'andale_mono', fontSize: 14,
  },
  requestMessage: {
    width: '100%',
    fontFamily: 'avenir_next_w1g_medium', fontSize: 16,
  },

  buttonsArea: {
    flexDirection: 'row', alignItems: 'center',
    width: convertWidth(375),
    backgroundColor: 'white',
    height: 45,
  },
  rejectButton: {
    borderTopWidth: 3,
    borderTopColor: '#A4B5CD',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    width: '50%', height: '100%',
    backgroundColor: '#F5F5F5',
  },
  rejectButtonText: {
    fontFamily: 'Avenir black',
    fontSize: 16,
    fontWeight: '900',
    color: '#A4B5CD',
  },
  acceptButton: {
    borderTopWidth: 3,
    borderTopColor: '#0060F2',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    width: '50%', height: '100%',
    backgroundColor: '#F5F5F5',
  },
  acceptButtonText: {
    fontFamily: 'Avenir black',
    fontSize: 16,
    fontWeight: '900',
    color: '#0060F2',
  }
});