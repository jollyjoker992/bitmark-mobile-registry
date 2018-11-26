import React, { Component } from 'react';
import { Router, Stack, Scene, Modal, } from 'react-native-router-flux';

import { WelcomeComponent } from './welcome';
import { NewAccountComponent } from './new-account';
import { SignInComponent } from './sign-in';
import { FaceTouchIdComponent } from './face-touch-id';
import { NotificationComponent } from './notification';
import { BitmarkWebViewComponent } from '../../commons/components';
import { DataProcessor } from '../../processors';

export class DefaultRouterComponent extends Component {
  componentDidMount() {
    DataProcessor.setMountedRouter();
  }
  render() {

    return (
      <Router >
        <Modal headerMode='none'>
          <Stack headerMode='none' >
            <Scene key="welcome" panHandlers={null} component={WelcomeComponent} />
            <Scene key="newAccount" panHandlers={null} component={NewAccountComponent} />
            <Scene key="signIn" panHandlers={null} component={SignInComponent} />
            <Scene key="notification" panHandlers={null} component={NotificationComponent} />
            <Scene key="faceTouchId" panHandlers={null} component={FaceTouchIdComponent} />
          </Stack>
          <Scene key="bitmarkWebViewFull" panHandlers={null} component={BitmarkWebViewComponent} />
        </Modal>
      </Router>
    );
  }
}
