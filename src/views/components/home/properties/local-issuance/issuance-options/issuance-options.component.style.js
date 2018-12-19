import { StyleSheet, } from 'react-native';
import { constant } from 'src/configs';
import { convertWidth } from 'src/utils';

export default StyleSheet.create({
  body: {
    flex: 1,
    flexDirection: 'column',
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
    // borderWidth: 1,
  },

  content: {
    flex: 1,
    flexDirection: 'column',
    width: '100%',
    backgroundColor: 'white',
  },

  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 45,
    width: '100%',
    marginTop: 10,
    paddingLeft: convertWidth(19),
    paddingRight: convertWidth(19),
    backgroundColor: '#F5F5F5',
  },
  optionButtonText: {
    fontFamily: 'Avenir black',
    fontSize: 16,
    fontWeight: '900',
    color: '#0060F2',
    flex: 1,
    paddingLeft: convertWidth(30),
  },
  chooseIcon: {
    width: 24,
    height: 28,
    resizeMode: 'contain',
  },
  optionButtonNextIcon: {
    width: 15,
    height: 15,
    resizeMode: 'contain',
  },
  optionButtonStatus: {
    fontFamily: 'Avenir Light',
    fontSize: 16,
    fontWeight: '300',
    textAlign: 'center',
    color: '#0060F2',
    marginLeft: convertWidth(19),
  },
  message: {
    fontFamily: 'Avenir Light',
    fontSize: 17,
    fontWeight: '300',
    color: 'black',
    width: convertWidth(337),
    marginLeft: convertWidth(19),
    marginTop: 23,
  }
});