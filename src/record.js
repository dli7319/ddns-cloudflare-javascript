export class Record {
  constructor(recordInfo, parameters) {
    this.modified = false;
    this.name = recordInfo.name;
    this.type = recordInfo.type;
    this.excluded = this.excludedInParameters(parameters);
  }

  getUpdate() {}

  excludedInParameters(parameters) {
    if (this.name == "") return true;
    if (parameters.EXCLUSIONS && parameters.EXCLUSIONS.includes(this.name))
      return true;
    if (parameters.INCLUSIONS && !parameters.INCLUSIONS.includes(this.name))
      return true;
    return false;
  }
}
