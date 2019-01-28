import React, { Component } from 'react';
import {
  View, Animated, TouchableWithoutFeedback,
  StyleSheet,
} from 'react-native';
import { EventEmitterService } from 'src/processors';
import { config } from 'src/configs';
import { PropertyActionSheetComponent } from './home/properties';
import { PropertyMetadataComponent } from './home/properties/property-metadata.component';

let ComponentName = 'MainCoverComponent';
export class MainCoverComponent extends Component {
  constructor(props) {
    super(props);
    this.handlerCoverArea = this.handlerCoverArea.bind(this);
    EventEmitterService.remove(EventEmitterService.events.APP_SHOW_COVER, null, ComponentName);
    this.state = {
      dataCover: null,
      opacityCoverArea: new Animated.Value(0),
      heightCoverArea: new Animated.Value(0),
      topCoverArea: new Animated.Value(config.deviceSize.height),
    }
  }

  componentDidMount() {
    EventEmitterService.on(EventEmitterService.events.APP_SHOW_COVER, this.handlerCoverArea);
  }

  componentWillUnmount() {
    EventEmitterService.remove(EventEmitterService.events.APP_SHOW_COVER, this.handlerCoverArea, ComponentName);
  }

  handlerCoverArea(dataCover) {
    if (dataCover) {
      let listAnimations = [];
      listAnimations.push(Animated.spring(this.state.opacityCoverArea, {
        toValue: 1,
        duration: 100,
      }));
      listAnimations.push(Animated.spring(this.state.heightCoverArea, {
        toValue: config.deviceSize.height,
        duration: 100,
      }));
      listAnimations.push(Animated.spring(this.state.topCoverArea, {
        toValue: 0,
        duration: 100,
      }));
      Animated.parallel(listAnimations).start();
    } else {
      let listAnimations = [];
      listAnimations.push(Animated.spring(this.state.opacityCoverArea, {
        toValue: 0,
        duration: 100,
      }));
      listAnimations.push(Animated.spring(this.state.heightCoverArea, {
        toValue: 0,
        duration: 100,
      }));
      listAnimations.push(Animated.spring(this.state.topCoverArea, {
        toValue: config.deviceSize.height,
        duration: 100,
      }));
      Animated.parallel(listAnimations).start();
    }
    this.setState({ dataCover });
  }

  render() {
    return (
      <Animated.View style={[cStyles.body, {
        top: this.state.topCoverArea, height: this.state.heightCoverArea, opacity: this.state.opacityCoverArea,
      }]}>
        <TouchableWithoutFeedback onPress={() => this.handlerCoverArea()}>
          <View style={cStyles.bodyContainer}>
            <TouchableWithoutFeedback onPress={(event) => event.stopPropagation()}>
              <View style={cStyles.bodyContent}>
                {this.state.dataCover && this.state.dataCover.type === 'PropertyActionSheetComponent' &&
                  this.state.dataCover.bitmark && this.state.dataCover.asset &&
                  <PropertyActionSheetComponent
                    bitmark={this.state.dataCover.bitmark}
                    asset={this.state.dataCover.asset}
                    fromPropertyDetail={this.state.dataCover.fromPropertyDetail}
                  />
                }
                {this.state.dataCover && this.state.dataCover.type === 'PropertyMetadataComponent' &&
                  this.state.dataCover.asset &&
                  <PropertyMetadataComponent
                    asset={this.state.dataCover.asset}
                  />
                }
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Animated.View>
    );
  }
}


const cStyles = StyleSheet.create({
  body: {
    flex: 1, justifyContent: 'flex-end',
    position: 'absolute', left: 0, zIndex: 1,
    width: '100%',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  bodyContainer: {
    flex: 1, width: '100%', height: '100%', justifyContent: 'flex-end',
  },
  bodyContent: {
    flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
    backgroundColor: 'red',
  },
});
