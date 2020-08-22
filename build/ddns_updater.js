"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.DDNSUpdater = void 0;

var _fs = _interopRequireDefault(require("fs"));

var _nodeFetch = _interopRequireDefault(require("node-fetch"));

var _constants = require("./constants");

var _a_record = require("./a_record");

var _ptr_record = require("./ptr_record");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var DDNSUpdater = /*#__PURE__*/function () {
  function DDNSUpdater() {
    _classCallCheck(this, DDNSUpdater);

    this.parameters = {};
  }

  _createClass(DDNSUpdater, [{
    key: "start",
    value: function start() {
      var _this = this;

      var parametersPromise = this.readParameters();
      var currentIPPromise = this.getCurrentIP();
      Promise.all([parametersPromise, currentIPPromise]).then(function (values) {
        // Get Parameters from file and current IP from online
        _this.parameters = values[0];
        _this.currentIP = values[1].ip;
        console.log("Retrieved Current IP: ".concat(_this.currentIP));
      }).then(this.listZones.bind(this)).then(this.getAllDDNSRecords.bind(this)).then(this.parseDDNSRecords.bind(this)).then(this.updateAllDDNSRecords.bind(this));
    }
  }, {
    key: "parseDDNSRecords",
    value: function parseDDNSRecords(zones) {
      var parameters = this.parameters; // Collect DNS Records to Update

      var recordsArr = [];
      zones.forEach(function (records) {
        if (!records.success) {
          console.error("FAILED TO RETRIEVE RECORDS FOR", records);
        } else {
          records.result.forEach(function (record) {
            switch (record.type) {
              case "A":
                recordsArr.push(new _a_record.ARecord(record, parameters));
                break;

              default:
            }
          });
        }
      });
      return recordsArr;
    }
  }, {
    key: "updateAllDDNSRecords",
    value: function updateAllDDNSRecords(recordsArr) {
      var _this2 = this;

      // Update DNS Records
      recordsArr.forEach(function (record) {
        if (record.excluded) {
          console.log("Skipping:", record.name);
          return;
        }

        record.updateIP(_this2.currentIP);

        if (!record.modified) {
          console.log("Record Already Up To Date:", record.name);
          return;
        }

        _this2.updateRecord(record).then(function (response) {
          if (response.success) {
            console.log("Updated Record For:", response.result.name);
          } else {
            console.log("Record Update Failed for", record, "with response", response);
          }
        });
      });
    }
  }, {
    key: "getAllDDNSRecords",
    value: function getAllDDNSRecords(zones) {
      var _this3 = this;

      // Get DNS records from Cloudflare API
      if (!zones.success) {
        console.error("Could not read zones");
        process.exit();
      }

      var promises = [];
      zones.result.forEach(function (zone) {
        promises.push(_this3.listDNSRecords(zone.id));
      });
      return Promise.all(promises);
    }
  }, {
    key: "readParameters",
    value: function readParameters() {
      var _this4 = this;

      return new Promise(function (resolve) {
        var filePath = process.argv.length >= 3 ? process.argv[2] : "parameters.json";

        _fs["default"].readFile(filePath, "utf8", function (err, data) {
          if (err) {
            console.error("Cannot read parameters.json", err);
            process.exit();
          }

          resolve(_this4.processParameters(JSON.parse(data)));
        });
      });
    }
    /**
     * processParameters - Adds default keys to parameters in-place.
     *
     * @param  {object} parameters Parsed parameters
     * @return {object}            Updated parameters.
     */

  }, {
    key: "processParameters",
    value: function processParameters(parameters) {
      parameters.RECORD_TYPES = new Set(parameters.RECORD_TYPES);
      return parameters;
    }
  }, {
    key: "getCurrentIP",
    value: function getCurrentIP() {
      return new Promise(function (resolve) {
        (0, _nodeFetch["default"])(_constants.CONSTANTS.webip_endpoint).then(function (response) {
          return response.json();
        }).then(function (data) {
          resolve(data);
        });
      });
    }
  }, {
    key: "listZones",
    value: function listZones() {
      var _this5 = this;

      // Get Zones from parameters file.
      if (this.parameters.ZONES) {
        var zones = this.parameters.ZONES;
        return {
          result: Array.isArray(zones) ? zones : [zones],
          success: true
        };
      }

      console.log("Retrieving Current List of Zones from Cloudflare");
      return new Promise(function (resolve) {
        (0, _nodeFetch["default"])(_constants.CONSTANTS.cloudflare_endpoint + "zones", {
          method: "GET",
          mode: "cors",
          headers: _this5.getHeaders()
        }).then(function (response) {
          return response.json();
        }).then(function (data) {
          return resolve(data);
        });
      });
    }
  }, {
    key: "listDNSRecords",
    value: function listDNSRecords(zoneId) {
      var _this6 = this;

      return new Promise(function (resolve) {
        (0, _nodeFetch["default"])(_constants.CONSTANTS.cloudflare_endpoint + "zones/" + zoneId + "/dns_records", {
          method: "GET",
          mode: "cors",
          headers: _this6.getHeaders()
        }).then(function (response) {
          return response.json();
        }).then(function (data) {
          return resolve(data);
        });
      });
    }
  }, {
    key: "updateRecord",
    value: function updateRecord(record) {
      var _this7 = this;

      var update = record.getUpdate();
      return new Promise(function (resolve) {
        (0, _nodeFetch["default"])(_constants.CONSTANTS.cloudflare_endpoint + "zones/" + record.zone_id + "/dns_records/" + record.id, {
          method: "PUT",
          mode: "cors",
          headers: _this7.getHeaders(),
          body: JSON.stringify(update)
        }).then(function (response) {
          return response.json();
        }).then(function (data) {
          return resolve(data);
        });
      });
    }
  }, {
    key: "getHeaders",
    value: function getHeaders() {
      var keys = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
      var parameters = this.parameters;
      var headers = {
        "Content-Type": "application/json"
      };

      if (parameters.TOKEN) {
        headers.Authorization = "Bearer " + parameters.TOKEN;
      } else if (parameters.API_KEY) {
        headers["X-Auth-Email"] = parameters.EMAIL;
        headers["X-Auth-Key"] = parameters.API_KEY;
      } else {
        console.error("No authentication provided in parameters.json");
        process.exit(1);
      }

      if (keys) {
        Object.assign(headers, keys);
      }

      return headers;
    }
  }]);

  return DDNSUpdater;
}();

exports.DDNSUpdater = DDNSUpdater;