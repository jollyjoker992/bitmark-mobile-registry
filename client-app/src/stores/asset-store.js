import { combineReducers, createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';

const ACTION_TYPES = {
  RESET: 'RESET',
  INIT: 'INIT',
  ADD_MORE: 'ADD_MORE'
};

const AssetActions = {
  reset: () => {
    return { type: ACTION_TYPES.RESET, };
  },
  init: ({ asset, bitmarks }) => {
    return { type: ACTION_TYPES.INIT, asset, bitmarks };
  },
};

const initialState = {
  asset: null,
  bitmarks: [],
};

const data = (state = initialState, action) => {
  switch (action.type) {
    case ACTION_TYPES.RESET:
      state = initialState;
      return state;
    case ACTION_TYPES.INIT:
      state.asset = action.asset;
      state.bitmarks = action.bitmarks || [];
      return state;
    default:
      return state;
  }
};
const reducer = combineReducers({ data });

const AssetStore = createStore(reducer, applyMiddleware(thunk));

export {
  AssetActions,
  AssetStore
};
