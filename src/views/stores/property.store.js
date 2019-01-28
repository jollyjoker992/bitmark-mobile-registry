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
  init: ({ asset, bitmark, claimToAccount }) => {
    return { type: ACTION_TYPES.INIT, asset, bitmark, claimToAccount };
  },
};

const initialState = {
  asset: null,
  bitmark: null,
  claimToAccount: false,
};

const data = (state = initialState, action) => {
  switch (action.type) {
    case ACTION_TYPES.RESET:
      return merge({}, initialState);
    case ACTION_TYPES.INIT: {
      let tempState = merge({}, state);
      tempState.asset = action.asset;
      tempState.bitmark = action.bitmark;
      tempState.claimToAccount = action.claimToAccount;
      return tempState;
    }
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
