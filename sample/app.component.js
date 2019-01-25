import React from 'react';
import {
  View, TouchableOpacity, Text,
  WebView,
} from 'react-native';
// import Video from 'react-native-video';
import { FileUtil } from 'src/utils';
export class SampleAppComponent extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      videoFilePath: null,
      mp3FilePath: null,

    };
  }

  async playVideo() {
    let list = await FileUtil.readDir(`${FileUtil.DocumentDirectory}/processing`);
    for (let fileName of list) {
      console.log(fileName, await (FileUtil.readFile(`${FileUtil.DocumentDirectory}/processing/${fileName}`, 'base64')));
    }
  }

  render() {
    return (<View style={{ flex: 1, }}>

      <WebView
        scalesPageToFit={true}
        style={{
          flex: 1, width: '100%',
          justifyContent: 'center',
          borderWidth: 10, borderColor: 'red'
        }}
        source={{ uri: 'http://localhost:1102/po-change-processing' }} />
    </View>)
  }
}