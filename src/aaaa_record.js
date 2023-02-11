import ipaddr from "ipaddr.js";
import { Record } from "./record";

export class AAAARecord extends Record {
  constructor(recordInfo, parameters) {
    super(recordInfo, parameters);
    if (recordInfo.type != "AAAA") {
      throw new Error(`Not an AAAA record ${recordInfo}`);
    }
    this.id = recordInfo.id;
    this.type = "AAAA";
    this.name = recordInfo.name;
    this.content = recordInfo.content;
    this.proxiable = recordInfo.proxiable;
    this.proxied = recordInfo.proxied;
    this.ttl = recordInfo.ttl;
    this.locked = recordInfo.locked;
    this.zone_id = recordInfo.zone_id;
    this.zone_name = recordInfo.zone_name;
    this.created_on = recordInfo.created_on;
    this.modified_on = recordInfo.modified_on;
  }

  /**
   * Update the prefix size of the IPv6 address.
   * @param {str} newIP 
   * @param {number} prefix_size 
   */
  updateIP(newIP, prefix_size = 128) {
    const previousIPBinary = ipaddr.parse(this.content).toByteArray().map(byte => {
      return byte.toString(2).padStart(8, "0");
    }).join("");
    const newIPBinary = ipaddr.parse(newIP).toByteArray().map(byte => {
      return byte.toString(2).padStart(8, "0");
    }).join("");
    const newPrefix = newIPBinary.slice(0, prefix_size);
    const currentSuffix = previousIPBinary.slice(prefix_size);
    const newIPWithSuffixBinary = newPrefix + currentSuffix
    let newIPWithSuffix = newIPWithSuffixBinary.match(/.{16}/g).map(byte => {
      return parseInt(byte, 2).toString(16);
    }).join(":");
    newIPWithSuffix = ipaddr.parse(newIPWithSuffix).toString();
    if (this.content != newIPWithSuffix) {
      this.content = newIPWithSuffix;
      this.modified = true;
    }
  }

  getUpdate() {
    return {
      type: this.type,
      name: this.name,
      content: this.content,
      ttl: this.ttl,
      proxied: this.proxied
    };
  }
}
