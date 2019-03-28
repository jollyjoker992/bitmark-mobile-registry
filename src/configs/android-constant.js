
const headerHeight = 44;
const headerPaddingTop = 20;
const buttonHeight = 45;
const blankFooter = 0;

const androidConstant = {
  buttonHeight,
  subTabSizeHeight: 39,
  bottomTabsHeight: 56,
  blankFooter,
  autoCompleteHeight: 45,
  defaultWindowSize: {
    width: 375,
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

export { androidConstant };