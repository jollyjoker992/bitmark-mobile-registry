import { StyleSheet, } from 'react-native';
import { constant } from 'src-new/configs';
import { convertWidth } from 'src-new/utils';

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
  },
  main: {
    flex: 1,
    backgroundColor: 'white',
    paddingTop: 20,
  },
  bottomController: {
    flexDirection: 'row',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingLeft: convertWidth(60),
    paddingRight: convertWidth(60),
    backgroundColor: '#F8F8F8',
  },
  webViewControlButton: {
    paddingTop: 2,
    paddingBottom: 2,
    paddingLeft: 4,
    paddingRight: 4,
  },
  webViewControlIcon: {
    width: 20,
    height: 19,
    resizeMode: 'contain',
  },
});