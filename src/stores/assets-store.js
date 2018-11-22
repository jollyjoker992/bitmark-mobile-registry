import { combineReducers, createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import { merge } from 'lodash';

const ACTION_TYPES = {
  RESET: 'RESET',
  INIT: 'INIT',
  ADD_MORE: 'ADD_MORE'
};

const AssetsActions = {
  reset: () => {
    return { type: ACTION_TYPES.RESET, };
  },
  init: ({ totalAssets, totalBitmarks, assets, existNewAsset, totalTrackingBitmarks, existNewTracking, trackingBitmarks, appLoadingData }) => {
    return { type: ACTION_TYPES.INIT, totalAssets, totalBitmarks, assets, existNewAsset, totalTrackingBitmarks, existNewTracking, trackingBitmarks, appLoadingData };
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
  appLoadingData: false,
};

const data = (state = initialState, action) => {
  switch (action.type) {
    case ACTION_TYPES.RESET:
      return merge({}, initialState);
    case ACTION_TYPES.INIT: {
      let tempState = merge({}, state);
      tempState.totalAssets = action.totalAssets;
      tempState.totalBitmarks = action.totalBitmarks;
      tempState.assets = action.assets || tempState.assets;
      tempState.existNewAsset = action.existNewAsset;
      tempState.trackingBitmarks = action.trackingBitmarks || tempState.trackingBitmarks;
      tempState.totalTrackingBitmarks = action.totalTrackingBitmarks;
      tempState.existNewTracking = action.existNewTracking;
      tempState.appLoadingData = action.appLoadingData;
      return tempState;
    }
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