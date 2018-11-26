import React from 'react';
import PropTypes from 'prop-types';
import {
  Text, View, Image
} from 'react-native';
import componentStyles from './code-push.component.style';

export class CodePushUpdateComponent extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    if (this.props.shouldRender !== undefined && !this.props.shouldRender) {
      return null;
    }

    return (
      <View style={componentStyles.body}>
        <View style={{ flex: 1 }} />
        <View style={componentStyles.content}>
          <View>
            <Image style={componentStyles.bitmarkIcon} source={require('./../../../assets/imgs/loading-logo.png')} />
          </View>

          <View style={componentStyles.statusContainer}>
            <Text style={this.props.status === 'downloading' ? componentStyles.updatingStatus : componentStyles.completedStatus}>
              {this.props.status === 'downloading' ? global.i18n.t("CodePushUpdateComponent_updating") : global.i18n.t("CodePushUpdateComponent_complete")}
            </Text>
          </View>

          {/*Progress bar*/}
          <View style={componentStyles.progressBar}>
            <View style={{ width: `${this.props.progress}%`, backgroundColor: '#0060F2', flex: 1 }}>
            </View>
          </View>
        </View>
      </View>
    );
  }
}

CodePushUpdateComponent.propTypes = {
  status: PropTypes.string,
  progress: PropTypes.number,
  shouldRender: PropTypes.bool,
};