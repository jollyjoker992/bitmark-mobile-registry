import {
  StyleSheet,
} from 'react-native';
import { constant } from 'src-new/configs';
import { convertWidth } from 'src-new/utils';


export default StyleSheet.create({
  dialog: {
    zIndex: constant.zIndex.indicator,
  },
  content: {
    flexDirection: 'column',
    alignItems: 'center',
  },
  indicatorImage: {
    width: 90,
    height: 90,
    opacity: 1,
    marginTop: 5,
  },
  textArea: {
    marginBottom: 28,
    alignItems: 'center',
    flexDirection: 'column',
  },
  indicatorTitle: {
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
    width: convertWidth(230),
  },
  indicatorMessage: {
    fontSize: 13,
    fontWeight: '400',
    textAlign: 'center',
    width: convertWidth(235),
    marginTop: 5,
  },
});