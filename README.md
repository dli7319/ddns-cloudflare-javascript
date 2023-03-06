# ddns-cloudflare-javascript
Another DDNS Updater for Cloudflare written in Javascript.
This will update the IPs of A and AAAA records.

## Usage:
1. Clone or download the repo
2. Run `npm install` to install all necessary dependencies.
3. Fill in `parameters.yaml` with information from your Cloudflare Account. You can remove the zones array to scan for all zones.
  * Create a token with Zone.Zone and Zone.DNS edit permissions at https://dash.cloudflare.com/profile/api-tokens.
  * To use an API Key instead, replace `TOKEN` with `API_KEY` and `EMAIL`.
4. Run `npm start` to update records on Cloudflare.
5. Make a cron job to run this every so often with `crontab -e`.  
   Appending the following to update every 15 minutes:  
   `*/15 * * * * /full/path/to/ddns-cloudflare-javascript/update_records.sh`

## Configuration
See `parameters.example.yaml`.

### Local IP
To use a local IP, name the interface under `LOCAL_INTERFACE` or `LOCAL_INTERFACE_V6`.  
As an interface can have multiple IPs, you should add an IP index here.
```yaml
  LOCAL_INTERFACE:
    name: "eth0"
    ip_index: 0
```

### Allowlist
To create an allowlist of records, add an `EXCLUSIONS` to the parameters file. These A records will be ignored.
```yaml
  EXCLUSIONS:
    - "store.example.org"
```

### Denylist
To create a denylist of records, add an `INCLUSIONS` key to the parameters file. Other A records will be ignored.
```yaml
  INCLUSIONS:
    - "store.example.org"
```
