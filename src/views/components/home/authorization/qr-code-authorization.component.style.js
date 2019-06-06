import {
  StyleSheet,
} from 'react-native'
import { constant, config } from 'src/configs';
import { convertWidth } from 'src/utils';


export default StyleSheet.create({
  body: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%',
    height: '100%',
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    alignContent: 'center',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F5F5F5',
    paddingTop: (config.isIPhoneX ? 44 : 22),
    height: constant.headerSize.height + (config.isIPhoneX ? 44 : 22),
    width: '100%',
  },

  bodyContent: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    backgroundColor: 'white',
  },

  scanCamera: {
    width: convertWidth(375),
    height: convertWidth(375),
  },
});
