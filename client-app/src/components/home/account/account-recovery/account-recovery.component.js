import React from 'react';
import PropTypes from 'prop-types';
import { StackNavigator } from 'react-navigation';
import {
  View, Text, TouchableOpacity, Image, FlatList, ScrollView,
} from 'react-native';

import { UserModel } from "./../../../../models";
import { AppProcessor } from './../../../../processors';

import accountRecoveryStyle from './account-recovery.component.style';
import defaultStyle from './../../../../commons/styles';
import { convertWidth } from '../../../../utils';
import {DataProcessor} from "../../../../processors";

let currentUser;
class RecoveryPhraseComponent extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    let isSignOut = (this.props.screenProps && this.props.screenProps.accountNavigation.state.params.isSignOut);
    const recoveryPhrase = () => {
      AppProcessor.doGetCurrentAccount(global.i18n.t("RecoveryPhraseComponent_authorizeAccessToYourRecoveryPhrase")).then((user) => {
        if (user) {
          currentUser = user;
          this.props.navigation.navigate('WriteDownRecoveryPhrase');
        }
      }).catch(error => {
        console.log('recoveryPhrase error :', error);
      });
    };
    return (
      <View style={accountRecoveryStyle.body}>
        <View style={[accountRecoveryStyle.header]}>
          <TouchableOpacity style={defaultStyle.headerLeft} onPress={() => { this.props.screenProps.accountNavigation.goBack() }}>
            <Image style={defaultStyle.headerLeftIcon} source={require('./../../../../../assets/imgs/header_blue_icon.png')} />
          </TouchableOpacity>
          <Text style={defaultStyle.headerTitle}>{isSignOut ? global.i18n.t("RecoveryPhraseComponent_removeAccess") : global.i18n.t("RecoveryPhraseComponent_recoveryPhrase")}</Text>
          <TouchableOpacity style={defaultStyle.headerRight} onPress={() => { this.props.screenProps.accountNavigation.goBack() }} disabled={isSignOut}>
            {!isSignOut && <Text style={defaultStyle.headerRightText}>{global.i18n.t("RecoveryPhraseComponent_cancel")}</Text>}
          </TouchableOpacity>
        </View>
        <ScrollView style={accountRecoveryStyle.recoveryPhraseContent}>
          <Image style={accountRecoveryStyle.recoveryPhraseWarningIcon} source={require('./../../../../../assets/imgs/backup_warning.png')} />
          {!isSignOut && <Text style={accountRecoveryStyle.recoveryDescription}>{global.i18n.t("RecoveryPhraseComponent_recoveryDescription1")}</Text>}

          {isSignOut && <Text style={accountRecoveryStyle.recoveryDescription}>{global.i18n.t("RecoveryPhraseComponent_recoveryDescription2")}</Text>}
        </ScrollView>
        <TouchableOpacity style={accountRecoveryStyle.recoveryPhraseBottomButton} onPress={() => recoveryPhrase()}>
          <Text style={accountRecoveryStyle.recoveryPhraseBottomButtonText}>{global.i18n.t("RecoveryPhraseComponent_writeDownRecoveryPhrase")}</Text>
        </TouchableOpacity>
      </View>

    );
  }
}
RecoveryPhraseComponent.propTypes = {
  navigation: PropTypes.shape({
    state: PropTypes.shape({
      key: PropTypes.string,
    }),
    goBack: PropTypes.func,
    navigate: PropTypes.func,
  }),
  screenProps: PropTypes.shape({
    recoveryPhrase: PropTypes.func,
    accountNavigation: PropTypes.shape({
      goBack: PropTypes.func,
      navigate: PropTypes.func,
      state: PropTypes.shape({
        params: PropTypes.shape({
          isSignOut: PropTypes.bool,
        }),
      }),
    }),
  }),
};

class WriteDownRecoveryPhraseComponent extends React.Component {
  constructor(props) {
    super(props);
    let userInfo = currentUser;
    console.log('currentUser :', currentUser);
    let smallerList = [];
    let biggerList = [];
    for (let index in userInfo.phrase24Words) {
      if (index < 12) {
        smallerList.push({ key: index, word: userInfo.phrase24Words[index] });
      } else {
        biggerList.push({ key: index, word: userInfo.phrase24Words[index] });
      }
    }
    this.state = { smallerList: smallerList, biggerList: biggerList };

  }
  render() {
    let isSignOut = (this.props.screenProps && this.props.screenProps.accountNavigation.state.params.isSignOut);
    return (
      <View style={accountRecoveryStyle.body}>
        <View style={[accountRecoveryStyle.header]}>
          <TouchableOpacity style={[defaultStyle.headerLeft, { width: 40 }]} onPress={() => { this.props.navigation.goBack() }}>
            <Image style={defaultStyle.headerLeftIcon} source={require('./../../../../../assets/imgs/header_blue_icon.png')} />
          </TouchableOpacity>
          <Text style={[defaultStyle.headerTitle, { maxHeight: convertWidth(375) - 80 }]}>{isSignOut ? global.i18n.t("WriteDownRecoveryPhraseComponent_writeDownRecoveryPhrase") : global.i18n.t("WriteDownRecoveryPhraseComponent_recoveryPhrase")}</Text>
          <TouchableOpacity style={[defaultStyle.headerRight, { width: 40 }]} />
        </View>
        <ScrollView style={accountRecoveryStyle.recoveryPhraseContent}>
          {!isSignOut && <Text style={accountRecoveryStyle.writeRecoveryPhraseContentMessage}>{global.i18n.t("WriteDownRecoveryPhraseComponent_writeRecoveryPhraseContentMessage1")}</Text>}
          {isSignOut && <Text style={accountRecoveryStyle.writeRecoveryPhraseContentMessage}>{global.i18n.t("WriteDownRecoveryPhraseComponent_writeRecoveryPhraseContentMessage2")}</Text>}
          <View style={accountRecoveryStyle.writeRecoveryPhraseContentList}>
            <View style={accountRecoveryStyle.writeRecoveryPhraseContentHalfList}>
              <FlatList data={this.state.smallerList}
                scrollEnabled={false}
                extraData={this.state.smallerList}
                renderItem={({ item }) => {
                  return (
                    <View style={accountRecoveryStyle.recoveryPhraseSet}>
                      <Text style={accountRecoveryStyle.recoveryPhraseIndex}>{parseInt(item.key) + 1}.</Text>
                      <Text style={accountRecoveryStyle.recoveryPhraseWord}>{item.word}</Text>
                    </View>
                  )
                }}
              />
            </View>
            <View style={[accountRecoveryStyle.writeRecoveryPhraseContentHalfList, { marginLeft: 15, }]}>
              <FlatList data={this.state.biggerList}
                scrollEnabled={false}
                extraData={this.state.biggerList}
                renderItem={({ item }) => {
                  return (
                    <View style={accountRecoveryStyle.recoveryPhraseSet}>
                      <Text style={accountRecoveryStyle.recoveryPhraseIndex}>{parseInt(item.key) + 1}.</Text>
                      <Text style={accountRecoveryStyle.recoveryPhraseWord}>{item.word}</Text>
                    </View>
                  )
                }}
              />
            </View>
          </View>
        </ScrollView>
        {!isSignOut && <TouchableOpacity style={accountRecoveryStyle.recoveryPhraseBottomButton} onPress={() => {
          this.props.navigation.navigate('TryRecovery')
        }}>
          <Text style={accountRecoveryStyle.recoveryPhraseBottomButtonText}>{global.i18n.t("WriteDownRecoveryPhraseComponent_testRecoveryPhrase")} »</Text>
        </TouchableOpacity>}
        <TouchableOpacity style={[accountRecoveryStyle.recoveryPhraseBottomButton, !isSignOut ? { backgroundColor: '#F2FAFF', } : {}]} onPress={() => {
          if (isSignOut) {
            this.props.navigation.navigate('TryRecovery', );
          } else {
            DataProcessor.doRemoveTestRecoveryPhaseActionRequiredIfAny();
            this.props.screenProps.accountNavigation.goBack();
          }
        }}>
          <Text style={[accountRecoveryStyle.recoveryPhraseBottomButtonText, !isSignOut ? { color: '#0060F2' } : {}]}>{global.i18n.t("WriteDownRecoveryPhraseComponent_done")}</Text>
        </TouchableOpacity>
      </View>
    );
  }
}

WriteDownRecoveryPhraseComponent.propTypes = {
  navigation: PropTypes.shape({
    navigate: PropTypes.func,
    goBack: PropTypes.func,
    state: PropTypes.shape({
      key: PropTypes.string,
      params: PropTypes.shape({
        result: PropTypes.array,
        user: PropTypes.object,
      })
    }),
  }),
  screenProps: PropTypes.shape({
    accountNavigation: PropTypes.shape({
      goBack: PropTypes.func,
      navigate: PropTypes.func,
      state: PropTypes.shape({
        params: PropTypes.shape({
          isSignOut: PropTypes.bool,
        }),
      }),
    }),
  }),
};

class TryRecoveryPhraseComponent extends React.Component {
  constructor(props) {
    super(props);
    this.nextSelectedIndex = this.nextSelectedIndex.bind(this);
    this.selectRandomWord = this.selectRandomWord.bind(this);
    this.resetSelectedWord = this.resetSelectedWord.bind(this);
    this.doAfterInputtedAllWord = this.doAfterInputtedAllWord.bind(this);

    let smallerList = [];
    let biggerList = [];
    for (let index = 0; index < 24; index++) {
      if (index < 12) {
        smallerList.push({ key: index });
      } else {
        biggerList.push({ key: index });
      }
    }
    UserModel.doGetCurrentUser().then(user => {
      let result = [];
      for (let index in currentUser.phrase24Words) {
        result.push({ key: index, word: currentUser.phrase24Words[index] });
      }
      let randomWords = [];
      for (let index = 0; index < 24; index++) {
        randomWords.push({
          key: result[index].key,
          word: result[index].word
        });
      }
      for (let i = 0; i < randomWords.length; i++) {
        let temp = randomWords[i];
        let chooseIndex = i;
        for (let j = i + 1; j < randomWords.length; j++) {
          if (temp.word > randomWords[j].word) {
            chooseIndex = j;
            temp = randomWords[j];
          }
        }
        if (chooseIndex !== i) {
          randomWords[chooseIndex] = randomWords[i];
          randomWords[i] = temp;
        }
      }
      let countPreFill = 0;
      let smallerList = this.state.smallerList;
      let biggerList = this.state.biggerList;
      let numberWorldFilled = 20;
      while (countPreFill < numberWorldFilled) {
        let randomIndex = Math.floor(Math.random() * randomWords.length);
        if (!randomWords[randomIndex].selected) {
          let originalIndex = 0;
          randomWords[randomIndex].selected = true;
          randomWords[randomIndex].cannotReset = true;
          for (let index = 0; index < result.length; index++) {
            if (result[index].key === randomWords[randomIndex].key) {
              originalIndex = index;
              break;
            }
          }
          if (originalIndex < 12) {
            smallerList[originalIndex].word = randomWords[randomIndex].word;
            smallerList[originalIndex].randomIndex = randomIndex;
            smallerList[originalIndex].cannotReset = true;
          } else {
            biggerList[originalIndex - 12].word = randomWords[randomIndex].word;
            biggerList[originalIndex - 12].randomIndex = randomIndex;
            biggerList[originalIndex - 12].cannotReset = true;
          }
          countPreFill++;
        }
      }
      this.setState({
        user: user,
        randomWords: randomWords,
        biggerList: biggerList,
        smallerList: smallerList,
        selectedIndex: this.nextSelectedIndex(-1),
      });
    }).catch(error => console.log('get current user error :', error));

    this.state = {
      testResult: '',
      smallerList: smallerList,
      biggerList: biggerList,
      selectedIndex: 0,
    };
  }

  nextSelectedIndex(currentSelectedIndex) {
    let index = (currentSelectedIndex + 1) % 24;
    while (index != currentSelectedIndex) {
      if ((index < 12 && !this.state.smallerList[index].word) || (index >= 12 && !this.state.biggerList[index - 12].word)) {
        return index
      }
      index = (index + 1) % 24;
    }
    let inputtedWords = [];
    let temp = this.state.smallerList.concat(this.state.biggerList);
    for (let i = 0; i < temp.length; i++) {
      inputtedWords.push(temp[i].word);
    }
    AppProcessor.doCheck24Words(inputtedWords).then((user) => {
      if (this.state.user.bitmarkAccountNumber === user.bitmarkAccountNumber) {
        this.setState({ testResult: 'done' });
      } else {
        this.setState({ testResult: 'retry' });
      }
    }).catch(error => {
      this.setState({ testResult: 'retry' });
      console.log('testRecoveryPhrase error:', error);
    });
    return -1;
  }

  selectRandomWord(item, index) {
    let randomWords = this.state.randomWords;
    randomWords[index].selected = true;
    let selectedIndex = this.state.selectedIndex;
    if (selectedIndex < 12) {
      let inputtedWords = this.state.smallerList;
      inputtedWords[selectedIndex].word = item.word;
      inputtedWords[selectedIndex].randomIndex = index;
      this.setState({
        smallerList: inputtedWords, selectedIndex: this.nextSelectedIndex(selectedIndex),
        randomWords: randomWords,
      });
    } else {
      let inputtedWords = this.state.biggerList;
      inputtedWords[selectedIndex - 12].word = item.word;
      inputtedWords[selectedIndex - 12].randomIndex = index;
      this.setState({
        biggerList: inputtedWords, selectedIndex: this.nextSelectedIndex(selectedIndex),
        randomWords: randomWords,
      });
    }
  }

  resetSelectedWord(item) {
    if (item.cannotReset) {
      return;
    }
    if (!item.word) {
      this.setState({ selectedIndex: item.key });
    }
    this.setState({ testResult: '' });
    let randomWords = this.state.randomWords;
    let randomIndex = item.randomIndex;
    if (!isNaN(randomIndex) && randomIndex >= 0) {
      randomWords[randomIndex].selected = false;
    }
    if (item.key < 12) {
      let inputtedWords = this.state.smallerList;
      inputtedWords[item.key].word = '';
      inputtedWords[item.key].randomIndex = -1;
      this.setState({ smallerList: inputtedWords, selectedIndex: item.key, randomWords: randomWords });
    } else {
      let inputtedWords = this.state.biggerList;
      inputtedWords[item.key - 12].word = '';
      inputtedWords[item.key - 12].randomIndex = -1;
      this.setState({ biggerList: inputtedWords, selectedIndex: item.key, randomWords: randomWords });
    }
  }
  doAfterInputtedAllWord() {
    if (this.state.testResult === 'done') {
      if (this.props.screenProps && this.props.screenProps.accountNavigation.state.params.isSignOut) {
        this.props.screenProps.logout();
      } else {
        this.props.screenProps.accountNavigation.goBack();
      }
      DataProcessor.doRemoveTestRecoveryPhaseActionRequiredIfAny();
    } else {
      let smallerList = this.state.smallerList;
      smallerList.forEach(item => {
        if (!item.cannotReset) {
          item.word = '';
          item.randomIndex = -1;
        }
      });
      let biggerList = this.state.biggerList;
      biggerList.forEach(item => {
        if (!item.cannotReset) {
          item.word = '';
          item.randomIndex = -1;
        }
      });
      let randomWords = this.state.randomWords;
      randomWords.forEach(item => {
        if (!item.cannotReset) {
          item.selected = false;
        }
      });
      this.setState({
        smallerList: smallerList,
        biggerList: biggerList,
        randomWords: randomWords,
        selectedIndex: this.nextSelectedIndex(-1),
        testResult: '',
      });
    }
  }

  render() {
    let isSignOut = (this.props.screenProps && this.props.screenProps.accountNavigation.state.params.isSignOut);
    let remainRandomWords = [];
    (this.state.randomWords || []).forEach((item, index) => {
      if (!item.cannotReset) {
        let tempItem = Object.assign({}, item);
        tempItem.index = index;
        remainRandomWords.push(tempItem);
      }
    })
    return (
      <View style={accountRecoveryStyle.body}>
        <View style={[accountRecoveryStyle.header]}>
          <TouchableOpacity style={defaultStyle.headerLeft} />
          <Text style={defaultStyle.headerTitle}>{global.i18n.t("TryRecoveryPhraseComponent_testRecoveryPhrase")}</Text>
          <TouchableOpacity style={defaultStyle.headerRight} onPress={() => this.props.screenProps.accountNavigation.goBack()} >
            <Text style={defaultStyle.headerRightText}>{global.i18n.t("TryRecoveryPhraseComponent_cancel")}</Text>
          </TouchableOpacity>
        </View>
        <ScrollView style={accountRecoveryStyle.recoveryPhraseContent}>
          <Text style={accountRecoveryStyle.writeRecoveryPhraseContentMessage}>{global.i18n.t("TryRecoveryPhraseComponent_writeRecoveryPhraseContentMessage")}</Text>
          <View style={accountRecoveryStyle.writeRecoveryPhraseContentList}>
            <View style={accountRecoveryStyle.writeRecoveryPhraseContentHalfList}>
              <FlatList data={this.state.smallerList}
                scrollEnabled={false}
                extraData={this.state}
                renderItem={({ item, index }) => {
                  return (
                    <View style={accountRecoveryStyle.recoveryPhraseSet}>
                      <Text style={accountRecoveryStyle.recoveryPhraseIndex}>{parseInt(item.key) + 1}.</Text>
                      <TouchableOpacity onPress={() => this.resetSelectedWord(item, index)}>
                        <Text style={[accountRecoveryStyle.recoveryPhraseWord, {
                          backgroundColor: (item.word ? 'white' : '#F5F5F5'),
                          height: (item.word ? 'auto' : 14),
                          color: (this.state.testResult === 'done' ? '#0060F2' : (this.state.testResult ? '#FF003C' : (item.cannotReset ? '#828282' : '#0060F2'))),
                          borderColor: '#0060F2',
                          borderWidth: (item.key === this.state.selectedIndex ? 1 : 0),
                        }]}>{item.word}</Text>
                      </TouchableOpacity>
                    </View>
                  )
                }}
              />
            </View>
            <View style={[accountRecoveryStyle.writeRecoveryPhraseContentHalfList, { marginLeft: 15, }]}>
              <FlatList data={this.state.biggerList}
                scrollEnabled={false}
                extraData={this.state}
                renderItem={({ item, index }) => {
                  return (
                    <View style={accountRecoveryStyle.recoveryPhraseSet}>
                      <Text style={accountRecoveryStyle.recoveryPhraseIndex}>{parseInt(item.key) + 1}.</Text>
                      <TouchableOpacity onPress={() => this.resetSelectedWord(item, index)}>
                        <Text style={[accountRecoveryStyle.recoveryPhraseWord, {
                          backgroundColor: (item.word ? 'white' : '#F5F5F5'),
                          height: (item.word ? 'auto' : 14),
                          color: (this.state.testResult === 'done' ? '#0060F2' : (this.state.testResult ? '#FF003C' : (item.cannotReset ? '#828282' : '#0060F2'))),
                          borderColor: '#0060F2',
                          borderWidth: (item.key === this.state.selectedIndex ? 1 : 0),
                        }]}>{item.word}</Text>
                      </TouchableOpacity>
                    </View>
                  )
                }}
              />
            </View>
          </View>
          {this.state.testResult.length === 0 && <View style={accountRecoveryStyle.ranDomWordsArea}>
            <FlatList data={remainRandomWords}
              scrollEnabled={false}
              horizontal={false}
              numColumns={4}
              contentContainerStyle={{ flexDirection: 'column' }}
              extraData={this.state}
              renderItem={({ item }) => {
                if (!item.cannotReset) {
                  return (
                    <View style={accountRecoveryStyle.recoveryPhraseChoose}>
                      {<TouchableOpacity style={[accountRecoveryStyle.recoveryPhraseChooseButton, {
                        borderColor: item.selected ? 'white' : '#0060F2',
                      }]} disabled={item.selected}
                        onPress={() => this.selectRandomWord(item, item.index)}
                      >
                        <Text style={[accountRecoveryStyle.recoveryPhraseChooseButtonText, {
                          color: item.selected ? 'white' : 'black'
                        }]}>{item.word}</Text>
                      </TouchableOpacity>}
                    </View>
                  )
                }
              }}
            />
          </View>}
        </ScrollView>
        {this.state.testResult === 'done' && <View style={accountRecoveryStyle.recoveryPhraseTestResult}>
          <Text style={accountRecoveryStyle.recoveryPhraseTestTitle}>{global.i18n.t("TryRecoveryPhraseComponent_success")}</Text>
          <Text style={accountRecoveryStyle.recoveryPhraseTestMessage}>{global.i18n.t("TryRecoveryPhraseComponent_recoveryPhraseTestMessage")}</Text>
        </View>}
        {this.state.testResult === 'retry' && <View style={accountRecoveryStyle.recoveryPhraseTestResult}>
          <Text style={[accountRecoveryStyle.recoveryPhraseTestTitle, { color: '#FF003C' }]}>{global.i18n.t("TryRecoveryPhraseComponent_error")}</Text>
          <Text style={[accountRecoveryStyle.recoveryPhraseTestMessage, { color: '#FF003C' }]}>{global.i18n.t("TryRecoveryPhraseComponent_pleaseTryAgain")}</Text>
        </View>}
        {this.state.testResult.length > 0 && <TouchableOpacity style={accountRecoveryStyle.recoveryPhraseBottomButton}
          onPress={() => this.doAfterInputtedAllWord()}>
          <Text style={accountRecoveryStyle.recoveryPhraseBottomButtonText}>{((this.state.testResult === 'done' && isSignOut ? global.i18n.t("TryRecoveryPhraseComponent_removeAccess") : global.i18n.t(`TryRecoveryPhraseComponent_${this.state.testResult}`))).toUpperCase()}</Text>
        </TouchableOpacity>}
      </View>
    );
  }
}

TryRecoveryPhraseComponent.propTypes = {
  navigation: PropTypes.shape({
    navigate: PropTypes.func,
    goBack: PropTypes.func,
    state: PropTypes.shape({
      key: PropTypes.string,
    }),
  }),
  screenProps: PropTypes.shape({
    logout: PropTypes.func,
    accountNavigation: PropTypes.shape({
      goBack: PropTypes.func,
      navigate: PropTypes.func,
      state: PropTypes.shape({
        params: PropTypes.shape({
          isSignOut: PropTypes.bool,
        }),
      }),
    }),
  }),
};

let AccountRecoveryDetailComponent = StackNavigator({
  RecoveryPhrase: { screen: RecoveryPhraseComponent, },
  WriteDownRecoveryPhrase: { screen: WriteDownRecoveryPhraseComponent, },
  TryRecovery: { screen: TryRecoveryPhraseComponent, },
}, {
    headerMode: 'none',
    navigationOptions: {
      gesturesEnabled: false,
    }, cardStyle: {
      shadowOpacity: 0,
    }
  }
);

export class AccountRecoveryComponent extends React.Component {
  render() {
    return (<View style={accountRecoveryStyle.body}>
      <AccountRecoveryDetailComponent screenProps={{
        accountNavigation: this.props.navigation,
        logout: this.props.screenProps.logout,
      }} />
    </View>);
  }
}

AccountRecoveryComponent.propTypes = {
  navigation: PropTypes.shape({}),
  screenProps: PropTypes.shape({
    logout: PropTypes.func,
  }),
};