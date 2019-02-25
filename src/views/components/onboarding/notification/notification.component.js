import React from 'react';
import PropTypes from 'prop-types';
import {
  View, Text, Image,
} from 'react-native'

import notificationStyle from './notification.component.style';
import { AccountService, EventEmitterService, CommonProcessor, CacheData } from 'src/processors';
import { constant } from 'src/configs';
import { OneTabButtonComponent } from 'src/views/commons/one-tab-button.component';

export class NotificationComponent extends React.Component {
  static propTypes = {
    justCreatedBitmarkAccount: PropTypes.bool,
  }

  render() {
    console.log('NotificationComponent render :', this.props);
    CacheData.passTouchFaceId = true;
    let requestNotification = () => {
      AccountService.doRequestNotificationPermissions().then((result) => {
        EventEmitterService.emit(EventEmitterService.events.APP_NEED_REFRESH, this.props.justCreatedBitmarkAccount);
        return CommonProcessor.doMarkRequestedNotification(result);
      }).catch(error => {
        console.log('NotificationComponent requestNotification error:', error);
      });
    }
    return (
      <View style={{ flex: 1, backgroundColor: 'white' }}>
        <View style={[notificationStyle.body]}>
          <Text style={[notificationStyle.notificationTitle]}>{global.i18n.t("NotificationComponent_notificationTitle")}</Text>
          <Text style={[notificationStyle.notificationDescription,]}>
            {global.i18n.t("NotificationComponent_notificationDescription")}
          </Text>
          <Image style={[notificationStyle.notificationImage]} source={require('assets/imgs/notification.png')} />
        </View>

        <View style={notificationStyle.enableButtonArea}>
          <OneTabButtonComponent style={[notificationStyle.enableButton]} onPress={requestNotification}>
            <Text style={notificationStyle.enableButtonText}>{global.i18n.t("NotificationComponent_enable")}</Text>
          </OneTabButtonComponent>
          <OneTabButtonComponent style={[notificationStyle.enableButton, {
            backgroundColor: '#F2FAFF',
            height: 45 + (constant.blankFooter / 2)
          }]} onPress={() => {
            EventEmitterService.emit(EventEmitterService.events.APP_NEED_REFRESH, this.props.justCreatedBitmarkAccount);
          }}>
            <Text style={[notificationStyle.enableButtonText, {
              color: '#0060F2',
              paddingBottom: (constant.blankFooter / 2)
            }]}>{global.i18n.t("NotificationComponent_later")}</Text>
          </OneTabButtonComponent>
        </View>
      </View>
    );
  }
}