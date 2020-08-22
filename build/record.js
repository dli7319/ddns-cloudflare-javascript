"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Record = void 0;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var Record = /*#__PURE__*/function () {
  function Record(recordInfo, parameters) {
    _classCallCheck(this, Record);

    this.modified = false;
    this.name = recordInfo.name;
    this.type = recordInfo.type;
    this.excluded = this.excludedInParameters(parameters);
  }

  _createClass(Record, [{
    key: "getUpdate",
    value: function getUpdate() {}
  }, {
    key: "excludedInParameters",
    value: function excludedInParameters(parameters) {
      if (this.name == "") return true;
      if (parameters.EXCLUSIONS && parameters.EXCLUSIONS.includes(this.name)) return true;
      if (parameters.INCLUSIONS && !parameters.INCLUSIONS.includes(this.name)) return true;
      return false;
    }
  }]);

  return Record;
}();

exports.Record = Record;