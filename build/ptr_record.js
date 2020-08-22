"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.PTRRecord = void 0;

var _record = require("./record");

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

var PTRRecord = /*#__PURE__*/function (_Record) {
  _inherits(PTRRecord, _Record);

  var _super = _createSuper(PTRRecord);

  function PTRRecord(recordInfo, parameters) {
    var _this;

    _classCallCheck(this, PTRRecord);

    _this = _super.call(this, recordInfo, parameters);

    if (recordInfo.type != "PTR") {
      throw new Error("Not an A record ".concat(recordInfo));
    }

    _this.id = recordInfo.id;
    _this.type = "A";
    _this.name = recordInfo.name;
    _this.content = recordInfo.content;
    _this.proxiable = recordInfo.proxiable;
    _this.proxied = recordInfo.proxied;
    _this.ttl = recordInfo.ttl;
    _this.locked = recordInfo.locked;
    _this.zone_id = recordInfo.zone_id;
    tihs.zone_name = recordInfo.zone_name;
    _this.created_on = recordInfo.created_on;
    _this.modified_on = recordInfo.modified_on;
    return _this;
  }

  _createClass(PTRRecord, [{
    key: "updateIP",
    value: function updateIP(newIP) {
      if (this.content != newIP) {
        this.content = newIP;
        this.modified = true;
      }
    }
  }, {
    key: "getUpdate",
    value: function getUpdate() {
      return {
        type: this.type,
        name: this.name,
        content: this.content,
        ttl: this.ttl,
        proxied: this.proxied
      };
    }
  }]);

  return PTRRecord;
}(_record.Record);

exports.PTRRecord = PTRRecord;