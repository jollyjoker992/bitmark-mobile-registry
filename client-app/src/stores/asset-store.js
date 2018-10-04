import { combineReducers, createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import { merge } from 'lodash';

const ACTION_TYPES = {
  RESET: 'RESET',
  INIT: 'INIT',
  ADD_MORE: 'ADD_MORE'
};

const AssetActions = {
  reset: () => {
    return { type: ACTION_TYPES.RESET, };
  },
  init: ({ asset }) => {
    return { type: ACTION_TYPES.INIT, asset };
  },
};

const initialState = {
  asset: null,
  bitmarkCanDownload: null,
};

const data = (state = initialState, action) => {
  switch (action.type) {
    case ACTION_TYPES.RESET:
      state = initialState;
      return merge({}, state);
    case ACTION_TYPES.INIT:
      state.bitmarkCanDownload = (action.asset.bitmarks || []).find(bitmark => bitmark.status === 'confirm');
      state.asset = action.asset;
      return merge({}, state);
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
