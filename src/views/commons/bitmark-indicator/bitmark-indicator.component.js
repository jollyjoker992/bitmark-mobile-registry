import React from 'react';
import PropTypes from 'prop-types';
import {
  Text, ActivityIndicator, View, WebView,
} from 'react-native';

import { BitmarkDialogComponent } from '../bitmark-dialog';
import dialogStyles from './bitmark-indicator.component.style';
import { constant } from 'src/configs';

export class BitmarkIndicatorComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      indicator: this.props.indicator,
      message: this.props.message,
      title: this.props.title,
    };
  }

  render() {
    console.log('this.state :', this.state);
    return (


      <BitmarkDialogComponent style={dialogStyles.dialog} dialogStyle={{ backgroundColor: 'white', }}>
        <View style={dialogStyles.content}>
          {this.state.indicator === true && <ActivityIndicator size="large" style={dialogStyles.indicatorImage} />}

          {this.state.indicator === constant.indicators.processing && <View style={{
            transform: [
              { scale: 44 / 100, },
            ],
            width: 100, height: 100,
            justifyContent: 'center', alignItems: 'center',
            backgroundColor: 'red',
            overflow: 'hidden'
          }} >
            <WebView
              style={{
                position: 'absolute', top: -250, left: -400,
                width: 800, height: 800,
              }}
              scrollEnabled={false}
              source={{ uri: 'https://www.lottiefiles.com/iframe/302-loader-1' }}
            />
          </View>}


          {this.state.indicator === constant.indicators.success && <View style={{
            alignItems: 'center', justifyContent: 'center',
            paddingBottom: 16,
            paddingTop: 40,
          }} >
            <View style={{ width: 60, height: 60, }}>
              <WebView
                style={{
                  transform: [
                    { scale: 60 / 800, },
                  ],
                  position: 'absolute', left: -370, top: -370,
                  width: 800, height: 800,
                }}
                scrollEnabled={false}
                source={{ uri: 'https://lottiefiles.com/iframe/776-account-success' }}
              />
            </View>
          </View>}

          {this.state.indicator === constant.indicators.searching && <View style={{
            alignItems: 'center', justifyContent: 'center',
            paddingBottom: 16,
            paddingTop: 40,
          }} >
            <View style={{ width: 60, height: 60, overflow: 'hidden' }}>
              <WebView
                style={{
                  transform: [
                    { scale: 60 / 500, },
                  ],
                  position: 'absolute', left: -220, top: -220,
                  width: 500, height: 500,
                }}
                scrollEnabled={false}
                source={{ uri: 'https://lottiefiles.com/iframe/2642-search' }}
              />
            </View>
          </View>}

          <View style={dialogStyles.textArea}>
            {!!this.state.title && <Text style={[dialogStyles.indicatorTitle, {
              marginTop: this.state.indicator ? 0 : 23,
            }]}>{this.state.title}</Text>}
            {!!this.state.message && <Text style={dialogStyles.indicatorMessage}>{this.state.message}</Text>}
          </View>
        </View>
      </BitmarkDialogComponent>
    );
  }
}
BitmarkIndicatorComponent.propTypes = {
  indicator: PropTypes.bool,
  message: PropTypes.string,
  title: PropTypes.string,
}

export class DefaultIndicatorComponent extends React.Component {
  render() {
    return (
      <BitmarkDialogComponent style={dialogStyles.dialog} dialogStyle={{ backgroundColor: 'rgba(0, 0, 0, 0)' }}>
        <ActivityIndicator size="large" style={dialogStyles.indicatorImage} />
      </BitmarkDialogComponent>
    );
  }
}