import React, { Component } from 'react';
import {
  View, Text, SafeAreaView,
  Image,
  StyleSheet,
} from 'react-native';
import PropTypes from 'prop-types';
import { OneTabButtonComponent } from './one-tab-button.component';
import { constant } from 'src/configs';
import { convertWidth } from 'src/utils';

export class BitmarkHeaderComponent extends Component {
  static propTypes = {
    style: PropTypes.any,
    headerLeft: PropTypes.element,
    headerCenter: PropTypes.element,
    headerRight: PropTypes.element,

    leftText: PropTypes.string,
    leftSourceIcon: PropTypes.any,
    leftOnPress: PropTypes.func,

    centerText: PropTypes.string,

    rightSourceIcon: PropTypes.any,
    rightText: PropTypes.string,
    rightOnPress: PropTypes.func,
  }
  render() {
    return (
      <SafeAreaView style={[cStyle.header, this.props.style]}>
        {(!!this.props.rightOnPress || !!this.props.leftOnPress) && <View style={cStyle.headerLeft}>
          {this.props.headerLeft}

          {!this.props.headerLeft && !!this.props.leftOnPress &&
            <OneTabButtonComponent onPress={this.props.leftOnPress}>
              <Image style={cStyle.leftIcon} source={this.props.leftSourceIcon || require('assets/images/back_icon_red.png')} />
            </OneTabButtonComponent>
          }

          {!this.props.headerLeft && this.props.leftText && !!this.props.leftOnPress &&
            <OneTabButtonComponent onPress={this.props.leftOnPress}>
              <Text style={{ color: 'black' }}>{this.props.leftText}</Text>
            </OneTabButtonComponent>
          }
        </View>}

        <View style={cStyle.headerCenter}>
          {this.props.headerCenter}
          {!this.props.headerCenter && this.props.centerText && <Text style={cStyle.centerText}>{this.props.centerText}</Text>}
        </View>

        {(!!this.props.rightOnPress || !!this.props.leftOnPress) && <View style={cStyle.headerRight}>
          {this.props.headerRight}

          {!this.props.headerRight && !!this.props.rightSourceIcon && !!this.props.rightOnPress &&
            <OneTabButtonComponent onPress={this.props.rightOnPress}>
              <Image source={this.props.rightSourceIcon} />
            </OneTabButtonComponent>
          }

          {!this.props.headerRight && this.props.rightText && !!this.props.rightOnPress &&
            <OneTabButtonComponent onPress={this.props.rightOnPress}>
              <Text style={{ color: 'black' }}>{this.props.rightText}</Text>
            </OneTabButtonComponent>
          }
        </View>}
      </SafeAreaView>
    );
  }
}

const cStyle = StyleSheet.create({
  header: {
    height: constant.headerSize.height,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',

  },
  headerLeft: {
    minWidth: convertWidth(70),
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: convertWidth(4),
  },
  leftIcon: {
    width: convertWidth(20),
    height: convertWidth(20),
    resizeMode: 'contain'
  },
  headerCenter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',

  },
  centerText: {
    fontWeight: '900',
    color: '#FF4444',
    fontSize: 20,
  },
  headerRight: {
    minWidth: convertWidth(70),
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: convertWidth(4),
  }
});