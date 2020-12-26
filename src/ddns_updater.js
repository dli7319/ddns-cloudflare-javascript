import fs from "fs";
import fetch from "node-fetch";
import {CONSTANTS} from "./constants";
import {ARecord} from "./a_record";

export class DDNSUpdater {
  constructor() {
    this.parameters = {};
  }

  start() {
    const parametersPromise = this.readParameters();
    const currentIPPromise = this.getCurrentIP();
    Promise.all([parametersPromise, currentIPPromise])
      .then(values => {
        // Get Parameters from file and current IP from online
        this.parameters = values[0];
        this.currentIP = values[1].ip;
        console.log(`Retrieved Current IP: ${this.currentIP}`);
      })
      .then(this.listZones.bind(this))
      .then(this.getAllDDNSRecords.bind(this))
      .then(this.parseDDNSRecords.bind(this))
      .then(this.updateAllDDNSRecords.bind(this));
  }

  parseDDNSRecords(zones) {
    const parameters = this.parameters;
    // Collect DNS Records to Update
    const recordsArr = [];
    zones.forEach(records => {
      if (!records.success) {
        console.error("FAILED TO RETRIEVE RECORDS FOR", records);
      } else {
        records.result.forEach(record => {
          switch (record.type) {
            case "A":
              recordsArr.push(new ARecord(record, parameters));
              break;
            default:
          }
        });
      }
    });
    return recordsArr;
  }

  updateAllDDNSRecords(recordsArr) {
    // Update DNS Records
    recordsArr.forEach(record => {
      if (record.excluded) {
        console.log("Skipping:", record.name);
        return;
      }
      record.updateIP(this.currentIP);
      if (!record.modified) {
        console.log("Record Already Up To Date:", record.name);
        return;
      }
      this.updateRecord(record).then(response => {
        if (response.success) {
          console.log("Updated Record For:", response.result.name);
        } else {
          console.log(
            "Record Update Failed for",
            record,
            "with response",
            response
          );
        }
      });
    });
  }

  getAllDDNSRecords(zones) {
    // Get DNS records from Cloudflare API
    if (!zones.success) {
      console.error("Could not read zones");
      process.exit();
    }
    const promises = [];
    zones.result.forEach(zone => {
      promises.push(this.listDNSRecords(zone.id));
    });
    return Promise.all(promises);
  }

  readParameters() {
    return new Promise(resolve => {
      const filePath =
        process.argv.length >= 3 ? process.argv[2] : "parameters.json";
      fs.readFile(filePath, "utf8", (err, data) => {
        if (err) {
          console.error("Cannot read parameters.json", err);
          process.exit();
        }
        resolve(this.processParameters(JSON.parse(data)));
      });
    });
  }

  /**
   * processParameters - Adds default keys to parameters in-place.
   *
   * @param  {object} parameters Parsed parameters
   * @return {object}            Updated parameters.
   */
  processParameters(parameters) {
    parameters.RECORD_TYPES = new Set(parameters.RECORD_TYPES);
    return parameters;
  }

  getCurrentIP() {
    return new Promise(resolve => {
      fetch(CONSTANTS.webip_endpoint)
        .then(response => response.json())
        .then(data => {
          resolve(data);
        });
    });
  }

  listZones() {
    // Get Zones from parameters file.
    if (this.parameters.ZONES) {
      const zones = this.parameters.ZONES;
      return {
        result: Array.isArray(zones) ? zones : [zones],
        success: true
      };
    }
    console.log("Retrieving Current List of Zones from Cloudflare");
    return new Promise(resolve => {
      fetch(CONSTANTS.cloudflare_endpoint + "zones", {
        method: "GET",
        mode: "cors",
        headers: this.getHeaders()
      })
        .then(response => response.json())
        .then(data => resolve(data));
    });
  }

  async listDNSRecords(zoneId) {
    const dnsRecords = [];
    let currentPage = 1;
    let emptyResults = false;
    let success = true;
    while (!emptyResults && success) {
      let pageResults = await fetch(
        CONSTANTS.cloudflare_endpoint +
          "zones/" +
          zoneId +
          "/dns_records?page=" +
          currentPage +
          "&per_page=20",
        {
          method: "GET",
          mode: "cors",
          headers: this.getHeaders()
        }
      ).then(response => response.json());
      success = success && pageResults.success;
      dnsRecords.push(pageResults.result);
      emptyResults = (pageResults.result.length == 0);
      currentPage += 1;
    }
    return {
      success: success,
      result: dnsRecords.flat()
    };
  }

  updateRecord(record) {
    const update = record.getUpdate();
    return new Promise(resolve => {
      fetch(
        CONSTANTS.cloudflare_endpoint +
          "zones/" +
          record.zone_id +
          "/dns_records/" +
          record.id,
        {
          method: "PUT",
          mode: "cors",
          headers: this.getHeaders(),
          body: JSON.stringify(update)
        }
      )
        .then(response => response.json())
        .then(data => resolve(data));
    });
  }

  getHeaders(keys = null) {
    const parameters = this.parameters;
    const headers = {
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
}
