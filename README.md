# ddns-cloudflare-javascript
Another DDNS Updater for Cloudflare written in Javascript.
This will scan for all "A" records and update their IPs.

------------

## Usage:
* Clone or download the repo
* Run `npm install` to install all necessary dependencies.
* Copy `parameters.json.example` to `parameters.json`
* Fill in `parameters.json` with information from your Cloudflare Account. You can remove the zones array to scan for all zones.
 * To use a token, create a token with Zone.Zone and Zone.DNS edit permissions at https://dash.cloudflare.com/profile/api-tokens.
 * To use an API Key, you must fill in `API_KEY` and `EMAIL` in `parameters.json`.
   See `parameters.json.example2`.
* Run `node main.js` to update records on Cloudflare.
* Make a cron job to run this every so often with `crontab -e`
Appending the following to update every 15 minutes
`*/15 * * * * node /full/path/to/ddns-cloudflare-javascript/main.js /full/path/to/ddns-cloudflare-javascript/parameters.json >/dev/null 2>&1`

### Blacklist:
To create a blacklist of records, add an `EXCLUSIONS` to `parameters.json`:
```
{
  ...
  "EXCLUSIONS": [
    "store.example.org"
  ]
}
```

### Whitelist:
To create a whitelist of records, add an `INCLUSIONS` key to `parameters.json`:
```
{
  ...
  "INCLUSIONS": [
    "store.example.org"
  ]
}
```
