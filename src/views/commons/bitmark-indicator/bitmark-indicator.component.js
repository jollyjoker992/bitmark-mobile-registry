import React from 'react';
import PropTypes from 'prop-types';
import {
  Text, ActivityIndicator, View,
  StyleSheet,
} from 'react-native';

import LottieView from 'lottie-react-native';

import { BitmarkDialogComponent } from '../bitmark-dialog';
import { constant } from 'src/configs';
import { convertWidth } from 'src/utils';

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
    return (
      <BitmarkDialogComponent style={cStyle.dialog} dialogStyle={{ backgroundColor: 'white', }}>
        <View style={cStyle.content}>
          {this.state.indicator === true && <ActivityIndicator size="large" style={cStyle.indicatorImage} />}
          {this.state.indicator === constant.indicators.processing && <View style={{
            width: '100%', height: 100, alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
            paddingTop: 40, paddingBottom: 12,
          }}>
            <LottieView
              style={{ width: 800 * 44 / 100, height: 600 * 44 / 100, }}
              ref={animation => {
                this.animation = animation;
              }}
              source={require('assets/processing.json')}
              autoPlay={true}
            />
          </View>}

          {this.state.indicator === constant.indicators.success && <View style={{
            width: '100%', height: 100, alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
            paddingTop: 40, paddingBottom: 12,
          }}>
            <LottieView
              style={{ width: 60, height: 60, }}
              ref={animation => {
                this.animation = animation;
              }}
              source={require('assets/success.json')}
              autoPlay={true}
            />
          </View>}

          {this.state.indicator === constant.indicators.searching && <View style={{
            width: '100%', height: 100, alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
            paddingTop: 40, paddingBottom: 12,
          }}>
            <LottieView
              style={{ width: 60, height: 60, }}
              ref={animation => {
                this.animation = animation;
              }}
              source={require('assets/searching.json')}
              autoPlay={true}
            />
          </View>}

          <View style={cStyle.textArea}>
            {!!this.state.title && <Text style={[cStyle.indicatorTitle, {
              marginTop: this.state.indicator ? 0 : 23,
            }]}>{this.state.title}</Text>}
            {!!this.state.message && <Text style={cStyle.indicatorMessage}>{this.state.message}</Text>}
          </View>
        </View>
      </BitmarkDialogComponent >
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
      <BitmarkDialogComponent style={cStyle.dialog} dialogStyle={{ backgroundColor: 'rgba(0, 0, 0, 0)' }}>
        <ActivityIndicator size="large" style={cStyle.indicatorImage} />
      </BitmarkDialogComponent>
    );
  }
}

let cStyle = StyleSheet.create({
  dialog: {
    zIndex: constant.zIndex.indicator,
  },
  content: {
    flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    minHeight: 204,
  },
  indicatorImage: {
    width: 90,
    height: 90,
    opacity: 1,
    marginTop: 5,
  },
  textArea: {
    marginBottom: 17,
    alignItems: 'center',
    flexDirection: 'column',
  },
  indicatorTitle: {
    fontSize: 16, fontWeight: '600', textAlign: 'center', color: 'black',
    width: '100%',
    paddingLeft: convertWidth(20), paddingRight: convertWidth(20),
  },
  indicatorMessage: {
    fontSize: 16, fontWeight: '400', textAlign: 'center', color: 'black',
    paddingLeft: convertWidth(20), paddingRight: convertWidth(20),
    marginTop: 16,
  },
});