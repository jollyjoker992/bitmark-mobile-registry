import React from 'react';
import {
  View, Text, Image, TouchableOpacity,
} from 'react-native'

import notificationStyle from './notification.component.style';
import { NotificationService, EventEmitterService } from '../../../services';
import { iosConstant } from '../../../configs/ios/ios.config';
import { BitmarkComponent } from '../../../commons/components';
import { DataProcessor } from '../../../processors';

export class NotificationComponent extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {

    let requestNotification = () => {
      NotificationService.doRequestNotificationPermissions().then((result) => {
        EventEmitterService.emit(EventEmitterService.events.APP_NEED_REFRESH, true);
        return DataProcessor.doMarkRequestedNotification(result);
      }).catch(error => {
        console.log('NotificationComponent requestNotification error:', error);
      });
    }
    return (
      <BitmarkComponent
        backgroundColor='white'
        contentInScroll={true}
        content={(<View style={[notificationStyle.body]}>
          <Text style={[notificationStyle.notificationTitle]}>{global.i18n.t("NotificationComponent_notificationTitle")}</Text>
          <Text style={[notificationStyle.notificationDescription,]}>
            {global.i18n.t("NotificationComponent_notificationDescription")}
          </Text>
          <Image style={[notificationStyle.notificationImage]} source={require('../../../../assets/imgs/notification.png')} />
        </View>)}

        footerHeight={90 + iosConstant.blankFooter / 2}
        footer={(<View style={notificationStyle.enableButtonArea}>
          <TouchableOpacity style={[notificationStyle.enableButton]} onPress={requestNotification}>
            <Text style={notificationStyle.enableButtonText}>{global.i18n.t("NotificationComponent_enable")}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[notificationStyle.enableButton, {
            backgroundColor: 'F2FAFF',
            paddingBottom: Math.max(10, iosConstant.blankFooter),
            height: 45 + iosConstant.blankFooter / 2
          }]} onPress={() => {
            EventEmitterService.emit(EventEmitterService.events.APP_NEED_REFRESH, true);
          }}>
            <Text style={[notificationStyle.enableButtonText, { color: '#0060F2' }]}>{global.i18n.t("NotificationComponent_later")}</Text>
          </TouchableOpacity>
        </View>)}
      />
    );
  }
}