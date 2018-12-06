import {
  StyleSheet,
} from 'react-native';
import { config } from 'src-new/configs';

export default StyleSheet.create({
  content: {
    alignItems: 'center',
    alignContent: 'center',
    flexDirection: 'column',
    width: '100%',
    flex: 1,
  },
  title: {
    width: '100%',
    height: 40 + (config.isIPhoneX ? 44 : 0),
    backgroundColor: '#FF003C',
    flexDirection: 'row',
    alignContent: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    paddingTop: (config.isIPhoneX ? 44 : 0),
  },
  titleText: {
    fontFamily: 'Avenir black',
    fontSize: 18,
    fontWeight: '900',
    color: 'white',
    textAlign: 'center',
  },
});