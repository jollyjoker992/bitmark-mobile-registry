import { combineReducers, createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';

const ACTION_TYPES = {
  RESET: 'RESET',
  INIT: 'INIT',
  ADD_MORE: 'ADD_MORE'
};

const AssetsActions = {
  reset: () => {
    return { type: ACTION_TYPES.RESET, };
  },
  init: ({ totalAssets, totalBitmarks, assets, existNewAsset, totalTrackingBitmarks, existNewTracking, trackingBitmarks }) => {
    return { type: ACTION_TYPES.INIT, totalAssets, totalBitmarks, assets, existNewAsset, totalTrackingBitmarks, existNewTracking, trackingBitmarks };
  },
  addMoreAssets: (assets) => {
    return { type: ACTION_TYPES.ADD_MORE, assets };
  },
};

const initialState = {
  totalAssets: 0,
  totalBitmarks: 0,
  assets: [],
  existNewAsset: false,
  totalTrackingBitmarks: 0,
  existNewTracking: false,
  trackingBitmarks: [],
};

const data = (state = initialState, action) => {
  switch (action.type) {
    case ACTION_TYPES.RESET:
      state = initialState;
      return state;
    case ACTION_TYPES.INIT:

      state.totalAssets = action.totalAssets;
      state.totalBitmarks = action.totalBitmarks;
      state.assets = action.assets || state.assets;
      state.existNewAsset = action.existNewAsset;

      state.trackingBitmarks = action.trackingBitmarks || state.trackingBitmarks;
      state.totalTrackingBitmarks = action.totalTrackingBitmarks;
      state.existNewTracking = action.existNewTracking;
      return state;
    case ACTION_TYPES.ADD_MORE:
      state.assets = state.assets.concat(action.assets || []);
      return state;
    default:
      return state;
  }
};
const reducer = combineReducers({ data });

const AssetsStore = createStore(reducer, applyMiddleware(thunk));

export {
  AssetsActions,
  AssetsStore
};
