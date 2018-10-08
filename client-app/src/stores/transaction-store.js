import { combineReducers, createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import { merge } from 'lodash';

const ACTION_TYPES = {
  RESET: 'RESET',
  INIT: 'INIT',
  ADD_MORE_ACTION_REQUIRED: 'ADD_MORE_ACTION_REQUIRED',
  ADD_MORE_COMPLETED: 'ADD_MORE_COMPLETED',
};

const TransactionsActions = {
  reset: () => {
    return { type: ACTION_TYPES.RESET, };
  },
  init: ({ totalActionRequired, actionRequired, totalCompleted, completed, appLoadingData }) => {
    return { type: ACTION_TYPES.INIT, totalActionRequired, actionRequired, totalCompleted, completed, appLoadingData };
  },
};

const initialState = {
  totalActionRequired: 0,
  actionRequired: [],

  totalCompleted: 0,
  completed: [],
  appLoadingData: false,
};

const data = (state = initialState, action) => {
  switch (action.type) {
    case ACTION_TYPES.RESET:
      state = initialState;
      return merge({}, state);
    case ACTION_TYPES.INIT: {
      let tempState = merge({}, state);
      tempState.appLoadingData = action.appLoadingData;
      tempState.totalActionRequired = action.totalActionRequired;
      tempState.actionRequired = action.actionRequired || tempState.actionRequired;
      tempState.totalCompleted = action.totalCompleted;
      tempState.completed = action.completed || state.completed;
      return tempState;
    }
    default:
      return state;
  }
};
const reducer = combineReducers({ data });

const TransactionsStore = createStore(reducer, applyMiddleware(thunk));

export {
  TransactionsActions,
  TransactionsStore
};
