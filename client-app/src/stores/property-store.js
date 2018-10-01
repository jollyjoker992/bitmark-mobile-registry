import { combineReducers, createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';

const ACTION_TYPES = {
  RESET: 'RESET',
  INIT: 'INIT',
  ADD_MORE: 'ADD_MORE'
};

const PropertyActions = {
  reset: () => {
    return { type: ACTION_TYPES.RESET, };
  },
  init: ({ isTracking, asset, bitmark, provenance }) => {
    return { type: ACTION_TYPES.INIT, isTracking, asset, bitmark, provenance };
  },
};

const initialState = {
  isTracking: false,
  asset: null,
  bitmark: null,
  provenance: [],
};

const data = (state = initialState, action) => {
  switch (action.type) {
    case ACTION_TYPES.RESET:
      state = initialState;
      return state;
    case ACTION_TYPES.INIT:
      state.isTracking = action.isTracking;
      state.provenance = action.provenance;
      state.asset = action.asset;
      state.bitmark = action.bitmark;
      return state;
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
