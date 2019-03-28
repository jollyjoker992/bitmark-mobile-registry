import { StyleSheet } from 'react-native'
import { convertWidth } from 'src/utils';
import { config } from 'src/configs';

export default StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignContent: 'center',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F5F5F5',
  },
  headerLeft: {
    width: 70,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    height: '100%'
  },
  headerLeftIcon: {
    marginLeft: convertWidth(19),
    width: 10,
    height: 19,
    resizeMode: 'contain'
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    height: '100%',
  },
  headerTitle: {
    textAlign: 'center', fontSize: 18, fontFamily: 'avenir_next_w1g_bold', color: 'black',
    flex: 1,
  },
  headerRight: {
    width: 70,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    height: '100%',
  },
  headerRightText: {
    fontFamily: 'avenir_next_w1g_regular',
    fontSize: 16,
    color: '#0060F2',
    marginRight: 19,
    textAlign: 'right',
  }
});