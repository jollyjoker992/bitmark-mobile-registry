import React from 'react';
import PropTypes from 'prop-types';
import {
  Text, View, TouchableOpacity,
  Alert,
} from 'react-native';

import internetOffStyles from './bitmark-internet-off.component.style';
export class BitmarkInternetOffComponent extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    return (
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.7)' }}>
        <TouchableOpacity style={internetOffStyles.content}
          activeOpacity={1}
          onPress={() => {
            Alert.alert(global.i18n.t("BitmarkInternetOffComponent_networkError"), global.i18n.t("BitmarkInternetOffComponent_errorMessage"), [{
              text: global.i18n.t("BitmarkInternetOffComponent_cancel"), style: 'cancel',
            }, {
              text: global.i18n.t("BitmarkInternetOffComponent_retry"),
              onPress: () => {
                if (this.props.tryConnectInternet) {
                  this.props.tryConnectInternet();
                }
              }
            }]);
          }}>
          <View style={[internetOffStyles.title]}>
            <Text style={[internetOffStyles.titleText,]}>{global.i18n.t("BitmarkInternetOffComponent_noInternetConnection")}</Text>
          </View>
        </TouchableOpacity>
      </View>
    );
  }
}

BitmarkInternetOffComponent.propTypes = {
  tryConnectInternet: PropTypes.func,
}