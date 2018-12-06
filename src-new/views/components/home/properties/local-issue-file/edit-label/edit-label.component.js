import React from 'react';
import PropTypes from 'prop-types';
import {
  View, Text, TouchableOpacity, Image, TextInput, FlatList, ScrollView, SafeAreaView
} from 'react-native';
import { Actions } from 'react-native-router-flux';

import localAddPropertyStyle from './edit-label.component.style';
import { defaultStyles } from 'src-new/views/commons';
import { constant } from 'src-new/configs';



const MetadataLabelSamples = [
  'Created (date)', 'Contributor', 'Coverage', 'Creator',
  'Description', 'Dimensions', 'Duration', 'Edition',
  'Format', 'Identifier', 'Language', 'License',
  'Medium', 'Publisher', 'Relation', 'Rights',
  'Size', 'Source', 'Subject', 'Keywords',
  'Type', 'Version'];

export class LocalIssueFileEditLabelComponent extends React.Component {
  constructor(props) {
    super(props);
    this.onChangeText = this.onChangeText.bind(this);
    this.onChooseLabel = this.onChooseLabel.bind(this);

    let suggestions = [];
    let label = this.props.label || ''
    MetadataLabelSamples.forEach((text, key) => {
      if (!label || text.toLowerCase().indexOf(label.toLowerCase()) >= 0) {
        suggestions.push({ key, text });
      }
    });
    this.state = { label: this.props.label || '', suggestions };
  }

  onChangeText(label) {
    let suggestions = [];
    MetadataLabelSamples.forEach((text, key) => {
      if (!label || text.toLowerCase().indexOf(label.toLowerCase()) >= 0) {
        suggestions.push({ key, text });
      }
    });
    this.setState({ label, suggestions });
  }

  onChooseLabel(text) {
    this.props.onEndChangeMetadataKey(this.props.labelKey, text);
    Actions.pop();
  }
  render() {
    return (
      <SafeAreaView style={{ flex: 1 }}>
        <View style={[defaultStyles.header, { height: constant.headerSize.height }]}>
          <TouchableOpacity style={defaultStyles.headerLeft} onPress={Actions.pop}>
            <Image style={defaultStyles.headerLeftIcon} source={require('assets/imgs/header_blue_icon.png')} />
          </TouchableOpacity>
          <Text style={[defaultStyles.headerTitle, { color: this.state.label ? 'black' : '#C1C1C1' }]}>{this.state.label || global.i18n.t("LocalIssueFileEditLabelComponent_headerTitle", { number: this.props.labelKey + 1 })}</Text>
          <TouchableOpacity style={defaultStyles.headerRight} onPress={() => {
            this.props.onEndChangeMetadataKey(this.props.labelKey, this.state.label);
            Actions.pop();
          }}>
            <Text style={defaultStyles.headerRightText}>{global.i18n.t("LocalIssueFileEditLabelComponent_done")}</Text>
          </TouchableOpacity>
        </View>

        <View style={localAddPropertyStyle.body}>
          <ScrollView style={localAddPropertyStyle.bodyContent}>
            <TextInput style={localAddPropertyStyle.inputLabel}
              placeholder={global.i18n.t("LocalIssueFileEditLabelComponent_placeholder")}
              ref={(ref) => this.inputRef = ref}
              multiline={false}
              value={this.state.label}
              onChangeText={this.onChangeText}
              onSubmitEditing={this.onEndChangeMetadataValue}
              returnKeyLabel="done"
              returnKeyType="done"
              selectTextOnFocus={true}
            />
            {!!this.state.label && <TouchableOpacity style={localAddPropertyStyle.removeLabelNumberButton} onPress={() => this.onChangeText('')} >
              <Image style={localAddPropertyStyle.removeLabelNumberIcon} source={require('assets/imgs/remove-icon.png')} />
            </TouchableOpacity>}
            <View style={localAddPropertyStyle.inputLabelBar} />
            <View style={localAddPropertyStyle.suggestionsList}>
              <FlatList
                data={this.state.suggestions}
                renderItem={({ item }) => {
                  return (<TouchableOpacity style={localAddPropertyStyle.suggestionsButton} onPress={() => this.onChooseLabel(item.text)}>
                    <Text style={localAddPropertyStyle.suggestionsButtonText}>{item.text}</Text>
                  </TouchableOpacity>);
                }}
              />
            </View>
          </ScrollView>
        </View>
      </SafeAreaView>
    );
  }
}

LocalIssueFileEditLabelComponent.propTypes = {
  label: PropTypes.string,
  labelKey: PropTypes.number,
  onEndChangeMetadataKey: PropTypes.func,
}