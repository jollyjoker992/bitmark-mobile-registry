import { StyleSheet } from 'react-native';
import { constant } from 'src/configs';
import { convertWidth } from 'src/utils';


export default StyleSheet.create({
  bottomTabArea: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: constant.bottomTabsHeight,
    width: '100%',
    paddingLeft: 5,
    paddingRight: 5,
    backgroundColor: '#F5F5F5',
  },

  bottomTabButton: {
    width: convertWidth(75),
    height: '100%',
    flexDirection: 'column',
    alignItems: "center",
    justifyContent: 'center',
    paddingTop: 5,
  },
  bottomTabButtonIcon: {
    width: 75,
    height: 28,
    resizeMode: 'contain'
  },
  bottomTabButtonText: {
    fontFamily: 'Avenir Black',
    fontWeight: '900',
    fontSize: 10,
    lineHeight: 12,
    height: 14,
    color: '#0060F2',
  },

  haveNewBitmark: {
    backgroundColor: '#FF003C',
    position: 'absolute',
    borderRadius: 5,
    borderColor: '#FF003C',
    borderWidth: 1,
    top: 4,
    left: 49,
    width: 10,
    height: 10,
    flexDirection: 'column',
    alignItems: "center",
    alignContent: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },

  transactionNumber: {
    backgroundColor: '#FF003C',
    position: 'absolute',
    borderRadius: 7,
    borderColor: '#FF003C',
    borderWidth: 1,
    top: 4,
    left: 49,
    width: 14,
    height: 14,
    flexDirection: 'column',
    alignItems: "center",
    alignContent: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  transactionNumberText: {
    fontFamily: 'Avenir Black',
    fontWeight: '900',
    fontSize: 8,
    color: '#FFFFFF',
    textAlign: 'center',
    width: '100%',
  }
});