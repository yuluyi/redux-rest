import fetch from 'isomorphic-fetch';

export const itemStatus = {
    pending: 'pending',
    saved: 'saved',
    failed: 'failed',
    initial: 'initial'
};


export class ActionTypes {
  constructor(endpointName) {
    this.endpointName = endpointName;
    ['list', 'retrieve', 'create', 'update', 'delete'].forEach(action => {
      this[`${action}`] = this.getConstant(action);
      ['success', 'failure'].forEach(result => {
        this[`${action}_${result}`] = this.getConstant(action, result);
      });
    });
  }

  getConstant(action, result) {
    let constant = `${this.endpointName}_${action}`;
    if (result) {
      constant = `${constant}_${result}`;
    }
    return constant;
  }
}

export class ActionCreators {
  constructor(endpointName, API, actionTypes) {
    this.actionTypes = actionTypes;
    this._pendingID = 0;
    ['list', 'retrieve', 'create', 'update', 'delete'].forEach(action => {
      this[action] = this._createAction.bind(this, action, API);
    });
  }

  // apiRequest is a function which accepts params and return an endpint
  // params are used to generate endpint
  // payload is param for endpoint methods(BREAD), should be null by default
  _createAction(action, apiRequest, payload) {
    return dispatch => {
      let pendingID = this._getPendingID();
      let call = apiRequest[action](payload)
          .then(({err, res}) => {
            if (err) {
              return dispatch(this._failure(action, 'error', pendingID));
            } else {
              return dispatch(this._success(action, res, pendingID));
            }
          });
      dispatch(this._pending(action, payload, pendingID));
      return call;
    };
  }

  _success(...args) {
    return this._makeActionObject(...args, 'success');
  }

  _failure(...args) {
    return this._makeActionObject(...args, 'failure');
  }

  _pending(...args) {
    return this._makeActionObject(...args);
  }

  _makeActionObject(action, payload, pendingID, result) {
    let actionType = this.actionTypes.getConstant(action, result);
    return {
      type: actionType,
      payload: payload,
      pendingID: pendingID
    };
  }

  _getPendingID() {
    this._pendingID += 1;
    return this._pendingID;
  }
}


class BaseReducer {
  constructor(actionTypes) {
    this.actionTypes = actionTypes;
  }

  getReducer() {
    return this._reducer.bind(this);
  }

  _getItem(state, key, value) {
    return state.find(item => item[key] === value);
  }

  _replaceItem(state, key, value, newItem) {
    let index = state.findIndex(item => item[key] === value);
    let newState = [...state];
    newState.splice(index, 1, newItem);
    return newState;
  }

  _getIndex(state, key, value) {
    return state.findIndex(item => item[key] === value);
  }

  _deleteItem(state, key, value) {
    const index = this._getIndex(state, key, value);
    state.splice(index,1);
    if(i >= 0) return [...state];
  }
}

export class ItemReducer extends BaseReducer {

  _reducer(state = {'@status': itemStatus.initial}, action) {
    switch(action.type) {
      case this.actionTypes.create:
        return {...state, '@status': itemStatus.pending, '@pendingID': action.pendingID};
      case this.actionTypes.create_success:
        return {...action.payload, '@status': itemStatus.saved};
      case this.actionTypes.create_failure:
        return {...action.payload, '@status': itemStatus.failed};
      case this.actionTypes.update:
        return {...state, '@status': itemStatus.pending, '@pendingID': action.pendingID};
        // TODO shouldn't hardcode 'id' field
      case this.actionTypes.update_success:
        return {...action.payload, '@status': itemStatus.saved};
        // TODO shouldn't hardcode 'id' field
      case this.actionTypes.update_failure:
        return {...action.payload, '@status': itemStatus.failed};
        // TODO shouldn't hardcode 'id' field
      case this.actionTypes.delete:
        return {...state, '@status': itemStatus.pending, '@pendingID': action.pendingID};
      case this.actionTypes.delete_success:
        return {...action.payload, '@status': itemStatus.saved};
      case this.actionTypes.delete_failure:
        return {...action.payload, '@status': itemStatus.failed};
      case this.actionTypes.retrieve:
        return {...state, '@status': itemStatus.pending, '@pendingID': action.pendingID};
      case this.actionTypes.retrieve_success:
        return {...action.payload, '@status': itemStatus.saved};
      case this.actionTypes.retrieve_failure:
        return {...action.payload, '@status': itemStatus.failed};
      default:
        return state;
    }
  }
}

export class CollectionReducer extends BaseReducer {

  _reducer(state = {'@status': itemStatus.initial}, action) {
    switch (action.type) {
      case this.actionTypes.list:
        return {...state, '@status': itemStatus.pending, '@pendingID': action.pendingID};
      case this.actionTypes.list_success:
        return {...action.payload, '@status': itemStatus.saved};
      case this.actionTypes.list_failure:
        return {...action.payload, '@status': itemStatus.failed};
      default:
        return state;
    }
  }
}

export default class Flux {
  constructor(api) {
    self = this;
    this.API = {};
    this.actionTypes = {};
    this.actionCreators = {};
    this.reducers = {};
    Object.keys(api).forEach(endpointName => {
      self.API[endpointName] = api[endpointName];
      self.actionTypes[endpointName] = new ActionTypes(endpointName);
      self.actionCreators[endpointName] = (params) => new ActionCreators(endpointName, self.API[endpointName](params), self.actionTypes[endpointName]);
      self.reducers[`${endpointName}_item`] = new ItemReducer(self.actionTypes[endpointName]).getReducer();
      self.reducers[`${endpointName}_collection`] = new CollectionReducer(self.actionTypes[endpointName]).getReducer();
    })
  }
}
