

import { combineReducers, createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import { merge } from 'lodash';

const ACTION_TYPES = {
  RESET: 'RESET',
  INIT: 'INIT',
};

const BottomTabActions = {
  reset: () => {
    return { type: ACTION_TYPES.RESET, };
  },
  init: ({ existNewAsset, totalTasks, mainTab }) => {
    return { type: ACTION_TYPES.INIT, existNewAsset, totalTasks, mainTab };
  },
};

const initialState = {
  existNewAsset: false,
  totalTasks: 0,
  mainTab: null,
};

const data = (state = initialState, action) => {
  switch (action.type) {
    case ACTION_TYPES.RESET:
      return merge({}, initialState);
    case ACTION_TYPES.INIT:
      return merge({}, state, action);
    default:
      return state;
  }
};
const reducer = combineReducers({ data });

const BottomTabStore = createStore(reducer, applyMiddleware(thunk));

export {
  BottomTabActions,
  BottomTabStore
};
