
import React from 'react';
import {
  Text, View, TouchableOpacity, KeyboardAvoidingView, TextInput, Image, FlatList, SafeAreaView, ScrollView, Animated,
  Keyboard,
  Platform,
  StatusBar,
} from 'react-native';
import signStyle from './sign-in.component.style';
import { Actions } from 'react-native-router-flux';
import { dictionaryPhraseWords, convertWidth } from 'src/utils';
import { AppProcessor } from 'src/processors';
import { defaultStyles } from 'src/views/commons';
import { constant } from 'src/configs';

let PreCheckResults = {
  success: 'SUBMIT',
  error: 'RETRY'
};

const statuses = {
  done: 'done',
  inputting: 'inputting'
};

export class SignInComponent extends React.Component {

  constructor(props) {
    super(props);
    this.onChangeText = this.onChangeText.bind(this);
    this.onFocus = this.onFocus.bind(this);
    this.onSubmitWord = this.onSubmitWord.bind(this);
    this.selectIndex = this.selectIndex.bind(this);
    this.checkStatusInputting = this.checkStatusInputting.bind(this);
    this.doCheck24Word = this.doCheck24Word.bind(this);
    this.submitPhraseWords = this.submitPhraseWords.bind(this);
    this.doSignIn = this.doSignIn.bind(this);

    let numberPhraseWords = 12;
    let smallerList = [];
    let biggerList = [];
    for (let index = 0; index < numberPhraseWords; index++) {
      if (index < (numberPhraseWords / 2)) {
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
      numberPhraseWords,
      remainWordNumber: numberPhraseWords,
      dataSource: dictionaryPhraseWords,
      keyboardHeight: 0,
      keyboardExternalBottom: new Animated.Value(0),
      keyboardExternalOpacity: new Animated.Value(0),
    };
    // setTimeout(this.checkStatusInputting, 200);
  }

  onChangeText(index, text) {
    text = text ? text.trim() : '';
    this.doFilter(text);
    if (index < (this.state.numberPhraseWords / 2)) {
      let inputtedWords = this.state.smallerList;
      inputtedWords[index].word = text;
      this.setState({ smallerList: inputtedWords });
    } else {
      let inputtedWords = this.state.biggerList;
      inputtedWords[index - (this.state.numberPhraseWords / 2)].word = text;
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
    let dataSource = dictionaryPhraseWords.filter(word => word.toLowerCase().indexOf(text.toLowerCase()) === 0);
    this.setState({ dataSource, currentInputtedText: text });
  }

  onFocus(index) {
    this.setState({
      selectedIndex: index
    });
    let text = index < (this.state.numberPhraseWords / 2) ? this.state.smallerList[index].word : this.state.biggerList[index - (this.state.numberPhraseWords / 2)].word;
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
      if (selectedIndex < (this.state.numberPhraseWords / 2)) {
        let inputtedWords = this.state.smallerList;
        inputtedWords[selectedIndex].word = word;
        this.setState({ smallerList: inputtedWords });
      } else {
        let inputtedWords = this.state.biggerList;
        inputtedWords[selectedIndex - (this.state.numberPhraseWords / 2)].word = word;
        this.setState({ biggerList: inputtedWords });
      }
    }
    this.selectIndex((selectedIndex + 1) % this.state.numberPhraseWords);
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
    let status = countNumberInputtedWord === this.state.numberPhraseWords ? statuses.done : statuses.inputting;
    this.setState({
      preCheckResult: null,
      remainWordNumber: this.state.numberPhraseWords - countNumberInputtedWord,
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
        AppProcessor.doCheckPhraseWords(inputtedWords).then(() => {
          this.setState({ preCheckResult: PreCheckResults.success });
          resolve(true);
        }).catch((error) => {
          resolve(false);
          console.log('checkPhraseWords error: ', error);
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
        Actions.faceTouchId({ doContinue: this.submitPhraseWords });
      }
    });
  }

  async submitPhraseWords(enableTouchId) {
    if (this.state.preCheckResult === PreCheckResults.error) {
      this.doReset();
      return;
    }
    let inputtedWords = [];
    this.state.smallerList.forEach(item => inputtedWords.push(item.word));
    this.state.biggerList.forEach(item => inputtedWords.push(item.word));
    let user = await AppProcessor.doLogin(inputtedWords, enableTouchId);
    if (!user) {
      return;
    }
    return { user, justCreatedBitmarkAccount: false };
  }

  doReset(numberPhraseWords) {
    numberPhraseWords = numberPhraseWords || this.state.numberPhraseWords;
    let smallerList = [];
    let biggerList = [];
    for (let index = 0; index < numberPhraseWords; index++) {
      if (index < (numberPhraseWords / 2)) {
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
      remainWordNumber: numberPhraseWords,
    });
  }

  changeNumberPhraseWord() {
    let numberPhraseWords = this.state.numberPhraseWords === 12 ? 24 : 12
    this.setState({ numberPhraseWords });
    this.doReset(numberPhraseWords);
  }

  render() {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#F5F5F5' }}>

        <View style={[defaultStyles.header, { backgroundColor: '#F5F5F5', height: constant.headerSize.height }]} onPress={Keyboard.dismiss}>
          <StatusBar hidden={false} />
          <TouchableOpacity style={[defaultStyles.headerLeft, { width: 50 }]} onPress={Actions.pop}>
            <Image style={defaultStyles.headerLeftIcon} source={require('assets/imgs/header_blue_icon.png')} />
          </TouchableOpacity>
          <Text style={[defaultStyles.headerTitle, { maxWidth: convertWidth(375) - 100 }]}>{global.i18n.t("SignInComponent_headerTitle")}</Text>
          <TouchableOpacity style={[defaultStyles.headerRight, { width: 50 }]}>
          </TouchableOpacity>
        </View>
        <KeyboardAvoidingView behavior={Platform.select({ ios: 'padding', android: '' })} enabled style={{ flex: 1, }}  >
          <ScrollView style={signStyle.mainContent} contentContainerStyle={{ flexGrow: 1 }}>
            <Text style={[signStyle.writeRecoveryPhraseContentMessage,]}>{global.i18n.t("SignInComponent_writeRecoveryPhraseContentMessage", { number: this.state.numberPhraseWords })}</Text>
            <View style={[signStyle.writeRecoveryPhraseArea]}>
              <View style={signStyle.writeRecoveryPhraseContentHalfList}>
                <FlatList data={this.state.smallerList}
                  keyExtractor={(item) => item.key}
                  scrollEnabled={false}
                  extraData={this.state}
                  renderItem={({ item }) => {
                    return (<View style={signStyle.recoveryPhraseSet}>
                      <Text style={signStyle.recoveryPhraseIndex}>{item.key + 1}.</Text>
                      <TextInput
                        autoComplete='off'
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
                  keyExtractor={(item) => item.key}
                  scrollEnabled={false}
                  extraData={this.state}
                  renderItem={({ item }) => {
                    return (<View style={signStyle.recoveryPhraseSet}>
                      <Text style={signStyle.recoveryPhraseIndex}>{item.key + 1}.</Text>
                      <TextInput
                        autoComplete='off'
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
                {this.state.preCheckResult === PreCheckResults.success ? global.i18n.t("SignInComponent_resultSuccess")
                  : (this.state.preCheckResult === PreCheckResults.error ? global.i18n.t("SignInComponent_resultWrong") : '')}
              </Text>
              <Text style={[signStyle.recoveryPhraseTestMessage, { color: this.state.preCheckResult === PreCheckResults.success ? '#0060F2' : '#FF003C' }]}>
                {this.state.preCheckResult === PreCheckResults.success ? global.i18n.t("SignInComponent_resultSuccessMessage")
                  : (this.state.preCheckResult === PreCheckResults.error ? global.i18n.t("SignInComponent_resultWrongMessage") : '')}
              </Text>
            </View>
          </ScrollView>

          {this.state.keyboardHeight === 0 && <TouchableOpacity style={signStyle.switchFormMessageButton} onPress={this.changeNumberPhraseWord.bind(this)}>
            <Text style={[signStyle.switchFormMessage,]}>{i18n.t('SignInComponent_switchFormMessage', { number: this.state.numberPhraseWords === 12 ? 24 : 12 })}</Text>
          </TouchableOpacity>}

          {this.state.keyboardHeight === 0 && <TouchableOpacity style={[signStyle.submitButton, {
            backgroundColor: !this.state.remainWordNumber ? '#0060F2' : 'gray'
          }]} onPress={this.doSignIn} disabled={this.state.remainWordNumber > 0}>
            <Text style={[signStyle.submitButtonText]}>{this.state.preCheckResult === PreCheckResults.error
              ? i18n.t('SignInComponent_submitButtonTextWrong')
              : i18n.t('SignInComponent_submitButtonTextSuccess')}</Text>
          </TouchableOpacity>}



          {this.state.keyboardHeight > 0 &&
            <Animated.View style={[signStyle.keyboardExternal, { opacity: this.state.keyboardExternalOpacity, }]}>
              <TouchableOpacity style={signStyle.nextButton} onPress={() => this.selectIndex.bind(this)((this.state.selectedIndex + 1) % 24)}>
                <Image style={signStyle.nextButtonImage} source={require('assets/imgs/arrow_down_enable.png')} />
              </TouchableOpacity>
              <TouchableOpacity style={signStyle.prevButton} onPress={() => this.selectIndex.bind(this)((this.state.selectedIndex + 23) % 24)}>
                <Image style={signStyle.prevButtonImage} source={require('assets/imgs/arrow_up_enable.png')} />
              </TouchableOpacity>
              {this.state.dataSource && <View style={[signStyle.selectionList]}>
                <FlatList
                  keyExtractor={(item, index) => index}
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
                <Text style={[signStyle.doneButtonText, { color: this.state.status === statuses.done ? '#0060F2' : 'gray' }]}>{global.i18n.t("SignInComponent_doneInput")}</Text>
              </TouchableOpacity>
            </Animated.View>}
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }
}