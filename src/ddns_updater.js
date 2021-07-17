import path from "path";
import fs from "fs";
import * as fsPromises from "fs/promises";
import os from "os";

import fetch from "node-fetch";
import yaml from "js-yaml";
import {ArgumentParser} from "argparse";

import {CONSTANTS} from "./constants";
import {ARecord} from "./a_record";
import {version} from "../package.json";

export class DDNSUpdater {
  constructor() {
    this.parameters = {};
    this.setupArgParser();
  }

  async start() {
    this.parameters = await this.readParameters();
    this.currentIP = await this.getCurrentIP();
    console.log("Current IP: " + this.currentIP);
    await this.listZones()
      .then(this.getAllDDNSRecords.bind(this))
      .then(this.parseDDNSRecords.bind(this))
      .then(this.updateAllDDNSRecords.bind(this))
      .catch(error => {
        console.error(error);
        process.exit(1);
      });
  }

  setupArgParser() {
    const parser = new ArgumentParser({
      description: "A DDNS updater for Cloudflare DDNS."
    });
    parser.add_argument("-v", "--version", {action: "version", version});
    parser.add_argument("file", {
      help: "Parameters file",
      nargs: "?"
    });
    this.args = parser.parse_args();
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
      throw new Error("Could not read zones.");
    }
    const promises = [];
    zones.result.forEach(zone => {
      promises.push(this.listDNSRecords(zone.id));
    });
    return Promise.all(promises);
  }

  async readParameters() {
    const filePath = await this.findParametersFile(this.args.file);
    const fileData = await fsPromises.readFile(filePath, "utf8");
    const parsedData = yaml.load(fileData);
    return this.processParameters(parsedData);
  }

  async findParametersFile(filepath = "") {
    const potentialPaths = ["parameters.yaml", "parameters.json"];
    for (let i = 0; filepath === "" && i < potentialPaths.length; i++) {
      try {
        await fsPromises.access(potentialPaths[i], fs.constants.R_OK);
        filepath = potentialPaths[i];
      } catch {}
    }
    if (filepath === "") {
      throw new Error("Failed to find the parameters file.");
    }
    return filepath;
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

  async getCurrentIP() {
    if (this.parameters.LOCAL_INTERFACE) {
      return this.getLocalIP();
    }
    return this.getWebIP();
  }

  async getWebIP() {
    for (let index in CONSTANTS.webip_endpoints) {
      const endpoint = CONSTANTS.webip_endpoints[index];
      const response = await fetch(endpoint);
      if (response.status === 200) {
        return response.text();
      }
    }
    throw new Error("Could not get the current IP");
  }

  getLocalIP() {
    const local_interface_params = this.parameters.LOCAL_INTERFACE;
    const interfaces = os.networkInterfaces();
    if (!(local_interface_params.name in interfaces)) {
      throw new Error("Interface not found" + local_interface_params.name);
    }
    const selectedInterface = interfaces[local_interface_params.name];
    const selectedNet = selectedInterface[local_interface_params.ip_index];
    return selectedNet.address;
  }

  async listZones() {
    // Get Zones from parameters file.
    if (this.parameters.ZONES) {
      const zones = this.parameters.ZONES;
      return {
        result: Array.isArray(zones) ? zones : [zones],
        success: true
      };
    }
    console.log("Retrieving Current List of Zones from Cloudflare");
    return fetch(CONSTANTS.cloudflare_endpoint + "zones", {
      method: "GET",
      mode: "cors",
      headers: this.getHeaders()
    }).then(response => response.json());
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
      emptyResults = pageResults.result.length == 0;
      currentPage += 1;
    }
    return {
      success: success,
      result: dnsRecords.flat()
    };
  }

  updateRecord(record) {
    const update = record.getUpdate();
    return fetch(
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
    ).then(response => response.json());
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
      throw new Error("No authentication provided in parameters.json");
    }
    if (keys) {
      Object.assign(headers, keys);
    }
    return headers;
  }
}
