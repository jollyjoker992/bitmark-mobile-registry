import { combineReducers, createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import { merge } from 'lodash';

const ACTION_TYPES = {
  RESET: 'RESET',
  UPDATE_BITMARKS: 'UPDATE_BITMARKS',
  UPDATE_LOADING_STATUS: 'UPDATE_LOADING_STATUS',
  VIEW_MORE: 'VIEW_MORE'
};

const PropertiesActions = {
  reset: () => {
    return { type: ACTION_TYPES.RESET, };
  },
  updateBitmarks: ({ bitmarks }) => {
    return { type: ACTION_TYPES.UPDATE_BITMARKS, data: { bitmarks } };
  },
  updateLoadingStatus: ({ appLoadingData }) => {
    return { type: ACTION_TYPES.UPDATE_LOADING_STATUS, data: { appLoadingData } };
  },
  viewMoreBitmarks: () => {
    return { type: ACTION_TYPES.VIEW_MORE };
  },
};

const initialState = {
  bitmarks: [],
  displayedBitmarks: [],
  appLoadingData: false,
};

const sortBitmarks = (bitmarks) => {
  bitmarks = bitmarks || [];
  bitmarks.sort((a, b) => {
    if (a.status === 'pending') {
      return -1;
    } else if (b.status === 'pending') {
      return 1;
    }
    return b.offset - a.offset;
  });
  return bitmarks;
};

const updateDisplayedBitmarks = (state) => {
  let bitmarks = sortBitmarks(state.bitmarks);
  let totalDisplayedBitmark = Math.min(bitmarks.length || 20);
  let displayedBitmarks = [];
  for (let index = 0; index < totalDisplayedBitmark; index++) {
    displayedBitmarks.push(bitmarks[index]);
  }
  return {
    bitmarks,
    displayedBitmarks,
  };
};

const updateBitmarks = (state, bitmarks) => {
  let currentBitmarks = state.bitmarks;
  bitmarks.forEach(bitmark => {
    let currentIndex = currentBitmarks.findIndex(bm => bm.id === bitmark.id);
    if (currentIndex) {
      currentBitmarks[currentIndex] === bitmark;
    } else {
      currentBitmarks.push(bitmark);
    }
  });
  return updateDisplayedBitmarks(merge({}, state, { bitmarks: currentBitmarks }));
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

const data = (state = initialState, action) => {
  switch (action.type) {
    case ACTION_TYPES.RESET:
      return merge({}, initialState);
    case ACTION_TYPES.UPDATE_LOADING_STATUS: {
      let tempState = merge({}, state, action.data);
      return tempState;
    }
    case ACTION_TYPES.UPDATE_BITMARKS: {
      let tempState = merge({}, state, updateBitmarks(state, action.data.bitmarks));
      return tempState;
    }
    case ACTION_TYPES.viewMoreBitmarks: {
      let tempState = merge({}, state, viewMoreDisplayedBitmarks(state));
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
