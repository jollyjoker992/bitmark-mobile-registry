import React, { Component } from 'react';
import { Router, Stack, Scene, } from 'react-native-router-flux';
import { StackNavigator, } from 'react-navigation';

import { WelcomeComponent } from './welcome';
import { NewAccountComponent } from './new-account';
import { SignInComponent } from './sign-in';
import { FaceTouchIdComponent } from './face-touch-id';
import { NotificationComponent } from './notification';


let OnBoardingComponent = StackNavigator({
  Welcome: { screen: WelcomeComponent, },
  NewAccount: { screen: NewAccountComponent, },
  SignIn: { screen: SignInComponent, },
  Notification: { screen: NotificationComponent, },
  FaceTouchId: { screen: FaceTouchIdComponent, },
}, {
    headerMode: 'none',
    navigationOptions: {
      gesturesEnabled: false,
    },
    cardStyle: {
      shadowOpacity: 0,
    }
  }
);

export { OnBoardingComponent };

export class DefaultRouterComponent extends Component {
  render() {

    return (
      <Router >
        <Stack headerMode='none' >
          <Scene key="welcome" panHandlers={null} component={WelcomeComponent} />
          <Scene key="newAccount" component={NewAccountComponent} />
          <Scene key="signIn" component={SignInComponent} />
          <Scene key="notification" component={NotificationComponent} />
          <Scene key="faceTouchId" component={FaceTouchIdComponent} />
        </Stack>
      </Router>
    );
  }
}
