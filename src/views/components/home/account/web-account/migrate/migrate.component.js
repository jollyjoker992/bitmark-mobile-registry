import React from 'react';
import {
  Text, View, TouchableOpacity, Image, SafeAreaView
} from 'react-native';
import Hyperlink from 'react-native-hyperlink';
import Camera from 'react-native-camera';

import componentStyle from './migrate.component.style';

import { Actions } from 'react-native-router-flux';
import { DataProcessor, EventEmitterService, AppProcessor } from 'src/processors';
import { defaultStyles } from 'src/views/commons';

const STEPS = {
  scan: 0,
  confirm: 1,
  done: 2
}

export class WebAccountMigrateComponent extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      step: STEPS.scan,
      userInformation: DataProcessor.getUserInformation(),
      token: '',
    };
    this.scanned = false;
  }

  goBack() {
    if (this.state.step === STEPS.scan || this.state.step === STEPS.done) {
      Actions.pop();
    } else {
      this.setState({ step: this.state.step - 1 });
    }
  }
  onBarCodeRead(scanData) {
    if (this.scanned) {
      return;
    }
    this.scanned = true;
    let tempArray = scanData.data.split('|');
    if (tempArray && tempArray.length === 2 && tempArray[0] === 'qr_account_migration') {
      this.setState({ step: STEPS.confirm, token: scanData.data });
    } else {
      EventEmitterService.emit(EventEmitterService.events.APP_PROCESS_ERROR, {
        message: global.i18n.t("WebAccountMigrateComponent_qrCodeIsInvalid"),
        onClose: Actions.pop
      });
    }
  }

  onConfirmMigration() {
    AppProcessor.doMigrateWebAccount(this.state.token).then(result => {
      if (result) {
        this.setState({ step: STEPS.done, email: result.email });
      }
    }).catch(error => {
      console.log('doMigrateWebAccount error:', error);
      EventEmitterService.emit(EventEmitterService.events.APP_PROCESS_ERROR, { message: global.i18n.t("WebAccountMigrateComponent_thisAccountCannotBeMigratedNow") });
    });
  }

  render() {
    return (<SafeAreaView style={componentStyle.body}>
      <View style={componentStyle.header}>
        <TouchableOpacity style={defaultStyles.headerLeft} onPress={this.goBack.bind(this)} >
          <Image style={defaultStyles.headerLeftIcon} source={require('assets/imgs/header_blue_icon.png')} />
        </TouchableOpacity>
        {this.state.step === STEPS.scan && <Text style={defaultStyles.headerTitle}>{global.i18n.t("WebAccountMigrateComponent_migrateWebAccount")}</Text>}
        {this.state.step === STEPS.confirm && <Text style={defaultStyles.headerTitle}>{global.i18n.t("WebAccountMigrateComponent_confirmMigration")}</Text>}
        {this.state.step === STEPS.done && <Text style={defaultStyles.headerTitle}>{global.i18n.t("WebAccountMigrateComponent_checkYourEmail")}</Text>}
        <TouchableOpacity style={defaultStyles.headerRight} />
      </View>
      {this.state.step === STEPS.scan && <View style={componentStyle.bodyContent}>
        <Hyperlink
          linkStyle={{ color: '#0060F2', }}
          linkText={url => url}
        >
          <Text style={componentStyle.scanMessage}>{global.i18n.t("WebAccountMigrateComponent_scanMessage")}</Text>
        </Hyperlink>
        <Camera style={componentStyle.scanCamera} aspect={Camera.constants.Aspect.fill} onBarCodeRead={this.onBarCodeRead.bind(this)} />
      </View>}

      {this.state.step === STEPS.confirm && <View style={componentStyle.bodyContent}>
        <View style={componentStyle.confirmMessageArea}>
          <Text style={componentStyle.confirmMessageText}>{global.i18n.t("WebAccountMigrateComponent_confirmMessageText")}</Text>
          <Text style={componentStyle.confirmAccountNumber}>{this.state.userInformation.bitmarkAccountNumber}</Text>
          <Text style={componentStyle.confirmMessageText}>{global.i18n.t("WebAccountMigrateComponent_onYourMobileDevice")}</Text>
        </View>
        <TouchableOpacity style={componentStyle.confirmButton} onPress={this.onConfirmMigration.bind(this)}>
          <Text style={componentStyle.confirmButtonText}>{global.i18n.t("WebAccountMigrateComponent_confirm")}</Text>
        </TouchableOpacity>
      </View>}

      {this.state.step === STEPS.done && <View style={componentStyle.bodyContent}>
        <View style={componentStyle.confirmMessageArea}>
          <Text style={componentStyle.confirmMessageText}>{global.i18n.t("WebAccountMigrateComponent_sentAnEmailTo")} </Text>
          <Text style={componentStyle.confirmAccountNumber}>{this.state.email || 'your@email.com'}</Text>
          <Text style={componentStyle.confirmMessageText}>{global.i18n.t("WebAccountMigrateComponent_followTheLinkInThatEmailToAuthorizeThisMigration")}</Text>
        </View>
      </View>}

    </SafeAreaView>);
  }
}