import { combineReducers, createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import { merge } from 'lodash';

const ACTION_TYPES = {
  RESET: 'RESET',
  INIT: 'INIT',
};

const AccountActions = {
  reset: () => {
    return { type: ACTION_TYPES.RESET, };
  },
  init: ({ iftttInformation, appLoadingData, userInformation }) => {
    return { type: ACTION_TYPES.INIT, iftttInformation, appLoadingData, userInformation };
  },
};

const initialState = {
  iftttInformation: null,
  appLoadingData: false,
  userInformation: null,
};

const data = (state = initialState, action) => {
  switch (action.type) {
    case ACTION_TYPES.RESET:
      state = initialState;
      return merge({}, state);
    case ACTION_TYPES.INIT:
      state.iftttInformation = action.iftttInformation;
      state.appLoadingData = action.appLoadingData;
      state.userInformation = action.userInformation;
      return merge({}, state);
    default:
      return state;
  }
};
const reducer = combineReducers({ data });

const AccountStore = createStore(reducer, applyMiddleware(thunk));

export {
  AccountActions,
  AccountStore
};
