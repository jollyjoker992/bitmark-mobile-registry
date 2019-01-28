import { combineReducers, createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import { merge } from 'lodash';
import { sortAssetsBitmarks } from 'src/utils';

const ACTION_TYPES = {
  RESET: 'RESET',
  INIT: 'INIT',
  ADD_MORE: 'ADD_MORE'
};

const ReleasedPropertiesActions = {
  reset: () => {
    return { type: ACTION_TYPES.RESET, };
  },
  init: ({ releasedAsset, releasedBitmarks }) => {
    return { type: ACTION_TYPES.INIT, releasedAsset, releasedBitmarks };
  },
};

const initialState = {
  releasedAsset: null,
  releasedBitmarks: [],
};

const data = (state = initialState, action) => {
  switch (action.type) {
    case ACTION_TYPES.RESET:
      return merge({}, initialState);
    case ACTION_TYPES.INIT: {
      let tempState = merge({}, state);
      tempState.releasedAsset = action.releasedAsset;
      tempState.releasedBitmarks = sortAssetsBitmarks(action.releasedBitmarks || []);
      return tempState;
    }
    default:
      return state;
  }
};
const reducer = combineReducers({ data });

const ReleasedPropertiesStore = createStore(reducer, applyMiddleware(thunk));

export {
  ReleasedPropertiesActions,
  ReleasedPropertiesStore
};
