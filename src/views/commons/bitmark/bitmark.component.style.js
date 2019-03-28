import { StyleSheet, Dimensions } from 'react-native';
import { convertWidth } from 'src/utils';
let windowSize = Dimensions.get('window');
export default StyleSheet.create({
  body: {
    position: 'absolute',
    width: windowSize.width,
    flexDirection: 'column',
  },
  header: {
    width: convertWidth(375),
    position: 'absolute',
    top: 0,
    zIndex: 100,
  },
  contentFooter: {
    flexDirection: 'column',
    width: convertWidth(375),
    position: 'absolute',
  },
  content: {
    flex: 1,
    flexDirection: 'column',
    width: convertWidth(375),
  },
  footer: {
    width: convertWidth(375),
    position: 'absolute',
    bottom: 0,
  },
  keyboardExternal: {
    width: convertWidth(375),
    position: 'absolute',

  }
}); 