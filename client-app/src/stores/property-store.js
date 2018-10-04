import { combineReducers, createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import { merge } from 'lodash';

const ACTION_TYPES = {
  RESET: 'RESET',
  INIT: 'INIT',
  ADD_MORE: 'ADD_MORE'
};

const PropertyActions = {
  reset: () => {
    return { type: ACTION_TYPES.RESET, };
  },
  init: ({ isTracking, asset, bitmark }) => {
    return { type: ACTION_TYPES.INIT, isTracking, asset, bitmark };
  },
};

const initialState = {
  isTracking: false,
  asset: null,
  bitmark: null,
};

const data = (state = initialState, action) => {
  switch (action.type) {
    case ACTION_TYPES.RESET:
      state = initialState;
      return merge({}, state);
    case ACTION_TYPES.INIT:
      state.isTracking = action.isTracking;
      state.asset = action.asset;
      state.bitmark = action.bitmark;
      return merge({}, state);
    default:
      return state;
  }
};
const reducer = combineReducers({ data });

const PropertyStore = createStore(reducer, applyMiddleware(thunk));

export {
  PropertyActions,
  PropertyStore
};
