const fs = require("fs");
const fetch = require("node-fetch");

const CONSTANTS = {
  cloudflare_endpoint: "https://api.cloudflare.com/client/v4/",
  webip_endpoint: "https://api.ipify.org?format=json"
};

main();

function main() {
  let parametersPromise = readParameters();
  let currentIPPromise = getCurrentIP();
  let parameters, currentIP;
  Promise.all([parametersPromise, currentIPPromise])
    .then(values => {
      // Get Parameters from file and current IP from online
      parameters = values[0];
      currentIP = values[1].ip;
      console.log("Retrieved Current IP:", "--" + currentIP + "--");
      return;
    })
    .then(() => {
      // Get Zones from file or from Cloudflare API
      if (parameters.ZONES) {
        let zones = parameters.ZONES;
        if (!Array.isArray(zones)) {
          zones = [zones];
        }
        return {
          result: zones,
          success: true
        };
      }
      console.log("Retrieving Current List of Zones from Cloudflare");
      return listZones(parameters);
    })
    .then(zones => {
      // Get DNS records from Cloudflare API
      if (!zones.success) {
        console.error("Could not read zones");
        process.exit();
      }
      let promises = [];
      zones.result.forEach(zone => {
        promises.push(listDNSRecords(parameters, zone.id));
      });
      return Promise.all(promises);
    })
    .then(zones => {
      // Collect DNS Records to Update
      let recordsArr = [];
      zones.forEach(records => {
        if (!records.success) {
          console.error("FAILED TO RETRIEVE RECORDS FOR", records);
        } else {
          records.result.forEach(record => {
            if (record.type === "A") {
              if (
                (parameters.EXCLUSIONS &&
                  parameters.EXCLUSIONS.includes(record.name)) ||
                (parameters.INCLUSIONS &&
                  !parameters.INCLUSIONS.includes(record.name))
              ) {
                console.log("Skipping:", record.name);
              } else if (record.content === currentIP) {
                console.log("Record Already Up To Date:", record.name);
              } else {
                recordsArr.push(record);
              }
            }
          });
        }
      });
      return recordsArr;
    })
    .then(recordsArr => {
      // Update DNS Records
      recordsArr.forEach(record => {
        let update = {
          type: record.type,
          name: record.name,
          content: currentIP,
          ttl: record.ttl,
          proxied: record.proxied
        };
        updateRecord(parameters, record, update).then(response => {
          if (response.success) {
            console.log("Updated Record For:", response.result.name);
          } else {
            console.log(
              "Record Update Failed for",
              record,
              "with Error",
              response.name
            );
          }
        });
      });
    });
}

function readParameters() {
  return new Promise(resolve => {
    let filePath =
      process.argv.length >= 3 ? process.argv[2] : "parameters.json";
    fs.readFile(filePath, "utf8", (err, data) => {
      if (err) {
        console.error("Cannot read parameters.json", err);
        process.exit();
      }
      resolve(JSON.parse(data));
    });
  });
}

function getCurrentIP() {
  return new Promise(resolve => {
    fetch(CONSTANTS.webip_endpoint)
      .then(response => response.json())
      .then(data => {
        resolve(data);
      });
  });
}

function listZones(parameters) {
  return new Promise(resolve => {
    fetch(CONSTANTS.cloudflare_endpoint + "zones", {
      method: "GET",
      mode: "cors",
      headers: getHeaders(parameters)
    })
      .then(response => response.json())
      .then(data => {
        resolve(data);
      });
  });
}

function listDNSRecords(parameters, zoneId) {
  return new Promise(resolve => {
    fetch(CONSTANTS.cloudflare_endpoint + "zones/" + zoneId + "/dns_records", {
      method: "GET",
      mode: "cors",
      headers: getHeaders(parameters)
    })
      .then(response => response.json())
      .then(data => {
        resolve(data);
      });
  });
}

function updateRecord(parameters, record, update) {
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
        headers: getHeaders(parameters),
        body: JSON.stringify(update)
      }
    )
      .then(response => response.json())
      .then(data => {
        resolve(data);
      });
  });
}

function getHeaders(parameters, keys = null) {
  let headers = {
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
