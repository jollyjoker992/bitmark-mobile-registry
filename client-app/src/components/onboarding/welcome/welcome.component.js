import React from 'react';
import {
  View, Text, TouchableOpacity, Image,
  StatusBar,
} from 'react-native';

import welcomeComponentStyle from './welcome.component.style';
import { ios } from './../../../configs';
import { Actions } from 'react-native-router-flux';

export class WelcomeComponent extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    return (
      <View style={welcomeComponentStyle.body}>
        <StatusBar hidden={true} />
        <View style={welcomeComponentStyle.welcomeBackground}>
          <Image style={welcomeComponentStyle.welcomeLogo} source={require('./../../../../assets/imgs/loading-logo.png')} />
          <View style={[welcomeComponentStyle.welcomeButtonArea]}>
            <TouchableOpacity style={[welcomeComponentStyle.welcomeButton,]} onPress={Actions.newAccount}>
              <Text style={[welcomeComponentStyle.welcomeButtonText,]}>{global.i18n.t("WelcomeComponent_createNewAccount")}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[welcomeComponentStyle.welcomeButton, {
              backgroundColor: '#F2FAFF',
              height: 45 + ios.constant.blankFooter / 2,
              paddingBottom: Math.max(10, ios.constant.blankFooter)
            }]} onPress={Actions.signIn}>
              <Text style={[welcomeComponentStyle.welcomeButtonText, { color: '#0060F2' }]}>{global.i18n.t("WelcomeComponent_accessExistingAccount")}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }
}