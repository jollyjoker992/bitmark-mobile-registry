

import { combineReducers, createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';

const ACTION_TYPES = {
  RESET: 'RESET',
  INIT: 'INIT',
};

const BottomTabActions = {
  reset: () => {
    return { type: ACTION_TYPES.RESET, };
  },
  init: ({ existNewAsset, totalTasks, existNewTracking }) => {
    return { type: ACTION_TYPES.INIT, existNewAsset, totalTasks, existNewTracking };
  },
};

const initialState = {
  existNewAsset: false,
  totalTasks: 0,
  existNewTracking: false,
};

const data = (state = initialState, action) => {
  switch (action.type) {
    case ACTION_TYPES.RESET:
      state = initialState;
      return state;
    case ACTION_TYPES.INIT:
      state.existNewAsset = action.existNewAsset;
      state.totalTasks = action.totalTasks;
      state.existNewTracking = action.existNewTracking;
      return state;
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
