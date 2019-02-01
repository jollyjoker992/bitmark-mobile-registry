import { StyleSheet, } from 'react-native';
import { constant } from 'src/configs';
import { convertWidth } from 'src/utils';

export default StyleSheet.create({
  body: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%',
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    alignContent: 'center',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F5F5F5',
    height: constant.headerSize.height,
    width: '100%',
  },
  addPropertyIcon: {
    width: 18,
    height: 18,
    resizeMode: 'contain',
    marginRight: 17,
  },
  subTabArea: {
    width: '100%',
    height: 39,
    backgroundColor: 'white',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  subTabButton: {
    width: '50%',
    height: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: 'black',
    shadowOffset: { height: 0 },
    shadowRadius: 3,
    zIndex: 1,
  },
  subTabButtonArea: {
    width: '100%',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  subTabButtonTextArea: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: 35,
  },
  subTabButtonText: {
    fontFamily: 'AvenirNextW1G-Bold',
    fontSize: 14,
    textAlign: 'center',
  },
  activeSubTabBar: {
    height: 4,
    backgroundColor: '#0060F2'
  },
  scrollSubTabArea: {
    width: '100%',
    flexDirection: 'column',
    alignContent: 'center',
    backgroundColor: 'white',
  },
  contentSubTab: {
    width: '100%',
    flexDirection: 'column',
  },

  titleNoRequiredTransferOffer: {
    marginTop: 46,
    marginLeft: convertWidth(19),
    width: convertWidth(337),
    fontFamily: 'Avenir Black',
    fontWeight: '900',
    fontSize: 17,
    lineHeight: 19,
    color: '#0060F2'
  },

  messageNoRequiredTransferOffer: {
    marginTop: 46,
    marginLeft: convertWidth(19),
    width: convertWidth(337),
    fontFamily: 'Avenir Light',
    fontWeight: '300',
    fontSize: 17,
    lineHeight: 19,
  },

  transferOfferRow: {
    width: '100%',
    flexDirection: 'column',
    paddingLeft: convertWidth(19),
    paddingRight: convertWidth(19),
    paddingBottom: 18,
    paddingTop: 18,
    borderBottomColor: '#EFEFEF',
    borderBottomWidth: 1,
    minHeight: 80,
  },
  transferOfferTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  transferOfferTitleType: {
    fontFamily: 'Andale Mono',
    fontSize: 13,
    fontWeight: '700',
    color: '#0060F2',
    width: convertWidth(220),
  },
  transferOfferTitleTime: {
    fontFamily: 'Andale Mono',
    fontSize: 13,
    fontWeight: '700',
    width: convertWidth(90),
    marginLeft: convertWidth(12),
  },
  transferOfferTitleIcon: {
    width: 12,
    height: 12,
    resizeMode: 'contain',
    marginLeft: convertWidth(3),
  },

  recoveryPhaseActionRequired: {
    marginTop: 12,
    flexDirection: 'column',
  },
  recoveryPhaseActionRequiredTitle: {
    fontFamily: 'Avenir heavy',
    fontSize: 14,
    fontWeight: '900',
  },
  recoveryPhaseActionRequiredDescriptionArea: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  recoveryPhaseActionRequiredDescription: {
    marginTop: 3,
    fontFamily: 'Avenir light',
    fontSize: 14,
    fontWeight: '300',
  },
  recoveryPhaseActionRequiredImportantIcon: {
    width: 18,
    height: 18,
    resizeMode: 'contain',
  },
  iftttTask: {
    flexDirection: 'column',
    marginTop: 12,
  },
  iftttTitle: {
    fontFamily: 'Avenir heavy',
    fontSize: 15,
    fontWeight: '900',
  },
  iftttDescription: {
    marginTop: 3,
    fontFamily: 'Avenir light',
    fontSize: 14,
    fontWeight: '300',
  },

  completedTransfer: {
    paddingLeft: convertWidth(19),
    paddingRight: convertWidth(19),
    paddingTop: 18,
    flexDirection: 'column',
    width: '100%',
  },
  completedTransferHeader: {
    flexDirection: 'row',
    height: 20,
  },
  completedTransferHeaderIconArea: {
    width: convertWidth(102),
  },
  completedTransferHeaderIconImage: {
    width: 16, height: 16, resizeMode: 'contain',
  },
  completedTransferHeaderTitle: {
    fontFamily: 'Andale Mono',
    fontSize: 13,
    color: '#0060F2',
    width: convertWidth(102),
  },
  completedTransferHeaderValue: {
    width: convertWidth(220),
    marginLeft: convertWidth(15),
    fontFamily: 'Andale Mono',
    fontSize: 13,
    color: '#0060F2',
  },
  completedTransferContent: {
    marginTop: 9,
    flexDirection: 'column',
    borderBottomColor: '#A4B5CD', borderBottomWidth: 0.5,
    paddingBottom: 15,
  },
  completedTransferContentRow: {
    flexDirection: 'row',
    height: 20,
  },
  completedTransferContentRowLabel: {
    fontFamily: 'Andale Mono',
    fontSize: 13,
    width: convertWidth(102),
  },
  completedTransferContentRowPropertyName: {
    width: convertWidth(220),
    marginLeft: convertWidth(15),
    fontFamily: 'Avenir Light',
    fontSize: 14,
    fontWeight: '900',
  },
  completedTransferContentRowValue: {
    width: convertWidth(220),
    marginLeft: convertWidth(15),
    fontFamily: 'Andale Mono',
    fontSize: 13,
  },

  acceptAllTransfersButton: {
    width: '100%',
    height: 45,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5F5F5',
    borderTopColor: '#0060F2',
    borderTopWidth: 3,
    marginBottom: 1,
  },
  acceptAllTransfersButtonText: {
    fontFamily: 'Avenir Black',
    fontWeight: '900',
    fontSize: 14,
    color: '#0060F2'
  },
});