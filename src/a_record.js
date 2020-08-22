import {Record} from "./record";

export class ARecord extends Record {
  constructor(recordInfo, parameters) {
    super(recordInfo, parameters);
    if (recordInfo.type != "A") {
      throw new Error(`Not an A record ${recordInfo}`);
    }
    this.id = recordInfo.id;
    this.type = "A";
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

  updateIP(newIP) {
    if (this.content != newIP) {
      this.content = newIP;
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
