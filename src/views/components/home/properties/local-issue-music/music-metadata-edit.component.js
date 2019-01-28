import React from 'react';
import PropTypes from 'prop-types';
import {
  View, Text, TouchableOpacity, Image, TextInput, FlatList, ScrollView,
  StyleSheet,
} from 'react-native';
import { Actions } from 'react-native-router-flux';

import { defaultStyles } from 'src/views/commons';
import { constant } from 'src/configs';
import { convertWidth } from 'src/utils';


export class MusicMetadataEditComponent extends React.Component {
  static propTypes = {
    label: PropTypes.string,
    index: PropTypes.number,
    onChangeMetadataLabel: PropTypes.func,
  }

  constructor(props) {
    super(props);
    this.onChangeText = this.onChangeText.bind(this);
    this.onChooseLabel = this.onChooseLabel.bind(this);

    let suggestions = [];
    let label = this.props.label || ''
    constant.asset.MetadataLabelSamples.forEach((text, key) => {
      if (text.toLowerCase() !== constant.asset.metadata.labels.type && text.toLowerCase() !== constant.asset.metadata.labels.description &&
        (!label || global.i18n.t(`MetadataLabels_${text}`, { defaultValue: text }).toLowerCase().indexOf(label.toLowerCase()) >= 0)) {
        suggestions.push({ key, text: global.i18n.t(`MetadataLabels_${text}`, { defaultValue: text }) });
      }
    });
    this.state = { label: this.props.label || '', suggestions };
  }

  onChangeText(label) {
    let suggestions = [];
    constant.asset.MetadataLabelSamples.forEach((text, key) => {
      if (text.toLowerCase() !== constant.asset.metadata.labels.type && text.toLowerCase() !== constant.asset.metadata.labels.description &&
        (!label || global.i18n.t(`MetadataLabels_${text}`, { defaultValue: text }).toLowerCase().indexOf(label.toLowerCase()) >= 0)) {
        suggestions.push({ key, text: global.i18n.t(`MetadataLabels_${text}`, { defaultValue: text }) });
      }
    });
    this.setState({ label, suggestions });
  }

  onChooseLabel(text) {
    this.props.onChangeMetadataLabel(this.props.index, text);
    Actions.pop();
  }
  render() {
    return (
      <View style={{ flex: 1 }}>
        <View style={cStyles.header}>
          <TouchableOpacity style={defaultStyles.headerLeft} onPress={Actions.pop}>
            <Image style={defaultStyles.headerLeftIcon} source={require('assets/imgs/header_blue_icon.png')} />
          </TouchableOpacity>
          <Text style={[defaultStyles.headerTitle, { color: '#0060F2' }]}>{this.state.label || global.i18n.t("MusicMetadataEditComponent_headerTitle", { number: this.props.index + 1 })}</Text>
          <TouchableOpacity style={defaultStyles.headerRight} onPress={() => {
            this.props.onChangeMetadataLabel(this.props.index, this.state.label);
            Actions.pop();
          }}>
            <Text style={defaultStyles.headerRightText}>{global.i18n.t("MusicMetadataEditComponent_headerRightText")}</Text>
          </TouchableOpacity>
        </View>

        <View style={cStyles.body}>
          <ScrollView style={cStyles.bodyContent}>
            <TextInput style={cStyles.inputLabel}
              placeholder={global.i18n.t("MusicMetadataEditComponent_placeholder")}
              ref={(ref) => this.inputRef = ref}
              multiline={false}
              value={this.state.label}
              onChangeText={this.onChangeText}
              onSubmitEditing={this.onEndChangeMetadataValue}
              returnKeyLabel={global.i18n.t("MusicMetadataEditComponent_returnKeyLabel")}
              returnKeyType="done"
              selectTextOnFocus={true}
            />
            {!!this.state.label && <TouchableOpacity style={cStyles.removeLabelNumberButton} onPress={() => this.onChangeText('')} >
              <Image style={cStyles.removeLabelNumberIcon} source={require('assets/imgs/remove-icon.png')} />
            </TouchableOpacity>}
            <View style={cStyles.inputLabelBar} />
            <View style={cStyles.suggestionsList}>
              <FlatList
                keyExtractor={(item) => item.key}
                data={this.state.suggestions}
                renderItem={({ item }) => {
                  return (<TouchableOpacity style={cStyles.suggestionsButton} onPress={() => this.onChooseLabel(item.text)}>
                    <Text style={cStyles.suggestionsButtonText}>{item.text}</Text>
                  </TouchableOpacity>);
                }}
              />
            </View>
          </ScrollView>
        </View>
      </View>
    );
  }
}


const cStyles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignContent: 'center',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: constant.headerSize.height + constant.headerSize.paddingTop,
    paddingTop: constant.headerSize.paddingTop,
    width: '100%',
    borderBottomWidth: 1, borderBottomColor: '#0060F2',
    backgroundColor: 'white',
  },

  body: {
    flexDirection: 'column',
    height: '100%',
    width: '100%',
    backgroundColor: 'white',
  },
  bodyContent: {
    paddingLeft: convertWidth(10),
    paddingRight: convertWidth(19),
  },
  inputLabel: {
    marginTop: 47,
    width: convertWidth(337),
    fontFamily: 'Andale Mono',
    fontSize: 15,
    marginLeft: convertWidth(10),
  },
  removeLabelNumberButton: {
    position: 'absolute',
    top: 29,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingLeft: 18,
    paddingTop: 18,
    paddingBottom: 18,
  },
  removeLabelNumberIcon: {
    width: 12,
    height: 12,
    resizeMode: 'contain',
  },
  inputLabelBar: {
    marginTop: 9,
    borderBottomColor: '#0060F2',
    borderBottomWidth: 1,
    marginLeft: convertWidth(10),
    width: convertWidth(337),
  },
  suggestionsList: {
    marginTop: 5,
    marginBottom: 20,
    width: '100%',
  },
  suggestionsButton: {
    width: '100%',
    paddingTop: 10,
    paddingLeft: 10,
  },
  suggestionsButtonText: {
    fontFamily: 'Andale Mono',
    fontSize: 15,
    color: '#0060F2',
  },
});