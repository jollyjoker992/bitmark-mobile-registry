import { StyleSheet, } from 'react-native';
import { constant } from 'src/configs';
import { convertWidth } from 'src/utils';

export default StyleSheet.create({
  body: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%',
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
  cameraIcon: {
    width: 21,
    height: 20,
    resizeMode: 'contain',
    marginLeft: convertWidth(19),
  },
  bitmarkAccountHelpIcon: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
    marginRight: 19,
  },
  subTabArea: {
    width: '100%',
    height: 39,
    backgroundColor: 'white',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  subTabButton: {
    width: '50%',
    height: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: 'black',
    shadowOffset: { height: 0 },
    shadowRadius: 3,
    zIndex: 1,
  },
  subTabButtonArea: {
    width: '100%',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  subTabButtonTextArea: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: 35,
  },
  subTabButtonText: {
    fontFamily: 'avenir_next_w1g_bold',
    fontSize: 14,
    textAlign: 'center',
  },
  activeSubTabBar: {
    height: 4,
    backgroundColor: '#0060F2'
  },
  scrollSubTabArea: {
    flex: 1,
    width: '100%',
    flexDirection: 'column',
    alignContent: 'center',
    backgroundColor: 'white'
  },
  contentSubTab: {
    flex: 1,
    width: '100%',
    flexDirection: 'column',
    paddingLeft: convertWidth(19),
    paddingRight: convertWidth(19),
  },

  //settings
  accountNumberLabel: {
    fontFamily: 'avenir_next_w1g_regular',
    fontSize: 14,
    marginTop: 27,
  },

  accountNumberArea: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: convertWidth(337),
    minHeight: 30,
  },
  accountNumberValue: {
    fontFamily: 'andale_mono',
    fontSize: convertWidth(11),
    width: convertWidth(337),
    color: '#0060F2',
  },
  accountNumberBar: {
    marginTop: 5,
    borderTopWidth: 1,
    borderTopColor: '#0060F2',
    height: 20,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  accountNumberCopyButtonText: {
    fontFamily: 'avenir_next_w1g_regular',
    fontStyle: 'italic',
    fontSize: 8,
    color: '#0060F2',
  },
  accountMessage: {
    fontFamily: 'avenir_next_w1g_regular',
    fontSize: 15,
    marginTop: 9,
    width: convertWidth(337),
  },
  accountWriteDownButton: {
    marginTop: 21,
    paddingTop: 4,
    paddingBottom: 4,
  },
  accountWriteDownButtonText: {
    fontFamily: 'avenir_next_w1g_bold',
    fontSize: 14,
    color: '#0060F2',
  },
  accountRemoveButton: {
    marginTop: 2,
    paddingTop: 4, paddingBottom: 4,
    flexDirection: 'row', alignItems: 'center'
  },
  accountRemoveButtonText: {
    fontFamily: 'avenir_next_w1g_bold',
    fontSize: 14,
    color: '#0060F2',
  },

  accountDataSourceLabel: {
    marginTop: 17,
    fontFamily: 'avenir_next_w1g_bold',
    fontSize: 16,
  },
  dataSourcesArea: {
    marginTop: 17,
    width: '100%',
    flexDirection: 'column',
    marginBottom: 20,
  },
  dataSourcesMessage: {
    fontFamily: 'avenir_next_w1g_regular',
    fontSize: 14,
  },

  noAuthorizedMessage: {
    fontFamily: 'avenir_next_w1g_regular',
    fontSize: 17,
    marginTop: 16,
  },
  authorizedItem: {
    marginTop: 13,
    flexDirection: 'column',
  },
  authorizedItemTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#A4B5CD',
  },
  authorizedItemTitleText: {
    fontFamily: 'avenir_next_w1g_bold',
    fontSize: 14,
  },
  authorizedItemRemoveButton: {
    padding: 4,
  },
  authorizedItemRemoveButtonText: {
    fontFamily: 'avenir_next_w1g_bold',
    fontSize: 14,
    color: '#0060F2',
  },
  authorizedItemDescription: {
    flexDirection: 'row',
    marginTop: 17,
  },
  authorizedItemDescriptionIcon: {
    width: 58,
    height: 58,
    resizeMode: 'contain',
  },
  authorizedItemDescriptionDetail: {
    flexDirection: 'column',
    paddingLeft: convertWidth(22),
    width: convertWidth(257),
  },
  authorizedViewButton: {
    marginTop: 5,
    paddingTop: 4,
    paddingBottom: 4,
  },
  authorizedViewButtonText: {
    fontFamily: 'avenir_next_w1g_bold',
    fontSize: 14,
    color: '#0060F2',
  },
  authorizedItemDescriptionText: {
    width: convertWidth(257),
    fontFamily: 'avenir_next_w1g_light',
    fontSize: 15,
  },

});