
import React from 'react';
import {
  Text, View, TouchableOpacity, KeyboardAvoidingView, TextInput, Image, FlatList, SafeAreaView, ScrollView, Animated,
  Keyboard,
  StatusBar,
} from 'react-native';
import defaultStyles from './../../../commons/styles';
import signStyle from './sign-in.component.style';
import { BitmarkAutoCompleteComponent } from './../../../commons/components';
import { dictionary24Words, convertWidth } from './../../../utils';
import { AppProcessor } from '../../../processors';
import { iosConstant } from '../../../configs/ios/ios.config';
import { Actions } from 'react-native-router-flux';

let PreCheckResults = {
  success: 'SUBMIT',
  error: 'RETRY'
};

const statuses = {
  done: 'done',
  inputting: 'inputting'
};

// madelena testnet
// let testWords = ["acid", "dinner", "west", "satisfy", "ranch", "include", "remove", "vanish", "visual", "shift", "delay", "spot", "table", "feed", "volume", "oblige", "crisp", "bracket", "acoustic", "nurse", "where", "wreck", "fly", "marriage",];
// madelena livenet
// let testWords = ["absent", "ostrich", "injury", "pill", "episode", "permit", "endless", "happy", "thing", "devote", "robust", "earth", "punch", "robot", "jelly", "demand", "topple", "diamond", "climb", "turn", "reveal", "suspect", "fat", "assault",];

// victor testnet
// let testWords = ["access", "say", "write", "artwork", "broom", "wife", "patch", "skill", "snack", "cabin", "best", "target", "night", "notable", "appear", "life", "blame", "enter", "glide", "vocal", "chuckle", "biology", "spy", "inspire",];

// let testWords = ["accident", "sausage", "ticket", "dolphin", "original", "nasty", "theme", "life", "polar", "donor", "office", "weird", "neither", "escape", "flag", "spell", "submit", "salute", "sustain", "habit", "soap", "oil", "romance", "drama",];
// let testWords = ["accuse", "angry", "thing", "alone", "day", "guitar", "gown", "possible", "rotate", "erupt", "teach", "myth", "final", "rule", "conduct", "term", "mom", "soldier", "prepare", "bench", "hurt", "banana", "joy", "asset",];
export class SignInComponent extends React.Component {

  constructor(props) {
    super(props);
    this.onChangeText = this.onChangeText.bind(this);
    this.onFocus = this.onFocus.bind(this);
    this.onSubmitWord = this.onSubmitWord.bind(this);
    this.selectIndex = this.selectIndex.bind(this);
    this.checkStatusInputting = this.checkStatusInputting.bind(this);
    this.doCheck24Word = this.doCheck24Word.bind(this);
    this.submit24Words = this.submit24Words.bind(this);
    this.doSignIn = this.doSignIn.bind(this);

    let smallerList = [];
    let biggerList = [];
    for (let index = 0; index < 24; index++) {
      if (index < 12) {
        smallerList.push({
          key: index,
          // word: testWords[index],
          word: '',
        });
      } else {
        biggerList.push({
          key: index,
          // word: testWords[index],
          word: '',
        });
      }
    }
    this.inputtedRefs = {};

    this.state = {
      smallerList,
      biggerList,
      selectedIndex: -1,
      remainWordNumber: 24,
      dataSource: dictionary24Words,
      keyBoardHeight: 0,
      keyboardExternalBottom: new Animated.Value(0),
      keyboardExternalOpacity: new Animated.Value(0),
    };
    setTimeout(this.checkStatusInputting, 200);
  }

  onChangeText(index, text) {
    text = text ? text.trim() : '';
    this.doFilter(text);
    if (index < 12) {
      let inputtedWords = this.state.smallerList;
      inputtedWords[index].word = text;
      this.setState({ smallerList: inputtedWords });
    } else {
      let inputtedWords = this.state.biggerList;
      inputtedWords[index - 12].word = text;
      this.setState({ biggerList: inputtedWords });
    }
    this.checkStatusInputting();
  }

  componentDidMount() {
    this.keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', this.onKeyboardDidShow.bind(this));
    this.keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', this.onKeyboardDidHide.bind(this));
  }

  componentWillUnmount() {
    this.keyboardDidShowListener.remove();
    this.keyboardDidHideListener.remove();
  }


  onKeyboardDidShow(keyboardEvent) {
    let keyboardHeight = keyboardEvent.endCoordinates.height;
    this.setState({ keyboardHeight });

    let listAnimations = [];
    listAnimations.push(Animated.spring(this.state.keyboardExternalBottom, {
      toValue: keyboardHeight,
      duration: 200,
    }));
    listAnimations.push(Animated.spring(this.state.keyboardExternalOpacity, {
      toValue: 1,
      duration: 200,
    }));
    Animated.parallel(listAnimations).start();
  }

  onKeyboardDidHide() {
    this.setState({ keyboardHeight: 0 });
    let listAnimations = [];
    listAnimations.push(Animated.spring(this.state.keyboardExternalBottom, {
      toValue: 0,
      duration: 200,
    }));
    listAnimations.push(Animated.spring(this.state.keyboardExternalOpacity, {
      toValue: 0,
      duration: 200,
    }));
    Animated.parallel(listAnimations).start();
  }

  doFilter(text) {
    let dataSource = dictionary24Words.filter(word => word.toLowerCase().indexOf(text.toLowerCase()) === 0);
    this.setState({ dataSource, currentInputtedText: text });
  }

  onFocus(index) {
    this.setState({
      selectedIndex: index
    });
    let text = index < 12 ? this.state.smallerList[index].word : this.state.biggerList[index - 12].word;
    this.inputtedRefs[index].focus();
    this.doFilter(text);
  }

  onSubmitWord(word) {
    let selectedIndex = this.state.selectedIndex;
    if (selectedIndex < 0) {
      return;
    }
    if (word) {
      word = word ? word.trim() : '';
      this.inputtedRefs[selectedIndex].focus();
      if (selectedIndex < 12) {
        let inputtedWords = this.state.smallerList;
        inputtedWords[selectedIndex].word = word;
        this.setState({ smallerList: inputtedWords });
      } else {
        let inputtedWords = this.state.biggerList;
        inputtedWords[selectedIndex - 12].word = word;
        this.setState({ biggerList: inputtedWords });
      }
    }
    this.selectIndex((selectedIndex + 1) % 24);
  }

  selectIndex(index) {
    this.onFocus(index);
    this.checkStatusInputting();
  }

  checkStatusInputting() {
    let countNumberInputtedWord = 0;
    this.state.smallerList.forEach(item => {
      countNumberInputtedWord = countNumberInputtedWord + (item.word ? 1 : 0)
    });
    this.state.biggerList.forEach(item => {
      countNumberInputtedWord = countNumberInputtedWord + (item.word ? 1 : 0)
    });
    let status = countNumberInputtedWord === 24 ? BitmarkAutoCompleteComponent.statuses.done : BitmarkAutoCompleteComponent.statuses.inputting;
    this.setState({
      preCheckResult: null,
      remainWordNumber: 24 - countNumberInputtedWord,
      status,
    });
  }

  async doCheck24Word() {
    return new Promise((resolve) => {
      Keyboard.dismiss();
      if (this.state.remainWordNumber === 0) {
        let inputtedWords = [];
        this.state.smallerList.forEach(item => inputtedWords.push(item.word));
        this.state.biggerList.forEach(item => inputtedWords.push(item.word));
        AppProcessor.doCheck24Words(inputtedWords).then(() => {
          this.setState({ preCheckResult: PreCheckResults.success });
          resolve(true);
        }).catch((error) => {
          resolve(false);
          console.log('check24Words error: ', error);
          this.setState({ preCheckResult: PreCheckResults.error });
        });
      } else {
        this.setState({ preCheckResult: null });
        resolve(true);
      }
    });
  }

  doSignIn() {
    this.doCheck24Word().then((result) => {
      if (result) {
        Actions.faceTouchId({ doContinue: this.submit24Words });
      }
    });
  }

  async submit24Words(enableTouchId) {
    if (this.state.preCheckResult === PreCheckResults.error) {
      let smallerList = [];
      let biggerList = [];
      for (let index = 0; index < 24; index++) {
        if (index < 12) {
          smallerList.push({
            key: index,
            word: '',
          });
        } else {
          biggerList.push({
            key: index,
            word: '',
          });
        }
      }
      this.setState({
        smallerList: smallerList,
        biggerList: biggerList,
        preCheckResult: null,
        selectedIndex: -1,
        remainWordNumber: 24,
      });
      return;
    }
    let inputtedWords = [];
    this.state.smallerList.forEach(item => inputtedWords.push(item.word));
    this.state.biggerList.forEach(item => inputtedWords.push(item.word));
    return await AppProcessor.doLogin(inputtedWords, enableTouchId);
  }

  render() {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#F5F5F5' }}>

        <View style={[defaultStyles.header, { backgroundColor: '#F5F5F5', height: iosConstant.headerSize.height }]} onPress={Keyboard.dismiss}>
          <StatusBar hidden={false} />
          <TouchableOpacity style={[defaultStyles.headerLeft, { width: 50 }]} onPress={Actions.pop}>
            <Image style={defaultStyles.headerLeftIcon} source={require('./../../../../assets/imgs/header_blue_icon.png')} />
          </TouchableOpacity>
          <Text style={[defaultStyles.headerTitle, { maxWidth: convertWidth(375) - 100 }]}>RECOVERY PHRASE SIGN-IN</Text>
          <TouchableOpacity style={[defaultStyles.headerRight, { width: 50 }]}>
          </TouchableOpacity>
        </View>
        <KeyboardAvoidingView behavior="padding" enabled style={{ flex: 1 }} keyboardVerticalOffset={iosConstant.buttonHeight} >
          <ScrollView style={signStyle.mainContent}>
            <Text style={[signStyle.writeRecoveryPhraseContentMessage,]}>Please type all 24 words of your recovery phrase in the exact sequence below:</Text>
            <View style={[signStyle.writeRecoveryPhraseArea]}>
              <View style={signStyle.writeRecoveryPhraseContentHalfList}>
                <FlatList data={this.state.smallerList}
                  scrollEnabled={false}
                  extraData={this.state}
                  renderItem={({ item }) => {
                    return (<View style={signStyle.recoveryPhraseSet}>
                      <Text style={signStyle.recoveryPhraseIndex}>{item.key + 1}.</Text>
                      <TextInput
                        style={[signStyle.recoveryPhraseWord, {
                          backgroundColor: (item.word ? 'white' : '#F5F5F5'),
                          borderColor: '#0060F2',
                          borderWidth: (item.key === this.state.selectedIndex ? 1 : 0),
                        }]}
                        ref={(r) => { this.inputtedRefs[item.key] = r; }}
                        onChangeText={(text) => this.onChangeText(item.key, text)}
                        onFocus={() => this.onFocus(item.key)}
                        value={item.word}
                        autoCorrect={false}
                        autoCapitalize="none"
                        onSubmitEditing={() => this.onSubmitWord(item.word)}
                      />
                    </View>)
                  }}
                />
              </View>

              <View style={[signStyle.writeRecoveryPhraseContentHalfList, { marginLeft: 33, }]}>
                <FlatList data={this.state.biggerList}
                  scrollEnabled={false}
                  extraData={this.state}
                  renderItem={({ item }) => {
                    return (<View style={signStyle.recoveryPhraseSet}>
                      <Text style={signStyle.recoveryPhraseIndex}>{item.key + 1}.</Text>
                      <TextInput
                        style={[signStyle.recoveryPhraseWord, {
                          backgroundColor: (item.word ? 'white' : '#F5F5F5'),
                          borderColor: '#0060F2',
                          borderWidth: (item.key === this.state.selectedIndex ? 1 : 0),
                        }]}
                        ref={(r) => { this.inputtedRefs[item.key] = r; }}
                        onChangeText={(text) => this.onChangeText(item.key, text)}
                        onFocus={() => this.onFocus(item.key)}
                        value={item.word}
                        autoCorrect={false}
                        autoCapitalize="none"
                        onSubmitEditing={() => this.onSubmitWord(item.word)}
                      />
                    </View>)
                  }}
                />
              </View>
            </View>
            <View style={signStyle.recoveryPhraseTestResult}>
              <Text style={[signStyle.recoveryPhraseTestTitle, { color: this.state.preCheckResult === PreCheckResults.success ? '#0060F2' : '#FF003C' }]}>
                {this.state.preCheckResult === PreCheckResults.success ? 'Success!' : (this.state.preCheckResult === PreCheckResults.error ? 'Wrong Recovery Phrase!' : '')}
              </Text>
              <Text style={[signStyle.recoveryPhraseTestMessage, { color: this.state.preCheckResult === PreCheckResults.success ? '#0060F2' : '#FF003C' }]}>
                {this.state.preCheckResult === PreCheckResults.success ? 'Keep your written copy private in a secure and safe location.' : (this.state.preCheckResult === PreCheckResults.error ? 'Please try again!' : '')}
              </Text>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>

        <TouchableOpacity style={[signStyle.submitButton, {
          backgroundColor: !this.state.remainWordNumber ? '#0060F2' : 'gray'
        }]} onPress={this.doSignIn} disabled={this.state.remainWordNumber > 0}>
          <Text style={[signStyle.submitButtonText]}>{this.state.preCheckResult || PreCheckResults.success}</Text>
        </TouchableOpacity>



        {this.state.keyboardHeight > 0 &&
          <Animated.View style={[signStyle.keyboardExternal, { bottom: this.state.keyboardExternalBottom, opacity: this.state.keyboardExternalOpacity, }]}>
            <TouchableOpacity style={signStyle.nextButton} onPress={() => this.selectIndex.bind(this)((this.state.selectedIndex + 1) % 24)}>
              <Image style={signStyle.nextButtonImage} source={require('./../../../../assets/imgs/arrow_down_enable.png')} />
            </TouchableOpacity>
            <TouchableOpacity style={signStyle.prevButton} onPress={() => this.selectIndex.bind(this)((this.state.selectedIndex + 23) % 24)}>
              <Image style={signStyle.prevButtonImage} source={require('./../../../../assets/imgs/arrow_up_enable.png')} />
            </TouchableOpacity>
            {this.state.dataSource && <View style={[signStyle.selectionList]}>
              <FlatList
                ref={(ref) => this.listViewElement = ref}
                keyboardShouldPersistTaps="handled"
                horizontal={true}
                extraData={this.state}
                data={this.state.dataSource}
                renderItem={({ item }) => {
                  return (<TouchableOpacity style={signStyle.selectionItem} onPress={() => this.onSubmitWord(item)}>
                    <Text style={[signStyle.selectionItemText, { color: this.state.currentInputtedText === item ? 'blue' : 'gray' }]}>{item}</Text>
                  </TouchableOpacity>)
                }}
              />
            </View>}
            <TouchableOpacity style={signStyle.doneButton} onPress={this.doCheck24Word.bind(this)} disabled={this.state.status !== statuses.done}>
              <Text style={[signStyle.doneButtonText, { color: this.state.status === statuses.done ? '#0060F2' : 'gray' }]}>{global.i18n.t("BitmarkAutoCompleteComponent_done")}</Text>
            </TouchableOpacity>
          </Animated.View>}


      </SafeAreaView>

    );
  }
}