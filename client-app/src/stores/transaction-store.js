import { combineReducers, createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';

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
  addMoreActionsRequired: (actionRequired) => {
    return { type: ACTION_TYPES.ADD_MORE, actionRequired };
  },
  addMoreCompleted: (completed) => {
    return { type: ACTION_TYPES.ADD_MORE, completed };
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
      return state;
    case ACTION_TYPES.INIT:
      state.appLoadingData = action.appLoadingData;

      state.totalActionRequired = action.totalActionRequired;
      state.actionRequired = action.actionRequired || state.actionRequired;

      state.totalCompleted = action.totalCompleted;
      state.completed = action.completed || state.completed;
      return state;
    case ACTION_TYPES.ADD_MORE_ACTION_REQUIRED:
      state.actionRequired = state.actionRequired.concat(action.actionRequired || []);
      return state;
    case ACTION_TYPES.ADD_MORE_COMPLETED:
      state.completed = state.completed.concat(action.completed || []);
      return state;
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
