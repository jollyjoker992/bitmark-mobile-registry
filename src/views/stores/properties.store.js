import { combineReducers, createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import { merge } from 'lodash';
import { sortAssetsBitmarks } from 'src/utils';

const ACTION_TYPES = {
  RESET: 'RESET',
  UPDATE: 'UPDATE',
  UPDATE_BITMARKS: 'UPDATE_BITMARKS',
  UPDATE_LOADING_STATUS: 'UPDATE_LOADING_STATUS',
  VIEW_MORE: 'VIEW_MORE',
  UPDATE_RELEASE_ASSET: 'UPDATE_RELEASE_ASSET',
  VIEW_MORE_RELEASED_ASSETS: 'VIEW_MORE_RELEASED_ASSETS',
};

const PropertiesActions = {
  reset: () => {
    return { type: ACTION_TYPES.RESET, };
  },
  update: (data) => {
    return { type: ACTION_TYPES.UPDATE, data };
  },
  updateBitmarks: ({ bitmarks, assets }) => {
    return { type: ACTION_TYPES.UPDATE_BITMARKS, data: { bitmarks, assets } };
  },
  updateLoadingStatus: ({ appLoadingData }) => {
    return { type: ACTION_TYPES.UPDATE_LOADING_STATUS, data: { appLoadingData } };
  },
  viewMoreBitmarks: () => {
    return { type: ACTION_TYPES.VIEW_MORE };
  },

  updateReleasedAssets: ({ releasedBitmarks, releasedAssets }) => {
    return { type: ACTION_TYPES.UPDATE_RELEASE_ASSET, data: { releasedBitmarks, releasedAssets } };
  },
  viewMoreReleasedAssets: () => {
    return { type: ACTION_TYPES.VIEW_MORE_RELEASED_ASSETS };
  },
};

const initialState = {
  assets: {},
  bitmarks: [],
  displayedBitmarks: [],

  releasedAssets: [],
  displayedReleasedAssets: [],
  releasedBitmarks: [],

  appLoadingData: false,
};

const updateDisplayedBitmarks = (state) => {
  let bitmarks = sortAssetsBitmarks(state.bitmarks);
  let totalDisplayedBitmark = state.displayedBitmarks.length
  if (totalDisplayedBitmark < 20) {
    totalDisplayedBitmark = Math.min(bitmarks.length, 20);
  }
  let displayedBitmarks = [];
  for (let index = 0; index < totalDisplayedBitmark; index++) {
    displayedBitmarks.push(bitmarks[index]);
  }
  return {
    bitmarks,
    displayedBitmarks,
  };
};

const viewMoreDisplayedBitmarks = (state) => {
  let totalDisplayedBitmark = state.displayedBitmarks.length + 20;
  totalDisplayedBitmark = totalDisplayedBitmark > state.bitmarks.length ? state.bitmarks.length : totalDisplayedBitmark;
  let displayedBitmarks = [];
  for (let index = 0; index < totalDisplayedBitmark; index++) {
    displayedBitmarks.push(state.bitmarks[index]);
  }
  return {
    displayedBitmarks,
  };
};

const updateDisplayedReleasedAssets = (state) => {
  let releasedAssets = sortAssetsBitmarks(state.releasedAssets);
  let totalDisplayedReleasedAssets = state.displayedReleasedAssets.length + 20;
  totalDisplayedReleasedAssets = totalDisplayedReleasedAssets > releasedAssets.length ? releasedAssets.length : totalDisplayedReleasedAssets;
  let displayedReleasedAssets = [];
  for (let index = 0; index < totalDisplayedReleasedAssets; index++) {
    displayedReleasedAssets.push(releasedAssets[index]);
  }
  return {
    releasedAssets,
    displayedReleasedAssets,
  };
};

const updateReleasedAssets = (state, releasedAssets) => {
  let currentAssets = state.releasedAssets;
  for (let asset of releasedAssets) {
    let currentIndex = currentAssets.findIndex(a => a.id === asset.id);
    if (currentIndex >= 0) {
      currentAssets[currentIndex] === asset;
    } else {
      currentAssets.push(asset);
    }
  }
  return updateDisplayedReleasedAssets(merge({}, state, { releasedAssets: currentAssets }));
};

const viewMoreDisplayedReleasedAssets = (state) => {
  let totalDisplayedReleasedAssets = state.displayedReleasedAssets.length + 20;
  totalDisplayedReleasedAssets = totalDisplayedReleasedAssets > state.releasedAssets.length ? state.releasedAssets.length : totalDisplayedReleasedAssets;
  let displayedReleasedAssets = [];
  for (let index = 0; index < totalDisplayedReleasedAssets; index++) {
    displayedReleasedAssets.push(state.releasedAssets[index]);
  }
  return {
    displayedReleasedAssets,
  };
};

const data = (state = initialState, action) => {
  switch (action.type) {
    case ACTION_TYPES.RESET:
      return merge({}, initialState);
    case ACTION_TYPES.UPDATE: {
      let tempState = merge({}, state, action.data);
      return tempState;
    }
    case ACTION_TYPES.UPDATE_LOADING_STATUS: {
      let tempState = merge({}, state, action.data);
      return tempState;
    }
    case ACTION_TYPES.UPDATE_BITMARKS: {
      let tempState = merge({}, state);
      tempState.bitmarks = action.data.bitmarks;
      let result = updateDisplayedBitmarks(merge({}, tempState));
      tempState.bitmarks = result.bitmarks;
      tempState.displayedBitmarks = result.displayedBitmarks;
      tempState.assets = action.data.assets;
      return tempState;
    }
    case ACTION_TYPES.VIEW_MORE: {
      let tempState = merge({}, state, viewMoreDisplayedBitmarks(state));
      return tempState;
    }

    case ACTION_TYPES.UPDATE_RELEASE_ASSET: {
      let tempState = merge({}, state, updateReleasedAssets(state, action.data.releasedAssets));
      tempState.releasedBitmarks = action.data.releasedBitmarks;
      return tempState;
    }
    case ACTION_TYPES.VIEW_MORE_RELEASED_ASSETS: {
      let tempState = merge({}, state, viewMoreDisplayedReleasedAssets(state));
      return tempState;
    }
    default:
      return state;
  }
};
const reducer = combineReducers({ data });

const PropertiesStore = createStore(reducer, applyMiddleware(thunk));

export {
  PropertiesActions,
  PropertiesStore
};
