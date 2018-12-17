import iosDefaultStyle from './ios.style';
import androidDefaultStyle from './android.style';
import { Platform } from 'react-native';

let defaultStyles = Platform.select({
  ios: iosDefaultStyle,
  android: androidDefaultStyle
});

export { defaultStyles, iosDefaultStyle, androidDefaultStyle };

export default defaultStyles;