import React from 'react';
import { Text, View, TouchableOpacity, Image, SafeAreaView } from "react-native";
import assetTypeHelpStyle from "./asset-type-help.component.style";

import { Actions } from 'react-native-router-flux';
import { defaultStyles } from 'src-new/views/commons';
import { config } from 'src-new/configs';

export class AssetTypeHelpComponent extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <SafeAreaView style={assetTypeHelpStyle.body}>
        <View style={assetTypeHelpStyle.header}>
          <TouchableOpacity style={defaultStyles.headerLeft} onPress={Actions.pop} >
            <Image style={defaultStyles.headerLeftIcon} source={require('assets/imgs/header_blue_icon.png')} />
          </TouchableOpacity>
        </View>

        <View style={assetTypeHelpStyle.content}>
          {/*Title*/}
          <Text style={assetTypeHelpStyle.title}>WHAT IS ASSET TYPE?</Text>

          {/*Description*/}
          <Text style={assetTypeHelpStyle.text}>
            Assets are private by default, so that only current bitmark holders can access the assets. You may also select to make an asset public, which means that anyone can access the asset, regardless of whether they are currently an owner. Note that
              <Text style={assetTypeHelpStyle.textBold}>
              {` you cannot change the asset type after it is registered on the blockchain. `}
            </Text>
            For example, you cannot change a private asset to a public asset or vice versa.
            </Text>

          <TouchableOpacity style={assetTypeHelpStyle.learnMore} onPress={() => {
            Actions.bitmarkWebViewFull({
              title: 'Bitmark Blockchain', sourceUrl: config.bitmark_web_site + '/resources/technology?env=app',
            })
          }}>
            <Text style={assetTypeHelpStyle.learnMoreText}>LEARN MORE »</Text>
          </TouchableOpacity>
        </ View>
      </SafeAreaView>
    )
  }
}

AssetTypeHelpComponent.propTypes = {
};
