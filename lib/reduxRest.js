'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _isomorphicFetch = require('isomorphic-fetch');

var _isomorphicFetch2 = _interopRequireDefault(_isomorphicFetch);

var itemStatus = {
  pending: 'pending',
  saved: 'saved',
  failed: 'failed',
  initial: 'initial'
};

exports.itemStatus = itemStatus;

var ActionTypes = (function () {
  function ActionTypes(endpointName) {
    var _this = this;

    _classCallCheck(this, ActionTypes);

    this.endpointName = endpointName;
    ['list', 'retrieve', 'create', 'update', 'delete'].forEach(function (action) {
      _this['' + action] = _this.getConstant(action);
      ['success', 'failure'].forEach(function (result) {
        _this[action + '_' + result] = _this.getConstant(action, result);
      });
    });
  }

  _createClass(ActionTypes, [{
    key: 'getConstant',
    value: function getConstant(action, result) {
      var constant = this.endpointName + '_' + action;
      if (result) {
        constant = constant + '_' + result;
      }
      return constant;
    }
  }]);

  return ActionTypes;
})();

exports.ActionTypes = ActionTypes;

var ActionCreators = (function () {
  function ActionCreators(endpointName, API, actionTypes) {
    var _this2 = this;

    _classCallCheck(this, ActionCreators);

    this.actionTypes = actionTypes;
    this._pendingID = 0;
    ['list', 'retrieve', 'create', 'update', 'delete'].forEach(function (action) {
      _this2[action] = _this2._createAction.bind(_this2, action, API);
    });
  }

  // apiRequest is a function which accepts params and return an endpint
  // params are used to generate endpint
  // payload is param for endpoint methods(BREAD), should be null by default

  _createClass(ActionCreators, [{
    key: '_createAction',
    value: function _createAction(action, apiRequest, payload) {
      var _this3 = this;

      return function (dispatch) {
        var pendingID = _this3._getPendingID();
        var call = apiRequest[action](payload).then(function (_ref) {
          var err = _ref.err;
          var res = _ref.res;

          if (err) {
            return dispatch(_this3._failure(action, 'error', pendingID));
          } else {
            return dispatch(_this3._success(action, res, pendingID));
          }
        });
        dispatch(_this3._pending(action, payload, pendingID));
        return call;
      };
    }
  }, {
    key: '_success',
    value: function _success() {
      for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      return this._makeActionObject.apply(this, args.concat(['success']));
    }
  }, {
    key: '_failure',
    value: function _failure() {
      for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        args[_key2] = arguments[_key2];
      }

      return this._makeActionObject.apply(this, args.concat(['failure']));
    }
  }, {
    key: '_pending',
    value: function _pending() {
      return this._makeActionObject.apply(this, arguments);
    }
  }, {
    key: '_makeActionObject',
    value: function _makeActionObject(action, payload, pendingID, result) {
      var actionType = this.actionTypes.getConstant(action, result);
      return {
        type: actionType,
        payload: payload,
        pendingID: pendingID
      };
    }
  }, {
    key: '_getPendingID',
    value: function _getPendingID() {
      this._pendingID += 1;
      return this._pendingID;
    }
  }]);

  return ActionCreators;
})();

exports.ActionCreators = ActionCreators;

var BaseReducer = (function () {
  function BaseReducer(actionTypes) {
    _classCallCheck(this, BaseReducer);

    this.actionTypes = actionTypes;
  }

  _createClass(BaseReducer, [{
    key: 'getReducer',
    value: function getReducer() {
      return this._reducer.bind(this);
    }
  }, {
    key: '_getItem',
    value: function _getItem(state, key, value) {
      return state.find(function (item) {
        return item[key] === value;
      });
    }
  }, {
    key: '_replaceItem',
    value: function _replaceItem(state, key, value, newItem) {
      var index = state.findIndex(function (item) {
        return item[key] === value;
      });
      var newState = [].concat(_toConsumableArray(state));
      newState.splice(index, 1, newItem);
      return newState;
    }
  }, {
    key: '_getIndex',
    value: function _getIndex(state, key, value) {
      return state.findIndex(function (item) {
        return item[key] === value;
      });
    }
  }, {
    key: '_deleteItem',
    value: function _deleteItem(state, key, value) {
      var index = this._getIndex(state, key, value);
      state.splice(index, 1);
      if (i >= 0) return [].concat(_toConsumableArray(state));
    }
  }]);

  return BaseReducer;
})();

var ItemReducer = (function (_BaseReducer) {
  _inherits(ItemReducer, _BaseReducer);

  function ItemReducer() {
    _classCallCheck(this, ItemReducer);

    _get(Object.getPrototypeOf(ItemReducer.prototype), 'constructor', this).apply(this, arguments);
  }

  _createClass(ItemReducer, [{
    key: '_reducer',
    value: function _reducer(state, action) {
      if (state === undefined) state = { '@status': itemStatus.initial };

      switch (action.type) {
        case this.actionTypes.create:
          return _extends({}, state, { '@status': itemStatus.pending, '@pendingID': action.pendingID });
        case this.actionTypes.create_success:
          return _extends({}, action.payload, { '@status': itemStatus.saved });
        case this.actionTypes.create_failure:
          return _extends({}, action.payload, { '@status': itemStatus.failed });
        case this.actionTypes.update:
          return _extends({}, state, { '@status': itemStatus.pending, '@pendingID': action.pendingID });
        // TODO shouldn't hardcode 'id' field
        case this.actionTypes.update_success:
          return _extends({}, action.payload, { '@status': itemStatus.saved });
        // TODO shouldn't hardcode 'id' field
        case this.actionTypes.update_failure:
          return _extends({}, action.payload, { '@status': itemStatus.failed });
        // TODO shouldn't hardcode 'id' field
        case this.actionTypes['delete']:
          return _extends({}, state, { '@status': itemStatus.pending, '@pendingID': action.pendingID });
        case this.actionTypes.delete_success:
          return _extends({}, action.payload, { '@status': itemStatus.saved });
        case this.actionTypes.delete_failure:
          return _extends({}, action.payload, { '@status': itemStatus.failed });
        case this.actionTypes.retrieve:
          return _extends({}, state, { '@status': itemStatus.pending, '@pendingID': action.pendingID });
        case this.actionTypes.retrieve_success:
          return _extends({}, action.payload, { '@status': itemStatus.saved });
        case this.actionTypes.retrieve_failure:
          return _extends({}, action.payload, { '@status': itemStatus.failed });
        default:
          return state;
      }
    }
  }]);

  return ItemReducer;
})(BaseReducer);

exports.ItemReducer = ItemReducer;

var CollectionReducer = (function (_BaseReducer2) {
  _inherits(CollectionReducer, _BaseReducer2);

  function CollectionReducer() {
    _classCallCheck(this, CollectionReducer);

    _get(Object.getPrototypeOf(CollectionReducer.prototype), 'constructor', this).apply(this, arguments);
  }

  _createClass(CollectionReducer, [{
    key: '_reducer',
    value: function _reducer(state, action) {
      if (state === undefined) state = { '@status': itemStatus.initial };

      switch (action.type) {
        case this.actionTypes.list:
          return _extends({}, state, { '@status': itemStatus.pending, '@pendingID': action.pendingID });
        case this.actionTypes.list_success:
          return _extends({}, action.payload, { '@status': itemStatus.saved });
        case this.actionTypes.list_failure:
          return _extends({}, action.payload, { '@status': itemStatus.failed });
        default:
          return state;
      }
    }
  }]);

  return CollectionReducer;
})(BaseReducer);

exports.CollectionReducer = CollectionReducer;

var Flux = function Flux(api) {
  _classCallCheck(this, Flux);

  self = this;
  this.API = {};
  this.actionTypes = {};
  this.actionCreators = {};
  this.reducers = {};
  Object.keys(api).forEach(function (endpointName) {
    self.API[endpointName] = api[endpointName];
    self.actionTypes[endpointName] = new ActionTypes(endpointName);
    self.actionCreators[endpointName] = function (params) {
      return new ActionCreators(endpointName, self.API[endpointName](params), self.actionTypes[endpointName]);
    };
    self.reducers[endpointName + '_item'] = new ItemReducer(self.actionTypes[endpointName]).getReducer();
    self.reducers[endpointName + '_collection'] = new CollectionReducer(self.actionTypes[endpointName]).getReducer();
  });
};

exports['default'] = Flux;