import {
  StyleSheet,
} from 'react-native'
import { constant, } from 'src/configs';
import { convertWidth } from 'src/utils';


export default StyleSheet.create({
  body: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%',
    height: '100%',
    backgroundColor: 'white',
  },
  header: {
    flexDirection: 'row',
    alignContent: 'center',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F5F5F5',
    height: constant.headerSize.height - constant.headerSize.paddingTop,
    width: '100%',
  },

  bodyContent: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%',
    height: 600,
    backgroundColor: 'white',
  },

  scanMessage: {
    fontFamily: 'avenir_next_w1g_light',
    fontSize: 17,
    width: convertWidth(337),
    marginTop: 40,
  },
  scanCamera: {
    marginTop: 20,
    width: convertWidth(375),
    height: convertWidth(375),
  },

});