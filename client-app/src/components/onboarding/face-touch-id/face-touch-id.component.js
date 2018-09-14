import React from 'react';
import PropTypes from 'prop-types';
import {
  View, Text, Image, TouchableOpacity,
  Linking,
  AppState,
  Alert
} from 'react-native'
import { CommonModel } from './../../../models';

import faceTouchIdStyle from './face-touch-id.component.style';
import { BitmarkComponent } from '../../../commons/components';
import { iosConstant } from '../../../configs/ios/ios.config';

export class FaceTouchIdComponent extends React.Component {
  constructor(props) {
    super(props);
    this.handleAppStateChange = this.handleAppStateChange.bind(this);
    this.checkSupportFaceTouchId = this.checkSupportFaceTouchId.bind(this);
    this.doContinue = this.doContinue.bind(this);
    this.confirmSkipTouchId = this.confirmSkipTouchId.bind(this);

    this.state = {
      supported: true,
      errorMessage: '',
    }
    this.appState = AppState.currentState;
  }

  componentDidMount() {
    AppState.addEventListener('change', this.handleAppStateChange);
  }

  componentWillUnmount() {
    AppState.removeEventListener('change', this.handleAppStateChange);
  }

  handleAppStateChange = (nextAppState) => {
    if (this.appState.match(/background/) && nextAppState === 'active') {
      this.checkSupportFaceTouchId();
    }
    this.appState = nextAppState;
  }

  checkSupportFaceTouchId() {
    CommonModel.doCheckPasscodeAndFaceTouchId().then((supported) => {
      this.setState({ supported });
    });
  }

  doContinue(enableTouchId) {
    this.props.navigation.state.params.doContinue(enableTouchId).then((user) => {
      if (user) {
        this.props.navigation.navigate('Notification');
      }
    }).catch(error => {
      console.log('error :', error);
      this.setState({ errorMessage: 'Can not create or access bitmark account!' })
    });
  }

  confirmSkipTouchId() {
    Alert.alert('Are you sure you don’t want to protect your data with Touch & Face ID?', '', [{
      style: 'cancel',
      text: 'No',
    }, {
      text: 'Yes',
      onPress: () => {
        this.doContinue(false);
      }
    }]);
  }

  render() {
    return (
      <BitmarkComponent
        backgroundColor='white'
        contentInScroll={true}
        content={(<View style={[faceTouchIdStyle.body]}>
          <Text style={[faceTouchIdStyle.faceTouchIdTitle]}>
            TOUCH/FACE ID
          </Text>
          <Text style={[faceTouchIdStyle.faceTouchIdDescription,]}>
            Use Touch/Face ID to sign and encrypt your data.
          </Text>
          <View style={faceTouchIdStyle.passcodeRemindImages}>
            <Image style={[faceTouchIdStyle.touchIdImage]} source={require('../../../../assets/imgs/touch-id.png')} />
            <Image style={[faceTouchIdStyle.faceIdImage]} source={require('../../../../assets/imgs/face-id.png')} />
          </View>

        </View>)}

        footerHeight={45 + iosConstant.blankFooter / 2}
        footer={(<View style={faceTouchIdStyle.enableButtonArea}>
          {/*Enable Button*/}
          <TouchableOpacity style={[faceTouchIdStyle.enableButton]}
            onPress={() => {
              if (!this.state.supported) {
                Linking.openURL('app-settings:');
              } else {
                this.doContinue(true);
              }
            }}>
            <Text style={faceTouchIdStyle.enableButtonText}>ENABLE TOUCH/FACE ID</Text>
          </TouchableOpacity>
          {/*Skip Button*/}
          <TouchableOpacity style={[faceTouchIdStyle.skipButton]}
                            onPress={() => {
                              this.confirmSkipTouchId();
                            }}>
            <Text style={faceTouchIdStyle.skipButtonText}>SKIP</Text>
          </TouchableOpacity>
        </View>)}
      />
    );
  }
}

FaceTouchIdComponent.propTypes = {
  navigation: PropTypes.shape({
    navigate: PropTypes.func,
    goBack: PropTypes.func,
    state: PropTypes.shape({
      params: PropTypes.shape({
        doContinue: PropTypes.func,
      }),
    }),
  }),
  screenProps: PropTypes.shape({
    rootNavigation: PropTypes.shape({
      navigate: PropTypes.func,
      dispatch: PropTypes.func,
    })
  }),
}