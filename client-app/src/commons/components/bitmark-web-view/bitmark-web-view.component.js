import React from 'react';
import PropTypes from 'prop-types';
import {
  Text, View, TouchableOpacity, WebView, Image, Share, SafeAreaView,
} from 'react-native';

import defaultStyles from './../../styles/index';
import termsStyles from './bitmark-web-view.component.style';
import { EventEmitterService } from './../../../services';
import { Actions } from 'react-native-router-flux';
import { iosConstant } from '../../../configs/ios/ios.config';

export class BitmarkWebViewComponent extends React.Component {
  constructor(props) {
    super(props);
    this.onNavigationStateChange = this.onNavigationStateChange.bind(this);
    this.doShare = this.doShare.bind(this);
  }

  onNavigationStateChange(navState) {
    if (this.needShare) {
      this.needShare = false;
      EventEmitterService.emit(EventEmitterService.events.APP_PROCESSING, false);
      Share.share({ title: this.props.title, url: navState.url });
    }
  }

  doShare() {
    this.needShare = true;
    EventEmitterService.emit(EventEmitterService.events.APP_PROCESSING, true);
    this.webViewRef.reload();
  }

  render() {
    let title = this.props.title;
    let sourceUrl = this.props.sourceUrl;
    let heightButtonController = this.props.heightButtonController;
    let hideBottomController = this.props.hideBottomController;

    return (<SafeAreaView style={termsStyles.body}>
      {!!title && <View style={termsStyles.header}>
        <TouchableOpacity style={defaultStyles.headerLeft} onPress={Actions.pop}>
          <Image style={defaultStyles.headerLeftIcon} source={require('./../../../../assets/imgs/header_blue_icon.png')} />
        </TouchableOpacity>
        <Text style={defaultStyles.headerTitle}>{title.toUpperCase()}</Text>
        <TouchableOpacity style={defaultStyles.headerRight} />
      </View>}
      <View style={termsStyles.main}>
        <WebView
          dataDetectorTypes="none"
          source={{ uri: sourceUrl }}
          ref={(ref) => this.webViewRef = ref}
          onNavigationStateChange={this.onNavigationStateChange}
        />
      </View>
      {!hideBottomController && <View style={[termsStyles.bottomController, {
        height: (heightButtonController || iosConstant.bottomTabsHeight),
      }]}>
        <TouchableOpacity style={termsStyles.webViewControlButton} onPress={() => { this.webViewRef.goBack(); }}>
          <Image style={termsStyles.webViewControlIcon} source={require('./../../../../assets/imgs/webview-back.png')} />
        </TouchableOpacity>
        <TouchableOpacity style={[termsStyles.webViewControlButton, { marginLeft: 90 }]} onPress={() => { this.webViewRef.goForward(); }}>
          <Image style={termsStyles.webViewControlIcon} source={require('./../../../../assets/imgs/webview-next.png')} />
        </TouchableOpacity>
      </View>}
    </SafeAreaView>);
  }
}

BitmarkWebViewComponent.propTypes = {
  title: PropTypes.string,
  sourceUrl: PropTypes.string,
  heightButtonController: PropTypes.number,
  hideBottomController: PropTypes.bool,
};
