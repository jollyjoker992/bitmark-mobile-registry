import { StyleSheet, } from 'react-native';
import { convertWidth } from 'src/utils';

export default StyleSheet.create({
  body: {
    flexDirection: 'column',
    alignItems: 'center',
    height: '100%',
    width: '100%',
    backgroundColor: 'white',
  },
  contentScroll: {
    flexDirection: 'column',
    width: '100%',
  },
  content: {
    flex: 1,
    flexDirection: 'column',
    paddingLeft: convertWidth(19),
    paddingRight: convertWidth(19),
  },
  assetName: {
    fontFamily: 'avenir_next_w1g_bold',
    fontSize: 16,
    lineHeight: 19,
    marginTop: 38,
  },
  transferOfferContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 32,
  },
  transferOfferSenderFix: {
    fontFamily: 'avenir_next_w1g_bold',
    fontSize: 12,
  },
  transferOfferSenderName: {
    fontFamily: 'avenir_next_w1g_light',
    fontSize: 13,
  },
  transferOfferAssetName: {
    fontFamily: 'avenir_next_w1g_bold',
    fontSize: 13,
    width: convertWidth(150),
  },
  externalArea: {
    marginTop: 44,
  },
  externalAreaRow: {
    flexDirection: 'row',
    marginTop: 9,
  },

  externalAreaRowLabel: {
    fontFamily: 'andale_mono',
    fontSize: 13,
    color: '#0060F2',
    width: convertWidth(117),
  },
  externalAreaRowValue: {
    fontFamily: 'andale_mono',
    fontSize: 13,
    width: convertWidth(198),
    color: '#0060F2',
    flexDirection: 'row',
    alignItems: 'center'
  },
  externalAreaRowValueIssuerView: {
    width: convertWidth(198),
    flexDirection: 'row',
    alignItems: 'center'
  },
  externalAreaRowValueIssuer_: {
    fontFamily: 'andale_mono',
    color: '#0060F2',
    fontSize: 13,
  },
  externalAreaRowValueIssuer: {
    fontFamily: 'andale_mono',
    fontSize: 13,
    width: convertWidth(190),
    color: '#0060F2',
  },
  metadataArea: {
    marginTop: 20,
  },
  metadataRowValue: {
    fontFamily: 'avenir_next_w1g_light',
    fontSize: 13,
    width: convertWidth(198),
    marginBottom: 5,
  },
  buttonsArea: {
    flexDirection: 'row',
    alignItems: 'center',
    width: convertWidth(375),
    backgroundColor: 'white',
  },
  rejectButton: {
    borderTopWidth: 3,
    borderTopColor: '#A4B5CD',
    flexDirection: 'column',
    alignItems: 'center',
    width: '50%',
    height: 45,
    backgroundColor: '#F5F5F5',
  },
  rejectButtonText: {
    fontFamily: 'avenir_next_w1g_bold',
    fontSize: 16,
    color: '#A4B5CD',
  },
  acceptButton: {
    borderTopWidth: 3,
    borderTopColor: '#0060F2',
    flexDirection: 'column',
    alignItems: 'center',
    width: '50%',
    height: 45,
    backgroundColor: '#F5F5F5',
  },
  acceptButtonText: {
    fontFamily: 'avenir_next_w1g_bold',
    fontSize: 16,
    color: '#0060F2',
  }
});