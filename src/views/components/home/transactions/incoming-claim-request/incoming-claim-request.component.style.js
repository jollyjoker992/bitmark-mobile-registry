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
  assetThumbnail: {
    width: 229, height: 229, resizeMode: 'contain',
  },
  assetInfo: {
    marginTop: 21,
    fontFamily: 'Avenir-Black', fontSize: 17, fontWeight: '900',
  },
  claimMessage: {
    marginTop: 75,
    fontFamily: 'Avenir-Black', fontSize: 16, fontWeight: '300',
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