import {
  TouchableOpacity,
} from 'react-native';

export class OneTabButtonComponent extends TouchableOpacity {
  touchableHandlePress(e) {
    if (this.props.onPress) {
      if (this.isProcessing) {
        return;
      }
      this.isProcessing = true;
      this.setTimeout(() => { this.isProcessing = false; }, 500);
      this.props.onPress(e);
    }
  }
}
