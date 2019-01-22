import { combineReducers, createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import { merge } from 'lodash';

const ACTION_TYPES = {
  RESET: 'RESET',
  INIT: 'INIT',
  ADD_MORE: 'ADD_MORE'
};

const PropertyActionSheetActions = {
  reset: () => {
    return { type: ACTION_TYPES.RESET, };
  },
  init: ({ asset, bitmark, fromPropertyDetail }) => {
    return { type: ACTION_TYPES.INIT, asset, bitmark, fromPropertyDetail };
  },
};

const initialState = {
  asset: null,
  bitmark: null,
  fromPropertyDetail: false,
};

const data = (state = initialState, action) => {
  switch (action.type) {
    case ACTION_TYPES.RESET:
      return merge({}, initialState);
    case ACTION_TYPES.INIT: {
      let tempState = merge({}, state);
      tempState.asset = action.asset;
      tempState.bitmark = action.bitmark;
      tempState.fromPropertyDetail = !!action.fromPropertyDetail;
      return tempState;
    }
    default:
      return state;
  }
};
const reducer = combineReducers({ data });

const PropertyActionSheetStore = createStore(reducer, applyMiddleware(thunk));

export {
  PropertyActionSheetActions,
  PropertyActionSheetStore
};
