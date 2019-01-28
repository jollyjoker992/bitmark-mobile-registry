import { combineReducers, createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import { merge } from 'lodash';

const ACTION_TYPES = {
  RESET: 'RESET',
  INIT: 'INIT',
  ADD_MORE: 'ADD_MORE'
};

const PropertyMetadataActions = {
  reset: () => {
    return { type: ACTION_TYPES.RESET, };
  },
  init: ({ asset }) => {
    return { type: ACTION_TYPES.INIT, asset };
  },
};

const initialState = {
  asset: null,
};

const data = (state = initialState, action) => {
  switch (action.type) {
    case ACTION_TYPES.RESET:
      return merge({}, initialState);
    case ACTION_TYPES.INIT: {
      let tempState = merge({}, state);
      tempState.asset = action.asset;
      return tempState;
    }
    default:
      return state;
  }
};
const reducer = combineReducers({ data });

const PropertyMetadataStore = createStore(reducer, applyMiddleware(thunk));

export {
  PropertyMetadataActions,
  PropertyMetadataStore
};
