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
    fontFamily: 'Avenir black',
    fontSize: 16,
    lineHeight: 19,
    fontWeight: '900',
    marginTop: 38,
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
    width: '50%',
    height: 45,
    backgroundColor: '#F5F5F5',
  },
  acceptButtonText: {
    fontFamily: 'Avenir black',
    fontSize: 16,
    fontWeight: '900',
    color: '#0060F2',
  }
});