import { Dimensions } from 'react-native';

const currentSize = Dimensions.get('window');
const isIPhoneX = (currentSize.height === 812 || currentSize.width === 812 || currentSize.height === 896 || currentSize.width === 896);
const windowHeight = isIPhoneX ? 812 : 667;
const blankFooter = isIPhoneX ? 22 : 0;
const headerHeight = 50;
const headerPaddingTop = 20;
const buttonHeight = 45;

let iosConstant = {
  buttonHeight,
  subTabSizeHeight: 39,
  bottomTabsHeight: 56,
  blankFooter,
  autoCompleteHeight: 45,
  defaultWindowSize: {
    width: 375,
    height: windowHeight,
  },
  headerSize: {
    width: '100%',
    height: headerHeight,
    paddingTop: headerPaddingTop,
  },
  zIndex: {
    internetOff: 1000,
    error: 300,
    indicator: 200,
    dialog: 100,
  },
};

export {
  iosConstant,
};