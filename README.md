# ddns-cloudflare-javascript
Another DDNS Updater for Cloudflare written in Javascript.
This will scan for all "A" records and update their IPs.

------------

## Usage:
1. Clone or download the repo
2. Run `npm install` to install all necessary dependencies.
3. Copy `parameters.json.example` to `parameters.json`
4. Fill in `parameters.json` with information from your Cloudflare Account. You can remove the zones array to scan for all zones.
 * To use a token, create a token with Zone.Zone and Zone.DNS edit permissions at https://dash.cloudflare.com/profile/api-tokens.
 * To use an API Key, you must fill in `API_KEY` and `EMAIL` in `parameters.json`.
   See `parameters.json.example2`.
5. Run `npm start` to update records on Cloudflare.
6. Make a cron job to run this every so often with `crontab -e`
Appending the following to update every 15 minutes
`*/15 * * * * cd /full/path/to/ddns-cloudflare-javascript/ && npm start >/dev/null 2>&1`

You can also install this with `npm i -g @david18284/ddns-cloudflare`.\
After installation, you can run it using `ddns-cloudflare`.

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
